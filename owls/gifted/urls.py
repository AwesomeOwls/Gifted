
from django.conf.urls import url
from django.contrib import admin
from . import views


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^search/', views.search_gift),
    url(r'^upload', views.upload_gift),
    url(r'^$', views.index),
    url(r'^signin/', views.login),
    url(r'^signout/', views.logout),
    url(r'^test/', views.test),
    url(r'^fill_db/', views.fill_db),
    url(r'^clear/', views.clear_db),
    url(r'^profile/', views.user_page),
    url(r'^like/', views.like)
]
