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
    showDialog: function() {
        $('#upload-modal').modal();
        // TODO add listeners of modal's input elements + validation etc.
        //TODO add client side input validations
        //TODO add server failure indication (stretch goal)
    },
    onDialogClose: function() {
        $('#upload-modal').modal('hide');
    }

}