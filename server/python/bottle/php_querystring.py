#!/usr/bin/env python

import urllib
def php_querystring(querystring):
  data   = {}
  to_fix = {}
  for k,v in [ p.split('=',1) for p in querystring.split('&') if p != '' ]:
    k = urllib.unquote_plus(k)
    v = urllib.unquote_plus(v)
    while True: 
      i = k.find('[]')
      if i == -1: break
      kk = k[:i]
      to_fix.setdefault(kk,0)
      k = '%s[%d]%s' % (kk,to_fix[kk],k[(i+2):])
      to_fix[kk] += 1 
    k = k.replace(']','').split('[')
    if len(k) == 1:
      data[k[0]] = v
    else:
      data.setdefault(k[0],{})
      d = data[k[0]]
      for kk in k[1:-1]:
        d.setdefault(kk,{})
        d = d[kk]
      d[k[-1]] = v
  def d2l(struct):
    if type(struct) == dict:
      for k,v in struct.iteritems():
        if type(v) == dict:
          keys = set(v.keys())
          rng  = range(len(keys))
          if keys == set(map(str,rng)):
            struct[k] = [ d2l(v[str(i)]) for i in rng ]
    return struct
  data = d2l(data) 
  return data

if __name__ == '__main__':

  import pprint
  pp = pprint.PrettyPrinter(indent=4)

  querystring  = ""
  querystring += "&cmd=get-records"
  querystring += "&limit=50"
  querystring += "&offset=0"
  querystring += "&selected[]=1"
  querystring += "&selected[]=2"
  querystring += "&searchLogic=AND"
  querystring += "&search[0][field]=fname"
  querystring += "&search[0][type]=text"
  querystring += "&search[0][operator]=is"
  querystring += "&search[0][value]=vit"
  querystring += "&search[1][field]=age"
  querystring += "&search[1][type]=int"
  querystring += "&search[1][operator]=between"
  querystring += "&search[1][value][]=10"
  querystring += "&search[1][value][]=20"
  querystring += "&sort[0][field]=fname"
  querystring += "&sort[0][direction]=asc"
  querystring += "&sort[1][field]=lname"
  querystring += "&sort[1][direction]=desc"

  querystring += "&test[][field]=prova"
  querystring += "&test[][direction]=prova"
  querystring += "&test1[][eq]=prova0"
  querystring += "&test1[][eq]=prova1"

  pp.pprint(querystring)
  data = php_querystring(querystring)
  pp.pprint(data)
