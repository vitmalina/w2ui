from bottle import route, post, static_file, request, run
from php_querystring import php_querystring
from w2lib import w2Grid
import sqlite3, json

conn = sqlite3.connect(':memory:')
def setup_database():
  conn.execute("""
    CREATE TABLE users (
      userid integer SERIAL PRIMARY KEY,
      fname varchar(50) DEFAULT NULL,
      lname varchar(50) DEFAULT NULL,
      email varchar(75) DEFAULT NULL,
      login varchar(32) NOT NULL,
      password varchar(32) NOT NULL
    );
  """)
  users = json.load(open(here('users.json'),'r'))['records']
  conn.executemany("INSERT INTO users VALUES (:userid,:fname,:lname,:email,:login,:password);",users)

def here(path=''):
  import os
  return os.path.abspath(os.path.join(os.path.dirname(__file__),path))

@route('/')
def index():
  return static_file('index.html',root=here())

@route('/static/<path:path>')
def server_static(path):
  return static_file(path, root=here('../../../'))

@route('/users/')
@post('/users/')
def users():
  req = php_querystring(request.body.read())
  #req = php_querystring(request.query_string)
  cmd = req.get('cmd','')
  res = {}
  w2grid = w2Grid(conn)
  if cmd == 'get-records':
    sql = "SELECT * FROM users WHERE ~search~ ORDER BY ~sort~"
    res = w2grid.getRecords(sql, req)
  elif cmd == 'delete-records':
    res = w2grid.deleteRecords("users", "userid", req)
  elif cmd == 'get-record':
    sql = "SELECT userid, fname, lname, email, login, password FROM users WHERE userid = :recid"
    res = w2grid.getRecord(sql,req.get('recid',''))
  elif cmd == 'save-record':
    res = w2grid.saveRecord('users', 'userid', req)
  else:
    res['status']   = 'error'
    res['message']  = 'Command "%s" is not recognized.' % cmd
    res['postData'] = req
  return res

setup_database()
run(host='localhost', port=8080, debug=True, reloader=True)
