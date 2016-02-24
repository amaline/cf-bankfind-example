function showRefineTab() {
    $("#display_tab_title").removeClass("displayed");
    $("#refine_tab_title").addClass("displayed");
    $("#display_content_tab").hide();
    $("#refine_content_tab").show();
}

function hoverIcon() {

    var image = document.getElementById('open_close_img');
    if (image.src.match("FacetOpen")) {
        image.src = "images/FacetOpen-Hover.png";
    } else {
        image.src = "images/FacetClose-Hover.png";
    }
}

function defaultIcon() {

    var image = document.getElementById('open_close_img');
    if (image.src.match("FacetOpen")) {
        image.src = "images/FacetOpen-Normal.png";
    } else {
        image.src = "images/FacetClose-Normal.png";
    }


}

function OpenClosePanel() {
    var isFFClosed = true;
    var image = document.getElementById('open_close_img');
    if (image.src.match("FacetClose")) { //to close FF
        $("#filter_container").hide();
        $("#collapsed_container").attr("title", "Expand Filter Container"); //reset to first option value
        $("#collapsed_container").append($(".collapse_icon")).show();
        image.src = "images/FacetOpen-Normal.png";

        isFFClosed = true;
    } else { //to open FF
        $("#collapsed_container").hide();
        $("#filter_container").show();
        $(".filter_tabs").before($(".collapse_icon"));
        image.src = "images/FacetClose-Normal.png";

        isFFClosed = false;
    }
    UpdateDisplayResults(isFFClosed);
}

function resetForm() {

    //$(".form-control").not('select').val(''); //all except <select> dropdown
    $("#activeBank").removeAttr('checked');
    $('select option').removeAttr("selected"); //reset to first option value

    $(".error").hide(); //Hide all errors
    //$('#bankname').val(urlParamName);
    var queries = {};
    var activeFlag = queries['activeFlag']
    $.each(document.location.search.substr(1).split('&'), function (c, q) {
        var i = q.split('=');
        queries[i[0].toString()] = i[1].toString();
    });
    $('#city').val(queries['city']);
    $('#state').val(queries['state']);
    if (activeFlag) {
        $("#activeBank").attr('checked');
    }
    conductSearchWithin();
  
}

//Update the width of panels, Hide or show column(s) when the Faceted Filter is opened or closed
function UpdateDisplayResults(isVisible) {

    if (isVisible) {//FF closed
        $("#searchResultContainer").css({ width: "100%" });
        $("#searchResultContainer").css({ "margin-top":"0px" });
        $("#filter_main_content").css({ background: "#ffffff" });
        $("#results").css({ width: "100%" });
       
    } else { //FF opened
        $("#searchResultContainer").css({ width: "75%" });
        $("#searchResultContainer").css({ "margin-top": "-20px" });
        $("#filter_main_content").css({ background: "#f2f2f2" });
    }

} //UpdateDisplayResults
