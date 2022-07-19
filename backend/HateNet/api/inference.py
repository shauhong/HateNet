import base64
from io import BytesIO
from flask import Blueprint, abort, current_app, jsonify, request
import numpy as np
import requests
from PIL import Image
import torch
from io import BytesIO

from HateNet.models.utils import get_cls_attention, attention_rollout_multimodal, overlay, get_shifted_positions, attention_rollout_unimodal, normalize

bp = Blueprint("inference", __name__, url_prefix="/inference")


@bp.route("/text", methods=["POST"])
def detect_text():
    content = request.json
    text = content.get("text", "")
    inputs = [text]
    label = current_app.models['BERTweet'].inference(
        inputs, device=current_app.device)[0]
    return {"label": label}


@bp.route("/text/explain", methods=["POST"])
def explain_detection_text():
    content = request.json
    text = content.get("text", "")
    inputs = current_app.tokenizers["BERTweet"](text, return_tensors="pt")
    tokens = current_app.tokenizers["BERTweet"].convert_ids_to_tokens(
        inputs.input_ids[0])
    with torch.no_grad():
        _, attentions = current_app.models['BERTweet'](inputs)
    attentions = attention_rollout_unimodal(
        attentions, tokens, return_tokens=True)
    return jsonify(attentions=attentions), 200


@bp.route("/image", methods=["POST"])
def detect_image():
    text = request.files.get("text")
    image = request.files.get("image")
    if text and image:
        image = np.array(Image.open(image))
        text = str(text)
        text = [text]
        image = [image]
        inputs = list(zip(text, image))
        label = current_app.models['VisualBERT'].inference(
            inputs, device=current_app.device)[0]
        return {"label": label}
    else:
        abort(400, description="Text or image is missing")


@bp.route("/multimodal", methods=["POST"])
def detect_multimodal():
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    try:
        text = str(content.get('text'))
        text = normalize(text)
        image = content.get('image')
        response = requests.get(image, stream=True)
        if not response.ok:
            raise Exception("Invalid image url")
        image = Image.open(response.raw).convert("RGB")
        inputs = current_app.models['ViLT'].processor(
            image, text, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            label = current_app.models["ViLT"].inference(inputs)[0]
        return jsonify(label=label), 200
    except Exception as e:
        abort(400, description=str(e))


@bp.route("/multimodal/explain", methods=["POST"])
def explain_detection_multimodal():
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    try:
        text = str(content.get('text'))
        text = normalize(text)
        image = content.get('image')
        response = requests.get(image, stream=True)
        if not response.ok:
            raise Exception("Invalid image url")
        image = Image.open(response.raw).convert("RGB")
        inputs = current_app.models["ViLT"].processor(
            image, text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            _, attentions, patch_index = current_app.models["ViLT"](inputs)
        shifted = get_shifted_positions(patch_index)
        patch_size = patch_index[1]
        tokens = current_app.models["ViLT"].processor.tokenizer.convert_ids_to_tokens(
            inputs.input_ids[0])
        attentions, mask = attention_rollout_multimodal(
            attentions, image, shifted, patch_size, tokens, mode="mean")
        mask = overlay(np.array(image), mask)
        buffer = BytesIO()
        Image.fromarray(mask).save(buffer, format="JPEG")
        buffer.seek(0)
        mask = base64.b64encode(buffer.read()).decode("utf-8")
        return jsonify(attentions=attentions, mask=mask), 200
    except Exception as e:
        abort(400, description=str(e))
