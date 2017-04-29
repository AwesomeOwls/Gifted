// import $ from 'gifted-ui/flatfy-ui/js/jquery-1.10.2.js'

function startApp() {
    $('document').ready(function () {
        var user = null;
        $('#search-button > a').click(function () {
            // $('#about').hide();
        });

        $('#home-button').click(function () {
            // $('#about').show();
        });
    });
}

var GoogleAuth = {

    onSignIn: function (googleUser) {
    console.log('user logged in');
    var profile = googleUser.getBasicProfile();
    var $login =  $('#login-button');
    var $logout =  $('#logout-button');
    var $welcome =  $('#welcome');
    var $search =  $('#search-button');
    var $upload =  $('#upload-button');
    var $account =  $('#account-button');
    var pictureURL = profile.getImageUrl();
    $login.hide();
    $logout.show();
    $search.show();
    $upload.show();
    $account.show();
    $logout.click(GoogleAuth.signOut);
    //TODO check if user is in DB Already.
    $welcome.show();
    var $text = $('<div></div>')
    $text[0].innerText = 'Welcome, ' + profile.getGivenName() + '!  ';
    var img = $('<img class="user-img">');
    img.attr('src', pictureURL);
    $text.css('padding-left', '5px');
    img.appendTo('#welcome');
    $text.appendTo('#welcome');
    // TODO: add permission for Birthday! (for reminders/dicounts when it arrives)

},

    signOut: function () {
    var auth2 = gapi.auth2.getAuthInstance();
    var $login =  $('#login-button');
    var $logout =  $('#logout-button');
    var $welcome =  $('#welcome');
    var $search =  $('#search-button');
    var $upload =  $('#upload-button');
    var $account =  $('#account-button');
    auth2.signOut().then(function() {
        console.log('user logged out');
        $logout.hide();
        $search.hide();
        $upload.hide();
        $account.hide();
        $welcome.hide();
        $login.show();
        $welcome[0].innerText = '';
    });
},
    setLoginButton: function() {
        auth2.attachClickHandler($('#login-button')[0], {},
            GoogleAuth.onSignIn, function(e) {console.error(e.error)});
    }


};


startApp();