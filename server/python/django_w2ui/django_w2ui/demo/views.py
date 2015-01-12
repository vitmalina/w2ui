# Create your views here.
from django_w2ui.demo.models import Users, Tipo_User
from django_w2ui.views import W2uiGridView,W2uiFormView
from django.views.generic.base import TemplateView
import json

class IndexView(TemplateView):
    template_name = 'django_w2ui/index.html'

class ServerSideObjectsView(TemplateView):
    template_name = 'django_w2ui/server-side-objects.html'
    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        tipo_user = Tipo_User.objects.all().values_list("descri",flat=True)
        tipo_user = [str(descri) for descri in tipo_user]
        context.update({"tipo_user": json.dumps(tipo_user)})
        return self.render_to_response(context)

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