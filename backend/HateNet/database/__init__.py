import os
from flask_mongoengine import MongoEngine


def init(app):
    app.config['MONGODB_SETTINGS'] = {
        'host': f'mongodb+srv://{os.environ.get("USERNAME")}:{os.environ.get("PASSWORD")}@cluster0.hft3t.mongodb.net/{os.environ.get("DATABASE")}.?retryWrites=true&w=majority'
    }
    app.db = MongoEngine(app)
