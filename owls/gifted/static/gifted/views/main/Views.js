/**
 * Created by ysayag on 09/05/2017.
 */

var ProfileView = {

    showProfilePage: function() {
        Utils.clearView('.main-container');
        Utils.clearView('#about');
        var profilePage = 'static/gifted/inner-templates/profilePage.html';
        Utils.injectView('.main-container', profilePage, ProfileView.onProfilePageInjected);

    },

    onProfilePageInjected: function() {
        var backToIntro = $('#back-to-intro');
        var $picture = $('#profile-picture');
        var $name = $('#profile-name');
        var $rank = $('#profile-rank');
        var given_name = Utils.readCookie('given_name');
        var user_rank = Utils.readCookie('user_rank');
        var pictureURL = Utils.readCookie('picture');
        pictureURL = pictureURL.replace(/\"/g, "");

        $picture.attr('src', pictureURL);
        $name[0].innerHTML = 'Hello, ' + given_name + '!  ';
        $rank[0].innerHTML = 'Your Rank is: ' + user_rank;

        backToIntro.click(MainView.showMainView);

        var testGifts = {
            'some_gift_id' : {
                'relationship': 'Parent',
                'img_url' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM',
                'uploaded_at' : Date.now(),
                'gift_rank' : 15,
                'price' : 150

            },

            'some_gift_id2' : {
                'relationship': 'Sibling',
                'img_url' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM',
                'uploaded_at' : Date.now(),
                'gift_rank' : 30,
                'price' : 200

            },

            'some_gift_id3' : {
                'relationship': 'Partner',
                'img_url' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM',
                'uploaded_at' : Date.now().toString(),
                'gift_rank' : -5,
                'price' : 70

            },
        };

        console.log(testGifts);
        ProfileView.insertGifts(testGifts);

    },

    insertGifts: function(GiftsObject) {
        $.each(GiftsObject, function(giftKey, giftAttrs) {
            $($('#gifts-list'))
                .append($("<div id=list_" + giftKey + " class='user-gift'></div>"));
            $.each(giftAttrs, function(key, value) {
                if (key == 'img_url') {
                    var img = $('<img>');
                    img.attr('src', value);
                    $('#list_' + giftKey)
                        .append(img);

                }
                else {
                    $($('#list_' + giftKey))
                        .append($("<p></p>")
                            .text(key + ':   ' + value));
                }

            })
        });
    },
};


var MainView = {

    showMainView: function() {
        Utils.clearView('.main-container');
        var IntroHeader = 'static/gifted/inner-templates/IntroHeader.html';
        Utils.injectView('.main-container', IntroHeader);
    },
};

var ResultsView = {
    //TODO ResultsView Functions
};


var AboutView = {
    showAboutView: function() {
        Utils.clearView('#about');
        var AboutPage = 'static/gifted/inner-templates/AboutPage.html';
        Utils.injectView('#about', AboutPage);

    },

    onAboutViewInjected: function() {
        $('a[href="#about"]').click(function(){
            console.log('href to #about');
        });
    },
}