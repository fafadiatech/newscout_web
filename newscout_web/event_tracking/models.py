# -*- coding: utf-8 -*-

from datetime import datetime, timedelta
from django.utils.timezone import now
from django.conf import settings


class MongoDBModel:
    def encode_object_id_to_string(self, rec):
        rec["_id"] = str(rec["_id"])
        return rec

    def add(self, rec):
        """
        avoid adding duplicates while adding
        """
        rec['ts'] = datetime.now()
        self.collection.insert_one(rec)

    def find(self, filter_criteria):
        return list(self.collection.find(filter_criteria))

    def list_all(self):
        return map(self.encode_object_id_to_string, list(self.collection.find()))

    def count(self):
        return self.collection.find().count()


class Event(MongoDBModel):
    def __init__(self):
        self.collection = settings.DB['events']

    def filtered_events(self, start, end):
        return self.collection.find({'ts': {'$gte': start, '$lte': end}})

    def filtered_events_by_role(self, start, end, role):
        return self.collection.find({'ts': {'$gte': start, '$lte': end}, 'user_type': role})

    def get_activity_log(self, case_id, role="all"):
        """
        this method is used to get activities associated with given case id
        """
        results = []

        if role == 'all':
            constraints = {'action': {'$in': ['patent_view', 'case_view']}}
        else:
            constraints = {'action': {'$in': ['patent_view', 'case_view']}, 'user_type': role}

        for current in self.collection.find(constraints):
            if 'case_view' in current and (current['case_view'] == case_id or current.get('xc_case_id', '') == case_id):
                del current['_id']
                results.append(current)
            elif 'case_id' in current and (current['case_id'] == case_id or current.get('xc_case_id', '') == case_id):
                del current['_id']
                results.append(current)
            else:
                continue
        return results

    def get_trending_case_ids(self, epoch=24):
        """
        this method is used to get list of unique xc_case_ids
        that have been generated in past `epoch` hours
        """
        case_ids = {}
        end = now()
        start = end - timedelta(hours=epoch)
        for event in self.find({'ts': {'$gte': start, '$lte':end}}):
            if 'xc_case_id' in event and event['xc_case_id'] not in case_ids:
                case_ids[event['xc_case_id']] = 0
        return list(case_ids.keys())

    def get_activity_stats(self, case_id):
        events = self.get_activity_log(case_id)
        results = {"attorney_event_counts": 0, "expert_event_counts":0, "attorney_latest_ts": None, "expert_latest_ts": None }

        for current in events:
            if 'user_type' in current:
                if current['user_type'] == 'attorney':
                    results['attorney_event_counts'] += 1
                    if results['attorney_latest_ts'] is None or results['attorney_latest_ts'] < current['ts']:
                        results['attorney_latest_ts'] = current['ts']
                else:
                    results['expert_event_counts'] += 1
                    if results['expert_latest_ts'] is None or results['expert_latest_ts'] < current['ts']:
                        results['expert_latest_ts'] = current['ts']
        return results
