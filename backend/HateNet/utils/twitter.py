import os
import re
from time import sleep
import requests
import json
from datetime import datetime

from HateNet.database.schema import Media, Place, Project, Tweet, TweetMetrics, User, Author, Geo
from HateNet.utils.file import load_yaml
from HateNet.utils.wrappers import bearer_token_required


def construct_query(params):
    query = list()

    for operator in params:
        for key in params[operator]:
            if key == "AND":
                query.append("(" + " ".join(params[operator]['AND']) + ")")
            if key == 'OR':
                query.append("(" + " OR ". join(params[operator]['OR']) + ")")
            if key == "NOT":
                query.append(
                    "(" + " ".join(["-" + item for item in params[operator]["NOT"]]) + ")")

    query = " ".join(query)
    return query


def lookup_user(username, headers):
    if not username:
        return
    url = f"https://api.twitter.com/2/users/by/username/{username}"
    response = requests.get(url, headers=headers)
    if response.ok:
        content = response.json()
        data = content.get('data')
        id = data.get("id") if data else None
        return id
    else:
        if response.json().get("status") == 429:
            sleep(5 * 60)
            lookup_user(username, headers)
        else:
            raise Exception(response.reason)


@bearer_token_required
def retrieve_users(usernames, url, params, headers=None):
    url = "https://api.twitter.com/2/users/by"
    params = {
        'user.field': params['user.fields'],
        'usernames': usernames
    }
    response = requests.get(url, params=params, headers=headers)
    if response.ok:
        content = response.json()
        authors = content['data']
        save_authors(authors)
    else:
        raise Exception(response.reason)


@bearer_token_required
def retrieve_tweets(ids, project, params, headers=None):
    url = "https://api.twitter.com/2/tweets"
    params.update({
        'ids': ids
    })
    response = requests.get(url, params=params, headers=headers)
    if response.ok:
        content = response.json()
        tweets = format_tweets(content)
        save_tweets(tweets, project)
    else:
        raise Exception(response.reason)


@bearer_token_required
def retrieve_liked_tweets(user_id, project, params, headers=None, max_results=100, token=None):
    url = f"https://api.twitter.com/2/users/{user_id}/liked_tweets"
    params.update({
        'max_results': max_results
    })
    if token is not None:
        params.update({
            'pagination_token': token
        })
    response = requests.get(url, params=params, headers=headers)
    if response.ok:
        content = response.json()
        tweets = format_tweets(content)
        if 'next_token' in content['meta']:
            retrieve_liked_tweets(
                user_id, project, params, headers, project, token=content['meta']['next_token'])
        save_tweets(tweets, project)
    else:
        raise Exception(response.reason)


@bearer_token_required
def get_volume_stream(project, params, headers=None, schedule=False):
    url = 'https://api.twitter.com/2/tweets/sample/stream'
    Project.objects(id=project.id).update(streaming=True)
    response = requests.get(url, headers=headers, params=params, stream=True)
    if response.ok:
        try:
            for line in response.iter_lines():
                project.reload()
                if not project.streaming:
                    break
                if schedule and datetime.now() >= project.end_date:
                    Project.objects(id=project.id).update(streaming=False)
                    break
                if line:
                    tweet = format_tweet(json.loads(line))
                    save_tweet(tweet, project)
        except Exception as e:
            raise e
    else:
        raise Exception(response.reason)


@bearer_token_required
def get_filtered_stream(project, tag, params, headers=None, schedule=False):
    url = 'https://api.twitter.com/2/tweets/search/stream'
    Project.objects(id=project.id).update(streaming=True)
    response = requests.get(url, params=params, headers=headers, stream=True)
    if response.ok:
        try:
            for line in response.iter_lines():
                project.reload()
                if not project.streaming:
                    break
                if schedule and datetime.now() >= project.end_date:
                    Project.objects(id=project.id).update(streaming=False)
                    break
                if line:
                    content = json.loads(tweet)
                    if tag in [rule['tag'] for rule in content['matching_rules']]:
                        tweet = format_tweet(content)
                        save_tweet(tweet, project)
        except Exception as e:
            raise e
    else:
        raise Exception(response.reason)


