import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer, RobertaConfig
from . import label2class


class BERTweet(nn.Module):
    def __init__(self, num_classes=5, variant="vinai/bertweet-base", freeze=True, p=0.1, output_attentions=True, **kwargs):
        super().__init__()
        self.variant = variant
        self.config = RobertaConfig.from_pretrained(self.variant)
        self.roberta = AutoModel.from_pretrained(
            self.variant, output_attentions=output_attentions)
        self.fc = nn.Linear(
            in_features=self.config.hidden_size, out_features=num_classes)
        self.dropout = nn.Dropout(p=p)
        self.tokenizer = AutoTokenizer.from_pretrained(
            variant, normalization=True)
        self.output_attentions = output_attentions

        if freeze:
            for parameter in self.roberta.parameters():
                parameter.requires_grad = False

    def forward(self, x):
        outputs = self.roberta(**x)
        pooled_output = outputs[1]
        pooled_output = self.dropout(pooled_output)
        logits = self.fc(pooled_output)
        if self.output_attentions:
            attentions = outputs[-1]
            return logits, attentions
        return logits

    def collate_fn(self, batch):
        inputs = self.tokenizer(batch, padding=True,
                                truncation=True, return_tensors="pt")
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
