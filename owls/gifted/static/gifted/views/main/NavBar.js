/**
 * Created by ysayag on 09/05/2017.
 */
var NavBar = {
    setLoginButton: function() {
        var $login = $('#login-button');
        auth2.attachClickHandler($login[0], {},
            GoogleAuth.onSignIn, function(e) {console.error(e.error)});
    },

    hideTopButtons: function() {
        var $login = $('#login-button'); var $logout = $('#logout-button'); var $welcome = $('#welcome');
        var $search = $('#search-button'); var $upload = $('#upload-button');
        var $about = $('#about-button');

        $logout.hide();
        $search.hide();
        $upload.hide();
        $login.show();
        $about.show();
        $welcome.hide();
        $welcome[0].innerText = '';
    },

    hideAllButtons: function() {
        var $login = $('#login-button'); var $logout = $('#logout-button'); var $welcome = $('#welcome');
        var $search = $('#search-button'); var $upload = $('#upload-button');
        var $about = $('#about-button');

        $logout.hide();
        $search.hide();
        $upload.hide();
        $login.hide();
        $welcome.hide();
        $about.hide();
        $welcome[0].innerText = '';
    },

    showTopButtons: function() {
        var $login = $('#login-button'); var $logout = $('#logout-button');
        var $search = $('#search-button'); var $upload = $('#upload-button');
        var $about = $('#about-button');

        $login.hide();
        $logout.show();
        $search.show();
        $upload.show();
        $about.show();
    },

    showWelcome: function(userName, pictureURL) {
        pictureURL = pictureURL.replace(/\"/g, "");
        var $welcome = $('#welcome');
        //TODO: check if user is in DB Already, if so present 'welcome back' message or something similar
        $welcome.hide();
        var $welcomeText = $('<div></div>');
        $welcomeText[0].innerText = 'Welcome, ' + userName + '!  ';
        var img = $('<img class="user-img">');
        img.attr('src', pictureURL);
        $welcomeText.css('padding-left', '5px');
        img.appendTo('#welcome');
        $welcomeText.appendTo('#welcome');
        $welcome.show();
    }
};