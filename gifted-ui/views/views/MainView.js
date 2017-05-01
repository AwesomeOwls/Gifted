

var GoogleAuth = {

    onSignIn: function (googleUser) {
    var $logout = $('#logout-button'); var $body = $('body');
    var $status = $('#status'); var $preloader = $('#preloader');

    console.log('user logged in');
    var profile = googleUser.getBasicProfile();
    var pictureURL = profile.getImageUrl();
    $logout.click(GoogleAuth.signOut);

    $status.show();
    $preloader.show();
    $status.delay(300).fadeOut();
    $preloader.delay(300).fadeOut('slow', function() {
        $body.delay(550).css({'overflow':'visible'});
        NavBar.showTopButtons();
        NavBar.showWelcome(profile.getGivenName(), pictureURL);
    });
},

    signOut: function () {
        var $body = $('body'); var $status = $('#status');
        var $preloader = $('#preloader');

        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
            console.log('user logged out');
            $status.show();
            $preloader.show();
            $status.delay(300).fadeOut();
            $preloader.delay(300).fadeOut('slow', function () {
                $body.delay(550).css({'overflow': 'visible'});
                NavBar.hideTopButtons();
            });
        });
    },
};

var NavBar = {
    setLoginButton: function() {
        var $login = $('#login-button');

        auth2.attachClickHandler($login[0], {},
            GoogleAuth.onSignIn, function(e) {console.error(e.error)});
    },

    hideTopButtons: function() {
        var $login = $('#login-button'); var $logout = $('#logout-button'); var $welcome = $('#welcome');
        var $search = $('#search-button'); var $upload = $('#upload-button'); var $account = $('#account-button');

        $logout.hide();
        $search.hide();
        $upload.hide();
        $account.hide();
        $login.show();
        $welcome.hide();
        $welcome[0].innerText = '';
    },

    showTopButtons: function() {
        var $login = $('#login-button'); var $logout = $('#logout-button');
        var $search = $('#search-button'); var $upload = $('#upload-button'); var $account = $('#account-button');

        $login.hide();
        $logout.show();
        $search.show();
        $upload.show();
        $account.show();
    },

    showWelcome: function(userName, pictureURL) {
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