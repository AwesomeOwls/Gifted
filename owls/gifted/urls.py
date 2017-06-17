
from django.conf.urls import url
from django.contrib import admin
from . import utils
from . import gifts_views, users_views


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'^search/', gifts_views.search),
    url(r'^upload', gifts_views.upload_gift),
    url(r'^like/', gifts_views.like),

    url(r'^signin/', users_views.login),
    url(r'^signout/', users_views.logout),
    url(r'^ask_user/', users_views.ask_user),
    url(r'^profile/', users_views.profile_page),
    url(r'^redeem_card/', users_views.redeem_giftcard),
    url(r'^$', users_views.index),

    url(r'^fill_db/', utils.fill_db),
    url(r'^clear/', utils.clear_db),
    url(r'^add_gifts/', utils.add_initial_gifts),
    url(r'^change_strength',utils.enhance_relation),
]
