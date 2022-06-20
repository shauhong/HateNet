import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModel, AutoTokenizer, RobertaConfig, AutoConfig
from . import label2class


class BERTweet(nn.Module):
    def __init__(self, num_classes, variant="vinai/bertweet-base", freeze=True, p=0.1, output_attentions=True, **kwargs):
        super().__init__()
        self.variant = variant
        self.output_attentions = output_attentions
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.variant, normalization=True)
        self.config = AutoConfig.from_pretrained(self.variant)
        self.roberta = AutoModel.from_pretrained(
            self.variant, output_attentions=output_attentions)
        self.fc1 = nn.Linear(
            in_features=self.config.hidden_size, out_features=64)  # 768
        self.fc2 = nn.Linear(in_features=64, out_features=num_classes)
        self.dropout = nn.Dropout(p=p)

        if freeze:
            for parameter in self.roberta.parameters():
                parameter.requires_grad = False

    def forward(self, x):
        outputs = self.roberta(**x)
        pooled_output = outputs[1]
        pooled_output = self.dropout(pooled_output)

        logits = F.relu(self.fc1(pooled_output))
        logits = self.dropout(logits)

        logits = self.fc2(logits)

        if self.output_attentions:
            attentions = outputs.attentions
            return logits, attentions

        return logits

    def collate_fn(self, batch):
        inputs = self.tokenizer(
            batch, padding=True, truncation=True, max_length=1000, return_tensors="pt")
        return inputs

    def inference(self, batch, device="cpu"):
        inputs = self.collate_fn(batch)
        inputs = inputs.to(device)
        if self.output_attentions:
            logits, _ = self.forward(inputs)
        else:
            logits = self.forward(inputs)
        labels = torch.argmax(logits, dim=-1)
        labels = labels.detach().cpu().tolist()
        classes = [label2class[label] for label in labels]

        return classes
