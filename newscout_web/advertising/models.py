# -*- coding: utf-8 -*-

from django.db import models
from core.models import NewsSiteBaseModel, Category, Domain


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
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.is_active:
            groups = AdGroup.objects.filter(campaign=self)
            groups.update(is_active=False)
        super(Campaign, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.name
    
    def __str__(self):
        return self.name


class AdGroup(NewsSiteBaseModel):
    category = models.ManyToManyField(Category)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.is_active:
            ads = Advertisement.objects.filter(adgroup=self)
            ads.update(is_active=False)
        super(AdGroup, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.campaign.name
    
    def __str__(self):
        return self.campaign.name


class AdType(NewsSiteBaseModel):
    type = models.CharField(max_length=100)

    def __unicode__(self):
        return self.type
    
    def __str__(self):
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
        return "{0} - {1} - {2}".format(self.adgroup.campaign.name, self.ad_type.type, self.is_active)
    
    def __str__(self):
        return "{0} - {1} - {2}".format(self.adgroup.campaign.name, self.ad_type.type, self.is_active)
