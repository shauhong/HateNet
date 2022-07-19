import requests
import torch
import numpy as np
from PIL import Image
from io import BytesIO
from HateNet.database.schema import Tweet, Project
from HateNet.models.utils import normalize


def detect_projects(models, device="cpu"):
    projects = Project.objects()
    for project in projects:
        tweets = Tweet.objects(projects=project, result="None", media__size=0)
        inference_text(models['BERTweet'], tweets)
        tweets = Tweet.objects(
            projects=project, result="None", media__not__size=0)
        inference_multimodal(models['ViLT'], tweets)


def inference_text(model, tweets, batch_size=8, device="cpu"):
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


def inference_multimodal(model, tweets, batch_size=8, device="cpu"):
    batch = list()
    with torch.no_grad():
        for i, tweet in enumerate(tweets):
            batch.append(tweet)
            if len(batch) == batch_size or i == (len(tweets) - 1):
                images = list()
                texts = list()
                valid = list()
                for tweet in batch:
                    response = requests.get(tweet.media[0].url, stream=True)
                    if not response.ok:
                        continue
                    image = Image.open(response.raw).convert("RGB")
                    valid.append(tweet)
                    images.append(image)
                    texts.append(normalize(tweet.text))
                    inputs = model.processor(
                        images, texts, return_tensors="pt", padding=True, truncation=True)
                    results = model.inference(inputs, device=device)
                    for tweet, result in zip(valid, results):
                        tweet.result = result
                        tweet.save()
                batch.clear()


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
