Example server side with Python with Django for w2ui grid.

This library provide a project with Django with the main app that serve simply request of w2ui grid component.
NB Tested with Django 1.5.

To test this library just make a virtaul env:
virtualenv env_w2ui

Then active it:
./env_w2ui/bin/activate

Then at the same level of the virtual env clone this repository:
git clone https://github.com/FilippoBenassutiCDM/w2ui.git

Install into the virtual env Django (tested with the 1.5 version):
pip install django==1.5

At this point we have an enviroment with django project and the project ready to start.
Go to the directory of django_w2ui (cd w2ui/server/python/django_w2ui) NB w2ui is the folder made with the git clone.
At this location start django:
python manage.py runserver

Now Development server is running at http://127.0.0.1:8000/

PS.For more detail about Django project go to:
https://www.djangoproject.com/

for more information about installation and configuration follow the tutorial:
https://docs.djangoproject.com/en/stable/intro/install/

Information about Django_w2ui project

- This demo project works with sqlite3 database
- Provide backend for w2ui grid and w2ui form
- Is available only the versione for data loaded server side.


Features

Django_w2ui, plugins provide 2 class/view: W2uiGridView,W2uiFormView

A class that handle w2uiGrid component:
W2uiGridView

This class/view handle the following actions:
- get-records
- save-records
- delete-records

And provide backend for:
- sorting
- search

A class/view that handle w2uiform component:
W2uiFormView

This class handle the following actions:
- get-record
- save-record

Example

To use those views just create your view that describe the table and fields to use:

class UsersW2uiGridView(W2uiGridView):
    model = Users
    fields = (
            "fname",
            "lname",
            "email",
            "login",
            "password",
            "date_birthday",
            "date_registration",
            "importo_registrato",
            "text",
            "timestamp"
    )

class UsersW2uiFormView(W2uiFormView):
    model = Users
    fields = (
            "fname",
            "lname",
            "email",
            "login",
            "password",
            "date_birthday",
            "date_registration",
            "importo_registrato",
            "text",
            "timestamp"
    )




Contributing
Django_w2ui is open-source and very open to contributions.


This app for django + w2ui is powered by:
Benassuti Filippo (alias FilippoBenassutiCDM on github) with the collaboration of Antonio Galea (alias  on github).

