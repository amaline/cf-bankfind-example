/*
 * $Workfile: common.js$
 * $Id: common.js,v 1.36, 2014-06-19 00:56:04Z, Goltermann_Jason D.$
 * $Author: Goltermann_Jason D.$
 * Created $Date: 6/18/2014 8:56:04 PM$
 * $Revision: 37$
 *
 * Copyright 2012 by Federal Deposit Insurance Corporation
 */

var APP_SERVER_HOST_PREFIX = ""; //The host (and port) for the application server 
var LEGACY_APP_HOST_PREFIX = ""; //The host for the legacy application
var SEAF_APP_HOST_PREFIX = ""; //The host for the legacy application
var CONTEXT_ROOT = ""; 			 //The context root of the web service application
var dictionary = null;

//Global URL parameter variables
var urlParamName = "";
var urlParamSearchName = "";
var urlParamSearchFdic = "";
var urlParamFdic = "";
var urlParamBank = "";
var urlParamCity = "";
var urlParamState = "";
var urlParamZip = "";
var urlParamAddress = "";
var urlParamTabId = "";
var urlParamSearchWithin = "";
var urlActiveFlag = false;
var urlParamAllBanksPageNum = "";
var labelClicked = false;
var allowErrorMsg = true;
var ajaxTimeout = 15000;
var supressErrorMessageTime = 20000;
var genErrMsg = "<p class='smallText phm ptm'><span>We are sorry. We are having technical problems. </span></p>" +
"<p class='smallText phm ptm'><span>For more help or to report the problem, please call:</span></p>" +
"<p class='smallText phm ptm'><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;877-ASKFDIC (877-275-3342)<br/>" +
"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TDD: 800-925-4618</span></p>" +
"<p class='smallText phm ptm'><b><span>Hours of operation:</span></b></p>" +
"<p class='smallText phm ptm'><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8:00 am - 8:00 pm ET<br/>" +
"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Monday - Friday<br/>" +
"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;9:00 am - 5:00 pm ET<br/>" +
"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Saturday - Sunday</span></p>";
var keyStatisticsUrl;
var tDate, pDate, CurrentQtrlydate;
var detailsandFinancialsUrl;

/**
 * Sets the global variable APP_SERVER_HOST_PREFIX with the value in bankFind.properties
 * 
 */
function setServerHostPrefix() {
    if (!APP_SERVER_HOST_PREFIX) {
		 $.ajax({
            url: 'bankFindProperties.txt',
			  dataType: 'text',
			  async: false,
            success: function (data) {
				  var appServerHostParsed = /APP_SERVER_HOST_PREFIX=([^;]+)/.exec(data);
				  APP_SERVER_HOST_PREFIX = appServerHostParsed[1];
				  var legacyServerHostParsed = /LEGACY_APP_HOST_PREFIX=([^;]+)/.exec(data);
				  LEGACY_APP_HOST_PREFIX = legacyServerHostParsed[1];
				  var seafServerHostParsed = /SEAF_APP_HOST_PREFIX=([^;]+)/.exec(data);
				  SEAF_APP_HOST_PREFIX = seafServerHostParsed[1];
				  var contextRootParsed = /CONTEXT_ROOT=([^;]+)/.exec(data);
				  CONTEXT_ROOT = contextRootParsed[1];
                if (!dictionary) {
					  getDictionary();
				  }				  				
			  }
		 });
	}
}

/**
 * Creates an array of key value pairs holding the term and definition
 * @param data
 * 			The data returned by the JSON call
 */
function createDictionary(data) {
	dictionary = [];
    for (var i = 0; i < data.length; i++) {
		//check each ith entry
		var term = "";
		var definition = "";
        $.each(data[i], function (key, value) {
            if (key == 'name') {
				term = value;
			}
            if (key == 'definition') {
				definition = value;
			}
            if (key == 'definition' && term && definition) {
				var entry = {};
				entry[term] = definition;
				dictionary.push(entry);
			}
		});
	}
	setTooltipDefinitions();
}

function getDictionary() {
    $.ajax({
        url: APP_SERVER_HOST_PREFIX + CONTEXT_ROOT +
            "/rest/resource/dictionary/?jsoncallback=?",
        dataType: 'json',
        success: function (data) { createDictionary(data); }
    });
}

function initApplication() {
	setServerHostPrefix();
}


