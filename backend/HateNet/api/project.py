from datetime import datetime
from flask import Blueprint, abort, current_app, g, jsonify, request

from HateNet.database.schema import Author, Project
from HateNet.scheduler.schedule import remove_from_schedule, schedule_project
from HateNet.utils.date import parse_datestring
from HateNet.utils.file import parse_json
from HateNet.utils.twitter import add_filtered_stream, add_volume_stream, construct_query, get_oauth_token, lookup_authorized_user, retrieve_historical_tweets
from HateNet.utils.wrappers import bearer_token_required, login_required, params_required, project_existed


bp = Blueprint("project", __name__, url_prefix="/project")


@bp.route('/new', methods=['POST'])
@login_required
def create_project():
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    if Project.objects(user=g.user, name=content['name']).first() is None:
        if g.user.user_type == 'activist':
            content['query'] = construct_query(content['profile'])
            content['start'] = parse_datestring(
                content['start']) if content.get('start') else None
            content['end'] = parse_datestring(
                content['end']) if content.get('end') else None

        if g.user.user_type == 'user':
            state = content.pop('state')
            code = content.pop('code')
            if not state and code:
                abort(400, description="Unauthorized Twitter user")
            token = get_oauth_token(code)
            g.user.access_token = token['access_token']
            g.user.refresh_token = token['refresh_token']
            user = lookup_authorized_user(g.user.access_token)
            g.user.twitter_username = user.get("username")
            g.user.twitter_id = user.get("id")
            g.user.save()
        try:
            project = Project(**content, user=g.user,
                              created_at=datetime.now())
            project.save()
            schedule_project(current_app.scheduler, project)
            project.reload()
            schedule_project(current_app.scheduler, project)
            project = parse_json(project.to_dict())
            return jsonify(project), 200
        except:
            abort(
                500, description=f"Failed to save project {content['name']}")
    else:
        abort(
            400, description=f"Project name {content['name']} has been taken")


@bp.route('/')
@login_required
def get_projects():
    try:
        projects = Project.objects(user=g.user)
        data = [parse_json(project.to_dict()) for project in projects]
        return jsonify(data), 200
    except Exception as e:
        abort(
            500, description="Failed to retrieve projects")


@bp.route('/<name>')
@login_required
def get_project(name):
    try:
        project = Project.objects(user=g.user, name=name).first()
        if project is not None:
            project = parse_json(project.to_dict())
        return jsonify(project), 200
    except Exception as e:
        abort(
            500, description=f"Failed to retrieve project {name}")


@bp.route('/<project>/monitor', methods=["POST"])
@login_required
@project_existed
def update_monitor(project):
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    try:
        id = content['id']
        method = content['method']
        author = Author.objects(id=id).first()
        if method == 'add':
            Project.objects(id=project.id).update(
                add_to_set__monitor=author)
        else:
            Project.objects(id=project.id).update(pull__monitor=author)
        project.reload()
        project = parse_json(project.to_dict())
        return jsonify(project), 200
    except Exception as e:
        abort(500, description=f"Failed to update monitor list")


@bp.route('/update/<id>', methods=['POST'])
@login_required
def update_project(id):
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    if Project.objects(user=g.user, id=id).first():
        if 'profile' in content:
            content['query'] = construct_query(content['profile'])
        content['start'] = parse_datestring(
            content['start']) if content.get('start') else None
        content['end'] = parse_datestring(
            content['end']) if content.get('end') else None
        try:
            Project.objects(user=g.user, id=id).update_one(**content)
            project = Project.objects(user=g.user, id=id).first()
            remove_from_schedule(current_app.scheduler, project)
            schedule_project(current_app.scheduler, project)
            project.reload()
            project = parse_json(project.to_dict())
            return project, 200
        except Exception as e:
            abort(
                500, description="Failed to update project")
    else:
        abort(400, description="Project is not found")


@bp.route('/delete/<id>', methods=['POST', 'GET'])
@login_required
def delete_project(id):
    try:
        project = Project.objects(user=g.user, id=id).first()
        if project:
            remove_from_schedule(current_app.scheduler, project)
            project.delete()
        return {'success': True}
    except Exception as e:
        abort(
            500, description="Failed to delete project")


@bp.route("/stream/start/<project>")
@login_required
@project_existed
@bearer_token_required
@params_required
def start_stream(project, headers, params):
    try:
        if not project.streaming:
            id = f"{project.user.username}-{project.name}"
            existing_ids = [job.id for job in current_app.scheduler.get_jobs()]
            if id in existing_ids:
                current_app.scheduler.remove_job(id)
            if project.project_type == "historical":
                project.streaming = True
                project.save()
                current_app.scheduler.add_job(retrieve_historical_tweets, 'date', args=[
                    project, params, headers],  misfire_grace_time=300, id=id)
            if project.project_type == "filtered":
                current_app.scheduler.add_job(add_filtered_stream, 'date', args=[
                    project, params, headers],  misfire_grace_time=300, id=id)
            if project.project_type == "volume":
                current_app.scheduler.add_job(add_volume_stream, 'date', args=[
                    project, params, headers],  misfire_grace_time=300, id=id)
        project.streaming = True
        return jsonify(project), 200
    except Exception as e:
        abort(
            500, description="Failed to start stream")


@bp.route("/stream/stop/<project>")
@login_required
@project_existed
def stop(project):
    try:
        remove_from_schedule(current_app.scheduler, project)
        project.reload()
        return jsonify(project), 200
    except Exception as e:
        abort(
            500, description="Failed to stop stream")
