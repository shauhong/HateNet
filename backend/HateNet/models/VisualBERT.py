import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer, VisualBertConfig
from HateNet.models.FasterRCNN import FasterRCNN
from . import label2class


class VisualBERT(nn.Module):
    def __init__(self, num_classes=5, variant="uclanlp/visualbert-nlvr2-coco-pre", bert="bert-base-uncased", freeze=True, p=0.1, transform=None, output_attentions=True, **kwargs):
        super().__init__()
        self.variant = variant
        self.config = VisualBertConfig.from_pretrained(self.variant)
        self.visualbert = AutoModel.from_pretrained(
            self.variant, output_attentions=output_attentions)
        self.dropout = nn.Dropout(p=p)
        self.fc = nn.Linear(
            in_features=self.config.hidden_size, out_features=num_classes)
        self.faster_rcnn = FasterRCNN()
        self.tokenizer = AutoTokenizer.from_pretrained(
            bert, normalization=True)
        self.transform = transform
        self.output_attentions = output_attentions

        if freeze:
            for parameter in self.visualbert.parameters():
                parameter.requires_grad = False

    def forward(self, x):
        outputs = self.visualbert(**x)
        pooled_output = outputs[1]
        pooled_output = self.dropout(pooled_output)
        logits = self.fc(pooled_output)
        if self.output_attentions:
            attentions = outputs[-1]
            return logits, attentions
        return logits

    def collate_fn(self, batch):
        texts, images = list(), list()

        for text, image in batch:
            texts.append(text)
            images.append(self.transform(image))

        inputs = self.tokenizer(texts, padding=True,
                                truncation=True, return_tensors="pt")
        inputs.update({**self.faster_rcnn(images)})

        return inputs

    def inference(self, batch, device="cpu"):
        inputs = self.collate_fn(batch)
        inputs = inputs.to(device)
        if self.output_attentions:
            logits, attentions = self.forward(inputs)
        else:
            logits = self.forward(inputs)
        labels = torch.argmax(logits, dim=-1)
        labels = labels.detach().cpu().numpy()
        classes = [label2class[label] for label in labels]
        return classes
