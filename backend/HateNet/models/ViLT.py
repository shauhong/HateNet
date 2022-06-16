import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModel, ViltProcessor
from . import label2class


class ViLT(nn.Module):
    def __init__(self, variant="dandelin/vilt-b32-finetuned-coco", num_classes=5, freeze=False, p=0.5, output_attentions=True, output_patch_index=True):
        super().__init__()
        self.variant = variant
        self.vilt = AutoModel.from_pretrained(
            variant, output_attentions=output_attentions)
        self.processor = ViltProcessor.from_pretrained(variant)
        self.fc1 = nn.Linear(
            in_features=self.vilt.config.hidden_size, out_features=64)
        self.fc2 = nn.Linear(in_features=64, out_features=num_classes)
        self.dropout = nn.Dropout(p=p)
        self.output_attentions = output_attentions
        # self.output_patch_index = output_patch_index

    def forward(self, x):
        outputs = self.vilt(**x)
        if type(outputs) == tuple:
            outputs, patch_index = outputs
        pooled_outputs = outputs.pooler_output
        pooled_outputs = self.dropout(pooled_outputs)

        logits = self.fc1(pooled_outputs)
        logits = F.gelu(logits)
        logits = self.dropout(logits)

        logits = self.fc2(logits)

        if self.output_attentions:
            attentions = outputs.attentions
            return logits, attentions, patch_index

        return logits

    def inference(self, inputs, device="cpu"):
        inputs = inputs.to(device)
        if self.output_attentions:
            logits, _ = self.forward(inputs)
        else:
            logits = self.forward(inputs)
        labels = torch.argmax(logits, dim=-1)
        labels = labels.detach().tolist()
        classes = [label2class[label] for label in labels]

        return classes

    # def inference(self, images, texts, device="cpu"):
    #     inputs = self.processor(
    #         images, texts, padding=True, truncation=True, return_tensors="pt")
    #     inputs = inputs.to(device)
    #     if self.output_attentions:
    #         logits, _ = self.forward(inputs)
    #     else:
    #         logits = self.forward(inputs)
    #     labels = torch.argmax(logits, dim=-1)
    #     labels = labels.detach().tolist()
    #     classes = [label2class[label] for label in labels]

    #     return classes
