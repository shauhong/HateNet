
from flask import abort, has_app_context, request, g
import functools
import jwt
import os

from HateNet.database.schema import Project, User
from HateNet.utils.file import load_yaml


def params_required(view):
    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):
        root = os.path.dirname(os.path.dirname(__file__))
        params = load_yaml(os.path.join(root, 'static', 'params.yaml'))
        kwargs.update({
            "params": params
        })
        return view(*args, **kwargs)
    return wrapped_view


def bearer_token_required(view):
    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):
        if has_app_context() and g.user and g.user.access_token:
            kwargs.update({
                'headers': {
                    "Authorization": f"Bearer {g.user.access_token}"
                }
            })
        else:
            kwargs.update({
                'headers': {
                    'Authorization': f'Bearer {os.environ.get("BEARER_TOKEN")}'
                }
            })
        return view(*args, **kwargs)
    return wrapped_view


def project_existed(view):
    @functools.wraps(view)
    def wrapped_view(project, *args, **kwargs):
        project = Project.objects(name=project, user=g.user).first()
        if project is None:
            abort(400, description="Invalid Project")
        kwargs.update({
            'project': project
        })
        return view(*args, **kwargs)
    return wrapped_view


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user is None:
            abort(401, description="Log In Required")
        return view(*args, **kwargs)
    return wrapped_view


def token_required(view):
    @functools.wraps(view)
    def wrapped_view(*args, **kwargs):
        token = None
        if 'Authorization' not in request.headers:
            abort(401, description="Authorization Token Missing")
        else:
            try:
                token = request.headers['Authorization']
                data = jwt.decode(token, os.environ.get("SECRET_KEY"))
                user = User.objects(id=data['user_id']).first()
                g.user = user
            except:
                abort(401, description="Incorrect Authorization Token")
        return view(*args, **kwargs)
    return wrapped_view