$(document).ready(function () {
	

	
	//initialize the application
	initApplication();

	//Load all global params
	urlParamName = removeInvalidParamCharacters(getURLParameter('name'));
	urlParamSearchName = removeInvalidParamCharacters(getURLParameter('searchName'));
	urlParamSearchFdic = removeInvalidParamCharacters(getURLParameter('searchFdic'));
	urlParamFdic = removeInvalidParamCharacters(getURLParameter('fdic'));
	urlParamBank = removeInvalidParamCharacters(getURLParameter('bank'));
	urlParamCity = removeInvalidParamCharacters(getURLParameter('city'));
	urlParamState = removeInvalidParamCharacters(getURLParameter('state'));
	urlParamZip = removeInvalidParamCharacters(getURLParameter('zip'));
	urlParamAddress = removeInvalidParamCharacters(getURLParameter('address'));
	urlParamTabId = removeInvalidParamCharacters(getURLParameter('tabId'));
	urlParamSearchWithin = removeInvalidParamCharacters(getURLParameter('searchWithin'));
	urlActiveFlag = removeInvalidParamCharacters(getURLParameter('activeFlag'));
	urlParamAllBanksPageNum = removeInvalidParamCharacters(getURLParameter('pageNum'));
	
   
        /* initialize tooltip indicator */
        $('[data-toggle="tooltip"]').tooltip();
                 
        //update the Details and Financials app link
        detailsandFinancialsUrl = LEGACY_APP_HOST_PREFIX + "/idasp/advSearchLanding.asp";
        $(".detailsandFinancialsLink").attr("href", detailsandFinancialsUrl);

        //keyboard accessible popover
        $('a[rel=popover]').popover()
            .focus(function () { $(this).trigger('mouseover'); })
            .blur(function () { $(this).trigger('mouseout'); });
       
        function EnablePlaceHolderIE9() {
            //IE: version 9 and below doesn't support BootStrap Placeholder; it works fine on FireFox
            //Use this work-around for IE9:
            //
            $("input[placeholder]").each(function () {
                var $this = $(this);
                if ($this.val() == "") {
                    $this.val($this.attr("placeholder")).focus(function () {
                        if ($this.val() == $this.attr("placeholder")) {
                            $this.val("");
                        }
                    }).blur(function () {
                        if ($this.val() == "") {
                            $this.val($this.attr("placeholder"));
                        }
                    });
                }
            });
        }
                         
        //When the  Key Statistics Modal link is clicked
        $("#ksModalLink").on('click', function () {
            tDate = $('.tmpl-currDemDt:first').text();
          
            /*pDate should be the previous day of currDem date 1 day deducted from dd, 
               1 is addded to mm as JQuery getMonth returns months 0-11
            */
            formattedDate = new Date(tDate);
            var dd = formattedDate.getDate() -1;
            var mm = formattedDate.getMonth() +1;
            var yyyy = formattedDate.getFullYear();

            pDate = mm + "/" + dd + "/" + yyyy;
           
            CurrentQtrlydate = $('.tmpl-currFinDt:first').text();
           
            keyStatisticsUrl = LEGACY_APP_HOST_PREFIX + "/idasp/KeyStatistics.asp?tdate=" + tDate + "&pDate=" + pDate + "&CurrentQtrlydate=" + CurrentQtrlydate;

            $('#ksIframeID').attr({ src: keyStatisticsUrl });
        });
     
	/**
	 * Returns user to the previous page
	 */
    $('#js-goBack').click(function () {
		window.history.go(-1);
	});	
	
	/**
	 * Prepends the legacy app prefix to the href
	 */
    $('.js-addLegacyAppPrefix').each(function () {
		var currentHref = $(this).attr('href');
        $(this).attr('href', LEGACY_APP_HOST_PREFIX + currentHref);
    });
    /**
	 * Prepends the Securities Exchange Act Filings app prefix to the href
	 */
    $('.js-addSEAFAppPrefix').each(function () {
        var currentHref = $(this).attr('href');
        $(this).attr('href', SEAF_APP_HOST_PREFIX + currentHref);
    });
	
	/**
	 * Capture enter key to submit search form if focus is in the form
	 */
	
	$('#searchForm').keyup(function (e) {
		if (e.keyCode == 13) {
	    	$('#findButton').click();
	    }
	});
	
	/**
	 * Reset the search result table if the find button is clicked
	 */
    $('#findButton').click(function () {
		resetSearchResultsDatatablesState();
	});
	
	//Searches through DOM adding definition texts to tooltip elements (They remain hidden)
	setTooltipDefinitions();

	//toggles a tooltip and adjusts it to be under the toggletext and horizontally relative to last relative parent element
    $('.js-tooltip').click(function () {
		popToolTip(this, 2, true);
	});
	
	//toggles a tooltip and adjusts it to be above the toggletext and horizontally relative to last relative parent element
    $('.js-tooltipUp').click(function () {
        if ($(this).attr('id') == 'fdicStatus') {
			popToolTip(this, -4, true);
        } else if ($(this).attr('id') == 'adjustedMergers') {
			popToolTip(this, -3, false);
		} else {
			popToolTip(this, -2, true);
		}
	});
	
	//toggles a tooltip and adjusts it to be under the toggletext and horizontally relative to last relative parent element. Includes a scaling fix for the
	//financials tab
    $('.js-financialsTooltip').click(function () {
		popToolTip(this, 2, true, 1.2);
	});
	
	//bind document.onclick and document.ontouchend to hide tooltips
    if ('ontouchend' in document) {
        $(document).on('touchend', function (event) {
			var originalEvent = event.originalEvent;
			hideTooltips(originalEvent);
		});
	} else {
        $(document).click(function (event) {
			hideTooltips(event);
		}); 
	}
	
	//replace div with anchor for allBankSListing
    var anchor = '<a href="' + APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + '/Bank/listing?$host=' + window.location.host + '" >View the first 500 banks<\/a>'
	$("#allBanksListingLink").html(anchor);
});

