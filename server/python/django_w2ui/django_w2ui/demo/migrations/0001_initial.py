# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Tipo_User'
        db.create_table(u'demo_tipo_user', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('codice', self.gf('django.db.models.fields.IntegerField')(null=True, db_column='codice', blank=True)),
            ('descri', self.gf('django.db.models.fields.CharField')(max_length=30L, db_column='descri', blank=True)),
        ))
        db.send_create_signal(u'demo', ['Tipo_User'])

        # Adding model 'Users'
        db.create_table('users', (
            ('userid', self.gf('django.db.models.fields.IntegerField')(primary_key=True, db_column='userid')),
            ('fname', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, db_column='fname', blank=True)),
            ('lname', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, db_column='lname', blank=True)),
            ('email', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, db_column='email', blank=True)),
            ('login', self.gf('django.db.models.fields.CharField')(max_length=32, null=True, db_column='login', blank=True)),
            ('password', self.gf('django.db.models.fields.CharField')(max_length=32, null=True, db_column='password', blank=True)),
            ('date_birthday', self.gf('django.db.models.fields.DateField')(null=True, db_column='date_birthday', blank=True)),
            ('date_registration', self.gf('django.db.models.fields.DateField')(null=True, db_column='date_birthday', blank=True)),
            ('importo_registrato', self.gf('django.db.models.fields.DecimalField')(blank=True, null=True, db_column='importo_registrato', decimal_places=3, max_digits=15)),
            ('text', self.gf('django.db.models.fields.CharField')(default='', max_length=512, null=True, db_column='text', blank=True)),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')(null=True, db_column='timestamp', blank=True)),
            ('tipo_user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['demo.Tipo_User'], null=True, db_column='tipo_user', blank=True)),
        ))
        db.send_create_signal(u'demo', ['Users'])


    def backwards(self, orm):
        # Deleting model 'Tipo_User'
        db.delete_table(u'demo_tipo_user')

        # Deleting model 'Users'
        db.delete_table('users')


    models = {
        u'demo.tipo_user': {
            'Meta': {'ordering': "['descri']", 'object_name': 'Tipo_User'},
            'codice': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'db_column': "'codice'", 'blank': 'True'}),
            'descri': ('django.db.models.fields.CharField', [], {'max_length': '30L', 'db_column': "'descri'", 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'demo.users': {
            'Meta': {'object_name': 'Users', 'db_table': "'users'"},
            'date_birthday': ('django.db.models.fields.DateField', [], {'null': 'True', 'db_column': "'date_birthday'", 'blank': 'True'}),
            'date_registration': ('django.db.models.fields.DateField', [], {'null': 'True', 'db_column': "'date_birthday'", 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'db_column': "'email'", 'blank': 'True'}),
            'fname': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'db_column': "'fname'", 'blank': 'True'}),
            'importo_registrato': ('django.db.models.fields.DecimalField', [], {'blank': 'True', 'null': 'True', 'db_column': "'importo_registrato'", 'decimal_places': '3', 'max_digits': '15'}),
            'lname': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'db_column': "'lname'", 'blank': 'True'}),
            'login': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'db_column': "'login'", 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'db_column': "'password'", 'blank': 'True'}),
            'text': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '512', 'null': 'True', 'db_column': "'text'", 'blank': 'True'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'db_column': "'timestamp'", 'blank': 'True'}),
            'tipo_user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['demo.Tipo_User']", 'null': 'True', 'db_column': "'tipo_user'", 'blank': 'True'}),
            'userid': ('django.db.models.fields.IntegerField', [], {'primary_key': 'True', 'db_column': "'userid'"})
        }
    }

    complete_apps = ['demo']