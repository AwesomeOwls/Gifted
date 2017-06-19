
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
        var $trusted = $('#upload-trusted');
        var $gender = $('#upload-gender'); var $price = $('#upload-price');
        var $relationship = $('#upload-relationship'); var $img_url = $('#upload-img-url');
        var $relationship_score = $('#upload-relationship-score'); var $relationship2 = $('#upload-relationship2');
        var $status = $('#status'); var $preloader = $('#preloader'); var $body = $('body');
        UploadDialog.fillRelationships();
        Utils.isUserTrusted() ? $trusted.show() : $trusted.hide();

        $('#upload-modal').modal();

        $('#upload-modal').on('hidden.bs.modal',UploadDialog.onDialogClose);



        var randomRelation = Utils.pickRandomProperty(window.relationships);
        var obj = {};

        while(randomRelation==$relationship.val())
        {
            randomRelation = Utils.pickRandomProperty(window.relationships);
        }
        obj['relationship2'] = randomRelation;
        $relationship2.text(window.relationships[randomRelation]);

        $relationship.on('change', function() {
            var randomRelation = Utils.pickRandomProperty(window.relationships);
            var obj = {};

            while(randomRelation==$relationship.val())
            {
                randomRelation = Utils.pickRandomProperty(window.relationships);
            }
            obj['relationship2'] = randomRelation;
            $relationship2.text(window.relationships[randomRelation]);
        })

        $('#upload-submit').click( function() {

            if (!UploadDialog.uploadFormValidation()) return false;

            obj['title'] = $title.val();
            obj['description'] = $description.val();
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = parseInt($age.val());
            obj['img_url'] = $img_url.val();
            obj['price'] = parseInt($price.val());
            obj['relationship_score'] = 6 - parseFloat($relationship_score.rateYo("option", "rating"));

            UploadDialog.closeDialog();
            UploadDialog.onDialogClose();
            $.ajax({
                type: "POST",
                url: "http://localhost:63343/upload/",
                // The key needs to match your method's input parameter (case-sensitive).
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(obj),
                dataType: "json",
                beforeSend: Utils.beforeSend,
                success: function(data){
                    $relationship_score.rateYo("option", "rating", 0);
                    Utils.clearInputs($description, $title, $age, $price, $img_url);
                    $preloader.delay(300).fadeOut('slow', function () {
                        $body.delay(550).css({'overflow': 'visible'});
                        successDialog.showDialog('Gift Uploaded Successfully');
                        NavBar.updateTopBar();
                        ProfileView.initProfilePageData();
                    });
                },
                error: function(error){
                    NavBar.updateTopBar();
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
        var age = $age.val();
        var title = $title.val();
        var price = $price.val();

        var isValid = true;

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
            $price.siblings('.error')[0].innerText = 'Price is required';
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

        $('[data-toggle="tooltip"]').tooltip();

        $('#search-submit').click( function() {

            if (!SearchDialog.searchFormValidation()) return false;

            var obj = {};
            obj['gender'] = $gender.val();
            obj['relationship'] = $relationship.val();
            obj['age'] = $age.val();
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
                beforeSend: Utils.beforeSend,
                success: function(data){
                    Utils.clearInputs($age, $price_from, $price_to);
                    $preloader.delay(300).fadeOut('slow', function () {
                        NavBar.updateTopBar();
                        $body.delay(550).css({'overflow': 'visible'});
                        ResultsView.showResultsPage(data.gifts);
                    });
                },
                error: function(error){
                    NavBar.updateTopBar();
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

        var isValid = true;

        // age
        if (age.indexOf('-') != -1) {
            var age_from = age.split('-')[0];
            var age_to = age.split('-')[1];
            if (+age_from > +age_to) {
                $age.closest('.form-group').addClass('has-error');
                $age.siblings('.error')[0].innerText = 'Age should be between 1 to 199. examples: "45", "20-30"';
                isValid = false;
            }
        }
        else if(+age >= '200' || +age <= '0') {
            $age.closest('.form-group').addClass('has-error');
            $age.siblings('.error')[0].innerText = 'Age should be between 1 to 199. examples: "45", "20-30"';
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
        try {
            var errObj = JSON.parse(errorText);
            var errMsg = errObj.status || 'Internal Server Error';
            var errCode = errObj.status_code;
        } catch (e) {
            errMsg = 'Internal Server Error';
            errCode = undefined;
        }
        console.error('err', errMsg);

        Utils.clearView('.error-message');
        $('#error-modal').modal();
        $('.error-message')[0].innerHTML = errMsg;
        $('#error-modal').on('hidden.bs.modal',errorDialog.onDialogClose);

        if (errCode == 405){
            GoogleAuth.signOut()
        }
    },
    closeDialog: function() {
        $('#error-modal').modal('hide');
    },

    onDialogClose: function() {
        // this function might not be actually called as modal is dismissed via different binding
        $('#error-modal').off('hidden.bs.modal');
    }

};

var noticeDialog = {

    showDialog: function(noticeMessage) {

        Utils.clearView('.notice-message');
        $('#notice-modal').modal();
        $('.notice-message')[0].innerHTML = noticeMessage;
        $('#notice-modal').on('hidden.bs.modal',noticeDialog.onDialogClose);
    },
    closeDialog: function() {
        $('#notice-modal').modal('hide');
    },

    onDialogClose: function() {
        // this function might not be actually called as modal is dismissed via different binding
        $('#notice-modal').off('hidden.bs.modal');
    }

};

var successDialog = {

    showDialog: function(successMsg) {
        Utils.clearView('.success-message');
        $('#success-modal').modal();
        $('.success-message')[0].innerHTML = successMsg;
        $('#success-modal').on('hidden.bs.modal',successDialog.onDialogClose);

    },
    closeDialog: function() {
        $('#success-modal').modal('hide');
    },

    onDialogClose: function() {
        // this function might not be actually called as modal is dismissed via different binding
        $('#success-modal').off('hidden.bs.modal');
    }

};

var QuestionDialog = {

    showDialog: function(giftRelationship) {
        var $relationship_score = $('#question-relationship-score'); var $relationship2 = $('#question-relationship2');
        var $status = $('#status'); var $preloader = $('#preloader'); var $body = $('body');

        $('#question-modal').modal();

        $('#question-modal').on('hidden.bs.modal',QuestionDialog.onDialogClose);

        var randomRelation = Utils.pickRandomProperty(window.relationships);
        var obj = {};

        while(randomRelation == giftRelationship)
        {
            randomRelation = Utils.pickRandomProperty(window.relationships);
        }
        obj['other_relation'] = randomRelation;
        $relationship2.text(window.relationships[randomRelation]);




        $('#question-submit').click( function() {
            obj['relation'] = giftRelationship;
            obj['strength'] = 6 - parseFloat($relationship_score.rateYo("option", "rating"));

            QuestionDialog.closeDialog();
            QuestionDialog.onDialogClose();
            $.ajax({
                type: "POST",
                url: "http://localhost:63343/ask_user/",
                // The key needs to match your method's input parameter (case-sensitive).
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(obj),
                dataType: "json",
                beforeSend: Utils.beforeSend,
                success: function(data){
                    $relationship_score.rateYo("option", "rating", 0);
                    $preloader.delay(300).fadeOut('slow', function () {
                        NavBar.updateTopBar();
                        $body.delay(550).css({'overflow': 'visible'});
                        successDialog.showDialog('Thanks for your answer!');
                    });
                },
                error: function(error){
                    NavBar.updateTopBar();
                    $status.hide();
                    $preloader.hide();
                    errorDialog.showDialog(error.responseText);
                },
            });
            return false;
        });
    },

    closeDialog: function() {
        $('#question-modal').modal('hide');
    },

    onDialogClose: function() {
        $('#question-submit').off('click');
        $('#question-modal').off('hidden.bs.modal');
    }

};
var cardDialog = {

    showDialog: function(cardType) {
        var $status = $('#status'); var $preloader = $('#preloader'); var $body = $('body');
        var $card_text = $('.card-text');
        var moneyValue = cardType == 'gold' ? Utils.GOLD_CARD_REWARD : Utils.DIAMOND_CARD_REWARD;
        var redeemValue = cardType == 'gold' ? Utils.GOLD_CARD_VALUE : Utils.DIAMOND_CARD_VALUE;
        $card_text[0].innerHTML = '<h5>You are about to redeem ' + redeemValue + ' Points from your rank.</h5>' +
                                '<h5>You will recieve a ' + moneyValue + ' ₪ gift card to your Email.</h5>' +
                                '<h5>Are you sure you want to redeem your points?</h5>';

        $('#card-modal').modal();

        $('#card-modal').on('hidden.bs.modal',cardDialog.onDialogClose);

        var obj = {};

        $('#card-submit').click( function() {
            obj['card_type'] = cardType;

            cardDialog.closeDialog();
            cardDialog.onDialogClose();
            $.ajax({
                type: "POST",
                url: "http://localhost:63343/redeem_card/",
                // The key needs to match your method's input parameter (case-sensitive).
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(obj),
                dataType: "json",
                beforeSend: Utils.beforeSend,
                success: function(data){
                    $preloader.delay(300).fadeOut('slow', function () {
                        $body.delay(550).css({'overflow': 'visible'});
                        successDialog.showDialog("The " + Utils.capitalizeFirstLetter(cardType) + " gift card is on it's way to your email! 😉");
                        NavBar.updateTopBar();
                        ProfileView.initProfilePageData();
                    });
                },
                error: function(error){
                    NavBar.updateTopBar();
                    $status.hide();
                    $preloader.hide();
                    errorDialog.showDialog(error.responseText);
                },
            });
            return false;
        });
    },

    closeDialog: function() {
        $('#card-modal').modal('hide');
    },

    onDialogClose: function() {
        $('#card-submit').off('click');
        $('#card-modal').off('hidden.bs.modal');
    }

};