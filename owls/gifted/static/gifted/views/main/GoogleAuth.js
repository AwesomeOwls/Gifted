

var GoogleAuth = {

    onSignIn: function (googleUser) {

        var id_token = googleUser.getAuthResponse().id_token;
        //TODO Yehonatan: uncomment this when backend token verification is done
        GoogleAuth.validateToken(id_token, googleUser);
        console.log('user logged in', googleUser);
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

    validateToken: function (id_token, googleUser) {

        $.ajax({
            type: "POST",
            url: "http://localhost:63343/signin/",
            // The key needs to match your method's input parameter (case-sensitive).
            data: JSON.stringify({id_token : id_token }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                console.log('Signed in as: ' + data);
                //TODO check if googleUser is in cookie, then approve
                GoogleAuth.onValidatedToken(googleUser);
            },
            failure: function(errMsg) {
                alert(errMsg);
            }
        });
        // //TODO validation for id
        //
        // //TODO Yehonatan: put real backend post request here to validate token
        // var xhr = new XMLHttpRequest();
        // xhr.open('POST', 'http://http://localhost:63343/login');
        // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // xhr.onload = function() {
        //     console.log('Signed in as: ' + xhr.responseText);
        //     //TODO check if googleUser is in cookie, then approve
        //     onValidatedToken(googleUser);
        // };
        // xhr.send('idtoken=' + id_token);
    },

    onValidatedToken: function(googleUser) {
        var $logout = $('#logout-button');
        var $body = $('body');
        var $search = $('#search-button');
        var $status = $('#status');
        var $preloader = $('#preloader');
        var $upload = $('#upload-button');

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
};

