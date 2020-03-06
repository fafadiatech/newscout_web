import os
from getpass import getpass
from psycopg2 import connect
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT  # <-- ADD THIS LINE

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'This command is used to load sample datatbase into postgres'

    def handle(self, *args, **options):
        data_dir = "static/db"
        dbname = "newscout_web"
        db_path = data_dir + "/newscout.sql"
        os.system("tar -xvzf static/db/newscout.tar.gz -C static/db/")
        if not os.path.isdir(data_dir):
            print("nothing to do. data dir is missing..")
            exit()
        elif not os.path.isfile(db_path):
            print("nothing to do. sql dump file is missing..")
            exit()

        print("Please enter postgres username and password")
        user_name = input("Username:")
        password = getpass("Password:")
        conn = connect(f"user='{user_name}' \
            host='localhost' password='{password}'")
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)  # <-- ADD THIS LINE
        cursor = conn.cursor()
        cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
        data_bases = cursor.fetchall()
        data_bases = [name[0] for name in data_bases]
        if dbname not in data_bases:
            cursor.execute(f"create database {dbname};")
            print(f"creating database {dbname}")
        conn.close()
        os.system(f'psql -U postgres {dbname} < {db_path}')
        os.system(f"rm {db_path}")
