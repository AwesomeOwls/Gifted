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

    showPartialButtonsOnly: function () {
        var $login = $('#login-button');
        var $logout = $('#logout-button');
        var $welcome = $('#welcome');
        var $search = $('#search-button');
        var $upload = $('#upload-button');
        var $about = $('#about-button');
        var $faq = $('#faq-button');

        $logout.hide();
        $search.hide();
        $upload.hide();
        $login.show();
        $about.show();
        $faq.show();
        $welcome.hide();
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
        $search.hide();
        $upload.hide();
        $login.hide();
        $welcome.hide();
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
        $search.show();
        $upload.show();
        $about.show();
        $faq.show();
    },

    showWelcome: function (userName, pictureURL) {
        var introHeader = 'static/gifted/inner-templates/introHeader.html';
        pictureURL = pictureURL.replace(/\"/g, "");
        var $welcome = $('#welcome');
        NavBar.initWelcomeBar(userName, pictureURL);

        $welcome.click(function () {
                NavBar.profilePageRequest();
        });
    },

    profilePageRequest: function(options) {
        var $status = $('#status');
        var $preloader = $('#preloader');
        var $body = $('body');

        var obj = {};
        obj['user_id'] = Utils.readCookie('user_id');

        $.ajax({
            type: "POST",
            url: "http://localhost:63343/profile/",
            // The key needs to match your method's input parameter (case-sensitive).
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(obj),
            dataType: "json",
            beforeSend: Utils.beforeSend,
            success: function (data) {
                $preloader.delay(300).fadeOut('slow', function () {
                    NavBar.updateTopBar();
                    $body.delay(550).css({'overflow': 'visible'});
                    ProfileView.showProfilePage(data.gifts);
                    if (options && options.successOnInjected) {
                        successDialog.showDialog(options.successMessage);
                    }
                });
            },
            error: function (error) {
                NavBar.updateTopBar();
                $status.hide();
                $preloader.hide();
                errorDialog.showDialog(error.responseText);
            },
        });
    },

    initWelcomeBar: function(userName, pictureURL) {
        if (!userName || !pictureURL) return;
        var $welcome = $('#welcome');
        Utils.clearView('#welcome');
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
    },

    getRankBar: function () {
        var userRank = Utils.getUserRank();
        var barValue = Math.max(0,userRank);
        barValue = Math.min(Utils.DIAMOND_RANK, barValue) + Utils.INITIAL_BAR_WIDTH;
        barValue = Math.ceil(barValue / Utils.BAR_STEP);
        var rank_color = Utils.getRankColor();
        return $(
            '<div class="progress progress-rank">' +
            '<div class="progress-bar ' + rank_color + '-gifter" role="progressbar" aria-valuenow="' + barValue + '"' +
            'aria-valuemin="0" aria-valuemax="100" style="width:' + barValue + '%">' +
            'Rank: ' + userRank +
            '</div>' +
            '</div>'
        );
    },

    updateSearchButton: function() {
        var $search = $('#search-button');
        if(Utils.getUserRank() < Utils.TRUSTED_RANK){
            $search.addClass('disabled-search-btn');
            $search.tooltip('enable');
        } else {
            $search.removeClass('disabled-search-btn');
            $search.tooltip('disable');

        }
    },

    unbindTopButtonsClick: function() {
        var $logout = $('#logout-button'); var $search = $('#search-button');
        var $upload = $('#upload-button'); var $welcome = $('#welcome');

        [$logout, $search, $upload, $welcome].forEach( function($button) {
            $button.off('click');
        })
    },

    updateTopBar: function() {
        NavBar.initWelcomeBar(Utils.getUserName(), Utils.getUserImageURL());
        NavBar.showTopButtons();
        NavBar.updateSearchButton();
    }
};