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

    var profile = googleUser.getBasicProfile();
    $('#login-button').hide();
    $('#logout-button').show();
    $('#logout-button').click(GoogleAuth.signOut);
    //TODO check if user is in DB Already.
    $('#welcome').show();
    $('#welcome')[0].innerText = 'Welcome, ' + profile.getGivenName();
},

    signOut: function () {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        $('#logout-button').hide();
        $('#login-button').find('a')[0].innerText = 'Log In';
        $('#login-button').show();
        $('#welcome')[0].innerText = '';
        $('#welcome').hide();
        GoogleAuth.setLoginButton();
    });
},
    setLoginButton: function() {
        auth2.attachClickHandler($('#login-button')[0], {},
            GoogleAuth.onSignIn, e => console.error(e.error));
    }


};


startApp();