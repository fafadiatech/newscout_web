Analytics
=========

Overview
````````

Analytics is one of the key features, in NewScout following Analytics are available

1. `Editorial`: Anything to do with content falls into this group
2. `Engagement`: How users interact with content is captured into this group of analytics
3. `Monetization`: Advertising and Money related analytics fall into this category

Event Tracking
``````````````

NewScout has a built-in pixel tracker, that will allow to track parameters. These events are then stored in MongoDB.

Key Entities
`````````````

Following entities are important to consider when creating Analytics

1. `Article`: News-item that is getting published
2. `Interaction`: Any action that a user can perform. E.g. Swipe, Detail View and Open Original Article
3. `Platform`: Web, Android and iOS are example of where interaction has happened. This is what we reffed to as Platform
4. `Session`: Sequence of Interactions happening in duration of 15 mins
5. `Category`: Classification to which an Article belongs to
6. `Source`: Origin of Article {E.g. Reuters, PTI}
7. `Author(s)`: Creators of Article
8. `Campaign, Ad Group and Advertisement`: These are entities relating to advertising, they are of importance in `Monetization`

Metric Types
````````````

While defining analytics, we can classify them into one of the following categories

1. `COUNT`: Aggregate Number/Count. Note: These get computed and stored on `Daily Basis`
2. `TS`: Time series - Counts vs Time. Granularity can be either Daily, Weekly, Monthly or Quarterly. Line Chart(s) vs Time.
3. `BAR`: Barchart - This can be used to show Count vs Attribute. Granularity can be either Daily, Weekly, Monthly or Quarterly
4. `TABLE`: Table - This is simple table with usually Attribute and Count. (E.g. Count of Article View in a Time Frame)

Editorial
`````````

Editorial analytics are used to make content related decisions, it gives key information for making editorial decisions. Following is how we're organizing Editorial analytics

1. Overview
    1. [COUNT] Views: Count of all article opens (on ALL platforms)
    2. [COUNT] Avg. Read Time: Read Time all `Sessions` / Total # of `Sessions`
    3. [COUNT] Avg. Articles / Session: # Count of Articles Read in `Sessions` / Total # of `Sessions`
    4. [COUNT] Avg. Interactions / Session
    5. [COUNT] Avg. Articles / Platform
    6. [COUNT] Avg. Interactions / Platform
    7. [COUNT] Ratio of New vs. Repeating Visitors
    8. [COUNT] Avg. Articles / Category
    9. [COUNT] Avg. Interactions / Category
    10. [COUNT] Avg. Articles / Authors
    11. [COUNT] Avg. Interactions / Authors
2. Distributions
    1. [BAR] Distribution of Source vs Time
    2. [BAR] Distribution of Content Formats {Short, Medium and Large}
    3. [BAR] Distribution of Content Categories
3. Top and Bottom
    1. [TABLE] Articles
    2. [TABLE] Authors

Engagement
``````````

1. Performance
    1. [TS] Distribution of Engagement vs Time
        1. {New Stories, 1 Week to 6 months, Evergreen}
    2. [TS] Social Media Performance
    3. [BAR] Platforms {Web, iOS and Android}
2. [TABLE] Top Landing vs Exits Pages

Monetization
`````````````

Anything to do with Money will fall into this bucket, for this we will compute the following:

1. Subscriptions
    1. [COUNT] Subscriptions, Renewals & Cancellations / Month
2. Ads
    1. [COUNT] Impressions vs Served
    2. [COUNT] Avg. Click Through Rates
    3. [TABLE] Top and Bottom Performing Campaigns
    4. [TABLE] Inventory by Zones/Slots
        1. Scrolls
        2. More Stories
        3. Side Bar Navigation
        4. App Returns