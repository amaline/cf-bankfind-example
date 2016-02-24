/*
 * $Workfile: results.js$
 * $Id: results.js,v 1.20, 2013-12-02 02:11:08Z, Goltermann_Jason D.$
 * $Author: Goltermann_Jason D.$
 * Created $Date: 12/1/2013 9:11:08 PM$
 * $Revision: 21$
 *
 * Copyright 2012 by Federal Deposit Insurance Corporation
 */

var oTable = null;
var resultsTableDisplayMenuBuilt = false;
var numberOfSearchesRun = 0;
var nameOnlySearch = false; //Tracks whether or not the search is excluding geographic information and using only the name
var currentSearchDisplayStart = 0; //Tracks which result the user is viewing
var onMobile = false;

$(document).ready(function () {

	loadFnReloadAjax();
	
	/**
	 * Results Search Again - Expand search results criteria form
	 */
    $('.expandResultsCriteria').click(function () {
		$(".slideToggleOnTop").slideToggle("slow");
	});
	
    /* initialize popover indicator */
    $('[data-toggle="popover"]').popover({
        html: true
    });
   
    /* initialize tooltip indicator */
    $('[data-toggle="tooltip"]').tooltip();

	/**
	 * Creates the options html tags for all of the states and territories
	 */
    $('.js-stateOptions').replaceWith(function () {
		var html = "<select tabindex='143' class='mrm' id='state' name='state' >\n<option value=''> Anywhere in U.S.</option>\n";
		var stateTermsArray = getStateTermsArray();
		
        for (var x = 0; x < stateTermsArray.length; x++) {
			var stateTerms = stateTermsArray[x];
			var stateName = stateTerms[0];
			var stateAbbr = stateTerms[1];
            html = html + "<option value='" + stateAbbr + "'>" + capitalize(stateName) + "</option>\n";
		}
		return html + "</select>";
	});
	
	/**
	 * Fills in form with parameters sent in the url
	 */
    if ($('.expandResultsCriteria').length) {
		$('#bankname').val(urlParamName);
		$('#city').val(urlParamCity);
		$('#address').val(urlParamAddress);
		$('#fdicNumber').val(urlParamFdic);
		$('#zipcode').val(urlParamZip);
		$('#state').val(urlParamState);
	}
	
	toggleSearchFields(false);
	/**
	 * Enable all fields upon page reload, unless fdic number is set
	 */
    if (!$('#fdicNumber').val()) {
		toggleSearchFields(true);
	}
	
	/**
	 * FDIC Data & Statistics - Grabs the demographic date
	 */
   
	if ( $('.js-demDate').length ) {

	    $.ajax({
	        url: APP_SERVER_HOST_PREFIX + CONTEXT_ROOT +
                "/rest/resource/fdicStats/?jsoncallback=?",
	        dataType: 'json',
	        success: function (data) { populateDemDate(data); },
	        error: function (XMLHttpRequest, textStatus, errorThrown) {
	            showThrottledError({},
                genErrMsg,
                supressErrorMessageTime)
	        },
	        timeout: ajaxTimeout
	    });
	}
	
	if(urlParamSearchWithin) {
		$('#searchFilter').val(urlParamSearchWithin);
	}
	
    if (urlParamCity) {
          $('#city').val(urlParamCity);
     }

     if (urlParamState) {
        $('#state').val(urlParamState);
     }
     if (onMobile) {
         if (urlActiveFlag === 'true') {
             $('#activeBank_mobile').attr('checked', true);
         } else {
             $('#activeBank_mobile').attr('checked', false);
         }
     } else {
         if (urlActiveFlag === 'true') {
             $('#activeBank').attr('checked', true);
         } else {
             $('#activeBank').attr('checked', false);
         }
     }

   
		
	/**
	 * Results - Apply search filter
	 */
	$('#searchWithinButton').click(function () {
		conductSearchWithin();	
    });
	
	/**
	 * Results - Apply active/inactive checkboxes search filter
	 */
	
	$('#activeBank').change(function () {
	    conductSearchWithin();
    });

    /**
	 * Results - Apply active/inactive checkboxes search filter
	 */
	$('#activeBank_mobile').change(function () {
	    onMobile = true;
        conductSearchWithin();
    });
    /**
	 * Results - faceted filter state and city
	 */
    $('#state').change(function () {
		conductSearchWithin();
    });
    $('#city').keyup(function () {
            conductSearchWithin();
    });
	
	/**
	 * Capture enter key to submit search within if focus is on the search within name input field
	 */
	$('#searchFilter').keyup(function (e) {
	    if (e.keyCode == 13) {
	    	conductSearchWithin();
	    }
	});
	
	/**
	 * Export the results to CSV file
	 */
	$('#exportResultsButton').click(function () {
		var filterStr = buildSearchFilter(urlParamName, urlParamFdic, urlParamAddress, urlParamCity, urlParamState, urlParamZip);        	
    	var sUrl = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Bank/export?$format=json&$inlinecount=allpages&$searchName='" +encodeURLParameter(urlParamName) +"'&$filter=" +filterStr;
    	
    	window.location.href=sUrl;
	});

    /**
	 *	Results - Loads results and populates data table
	 */
	if ($('.js-bankdatatable').length) { createResultsDataTable(); }
});

