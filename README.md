# SAPUI5 Calendar App

![SAPUI5 Calendar App view](/media/app-view.png)

## Description

A SAPUI5 Calendar app *(probably)* ready to be inserted into your system

## Features

- 12-month view (doesn't support phones)
- Dark/light theme switch
- Highlighting for Russian holidays (Provided by <http://xmlcalendar.ru>)
- Interval selection
- Ability to add selection to a vacation table following [certain ruleset](#vacation-table-ruleset) as well as delete it

### Vacation table ruleset

In order to add selected date range to a vacation table, certain rules must be followed:

- There can be no more than 4 vacations added to the table
- At least one of added vacations must be 14 days long or longer
- Total used days must be less or equal to 28 (w/o counting the holidays)
- Vacations cannot overlap with each other

If any of the preceding rules is not met, the vacation will not be added to the table and alerting dialog window will be shown.

## Starting the app

**Pre-requisites:**

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See <https://nodejs.org>)
2. SAPUI5 SDK or Runtime (See <https://tools.hana.ondemand.com/#sapui5>)

In order to launch the app, simply run the following from the app root folder:

```shell
    npm start
```

Running the start command will open the SAP Fiori Launchpad view of the app. In order to see the "standalone" view, head to `/index.html` or run:

```shell
    npm run start-noflp
```

To see all launch options, run the following command or check out `package.json`.

```shell
    npm run
```
