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

        // backToIntro.click(MainView.showMainView);


        $('#list').click(function(event){event.preventDefault();$('#products .item').addClass('list-group-item');});
        $('#grid').click(function(event){event.preventDefault();$('#products .item').removeClass('list-group-item');$('#products .item').addClass('grid-group-item');});



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

        return '<div class="item  col-xs-4 col-lg-4">'+
            '<div class="thumbnail">' +
            '<img class="group list-group-image" src=' + '"' + gift.gift_img + '"' + 'alt="" />' +
            '<div class="caption">' +
            '<h4 class="group inner list-group-item-heading">' +
            gift.description + '</h4>' +
            '<p class="group inner list-group-item-text">' +
            'Likes: ' + gift.gift_rank +
            '</p>' +
            '<div class="row">' +
            '<div class="col-xs-12 col-md-6">' +
            '<p class="lead">' + 'Price:' +
            gift.price + ' $' + '</p>' +
            '</div>' +
            '<div class="col-xs-12 col-md-6">' +
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
    //TODO ResultsView Functions
    /*
     $(document).ready(function() {
     $('#list').click(function(event){event.preventDefault();$('#products .item').addClass('list-group-item');});
     $('#grid').click(function(event){event.preventDefault();$('#products .item').removeClass('list-group-item');$('#products .item').addClass('grid-group-item');});
     });
     */

    showResultsPage: function(data) {
        window.gifts = data;
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

        return '<div class="item  col-xs-4 col-lg-4">'+
                    '<div class="thumbnail">' +
                            '<img class="group list-group-image" src=' + '"' + gift.gift_img + '"' + 'alt="" />' +
                            '<div class="caption">' +
                                    '<h4 class="group inner list-group-item-heading">' +
                                    gift.description + '</h4>' +
                                '<p class="group inner list-group-item-text">' +
                                'Likes:' + gift.gift_rank +
                                '</p>' +
                                 '<div class="row">' +
                                     '<div class="col-xs-12 col-md-6">' +
                                         '<p class="lead">' + 'Price:' +
                                        gift.price + ' $' + '</p>' +
                                    '</div>' +
                                     '<div class="col-xs-12 col-md-6">' +
                                          '<button  onclick="ResultsView.likeGift(this.id)" class="btn btn-like" id=' + '"' + gift.gift_id + '"' + '>' + 'Like ' +
                                             '<img class="owl-like" src="static/gifted/img/owl_like.png">' +
                                          '</button>' +
                                    '</div>' +
                                 '</div>' +
                            '</div>' +
                    '</div>' +
              '</div>'
    },


    likeGift: function(giftID) {
        console.log('gift id: ', giftID);
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