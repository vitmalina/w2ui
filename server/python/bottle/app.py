from bottle import route, post, static_file, request, run
from php_querystring import php_querystring
from w2lib import w2Grid
import sqlite3, json

def here(path=''):
  import os
  return os.path.abspath(os.path.join(os.path.dirname(__file__),path))

conn = sqlite3.connect(here('users.sqlite3'))

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
    sql = "SELECT userid, fname, lname, email, login, password FROM users WHERE userid = ?"
    res = w2grid.getRecord(sql,req.get('recid',''))
  elif cmd == 'save-record':
    res = w2grid.saveRecord('users', 'userid', req)
  else:
    res['status']   = 'error'
    res['message']  = 'Command "%s" is not recognized.' % cmd
    res['postData'] = req
  return res

run(host='localhost', port=8080, debug=True, reloader=True)
