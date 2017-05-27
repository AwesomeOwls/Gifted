/**
 * Created by ysayag on 13/05/2017.
 */

var Utils = {

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

    addOptionsToSelect: function(selectValues, $select) {
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
        var keys = Object.keys(obj);
        var key = keys[Math.floor(Math.random()*keys.length)];
        result = obj[key];
        return result;
    },

    injectView: function(selector, template, callback) {
        return $(selector).load(template, null, callback);

        // TODO may be loading indicator in the future(?)
        // var $status = $('#status');var $preloader = $('#preloader');
        // $status.show();
        // $preloader.show();
        // $status.delay(300).fadeOut();
        // return $preloader.delay(300).fadeOut('slow', function () {
        //     return $(selector).load(template, null, callback);
        // });
    },

    clearView: function(selector) {
        $(selector)[0].innerHTML = '';
    }
};

