/**
 * Created by ysayag on 09/05/2017.
 */

var ProfileView = {

    showProfilePage: function() {
        Utils.clearMainView();
        var profilePage = 'static/gifted/inner-templates/profilePage.html';
        Utils.injectMainView(profilePage, ProfileView.onProfilePageInjected);

    },

    onProfilePageInjected: function() {
        var backToIntro = $('#back-to-intro');
        var $picture = $('#profile-picture');
        var $name = $('#profile-name');
        var $rank = $('#profile-rank');
        var given_name = Utils.readCookie('given_name');
        var user_rank = Utils.readCookie('user_rank');
        var pictureURL = Utils.readCookie('picture');
        pictureURL = pictureURL.replace(/\"/g, "");

        var img = $('<img class="user-img">');
        $picture.attr('src', pictureURL);

        $name[0].innerHTML = 'Hello, ' + given_name + '!  ';
        $rank[0].innerHTML = 'Your Rank is: ' + user_rank;

        backToIntro.click(NavBar.showIntroHeader);


    },
}
var ResultsView = {
    //TODO ResultsView Functions
}