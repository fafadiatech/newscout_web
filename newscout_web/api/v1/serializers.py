from rest_framework import serializers
from core.models import (Category, Article, BaseUserProfile, Source, BookmarkArticle,
                         ArticleLike, HashTag, ArticleMedia, Menu, SubMenu,
                         Devices, Notification, TrendingArticle, DraftMedia, Comment,
                         CategoryAssociation)
from django.contrib.auth import authenticate
from rest_framework import exceptions
from rest_framework.validators import UniqueValidator
from rest_framework.authtoken.models import Token


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ('name', 'id')


class HashTagSerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(default=1)

    class Meta:
        model = HashTag
        fields = ('id', 'name', 'count')


class ArticleMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleMedia
        fields = '__all__'


class ArticleSerializer(serializers.ModelSerializer):
    article_media = ArticleMediaSerializer(source='articlemedia_set', many=True)
    is_book_mark = serializers.ReadOnlyField()
    isLike = serializers.ReadOnlyField()

    class Meta:
        model = Article
        fields = ('id', 'title', 'source', 'category', 'hash_tags', 'source_url', 'cover_image', 'blurb',
                  'published_on', 'is_book_mark', 'isLike', 'article_media', 'category_id', 'domain', 'active',
                  'source_id', 'article_format', 'author', 'slug', 'root_category', 'root_category_id')

    source = serializers.ReadOnlyField(source='source.name')
    category = serializers.ReadOnlyField(source='category.name')
    category_id = serializers.ReadOnlyField(source='category.id')
    source_id = serializers.ReadOnlyField(source='source.id')
    domain = serializers.ReadOnlyField(source='domain.domain_id')
    root_category = serializers.SerializerMethodField()
    root_category_id = serializers.SerializerMethodField()
    hash_tags = HashTagSerializer(many=True)
    author = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        super(ArticleSerializer, self).__init__(*args, **kwargs)
        if self.context.get("hash_tags_list"):
            self.fields["hash_tags"] = serializers.SerializerMethodField()

    def get_hash_tags(self, instance):
        return list(instance.hash_tags.all().values_list("name", flat=True))

    def get_author(self, instance):
        if instance.author:
            return "{0} {1}".format(
                instance.author.first_name, instance.author.last_name)
        return ""

    def get_root_category(self, instance):
        if instance.category.name not in ["Uncategorised", "Uncategorized"]:
            root_category = CategoryAssociation.objects.get(child_cat=instance.category)
            return root_category.parent_cat.name
        return instance.category.name

    def get_root_category_id(self, instance):
        if instance.category.name not in ["Uncategorised", "Uncategorized"]:
            root_category = CategoryAssociation.objects.get(child_cat=instance.category)
            return root_category.parent_cat_id
        return instance.category.id


class UserSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=200, required=True, validators=[
        UniqueValidator(queryset=BaseUserProfile.objects.all(),
                        message="User with this email already exist")],)
    password = serializers.CharField(max_length=200, required=True)
    first_name = serializers.CharField(max_length=200, required=True)
    last_name = serializers.CharField(max_length=200, required=True)

    def create(self, validated_data):
        user = BaseUserProfile(**validated_data)
        user.set_password(validated_data["password"])
        user.username = validated_data["email"]
        user.save()
        token, _ = Token.objects.get_or_create(user=user)
        return user


class LoginUserSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(request=None, username=data["email"], password=data["password"])
        if user:
            return user
        raise exceptions.AuthenticationFailed('User inactive or deleted')


class BaseUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseUserProfile
        fields = ('id', 'passion', 'first_name', 'last_name')

    passion = CategorySerializer(many=True)


class BookmarkArticleSerializer(serializers.ModelSerializer):
    status = serializers.IntegerField(default=1)
    article = ArticleSerializer()

    class Meta:
        model = BookmarkArticle
        fields = ('id', 'article', 'status')


class ArticleLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleLike
        fields = ('id', 'article', 'user', 'is_like')

    def create(self, validated_data):
        article_obj = validated_data.get("article", "")
        user = validated_data.get("user", "")
        if not article_obj:
            raise serializers.ValidationError("Article does not exist")
        if not user:
            raise serializers.ValidationError("User not logged in")
        article_like = ArticleLike.objects.filter(article=article_obj, user=user)
        if not article_like:
            like_obj = ArticleLike.objects.create(article=article_obj, user=user)
            return like_obj
        ArticleLike.objects.filter(article=article_obj, user=user).delete()
        return {"article": article_obj, "user": user}


class SubMenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubMenu
        fields = ('name', 'category_id', 'hash_tags', 'icon')

    hash_tags = HashTagSerializer(many=True)
    name = serializers.SerializerMethodField()
    category_id = serializers.SerializerMethodField()

    def get_name(self, instance):
        return instance.name.name

    def get_category_id(self, instance):
        return instance.name.id


class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = ('name', 'category_id', 'submenu', 'icon')

    name = serializers.SerializerMethodField()
    category_id = serializers.SerializerMethodField()
    submenu = SubMenuSerializer(many=True)

    def get_name(self, instance):
        return instance.name.name

    def get_category_id(self, instance):
        return instance.name.id


class DevicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Devices
        fields = ('device_name',)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('breaking_news', 'daily_edition', 'personalized',)


