from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from django_w2ui.demo.views import UsersW2uiGridView, UsersW2uiFormView, ServerSideObjectsView,\
    IndexView
admin.autodiscover()


urlpatterns = patterns('',
    # Examples:
    url(r'^$', IndexView.as_view(), name='index'),
#     url(r'^client-side$', ClientSideView.as_view(), name='client-side'),
#     url(r'^server-side$', ServerSideView.as_view(), name='server-side'),
#     url(r'^server-side-search$', ServerSideSearchView.as_view(), name='server-side-search'),
    url(r'^server-side-objects$', ServerSideObjectsView.as_view(), name='server-side-objects'),
#     url(r'^server-side-custom$', ServerSideCustomView.as_view(), name='server-side-custom'),
#     url(r'^defered-loading$', DeferredLoadingView.as_view(), name='deferred-loading'),
#     url(r'^localization$', LocalizationView.as_view(), name='localization'),
    url(r'^browsers/', include(patterns('',
        url(r'^default$', UsersW2uiGridView.as_view(), name='DT-users-default'),
        url(r'^edit$', UsersW2uiFormView.as_view(), name='DT-users-form'),
#         url(r'^default$', FormattedBrowserDatatablesView.as_view(), name='DT-browsers-default'),
#         url(r'^objects$', ObjectBrowserDatatablesView.as_view(), name='DT-browsers-objects'),
#         url(r'^custom$', CustomBrowserDatatablesView.as_view(), name='DT-browsers-custom'),
    ))),
    #url(r'^js/', include('djangojs.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)