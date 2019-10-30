# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import random

from django.db import models
from django.core.validators import URLValidator
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class NewsSiteBaseModel(models.Model):
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Created At")
    modified_at = models.DateTimeField(
        auto_now=True, verbose_name="Last Modified At")

    class Meta:
        abstract = True


class Domain(NewsSiteBaseModel):
    domain_name = models.CharField(max_length=255, blank=True, null=True)
    domain_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Domain"

    def __str__(self):
        return self.domain_name

    def __unicode__(self):
        return self.domain_name


class Category(NewsSiteBaseModel):
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class CategoryAssociation(models.Model):
    """
    category and subcategory association
    """
    parent_cat = models.ForeignKey(
        Category, related_name='parent_category', on_delete=models.CASCADE)
    child_cat = models.ForeignKey(
        Category, related_name='child_category', on_delete=models.CASCADE)

    def __unicode__(self):
        return "%s > %s " % (self.parent_cat.name, self.child_cat.name)


class CategoryDefaultImage(models.Model):
    """
    this is used to assign default image
    based on a random selection for a given category
    """
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    default_image_url = models.URLField()

    @classmethod
    def get_default_image(self, category):
        options = CategoryDefaultImage.objects.filter(category=category)
        if len(options) == 0:
            current = CategoryDefaultImage.objects.order_by('?').first()
        else:
            current = random.choice(options)
        return current.default_image_url

    def __unicode__(self):
        return "%s -> %s" % (self.category, self.default_image_url)


