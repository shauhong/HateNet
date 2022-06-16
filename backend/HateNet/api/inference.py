import base64
from io import BytesIO
import cv2
from flask import Blueprint, abort, current_app, jsonify, request
import numpy as np
import requests
from PIL import Image
import torch
from io import BytesIO

from HateNet.models.utils import get_cls_attention, get_multimodal_cls_attention, attention_rollout_multimodal, overlay, get_shifted_positions

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
    attention, tokens = get_cls_attention(
        text, model=current_app.models['BERTweet'], tokenizer=current_app.tokenizers['BERTweet'], return_tokens=True)
    return jsonify(attention=attention, tokens=tokens)


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
        image = content.get('image')
        response = requests.get(image, stream=True)
        if not response.ok:
            raise Exception("Invalid image url")
        image = Image.open(response.raw)
        inputs = current_app.tokenizers['ViLT'](
            image, text, return_tensors="pt")
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
        image = content.get('image')
        response = requests.get(image, stream=True)
        if not response.ok:
            raise Exception("Invalid image url")
        image = Image.open(response.raw)
        # inputs = current_app.tokenizers['ViLT'](image, text, return_tensors="pt")
        inputs = current_app.models["ViLT"].processor(
            image, text, return_tensors="pt")
        with torch.no_grad():
            _, attentions, patch_index = current_app.models["ViLT"](inputs)
        # resized = inputs.pixel_values[0].permute([1, 2, 0])
        shifted = get_shifted_positions(patch_index)
        patch_size = patch_index[1]
        tokens = current_app.models["ViLT"].processor.tokenizer.convert_ids_to_tokens(
            inputs.input_ids[0])
        attention, mask = attention_rollout_multimodal(
            attentions, image, shifted, patch_size, tokens, mode="mean")
        attention = attention.tolist()
        # mask = mask.tolist()
        # mask = overlay(np.array(image), mask)
        mask = (mask * 255).astype('uint8')
        mask = cv2.applyColorMap(mask, cv2.COLORMAP_JET)
        buffer = BytesIO()
        Image.fromarray(mask).save(buffer, format="JPEG")
        buffer.seek(0)
        mask = base64.b64encode(buffer.read()).decode("utf-8")
        return jsonify(attention=attention, mask=mask), 200

        # tokens = processor.tokenizer.convert_ids_to_tokens(encoding.input_ids[0])

        # attention, mask = attention_rollout_multimodal(attentions, image, )
        # label = current_app.models["ViLT"].inference(image, text)[0]
        # return jsonify(label=label), 200
    except Exception as e:
        abort(400, description=str(e))

# @bp.route("/multimodal/explain", methods=["POST"])
# def explain_detection_multimodal():
#     content = request.json
#     if not content:
#         abort(400, description="Request body is empty")
#     try:
#         text = content.get('text')
#         image = content.get('image')
#         response = requests.get(image)
#         if not response.ok:
#             raise Exception("Invalid image url")
#         image = np.array(Image.open(BytesIO(response.content)))
#         text = str(text)
#         attention, tokens, boxes = get_multimodal_cls_attention(
#             text, image, current_app.models['VisualBERT'], current_app.tokenizers['VisualBERT'], current_app.models['FasterRCNN'], current_app.transform, return_tokens=True, return_boxes=True)
#         return jsonify(attention=attention, tokens=tokens, boxes=boxes)
#     except Exception as e:
#         abort(400, description=str(e))


# @bp.route("/multimodal", methods=['POST'])
# def detect_multimodal():
#     content = request.json
#     if not content:
#         abort(400, description="Request body is empty")
#     try:
#         text = content.get('text')
#         image = content.get('image')
#         response = requests.get(image)
#         if not response.ok:
#             raise Exception("Invalid image url")
#         image = np.array(Image.open(BytesIO(response.content)))
#         text = str(text)
#         text = [text]
#         image = [image]
#         inputs = list(zip(text, image))
#         label = current_app.models["VisualBERT"].inference(
#             inputs, device=current_app.device)[0]
#         return jsonify(label=label), 200
#     except Exception as e:
#         abort(400, description=str(e))


# @bp.route("/multimodal/explain", methods=["POST"])
# def explain_detection_multimodal():
#     content = request.json
#     if not content:
#         abort(400, description="Request body is empty")
#     try:
#         text = content.get('text')
#         image = content.get('image')
#         response = requests.get(image)
#         if not response.ok:
#             raise Exception("Invalid image url")
#         image = np.array(Image.open(BytesIO(response.content)))
#         text = str(text)
#         attention, tokens, boxes = get_multimodal_cls_attention(
#             text, image, current_app.models['VisualBERT'], current_app.tokenizers['VisualBERT'], current_app.models['FasterRCNN'], current_app.transform, return_tokens=True, return_boxes=True)
#         return jsonify(attention=attention, tokens=tokens, boxes=boxes)
#     except Exception as e:
#         abort(400, description=str(e))
