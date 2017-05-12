/**
 * Created by ysayag on 09/05/2017.
 */
var UploadDialog = {
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

    fields: {
      // age is free text
      gender: {
          'Male' : 'male',
          'Female' : 'female',
          'Other' : 'other'

      },
      relationship: {
          //TODO relationship representation

      },
      price: {


      },

    },

    showDialog: function() {
        $('#upload-modal').modal();
        // TODO add listeners of modal's input elements + validation etc.
        //TODO add client side input validations
        //TODO add server failure indication (stretch goal)
    },
    onDialogClose: function() {
        $('#upload-modal').modal('hide');
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