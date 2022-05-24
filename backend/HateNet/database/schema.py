import mongoengine as me
import bson
import json


class Geo(me.EmbeddedDocument):
    geo_type = me.StringField()
    bbox = me.ListField(me.IntField())
    properties = me.DictField()


class Place(me.EmbeddedDocument):
    place_id = me.StringField()
    place_type = me.StringField()
    name = me.StringField()
    full_name = me.StringField()
    country = me.StringField()
    country_code = me.StringField()
    geo = me.EmbeddedDocumentField(Geo)


class Media(me.EmbeddedDocument):
    media_key = me.StringField()
    media_type = me.StringField()
    alt_text = me.StringField()
    url = me.URLField()
    image = me.FileField()
    height = me.IntField()
    width = me.IntField()


class TweetMetrics(me.EmbeddedDocument):
    like_count = me.IntField()
    quote_count = me.IntField()
    reply_count = me.IntField()
    retweet_count = me.IntField()


class AuthorMetrics(me.EmbeddedDocument):
    followers_count = me.IntField()
    following_count = me.IntField()
    tweet_count = me.IntField()
    listed_count = me.IntField()


class Organization(me.EmbeddedDocument):
    name = me.StringField()
    email = me.EmailField()
    description = me.StringField()
    headquarter = me.StringField()


class Author(me.Document):
    author_id = me.StringField()
    created_at = me.DateTimeField()
    description = me.StringField()
    location = me.StringField()
    name = me.StringField()
    username = me.StringField()
    profile_image_url = me.URLField()
    verified = me.BooleanField()
    protected = me.BooleanField()
    metrics = me.EmbeddedDocumentField(AuthorMetrics)
    image = me.FileField()


class User(me.Document):
    username = me.StringField(unique=True)
    password = me.StringField()
    email = me.EmailField()
    name = me.StringField()
    user_type = me.StringField(
        choices=['user', 'activist'], default='user')
    organization = me.EmbeddedDocumentField(Organization)
    twitter_username = me.StringField()
    twitter_id = me.StringField()
    refresh_token = me.StringField()
    access_token = me.StringField()


class Project(me.Document):
    name = me.StringField()
    user = me.ReferenceField(User)
    project_type = me.StringField(
        choices=['personal', 'historical', 'volume', 'filtered', 'report'])
    raw = me.DictField()
    profile = me.DictField()
    query = me.StringField()
    created_at = me.DateTimeField()
    start = me.DateTimeField()
    end = me.DateTimeField()
    last_date = me.DateTimeField()
    interval = me.IntField()
    streaming = me.BooleanField(default=False)
    monitor = me.ListField(me.ReferenceField(
        Author, reverse_delete_rule=me.PULL))

    def to_dict(self):
        data = self.to_mongo()
        data['user'] = self.user.to_mongo().to_dict()
        data['monitor'] = [author.to_mongo().to_dict()
                           for author in self.monitor]
        data = data.to_dict()
        return data


class Aggregate(me.Document):
    aggregate = me.DictField()
    author = me.ListField(me.ReferenceField(
        Author, reverse_delete_rule=me.CASCADE))
    kind = me.StringField(choices=['all', 'tweet', 'reply'], default="all")
    project = me.ReferenceField(Project, reverse_delete_rule=me.CASCADE)

    def to_dict(self):
        data = self.to_mongo()
        data['author'] = [author.to_mongo().to_dict()
                          for author in self.author]
        data = data.to_dict()
        return data


class Tweet(me.Document):
    media = me.ListField(me.EmbeddedDocumentField(Media))
    metrics = me.EmbeddedDocumentField(TweetMetrics)
    place = me.EmbeddedDocumentField(Place)
    author = me.ReferenceField(Author, reverse_delete_rule=me.CASCADE)
    username = me.StringField()
    projects = me.ListField(me.ReferenceField(
        Project, reverse_delete_rule=me.PULL))
    created_at = me.DateTimeField()
    detected_at = me.DateTimeField()
    lang = me.StringField()
    tweet_id = me.StringField()
    conversation_id = me.StringField()
    text = me.StringField()
    result = me.StringField(default="None")
    referenced_tweets = me.ListField(me.DictField())
    likes = me.ListField(me.ReferenceField(
        Author, reverse_delete_rule=me.PULL))  # Temp
    aggregated = me.ListField(me.ReferenceField(
        Aggregate, reverse_delete_rule=me.PULL))
    in_reply_to_user_id = me.StringField()
    influence = me.DictField()

    def to_dict(self):
        data = self.to_mongo()
        data['author'] = self.author.to_mongo().to_dict()
        data = data.to_dict()
        return data

    def to_json(self):
        data = self.to_mongo()
        data['author'] = {
            'created_at': self.author.created_at,
            'description': self.author.description,
            'location': self.author.location,
            'name': self.author.name,
            'username': self.author.username,
            'profile_image_url': self.author.profile_image_url,
            'metrics': json.loads(self.author.metrics.to_json()),
        }
        return bson.json_util.dumps(data)


class Report(me.Document):
    tweets = me.ListField(me.ReferenceField(Tweet))
