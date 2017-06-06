/**
 * Created by ysayag on 09/05/2017.
 */

var ProfileView = {

    showProfilePage: function(gifts) {
        window.userGifts = gifts
        Utils.clearView('.main-container');
        var profilePage = 'static/gifted/inner-templates/profilePage.html';
        Utils.injectView('.main-container', profilePage, ProfileView.onProfilePageInjected, 'background1_80.jpg');

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

        ProfileView.insertGifts(window.userGifts);

    },

    insertGifts: function(GiftsObject) {
        var $products = $('#products');
        if (!GiftsObject || !GiftsObject.length) {
            return $($products).append($('<h3 class="h3_home wow fadeIn" data-wow-delay="0.4s">No Gifts</h3>'));
        }
        var i;
        for (i = 0; i < GiftsObject.length; i++) {
            $($products).append($(ProfileView.createGiftElement(GiftsObject[i])))
        }
    },

    createGiftElement: function(gift) {
        var img_url = gift.gift_img || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReMxYxGBiScljKXJ3De1t8vLewNDml3yDPYlgL_19Jkzgh6VyZ2mtTUA';


        return '<div class="item  col-xs-4 col-lg-4 grid-group-item">'+
            '<div class="thumbnail">' +
            '<img class="group list-group-image" src=' + '"' + img_url + '"' + 'alt="" />' +
            '<div class="caption">' +
            '<h4 class="group inner list-group-item-heading">' +
            gift.title + '</h4>' +
            '<div class="row">' +
            '<div class="col-xs-12 col-md-6">' +
            '<p class="lead">' + 'Price: ' +
            gift.price + ' ₪' + '</p>' +
            '</div>' +
            '<div class="col-xs-12 col-md-6">' +
            '<p class="lead">' +
            'Likes: ' + gift.gift_rank +
            '</p>' +
            '</div>' +
            '</div>' +
            '<div class="row">' +
            gift.description +
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
        Utils.injectView('.main-container', IntroHeader, null, 'background1.jpg');
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

    showResultsPage: function(gifts) {
        window.resultsGifts = gifts;
        Utils.clearView('.main-container');
        var ResultsPage = 'static/gifted/inner-templates/searchResultsPage.html';
        Utils.injectView('.main-container', ResultsPage, ResultsView.onResultsPageInjected, 'background1_80.jpg');

    },

    onResultsPageInjected: function() {
        ResultsView.insertGifts(window.resultsGifts);

    },

    insertGifts: function(GiftsObject) {
        var $products = $('#products');

        if (!GiftsObject || !GiftsObject.length) {
            return $($products).append($('<h3 class="h3_home wow fadeIn" data-wow-delay="0.4s">No Results</h3>'));
        }
        var i;
        for (i = 0; i < GiftsObject.length; i++) {
            $($products).append($(ResultsView.createGiftElement(GiftsObject[i])));
        }
    },

    createGiftElement: function(gift) {
        var img_url = gift.gift_img || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReMxYxGBiScljKXJ3De1t8vLewNDml3yDPYlgL_19Jkzgh6VyZ2mtTUA';
        var disableLike = false;
        var disableDislike = false;
        var liked_users = JSON.parse(gift.liked_users);
        var userID = Utils.readCookie('user_id');
        var rated_by_user = _.find(liked_users, { 'user_id': userID});
        if (rated_by_user) {
            if (rated_by_user.is_like) disableLike = true;
            else disableDislike = true;
        }


        return '<div class="item  col-xs-4 col-lg-4 grid-group-item">'+
                    '<div class="thumbnail">' +
                            '<img class="help-us help_' + gift.gift_id + '" onclick="ResultsView.showQuestionDialog(this)" src="static/gifted/img/help-us1.jpeg">' +
                            '<img class="group list-group-image" src=' + '"' + img_url + '"' + 'alt="" />' +
                            '<div class="caption">' +
                                    '<h4 class="group inner list-group-item-heading">' +
                                    gift.title + '</h4>' +
                                    '<div class="btn-group">' +
                                         '<button  onclick="ResultsView.likeGift(1, this)" class="btn btn-like" like-id=' + '"' + gift.gift_id + '"' + (disableLike ? 'disabled' : '') + '>' + 'Like ' +
                                             '<img class="owl-like" src="static/gifted/img/owl_like.png">' +
                                          '</button>' +
                                          '<button  onclick="ResultsView.likeGift(-1, this)" class="btn btn-dislike" dislike-id=' + '"' + gift.gift_id + '"' + (disableDislike ? 'disabled' : '') + '>' + 'Dislike ' +
                                             '<img class="owl-like" src="static/gifted/img/owl_like.png">' +
                                          '</button>' +
                                    '</div>' +
                                 '<div class="row">' +
                                     '<div class="col-xs-12 col-md-6">' +
                                         '<p class="lead">' + 'Price: ' +
                                        gift.price + ' ₪' + '</p>' +
                                    '</div>' +
                                     '<div class="col-xs-12 col-md-6">' +
                                        '<p class="lead likes_' + gift.gift_id + '">' +
                                           'Likes: ' + gift.gift_rank +
                                        '</p>' +
                                    '</div>' +
                                 '</div>' +
                                '<div class="row">' +
                                          gift.description +
                                '</div>' +
                            '</div>' +
                    '</div>' +
              '</div>'
    },


    likeGift: function(like, el) {
        var giftID = el.getAttribute('like-id') || el.getAttribute('dislike-id');
        var giftObject = $.grep(window.resultsGifts, function(e){ return e.gift_id == giftID; })[0];
        var currentRank = giftObject.gift_rank;
        var newRank = giftObject.gift_rank = currentRank + like;
        var obj = {};
        obj.gift_id = giftID;
        obj.like = like;
        $.ajax({
            type: "POST",
            url: "http://localhost:63343/like/",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(obj),
            dataType: "json",
            beforeSend: function(data){
                $(el).addClass(like == 1 ? 'like-glow' : 'dislike-glow');
                $('.likes_' + giftID)[0].innerText = 'Likes: ' + '...';
            },
            success: function(data){
                // el.disabled = true;
                // TODO Yehonatan: toggling!
                $(el).removeClass(like == 1 ? 'like-glow' : 'dislike-glow');
                $('.likes_' + giftID)[0].innerText = 'Likes: ' + newRank;
            },
            error: function(error){
                $(el).removeClass(like == 1 ? 'like-glow' : 'dislike-glow');
                $('.likes_' + giftID)[0].innerText = 'Likes: ' + currentRank;
                errorDialog.showDialog(error.responseText);
            },
        });
    },
    showQuestionDialog: function( el) {
        var giftID = parseInt(el.className.replace(/[^0-9\.]/g, ''), 10);
        console.log('should pop question regarding gift id:', giftID);
    },

};


var AboutView = {
    showAboutView: function() {
        Utils.clearView('.main-container');
        var AboutPage = 'static/gifted/inner-templates/AboutPage.html';
        Utils.injectView('.main-container', AboutPage, null, 'background1_80.jpg');

    },
}