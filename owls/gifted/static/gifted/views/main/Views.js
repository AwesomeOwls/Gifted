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

        var testGifts = [
            {
                'relationship': 'Parent',
                'description': 'cool giftttt',
                'gift_img' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM',
                'gift_rank' : 15,
                'price' : 150

            },

            {
                'relationship': 'Sibling',
                'description': 'amazing giftttt',
                'gift_img' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM',
                'gift_rank' : 30,
                'price' : 200

            },
            {
                'relationship': 'Partner',
                'description': 'some giftttt',
                'gift_img' : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLf_4lq5fH2GyiX94B7o8wKNXmDwPcQE3KIFBn8eMFdHwPwozM',
                'gift_rank' : -5,
                'price' : 70

            },
        ];

        ProfileView.insertGifts(testGifts);

    },

    insertGifts: function(GiftsObject) {
        var $products = $('#products');
        var i;
        for (i = 0; i < GiftsObject.length; i++) {
            $($products).append($(ProfileView.createGiftElement(GiftsObject[i])))
        }
    },

    createGiftElement: function(gift) {

        return '<div class="item  col-xs-4 col-lg-4 grid-group-item">'+
            '<div class="thumbnail">' +
            '<img class="group list-group-image" src=' + '"' + gift.gift_img + '"' + 'alt="" />' +
            '<div class="caption">' +
            '<h4 class="group inner list-group-item-heading">' +
            gift.description + '</h4>' +
            '<div class="row">' +
            '<div class="col-xs-12 col-md-6">' +
            '<p class="lead">' + 'Price: ' +
            gift.price + ' $' + '</p>' +
            '</div>' +
            '<div class="col-xs-12 col-md-6">' +
            '<p class="lead">' +
            'Likes: ' + gift.gift_rank +
            '</p>' +
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
        var $home = $('#home-button');

        MainView.showMainView();
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

    showResultsPage: function(data) {
        window.gifts = data;
        Utils.clearView('.main-container');
        Utils.clearView('#about');
        var ResultsPage = 'static/gifted/inner-templates/searchResultsPage.html';
        Utils.injectView('.main-container', ResultsPage, ResultsView.onResultsPageInjected);

    },

    onResultsPageInjected: function() {
        ResultsView.insertGifts(window.gifts);

    },

    insertGifts: function(GiftsObject) {
        var $products = $('#products');
        var i;
        for (i = 0; i < GiftsObject.length; i++) {
            $($products)
                .append($(ResultsView.createGiftElement(GiftsObject[i])))
        }
    },

    createGiftElement: function(gift) {

        return '<div class="item  col-xs-4 col-lg-4 grid-group-item">'+
                    '<div class="thumbnail">' +
                            '<img class="group list-group-image" src=' + '"' + gift.gift_img + '"' + 'alt="" />' +
                            '<div class="caption">' +
                                    '<h4 class="group inner list-group-item-heading">' +
                                    gift.description + '</h4>' +
                                    '<div class="btn-group">' +
                                         '<button  onclick="ResultsView.likeGift(this.id, 1)" class="btn btn-like" id=' + '"' + gift.gift_id + '"' + '>' + 'Like ' +
                                             '<img class="owl-like" src="static/gifted/img/owl_like.png">' +
                                          '</button>' +
                                          '<button  onclick="ResultsView.likeGift(this.id, -1)" class="btn btn-dislike" id=' + '"' + gift.gift_id + '"' + '>' + 'Dislike ' +
                                             '<img class="owl-like" src="static/gifted/img/owl_like.png">' +
                                          '</button>' +
                                    '</div>' +
                                 '<div class="row">' +
                                     '<div class="col-xs-12 col-md-6">' +
                                         '<p class="lead">' + 'Price: ' +
                                        gift.price + ' $' + '</p>' +
                                    '</div>' +
                                     '<div class="col-xs-12 col-md-6">' +
                                        '<p class="lead">' +
                                           'Likes: ' + gift.gift_rank +
                                        '</p>' +
                                    '</div>' +
                                 '</div>' +
                            '</div>' +
                    '</div>' +
              '</div>'
    },


    likeGift: function(giftID, like) {
        var $status = $('#status'); var $preloader = $('#preloader'); var $body = $('body');


        console.log('gift id: ', giftID);
        var obj = {};
        obj.gift_id = giftID;
        obj.like = like;
        $.ajax({
            type: "POST",
            url: "http://localhost:63343/like/",
            // The key needs to match your method's input parameter (case-sensitive).
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(obj),
            dataType: "json",
            beforeSend: function(){
                $status.show();
                $preloader.show();
            },
            success: function(data){
                $preloader.delay(300).fadeOut('slow', function () {
                    $body.delay(550).css({'overflow': 'visible'});
                });
            },
            error: function(error){
                $status.hide();
                $preloader.hide();
                errorDialog.showDialog(error.responseText);
            },
        });
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