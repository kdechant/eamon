from django.conf.urls import include, url
from django.contrib import admin

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url('api/token/$', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    url('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    url(r'^', include('adventure.urls')),
    url(r'^', include('designer.urls')),
]