class Source(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    active = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def __unicode__(self):
        return self.name


class HashTag(models.Model):
    name = models.CharField(max_length=255)

    def __unicode__(self):
        return self.name


class BaseUserProfile(AbstractUser):
    passion = models.ManyToManyField(HashTag, blank=True)

    def __unicode__(self):
        return "%s > %s" % (self.email, self.passion.all())


class TrendingHashTag(models.Model):
    name = models.CharField(max_length=255)

    def __unicode__(self):
        return self.name


class Article(NewsSiteBaseModel):
    domain = models.ForeignKey(
        Domain, blank=True, null=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=600)
    source = models.ForeignKey(
        Source, on_delete=models.CASCADE)
    category = models.ForeignKey(
        Category, blank=True, null=True, on_delete=models.CASCADE)
    hash_tags = models.ManyToManyField(
        HashTag, blank=True, default=None)
    source_url = models.TextField(validators=[URLValidator()])
    cover_image = models.TextField(validators=[URLValidator()])
    blurb = models.TextField(blank=True, null=True)
    full_text = models.TextField()
    published_on = models.DateTimeField()
    active = models.BooleanField(default=False)
    hot = models.BooleanField(default=False)
    popular = models.BooleanField(default=False)
    avg_rating = models.FloatField(blank=True, null=True)
    view_count = models.FloatField(blank=True, null=True)
    rating_count = models.FloatField(blank=True, null=True)
    manually_edit = models.BooleanField(default=False)
    edited_by = models.ForeignKey(
        BaseUserProfile, blank=True, null=True, on_delete=models.CASCADE)
    edited_on = models.DateTimeField(auto_now=True)
    indexed_on = models.DateTimeField(default=timezone.now)
    spam = models.BooleanField(default=False)

    def __unicode__(self):
        return '{} - {} - {} - {} -{}\n'.format(self.id,self.title, self.published_on, self.source, self.hash_tags)


class ArticleMedia(NewsSiteBaseModel):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    category = models.CharField(max_length=255)
    url = models.TextField(validators=[URLValidator()], blank=True, null=True)
    video_url = models.TextField(validators=[URLValidator()], blank=True, null=True)

    def __unicode__(self):
        return "%s > %s" % (self.article, self.category)


# TODO: add reference to User model
class ArticleRating(NewsSiteBaseModel):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    rating = models.FloatField()

    def __unicode__(self):
        return "%s -> %s" % (self.article, self.rating)


class RelatedArticle(NewsSiteBaseModel):
    source = models.ForeignKey(
        Article, related_name="source_article", on_delete=models.CASCADE)
    related = models.ForeignKey(
        Article, related_name="related_article", on_delete=models.CASCADE)
    score = models.FloatField()

    def __unicode__(self):
        return "%s -> %s" % (self.source, self.related)

# TODO: Implement both a Generic {Trending Based} feed generation artcle
# or a Personalized one based on ArticleRating


class ArtilcleLike(NewsSiteBaseModel):
    user = models.ForeignKey(BaseUserProfile, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    is_like = models.PositiveSmallIntegerField(default=2)

    def __unicode__(self):
        return "%s -> %s" % (self.user.email, self.is_like)


class BookmarkArticle(NewsSiteBaseModel):
    user = models.ForeignKey(BaseUserProfile, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)

    def __unicode__(self):
        return "%s -> %s" % (self.user.email, self.article.id)


class SubMenu(models.Model):
    name = models.ForeignKey(Category, on_delete=models.CASCADE)
    hash_tags = models.ManyToManyField(HashTag)

    def __unicode__(self):
        return self.name.name

    def __str__(self):
        return self.name.name


class Menu(models.Model):
    domain = models.ForeignKey(
        Domain, blank=True, null=True, on_delete=models.CASCADE)
    name = models.ForeignKey(Category, on_delete=models.CASCADE)
    submenu = models.ManyToManyField(SubMenu)

    def __unicode__(self):
        return self.name.name

    def __str__(self):
        return self.name.name


class Devices(models.Model):
    device_name = models.CharField(max_length=255, blank=True, null=True)
    device_id = models.CharField(max_length=255, blank=True, null=True)
    user = models.ForeignKey(
        BaseUserProfile, blank=True, null=True, on_delete=models.CASCADE)

    def __unicode__(self):
        return "device_id = {}, device_name = {}".format(self.device_id, self.device_name)


class Notification(models.Model):
    breaking_news = models.BooleanField(default=False)
    daily_edition = models.BooleanField(default=False)
    personalized  = models.BooleanField(default=False)
    device = models.ForeignKey(Devices, on_delete=models.CASCADE)

    def __unicode__(self):
        return "breaking_news={}, daily_edition={}, personalized={}".format(self.breaking_news, self.daily_edition, self.personalized)


class SocialAccount(models.Model):
    """
    this model is used to store social account details
    """
    provider = models.CharField(max_length=200)
    social_account_id = models.CharField(max_length=200)
    image_url = models.CharField(max_length=250, blank=True, null=True)
    user = models.ForeignKey(BaseUserProfile, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Social Accounts"

    def __str__(self):
        return "{0} {1}".format(self.user, self.social_account_id)


class Feed:
    pass

class ScoutFrontier(models.Model):
    """
    this model is used for sourcing new articles at
    higher frequency
    """
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    url = models.URLField(default="http://nowhe.re")

    def __str__(self):
        return "%s -> %s" % (self.category, self.url)

    def __unicode__(self):
        return "%s -> %s" % (self.category, self.url)


class ScoutedItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    url = models.URLField(default="http://nowhe.re")

    def __str__(self):
        return "%s -> %s" % (self.category, self.title)

    def __unicode__(self):
        return "%s -> %s" % (self.category, self.title)


class TrendingArticle(NewsSiteBaseModel):
    """
    this model is used to store trending article cluster
    """
    domain = models.ForeignKey(
        Domain, blank=True, null=True, on_delete=models.CASCADE)
    articles = models.ManyToManyField(Article)
    active = models.BooleanField(default=True)
    score = models.FloatField(default=0.0)

    def __str__(self):
        return self.articles.first().title

    def __unicode__(self):
        return self.articles.first().title


class Campaign(NewsSiteBaseModel):
    """
    this model is used to store advertisement campaign
    """
    name = models.CharField(max_length=160)
    is_active = models.BooleanField(default=True)
    daily_budget = models.DecimalField(blank=True, null=True, decimal_places=2, max_digits=8)
    max_bid = models.DecimalField(blank=True, null=True, decimal_places=2, max_digits=8)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.is_active:
            groups = AdGroup.objects.filter(campaign=self)
            groups.update(is_active=False)
        super(Campaign, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.name


class AdGroup(NewsSiteBaseModel):
    category = models.ManyToManyField(Category)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.is_active:
            ads = Advertisement.objects.filter(addgroup=self)
            ads.update(is_active=False)
        super(AdGroup, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.campaign.name


class AdType(NewsSiteBaseModel):
    type = models.CharField(max_length=100)

    def __unicode__(self):
        return self.type

class Advertisement(NewsSiteBaseModel):
    adgroup = models.ForeignKey(AdGroup, on_delete=models.CASCADE)
    ad_type = models.ForeignKey(AdType, on_delete=models.CASCADE)
    ad_text = models.CharField(max_length=160)
    ad_url = models.URLField()
    media = models.ImageField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    impsn_limit = models.IntegerField(default=0)
    delivered = models.IntegerField(default=0)
    click_count = models.IntegerField(default=0)

    def __unicode__(self):
        return "{0} - {1} - {2}".format(self.addgroup.campaign.name, self.ad_type.type, self.is_active)


class DailyDigest(NewsSiteBaseModel):
    device = models.ForeignKey(Devices, on_delete=models.CASCADE)
    articles = models.ManyToManyField(Article)

    def __unicode__(self):
        return self.device
