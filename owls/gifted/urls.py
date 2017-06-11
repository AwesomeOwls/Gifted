
from django.conf.urls import url
from django.contrib import admin
from . import views


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^search/', views.search_gift),
    url(r'^upload', views.upload_gift),
    url(r'^signin/', views.login),
    url(r'^signout/', views.logout),
    url(r'^test/', views.test),
    url(r'^fill_db/', views.fill_db),
    url(r'^clear/', views.clear_db),
    url(r'^profile/', views.profile_page),
    url(r'^like/', views.like),
    url(r'^add_gifts/', views.add_initial_gifts),
    url(r'^ask_user/', views.ask_user),
    url(r'^redeem_card/', views.redeem_card),
    url(r'^$', views.index)
]
