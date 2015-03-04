# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json
import re

from operator import or_ , and_

from django.core.paginator import Paginator
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.db.models import Q
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils.six import text_type
from django.utils.six.moves import reduce, xrange
from django.views.generic import View
from django.views.generic.list import MultipleObjectMixin
from django.forms.models import modelform_factory
from django.views.generic.detail import SingleObjectMixin
from django.utils.timezone import is_aware
import decimal
import datetime
import settings

JSON_MIMETYPE = 'application/json'

RE_FORMATTED = re.compile(r'\{(\w+)\}')

#: SQLite unsupported field types for regex lookups
UNSUPPORTED_REGEX_FIELDS = (
    models.IntegerField,
    models.BooleanField,
    models.NullBooleanField,
    models.FloatField,
    models.DecimalField,
)

class DjangoJSONEncoderMod(json.JSONEncoder):
    """
    JSONEncoder subclass that knows how to encode date/time and decimal types.
    """
    def default(self, o):
        # See "Date Time String Format" in the ECMA-262 specification.
        if isinstance(o, datetime.datetime):
#             r = o.isoformat()
            USER_SHORT_DATETIME_FORMAT = "%d-%m-%Y %H:%M"
            r = o.strftime(USER_SHORT_DATETIME_FORMAT)
            if o.microsecond:
                r = r[:23] + r[26:]
            if r.endswith('+00:00'):
                r = r[:-6] + 'Z'
            return r
        elif isinstance(o, datetime.date):
            USER_SHORT_DATETIME_FORMAT = "%d-%m-%Y"
            return o.strftime(USER_SHORT_DATETIME_FORMAT)
#             return o.isoformat()
        elif isinstance(o, datetime.time):
            if is_aware(o):
                raise ValueError("JSON can't represent timezone-aware times.")
#             r = o.isoformat()
#             if o.microsecond:
#                 r = r[:12]
            USER_SHORT_TIME_FORMAT = "%H:%M"
            r = o.strftime(USER_SHORT_TIME_FORMAT)
            return r
        elif isinstance(o, decimal.Decimal):
            return str(o)
        else:
            return super(DjangoJSONEncoderMod, self).default(o)

def get_real_field(model, field_name):
    '''
    Get the real field from a model given its name.

    Handle nested models recursively (aka. ``__`` lookups)
    '''
    parts = field_name.split('__')
    field = model._meta.get_field(parts[0])
    if len(parts) == 1:
        return model._meta.get_field(field_name)
    elif isinstance(field, models.ForeignKey):
        return get_real_field(field.rel.to, '__'.join(parts[1:]))
    else:
        raise Exception('Unhandled field: %s' % field_name)


class W2uiBaseView(View):
    fields = []
    commands = {}
    data = {}
    def post(self, request, *args, **kwargs):
        self.data = json.loads(request.body)
        cmd  = self.commands.get(self.data.get('cmd',''),'')
        if cmd:
            response = getattr(self,cmd)(self.data)
        else:
            response = self.error('unknown command "%s"' % self.data.get('cmd',''))            
        return HttpResponse(json.dumps(response, cls=DjangoJSONEncoderMod),mimetype=JSON_MIMETYPE)
    def response(self,status, message, data):
        resp = {
                 "status" : status,
                 "message": message,
                 }
        if data:
            resp.update(data)
        return resp
    def success(self,message="",data=None):
        return self.response('success',message,data)
    def error(self,message="",data=None):
        return self.response('error',message,data)
    
class W2uiGridView(MultipleObjectMixin, W2uiBaseView):
    commands = {
      'get-records':    'get_records',
      'save-records':   'save_records',
      'delete-records': 'delete_records',           
    }
    def get_records(self,data):
        # TODO: convalida data
        qs = self.get_queryset()

        # search
        search  = data.get('search',[])
        filters = []
        for param in search:
            term     = param['value']
            field    = param['field']
            typ      = param['type']
            operator = param['operator']
            if field == 'recid':
                field = 'pk'
            type_search = ""
            if operator == "contains":
                type_search = '__i'+operator
            elif operator == "in":
                type_search = '__'+operator
            elif operator == "between":
                type_search = '__range'
            elif operator == "begins":
                type_search = '__istartswith'
            elif operator == "ends":
                type_search = '__iendswith'
            elif operator == "is":
                type_search = "__exact"
            filters.append((Q(**{field+type_search: term})))
        if filters:
            searchLogic = data.get('searchLogic','AND')
            if searchLogic == "AND":
                searchLogic = and_
            else:
                searchLogic = or_
            qs = qs.filter(reduce(searchLogic, filters))
        
        # sort
        sort = data.get('sort',[])
        order = []
        for param in sort:
            field     = param['field']
            if field == "recid":
                field = self.model._meta.pk.get_attname()
            direction = param['direction']
            if direction == 'desc':
                field = '-' + field
            order.append(field)
        if order:
            qs = qs.order_by(*order)

        # fields
        qs = qs.values('pk',*self.fields)

        # pagination
        page_size = data.get('limit',1)
        start_index = data.get('offset',0)
        paginator = Paginator(qs, page_size)
        num_page = (start_index / page_size) + 1
        page = paginator.page(num_page)

        return self.success(data={
                "total"   : page.paginator.count,
                "records" : list(page.object_list),
        })
        
    def save_records(self,data):
        return self.error('method not implemented') # TODO:
    
    def delete_records(self,data):
        try:
            for obj in self.get_queryset().in_bulk(data['selected']).itervalues():
                obj.delete()
            response = self.success()
        except Exception as e:
            response = self.error('error deleting records',{ 'exception': e })
        return response
    
    def get_data(self):
        return self.data
class W2uiFormView (SingleObjectMixin, W2uiBaseView):
    commands = {
      'get-record':    'get_record',
      'save-record':   'save_record',
    }
    def get_record(self,data):
        pk = data.get('recid',None)
        record = self.get_queryset().filter(pk=pk).values(*self.fields)
        if len(record) == 1:
            response = self.success(data={ 'record': record[0] })
        else:
            response = self.error('record ID "%s" not found' % pk) 
        return response
    def save_record(self,data):
        Form = modelform_factory(self.model, fields=self.fields)
        form = Form(data['record'])
        if form.is_valid():
            obj = form.save(commit=False)
            if data['recid']:
                obj.pk = data['recid']
            obj.save()
            response = self.success()
        else:
            response = self.error('errori nella form',form.errors) 
        return response