/**
 * Hides tooltips when clicking anywhere other than tooltip indicator, the tooltip, or any elements in the tooltip
 * @param e
 * 		The fired event
 */
function hideTooltips(event) {
	var tooltip = $('.tooltip');
	var tooltipIndicator = $('.tooltipIndicator');
	
	//when a label is clicked, IE fires two events. The first is the click of the label, which is followed by a click event for the input.
	//When the label is clicked we don't want to hide tooltips, but we don't want to hide the tooltips when the second event is generated
	//for the input either
    if ($(event.target).is('.tooltipIndicatorLabel')) {
		labelClicked = true;
	}
    if ((!labelClicked && !$(event.target).is(tooltipIndicator)) && !$(event.target).is(tooltip) && !$(event.target).is(tooltip.find("*"))) {
		tooltip.hide();
	}
    if ((event.target).tagName == 'INPUT') {
		labelClicked = false;
	}
}

/**
 * toggles a tooltip and adjusts it vertically relative to the toggletext and horizontally relative to last relative parent element. Includes an optional scaling fix
 * @param target
 * 		The tooltip toggletext that was clicked
 * @param offset
 * 		The vertical offset relative to the toggletext in em
 * @param adjustHorizontal
 * 		Whether or not to adjust the tooltip horizontally relative to the last relative parent. If this is false, manual positioning is need (inline or css)
 * @param scale
 * 		Optional. The scale of the vertical offset
 */
function popToolTip(target, offset, adjustHorizontal, scale) {
	//get the id of the target
	var id = $(target).attr('id');
	//get the id of the tooltip
	var tooltipId = '#' + id + 'Tooltip'
	//position of the target
	var position = $(target).position();
	//adjust the top position of the tooltip
	var topPos = 0;
    if (offset < 0) {
		topPos = $(position.top - $(tooltipId).height()).toEm() + offset;
	} else {
        scale = typeof (scale) != 'undefined' && scale ? scale : 1
		topPos = ($(position.top).toEm() + offset) * scale;
	}
	
	//set tooltip position
    $(tooltipId).css('top', topPos + 'em');
    if (adjustHorizontal) {
        $(tooltipId).css('left', position.left);
        $(tooltipId).css('right', position.left);
	}
	//hide other tooltips (this done so we can have a click off on document.onclick 
	//but still have tooltips turned off when clicking on the link)
	$('.tooltip').not(tooltipId).hide();
	//toggle this tooltip
	$(tooltipId).toggle();
}

/**
 * Converts from px to em
 */
$.fn.toEm = function (settings) {
    settings = jQuery.extend({
        scope: 'body'
    }, settings);
    var that = parseInt(this[0], 10),
        scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
        scopeVal = scopeTest.height();
    scopeTest.remove();
    var emInt = (that / scopeVal).toFixed(8);
    return +emInt;
};

/**
 * converts from em to px
 */
$.fn.toPx = function (settings) {
    settings = jQuery.extend({
        scope: 'body'
    }, settings);
    var that = parseFloat(this[0]),
        scopeTest = jQuery('<div style="display: none; font-size: 1em; margin: 0; padding:0; height: auto; line-height: 1; border:0;">&nbsp;</div>').appendTo(settings.scope),
        scopeVal = scopeTest.height();
    scopeTest.remove();
    return Math.round(that * scopeVal) + 'px';
};

/**
 * Adds definitions to the DOM
 */
function setTooltipDefinitions() {
	//if on glossary page
	var url = window.location.href;
    if (url.indexOf('glossary') > 0) {
        if (dictionary) {
            for (var i = 0; i < dictionary.length; i++) {
				//check each ith entry
                $.each(dictionary[i], function (key, value) {
					//add values to html element
					$('.tmpl-tooltip-' + key).html(value); 
				});
			}
		}
		var anchorId = window.location.hash;
        if (anchorId != "") {
			var newPosition = $(anchorId).offset();
			window.scrollTo(newPosition.left, newPosition.top);
		}
	//otherwise create tool tips
	} else {
        if (dictionary) {
            for (var i = 0; i < dictionary.length; i++) {
				//check each ith entry
                $.each(dictionary[i], function (key, value) {
					//add values to tooltip elements on the page
					var $matchingToolTip = $('.tmpl-tooltip-' + key);
                    if ($matchingToolTip.length) {
						var tooltipDefinition = createTooltipDefinition(value, key);
						$matchingToolTip.html(tooltipDefinition);
					}
					 
				});
			}
		}
	}
}

