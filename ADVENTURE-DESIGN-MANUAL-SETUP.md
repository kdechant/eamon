# Eamon - Manual Environment Setup

The file ADVENTURE-DESIGN.md contains instructions for the automated environment setup using Docker. That method is recommended because it's easier.

If you can't use Docker or prefer to do a manual setup, follow the instructions here.

## Prerequisites

For the manual install, you'll need the following:

* Python v3.4 or higher
* Node.js v6.x or higher (v7.x recommended)
* MySQL or MariaDB v5.6 or higher

The tools required to run Eamon are compatible with Linux, Windows 10, and OSX.

## Setup instructions

* Create a MySQL database called `eamon`
* Load the database from /db.db.sql.gz into MySQL, in the database `eamon`
* Make sure the database user and password in eamon/settings.py match something that works on your system
* Open a command prompt and navigate to the repository root
* Install pipenv: `pip install pipenv`
* Install the packages: `pipenv install`
* If running Windows, and you see an error while installing mysqlclient:
    * Download the MySQL wheel for your version of Windows and Python from https://www.lfd.uci.edu/~gohlke/pythonlibs/
    * Install the wheel file manually with `pipenv run pip install ... `
    * e.g., `pipenv run pip install .\packages\mysqlclient-1.3.13-cp37-cp37m-win_amd64.whl`
* Activate the pipenv shell with `pipenv shell` 
* Create a user for the admin: `python manage.py createsuperuser`
* Run `python manage.py runserver`
    * If you're using PyCharm, skip this step and set up your development server inside PyCharm itself. It makes life a bit easier.
* Open a second command prompt and navigate to the "static" folder
* Install Angular and other JS packages using `npm install`
* Compile the TypeScript into JavaScript by running `node_modules/typescript/bin/tsc`
* Run `npm start`
    * If your source code editor doesn't support TypeScript, you'll need to run `npm start-all` instead. This will automatically transpile TypeScript into JavaScript when you save any .ts file.
* A browser window will pop up, showing the home screen

URLs: 
Eamon home page: http://localhost:3000
Admin page (for building adventure data): http://localhost:3000/admin
To log into the admin, use the username and password you used when you ran the "createsuperuser" command above.

### Running the unit tests

* Run `npm start` as above
* In your browser, open a new tab and enter the address 'http://localhost:3000/static/unit_tests.html'
