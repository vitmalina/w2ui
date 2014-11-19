class w2Grid:
  def __init__(self,conn):
    self.conn = conn

  def getRecords(self, sql, request, cql=None):
    sql_components = { 'where': [], 'params': [], 'sort': [] }
    if request.get('search',[]):
      for search in request['search']:
        operator = "="
        field    = search['field']  # TODO: protect from sql injection!!!
        value    = [ search['value'] ]
        op       = search['operator'].lower()
        if op == "begins":
          operator = "LIKE ?||'%%'"
        elif op == "ends":
          operator = "LIKE '%%'||?"
        elif op == "contains":
          operator = "LIKE '%%'||?||'%%'"
        elif op == "is":
          operator = "= LOWER(?)"
        elif op == "between":
          operator = "BETWEEN ? AND ?"
          value    = value[0]
        elif op == "in":
          operator = "IN (?)"
        sql_components['where'].append("%s %s" % (field,operator))
        for v in value:
          sql_components['params'].append(v)

    if request.get('sort',[]):
      for sort in request['sort']:
         field = sort['field']      # TODO: protect from sql injection!!!
         dir_  = sort['direction']  # TODO: protect from sql injection!!!
         sql_components['sort'].append(field+' '+dir_)

    connector = ' %s ' % request.get('searchLogic','AND')  # TODO: protect from sql injection!!!
    where = connector.join(sql_components['where'])
    if not where:
      where = '1=1'
    sort = ",".join(sql_components['sort'])
    if not sort:
      sort = '1'
    sql = sql.replace("~search~",where)
    sql = sql.replace("~order~","~sort~")
    sql = sql.replace("~sort~",sort)

    if not cql:
      cql = "SELECT count(1) FROM (%s) as grid_list_1" % sql

    limit  = 50
    offset = 0
    try:
      limit = abs(int(request['limit']))
    except:
      pass
    try:
      offset = abs(int(request['offset']))
    except:
      pass
    sql += " LIMIT %s OFFSET %s" % (limit,offset)

    data = {}

    try:
      cursor = self.conn.cursor()
      # count records
      cursor.execute(cql,sql_components['params'])
      data['status'] = 'success'
      data['total'] = cursor.fetchone()[0]

      # execute sql
      data['records'] = []
      rows = cursor.execute(sql,sql_components['params'])
      columns = [ d[0] for d in cursor.description ]
      columns[0] = "recid"
      for row in rows:
        record = zip(columns,list(row))
        data['records'].append( dict(record) )

    except Exception, e:
      data['status'] = 'error'
      data['message'] = '%s\n%s' % (e,sql)
    return data

  def deleteRecords(self, table, keyField, data):
    return {}

  def getRecord(self, sql, recid):
    return {}

  def saveRecord(self, table, keyField, data):
    return {}

  def newRecord(self, table, data):
    return {}

  def getItems(self, sql):
    return {}
