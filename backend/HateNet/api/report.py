import math
from flask import Blueprint, abort, g, jsonify, request

from HateNet.utils.file import parse_json
from HateNet.utils.twitter import lookup_tweet
from HateNet.utils.wrappers import bearer_token_required, params_required, login_required
from HateNet.database.schema import Project, Tweet

bp = Blueprint("report", __name__, url_prefix="/report")


@bp.route("/", methods=["GET", "POST"])
@bearer_token_required
@params_required
def report(headers, params):
    if request.method == "GET":
        page = int(request.args.get("page", 1))
        results = int(request.args.get("results", 50))
        start = (page - 1) * results
        end = page * results
        asc = True if request.args.get("asc") == "true" else False
        try:
            report = Project.objects(project_type="report").first()
            projects = Project.objects(user=g.user)
            if report is None:
                return jsonify(tweets=[], next=False, total=0)
            tweets = Tweet.objects(projects=report, projects__nin=projects).order_by(
                "+created_at" if asc else "-created_at")
            total = math.ceil(tweets.count() / results)
            next = True if page < total else False
            tweets = [parse_json(tweet.to_dict())
                      for tweet in tweets[start:end]]
            return jsonify(tweets=tweets, next=next, total=total), 200
        except Exception as e:
            abort(500, description=str(e))

    if request.method == "POST":
        content = request.json
        if not content:
            abort(400, description="Request body is empty")
        id = content.get("id")
        label = content.get("label")
        if not (id and label):
            abort(400, description="Request body is incomplete")
        try:
            report = Project.objects(project_type="report").first()
            if not report:
                report = Project(name="Report", project_type="report")
                report.save()
            lookup_tweet(id, report, params, headers)
            Tweet.objects(tweet_id=id).update(result=label)
            return jsonify(success=True), 200
        except Exception as e:
            abort(500, description=str(e))


@bp.route("/add/<id>", methods=["POST"])
@login_required
def add(id):
    content = request.json
    if not content:
        abort(400, description="Request body is empty")
    try:
        tweet = Tweet.objects(tweet_id=id).first()
        if not tweet:
            raise Exception("Invalid Tweet ID")
        projects = Project.objects(
            user=g.user, name__in=content.get("projects", list()))
        Tweet.objects(tweet_id=id).update(push_all__projects=projects)
        return jsonify(success=True), 200
    except Exception as e:
        abort(500, description=str(e))
