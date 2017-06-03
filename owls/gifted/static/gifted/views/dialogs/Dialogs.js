
window.relationships = {
    'parent': 'Parent',
    'grandparent': 'Grandparent',
    'sibling': 'Sibling',
    'cousin': 'Cousin',
    'parent_in_law': 'Parent in law',
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

    showDialog: function() {
        var $description = $('#upload-description'); var $age = $('#upload-age');
        var $title = $('#upload-title');
        var $gender = $('#upload-gender'); var $price = $('#upload-price');
        var $relationship = $('#upload-relationship'); var $img_url = $('#upload-img-url');
        var $relationship_score = $('#upload-relationship-score'); var $relationship2 = $('#upload-relationship2');
        var $status = $('#status'); var $preloader = $('#preloader'); var $body = $('body');
        UploadDialog.fillRelationships();

        $('#upload-modal').modal();

        $('#upload-modal').on('hidden.bs.modal',UploadDialog.onDialogClose);

        //TODO add client side input validations + required fields (stretch goal)
        //TODO add server failure indication (stretch goal)
        var randomRelation = Utils.pickRandomProperty(window.relationships);
        var obj = {};

        obj['relationship2'] = randomRelation;
        $relationship2.text(window.relationships[randomRelation]);

        $('#upload-submit').click( function() {

            if (!UploadDialog.uploadFormValidation()) return false;

            obj['title'] = $title.val();
            obj['description'] = $description.val();
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = parseInt($age.val());
            obj['img_url'] = $img_url.val();
            obj['price'] = parseInt($price.val());
            obj['relationship_score'] = 6 - parseInt($relationship_score.val());

            UploadDialog.closeDialog();
            UploadDialog.onDialogClose();
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
                    Utils.clearInputs($description, $title, $age, $price, $img_url);
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
            return false;
        });
    },

    closeDialog: function() {
        $('#upload-modal').modal('hide');
    },

    onDialogClose: function() {
        $('#upload-submit').off('click');
        $('#upload-modal').off('hidden.bs.modal');
    },

    fillRelationships: function() {
        Utils.setOptionsToSelect(window.relationships, '#upload-relationship');
    },

    uploadFormValidation: function() {
        var $age = $('#upload-age');
        var $title = $('#upload-title');
        var $price = $('#upload-price');
        var $img_url = $('#upload-img-url');
        var age = $age.val();
        var title = $title.val();
        var price = $price.val();
        var img_url = $img_url.val();

        // var urlregex = new RegExp( "/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi");
        var isValid = true;

        // image url validation is done in server side
        // if(img_url && !urlregex.test(img_url)) {
        //     $img_url.closest('.form-group').addClass('has-error');
        //     $img_url.siblings('.error')[0].innerText = 'Invalid URL address';
        //     isValid = false;
        // }
        // else {
        //     $img_url.closest('.form-group').removeClass('has-error');
        //     $img_url.siblings('.error')[0].innerText = '';
        // }

        // age
        if(!age || +age >= '200' || +age <= '0') {
            $age.closest('.form-group').addClass('has-error');
            $age.siblings('.error')[0].innerText = 'Age is required (between 1 to 199)';
            isValid = false;
        }
        else {
            $age.closest('.form-group').removeClass('has-error');
            $age.siblings('.error')[0].innerText = '';
        }
        // title
        if(!title) {
            $title.closest('.form-group').addClass('has-error');
            $title.siblings('.error')[0].innerText = 'Gift Title is required';
            isValid = false;
        }
        else {
            $title.closest('.form-group').removeClass('has-error');
            $title.siblings('.error')[0].innerText = '';
        }
        // price
        if(!price || +price <= '0') {
            $price.closest('.form-group').addClass('has-error');
            $price.siblings('.error')[0].innerText = 'Price is required (positive number)';
            isValid = false;
        }
        else {
            $price.closest('.form-group').removeClass('has-error');
            $price.siblings('.error')[0].innerText = '';
        }

       return isValid;
    }

};

var SearchDialog = {

    showDialog: function() {
        var $age = $('#search-age'); var $gender = $('#search-gender'); var $price_from = $('#search-price-from');
        var $price_to = $('#search-price-to');var $relationship = $('#search-relationship');
        var $status = $('#status');var $preloader = $('#preloader'); var $body = $('body');
        SearchDialog.fillRelationships();

        $('#search-modal').modal();

        $('#search-modal').on('hidden.bs.modal',SearchDialog.onDialogClose);

        $('#search-submit').click( function() {

            if (!SearchDialog.searchFormValidation()) return false;

            var obj = {};
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = parseInt($age.val());
            obj['price'] = $price_from.val() + '-' + $price_to.val();
            SearchDialog.closeDialog();
            SearchDialog.onDialogClose();
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
                    Utils.clearInputs($age, $price_from, $price_to);
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
            return false;
        });

    },
    closeDialog: function() {
        $('#search-modal').modal('hide');
    },

    onDialogClose: function() {
        $('#search-submit').off('click');
        $('#search-modal').off('hidden.bs.modal');
    },

    fillRelationships: function() {
        Utils.setOptionsToSelect(window.relationships, '#search-relationship');
    },


    searchFormValidation: function() {
        var $age = $('#search-age');
        var $price_from = $('#search-price-from');
        var $price_to = $('#search-price-to');
        var age = $age.val();
        var price_from = $price_from.val();
        var price_to = $price_to.val();

        var urlregex = new RegExp( "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");

        var isValid = true;

        // age
        if(!age || +age >= '200' || +age <= '0') {
            $age.closest('.form-group').addClass('has-error');
            $age.siblings('.error')[0].innerText = 'Age is required (between 1 to 199)';
            isValid = false;
        }
        else {
            $age.closest('.form-group').removeClass('has-error');
            $age.siblings('.error')[0].innerText = '';
        }
        // price
        if(!price_from || !price_to) {
            $price_from.closest('.form-group').addClass('has-error');
            $price_to.closest('.form-group').addClass('has-error');
            $price_from.siblings('.error')[0].innerText = 'Price range is required';
            isValid = false;
        }
        else if(+price_from >= +price_to) {
            $price_from.closest('.form-group').addClass('has-error');
            $price_to.closest('.form-group').addClass('has-error');
            $price_from.siblings('.error')[0].innerText = 'Price range invalid';
            isValid = false;
        }
        else {
            $price_from.closest('.form-group').removeClass('has-error');
            $price_to.closest('.form-group').removeClass('has-error');
            $price_from.siblings('.error')[0].innerText = '';
        }

        return isValid;
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