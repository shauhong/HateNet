from HateNet.database.schema import Aggregate, Author, Project, Tweet
from HateNet.utils.preprocess import remove_pattern, remove_stop_words


def aggregate_projects():
    projects = Project.objects
    for project in projects:
        if project.project_type == 'personal':
            for kind in ['all', 'tweet', 'reply']:
                aggregate_project(project, kind)
        else:
            aggregate_project(project)


def aggregate_project(project, kind='all'):
    aggregate = Aggregate.objects(project=project, kind=kind).first()
    if not aggregate:
        aggregate = Aggregate(project=project.to_dbref(), kind=kind)
        aggregate.save()

    if kind == 'tweet':
        assert project.user.twitter_username is not None
        author = Author.objects(username=project.user.twitter_username).first()
        tweets = Tweet.objects(projects=project, author=author,
                               result__ne="None", aggregated__nin=[aggregate])

    if kind == 'reply':
        assert project.user.twitter_username is not None
        author = Author.objects(username=project.user.twitter_username).first()
        tweets = Tweet.objects(projects=project, author__ne=author,
                               result__ne="None", aggregated__nin=[aggregate])

    if kind == 'all':
        tweets = Tweet.objects(
            projects=project, result__ne="None", aggregated__nin=[aggregate])

    for tweet in tweets:
        year = str(tweet.created_at.year)
        month = str(tweet.created_at.month)
        day = str(tweet.created_at.day)
        result = tweet.result
        author = tweet.author
        if author not in aggregate.author:
            aggregate.author.append(author)
        if year not in aggregate.aggregate:
            aggregate.aggregate[year] = dict()
        if month not in aggregate.aggregate[year]:
            aggregate.aggregate[year][month] = dict()
        if day not in aggregate.aggregate[year][month]:
            aggregate.aggregate[year][month][day] = dict()
        if result not in aggregate.aggregate[year][month][day]:
            aggregate.aggregate[year][month][day][result] = {
                'count': 0,
                'location': {},
                'text': [],
                'term': {},
                'author': {},
            }

        aggregate_over_location(
            aggregate.aggregate[year][month][day][result]['location'], tweet)
        aggregate_over_author(
            aggregate.aggregate[year][month][day][result]['author'], tweet)

        aggregate_over_term(
            aggregate.aggregate[year][month][day][result]['term'], tweet)

        aggregate_over_text(
            aggregate.aggregate[year][month][day][result]['text'], tweet)

        aggregate.aggregate[year][month][day][result]['count'] += 1

        Tweet.objects(id=tweet.id).update(add_to_set__aggregated=aggregate)

    aggregate.save()


def aggregate_over_location(aggregate, tweet):
    place = tweet.place
    if place:
        country = str(place.country_code)
        if country not in aggregate:
            aggregate[country] = 0
        aggregate[country] += 1


def aggregate_over_author(aggregate, tweet):
    author = tweet.author
    username = author.username
    if username not in aggregate:
        aggregate[username] = 0
    aggregate[username] += 1


def aggregate_over_term(aggregate, tweet):
    text = tweet.text
    text = remove_pattern(text)
    text = text.lower()
    text = remove_stop_words(text)
    words = text.split()

    for word in words:
        if word not in aggregate:
            aggregate[word] = 0
        aggregate[word] += 1


def aggregate_over_text(aggregate, tweet):
    aggregate.append(tweet.text)


def reset_aggregate(project):
    Aggregate.objects(project=project).delete()
