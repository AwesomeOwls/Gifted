/**
 * Created by ysayag on 13/05/2017.
 */

var Utils = {

    BRONZE_RANK: 0,
    SILVER_RANK: 50,
    GOLD_RANK: 150,
    DIAMOND_RANK: 250,
    INITIAL_BAR_WIDTH: 90,
    BAR_STEP: 3.40,
    GOLD_CARD_VALUE: 150,
    GOLD_CARD_REWARD: 50,
    DIAMOND_CARD_VALUE: 250,
    DIAMOND_CARD_REWARD: 100,



    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },

    setOptionsToSelect: function(selectValues, $select) {
        $($select)[0].innerHTML = ''
        $.each(selectValues, function(key, value) {
            $($select)
                .append($("<option></option>")
                    .attr("value", key)
                    .text(value));
        });
    },

    clearInputs: function() {
        var i;
        for(i = 0; i < arguments.length; i++) {
            Utils.clearInput(arguments[i]);
        }
    },

    clearInput: function($input) {
        return $input && $input.val('');
    },

    pickRandomProperty: function(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
                result = prop;
        return result;
    },

    injectView: function(selector, template, callback, background) {
        if (background) $(selector).css('background-image', 'url(static/gifted/img/' + background + ')');
        else {
            $(selector).css('background-image', 'none');
        }

        return $(selector).load(template, null, callback);
    },

    clearView: function(selector) {
        $(selector)[0].innerHTML = '';
    },

    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    getUserRank: function() {
        return Utils.readCookie('user_rank');
    },

    getUserName: function() {
        return Utils.readCookie('given_name');
    },

    getUserImageURL: function() {
        var pictureURL = Utils.readCookie('picture');
        return pictureURL ? pictureURL.replace(/\"/g, "") : false;
    },

    getRankColor: function() {
        var userRank = Utils.getUserRank();
        if (userRank < Utils.BRONZE_RANK) return 'red';
        if (userRank >= Utils.BRONZE_RANK && userRank < Utils.SILVER_RANK) return 'bronze';
        if (userRank >= Utils.SILVER_RANK && userRank < Utils.GOLD_RANK) return 'silver';
        if (userRank >= Utils.GOLD_RANK && userRank < Utils.DIAMOND_RANK) return 'gold';
        if (userRank >= Utils.DIAMOND_RANK) return 'diamond';
    }
};

