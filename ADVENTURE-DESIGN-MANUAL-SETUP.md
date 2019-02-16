# Eamon - Manual Environment Setup

The file ADVENTURE-DESIGN.md contains instructions for the automated environment setup using Docker. If you can't use Docker or prefer to do a manual setup, follow the instructions here.

## Prerequisites

For the manual install, you'll need the following:

* Python v3.4 or higher
* Node.js v8.x or higher (10.x preferred)
* MySQL or MariaDB v5.6 or higher

The tools required to run Eamon are compatible with Linux, Windows 10, and OSX.

## Setup instructions

* Create a MySQL database called `eamon`
* Load the database from /db/db.sql.gz into MySQL, in the database `eamon`
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
    * If you're using PyCharm, you can skip this step and set up your development server inside PyCharm itself. This provides the ability to use step debugging in the Python code.
* Open a second command prompt and navigate to the "client" folder
* Install React and other JS packages using `npm install` or `yarn`
* Run `npm start` or `yarn start`
* Open your web browser and navigate to http://localhost:8000. You should see the Eamon welcome screen. 

URLs: 
Eamon home page: http://localhost:8000
Admin page (for building adventure data): http://localhost:8000/admin
To log into the admin, use the username and password you used when you ran the "createsuperuser" command above.

### Running the unit tests

* Run `npm start` as above
* In your browser, open a new tab and enter the address 'http://localhost:3000/static/unit_tests.html'
