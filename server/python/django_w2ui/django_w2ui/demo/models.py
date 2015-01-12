from django.db import models

class Tipo_User(models.Model):
    codice = models.IntegerField(null=True, db_column='codice', blank=True)
    descri = models.CharField(max_length=30L, db_column='descri', blank=True)
    def __str__(self):
        return u"%s"%(self.descri)
    def __unicode__(self):
        return u"%s"%(self.descri)
    class Meta:
        ordering = ['descri']

class Users(models.Model):
    userid = models.IntegerField(primary_key=True, db_column='userid')
    fname = models.CharField(max_length=50, null=True, blank=True, db_column='fname')
    lname = models.CharField(max_length=50, null=True, blank=True, db_column='lname')
    email = models.CharField(max_length=75, null=True, blank=True, db_column='email')
    login = models.CharField(max_length=32, null=True, blank=True, db_column='login')
    password = models.CharField(max_length=32, null=True, blank=True, db_column='password')
    date_birthday = models.DateField(blank=True, null=True, db_column='date_birthday')
    date_registration = models.DateField(blank=True, null=True, db_column='date_birthday')
    importo_registrato = models.DecimalField(max_digits=15, decimal_places=3,blank=True, null=True, db_column='importo_registrato')
    text = models.CharField(max_length=512, default='', null=True, blank=True, db_column='text')
    timestamp = models.DateTimeField(null=True, blank=True, db_column='timestamp')
    tipo_user = models.ForeignKey(Tipo_User, null=True, blank=True, db_column='tipo_user')
    def __str__(self):
        return '%s %s (%s)' % (self.fname, self.lname, self.email)
    def __unicode__(self):
        return '%s %s (%s)' % (self.fname, self.lname, self.email)
    class Meta:
        db_table = "users"