/**
 * Creates a tooltip html element with the definition
 * @param completeDefinition
 * 		The complete definition. Tooltips only hold up to 200 characters
 * @param term
 * 		The term to be created
 * @returns {String}
 * 		The html tooltip definition
 */
function createTooltipDefinition(completeDefinition, term) {
    completeDefinition = completeDefinition.replace(/\r?\n/g, "");
	var dontPush = false;
	var definition = "";
	var inTag = false;
	var openTags = [];
	var count = 0;
	var curTag = "";
    for (var i = 0; i < completeDefinition.length && (i < 200 || inTag) ; i++) {
		var char = completeDefinition[i];
        if (char == '<') {
			inTag = true;
		}
        if (char == '>') {
			inTag = false;
            if (curTag != "p" && curTag != "br" && !dontPush) {
				openTags.push(curTag);
			}
			curTag = "";
			dontPush = false;
		}
        if (inTag) {
            if (char == '/') {
				openTags.pop();
				dontPush = true;
			}
            if (char != '<') {
				curTag = curTag + char;
			}
		}
		definition = definition + char;
	}
	
    for (var i = 0; i < openTags.length; i++) {
		definition = definition + "</" + openTags[i] + ">";
	}
    if (completeDefinition.length >= 200) {
        if (term == 'regagnt') {
            definition = definition.substring(0, 85);
		}
        definition = definition + "<br>" + "<a href='./glossary.html#" + term + "'>More info...</a>";
	}
	return definition;
}
//---------------------------------------------------------------------
// Cornerstone jQuery UI Modal Extention
//---------------------------------------------------------------------
/**
 * This is a generic jQuery UI dialog Modal creator
 * @param options jQuery UI options
 * @param content, either a nodetype of Text or Element
 * @return jQuery Elementjquery 
 */
function createModalWindow(options, content) {

    options = options || {};

    var $modal = $('<div class="noTitleDialog" />');


    var defaults = {
        autoOpen: true,
        width: 'auto',
        modal: true,
        title: "Bankfind",
        dialogClass: "",
        buttons: {
            'OK': function () { $(this).dialog("close"); }
        }

    };

    // make sure that the options argument is an actuall object
    if ($.isPlainObject(options)) {
        options.modal = true; // just incase someone ties something

        // This is done to make sure that closing of the dialog will always 
        // destroy the dialog DOM, keeping down HTML polution;
        if (options.close) {
            var func = options.close;
            options.close = function () {
                func.call(this, arguments);
                $(this).empty().remove();
            };
        } else {
            options.close = function () {
                $(this).empty().remove();
            };
        }
        $.extend(defaults, options);
    }

    // if created with content sent, add it
    if (content) {
        if ($(content).is("div") || content instanceof jQuery) {
            $modal.append(content);
        } else {
            $modal.append($("<div/>").html(content));
        }
    }

    $modal.appendTo('warp');
    $modal.dialog(defaults);

    //recenter dialog upon resizing browser
    $(window).resize(function () {
        $(".noTitleDialog").dialog("option", "position", "center");
    });

    return $modal;
};

function showThrottledError(options, content, allowErrorInMilliSeconds) {
    if (allowErrorMsg) {
        allowErrorMsg = false;
        createModalWindow(options, content);
        window.setInterval(function () {
            allowErrorMsg = true;
        },
            allowErrorInMilliSeconds);
    }
}

/**
 * Removes invalid characters from url parameters.  <>/\=^ are not allowed because they either allow for cross-scripting site 
 * attacks or intefere with the way the application runs.
 * 
 * @param param
 * 		The param from which to remove the illegal characters
 */
function removeInvalidParamCharacters(param) {
    var cleanedParam = param.replace(/[<>\\=\^]/g, "");
	return cleanedParam;
}

/**
 * Builds a table menu that allows the user to add and remove columns from a datatable by clicking on checkboxes.  This should be called after the
 * datatable has been completely constructed (sometime in the success callback). CSS should be defined for the classes in the html that is created.
 * See http://filamentgroup.com/examples/rwd-table-patterns/ for details
 * 
 * @param tableWrapperId
 * 		The id of the element that the menu will come before.
 */