class TrendingArticleSerializer(serializers.ModelSerializer):
    articles = ArticleSerializer(read_only=True, many=True, context={"hash_tags_list": True})
    domain = serializers.ReadOnlyField(source='domain.domain_id')

    class Meta:
        model = TrendingArticle
        fields = '__all__'


class ArticleCreateUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Article
        fields = ('title', 'source', 'category', 'source_url',
                  'cover_image', 'blurb', 'published_on', 'spam', 'domain')

    def to_internal_value(self, data):
        internal_value = super(ArticleCreateUpdateSerializer, self).to_internal_value(data)
        hash_tags = data.get("hash_tags")
        article_media = data.get("article_media")
        internal_value.update({
            "hash_tags": hash_tags,
            "article_media": article_media
        })
        return internal_value

    def get_source_url(self, article_id):
        url = "http://www.newscout.in/news/article/{0}/".format(article_id)
        return url

    def create(self, validated_data):
        hash_tags = validated_data.pop("hash_tags")
        article_media = validated_data.pop("article_media")
        article = Article.objects.create(**validated_data)
        user = self.context.get("user")

        if not article.domain:
            article.domain = user.domain
            article.save()

        if hash_tags:
            hash_tags = [HashTag.objects.get_or_create(name=name)[0] for name in hash_tags]
            article.hash_tags.add(*hash_tags)
            article.save()

        if article_media:
            article_media = [ArticleMedia.objects.create(
                article=article,
                category=am["category"],
                url=am["url"],
                video_url=am["video_url"]
            ) for am in article_media]

        article.author = user
        article.save()

        article.source_url = self.get_source_url(article.id)
        article.save()

        if self.context.get("publish"):
            article.active = True
            article.save()

        return article

    def update(self, instance, validated_data):
        hash_tags = validated_data.pop("hash_tags")
        article_media = validated_data.pop("article_media")
        user = self.context.get("user")
        instance.title = validated_data.get("title", instance.title)
        instance.source = validated_data.get("source", instance.source)
        instance.category = validated_data.get("category", instance.category)
        instance.domain = validated_data.get("domain", instance.domain)
        instance.source_url = validated_data.get("source_url", instance.source_url)
        instance.cover_image = validated_data.get("cover_image", instance.cover_image)
        instance.blurb = validated_data.get("blurb", instance.blurb)
        instance.published_on = validated_data.get("published_on", instance.published_on)
        instance.spam = validated_data.get("spam", instance.spam)
        instance.save()

        if not instance.domain:
            instance.domain = user.domain
            instance.save()

        if hash_tags:
            hash_tags = [HashTag.objects.get_or_create(name=name)[0] for name in hash_tags]
            instance.hash_tags.clear()
            instance.hash_tags.add(*hash_tags)
            instance.save()

        if article_media:
            article_media = [ArticleMedia.objects.get_or_create(
                article=instance,
                category=am["category"],
                url=am["url"],
                video_url=am["video_url"]
            )[0] for am in article_media]

        if self.context.get("publish"):
            instance.active = True
            instance.save()

        return instance


class DraftMediaSerializer(serializers.ModelSerializer):
    """
    serializer for draftmedia model
    """
    class Meta:
        model = DraftMedia
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    article_id = serializers.IntegerField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "created_at",
            "comment",
            "article_id",
            "user",
            "user_name",
            "reply",
            "replies"
        )

    def create(self, validated_data):
        article_id = validated_data.get("article_id", "")
        comment = validated_data.get("comment", "")
        user = validated_data.get("user", "")
        reply = validated_data.get("reply", "")
        if not article_id:
            raise serializers.ValidationError("Article Id not entered")
        if not comment:
            raise serializers.ValidationError("Comment not entered")
        if not user:
            raise serializers.ValidationError("User is not logged in")
        article_obj = Article.objects.filter(id=article_id).first()
        if not article_obj:
            raise serializers.ValidationError("Article does not exist")
        if reply:
            if reply.article.id == article_id:
                comment_reply_obj = Comment.objects.create(article=article_obj, comment=comment,
                                                           user=user, reply=reply)
                return comment_reply_obj
            raise serializers.ValidationError("Replying on wrong article")
        comment_obj = Comment.objects.create(article=article_obj, comment=comment, user=user)
        return comment_obj

    def get_user_name(self, instance):
        user_name = instance.user.first_name + " " + instance.user.last_name
        return user_name

    def get_replies(self, instance):
        replies = []
        comment_reply_qs = Comment.objects.filter(reply=instance.id).values().order_by("-id")
        for reply in comment_reply_qs:
            reply_data = CommentListSerializer(reply).data
            replies.append(reply_data)
        return replies


class CommentListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "created_at",
            "comment",
            "article_id",
            "user_id",
            "user_name",
            "replies"
        )

    def get_user_name(self, instance):
        user_obj = BaseUserProfile.objects.get(id=instance["user_id"])
        user_name = user_obj.first_name + " " + user_obj.last_name
        return user_name

    def get_replies(self, instance):
        replies = []
        comment_reply = Comment.objects.filter(reply=instance["id"]).values().order_by("-id")
        for reply in comment_reply:
            replies.append(CommentListSerializer(reply).data)
        return replies
