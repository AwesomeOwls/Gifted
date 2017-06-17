
var GoogleAuth = {

    onSignIn: function (googleUser) {

        var id_token = googleUser.getAuthResponse().id_token;
        GoogleAuth.validateToken(id_token);
    },

    signOut: function () {
        var $body = $('body'); var $status = $('#status');
        var $preloader = $('#preloader'); var $logout = $('#logout-button');
        NavBar.unbindTopButtonsClick();
        MainView.showMainView();
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            $.ajax({
                type: "POST",
                url: "http://localhost:63343/signout/",
                // The key needs to match your method's input parameter (case-sensitive).
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                beforeSend: Utils.beforeSend,
                success: function(data){
                    $preloader.delay(300).fadeOut('slow', function () {
                        $body.delay(550).css({'overflow': 'visible'});
                        NavBar.showPartialButtonsOnly();
                        NavBar.setLoginButton(); // set listener to login function on login button
                    });
                },
                error: function(error){
                    NavBar.updateTopBar();
                    $status.hide();
                    $preloader.hide();
                    errorDialog.showDialog(error.responseText);
                },
            });
        });
    },

    validateToken: function (id_token) {
        var $status = $('#status'); var $preloader = $('#preloader');

        $.ajax({
            type: "POST",
            url: "http://localhost:63343/signin/",
            // The key needs to match your method's input parameter (case-sensitive).
            data: JSON.stringify({id_token : id_token }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            beforeSend: Utils.beforeSend,
            success: function(data){
                GoogleAuth.onValidatedUser();
            },
            error: function(error){
                $status.hide();
                $preloader.hide();
                NavBar.showPartialButtonsOnly();
                errorDialog.showDialog(error.responseText);
            },
        });
    },

    onValidatedUser: function() {
        var $logout = $('#logout-button'); var $body = $('body'); var $search = $('#search-button');
        var $status = $('#status');var $preloader = $('#preloader');
        var $upload = $('#upload-button');

        var given_name = Utils.getUserName();
        var pictureURL = Utils.getUserImageURL();

        $logout.click(GoogleAuth.signOut);
        $status.show();
        $preloader.show();
        $status.delay(300).fadeOut();
        $preloader.delay(300).fadeOut('slow', function () {
            $body.delay(550).css({'overflow': 'visible'});

            NavBar.showWelcome(given_name, pictureURL);

            $search.click(function () {
                SearchDialog.showDialog();
            });
            $upload.click(function () {
                $(function () {
                    $("#upload-relationship-score").rateYo({
                        starWidth: "40px"
                    });
                });
                UploadDialog.showDialog();
            });
            NavBar.showTopButtons();
        });
    }

};