def delete_project_rules(project, headers):
    url = 'https://api.twitter.com/2/tweets/search/stream/rules'
    response = requests.get(url, headers=headers)
    tag = f"{project.user.username}-{project.name}"
    if response.ok:
        rules = response.json().get('data')
        if rules:
            ids = [rule['id'] for rule in rules if re.match(tag, rule['tag'])]
            if ids:
                payload = {'delete': {'ids': ids}}
                response = requests.post(url, headers=headers, json=payload)
                if response.ok:
                    return True
                else:
                    raise Exception(response.reason)
    else:
        raise Exception(response.reason)


def delete_all_rules(headers):
    url = 'https://api.twitter.com/2/tweets/search/stream/rules'
    response = requests.get(url, headers=headers)
    if response.ok:
        rules = response.json().get('data')
        if rules:
            ids = [rule['id'] for rule in rules]
            if ids:
                payload = {'delete': {'ids': ids}}
                response = requests.post(url, headers=headers, json=payload)
                if response.ok:
                    return True
                else:
                    raise Exception(response.reason)
    else:
        raise Exception(response.reason)


def get_rules(headers=None):
    url = 'https://api.twitter.com/2/tweets/search/stream/rules'
    response = requests.get(url, headers=headers)
    if response.ok:
        return response.json()
    else:
        raise Exception(response.reason)


def delete_rules(rules, tag, headers=None):
    url = 'https://api.twitter.com/2/tweets/search/stream/rules'
    if 'data' in rules:
        ids = [rule['id'] for rule in rules['data'] if rule['tag'] == tag]
        if ids:
            payload = {"delete": {"ids": ids}}
            response = requests.post(url, headers=headers, json=payload)
            if response.ok:
                return True
            else:
                raise Exception(response.reason)


def set_rules(query, tag, headers):
    url = 'https://api.twitter.com/2/tweets/search/stream/rules'
    payload = {"add": [{"value": query, "tag": tag}]}
    response = requests.post(url, headers=headers, json=payload)
    if response.ok:
        return True
    else:
        raise Exception(response.reason)


def format_tweets(content):
    tweets = list()
    data = content.get("data")
    if data:
        for i in range(len(data)):
            current = data[i]
            tweet = {key: current[key] for key in current}
            author = list(filter(
                lambda x: x['id'] == tweet['author_id'], content['includes']['users']))[0]
            tweet.update({
                'author': author
            })
            if 'attachments' in tweet and 'media_keys' in tweet['attachments']:
                media = list(filter(
                    lambda x: x['media_key'] in tweet['attachments']['media_keys'], content['includes']['media']))
                tweet.update({
                    'media': media
                })
            if 'geo' in tweet and 'place_id' in tweet['geo']:
                place = list(filter(
                    lambda x: x['id'] == tweet['geo']['place_id'], content['includes']['places']))[0]
                tweet.update({
                    'place': place
                })
            tweets.append(tweet)
    return tweets


def format_tweet(content):
    data = content.get('data')
    if data:
        tweet = {key: data[key] for key in data}
        author = list(filter(
            lambda x: x['id'] == tweet['author_id'], content['includes']['users']))[0]
        tweet.update({
            'author': author
        })
        if 'attachments' in tweet and 'media_keys' in tweet['attachments']:
            media = list(filter(
                lambda x: x['media_key'] in tweet['attachments']['media_keys'], content['includes']['media']))
            tweet.update({
                'media': media
            })
        if 'geo' in tweet and 'place_id' in tweet['geo']:
            place = list(filter(
                lambda x: x['id'] == tweet['geo']['place_id'], content['includes']['places']))[0]
            tweet.update({
                'place': place
            })
        return tweet