function buildResponsiveTableMenu(tableId, tabIndex) {
    if (!$(".table-menu-wrapper-" + tableId + "_wrapper").length) {
		var container = $('<div class="table-menu table-menu-hidden"><ul /></div>'); 
        $("#" + tableId + " thead th").each(function (i) {
			var th = $(this),
			    id = th.attr("id"), 
			    classes = th.attr("class");  // essential, optional (or other content identifiers)
			         
		   // assign an ID to each header, if none is in the markup
		   if (!id) {
                id = ("col-") + i;
		      th.attr("id", id);
		   };      
			         
		   // loop through each row to assign a "headers" attribute and any classes (essential, optional) to the matching cell
		   // the "headers" attribute value = the header's ID
            $("#" + tableId + " tbody tr").each(function () {
		      var cell = $(this).find("th, td").eq(i);                        
		      cell.attr("headers", id);
		      if (classes) { cell.addClass(classes); };
		   });
			   
		   // create the menu hide/show toggles
            if (!th.is(".persist")) {
			   
		      // note that each input's value matches the header's ID; 
		      // later we'll use this value to control the visibility of that header and it's associated cells
                var toggle = $('<li><input type="checkbox" name="toggle-cols" id="toggle-col-' + i + '" value="' + id + '" /> <label for="toggle-col-' + i + '">' + th.text() + '</label></li>');
		      
		      // append each toggle to the container
		      container.find("ul").append(toggle); 
		      
		      // assign behavior
		      toggle.find("input")
			      
	         // when the checkbox is toggled
               .change(function () {
	            var input = $(this), 
	                  val = input.val(),  // this equals the header's ID, i.e. "company"
                         cols = $("#" + val + ", [headers=" + val + "]"); // so we can easily find the matching header (id="company") and cells (headers="company")
	         
	            if (input.is(":checked")) { 
            		cols.addClass("show").removeClass("hidden"); 
            	} else { 
            		cols.removeClass("show").addClass("hidden"); 
            	};
	         })
		         
	         // custom event that sets the checked state for each toggle based on column visibility, which is controlled by @media rules in the CSS
	         // called whenever the window is resized or reoriented (mobile)
               .bind("updateCheck", function () {
                   if (th.css("display") == "table-cell") {
	               $(this).attr("checked", true);
	            }
	            else {
	               $(this).attr("checked", false);
	            };
	         })
	         
	         // call the custom event on load
	         .trigger("updateCheck");  
		         
		   }; // end conditional statement ( !th.is(".persist") )
		}); // end headers loop  
		
		// update the inputs' checked status
        $(window).bind("orientationchange resize", function () {
            container.find("input").trigger("updateCheck");
        });
   		
		var menuWrapperDiv = "<div tabindex=\"" + tabIndex + "\" class=\"cs-noprint table-menu-wrapper-" + tableId + "_wrapper\" />";
		var menuWrapper = $(menuWrapperDiv),
		   menuBtn = $('<a href="#" class="table-menu-btn">Display</a>');
		      
        menuBtn.click(function () {
		   container.toggleClass("table-menu-hidden");            
		   return false;
		});
		      
		menuWrapper.append(menuBtn).append(container);
        $('#' + tableId + "_wrapper").before(menuWrapper);  // append the menu immediately before the table
	
		// assign click-away-to-close event
        $(document).click(function (e) {
            if (!$(e.target).is(container) && !$(e.target).is(container.find("*"))) {
		      container.addClass("table-menu-hidden");
		   }				
		}); 
	} else {
        $("#" + tableId + " thead th").each(function (i) {
			var th = $(this),
			    id = th.attr("id"), 
			    classes = th.attr("class");  // essential, optional (or other content identifiers)
			         
		   // assign an ID to each header, if none is in the markup
		   if (!id) {
                id = ("col-") + i;
		      th.attr("id", id);
		   };      
			         
		   // loop through each row to assign a "headers" attribute and any classes (essential, optional) to the matching cell
		   // the "headers" attribute value = the header's ID
            $("#" + tableId + " tbody tr").each(function () {
		      var cell = $(this).find("th, td").eq(i);                        
		      cell.attr("headers", id);
		      if (classes) { cell.addClass(classes); };
		   });
		});
	}
}

/**
 * Validates the search form. Returns false if the form failed validation and true otherwise.  If validation failed, a span with the id 'errorMessages' will
 * be replaced with a bullted list of failed items, and the input or select with the failed id will have it's border colors set to red.
 */
