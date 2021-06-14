from django.conf.urls import url
from . import views

urlpatterns = [
    # The following route will match anything starting with "designer" with or without a trailing slash.
    # Any routes matched here will be sent to the "designer" angular app.
    # Additional path info in the route will be handled by angular's router.
    url(r'^designer', views.designer, name='designer'),
]
