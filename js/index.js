/*
 * $Workfile: index.js$
 * $Id: index.js,v 1.4, 2014-06-25 22:57:48Z, Goltermann_Jason D.$
 * $Author: Goltermann_Jason D.$
 * Created $Date: 6/25/2014 6:57:48 PM$
 * $Revision: 5$
 *
 * Copyright 2012 by Federal Deposit Insurance Corporation
 */

/**
 * Create event handlers
 */
$(document).ready(function() {	
	
	$('.mobileNavWrapper').prev().click(function() {
		var thisHeaderOpen = $(this).is('.open');
		$('.mobileNavWrapper.open').removeClass('open');
		$('h1.open').removeClass('open');
		//open the clicked on header, unless the header that 
		//was clicked was already open, in which case leave it closed
		if(!thisHeaderOpen) {
			$(this).next().addClass('open');
			$(this).addClass('open');
		}
	});
	
	/**
	 * FAQs - Adds the accordion functionality to the FAQ section
	 */
	$('.js-acorddetails').on('click', '.header',  function(){
		if(!$(this).parent().is('.open')) {
			var openDetail = $('.acorddetails.open');
			openDetail.children('.detail').slideToggle();
			openDetail.removeClass('open');
			}
		var detail = $(this).next();
		detail.is(':visible') ? detail.slideToggle().parent().removeClass('open') : detail.slideToggle().parent().addClass('open');
	});	
	
	
	
	/**
	 * FDIC Data & Statistics - Populates data
	 */ 	
	if ( $('.js-fdicStats').length ) {
	    $.ajax({
	        url: APP_SERVER_HOST_PREFIX + CONTEXT_ROOT +
                "/rest/resource/fdicStats/?jsoncallback=?",
	        dataType: 'json',
	        success: function (data) { populateFdicStats(data); },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	            showThrottledError({},
                genErrMsg,
                supressErrorMessageTime)
	        },
	        timeout: ajaxTimeout

	    });
	}
	
	/**
	 * FDIC Data & Statistics - Displays pop-up text when element is hovered over or clicked. 
	 */
	$('.js-mergerAdjusted').hover(function() {
		$('.mergerAdjustedPopUp').toggle();
	});
	$('.js-mergerAdjusted').click(function() {
		$('.mergerAdjustedPopUp').toggle();
	});
	
	/**
	 * Tools - makes the tools clickable (i.e., start comparison, select dataset)
	 */
	$('.js-toolClick').click(function() {
		if($(this).parent().is('#financialReports')) {
			window.location = LEGACY_APP_HOST_PREFIX + "/idasp/index.asp";
		}
		if($(this).parent().is('#compareBanks')) {
			window.location = LEGACY_APP_HOST_PREFIX + "/sdi/index.asp";
		}
		if($(this).parent().is('#selectDataset')) {
			window.location = LEGACY_APP_HOST_PREFIX + "/idasp/warp_download_all.asp";
		}
	});
	
	/**
	 * Creates the options html tags for all of the states and territories
	 */
	$('.js-stateOptions').replaceWith(function() {
	    var html = "<select  tabindex='131' id='state' name='state' >\n<option value=''> Anywhere in U.S.</option>\n";
		var stateTermsArray = getStateTermsArray();
		
		for(var x = 0; x < stateTermsArray.length; x++) {
			var stateTerms = stateTermsArray[x];
			var stateName = stateTerms[0];
			var stateAbbr = stateTerms[1];
			html = html + "<option value='"+stateAbbr+"'>"+capitalize(stateName)+"</option>\n";
		}
		return html + "</select>";
	});
	
	toggleSearchFields(false);
	/**
	 * Enable all fields upon page reload, unless fdic number is set
	 */
	if(!$('#fdicNumber').val()) {
		toggleSearchFields(true);
	}
});

/**
 * Populates the FDIC Data and Statistics Table with the data from the ajax call
 * @param data
 * 		Data from the ajax call
 */
function populateFdicStats(data) {
	//The wrapped data is a singleton array with a map inside, 
	//so use the first member of the array and iterate through the map
	$.each(data[0], function(key, value) {
		//Parse date from DB
		if(key == 'currDemDt' || key == 'currFinDt') {	
			value = parseUTC(value, 'm/d/yy', false);;
		}
		
		if(key == 'processDt') {
			//
			value = parseUTC(value, 'MM d, yy', true);
		}
		
		//Format amounts
		if(key.indexOf('tot') > -1) {	
			value = formatAmountInDollars(value, false);
		}
		
		if(key == 'certCount') {
			value = formatNumberWithCommas(value);
		}
		
		//add values to html element		
		$('.tmpl-' + key).text(value); 
	});
}

