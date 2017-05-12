/**
 * Created by ysayag on 09/05/2017.
 */
var UploadDialog = {
    // fields: user_id (string), description (250 chars), age (integer), gender ('M', 'F'), price (integer)
    // , relationship (string), img_url :
    //

    showDialog: function() {
        $('#upload-modal').modal();
        // TODO add listeners of modal's input elements
        //TODO add client side input validations
        //TODO add server failure indication (stretch goal)
    },
    onDialogClose: function() {
        $('#upload-modal').modal('hide');
    }

}
var SearchDialog = {



    showDialog: function() {
        $('#upload-modal').modal();

        SearchDialog.fillRelationships()
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
        DialogUtils.addOptionsToSelect(relationships, '#search-relationships');
    }

};

var DialogUtils = {

    addOptionsToSelect: function(selectValues, $select) {
        $.each(selectValues, function(key, value) {
            $($select)
                .append($("<option></option>")
                    .attr("value", key)
                    .text(value));
        });
    }
};