import torch
import numpy as np
from PIL import Image
from io import BytesIO
from HateNet.database.schema import Tweet


def detect_text(project, model, device="cpu", batch_size=8):
    tweets = Tweet.objects(projects=project, result="None", media__size=0)
    batch = list()
    with torch.no_grad():
        for i, tweet in enumerate(tweets):
            batch.append(tweet)
            if len(batch) == batch_size or i == (len(tweets) - 1):
                texts = [tweet.text for tweet in batch]
                results = model.inference(texts, device=device)
                for tweet, result in zip(batch, results):
                    tweet.result = result
                    tweet.save()
                batch.clear()


def detect_multimodal(project, model, device="cpu", batch_size=8):
    tweets = Tweet.objects(projects=project, result="None", media__not__size=0)
    batch = list()
    with torch.no_grad():
        for i, tweet in enumerate(tweets):
            batch.append(tweet)
            if len(batch) == batch_size or i == (len(tweets) - 1):
                images = [np.array(Image.open(BytesIO(tweet.media[0].image.read())).convert(
                    "RGB")) for tweet in batch]
                texts = [tweet.text for tweet in batch]
                inputs = list(zip(texts, images))
                results = model.inference(inputs, device=device)
                for tweet, result in zip(batch, results):
                    tweet.result = result
                    tweet.save()
                batch.clear()
