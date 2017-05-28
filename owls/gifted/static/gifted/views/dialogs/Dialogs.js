
window.relationships = {
    'parent': 'Parent',
    'grandparent': 'Grandparent',
    'sibling': 'Sibling',
    'cousin': 'Cousin',
    'parent in law': 'Parent in law',
    'nephew': 'Nephew',
    'friend': 'Friend',
    'partner': 'Partner',
    'child': 'Child',
    'child_in_law': 'Child in law',
    'grandparent_in_law': 'Grandparent in law',
    'uncle_aunt': 'Uncle/Aunt',
    'sibling_in_law': 'Sibling in law',
    'acquaintant': 'Acquaintant',
    'colleague': 'Colleague',
    'grandson': 'Grandson',
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
        var $status = $('#status'); var $preloader = $('#preloader'); var $body = $('body');
        // Utils.clearInputs($description, $gender, $relationship, $age, $price, $img_url);
        UploadDialog.fillRelationships();

        $('#upload-modal').modal();

        //TODO add client side input validations (stretch goal)
        //TODO add server failure indication (stretch goal)
        var randomRelation = Utils.pickRandomProperty(window.relationships); // TODO random generate
        var obj = {};

        obj['relationship2'] = randomRelation;
        $relationship2.text(window.relationships[randomRelation]);

        $('#upload-submit').click( function() {

            obj['description'] = $description.val();
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = parseInt($age.val());
            obj['img_url'] = $img_url.val();
            obj['price'] = parseInt($price.val());
            obj['relationship_score'] = 6 - parseInt($relationship_score.val());

            $('#upload-submit').off('click');
            $.ajax({
                type: "POST",
                url: "http://localhost:63343/upload/",
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

        });

        // TODO add listeners of modal's input elements + validation etc.
        //TODO add client side input validations
        //TODO add server failure indication (stretch goal)
    },

    closeDialog: function() {
        $('#upload-modal').modal('hide');
    },

    fillRelationships: function() {
        Utils.setOptionsToSelect(window.relationships, '#upload-relationship');
    }

};

var SearchDialog = {

    showDialog: function() {
        var $age = $('#search-age'); var $gender = $('#search-gender'); var $price = $('#search-price');
        var $relationship = $('#search-relationship'); var $status = $('#status');
        var $preloader = $('#preloader'); var $body = $('body');
        SearchDialog.fillRelationships();

        $('#search-modal').modal();

        $('#search-submit').click( function() {


            var obj = {};
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = parseInt($age.val());
            obj['price'] = parseInt($price.val());

            $('#search-submit').off('click');
            $.ajax({
                type: "POST",
                url: "http://localhost:63343/search/",
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
                        ResultsView.showResultsPage(data.gifts);
                    });
                },
                error: function(error){
                    $status.hide();
                    $preloader.hide();
                    errorDialog.showDialog(error.responseText);
                },
            });
        });

    },
    closeDialog: function() {
        $('#search-modal').modal('hide');
    },


    fillRelationships: function() {
        Utils.setOptionsToSelect(window.relationships, '#search-relationship');
    }

};

var errorDialog = {

    showDialog: function(errorText) {
        Utils.clearView('.error-text');
        $('#error-modal').modal();
        $('.error-text')[0].innerHTML = errorText;

    },
    closeDialog: function() {
        $('#serror-modal').modal('hide');
    },

};