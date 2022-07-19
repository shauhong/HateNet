import os
import torch
import torchvision
from transformers import AutoTokenizer, ViltProcessor

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
    from .BERTweet import BERTweet
    from .ViLT import ViLT

    config = load_yaml(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "config.yaml"))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    transform = torchvision.transforms.ToTensor()

    bertweet = BERTweet(**config['BERTweet'])
    checkpoint = torch.load(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "BERTweet.pt"), map_location=device)
    bertweet.load_state_dict(checkpoint['model_state_dict'])
    bertweet.eval()
    bertweet.to(device)

    vilt = ViLT()
    checkpoint = torch.load(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "ViLT.pt"), map_location=device)
    vilt.load_state_dict(checkpoint['model_state_dict'])
    vilt.eval()
    vilt.to(device)

    bertweet_tokenizer = AutoTokenizer.from_pretrained(
        config['BERTweet']['variant'], normalization=True)
    vilt_tokenizer = ViltProcessor.from_pretrained(config['ViLT']['variant'])

    app.device = device
    app.transform = transform
    app.models = {
        'BERTweet': bertweet,
        'ViLT': vilt
    }
    app.tokenizers = {
        'BERTweet': bertweet_tokenizer,
        'ViLT': vilt_tokenizer
    }
