import os
import torch
import torchvision
from transformers import AutoTokenizer

from HateNet.utils.file import load_yaml

label2class = {
    0: "Non-Hateful",
    1: "Racist",
    2: "Sexist",
    3: "Homophobe",
    4: "Religion",
    5: "Other"
}


def init(app):
    from .VisualBERT import VisualBERT
    from .BERTweet import BERTweet
    from .FasterRCNN import FasterRCNN

    config = load_yaml(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "config.yaml"))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    transform = torchvision.transforms.ToTensor()

    bertweet = BERTweet(**config['BERTweet'])
    bertweet.load_state_dict(torch.load(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "BERTweet.pt")))
    bertweet.eval()
    bertweet.to(device)

    visualbert = VisualBERT(**config['VisualBERT'], transform=transform)
    visualbert.load_state_dict(torch.load(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "VisualBERT.pt")))
    visualbert.eval()
    visualbert.to(device)

    fasterrcnn = FasterRCNN()
    fasterrcnn.to(device)

    bertweet_tokenizer = AutoTokenizer.from_pretrained(
        config['BERTweet']['variant'])
    visualbert_tokenizer = AutoTokenizer.from_pretrained(
        config['VisualBERT']['bert'])

    app.device = device
    app.transform = transform
    app.models = {
        'BERTweet': bertweet,
        'VisualBERT': visualbert,
        'FasterRCNN': fasterrcnn,
    }
    app.tokenizer = {
        'BERTweet': bertweet_tokenizer,
        'VisualBERT': visualbert_tokenizer,
    }