/**
 * Creates the results data table
 */
function createResultsDataTable() {
  	oTable = $('.js-bankdatatable').dataTable( {
          "sPaginationType": "listbox"
        , "iDisplayLength": 25
       // , "iDisplayStart": 25
        , "iTabIndex": 134
        , "bInfo": true
        , "bLengthChange" : true
        , "bFilter" : true
        , "bProcessing": true
        , "bServerSide": true
        , "bStateSave": true
        //, "bRetrieve": true
  	    //, "bDestroy": true
        //, "autoWidth": true
        , "fnStateSave": function (oSettings, oData) {
            localStorage.setItem( 'SearchResultDataTable', JSON.stringify(oData) );
        }
        , "fnStateLoad": function (oSettings) {
            return JSON.parse( localStorage.getItem('SearchResultDataTable') );
        }
        , "fnServerData": function( sUrl, aoData, fnCallback, oSettings ) { 
            oSettings.jqXHR = $.ajax({
                url: sUrl,
                data: aoData,
                dataType: "jsonp",
                success: function (data) {
                   	var result = resultsCallback(data);
                	fnCallback(result);
                	formatResultsTable();
                	buildResponsiveTableMenu("results",16);     
                	},
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    showThrottledError({},
                    genErrMsg,
                    supressErrorMessageTime)
                },
                timeout: ajaxTimeout
            });
        }
		, "fnServerParams": function(aoData) {
			createQueryParams(aoData);
		}
        , "sAjaxSource": function() {       
        	var filterStr = buildSearchFilter(urlParamName, urlParamFdic, urlParamAddress, urlParamCity, urlParamState, urlParamZip);        	
        	return APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Bank?$format=json&$inlinecount=allpages&$filter=" + filterStr + "&$callback=?";        	
        }()
        , "aaSorting": [ [2,'asc'],[0,'asc'] ]
        , "asStripeClasses": [ 'odd', 'even']
        , "aoColumns": [ 
              { "mDataProp": "legalName", "sClass": "essential" }
            , { "mDataProp": "certNumber", "sClass": "optional" }
            , { "mDataProp": function(d){ return d.activeFlag == 'N' ? '' : 'Active'; }, "sClass": "essential" }
            , { "mDataProp": function(d){ return capitalize(d.city) + ', ' + d.state;}, "sClass": "optional"}
            , { "mDataProp": function(d) { return d.activeFlag == 'Y' ? 'Specific Locations' : '';}, "sClass": "essential" }
        ]
        , "oLanguage" : {
        	"sZeroRecords" : "No results found",
        	"sLengthMenu": 'Show <select tabindex="135">'+
			             '<option value="25">25</option>'+
			             '<option value="50">50</option>'+
			             '<option value="100">100</option>'+
			             '</select> results'
        },
        "sDom": '<"top"lp>rt<"bottom"ip>'
        , "columnDefs": [
             { "width": "40%", "targets": 0 }
            ,{ "width": "10%", "targets": 1 }
            ,{ "width": "10%", "targets": 2 }
            ,{ "width": "20%", "targets": 3 }
            ,{ "width": "20%", "targets": 4 }
        ]
        //,"responsive":"true"
  	});
 }

/**
 * Adds oData parameters to the query to handle pagination and sorting requests
 * @param aoData
 * @returns
 */
