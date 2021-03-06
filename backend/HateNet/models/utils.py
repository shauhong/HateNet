import torch
import re
import numpy as np
import cv2
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
    attention = normalize_attention(attention[1:-1])
    tokens = combine_segmented_tokens(tokens, segments)[1:-1]
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
    text_attention = normalize_attention(text_attention[1:-1])
    image_attention = torch.tensor(
        [torch.sum(attention[len(tokens):][nms_map[ind]]) for ind in nms_map])
    attention = torch.cat([text_attention, image_attention]).tolist()

    tokens = combine_segmented_tokens(tokens, segments)[1:-1]

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


def normalize_attention(attention):
    denominator = sum(attention)
    attention = [numerator / denominator for numerator in attention]
    return attention


def cluster_tokens(tokens, pattern="@@"):
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


def cluster_tokens_bert(tokens, pattern="##"):
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


def combine_clusters(tokens, clusters):
    cluster_tokens = list()
    for cluster in clusters:
        cluster_token = tokens[cluster[0]:cluster[-1]+1]
        cluster_token = "".join(cluster_token)
        cluster_token = re.sub("@@|##", "", cluster_token)
        cluster_tokens.append(cluster_token)
    return cluster_tokens


def attention_unimodal(attentions, tokens, normalize=True, mask=True, return_tokens=True):
    attentions = attentions[-1]
    attentions = attentions.squeeze(0)
    attentions = torch.mean(attentions, dim=0)
    attentions = attentions[0, 1:-1]

    clusters = cluster_tokens(tokens)
    tokens = combine_clusters(tokens, clusters)

    v = torch.tensor([torch.sum(attentions[cluster]) for cluster in clusters])

    if mask:
        for index, token in enumerate(tokens):
            if token in ["RT", "@USER", "HTTPURL"]:
                attentions[index] = 0

    v = v[1:-1]

    if normalize:
        v = v / torch.sum(v)

    v = v.tolist()

    if return_tokens:
        return list(zip(tokens[1:-1], v))

    return v


def attention_rollout_unimodal(attentions, tokens, mode="mean", normalize=True, mask=True, return_tokens=True):
    attentions = torch.stack(attentions)  # 12, 1, 12, S, S
    attentions = torch.squeeze(attentions, dim=1)  # 12, 12, S, S
    if mode == 'mean':
        attentions = torch.mean(attentions, dim=1)  # 12, S, S
    elif mode == 'max':
        attentions = torch.max(attentions, dim=1)[0]  # 12, S, S
    elif mode == "min":
        attentions = torch.min(attentions, dim=1)[0]  # 12, S, S
    else:
        raise NotImplementedError(f"Mode {mode} not implemented")

    residual_attentions = torch.eye(attentions.shape[1])
    augmented_attentions = attentions + residual_attentions
    augmented_attentions = augmented_attentions / \
        torch.sum(augmented_attentions, dim=-1)[..., None]
    augmented_attentions = augmented_attentions.detach().numpy()

    joint_attentions = np.zeros(augmented_attentions.shape)
    joint_attentions[0] = augmented_attentions[0]

    for i in range(1, augmented_attentions.shape[0]):
        joint_attentions[i] = np.matmul(
            augmented_attentions[i], joint_attentions[i-1])

    v = joint_attentions[-1, 0]

    clusters = cluster_tokens(tokens)
    tokens = combine_clusters(tokens, clusters)

    v = np.array([np.sum(v[cluster]) for cluster in clusters]).tolist()

    if mask:
        for index, token in enumerate(tokens):
            if token in ['RT', "@USER", "HTTPURL"]:
                v[index] = 0

    v = v[1:-1]

    if normalize:
        v = v / np.sum(v)

    v = v.tolist()

    if return_tokens:
        return list(zip(tokens[1:-1], v))

    return v


