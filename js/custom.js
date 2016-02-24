$("document").ready(function() {
	
    $( "#accordion" ).accordion({
                    collapsible: true,
                    active: false,
                    icons: { "header": "ui-icon-blank", "activeHeader": "ui-icon-blank" }
                });
                
                $( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
                $( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
                
                
                $("#establishment_date_inAfter, #establishment_date_inBefore").datepicker();
                $("#inactive_date_inAfter, #inactive_date_inBefore").datepicker();
                
                $("#locations_establishment_date_inAfter, #locations_establishment_date_inBefore").datepicker();
                
                $("#bhc_inAfter, #bhc_inBefore").datepicker();               
                
                $("#establishment_date_inAfter").click(function() {
                     $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_establishment_date_inAfter()"><p>Clear</p></div>')
                });
                
                $("#establishment_date_inBefore").click(function() {
                    $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_establishment_date_inBefore()"><p>Clear</p></div>');
                });
                
                $("#inactive_date_inAfter").click(function() {
                    $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_inactive_date_inAfter()"><p>Clear</p></div>')
                });
                
                $("#inactive_date_inBefore").click(function() {
                    $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_inactive_date_inBefore()"><p>Clear</p></div>');
                });

                $("#locations_establishment_date_inAfter").click(function() {
                    $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_locations_establishment_date_inAfter()"><p>Clear</p></div>');
                });
                
                 $("#locations_establishment_date_inBefore").click(function() {
                    $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_locations_establishment_date_inBefore()"><p>Clear</p></div>');
                });
                 
                 $("#bhc_inAfter").click(function() {
                    $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_bhc_date_inAfter()"><p>Clear</p></div>');
                });
                
                 $("#bhc_inBefore").click(function() {
                    $('.clear_calendar').remove();
                    $('.ui-datepicker-calendar').after('<div class="clear_calendar" onclick="Clear_bhc_date_inBefore()"><p>Clear</p></div>');
                });

	
});

function Clear_establishment_date_inAfter() {
    $("#establishment_date_inAfter").val("");
}

function Clear_establishment_date_inBefore() {
     $("#establishment_date_inBefore").val("");
}

function Clear_inactive_date_inAfter() {
    $("#inactive_date_inAfter").val("");
}

function Clear_inactive_date_inBefore() {
     $("#inactive_date_inBefore").val("");
}

function Clear_locations_establishment_date_inAfter() {
    $("#locations_establishment_date_inAfter").val("");
}

function Clear_locations_establishment_date_inBefore() {
     $("#locations_establishment_date_inBefore").val("");
}

function Clear_bhc_date_inAfter() {
    $("#bhc_inAfter").val("");
}

function Clear_bhc_date_inBefore() {
     $("#bhc_inBefore").val("");
}