function createQueryParams(aoData) {

	var sortCol = null, 
	    sortDir = null,
	    defaultSort = null;
	
	$.each(aoData, function(key, pair) {
		if(pair.name === "iDisplayLength") {
			aoData.push({"name":"$top","value":pair.value});
		}
		if(pair.name === "iDisplayStart") {
			aoData.push({"name":"$skip","value":pair.value});
		}
		if(pair.name === "iSortCol_0") {
			if(pair.value === 0) {
				sortCol = "legalName";
			}
			if(pair.value === 1) {
				sortCol = "certNumber";
			}
			if(pair.value === 2) {
				sortCol = "activeFlag";
			}
			if(pair.value === 3) {
				sortCol = "city,state";
			}
			if(pair.value === 4) {
				sortCol = "officeCount";
			}			
		}
		if(pair.name === "sSortDir_0") {
			if(sortCol === "activeFlag") {
				if(pair.value === "asc") {
					sortDir = "desc";
				} else {
					sortDir = "asc";
				}
			} else {
				sortDir = pair.value;
			}
		}
		//A second sort column only happens on initialization, default sort
		if(pair.name === "iSortCol_1") {
			defaultSort = "activeFlag desc,legalName asc";
		}

	});
	
	//$orderby = iSortCol_0 sSortDir_0
	if(sortCol && sortDir) {
		if(defaultSort) {
			aoData.push({"name":"$orderby","value":defaultSort});
		} else {
			aoData.push({"name":"$orderby","value":sortCol + " " + sortDir});
		}
	}
	
	return aoData;
}

/**
 * Callback for initial search results
 * 
 * @param data
 * 		The search results data
 */
function resultsCallback(data){
  	numResults = +data.d.__count;
	
	if(!nameOnlySearch) {
		displayFormattedSearchCriteria(numResults);
	} else {
		displayNewResultText(numResults);
		nameOnlySearch = false;
	}
	
	//If there were no search results for a bank name that included a geographic location
	if(numResults == 0 && urlParamName && (urlParamAddress || urlParamCity || urlParamState || urlParamZip)) {
		//Search again with just the bank name
		conductNameOnlySearchInstead();
	//Otherwise
	} else {
		//Hide the search results if there aren't any
	    if (numResults == 0) {
			$('#showSearchResults').hide();
             $('#resultsFilterContainer').show();
			$('#showNoSearchResults').show();
		} else {
			$('#showSearchResults').show();
            $('#resultsFilterContainer').show();
			$('#showNoSearchResults').hide();
		}
	}
	
	numberOfSearchesRun++;
	
	var jsonData = {
		    "sEcho": numberOfSearchesRun,
		    "iTotalRecords": numResults,
		    "iTotalDisplayRecords": numResults,
		    "aaData": data.d.results
		};
	
	return jsonData;
}

/**
 * Formats the data table
 * 
 * @param data
 * 		The search results data set
 */

function formatResultsTable(data) {
	
    //Format cell data
   	var oSettings = oTable.fnSettings();
	for(var i=0; i < oSettings.aoData.length; i++) {
		var trs = oSettings.aoData[i].nTr;
		var anTds = trs.getElementsByTagName('td');
		
		//Add red or green text by adding appropriate class
		if(anTds[2].innerHTML == 'Active') {
			anTds[2].className += " active-status";
		} else if(anTds[2].innerHTML == 'Inactive') {
		    anTds[2].className += " inactive-status";
		}
		
		//create detail link
		var bankName = anTds[0].innerHTML;
		var certNum = anTds[1].innerHTML;
		var hrefDetailsPage = './detail.html?bank=' + certNum + '&name=' + encodeURLParameter($.trim(bankName)) + "&searchName=" + encodeURLParameter(urlParamName) + "&searchFdic=" + urlParamFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&searchWithin=" + encodeURLParameter(urlParamSearchWithin) + "&activeFlag=" + urlActiveFlag;
		
		//Add link formatting to bank name
		var hrefOverview = hrefDetailsPage + "&tabId=2";
		anTds[0].innerHTML = "<a tabindex=\"136\" href='"+hrefOverview+"'>"+bankName+"</a>";
		
		//Add link formatting to number of branches
		var branches = anTds[4].innerHTML;
		if (branches) {
		 var hrefLocations = hrefDetailsPage + "&tabId=2";
			anTds[4].innerHTML = "<a tabindex=\"137\" href='"+hrefLocations+"'>"+branches+"</a>";
		}
	}
}

