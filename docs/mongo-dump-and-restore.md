# MongoDB dump and restore

    docker run --rm --link nightscout_database_1:db_to_dump --volume $(pwd)/dbdump:/dbdump mongo:2.6.11 mongodump --host db_to_dump --out /dbdump
    docker run --rm --link nightscout_database_1:db_to_restore --volume $(pwd)/dbdump:/dbdump mongo:2.6.11 mongorestore --host db_to_restore /dbdump
