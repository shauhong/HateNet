import json
import math
import os
from flask import Blueprint, abort, g, jsonify, request

from HateNet.database.schema import Aggregate, Author, Tweet
from HateNet.utils.compute import compute_activity, compute_influence, compute_progress, compute_summary
from HateNet.utils.file import parse_json
from HateNet.utils.tfidf import compute_c_tf_idf
from HateNet.utils.wrappers import project_existed, login_required


bp = Blueprint("data", __name__, url_prefix="/data")


@bp.route('/user/<username>')
@login_required
def get_user(username):
    author = Author.objects(username=username).first()
    return jsonify(author), 200


@bp.route('/<project>')
@login_required
@project_existed
def get_project(project):
    tweets = Tweet.objects(projects=project).order_by("-created_at")
    data = {
        'tweets': list(),
        'progress': dict(),
        'summary': dict(),
    }
    for tweet in tweets:
        data['tweets'].append(parse_json(tweet.to_dict()))
    data['progress'] = compute_progress(project)
    data['summary'] = compute_summary(tweets, 'detected_at')
    return jsonify(data), 200


@bp.route("/<project>/tweets")
@login_required
@project_existed
def get_tweets(project):
    try:
        page = int(request.args.get("page", 1))
        results = int(request.args.get("results", 50))
        sort = request.args.get("sort")
        term = request.args.get("term", "")
        status = request.args.get("status")
        scope = request.args.get("scope", "all")

        start = (page - 1) * results
        end = page * results

        if status:
            if status == 'completed':
                if scope == 'all':
                    tweets = Tweet.objects(
                        projects=project, text__contains=term, result__ne='None').order_by(sort).allow_disk_use(enabled=True)

                if scope == 'tweet':
                    author = Author.objects(
                        username=g.user.twitter_username).first()
                    tweets = Tweet.objects(projects=project, text__contains=term, result__ne='None', author=author).order_by(
                        sort).allow_disk_use(enabled=True)

                if scope == 'reply':
                    author = Author.objects(
                        username=g.user.twitter_username).first()
                    tweets = Tweet.objects(projects=project, text__contains=term, result__ne='None', author__ne=author).order_by(
                        sort).allow_disk_use(enabled=True)
            else:
                if scope == 'all':
                    tweets = Tweet.objects(
                        projects=project, text__contains=term, result='None').order_by(sort).allow_disk_use(enabled=True)

                if scope == 'tweet':
                    author = Author.objects(
                        username=g.user.twitter_username).first()
                    tweets = Tweet.objects(
                        projects=project, text__contains=term, result='None', author=author).order_by(sort).allow_disk_use(enabled=True)

                if scope == 'reply':
                    author = Author.objects(
                        username=g.user.twitter_username).first()
                    tweets = Tweet.objects(
                        projects=project, text__contains=term, result='None', author__ne=author).order_by(sort).allow_disk_use(enabled=True)

        else:
            if scope == 'all':
                tweets = Tweet.objects(
                    projects=project, text__contains=term).order_by(sort).allow_disk_use(enabled=True)
                # print(start)
                # print(end)
                # for tweet in tweets:
                #     print(tweet.text)

            if scope == 'tweet':
                author = Author.objects(
                    username=g.user.twitter_username).first()
                tweets = Tweet.objects(
                    projects=project, text__contains=term, author=author).order_by(sort).allow_disk_use(enabled=True)

            if scope == 'reply':
                author = Author.objects(
                    username=g.user.twitter_username).first()
                tweets = Tweet.objects(
                    projects=project, text__contains=term, author__ne=author).order_by(sort).allow_disk_use(enabled=True)

        total = math.ceil(tweets.count() / results)
        next = True if end < total else False
        tweets = [parse_json(tweet.to_dict())
                  for tweet in tweets[start:end]]
        return jsonify(tweets=tweets, next=next, total=total), 200
    except Exception as e:
        abort(400, description="Invalid parameters")


@bp.route("/<project>/<username>/timeline")
@login_required
@project_existed
def get_timeline(project, username):
    page = int(request.args.get("page", 1))
    results = int(request.args.get("results", 10))
    start = (page - 1) * results
    end = page * results
    author = Author.objects(username=username).first()
    if not author:
        abort(400, description="User does not exist")
    total = math.ceil(Tweet.objects(projects=project,
                      author=author).count() / results)
    next = True if page < total else False
    tweets = list()
    for tweet in Tweet.objects(projects=project, author=author).order_by(
            "-created_at")[start:end]:
        influence = compute_influence(tweet)
        tweet.influence = influence
        tweet.save()
        tweet.reload()
        tweet = parse_json(tweet.to_dict())
        tweets.append(tweet)
    return jsonify(tweets=tweets, next=next, total=total), 200


@bp.route("/<project>/replies/<id>")
@login_required
@project_existed
def get_replies(project, id):
    page = int(request.args.get("page", 1))
    results = int(request.args.get("results", 50))
    start = (page - 1) * results
    end = page * results
    replies = Tweet.objects(projects=project, referenced_tweets__in=[
                            {'type': 'replied_to', 'id': id}]).order_by("-created_at")
    total = math.ceil(replies.count() / results)
    next = True if page < total else False
    replies = [parse_json(reply.to_dict()) for reply in replies[start:end]]
    return jsonify(tweets=replies, next=next, total=total), 200


@bp.route('/<project>/recent/<username>')
@login_required
@project_existed
def get_summary(project, username):
    author = Author.objects(username=username).first()
    if not author:
        abort(400, description="Author does not exist")
    tweets = Tweet.objects(projects=project, author=author).order_by(
        "-created_at")
    summary = compute_summary(tweets, 'created_at')
    return jsonify(summary), 200


@bp.route('/<project>/aggregate')
@login_required
@project_existed
def get_aggregate(project):
    kind = request.args.get("kind", "all")
    aggregate = Aggregate.objects(project=project, kind=kind).first()
    if aggregate:
        aggregate = parse_json(aggregate.to_dict())
    return jsonify(aggregate), 200


@bp.route("/<project>/progress")
@login_required
@project_existed
def get_progress(project):
    progress = dict()
    progress['total'] = Tweet.objects(projects=project).count()
    progress['completed'] = Tweet.objects(
        projects=project, result__ne="None").count()
    progress['progress'] = progress['total'] - progress['completed']
    return progress, 200


@bp.route("/tf-idf", methods=["POST"])
def get_c_tf_idf():
    content = request.json
    if content:
        documents = content['documents']
        c_tf_idf = compute_c_tf_idf(documents)
        return jsonify(c_tf_idf), 200
    else:
        abort(400, description="Request body is empty")


@bp.route('/terms')
def get_terms():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with open(os.path.join(root, 'static', 'hate.json')) as f:
        terms = json.load(f)
    return jsonify(terms)
