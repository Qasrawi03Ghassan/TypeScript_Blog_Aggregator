# Blog Aggregator

This project features an RSS feed aggregator CLI application built using TypeScript and Postgresql. It allows users to:  

* Add RSS feeds from across the internet to be collected.
* Store the collected posts in a PostgreSQL database.
* Follow and unfollow RSS feeds that other users have added.
* View summaries of the aggregated posts in the terminal, with a link to the full post.

RSS feeds are a way for websites to publish updates to their content. You can use this project to keep up with your favorite blogs, news sites, podcasts, and more!

# Prequisites

In order to use the project, make sure you have node and npm (version 22.15.0 or later)  

Also Postgresql is required and has a running server on the machine.

Then you must install required node packages by using the following command:  

```node
npm install
```

**IMPORTANT**: In order for the project to wrok successfully you need to create a config file in the **HOME** directory of the system, and it must be named `.gatorconfig.json` and has the following content:  

```json
{"db_url":"postgres://<db_username>:<db_password>@localhost:5432/<db_name>?sslmode=disable","current_user_name":""}
```

Change the `<db_username>`, `<db_password>` and `<db_name>` to the configured database.  

**Note**: The `db_url` can be any valid url to a postgres database, but if used on a local machine, it needs to follow the above convention.

# Usage

The overall syntax for the commands is:  

```
npm start <command> <args>
```

**Note**: Some commands require arguments while others don't.

The CLI contains multiple commands:  

1. `register <username>`: Registers a user to the system.  
2. `login <username>`: Logs a registered user to the CLI.
3. `reset`: Resets the whole database.
4. `users`: Lists users registered in the system and shows the current logged one.
5. `feeds`: Lists all previously added feeds.
6. `addfeed <feed_name> <feed_url>`: Adds a feed to the system. (User must be logged in)
7. `agg <time_between_reqs>`: Aggregates and scrapes the feeds storing posts in the database depending on time between requests which can be in millieseconds, seconds, minutes, or hours. (input example: `npm start agg 10s` ).
8. `follow <feed_url>`: Enables logged in user to follow a feed using it's url. (User must be logged in)
9. `following`: Lists all feeds the user follows. (User must be logged in)
10. `unfollow <feed_url>`: Enables logged in user to unfollow a previously followed feed. (User must be logged in)
11. `browse [limit]`: Lists details about posts of followed feeds for the current user, takes an optional `limit` argument that defines the number of shown posts (default is 2 posts).(User must be logged in)

---

Author: Ghassan Qasrawi  
Boot.dev handle: @ghassan-qasrawi ([Account link](https://www.boot.dev/u/ghassan-qasrawi))