def save_tweet(tweet, project):
    if Tweet.objects(tweet_id=tweet['id']).first():
        if not Tweet.objects(tweet_id=tweet['id'], projects=project).first():
            Tweet.objects(tweet_id=tweet['id']).update(push__projects=project)
    else:
        data = {
            'tweet_id': tweet['id'],
            'conversation_id': tweet['conversation_id'],
            'text': tweet['text'],
            'lang': tweet['lang'],
            'created_at': tweet['created_at'],
            'metrics': TweetMetrics(**tweet['public_metrics']),
            'projects': [project],
            'referenced_tweets': tweet.get('referenced_tweets'),
            'in_reply_to_user_id': tweet.get("in_reply_to_user_id")
        }
        place = tweet.get("place")
        media = tweet.get("media")

        if place is not None and 'geo' in place:
            geo = Geo(geo_type=place['geo'].pop('type'), **place.pop('geo'))
            place = Place(**place, geo=geo)
            data['place'] = place

        if media is not None:
            data['media'] = list()
            media = list(filter(lambda x: x['type'] == 'photo', media))
            for m in media:
                m = Media(media_type=m.get('type'), url=m.get("url"),
                          height=m.get("height"), width=m.get('width'))
                data['media'].append(m)

        author = Author.objects(
            username=tweet['author'].get('username')).first()

        if author is None:
            author = tweet['author']
            author = Author(author_id=author.get("id"), metrics=author.get("public_metrics"), created_at=author.get("created_at"),
                            description=author.get("description"), location=author.get("location"), name=author.get('name'),
                            username=author.get("username"), profile_image_url=author.get("profile_image_url"), verified=author.get("verified"))
            author.save()

        data['author'] = author
        data['username'] = author.username
        tweet = Tweet(**data)
        tweet.save()
        return tweet


def save_author(author):
    if not Author.objects(author_id=author['id']).first():
        image = requests.get(author['profile_image_url'])
        author = Author(author_id=author.pop('id'),
                        metrics=author.pop('public_metrics'), **author)
        author.image.put(image.content, content_type="image/jpeg")
        author.save()


def save_tweets(tweets, project):
    for tweet in tweets:
        save_tweet(tweet, project)


def save_authors(authors):
    for author in authors:
        save_author(author)


def add_to_monitor(author, project):
    Project.objects(id=project.id).update(add_to_set__monitor=author)


def remove_from_monitor(author, project):
    Project.objects(id=project.id).update(pull_all__monitor=author)


def save_user(user_id, headers):
    url = "https://api.twitter.com/2/users"
    params = {
        "ids": [user_id],
        "user.fields": "created_at,description,location,profile_image_url,public_metrics,protected,verified"
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        if not response.ok:
            raise Exception(response.reason)
        response = response.json()
        data = response.get("data")[0]
        print(data)

        author = Author.objects(username=data.get("username")).first()
        if author is None:
            author = Author(author_id=data.get("id"), metrics=data.get("public_metrics"), created_at=data.get("created_at"), description=data.get("description"),
                            location=data.get("location"), name=data.get("name"), username=data.get("username"), profile_image_url=data.get("profile_image_url"), verified=data.get("verified"))
            author.save()
            print(author)

    except Exception as e:
        print(e)
        raise e


def lookup_authorized_user(access_token):
    url = 'https://api.twitter.com/2/users/me'
    headers = {
        'Authorization': f"Bearer {access_token}"
    }
    try:
        response = requests.get(url, headers=headers)
        if not response.ok:
            raise Exception(response.reason)
        response = response.json()
        data = response.get("data")
        user = {
            'id': data.get("id"),
            'username': data.get("username")
        }
        return user
    except Exception as e:
        print(e)
        raise e


def get_oauth_token(code):
    authorization_token = os.environ.get("AUTHORIZATION_TOKEN")
    client_id = os.environ.get("CLIENT_ID")
    url = "https://api.twitter.com/2/oauth2/token"

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {authorization_token}'
    }

    data = {
        'code': code,
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'redirect_uri': 'http://127.0.0.1:3000',
        'code_verifier': "challenge"
    }

    try:
        response = requests.post(url, headers=headers, data=data)
        if not response.ok:
            raise Exception(response.reason)
        response = response.json()
        token = {
            'access_token': response.get("access_token"),
            'refresh_token': response.get("refresh_token")
        }
        return token
    except Exception as e:
        raise e


