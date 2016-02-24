
function validateCert(id) {
    
    var inCert_in_value = $("#" + id).val();
    
    var validator = inCert_in_value.search(/^[\d]+$/);
    
    if (validator === 0) {
        $("#" + id).next().hide();
        openPanel("search_general");
        SendToGeneralPanel(id, inCert_in_value);
    }
    else {
       $( "#" + id).next().show();
    }
    
}

function validateBhcCert(id) {

    var bhc_inCert_in_value = $("#" + id).val();

    var validator = bhc_inCert_in_value.search(/^[\d]{7}$/);

    if (validator === 0) {
        $("#" + id).next().hide();
        openPanel("search_general");
        SendToGeneralPanel(id, bhc_inCert_in_value);
    }
    else {
        $("#" + id).next().show();
    }
}

function validateText(id) {
    
    var inName_in_value = $("#" + id).val();
    
    var validator = inName_in_value.search(/^[a-zA-Z0-9\s._-]{3,}$/);
    
    if (validator === 0) {
        $("#" + id).next().hide();
        openPanel("search_general");
        SendToGeneralPanel(id, inName_in_value);
    }
    else {
        $( "#" + id).next().show();
    }
    
}

function validateZipCode(id) {
    
    var ZipCode_in_value = $("#" + id).val();
    
    var validator = ZipCode_in_value.search(/^[\d]{5}(?:-[\d]{4})?$/);
    
    if (validator === 0) {
        $("#" + id).next().hide();
        openPanel("search_general");
        SendToGeneralPanel(id, ZipCode_in_value);
    }
    else {
        $( "#" + id).next().show();
    }
}

function validateDate(id) {
    
    var date_in_value = $("#" + id).val();
    
    var validator = date_in_value.search(/^[\d]{2}\/[\d]{2}\/[\d]{4}$/);
    
    if (validator === 0) {
        $("#" + id).next().hide();
        openPanel("search_status");
        SendToStatusPanel(id, date_in_value);
    }
    else {
        $( "#" + id).next().show();
    }
    
}

function validateAssets(id) {

    var assets_in_value = $("#" + id).val();

    var validator = assets_in_value.search(/^([\d]{1,3},?)+$/);

    if (validator === 0) {
        $("#" + id).parent().parent().next().hide();
        openPanel("search_status");
        SendToStatusPanel(id, assets_in_value);
    }
    else {
        $("#" + id).parent().parent().next().show();
        
    }

}

function GeneralDefaultCheck(id) {

    var default_in_value = $("#" + id + " option:first").val();
  
    var in_value = $("#" + id).val();
    if (in_value != default_in_value) {
        openPanel("search_general");
        SendToGeneralPanel(id, in_value);
        }
}

function StatusDefaultCheck(id) {

    var default_in_value = $("#" + id + " option:first").val();

    var in_value = $("#" + id).val();
    if (in_value != default_in_value) {
        openPanel("search_status");
        SendToStatusPanel(id, in_value);
    }
}

function TypeDefaultCheck(id) {
    var default_in_value = $("#" + id + " option:first").val();

    var in_value = $("#" + id).val();
    if (in_value != default_in_value) {
        openPanel("search_type");
        SendToTypePanel(id, in_value);
    }
}

function RegulatoryDefaultCheck(id) {
    var default_in_value = $("#" + id + " option:first").val();

    var in_value = $("#" + id).val();
    if (in_value != default_in_value) {
        openPanel("search_regulatory");
        SendToRegulatoryPanel(id, in_value);
    }
}