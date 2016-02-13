from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^adventure/(?P<adventure_id>[\w]+)/$', views.adventure, name='adventure'),
]