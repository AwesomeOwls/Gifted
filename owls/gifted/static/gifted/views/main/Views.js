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


        $('#list').click(function(event){event.preventDefault();$('#products .item').addClass('list-group-item');});
        $('#grid').click(function(event){event.preventDefault();$('#products .item').removeClass('list-group-item');$('#products .item').addClass('grid-group-item');});



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

        ProfileView.insertGifts(testGifts);

    },

    // insertGifts: function(GiftsObject) {
    //     $.each(GiftsObject, function(giftKey, giftAttrs) {
    //         $($('#gifts-list'))
    //             .append($("<div id=list_" + giftKey + " class='user-gift'></div>"));
    //         $.each(giftAttrs, function(key, value) {
    //             if (key == 'img_url') {
    //                 var img = $('<img>');
    //                 img.attr('src', value);
    //                 $('#list_' + giftKey)
    //                     .append(img);
    //
    //             }
    //             else {
    //                 $($('#list_' + giftKey))
    //                     .append($("<p></p>")
    //                         .text(key + ':   ' + value));
    //             }
    //
    //         })
    //     });
    // },
    //
    // createGiftElement: function() {
    //
    // },

    insertGifts: function(GiftsObject) {
        // $.each(GiftsObject, function(giftKey, giftAttrs) {
        //     $($('#products'))
        //         .append($(ResultsView.createGiftElement()))
        // });
        var i;
        for (i = 0; i < 50; i++) {
            $($('#products'))
                .append($(ProfileView.createGiftElement()))
        }
    },

    createGiftElement: function() {

        return '<div class="item  col-xs-4 col-lg-4">'+
            '<div class="thumbnail">' +
            '<img class="group list-group-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM" alt="" />' +
            '<div class="caption">' +
            '<h4 class="group inner list-group-item-heading">' +
            'Gift Name</h4>' +
            '<p class="group inner list-group-item-text">' +
            'Gift details and fields goes here... Lorem ipsum dolor sit amet, consectetuer adipiscing elit,' +
            'sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>' +
            '<div class="row">' +
            '<div class="col-xs-12 col-md-6">' +
            '<p class="lead">' +
            '$21.000</p>' +
            '</div>' +
            '<div class="col-xs-12 col-md-6">' +
            '<a class="btn btn-primary" href="http://www.jquery2dotnet.com">Like Gift</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
    },
};


var MainView = {

    showMainView: function() {
        Utils.clearView('.main-container');
        var IntroHeader = 'static/gifted/inner-templates/IntroHeader.html';
        Utils.injectView('.main-container', IntroHeader);
    },

    initMainView: function() {
        MainView.showMainView();
        var $home = $('#home-button');
        $home.click(MainView.showMainView);

        if (!Utils.readCookie('user_id'))
        {
            NavBar.setLoginButton(); // set listener to login function on login button
        }
        else {
            var given_name = Utils.readCookie('given_name');
            var pictureURL = Utils.readCookie('picture');
            GoogleAuth.onValidatedUser(given_name, pictureURL);
        }
    },
};

var ResultsView = {
    //TODO ResultsView Functions
    /*
     $(document).ready(function() {
     $('#list').click(function(event){event.preventDefault();$('#products .item').addClass('list-group-item');});
     $('#grid').click(function(event){event.preventDefault();$('#products .item').removeClass('list-group-item');$('#products .item').addClass('grid-group-item');});
     });
     */

    showResultsPage: function() {
        Utils.clearView('.main-container');
        Utils.clearView('#about');
        var ResultsPage = 'static/gifted/inner-templates/searchResultsPage.html';
        Utils.injectView('.main-container', ResultsPage, ResultsView.onResultsPageInjected);

    },

    onResultsPageInjected: function() {
        var backToIntro = $('#back-to-intro');

        backToIntro.click(MainView.showMainView);

        $('#list').click(function(event){event.preventDefault();$('#products .item').addClass('list-group-item');});
        $('#grid').click(function(event){event.preventDefault();$('#products .item').removeClass('list-group-item');$('#products .item').addClass('grid-group-item');});


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

        testGifts = {a:1 , b: 2 ,c :3};
        ResultsView.insertGifts(testGifts);

    },

    insertGifts: function(GiftsObject) {
        // $.each(GiftsObject, function(giftKey, giftAttrs) {
        //     $($('#products'))
        //         .append($(ResultsView.createGiftElement()))
        // });
        var i;
        for (i = 0; i < 50; i++) {
            $($('#products'))
                .append($(ResultsView.createGiftElement()))
        }
    },

    createGiftElement: function() {

        return '<div class="item  col-xs-4 col-lg-4">'+
                    '<div class="thumbnail">' +
                            '<img class="group list-group-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM" alt="" />' +
                            '<div class="caption">' +
                                    '<h4 class="group inner list-group-item-heading">' +
                                    'Gift Name</h4>' +
                                '<p class="group inner list-group-item-text">' +
                                    'Gift details and fields goes here... Lorem ipsum dolor sit amet, consectetuer adipiscing elit,' +
                                    'sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>' +
                                 '<div class="row">' +
                                     '<div class="col-xs-12 col-md-6">' +
                                         '<p class="lead">' +
                                           '$21.000</p>' +
                                    '</div>' +
                                     '<div class="col-xs-12 col-md-6">' +
                                          '<a class="btn btn-primary" href="http://www.jquery2dotnet.com">Like Gift</a>' +
                                    '</div>' +
                                 '</div>' +
                            '</div>' +
                    '</div>' +
              '</div>'
    },

};


var AboutView = {
    showAboutView: function() {
        Utils.clearView('#about');
        var AboutPage = 'static/gifted/inner-templates/AboutPage.html';
        Utils.injectView('#about', AboutPage);

    },

    onAboutViewInjected: function() {
        $('a[href="#about"]').click(function(){
        });
    },
}