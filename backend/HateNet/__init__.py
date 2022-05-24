from http.client import HTTPException
from pydoc import describe
from xmlrpc.client import boolean
from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv


def create_app():
    app = Flask(__name__)
    CORS(app)
    init(app)

    from . import api, database, models, scheduler
    api.init(app)
    database.init(app)
    models.init(app)
    # scheduler.init(app)

    return app


def init(app):
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
    app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY")
    app.register_error_handler(HTTPException, handle_exception)


def handle_exception(e):
    return jsonify(code=e.code, name=e.name, description=e.description), e.code
