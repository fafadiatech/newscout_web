# this CLI tool is used to close sprint and generate release notes

import re
import json
import pathlib
import requests
from datetime import datetime, timedelta

DEBUG = False
CWD = pathlib.Path(__file__).parent.absolute()
config = json.loads(open(pathlib.PurePath(CWD).joinpath("config.json")).read())

headers = {
    "Accept": "application/vnd.github.inertia-preview+json",
    "Authorization": config["token"],
}

today = datetime.now()
sprint_ends_on = today + timedelta(days=14)


def fetch(url, headers, request_type, payload=None):
    """
    this function is used to make GET/POST request
    """
    if request_type == "GET":
        response = requests.get(url, headers=headers)
    else:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()


def get_projects(config, headers):
    URL = f"{config['host']}/repos/{config['repo']}/projects"
    return fetch(URL, headers, "GET")


def get_columns(headers, column_url):
    return fetch(column_url, headers, "GET")


def create_project(config, headers, project_name, project_description):
    URL = f"{config['host']}/repos/{config['repo']}/projects"
    payload = {"name": project_name, "body": project_description}
    return fetch(URL, headers, "POST", payload)


def get_sprint_no(name):
    sprint_no_regex = re.compile("Newscout\sWeb\:\sSprint\s\#\d+\s+")
    for current in sprint_no_regex.findall("Newscout Web: Sprint #5 30th April, 2020"):
        return int(current[current.find("#") + 1 :].strip())
    return 0


def get_next_sprint_name(sprint_no):
    return f"Newscout Web: Sprint #{sprint_no} {sprint_ends_on.date().strftime('%d %b %Y')}"


def get_sprint_description(sprint_no):
    return f"Sprint #{sprint_no} for Newscout, starting from {today.date().strftime('%d %b, %Y')} till {sprint_ends_on.date().strftime('%d %b %Y')}"


def create_new_columns(config, headers, project_id, columns):
    new_columns_info = {}
    new_col_url = f"{config['host']}/projects/{new_project_id}/columns"
    for i in range(len(columns)):
        payload = {"name": columns[i]}
        response = fetch(new_col_url, headers, "POST", payload)
        new_columns_info[response.get("name")] = response.get("id")
    return new_columns_info


if __name__ == "__main__":
    all_projects = get_projects(config, headers)
    active_projects = [
        project for project in all_projects if project["state"] == "open"
    ]

    sprint_no = get_sprint_no(active_projects[0].get("name"))
    # crash the script if we cannot parse current sprint no
    assert sprint_no != 0

    sprint_no += 1
    sprint_name = get_next_sprint_name(sprint_no)
    sprint_description = get_sprint_description(sprint_no)

    column_url = active_projects[0].get("columns_url")
    columns = get_columns(headers, column_url)

    response = create_project(config, headers, sprint_name, sprint_description)
    print(f"New Project Created with ID: {response['id']}")

    new_project_id = response['id']

    # create all columns in new project
    existing_colums = []
    existing_colums_to_cards_url = {}

    for i in range(len(columns)):
        existing_colums.append(columns[i].get("name"))
        existing_colums_to_cards_url[columns[i].get("name")] = columns[i].get(
            "cards_url"
        )
    new_columns_info = create_new_columns(
        config, headers, new_project_id, existing_colums
    )

    if DEBUG:
        print(new_columns_info)

    # query list of cards for all columns except
    existing_colums_to_cards = {}
    for current in existing_colums_to_cards_url:
        if current == "Done":
            continue

        existing_colums_to_cards[current] = fetch(
            existing_colums_to_cards_url[current], headers, "GET"
        )

    # copy all the necessary cards to columns
    for current in existing_colums_to_cards:
        if current == "Done":
            continue

        for issue in reversed(existing_colums_to_cards[current]):
            issue_id = int(issue.get("content_url").split("/")[-1])
            issue_response = fetch(issue.get("content_url"), headers, "GET")
            githubs_internal_issue_id = issue_response["id"]

            if DEBUG:
                print(current, issue_id, githubs_internal_issue_id)

            payload = {"content_id": githubs_internal_issue_id, "content_type": "Issue"}
            new_card_url = (
                f"{config['host']}/projects/columns/{new_columns_info[current]}/cards"
            )
            response = fetch(new_card_url, headers, "POST", payload)

    print("Completed Copying Cards")