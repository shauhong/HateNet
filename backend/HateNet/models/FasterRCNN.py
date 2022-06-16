import torch
import torchvision
import torch.nn as nn
import torch.nn.functional as F
from torchvision.ops import boxes as box_ops


class FasterRCNN(nn.Module):
    def __init__(self, extract=False, output_detections=False, **kwargs):
        super().__init__()
        self.fasterrcnn = torchvision.models.detection.fasterrcnn_resnet50_fpn(
            pretrained=True)
        self.output_detections = output_detections
        self.eval()

    def forward(self, x):
        if self.training:
            raise NotImplementedError()
        else:
            return self.inference(x)

    def inference(self, images):
        images, _ = self.fasterrcnn.transform(images)
        features = self.fasterrcnn.backbone(images.tensors)
        proposals, proposal_losses = self.fasterrcnn.rpn(images, features)
        box_features = self.fasterrcnn.roi_heads.box_roi_pool(
            features, proposals, images.image_sizes)
        box_features = self.fasterrcnn.roi_heads.box_head(box_features)
        class_logits, box_regression = self.fasterrcnn.roi_heads.box_predictor(
            box_features)
        detections = self.postprocess_detections(
            class_logits, box_regression, proposals, images.image_sizes)
        visual_embeds = self.collate(proposals, box_features, detections)
        if self.output_detections:
            return visual_embeds, detections
        return visual_embeds

    def collate(self, proposals, box_features, detections):
        keep = [detection['keep'] for detection in detections]
        boxes_per_image = [proposal.shape[0] for proposal in proposals]
        box_features_list = box_features.split(boxes_per_image)

        visual_embeds = list()
        for i in range(len(keep)):
            visual_embeds.append(box_features_list[i][keep[i]])

        batch_size = len(visual_embeds)
        embed_dim = 1024
        max_length = max([visual_embed.shape[0]
                         for visual_embed in visual_embeds])
        padded_visual_embeds = torch.zeros(batch_size, max_length, embed_dim)
        padded_visual_attention_mask = torch.zeros(
            batch_size, max_length, dtype=torch.long)
        padded_visual_token_type_ids = torch.ones(
            batch_size, max_length, dtype=torch.long)

        for i in range(batch_size):
            length = visual_embeds[i].shape[0]
            padded_visual_embeds[i, :length] = visual_embeds[i]
            padded_visual_attention_mask[i, :length] = torch.ones(
                length, dtype=torch.long)

        return {
            "visual_embeds": padded_visual_embeds,
            "visual_attention_mask": padded_visual_attention_mask,
            "visual_token_type_ids": padded_visual_token_type_ids
        }

    def postprocess_detections(self, class_logits, box_regression, proposals, image_sizes):
        device = class_logits.device
        num_classes = class_logits.shape[-1]
        boxes_per_image = [boxes_in_image.shape[0]
                           for boxes_in_image in proposals]
        pred_boxes = self.fasterrcnn.roi_heads.box_coder.decode(
            box_regression, proposals)
        pred_scores = F.softmax(class_logits, -1)
        pred_boxes_list = pred_boxes.split(boxes_per_image, 0)
        pred_scores_list = pred_scores.split(boxes_per_image, 0)

        detections = list()

        for boxes, scores, image_size in zip(pred_boxes_list, pred_scores_list, image_sizes):
            boxes = box_ops.clip_boxes_to_image(boxes, image_size)
            labels = torch.arange(num_classes, device=device)
            labels = labels.view(1, -1).expand_as(scores)

            boxes = boxes[:, 1:]
            scores = scores[:, 1:]
            labels = labels[:, 1:]

            boxes = boxes.reshape(-1, 4)
            scores = scores.reshape(-1)
            labels = labels.reshape(-1)

            inds = torch.where(
                scores > self.fasterrcnn.roi_heads.score_thresh)[0]
            boxes, scores, labels = boxes[inds], scores[inds], labels[inds]

            keep = box_ops.remove_small_boxes(boxes, min_size=1e-2)
            boxes, scores, labels = boxes[keep], scores[keep], labels[keep]

            keep = box_ops.batched_nms(
                boxes, scores, labels, self.fasterrcnn.roi_heads.nms_thresh)
            keep = keep[:self.fasterrcnn.roi_heads.detections_per_img]
            boxes, scores, labels = boxes[keep], scores[keep], labels[keep]

            detections.append({
                "boxes": boxes,
                "scores": scores,
                "labels": labels,
                "keep": keep
            })

        return detections
