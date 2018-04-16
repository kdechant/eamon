from django.conf.urls import url, include
from rest_framework import routers

from . import views

from .views import PlayerViewSet, PlayerProfileViewSet, AdventureViewSet, AuthorViewSet, RoomViewSet, ArtifactViewSet, EffectViewSet, MonsterViewSet, HintViewSet, LogViewSet
from player.views import SavedGameViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'players', PlayerViewSet)
router.register(r'profiles', PlayerProfileViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'adventures', AdventureViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/rooms$', RoomViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/artifacts$', ArtifactViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/effects$', EffectViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/monsters$', MonsterViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/hints', HintViewSet)
router.register(r'saves', SavedGameViewSet)
router.register(r'log', LogViewSet)

urlpatterns = [
    # REST API routes
    url(r'^api/', include(router.urls)),

    # regular Django pages
    url(r'^$', views.index, name='index'),
    url(r'^about$', views.about, name='about'),
    url(r'^adventure-list$', views.adventure_list, name='adventure-list'),
    url(r'^manual$', views.manual, name='manual'),
    url(r'^news/', include('news.urls')),

    # routes into the Angular apps

    # The following route will match anything starting with "main-hall" with or without a trailing slash.
    # Any routes matched here will be sent to the "main hall" angular app.
    # Additional path info in the route (e.g, /main-hall/shop or /main-hall/wizard) will be handled by angular's router.
    url(r'^main-hall', views.main_hall, name='main-hall'),

    # the "adventure" angular app
    url(r'^adventure/(?P<adventure_id>[\w-]+)/$', views.adventure, name='adventure'),
]
