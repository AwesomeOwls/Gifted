
from django.conf.urls import url
from django.contrib import admin
from . import utils , tests
from . import gifts_views, crowd_views


urlpatterns = [
    url(r'^admin/', admin.site.urls),

    url(r'^search/', gifts_views.search),
    url(r'^upload', gifts_views.upload_gift),
    url(r'^like/', gifts_views.like),

    url(r'^signin/', crowd_views.login),
    url(r'^signout/', crowd_views.logout),
    url(r'^ask_user/', crowd_views.ask_user),
    url(r'^profile/', crowd_views.profile_page),
    url(r'^redeem_card/', crowd_views.redeem_giftcard),
    url(r'^$', crowd_views.index),

    url(r'^fill_db/', utils.init_relations),
    url(r'^add_gifts/', utils.init_gifts),

    url(r'^clear/', tests.clear_db),
    url(r'^change_strength',tests.enhance_relation),
    url(r'^setup',tests.setup),
    url(r'^increase', tests.enhance_relation_by_unit),
    url(r'^decrease', tests.decrease_relation_by_unit),
    url(r'^unban', tests.unban)

]
