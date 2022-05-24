import torch
import re
from copy import deepcopy


def xy_to_cxcy(xy):
    return torch.cat([(xy[:2] + xy[2:]) / 2, xy[2:] - xy[:2]], dim=1)


def cxcy_to_xy(cxcy):
    return torch.cat([cxcy[:, :2] - (cxcy[:, 2:] / 2), cxcy[:, :2] + (cxcy[:, 2:] / 2)], dim=1)


def find_intersection(set_1, set_2):
    lower_bounds = torch.max(
        set_1[:, :2].unsqueeze(1), set_2[:, :2].unsqueeze(0))
    upper_bounds = torch.min(
        set_1[:, 2:].unsqueeze(1), set_2[:, 2:].unsqueeze(0))
    intersection_dims = torch.clamp(upper_bounds - lower_bounds, min=0)
    return intersection_dims[:, :, 0] * intersection_dims[:, :, 1]


def find_jaccard_overlap(set_1, set_2):
    intersection = find_intersection(set_1, set_2)
    areas_set_1 = (set_1[:, 2] - set_1[:, 0]) * (set_1[:, 3] - set_1[:, 1])
    areas_set_2 = (set_2[:, 2] - set_2[:, 0]) * (set_2[:, 3] - set_2[:, 1])
    union = areas_set_1.unsqueeze(1) + areas_set_2.unsqueeze(0) - intersection
    return intersection / union


def nms(boxes, scores, iou_threshold=0.5, return_map=False):
    order = torch.sort(scores, descending=True).indices
    keep = list()
    nms_map = dict()
    while order.numel() > 0:
        i = order[0].item()
        keep.append(i)
        box, candidates = boxes[i].unsqueeze(0), boxes[order[1:]]
        iou = find_jaccard_overlap(box, candidates)
        iou = iou[0]
        inds = torch.where(iou <= iou_threshold)[0]
        nms_map[i] = order[torch.where(iou > iou_threshold)[0] + 1].tolist()
        nms_map[i].append(i)
        order = order[inds + 1]
    if return_map:
        return keep, nms_map
    return keep


def get_cls_attention(text, model, tokenizer, return_tokens=False):
    inputs = tokenizer(text, truncation=True,
                       padding=True, return_tensors="pt")
    outputs = model(inputs)
    attentions = outputs[-1]
    attentions = attentions[-1]
    attentions = attentions.squeeze(0)
    attention = torch.mean(attentions, dim=0)
    attention = attention[0]
    tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
    segments = segment_tokens(tokens)
    attention = torch.tensor([torch.sum(attention[segment])
                             for segment in segments]).tolist()
    tokens = combine_segmented_tokens(tokens, segments)
    if return_tokens:
        return attention, tokens
    return attention


def get_multimodal_cls_attention(text, image, model, tokenizer, object_detection, transform, return_tokens=False, return_boxes=False, iou_threshold=0.2):
    inputs = tokenizer(text, truncation=True,
                       padding=True, return_tensors="pt")
    visual_embeds, detections = object_detection([transform(image)])
    inputs.update({**visual_embeds})
    outputs = model(inputs)
    attentions = outputs[-1]
    attentions = attentions[-1]
    attentions = attentions.squeeze(0)
    attention = torch.mean(attentions, dim=0)
    attention = attention[0]
    tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
    segments = segment_tokens_bert(tokens)

    boxes = detections[0]['boxes']
    boxes = cxcy_to_xy(boxes)
    scores = detections[0]['scores']
    keep, nms_map = nms(
        boxes, scores, iou_threshold=iou_threshold, return_map=True)
    boxes = boxes[keep].tolist()

    text_attention = torch.tensor(
        [torch.sum(attention[:len(tokens)][segment]) for segment in segments])
    image_attention = torch.tensor(
        [torch.sum(attention[len(tokens):][nms_map[ind]]) for ind in nms_map])
    attention = torch.cat([text_attention, image_attention]).tolist()

    tokens = combine_segmented_tokens(tokens, segments)

    if return_tokens and return_boxes:
        return attention, tokens, boxes
    if return_tokens:
        return attention, tokens
    if return_boxes:
        return attention, boxes
    return attention


def segment_tokens(tokens, pattern="@@"):
    tokens = deepcopy(tokens)
    segments = list()
    i = 0
    while len(tokens) > 0:
        token = tokens.pop(0)
        if token.endswith(pattern):
            segment = list()
            segment.append(i)
            while True:
                i += 1
                token = tokens.pop(0)
                segment.append(i)
                if not token.endswith(pattern):
                    break
            segments.append(segment)
        else:
            segments.append([i])
        i += 1
    return segments


def segment_tokens_bert(tokens, pattern="##"):
    tokens = deepcopy(tokens)
    segments = list()
    i = len(tokens) - 1
    while len(tokens) > 0:
        token = tokens.pop()
        if token.startswith(pattern):
            segment = list()
            segment.append(i)
            while True:
                i -= 1
                token = tokens.pop()
                segment.append(i)
                if not token.startswith(pattern):
                    break
            segments.append(sorted(segment))
        else:
            segments.append([i])
        i -= 1
    segments = sorted(segments, key=lambda x: x[0])
    return segments


def combine_segmented_tokens(tokens, segments):
    segmented_tokens = list()
    for segment in segments:
        segmented_token = ""
        for location in segment:
            segmented_token += tokens[location]
        segmented_token = re.sub("@@|##", "", segmented_token)
        segmented_tokens.append(segmented_token)
    return segmented_tokens
