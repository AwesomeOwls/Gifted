

var GoogleAuth = {

    onSignIn: function (googleUser) {
        var $logout = $('#logout-button'); var $body = $('body'); var $search = $('#search-button');
        var $status = $('#status'); var $preloader = $('#preloader'); var $upload = $('#upload-button');

        console.log('user logged in');
        var profile = googleUser.getBasicProfile();
        var pictureURL = profile.getImageUrl();
        $logout.click(GoogleAuth.signOut);
        NavBar.hideAllButtons();
        $status.show();
        $preloader.show();
        $status.delay(300).fadeOut();
        $preloader.delay(300).fadeOut('slow', function() {
            $body.delay(550).css({'overflow':'visible'});
            NavBar.showTopButtons();
            NavBar.showWelcome(profile.getGivenName(), pictureURL);

            $search.click(function() {$('#search-modal').modal() });
            $upload.click(function() {$('#upload-modal').modal() });
        });
    },

    signOut: function () {
        var $body = $('body'); var $status = $('#status');
        var $preloader = $('#preloader');
        NavBar.hideAllButtons();
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

