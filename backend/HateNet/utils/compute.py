from HateNet.database.schema import Tweet


def compute_summary(tweets, field):
    summary = dict()
    for tweet in tweets:
        if tweet[field]:
            year = tweet[field].year
            month = tweet[field].month
            day = tweet[field].day
            result = tweet.result
            if year not in summary:
                summary[year] = dict()
            if month not in summary[year]:
                summary[year][month] = dict()
            if day not in summary[year][month]:
                summary[year][month][day] = dict()
            if result not in summary[year][month][day]:
                summary[year][month][day][result] = dict()
                summary[year][month][day][result]['count'] = 0
            summary[year][month][day][result]['count'] += 1
    return summary


def compute_activity(tweets):
    activity = dict()
    for tweet in tweets:
        if(tweet.detected_at):
            year = tweet.detected_at.year
            month = tweet.detected_at.month
            day = tweet.detected_at.day
            if year not in activity:
                activity[year] = dict()
            if month not in activity[year]:
                activity[year][month] = dict()
            if day not in activity[year][month]:
                activity[year][month][day] = 0
            activity[year][month][day] += 1
    return activity


def compute_progress(project):
    progress = dict()
    progress['total'] = Tweet.objects(projects=project).count()
    progress['completed'] = Tweet.objects(
        projects=project, result__ne="None").count()
    return progress


def compute_influence(tweet):
    influence = {
        'None': 0,
        'Non-Hateful': 0,
        'Racist': 0,
        'Sexist': 0,
        'Religion': 0,
        'Homophobe': 0
    }

    for result in influence:
        influence[result] = Tweet.objects(referenced_tweets__in=[
                                          {'type': 'replied_to', 'id': tweet.tweet_id}], result=result).count()

    return influence
