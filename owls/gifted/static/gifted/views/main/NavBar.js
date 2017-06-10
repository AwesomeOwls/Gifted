/**
 * Created by ysayag on 09/05/2017.
 */
var NavBar = {
    setLoginButton: function () {
        var $login = $('#login-button');
        auth2.attachClickHandler($login[0], {},
            GoogleAuth.onSignIn, function (e) {
                console.error(e.error)
            });
    },

    hideTopButtons: function () {
        var $login = $('#login-button');
        var $logout = $('#logout-button');
        var $welcome = $('#welcome');
        var $search = $('#search-button');
        var $upload = $('#upload-button');
        var $about = $('#about-button');
        var $faq = $('#faq-button');

        $logout.hide();
        $logout.off('click');
        $search.hide();
        $upload.hide();
        $login.show();
        $about.show();
        $faq.show();
        $welcome.hide();
        $welcome.off('click');
        $welcome[0].innerText = '';
    },

    hideAllButtons: function () {
        var $login = $('#login-button');
        var $logout = $('#logout-button');
        var $welcome = $('#welcome');
        var $search = $('#search-button');
        var $upload = $('#upload-button');
        var $about = $('#about-button');
        var $faq = $('#faq-button');

        $logout.hide();
        $logout.off('click');
        $search.hide();
        $upload.hide();
        $login.hide();
        $welcome.hide();
        $welcome.off('click');
        $about.hide();
        $faq.hide();

        $welcome[0].innerText = '';
    },

    showTopButtons: function () {
        var $login = $('#login-button');
        var $logout = $('#logout-button');
        var $search = $('#search-button');
        var $upload = $('#upload-button');
        var $about = $('#about-button');
        var $faq = $('#faq-button');

        $login.hide();
        $logout.show();
        $logout.click(GoogleAuth.signOut);
        $search.show();
        $upload.show();
        $about.show();
        $faq.show();
    },

    showWelcome: function (userName, pictureURL) {
        var $status = $('#status');
        var $preloader = $('#preloader');
        var $body = $('body');

        var introHeader = 'static/gifted/inner-templates/introHeader.html';
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
        var rankBar = NavBar.getRankBar();
        rankBar.appendTo('#welcome');
        $welcome.show();

        $welcome.click(function () {

            var obj = {};
            obj['user_id'] = Utils.readCookie('user_id');

            // $welcome.off('click');
            $.ajax({
                type: "POST",
                url: "http://localhost:63343/profile/",
                // The key needs to match your method's input parameter (case-sensitive).
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(obj),
                dataType: "json",
                beforeSend: function () {
                    $status.show();
                    $preloader.show();
                },
                success: function (data) {
                    $preloader.delay(300).fadeOut('slow', function () {
                        $body.delay(550).css({'overflow': 'visible'});
                        ProfileView.showProfilePage(data.gifts);
                    });
                },
                error: function (error) {
                    $status.hide();
                    $preloader.hide();
                    errorDialog.showDialog(error.responseText);
                },
            });
        });
    },

    getRankBar: function () {
        var userRank = Utils.getUserRank();
        var barValue;
        barValue = Math.max(0, userRank) + 35;
        barValue = Math.min(100, barValue);
        var rank_color = Utils.getRankColor();
        if (rank_color != 'red') {
            return $(
                '<div class="progress progress-rank">' +
                '<div class="progress-bar ' + rank_color + '-gifter" role="progressbar" aria-valuenow="' + barValue + '"' +
                'aria-valuemin="0" aria-valuemax="100" style="width:' + barValue + '%">' +
                'Rank: ' + userRank +
                '</div>' +
                '</div>'
            );
        }
        else {
            return $(
                '<div class="progress progress-rank">' +
                '<div class="progress-bar red-gifter" role="progressbar" aria-valuenow="100"' +
                'aria-valuemin="0" aria-valuemax="100" style="width:100%">' +
                'User under warning' +
                '</div>' +
                '</div>'
            );
        }
    }
};