/**
 * Builds and displays the search criteria used for the current search along with the results.
 */
function displayFormattedSearchCriteria(results) {
	$('#js-searchCriteria').replaceWith(function() {
		//build criteria based on parameters
		var html = "";
		if(urlParamName) {
			html = html + "<span>Search using Name </span><span class='searchValue'>\""+urlParamName+"\"</span><span>, </span>";
		}
		if(urlParamFdic){
			html = html + "<span>FDIC # </span><span class='searchValue'>\""+urlParamFdic+"\"</span><span>, </span>";
		}
		if(urlParamAddress) {
			html = html + "<span>Address </span><span class='searchValue'>\""+urlParamAddress+"\"</span><span>, </span>";
		}
		if(urlParamCity) {
			html = html + "<span>City </span><span class='searchValue'>\""+urlParamCity+"\"</span><span>, </span>";
		}
		if(urlParamState){
			html = html + "<span>State </span><span class='searchValue'>\""+urlParamState+"\"</span><span>, </span>";
		}
		if(urlParamZip){
			html = html + "<span>Zip Code </span><span class='searchValue'>\""+urlParamZip+"\"</span><span>, </span>";
		}
		
		html = html.replace(/<span>, <\/span>$/i, "");
		
		if (urlParamName && (urlParamAddress || urlParamCity || urlParamState || urlParamZip)) {
			html = html.replace(/,\s([^,]+)$/, ' and $1');
		}

		var resultText = "";
		if ((results > 1) || (results == 0)) {
		    resultText = "Entries";
		} else {
		    resultText = "Entry";
		}

		html = html + "<span> has " +results +"&nbsp;"+ resultText + "</span>\n";
		
		return html;
	});
}


/**
 * Conducts a new search using only the bank name.
 */
function conductNameOnlySearchInstead() {
  
	//build url
	var filterStr = buildSearchFilter(urlParamName, null, null, null, null, null);
	
	//Remove parameters from the url so that search within works correctly.  
	urlParamCity = null;
	urlParamAddress = null;
	urlParamFdic = null;
	urlParamZip = null;
	urlParamState = null;

	var sUrl = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Bank?$format=json&$inlinecount=allpages&$filter=" + filterStr + "&$callback=?";
	oTable.fnReloadAjax(sUrl);
	nameOnlySearch = true;
}

/**
 * Conducts a search on bank name within the current search results.
 */
function conductSearchWithin() {
   
    urlParamSearchWithin = $('#searchFilter').val();
    urlActiveFlag = false;
    if ($('#activeBank').is(':checked')) {
        urlActiveFlag = true;
    } else if ($('#activeBank_mobile').is(':checked')) {
        urlActiveFlag = true;
    }
	urlParamCity = $('#city').val();
	urlParamState = $('#state').val();
	
	//build url
	var filterStr = buildSearchFilter(urlParamName, urlParamFdic, urlParamAddress, urlParamCity, urlParamState, urlParamZip, urlActiveFlag);
	var sUrl = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Bank?$format=json&$inlinecount=allpages&$filter=" + filterStr + "&$callback=?";
	
	oTable.fnReloadAjax(sUrl);
	displayFilterString(true, urlParamCity, urlParamState, urlActiveFlag);
}

function displayFilterString(filteredBySearchCriteria, urlParamCity, urlParamState, urlActiveFlag, urlParamSearchWithin) {
    if (filteredBySearchCriteria) {
        var city = urlParamCity;
        var state = urlParamState;
        var searchFilter = urlParamSearchWithin;
        var activeFilter = true;
       
        //create a filter string
        var filterString = "\"";

        if (city && city != "null") {
            filterString = filterString + city;
        }

        if ((city && city != "null") && (state && state != "null")) {
            filterString = filterString + ", ";
        }


        if (state && state != "null") {
            filterString = filterString + state;
        }


        if (searchFilter && searchFilter != "null") {
            filterString = filterString + ", " + searchFilter;
        }

        if (urlActiveFlag) {
            filterString = filterString + " <span style='color:rgb(5, 144, 69) !important;'>Active</span>";
        } else {
            activeFilter = false;
        }

        filterString = filterString + "\"";

        if ((!city || city == "null") && (!state || state == "null") && (!searchFilter || searchFilter == "null") && (!activeFilter)) {
            $('#refineCriteria').html("Current Filter:None");
        } else {
            $('#refineCriteria').html("Current Filter: " + filterString);
        }
    }

    if (!filteredBySearchCriteria) {
        if (filteredByState) {
            $('#searchCriteria').html("\"" + selectedState + "\"");
        } else {
            $('#searchCriteria').html("\"None\"");
        }
    }

}

