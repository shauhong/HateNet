from flask import Blueprint, abort, g, jsonify, request

from HateNet.utils.twitter import block_user, get_blocking_list, unblock_user
from HateNet.utils.wrappers import bearer_token_required, login_required

bp = Blueprint("block", __name__, url_prefix="/block")


@bp.route("/", methods=["GET", "POST", "DELETE"])
@login_required
@bearer_token_required
def block(headers):
    if request.method == "GET":
        try:
            users = get_blocking_list(g.user.twitter_id, headers)
            return jsonify(users), 200
        except Exception as e:
            abort(500, description=str(e))

    if request.method == "POST":
        content = request.json
        if not content:
            abort(400, description="Request body is empty")
        username = content.get('username')
        if not username:
            abort(400, description="Invalid request body")
        try:
            users = block_user(g.user.twitter_id, username, headers)
            return jsonify(users), 200
        except Exception as e:
            abort(500, description=str(e))

    if request.method == "DELETE":
        content = request.json
        if not content:
            abort(400, description="Request body is empty")
        username = content.get('username')
        if not username:
            abort(400, description="Invalid request body")
        try:
            users = unblock_user(g.user.twitter_id, username, headers)
            return jsonify(users), 200
        except Exception as e:
            abort(500, description=str(e))
