from django.conf.urls import url, include
from rest_framework import routers

from . import views

from adventure.api.game import views as adventure_views
from adventure.api.designer import views as designer_views
from player.views import RatingViewSet, SavedGameViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'players', adventure_views.PlayerViewSet)
router.register(r'profiles', adventure_views.PlayerProfileViewSet)
router.register(r'authors', adventure_views.AuthorViewSet)
router.register(r'adventures', adventure_views.AdventureViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/rooms$', adventure_views.RoomViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/artifacts$', adventure_views.ArtifactViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/effects$', adventure_views.EffectViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/monsters$', adventure_views.MonsterViewSet)
router.register(r'adventures/(?P<adventure_id>[\w-]+)/hints', adventure_views.HintViewSet)
router.register(r'saves', SavedGameViewSet)
router.register(r'ratings', RatingViewSet)
router.register(r'log', adventure_views.LogViewSet)

designer_router = routers.DefaultRouter(trailing_slash=False)
designer_router.register(r'', designer_views.AdventureViewSet)
designer_router.register(r'(?P<adventure_id>[\w-]+)/rooms$', designer_views.RoomViewSet)
designer_router.register(r'(?P<adventure_id>[\w-]+)/artifacts$', designer_views.ArtifactViewSet)
designer_router.register(r'(?P<adventure_id>[\w-]+)/effects$', designer_views.EffectViewSet)
designer_router.register(r'(?P<adventure_id>[\w-]+)/monsters$', designer_views.MonsterViewSet)
designer_router.register(r'(?P<adventure_id>[\w-]+)/hints', designer_views.HintViewSet)

urlpatterns = [
    # REST API routes
    url(r'^api/', include(router.urls)),
    url(r'^api/designer/', include(designer_router.urls)),

    # regular Django pages
    url(r'^$', views.index, name='index'),
    url(r'^about$', views.about, name='about'),
    url(r'^privacy$', views.privacy_policy, name='privacy_policy'),
    url(r'^adventure-list$', views.adventure_list, name='adventure-list'),
    url(r'^manual$', views.manual, name='manual'),
    url(r'^news/', include('news.urls')),

    # routes into the Angular apps

    # The following route will match anything starting with "main-hall" with or without a trailing slash.
    # Any routes matched here will be sent to the "main hall" angular app.
    # Additional path info in the route (e.g, /main-hall/shop or /main-hall/wizard) will be handled by angular's router.
    url(r'^main-hall', views.main_hall, name='main-hall'),

    # the "adventure" angular app
    url(r'^adventure/(?P<slug>[\w-]+)/$', views.adventure, name='adventure'),
]