/**
 * Display the search criteria used instead of the original search
 */
function displayNewResultText(results) {
	var html = $('#searchCriteria').html();
	$('#searchCriteria').html(function() {
		var replacehtml = "<span> had no matching results but search using Name </span><span class='searchValue'>\""+urlParamName+"\"</span>";
		
		var resultText = "";
		if(results == 1) {
			resultText = "result";
		} else {
			resultText = "results";
		}
		replacehtml = replacehtml + "<span> has "+results+" "+resultText+".</span>\n";
		
		var myPattern=new RegExp("<span> has 0 results.</span>","i");
		html=html.replace(myPattern,replacehtml);
		return html;
	});
}

/**
 * Builds the bank search filter string for the ajax request
 * 
 * @param name
 * 		The name of the bank
 * @param certNumber
 * 		The cert number of the bank
 * @param address
 * 		The street address of the bank
 * @param city
 * 		The city in which the bank is located
 * @param state
 * 		The state in which the bank is located
 * @param zip
 * 		The zip code of the bank
 * @returns {String}
 * 		The filter string
 */
function buildSearchFilter( name, certNumber, address, city, state, zip) {
    
	//Get filter variables
	var nameFilter = $('#searchFilter').val();

	//remove invalid characters
   
	var activeBankFilter = false;
 
	if ($('#activeBank').is(':checked')) {
	    activeBankFilter = true;
	}
  
	if ($('#activeBank_mobile').is(':checked')) {
	    activeBankFilter = true;
	}
 

	var str = "";
	
	if (name) {
		
		str = "(";
		 
		var nameList = createFuzzyList(name);
		for(var x = 0; x < nameList.length; x++) {
			var searchTerm = nameList[x];
			searchTerm = searchTerm.replace(/&/g,"%26");
			searchTerm = searchTerm.replace(/'/g,"%27%27");
			searchTerm = searchTerm.replace(/\//g,"%2F");
			str = str + "substringof('" +searchTerm.toUpperCase() + "',name)";
			if(x < nameList.length - 1) {
				str = str + " or ";
			}
		}
		
		str = str + ")";
		
		//To prevent the name field from creating URLs that are over 2000 character, the string length will be looked at 
		//and use the fuzzy search if short enough or the roginally entered name text otherwise.
		if(str.length > 2000) {
			var encodedName = name;
			encodedName = encodedName.replace(/&/g,"%26");
			encodedName = encodedName.replace(/'/g,"%27%27");
			encodedName = encodedName.replace(/\//g,"%2F");
			str = "substringof('" +encodedName.toUpperCase() + "',name)";
		} 
		
		if(nameFilter) {
			var encodedNameFilter = nameFilter;
			encodedNameFilter = encodedNameFilter.replace(/&/g,"%26");
			encodedNameFilter = encodedNameFilter.replace(/'/g,"%27%27");
			encodedNameFilter = encodedNameFilter.replace(/\//g,"%2F");
			str = str + " and substringof('" +encodedNameFilter.toUpperCase() + "',name)";
		}
		
	} else {
		if(nameFilter) {
			var encodedNameFilter = nameFilter;
			encodedNameFilter = encodedNameFilter.replace(/&/g,"%26");
			encodedNameFilter = encodedNameFilter.replace(/'/g,"%27%27");
			encodedNameFilter = encodedNameFilter.replace(/\//g,"%2F");
			str = "substringof('" +encodedNameFilter.toUpperCase() + "',name)";
		}
	}
	
	if (certNumber){
		if(str) {
			str = str  + " and (";
		} else {
			str = "(";
		}
		
		str = str + "certNumber eq " + certNumber;
		
		str = str + ")";
	}
	
	if (address){
		if(str) {
			str = str  + " and (";
		} else {
			str = "(";
		}
		var encodedAddress = address;
		encodedAddress = encodedAddress.replace(/&/g,"%26");
		encodedAddress = encodedAddress.replace(/'/g,"%27%27");
		encodedAddress = encodedAddress.replace(/#/g,"%23");
		str = str + "substringof('" + encodedAddress.toUpperCase() + "',address)";
		
		str = str + ")";
	}
	
	if (city){
		if(str) {
			str = str  + " and (";
		} else {
			str = "(";
		}
		var encodedCity = city;
		encodedCity = encodedCity.replace(/&/g,"%26");
		encodedCity = encodedCity.replace(/'/g,"%27%27");
		encodedCity = encodedCity.replace(/#/g,"%23");
		str = str + "substringof('" + encodedCity.toUpperCase() + "',city)";

		str = str + ")";
	}
	
	if (state){
		if(str) {
			str = str  + " and (";
		} else {
			str = "(";
		}

		str = str + "state eq '" + state.toUpperCase() + "'";
		
		str = str + ")";
	}
	
	if (zip){
		if(str) {
			str = str  + " and (";
		} else {
			str = "(";
		}
		
		str = str + "startswith(zip," + zip +")";
		
		str = str + ")";
	}
	
	if(activeBankFilter) {
		str = str  + "&activeFlag=Y";
	}
	
	return str;

}


/**
 * Populates the demographic date with the data from the ajax call
 * @param data
 * 		Data from the ajax call
 */
function populateDemDate(data) {
	//The wrapped data is a singleton array with a map inside, 
	//so use the first member of the array and iterate through the map
	$.each(data[0], function(key, value) {
		//Parse date from DB
		if(key == 'currDemDt') {	
			value = parseUTC(value, 'm/d/yy', false);
			
			//add value to html element		
			$('.tmpl-' + key).text(value); 
		}
	});
}
//jQuery.fn.dataTableExt.oApi.fnReloadAjax = function (oSettings, sNewSource, fnCallback, bStandingRedraw) {
//    // DataTables 1.10 compatibility - if 1.10 then `versionCheck` exists.
//    // 1.10's API has ajax reloading built in, so we use those abilities
//    // directly.
//    if (jQuery.fn.dataTable.versionCheck) {
//        var api = new jQuery.fn.dataTable.Api(oSettings);

//        if (sNewSource) {
//            api.ajax.url(sNewSource).load(fnCallback, !bStandingRedraw);
//        }
//        else {
//            api.ajax.reload(fnCallback, !bStandingRedraw);
//        }
//        return;
//    }

//    if (sNewSource !== undefined && sNewSource !== null) {
//        oSettings.sAjaxSource = sNewSource;
//    }

//    // Server-side processing should just call fnDraw
//    if (oSettings.oFeatures.bServerSide) {
//        this.fnDraw();
//        return;
//    }

//    this.oApi._fnProcessingDisplay(oSettings, true);
//    var that = this;
//    var iStart = oSettings._iDisplayStart;
//    var aData = [];

//    this.oApi._fnServerParams(oSettings, aData);

//    oSettings.fnServerData.call(oSettings.oInstance, oSettings.sAjaxSource, aData, function (json) {
//        /* Clear the old information from the table */
//        that.oApi._fnClearTable(oSettings);

//        /* Got the data - add it to the table */
//        var aData = (oSettings.sAjaxDataProp !== "") ?
//            that.oApi._fnGetObjectDataFn(oSettings.sAjaxDataProp)(json) : json;

//        for (var i = 0 ; i < aData.length ; i++) {
//            that.oApi._fnAddData(oSettings, aData[i]);
//        }

//        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

//        that.fnDraw();

//        if (bStandingRedraw === true) {
//            oSettings._iDisplayStart = iStart;
//            that.oApi._fnCalculateEnd(oSettings);
//            that.fnDraw(false);
//        }

//        that.oApi._fnProcessingDisplay(oSettings, false);

//        /* Callback user function - for event handlers etc */
//        if (typeof fnCallback == 'function' && fnCallback !== null) {
//            fnCallback(oSettings);
//        }
//    }, oSettings);
//};