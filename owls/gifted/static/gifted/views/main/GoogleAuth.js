
var GoogleAuth = {

    onSignIn: function (googleUser) {

        var id_token = googleUser.getAuthResponse().id_token;
        //TODO Yehonatan: uncomment this when backend token verification is done
        GoogleAuth.validateToken(id_token, googleUser);
    },

    signOut: function () {
        var $body = $('body'); var $status = $('#status');
        var $preloader = $('#preloader'); var $logout = $('#logout-button');
        NavBar.hideAllButtons();
        MainView.showMainView();
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
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
                    $preloader.delay(300).fadeOut('slow', function () {
                        $body.delay(550).css({'overflow': 'visible'});
                        NavBar.hideTopButtons();
                        NavBar.setLoginButton(); // set listener to login function on login button
                    });
                },
                error: function(error){
                    $status.hide();
                    $preloader.hide();
                    errorDialog.showDialog(error.responseText);
                },
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
                var given_name = Utils.readCookie('given_name');
                var pictureURL = Utils.readCookie('picture');

                GoogleAuth.onValidatedUser(given_name, pictureURL);
            },
            error: function(error){
                errorDialog.showDialog(error.responseText);
            },
        });
    },

    onValidatedUser: function(given_name, pictureURL) {
        var $logout = $('#logout-button'); var $body = $('body'); var $search = $('#search-button');
        var $status = $('#status');var $preloader = $('#preloader');
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
    }

};

