$(document).ready(function () {
    $("#establishment_date_inBefore, #locations_establishment_date_inBefore, #inactive_date_inBefore, #bhc_inBefore").datepicker({
        yearRange: "-30c:c",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        closeText: 'Clear',
        onClose: function (dateText, inst) { //to clear the date text and close window
            
            if ($(window.event.srcElement).hasClass('ui-datepicker-close'))
                $(this).val(''); //clearonly the selected one
        }
    });

    $("#establishment_date_inAfter, #locations_establishment_date_inAfter, #inactive_date_inAfter, #bhc_inAfter").datepicker({
        yearRange: "-30c:c",
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        closeText: 'Clear',
        onClose: function (dateText, inst) { //to clear the date text and close window

            if ($(window.event.srcElement).hasClass('ui-datepicker-close'))
                $(this).val(''); //clearonly the selected one
        }
    });

}); //end of $(document).ready()



