# The Wonderful World of Eamon

This is a port of the classic Eamon adventure system to run on the web.

Play it at http://eamon.terranok.com. The main hall and several adventures have been ported so far, with more on the way!

Eamon is a text adventure game with basic RPG features. It is notable for its modular adventure system, which allows authors to write their own adventures using a database editor program and a bit of custom programming.

The original Eamon was written by Donald Brown and released around 1980 for the Apple 2. Over 250 adventures were subsequently released. Eamon was ported to MS-DOS as Eamon Deluxe by Frank Black beginning in the 1990s. That work is the basis for this rewrite.

## For Developers

This project is not really a port, so much as it is a complete rewrite using the most modern web technologies. When Eamon was originally written, BASIC was the one of the most widely-used languages. These days, BASIC has fallen out of favor and it's time to convert it to a new language. And, for the best user experience, it should run in a browser instead of requiring an emulator. For these reasons, it made sense to convert the game logic to JavaScript. Specifically, Angular 2 with TypeScript, and a Django back-end to store the player and adventure data.

The main program was redesigned, as well. No longer do adventure authors hack the main program to add special effects. The game is built on a system of event handlers. All adventures use the same shared main program code. Each adventure has its own set of event handlers, such as "read" to activate a special effect when the player reads a book, and "use" to run a special effect when the player drinks a potion. Each adventure can also declare custom commands. Both the commands and the event handlers are easy-to-write JavaScript functions.

True to the original Eamon, this is non-commercial software. You can freely view the source code, including the logic for the adventures. Warning: spoilers!

**Authors wanted!** If you want to help port your favorite adventure into the new system, drop me a line and I can guide you through the process. Knowledge of JavaScript and a familiarity with the original system or Eamon Deluxe is all you need. Send adventurers to their deaths for fun and profit!

## How to get started developing

You need Python 3.5 or higher and a recent version of NodeJS installed.

* Open a command prompt and navigate to the repository root
* Create a virtual environment using `virtualenv venv`
* Install Python packages using `pip install -r requirements.txt`
* Run `python manage.py runserver`
* Open another command prompt and navigate to the "static" folder
* Install Angular and other JS packages using `npm install`
* Run `npm start`
* A browser window will pop up, showing the home screen

## How to run the unit tests

* Run `npm start` as above
* In your browser, open a new tab and enter the address 'http://localhost:3000/unit_tests.html'