def refresh_oauth_token(refresh_token):
    authorization_token = os.environ.get("AUTHORIZATION_TOKEN")
    client_id = os.environ.get("CLIENT_ID")

    url = "https://api.twitter.com/2/oauth2/token"

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {authorization_token}'
    }

    data = {
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
        'client_id': client_id
    }
    try:
        response = requests.post(url, headers=headers, data=data)
        if not response.ok:
            raise Exception(response.reason)
        response = response.json()
        token = {
            'access_token': response.get("access_token"),
            'refresh_token': response.get("refresh_token")
        }
        return token
    except Exception as e:
        raise e


def get_blocking_list(id, headers, blocks=None, token=None):
    url = f"https://api.twitter.com/2/users/{id}/blocking"
    params = {
        'max_results': 1000
    }
    if not blocks:
        blocks = list()
    if token:
        params.update({
            'pagination_token': token,
        })
    try:
        response = requests.get(url, headers=headers, params=params)
        if not response.ok:
            raise Exception(response.json())
        content = response.json()
        data = content.get("data")
        if data:
            blocks = [*blocks, *data]
        if 'next_token' in content['meta']:
            get_blocking_list(id, headers, blocks=blocks,
                              token=content['meta']['next_token'])
        return blocks
    except Exception as e:
        raise e


def block_user(id, target_username, headers):
    target_user_id = lookup_user(target_username, headers)
    url = f"https://api.twitter.com/2/users/{id}/blocking"
    payload = {
        'target_user_id': target_user_id
    }
    try:
        response = requests.post(url, headers=headers, json=payload)
        if not response.ok:
            raise Exception(response.json())
        content = response.json()
        blocking = content.get("data")
        return blocking
    except Exception as e:
        raise e


def unblock_user(id, target_username, headers):
    target_user_id = lookup_user(target_username, headers)
    url = f"https://api.twitter.com/2/users/{id}/blocking/{target_user_id}"
    try:
        response = requests.delete(url, headers=headers)
        if not response.ok:
            raise Exception(response.json())
        content = response.json()
        blocking = content.get("data")
        return blocking
    except Exception as e:
        raise e


def get_timeline(user_id, full=True):
    author = Author.objects(author_id=user_id).first()
    tweets = Tweet.objects(author=author)
    if full:
        for tweet in tweets:
            reference_tweets = Tweet.objects(
                conversation_id=tweet.tweet_id, tweet_id__ne=tweet.tweet_id)
            tweet.reference_tweets = reference_tweets
    return tweets


@bearer_token_required
def retrieve_historical_project(project, headers=None):
    params = load_yaml(os.path.join("static", "params.yaml"))
    try:
        retrieve_historical_tweets(project, params, headers)
    except Exception as e:
        raise e


@bearer_token_required
def retrieve_filtered_project(project, headers=None):
    params = load_yaml(os.path.join("static", "params.yaml"))
    try:
        tag = " ".join([project.user.username, project.name])
        rules = get_rules(headers)
        delete_rules(rules, tag, headers)
        rules = {'add': [{"value": project.query, 'tag': tag}]}
        retrieve_filtered_stream_tweets(project, params, headers)
    except Exception as e:
        raise e


@bearer_token_required
def retrieve_volume_project(project, headers=None):
    params = load_yaml(os.path.join("static", "params.yaml"))
    try:
        retrieve_volume_stream_tweets(project, params, headers)
    except Exception as e:
        raise e


