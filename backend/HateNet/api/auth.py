from flask import Blueprint, abort, g, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from HateNet.database.schema import User
from HateNet.utils.wrappers import login_required
from HateNet.utils.twitter import refresh_oauth_token

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/register", methods=["POST"])
def register():
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    if User.objects(username=content['username']).first():
        abort(
            400, description=f"Username {content['username']} has been taken")
    try:
        keys = [key for key in content if not content[key]]
        for key in keys:
            content.pop(key)
        password = generate_password_hash(content.pop('password'))
        user = User(**content, password=password)
        user.save()
        return jsonify(success=True), 200
    except:
        abort(500, description="Failed to save user in database")


@bp.route("/login", methods=["POST"])
def login():
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    username = content.get('username')
    password = content.get('password')
    if not (username or password):
        abort(400, description="Username and password cannot be left empty")
    user = User.objects(username=username).first()
    if user is None:
        abort(400, description="Incorrect Username")
    elif not check_password_hash(user.password, password):
        abort(400, description="Incorrect Password")
    session.clear()
    session.permanent = True
    session['user_id'] = str(user.id)
    return jsonify(user), 200


@bp.route("/logout")
def logout():
    session.clear()
    return jsonify(success=True), 200


@bp.route("/update/<username>", methods=['POST'])
@login_required
def update_user(username):
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    User.objects(username=username).update_one(**content)
    return jsonify(success=True), 200


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get("user_id")
    if user_id is None:
        g.user = None
    else:
        g.user = User.objects(id=user_id).first()


@bp.route("/oauth/refresh")
@login_required
def refresh():
    if g.user.refresh_token:
        token = refresh_oauth_token(g.user.refresh_token)
        g.user.access_token = token.get("access_token")
        g.user.refresh_token = token.get("refresh_token")
        g.user.save()
    return jsonify(success=True), 200
