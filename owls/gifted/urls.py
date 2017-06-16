
from django.conf.urls import url
from django.contrib import admin
from . import views
from . import utils


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^search/', views.search),
    url(r'^upload', views.upload_gift),
    url(r'^signin/', views.login),
    url(r'^signout/', views.logout),
    url(r'^fill_db/', utils.fill_db),
    url(r'^clear/', utils.clear_db),
    url(r'^profile/', views.profile_page),
    url(r'^like/', views.like),
    url(r'^add_gifts/', utils.add_initial_gifts),
    url(r'^ask_user/', views.ask_user),
    url(r'^redeem_card/', views.redeem_giftcard),
    url(r'^$', views.index)
]
