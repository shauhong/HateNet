from flask import Blueprint, jsonify

bp = Blueprint("healthcheck", __name__, url_prefix="/healthcheck")


@bp.route("/")
def healthcheck():
    return jsonify(running=True), 200
