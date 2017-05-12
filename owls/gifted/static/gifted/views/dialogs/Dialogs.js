/**
 * Created by ysayag on 09/05/2017.
 */

window.relationships = {
    'Parent': 'Parent',
    'Grandparent': 'Grandparent',
    'Sibling': 'Sibling',
    'Cousin': 'Cousin',
    'Parent in law': 'Parent in law',
    'Nephew': 'Nephew',
    'Friend': 'Friend',
    'Partner': 'Partner',
    'Child': 'Child',
    'Child in law': 'Child in law',
    'Grandparent in law': 'Grandparent in law',
    'Uncle/Aunt': 'Uncle/Aunt',
    'Sibling in law': 'Sibling in law',
    'Acquaintant': 'Acquaintant',
    'Colleague': 'Colleague',
    'Grandson': 'Grandson',
};

var UploadDialog = {
    // fields: user_id (string), description (250 chars), age (integer), gender ('M', 'F'), price (integer)
    // , relationship (string), img_url :
    //

    showDialog: function() {
        var $description = $('#upload-description'); var $age = $('#upload-age');
        var $gender = $('#upload-gender'); var $price = $('#upload-price');
        var $relationship = $('#upload-relationship'); var $img_url = $('#upload-img-url');

        // DialogUtils.clearInputs($description, $gender, $relationship, $age, $price, $img_url);

        $('#upload-modal').modal();

        // TODO add listeners of modal's input elements
        //TODO add client side input validations
        //TODO add server failure indication (stretch goal)

        UploadDialog.fillRelationships();

        $('#upload-submit').click( function() {
            console.log('submitteddd bro!');
            var obj = {}
            obj['description'] = $description.val();
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = parseInt($age.val());
            obj['img_url'] = $img_url.val();
            obj['price'] = parseInt($price.val());

            console.log('obj', obj)
        });

        // TODO add listeners of modal's input elements + validation etc.
        //TODO add client side input validations
        //TODO add server failure indication (stretch goal)
    },

    onDialogClose: function() {
        $('#upload-modal').modal('hide');
    },

    fillRelationships: function() {
        var relationships = {
            'Parent': 'Parent',
            'Grandparent': 'Grandparent',
            'Sibling': 'Sibling',
            'Cousin': 'Cousin',
            'Parent in law': 'Parent in law',
            'Nephew': 'Nephew',
            'Friend': 'Friend',
            'Partner': 'Partner',
            'Child': 'Child',
            'Child in law': 'Child in law',
            'Grandparent in law': 'Grandparent in law',
            'Uncle/Aunt': 'Uncle/Aunt',
            'Sibling in law': 'Sibling in law',
            'Acquaintant': 'Acquaintant',
            'Colleague': 'Colleague',
            'Grandson': 'Grandson',
        };
        DialogUtils.addOptionsToSelect(window.relationships, '#upload-relationship');
    }

};
var SearchDialog = {

    showDialog: function() {
        $('#search-modal').modal();

    },
    onDialogClose: function() {
        $('#search-modal').modal('hide');
    },

};

var DialogUtils = {

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
            DialogUtils.clearInput(arguments[i]);
        }
    },

    clearInput: function($input) {
       return $input && $input.val('');
    },

    // createJsonFromInputs: function() {
    //     var obj = {};
    //     var i;
    //     for(i = 0; i < arguments.length; i++) {
    //
    //         DialogUtils.clearInput(arguments[i]);
    //     }
    //     console.log(arguments);
    // }
};