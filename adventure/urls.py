from django.conf.urls import url, include
from rest_framework import routers

from . import views

from .views import AdventureViewSet, RoomViewSet, ArtifactViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'adventures', AdventureViewSet)
router.register(r'adventures/(?P<adventure_id>[\w]+)/rooms$', RoomViewSet)
router.register(r'adventures/(?P<adventure_id>[\w]+)/artifacts$', ArtifactViewSet)
router.register(r'adventures/(?P<adventure_id>[\w]+)/effects$', ArtifactViewSet)
router.register(r'adventures/(?P<adventure_id>[\w]+)/monsters$', ArtifactViewSet)

urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^$', views.index, name='index'),
    url(r'^adventure/(?P<adventure_id>[\w]+)/$', views.adventure, name='adventure'),
]
