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
        var $relationship_score = $('#upload-relationship-score'); var $relationship2 = $('#upload-relationship2');

        // DialogUtils.clearInputs($description, $gender, $relationship, $age, $price, $img_url);
        UploadDialog.fillRelationships();

        $('#upload-modal').modal();

        // TODO add listeners of modal's input elements
        //TODO add client side input validations
        //TODO add server failure indication (stretch goal)
        var randomRelation = DialogUtils.pickRandomProperty(window.relationships); // TODO random generate
        $relationship2.text(randomRelation);

        $('#upload-submit').click( function() {
            console.log('upload form submitteddd bro!');
            var obj = {};
            obj['description'] = $description.val();
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = parseInt($age.val());
            obj['img_url'] = $img_url.val();
            obj['price'] = parseInt($price.val());
            obj['relationship_score'] = parseInt($relationship_score.val());
            obj['relationship2'] = $relationship2.val();

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

    pickRandomProperty: function(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
                result = prop;
        return result;
    }
};