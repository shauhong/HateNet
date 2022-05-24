import json
import pickle
import yaml
from bson import json_util


def load_yaml(path):
    with open(path) as f:
        data = yaml.load(f, Loader=yaml.FullLoader)
        return data


def load_json(path):
    with open(path) as f:
        data = json.load(f)
        return data


def load_pickle(path):
    with open(path, 'rb') as f:
        data = pickle.load(f)
        return data


def parse_json(data):
    return json.loads(json_util.dumps(data))