def attention_rollout_multimodal(attentions, image, shifted, patch_size, tokens, mode="mean", normalize=True, return_tokens=True, mask=True):
    attentions = torch.stack(attentions)  # 12, 1, 12, S, S
    attentions = torch.squeeze(attentions, dim=1)  # 12, 12, S, S
    if mode == 'mean':
        attentions = torch.mean(attentions, dim=1)  # 12, S, S
    elif mode == 'max':
        attentions = torch.max(attentions, dim=1)[0]  # 12, S, S
    elif mode == "min":
        attentions = torch.min(attentions, dim=1)[0]  # 12, S, S
    else:
        raise NotImplementedError(f"Mode {mode} not implemented")

    residual_attentions = torch.eye(attentions.shape[1])
    augmented_attentions = attentions + residual_attentions
    augmented_attentions = augmented_attentions / \
        torch.sum(augmented_attentions, dim=-1)[..., None]
    augmented_attentions = augmented_attentions.detach().numpy().copy()

    joint_attentions = np.zeros(augmented_attentions.shape)
    joint_attentions[0] = augmented_attentions[0]

    for i in range(1, augmented_attentions.shape[0]):
        joint_attentions[i] = np.matmul(
            augmented_attentions[i], joint_attentions[i-1])

    v = joint_attentions[-1]

    heatmap = sort_shifted_attentions(
        v[0, -patch_size[0] * patch_size[1]:], shifted)

    if normalize:
        heatmap = heatmap / np.sum(heatmap)
    heatmap = heatmap / heatmap.max()
    heatmap = heatmap.reshape(patch_size[1], patch_size[0])
    heatmap = cv2.resize(heatmap, image.size)

    clusters = cluster_tokens_bert(tokens)
    tokens = combine_clusters(tokens, clusters)
    attention = np.zeros(len(clusters))

    for i, cluster in enumerate(clusters):
        attention[i] = np.sum(v[0, cluster])

    if mask:
        for index, token in enumerate(tokens):
            if token in ["rt", '@user', "httpurl", "@", "user"]:
                attention[index] = 0

    attention = attention[1:-1]

    if normalize:
        attention = attention / np.sum(attention)

    attention = attention.tolist()

    if return_tokens:
        return list(zip(tokens[1:-1], attention)), heatmap

    return attention, heatmap


def attention_multimodal(attentions, image, shifted, patch_size, tokens, mode="mean", normalize=True, mask=True):
    attentions = torch.stack(attentions)  # 12, 1, 12, S, S
    attentions = torch.squeeze(attentions, dim=1)  # 12, 12, S, S
    if mode == 'mean':
        attentions = torch.mean(attentions, dim=1)  # 12, S, S
    elif mode == 'max':
        attentions = torch.max(attentions, dim=1)[0]  # 12, S, S
    elif mode == "min":
        attentions = torch.min(attentions, dim=1)[0]  # 12, S, S
    else:
        raise NotImplementedError(f"Mode {mode} not implemented")
    attentions = attentions[-1]  # S, S
    v = attentions.detach().numpy().copy()

    heatmap = sort_shifted_attentions(
        v[0, -patch_size[0] * patch_size[1]:], shifted)

    if normalize:
        heatmap = heatmap / np.sum(heatmap)
    heatmap = heatmap / heatmap.max()
    heatmap = heatmap.reshape(patch_size[1], patch_size[0])
    heatmap = cv2.resize(heatmap, image.size)

    clusters = cluster_tokens_bert(tokens)
    attention = np.zeros(len(clusters))

    for i, cluster in enumerate(clusters):
        attention[i] = np.sum(v[0, cluster])

    if mask:
        for index, token in enumerate(tokens):
            if token in ['rt', '@user', 'httpurl', '@', 'user']:
                attention[index] = 0

    attention = attention[1:-1]

    if normalize:
        attention = attention / np.sum(attention)

    attention = attention.tolist()

    return attention, heatmap


def normalize(text):
    text = re.sub("@\S+", "@USER", text)
    text = re.sub("http\S+", "HTTPURL", text)
    return text


def overlay(image, mask, alpha=0.5):
    mask = np.uint8(255 * mask)
    mask = cv2.applyColorMap(mask, cv2.COLORMAP_JET)
    mask = cv2.cvtColor(mask, cv2.COLOR_BGR2RGB)
    mask = image + mask * alpha
    mask = mask / np.max(mask) * 255
    mask = np.uint8(mask)
    return mask


def get_shifted_positions(patch_index):
    shifted = list()
    patch_index, patch_size = patch_index[0], patch_index[1]
    patch_index = patch_index.squeeze(0).tolist()

    for i in range(patch_size[0]):
        for j in range(patch_size[1]):
            shifted.append(patch_index.index([i, j]))

    return shifted


def sort_shifted_attentions(attentions, shifted):
    sorted_attentions = np.zeros(attentions.shape)
    for i in range(len(shifted)):
        sorted_attentions[i] = attentions[shifted[i]]
    return sorted_attentions
