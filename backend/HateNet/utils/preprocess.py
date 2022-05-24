import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize


def remove_pattern(text):
    pattern = '((@(\s+|\S+)))|(RT(\s+|\S+))|([^0-9A-Za-z\s+])|(http|https):\/\/\S+'
    replace = ''
    return " ".join(re.sub(pattern, replace, text).split())


def remove_stop_words(text, stopwords=stopwords.words("english")):
    return " ".join([word for word in text.split() if word not in stopwords])


def preprocess(document, stopwords=stopwords.words("english"), pattern='((@(\s+|\S+)))|(RT(\s+|\S+))|(rt(\s+|\S+))|([^A-Za-z\s+])|(http|https):\/\/\S+'):
    document = document.lower()
    tokens = word_tokenize(document)
    tokens = [token for token in tokens if token not in stopwords]
    tokens = list(filter(lambda token: re.match(
        pattern, token) is None, tokens))
    return tokens
