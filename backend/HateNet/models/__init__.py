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
    # from .VisualBERT import VisualBERT
    from .BERTweet import BERTweet
    from .FasterRCNN import FasterRCNN
    from .ViLT import ViLT

    config = load_yaml(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "config.yaml"))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    transform = torchvision.transforms.ToTensor()

    bertweet = BERTweet(**config['BERTweet'])
    checkpoint = torch.load(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "BERTweet.pt"), map_location=device)
    bertweet.load_state_dict(checkpoint['model_state_dict'])
    # bertweet.load_state_dict(torch.load(os.path.join(
    #     os.path.dirname(os.path.dirname(__file__)), "assets", "BERTweet.pt")['model_state_dict'], map_location=device))
    bertweet.eval()
    bertweet.to(device)

    # visualbert = VisualBERT(**config['VisualBERT'], transform=transform)
    # visualbert.load_state_dict(torch.load(os.path.join(
    #     os.path.dirname(os.path.dirname(__file__)), "assets", "VisualBERT.pt"), map_location=device))
    # visualbert.eval()
    # visualbert.to(device)

    # fasterrcnn = FasterRCNN()
    # fasterrcnn.to(device)

    vilt = ViLT()
    checkpoint = torch.load(os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "assets", "ViLT.pt"), map_location=device)
    vilt.load_state_dict(checkpoint['model_state_dict'])
    vilt.eval()
    vilt.to(device)

    bertweet_tokenizer = AutoTokenizer.from_pretrained(
        config['BERTweet']['variant'])
    # visualbert_tokenizer = AutoTokenizer.from_pretrained(
    #     config['VisualBERT']['bert'])
    vilt_tokenizer = ViltProcessor.from_pretrained(config['ViLT']['variant'])

    app.device = device
    app.transform = transform
    app.models = {
        'BERTweet': bertweet,
        'ViLT': vilt
        # 'VisualBERT': visualbert,
        # 'FasterRCNN': fasterrcnn,
    }
    app.tokenizers = {
        'BERTweet': bertweet_tokenizer,
        'ViLT': vilt_tokenizer
        # 'VisualBERT': visualbert_tokenizer,
    }