def retrieve_historical_tweets(project, params, headers, max_results=100, token=None):
    url = 'https://api.twitter.com/2/tweets/search/recent'
    query = project.query
    params.update({
        'query': query,
        'max_results': max_results,
    })
    if token:
        params.update({
            'next_token': token
        })
    response = requests.get(url, params=params, headers=headers)
    if response.ok:
        try:
            project.reload()
            if not project.streaming:
                return
            content = response.json()
            tweets = format_tweets(content)
            save_tweets(tweets, project)
            if 'next_token' in content['meta']:
                retrieve_historical_tweets(
                    project, params, headers, token=content['meta']['next_token'])
            else:
                Project.objects(id=project.id).update_one(streaming=False)
        except Exception as e:
            raise e
    else:
        if response.json().get("status") == 429:
            sleep(5 * 60)
            retrieve_historical_tweets(project, params, headers, token=token)
        raise Exception(response.reason)


def add_filtered_stream(project, params, headers):
    projects = Project.objects(project_type="filtered", streaming=True)
    tag = f"{project.user.username}-{project.name}"
    delete_project_rules(project, headers)
    set_rules(project.query, tag, headers)
    if len(projects) == 0:
        project.streaming = True
        project.save()
        start_filtered_stream(params, headers)
    project.streaming = True
    project.save()


def remove_filtered_stream(project, headers):
    rules = get_rules(headers)
    tag = f"{project.user.username}-{project.name}"
    delete_rules(rules, tag, headers)
    project.streaming = False
    project.save()


def start_filtered_stream(params, headers):
    url = 'https://api.twitter.com/2/tweets/search/stream'
    response = requests.get(url, headers=headers, params=params, stream=True)
    if response.ok:
        try:
            for line in response.iter_lines():
                projects = Project.objects(
                    project_type="filtered", streaming=True)
                if len(projects) == 0:
                    break
                if line:
                    content = json.loads(line)
                    tweet = format_tweet(content)
                    for rule in content['matching_rules']:
                        username, name = rule['tag'].split("-")
                        user = User.objects(username=username).first()
                        project = Project.objects(user=user, name=name).first()
                        if user and project:
                            save_tweet(tweet, project)
        except Exception as e:
            raise e
    else:
        raise Exception(response.reason)


def retrieve_filtered_stream_tweets(project, params, headers):
    url = 'https://api.twitter.com/2/tweets/search/stream'
    response = requests.get(url, headers=headers, params=params, stream=True)
    if response.ok:
        try:
            for line in response.iter_lines():
                project.reload()
                if not project.streaming:
                    break
                if line:
                    tweet = format_tweet(json.loads(line))
                    save_tweet(tweet, project)
        except Exception as e:
            raise e
    else:
        raise Exception(response.reason)


def retrieve_volume_stream_tweets(project, params, headers):
    url = 'https://api.twitter.com/2/tweets/sample/stream'
    response = requests.get(url, headers=headers, params=params, stream=True)
    if response.ok:
        try:
            for line in response.iter_lines():
                project.reload()
                if not project.streaming:
                    break
                if line:
                    tweet = format_tweet(json.loads(line))
                    save_tweet(tweet, project)
        except Exception as e:
            raise e
    else:
        raise Exception(response.reason)


def add_volume_stream(project, params, headers):
    projects = Project.objects(project_type='volume', streaming=True)
    if len(projects) == 0:
        project.streaming = True
        project.save()
        start_volume_stream(params, headers)
    project.streaming = True
    project.save()


def remove_volume_stream(project):
    project.streaming = False
    project.save()


def start_volume_stream(params, headers):
    url = 'https://api.twitter.com/2/tweets/sample/stream'
    response = requests.get(url, headers=headers, params=params, stream=True)
    if response.ok:
        try:
            for line in response.iter_lines():
                projects = Project.objects(
                    project_type="volume", streaming=True)
                if len(projects) == 0:
                    break
                if line:
                    tweet = format_tweet(json.loads(line))
                    for project in projects:
                        save_tweet(tweet, project)
        except Exception as e:
            raise e
    else:
        raise Exception(response.reason)


def retrieve_monitor_projects(params, headers):
    projects = Project.objects
    for project in projects:
        retrieve_monitor_tweets(project, params=params, headers=headers)


