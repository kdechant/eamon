#!/usr/bin/env bash

# DB import script used with docker container
# This requires that the docker container named "db" is running

read -p "This will erase the data in your database and reload the original DB. Continue? [y/N]" yn

if test "$yn" = "y"; then
    gunzip -c ./db/db.sql.gz > ./db/db.sql
    mysql --host=127.0.0.1 --port=13306 -u root -ptrollsfire eamon < ./db/db.sql
    echo "Database imported!"
else
    echo "Canceled."
fi