function validateSearchForm() {

	var success = true;
	var bankName = $.trim($('#bankname').val());
	var fdicNumber = $.trim($('#fdicNumber').val());
	var address = $.trim($('#address').val());
	var city = $.trim($('#city').val());
	var state = $.trim($('#state').val());
	var zipCode = $.trim($('#zipcode').val());
	
	//reset highlighting
	$('#bankname').addClass('validHighlight').removeClass('errorHighlight');
	$('#zipcode').addClass('validHighlight').removeClass('errorHighlight');
	$('#fdicNumber').addClass('validHighlight').removeClass('errorHighlight');
	
	var errorHtml = "<ul id='errorMessages'>\n";
	
	//At least one search criteria must be entered
    if (!bankName && !fdicNumber && !address && !city && !state & !zipCode) {
		errorHtml = errorHtml + "<li>Enter at least one value to use as search criteria</li>";
		success = false;
	}
	
	
	//Fields may not use invalid characters
    if (bankName || address || city) {
        var patt = /[<>\\=\^]/g;
        var bankNameResult = patt.test(bankName);
        var addressResult = patt.test(address);
        var cityResult = patt.test(city);
        if (bankNameResult) {
			errorHtml = errorHtml + "<li>Bank Name contains invalid characters</li>";
			success = false;
		}
        if (addressResult) {
			errorHtml = errorHtml + "<li>Address contains invalid characters</li>";
			success = false;
		}
        if (cityResult) {
			errorHtml = errorHtml + "<li>City contains invalid characters</li>";
			success = false;
		}
	}
	
	//At least three characters must be used for a bank name search
    if (bankName) {
        if (bankName.length < 3) {
			errorHtml = errorHtml + "<li>Enter at least three characters for a bank name</li>";
			success = false;
			$('#bankname').addClass('errorHighlight').removeClass('validHighlight');
		} else {
			$('#bankname').addClass('validHighlight').removeClass('errorHighlight');
		}
	} 
	
	//Zip code must be between 3 and 5 digits
    if (zipCode) {
        var patt = /\D/g;
        var result = patt.test(zipCode);
        if (result) {
			errorHtml = errorHtml + "<li>A zip code must be between 3 and 5 digits</li>";
			success = false;
			$('#zipcode').addClass('errorHighlight').removeClass('validHighlight');
		} else {
			//Input field is set to max of 5 chars so just test lower limit
            if (zipCode.length < 3) {
				errorHtml = errorHtml + "<li>A zip code must be between 3 and 5 digits</li>";
				success = false;
				$('#zipcode').addClass('errorHighlight').removeClass('validHighlight');
			} else {
				$('#zipcode').addClass('validHighlight').removeClass('errorHighlight');
			}
		}
	}
	
	//Cert must be all digits
    if (fdicNumber) {
        var patt = /\D/;
        var result = patt.test(fdicNumber);
        if (result) {
			errorHtml = errorHtml + "<li>A cert number must be all digits</li>";
			success = false;
			$('#fdicNumber').addClass('errorHighlight').removeClass('validHighlight');
		} else {
			$('#fdicNumber').addClass('validHighlight').removeClass('errorHighlight');
		}
	}
	
	errorHtml = errorHtml + "</ul>";
	
    if (!success) {
		$('#errorMessages').replaceWith(errorHtml);
		$('#errorMessageFocus').focus();
	}
	
	//trim white space off search criteria before moving on
	$('#bankname').val($.trim(bankName));
	$('#fdicNumber').val($.trim(fdicNumber));
	$('#address').val($.trim(address));
	$('#city').val($.trim(city));
	$('#zipcode').val($.trim(zipCode));
	
	//If fdic number has a value, clear the other fields
    if ($('#fdicNumber').val()) {
		$('#bankname').val("");
		$('#city').val("");
		$('#address').val("");
		$('#zipcode').val("");
		$('#state').val("");
	}
	
	return success;
}

/**
 * Resets the state of the search results datatable (sorting, paging, etc)
 */
function resetSearchResultsDatatablesState() {
	  localStorage.removeItem('SearchResultDataTable');
}

/**
 * Retrieves a url parameter
 * @param name
 * 		The name of the parameter
 * @returns {Boolean}
 * 		The value of the parameter
 */	
function getURLParameter(name) {
    var param = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
    return (param && param != 'null') ? param : "";
}

/**
 * Encodes characters in parameters for use in a url
 * @param param
 * 		the param to encode
 * @returns
 * 		the encoded param
 */