def retrieve_monitor_tweets(project, params, headers):
    for monitor in project.monitor:
        params = load_yaml(os.path.join(os.path.dirname(os.path.dirname(
            os.path.abspath(__file__))), 'static', 'params.yaml'))
        retrieve_timeline(monitor, project, params=params, headers=headers)

        tweets = Tweet.objects(author=monitor, projects=project)
        for tweet in tweets:
            params = load_yaml(os.path.join(os.path.dirname(os.path.dirname(
                os.path.abspath(__file__))), 'static', 'params.yaml'))
            retrieve_conversation_thread(tweet, project, params, headers)


def retrieve_personal_projects(params, headers):
    projects = Project.objects(project_type="personal")
    for project in projects:
        retrieve_personal_tweets(
            project.user.twitter_username, project, params, headers)


def retrieve_personal_tweets(username, project, params, headers):
    if username:
        author = Author.objects(username=username).first()
        params = load_yaml(os.path.join(os.path.dirname(os.path.dirname(
            os.path.abspath(__file__))), 'static', 'params.yaml'))
        retrieve_timeline(author, project, params, headers)
        tweets = Tweet.objects(author=author, projects=project)
        for tweet in tweets:
            params = load_yaml(os.path.join(os.path.dirname(os.path.dirname(
                os.path.abspath(__file__))), 'static', 'params.yaml'))
            retrieve_conversation_thread(tweet, project, params, headers)


def retrieve_timeline(author, project, params, headers, max_results=100, token=None, level=0, count=0):
    id = lookup_user(author.username, headers)
    if not id:
        return
    url = f"https://api.twitter.com/2/users/{id}/tweets"
    tweet = None
    params.update({
        'max_results': max_results,
        "since_id": tweet.tweet_id if tweet else None
    })
    if project.project_type == "personal":
        exclude = list()
        if project.raw.get("isReply") != "is:reply":
            exclude.append("replies")
        if project.raw.get("isRetweet") != "is:retweet":
            exclude.append("retweets")
        if len(exclude) > 0:
            params.update({
                'exclude': ",".join(exclude)
            })
    if token is not None:
        params.update({
            'pagination_token': token
        })
    response = requests.get(url, headers=headers, params=params)
    if response.ok:
        try:
            content = response.json()
            tweets = format_tweets(content)
            save_tweets(tweets, project)
            if 'next_token' in content['meta'] and level < 10:
                retrieve_timeline(author, project, params, headers,
                                  token=content['meta']['next_token'], level=level+1)
        except Exception as e:
            raise e
    else:
        status = response.json().get("status")
        if status == 429:
            sleep(5 * 60)
            retrieve_timeline(author, project, params,
                              headers, token=token, level=level)
        else:
            raise Exception(response.reason)


def retrieve_conversation_thread(tweet, project, params, headers, max_results=100, token=None, count=0):
    url = "https://api.twitter.com/2/tweets/search/recent"
    query = construct_query({
        'STANDALONE': {
            "AND": [f"conversation_id:{tweet.conversation_id}", f"to:{tweet.author.username}"]
        },
    })
    params.update({
        'query': query,
        'max_results': max_results
    })
    if token is not None:
        params.update({
            'next_token': token
        })
    response = requests.get(url, headers=headers, params=params)
    if response.ok:
        try:
            content = response.json()
            tweets = format_tweets(content)
            save_tweets(tweets, project)
            if 'next_token' in content['meta']:
                retrieve_conversation_thread(
                    tweet, project, params, headers, token=content['meta']['next_token'])
        except Exception as e:
            raise e
    else:
        status = response.json().get("status")
        if status == 429:
            sleep(5 * 60)
            retrieve_conversation_thread(
                tweet, project, params, headers, token=token)
        else:
            raise Exception(response.reason)


def lookup_tweet(id, project, params, headers):
    url = f"https://api.twitter.com/2/tweets/{id}"
    response = requests.get(url, headers=headers, params=params)
    if response.ok:
        try:
            content = response.json()
            tweet = format_tweet(content)
            tweet = save_tweet(tweet, project)
            return tweet
        except Exception as e:
            raise e
    else:
        raise Exception(response.reason)
