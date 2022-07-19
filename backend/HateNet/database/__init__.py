import os
from flask_mongoengine import MongoEngine


def init(app):
    app.config['MONGODB_SETTINGS'] = {
        'host': f'mongodb+srv://{os.environ.get("MONGO_USERNAME")}:{os.environ.get("MONGO_PASSWORD")}@cluster0.hft3t.mongodb.net/{os.environ.get("MONGO_DATABASE")}.?retryWrites=true&w=majority'
    }
    app.db = MongoEngine(app)