function encodeURLParameter(param) {
    if (param) {
        param = param.replace(/&amp;|&/g, "%26");
        param = param.replace(/'/g, "%27");
        param = param.replace(/#/g, "%23");
        param = param.replace(/\//g, "%2F");
		return param;
	} else {
		return param;
	}
}

/**
 * Parses a UTC formatted date time string and returns a Date object populated with the date and time from the string
 * @param date
 * 		A UTC formatted date to parse
 * @param subtractOneDay
 * 		boolean to determine whether or not to subtract a day from the date
 */
function parseUTC(date, dateFormat, subtractOneDay) {
	var a = /(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2}\.\d+)/.exec(date);
	if (a) {
		var day = 0;
        if (subtractOneDay) {
			day = +a[3] - 1;
		} else {
			day = +a[3];
		}
        var utcDate = new Date(+a[1], +a[2] - 1, day, +a[4], +a[5], +a[6]);
	   var dateString = $.datepicker.formatDate(dateFormat, utcDate);
	   return dateString;
	} else {
		return null;
	}
};

/**
 * Formatting date time mm/dd/yyyy
 */
function formatDate(date) {         
     if (date != null && date != '') {         
    	 var a = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(date);
    		if (a) {
    			var month = getMonthName(a[1]);
    			return month + ' ' + a[2] + ', ' + a[3];
    		} else {
    			return '';
    		}
     }   
};

function getMonthName(number) {
	var monthName;
	switch (number) {
	case '1':
		monthName = 'January';
		break;
	case '2':
		monthName = 'February';
        break;
	case '3':
		monthName = 'March';
        break;
	case '4':
		monthName = 'April';
        break;
	case '5':
		monthName = 'May';
        break;
	case '6':
		monthName = 'June';
        break;
	case '7':
		monthName = 'July';
        break;
	case '8':
		monthName = 'August';
        break;
	case '9':
		monthName = 'September';
        break;
	case '10':
		monthName = 'October';
        break;
	case '11':
		monthName = 'November';
        break;
	case '12':
		monthName = 'December';
        break;
	default:
		monthName = 'null';
		break;
	}
	return monthName;
}

function formatNumberWithCommas(number) {
	//add commas to the dollars
	var formattedString = "";
	var numberString = number + "";
	while (numberString.length > 3) {
		formattedString = "," + numberString.substring(numberString.length - 3, numberString.length) + formattedString;
		numberString = numberString.substring(0, numberString.length - 3);
	}
	formattedString = numberString + formattedString;
	return formattedString;
}
/**
 * Formats amounts in dollar format (i.e.  $100,100.00).
 * @param amount
 * 		The amount to format. Precondition: amount must be a number.
 * @param showCents
 * 		Whether or not to show the cents in the amount. True to show cents or false to not show cents
 * @returns
 * 		The dollar formatted amount as a string
 */
function formatAmountInDollars(amount, showCents) {
	//convert to number
	var amountAsNumber = +amount;
	var isNegative = amountAsNumber < 0 ? true : false;
    if (isNegative) amountAsNumber = amountAsNumber * -1;
    if (showCents) {
		//round to 2 decimal precision
		amountAsNumber = amountAsNumber.toFixed(2);
		//convert to a string for split
		var amountAsString = amountAsNumber + "";
		//split the value on the decimal
		var amounts = amountAsString.split(".");
		//save the dollars and cents
		var dollars = amounts[0];
		var cents = amounts[1];
	} else {
		//round to 0 decimal precision
		amountAsNumber = amountAsNumber.toFixed();
		//save dollars as a string
		var dollars = amountAsNumber + "";
	}
	
	//add commas to the dollars
	var dollarString = "";
	while (dollars.length > 3) {
		dollarString = "," + dollars.substring(dollars.length - 3, dollars.length) + dollarString;
		dollars = dollars.substring(0, dollars.length - 3);
	}
	dollarString = dollars + dollarString;
	
	var result = "";
    if (showCents) {
		result = "$" + dollarString + "." + cents;
	} else {
		result = "$" + dollarString;
	}
    if (isNegative) result = "-" + result;
	return result;
}

/**
 * Formats numbers in percent format (i.e.  %100.00).
 * @param percent
 * 		The number to format. Precondition: percent must be a number.
 * @returns
 * 		The percent-formatted number as a string
 */
function formatPercentage(percent) {
	//convert to number
	var result = +percent;
	//round to 2 decimal precision
	result = result.toFixed(2);
	//Add percent sign
	return result + "%";
	
}
/**
 * Converts all characters in a string to lowercase and then capitalizes all of the words in the string
 * 
 * @param string
 * 		The string to capitalize
 * @returns
 * 		The string with all words capitalized
 */
function capitalize(string) {
	string = string.toLowerCase();
    string = string.replace(/^(.)|\s(.)/g, function ($1) { return $1.toUpperCase(); });
    return string.replace("U.s.", "U.S.");
}

/**
 * Loads DataTable Extension fnReloadAjax
 */
function loadFnReloadAjax() {
	

	/**
	 * By default DataTables only uses the sAjaxSource variable at initialisation time, however it can be useful to re-read an Ajax source 
	 * and have the table update. Typically you would need to use the fnClearTable() and fnAddData() functions, however this wraps it all 
	 * up in a single function call.
	 * 
	 * @param oSettings
	 * 		The datatables settings
	 * @param sNewSource
	 * 		The new ajax source
	 * @param fnCallback
	 * 		ajax callback
	 * @param bStandingRedraw
	 * 		redraw
	 */
    $.fn.dataTableExt.oApi.fnReloadAjax = function (oSettings, sNewSource, fnCallback, bStandingRedraw) {
        if (typeof sNewSource != 'undefined' && sNewSource != null) {
	        oSettings.sAjaxSource = sNewSource;
	    }
	 
	    // Server-side processing should just call fnDraw
        if (oSettings.oFeatures.bServerSide) {
	        this.fnDraw();
	        /* Callback user function - for event handlers etc */
            if (typeof fnCallback == 'function' && fnCallback != null) {
                fnCallback(oSettings);
	        }
	        return;
	    }
	 
        this.oApi._fnProcessingDisplay(oSettings, true);
	    var that = this;
	    var iStart = oSettings._iDisplayStart;
	    var aData = [];
	  
        this.oApi._fnServerParams(oSettings, aData);
	      
        oSettings.fnServerData.call(oSettings.oInstance, oSettings.sAjaxSource, aData, function (json) {
	        /* Clear the old information from the table */
            that.oApi._fnClearTable(oSettings);
	          
	        /* Got the data - add it to the table */
            var aData = (oSettings.sAjaxDataProp !== "") ?
	            that.oApi._fnGetObjectDataFn(oSettings.sAjaxDataProp)(json) : json;
	          
            for (var i = 0 ; i < aData.length ; i++) {
                that.oApi._fnAddData(oSettings, aData[i]);
	        }
	          
	        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
	          
            if (typeof bStandingRedraw != 'undefined' && bStandingRedraw === true) {
	            oSettings._iDisplayStart = iStart;
                that.fnDraw(false);
	        }
            else {
	            that.fnDraw();
	        }
	          
            that.oApi._fnProcessingDisplay(oSettings, false);
	          
	        /* Callback user function - for event handlers etc */
            if (typeof fnCallback == 'function' && fnCallback != null) {
                fnCallback(oSettings);
	        }
        }, oSettings);
	};
}

/**
 * Creates an array state names and abbreviations.
 * 
 * @returns {Array}
 * 		an array of arrays of state names and abbreviations
 */
function getStateTermsArray() {
	var stateTermsArray = [
	["ALABAMA", "AL"],
	["ALASKA", "AK"],
	["AMERICAN SAMOA", "AS"],
	["ARIZONA", "AZ"],
	["ARKANSAS", "AR"],
	["CALIFORNIA", "CA"],
	["COLORADO", "CO"],
	["CONNECTICUT", "CT"],
	["DELAWARE", "DE"],
	["DISTRICT OF COLUMBIA", "DC"],
	["FEDERATED STATES OF MICRONESIA", "FM"],
	["FLORIDA", "FL"],
	["GEORGIA", "GA"],
	["GUAM", "GU"],
	["HAWAII", "HI"],
	["IDAHO", "ID"],
	["ILLINOIS", "IL"],
	["INDIANA", "IN"],
	["IOWA", "IA"],
	["KANSAS", "KS"],
	["KENTUCKY", "KY"],
	["LOUISIANA", "LA"],
	["MAINE", "ME"],
	["MARSHALL ISLANDS", "MH"],
	["MARYLAND", "MD"],
	["MASSACHUSETTS", "MA"],
	["MICHIGAN", "MI"],
	["MINNESOTA", "MN"],
	["MISSISSIPPI", "MS"],
	["MISSOURI", "MO"],
	["MONTANA", "MT"],
	["NEBRASKA", "NE"],
	["NEVADA", "NV"],
	["NEW HAMPSHIRE", "NH"],
	["NEW JERSEY", "NJ"],
	["NEW MEXICO", "NM"],
	["NEW YORK", "NY"],
	["NORTH CAROLINA", "NC"],
	["NORTH DAKOTA", "ND"],
	["NORTHERN MARIANA ISLANDS", "MP"],
	["OHIO", "OH"],
	["OKLAHOMA", "OK"],
	["OREGON", "OR"],
	["PALAU", "PW"],
	["PENNSYLVANIA", "PA"],
	["PUERTO RICO", "PR"],
	["RHODE ISLAND", "RI"],
	["SOUTH CAROLINA", "SC"],
	["SOUTH DAKOTA", "SD"],
	["TENNESSEE", "TN"],
	["TEXAS", "TX"],
	["UTAH", "UT"],
	["VERMONT", "VT"],
	["VIRGIN ISLANDS OF THE U.S.", "VI"],
	["VIRGINIA", "VA"],
	["WASHINGTON", "WA"],
	["WEST VIRGINIA", "WV"],
	["WISCONSIN", "WI"],
	["WYOMING", "WY"]
	];
	return stateTermsArray;
}