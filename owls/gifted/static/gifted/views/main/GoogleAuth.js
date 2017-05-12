
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
            $status.delay(300).fadeOut();

            $.ajax({
                type: "POST",
                url: "http://localhost:63343/signout/",
                // The key needs to match your method's input parameter (case-sensitive).
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                beforeSend: function(){
                    $status.show();
                    $preloader.show();
                },
                success: function(data){
                    console.log('response data: ', data);
                    $preloader.delay(300).fadeOut('slow', function () {
                        $body.delay(550).css({'overflow': 'visible'});
                        NavBar.hideTopButtons();
                        NavBar.setLoginButton(); // set listener to login function on login button
                    });
                },
                // failure: function(errMsg) {
                //     console.log(errMsg);
                //     $preloader.delay(300).fadeOut('slow', function () {
                //         $body.delay(550).css({'overflow': 'visible'});
                //         NavBar.hideTopButtons();
                //         NavBar.setLoginButton(); // set listener to login function on login button
                //     });
                // }
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
                console.log('Signed in as: ', data);
                console.log('user_id in cookie: ', GoogleAuth.readCookie('user_id'));
                console.log('given_name in cookie: ', GoogleAuth.readCookie('given_name'));
                console.log('picture in cookie: ', GoogleAuth.readCookie('picture'));
                //TODO check if googleUser is in cookie, then approve
                var given_name = GoogleAuth.readCookie('given_name');
                var pictureURL = GoogleAuth.readCookie('picture');

                GoogleAuth.onValidatedUser(given_name, pictureURL);
            },
            failure: function(errMsg) {
                console.log(errMsg);
            }
        });
    },

    onValidatedUser: function(given_name, pictureURL) {
        var $logout = $('#logout-button');
        var $body = $('body');
        var $search = $('#search-button');
        var $status = $('#status');
        var $preloader = $('#preloader');
        var $upload = $('#upload-button');

        $logout.click(GoogleAuth.signOut);
        NavBar.hideAllButtons();
        $status.show();
        $preloader.show();
        $status.delay(300).fadeOut();
        $preloader.delay(300).fadeOut('slow', function () {
            $body.delay(550).css({'overflow': 'visible'});
            NavBar.showTopButtons();
            NavBar.showWelcome(given_name, pictureURL);

            $search.click(function () {
                SearchDialog.showDialog();
            });
            $upload.click(function () {
                UploadDialog.showDialog();
            });
        });
    },

    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
};

