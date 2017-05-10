

var GoogleAuth = {

    onSignIn: function (googleUser) {
        var $logout = $('#logout-button');
        var $body = $('body');
        var $search = $('#search-button');
        var $status = $('#status');
        var $preloader = $('#preloader');
        var $upload = $('#upload-button');

        var id_token = googleUser.getAuthResponse().id_token;
        //TODO Yehonatan: uncomment this when backend token verification is done
        // GoogleAuth.validateToken(id_token);
        console.log('user logged in', googleUser);
        var profile = googleUser.getBasicProfile();
        var pictureURL = profile.getImageUrl();
        $logout.click(GoogleAuth.signOut);
        NavBar.hideAllButtons();
        $status.show();
        $preloader.show();
        $status.delay(300).fadeOut();
        $preloader.delay(300).fadeOut('slow', function () {
            $body.delay(550).css({'overflow': 'visible'});
            NavBar.showTopButtons();
            NavBar.showWelcome(profile.getGivenName(), pictureURL);

            $search.click(function () {
                SearchDialog.showDialog();
            });
            $upload.click(function () {
                UploadDialog.showDialog();
            });
        });
    },

    signOut: function () {
        var $body = $('body');
        var $status = $('#status');
        var $preloader = $('#preloader');
        NavBar.hideAllButtons();
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
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

    validateToken: function () {
        //TODO Yehonatan: put real backend post request here to validate token
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://http://localhost:63343/tokensignin');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            console.log('Signed in as: ' + xhr.responseText);
        };
        xhr.send('idtoken=' + id_token);
    },
};

