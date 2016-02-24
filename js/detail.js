/*
 * $Workfile: detail.js$
 * $Id: detail.js,v 1.51, 2014-07-22 18:38:42Z, Goltermann_Jason D.$
 * $Author: Goltermann_Jason D.$
 * Created $Date: 7/22/2014 2:38:42 PM$
 * $Revision: 52$
 *
 * Copyright 2012 by Federal Deposit Insurance Corporation
 */

//global arrays that store information about number of offices by location
var officesByState = [];
var officesByOther = [];
var locationsTable = null;
var locationsTableDisplayMenuBuilt = false;
var historyTable = null;
var uniNum = null;
var identificationsTableLoaded = false;
var financialsTableLoaded = false;
var historyTableLoaded = false;
var ultCertName = "";
var ultCertNum = "";
var ultCertCity = "";
var ultCertState = "";
var numberOfSearchesRun = 0;
var bankStatus = "";
var gSelectedState = "";
var noFinancials = false;
var certChangedEvent = false;
var toCertDoesNotExist = false;

$(document).ready(function () {

    /* initialize popover indicator */
    $('[data-toggle="popover"]').popover({ html: true });
    /* initialize tooltip indicator */
    $('[data-toggle="tooltip"]').tooltip();

    loadFnReloadAjax();

    /**
	 * load state table data and store in global variables - (This is needed to be done before the locations tab is loaded because an active bank's detail page needs to list
	 * the number of states that have offices in them
	 */
    loadViewByStateDataTable();

    /**
	 * Returns user to the previous page
	 */
    $('#js-goBackToSearchResults').attr('href', function () {
        return './results.html?fdic=' + urlParamSearchFdic + '&name=' + encodeURLParameter(urlParamSearchName) + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&searchWithin=" + encodeURLParameter(urlParamSearchWithin) + "&activeFlag=" + urlActiveFlag;
    });

    /**
	 * Details Tab - Controls tab navigation on the details page
	 */
    $('.js-detailTab').click(function () {
        if ($(this).is('.tabOff')) {
            //get the id of the current on tab
            var currentId = $('.tabOn').attr('id');
            currentId = currentId.substring(0, currentId.length - 3);
            //turn the current on tab off
            $('.tabOn').removeClass('tabOn').addClass('tabOff');

            //hide the current detail section
            $("#" + currentId).hide();


            //turn selected tab on
            $(this).removeClass('tabOff').addClass('tabOn');
            //get the id of selected tab
            var nextId = $(this).attr('id');
            nextId = nextId.substring(0, nextId.length - 3);


            //Defect in small viewports when tabs are stacked. 
            //Hack to fix when clicking from identifications 
            //tab to history and financials tab. 
            //Root cause: ID tab is blocking out other tabs.
            if (nextId == 'identifications') {
                $("#" + nextId).show();
                //use inline-block so that the id section pushes 
                //into flow after tabs
                $("#" + nextId).css('display', 'inline-block');
                $("#" + nextId).css('width', '100%');
            } else {
                //show the selected detail section
                $("#" + nextId).show();
            }

            //load only search Results sub tab by default

            //fix background colors
            //$('.tabOn').css('background-color', 'white');
            //$('.tabOff').css('background-color', '#909090');

            loadTabDetails(nextId, "searchResultsLink", null);
        }
    });

    /**
	 * Details Tab - Darkens off tabs that are hovered over
	 */
    //$('.js-detailTab').hover(function () {
    //    if ($(this).is('.tabOff')) {
    //        $(this).css('background-color', '#707070');
    //    }
    //}, function () {
    //    if ($(this).is('.tabOff')) {
    //        $(this).css('background-color', '#909090');
    //    }
    //});

    /**
	 * Locations Tab Navigation - Controls link navigation on the locations tab of the details page
	 */
    $('.js-locationLink').click(function () {
        if ($(this).is('.linkOn')) {

            //reactivate the link that was off
            $('.linkOff').addClass('linkOn').removeClass('linkOff');

            //turn this link off
            $(this).addClass('linkOff').removeClass('linkOn');

            //get the id of the clicked link
            var clickedId = $(this).attr('id');

            //If byState was clicked
            if (clickedId == 'byStateLink') {
                //toggle the results and byState tables
                $('#results').hide();
                $('#byState').show();
            } else {
                //toggle the results and byState tables
                $('#results').show();
                $('#byState').hide();
            }

            //load the locations sub tab details
            loadTabDetails("locations", clickedId, null);
        }
    });

    /**
	 * Overview Tab - loads the bank details
	 */
    if ($('.js-bankdetails').length) {

        //For overview tab
        var odataURL = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Institution?$format=json&$filter=certNumber eq " + urlParamBank + "&$callback=?";
        $.ajax({
            dataType: "jsonp",
            url: odataURL,
            success: detailsCallback,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                showThrottledError({},
                genErrMsg,
                supressErrorMessageTime)
            },
            timeout: ajaxTimeout
        });
    }

    /**
      * History - shows or removes acquire/merger events
      */
    $('#acquiredFilterCheckbox').click(function () {
        if ($('#acquiredFilterCheckbox').is(':checked')) {
            // historyTable.fnResetAllFilters();
            // Remove all filtering      
            historyTable.fnFilterClear();
        } else {
            historyTable.fnFilter("^((?!810).*)$ | ^((?!811).*)$ | ^((?!812).*)$", 2, true);
        }
    });

    /**
	 * Export the details to CSV file
	 */
    $('#exportDetailsButton').click(function () {
        //find the selected tab
        var selectedTabId = $('.tabOn').attr('id');
        selectedTabId = selectedTabId.substring(0, selectedTabId.length - 3);
        var regulatorInfo = $('#regulatorInfo>a').text();
        //overview, identifications or financials tab
        if (selectedTabId == 'overview' ||
				selectedTabId == 'identifications' ||
				selectedTabId == 'financials') {
            odataURL = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Institution/export?$format=json&$tab=" + selectedTabId + "&$regulatorWebsite='" + regulatorInfo + "'&$filter=certNumber eq " + urlParamBank + "&$searchName=" + urlParamName + "&$searchCert=" + urlParamBank + "&$callback=?";
            //locations tab
        } else if (selectedTabId == 'locations') {
            //find the selected subtab (it's the link that is off)
            var selectedSubTabId = $('.linkOff').attr('id');
            var filterStr = "";
            var subTabDisplay = "locations"
            if (selectedSubTabId == 'byStateLink') {
                subTabDisplay = "stateLocations";
                filterStr = "certNumber eq " + urlParamBank;
            } else if (selectedSubTabId == 'searchResultsLink') {
                filterStr = buildLocationsSearchFilter(urlParamBank, urlParamAddress, urlParamCity, urlParamState, urlParamZip);
            } else if (selectedSubTabId == 'allResultsLink') {
                filterStr = buildLocationsSearchFilter(urlParamBank, null, null, null, null);
            } else {
                filterStr = buildLocationsSearchFilter(urlParamBank, null, null, gSelectedState, null);
            }
            odataURL = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Branch/export?$format=json&$tab=" + subTabDisplay + "&$inlinecount=allpages&$filter=" + filterStr + "&$callback=?";
            //history tab
        } else if (selectedTabId == 'history') {
            odataURL = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/History/export?$callback=historyCallback&$format=json&$tab=history&$filter=" + buildHistoryFilter() + "&$searchCert=" + urlParamBank + "&$searchName=" + encodeURLParameter($.trim(urlParamName));
        }

        window.location.href = odataURL;
    });
});

function buildHistoryFilter() {
    var encodedNameFilter = $.trim(urlParamName);
    encodedNameFilter = encodedNameFilter.replace(/&/g, "%26");
    encodedNameFilter = encodedNameFilter.replace(/'/g, "%27%27%27%27");
    encodedNameFilter = encodedNameFilter.replace(/\//g, "%2F");
    return "legalName eq '" + encodedNameFilter.toUpperCase() + "' and certNumber eq " + urlParamBank + "";
}

/**
 * Display the appropriate tab, as determined by the tabId param
 */
function displayTab() {
    //close any open tooltips
    $('.tooltip').hide();

    var tabId = urlParamTabId;
    if (tabId == '2') {
        //load locations tab

        //turn the overviewTab off
        $('#overviewTab').addClass('tabOff').removeClass('tabOn');
        //hide the overview detail section
        $("#overview").hide();

        //turn locations tab on
        $("#locationsTab").addClass('tabOn').removeClass('tabOff');
        //show the locations detail section
        $("#locations").show();
        //load locations tab
        loadTabDetails("locations", "searchResultsLink", null);
    } else if (tabId == '3') {
        //load history tab

        //turn the overviewTab off
        $('#overviewTab').addClass('tabOff').removeClass('tabOn');
        //hide the overview detail section
        $("#overview").hide();

        //turn locations tab on
        $("#historyTab").addClass('tabOn').removeClass('tabOff');
        //show the locations detail section
        $("#history").show();
        loadTabDetails("history", null, null);
    } else if (tabId == '4') {
        //load identifications tab

        //turn the overviewTab off
        $('#overviewTab').addClass('tabOff').removeClass('tabOn');
        //hide the overview detail section
        $("#overview").hide();

        //turn locations tab on
        $("#identificationsTab").addClass('tabOn').removeClass('tabOff');
        //show the locations detail section
        $("#identifications").show();
        loadTabDetails("identifcations", null, null);
    }
    else if (tabId == '5') {
        //load financial tab

        //turn the overviewTab off
        $('#overviewTab').addClass('tabOff').removeClass('tabOn');
        //hide the overview detail section
        $("#overview").hide();

        //turn financials tab on
        $("#financialsTab").addClass('tabOn').removeClass('tabOff');
        //show the financials detail section
        $("#financials").show();
        loadTabDetails("financials", null, null);
    }
    else {
        //tabId is 1 or null
        //load overview tab - on by default, do nothing
    }
}

/**
 * Toggles print and export button
 */
function togglePrintAndExportButtons() {
    if ($('#exportDetailsButton').is(':visible')) {
        $('#exportDetailsButton').hide();
    } else {
        $('#exportDetailsButton').show();
    }

    $('#printDetailsButton').toggle();
}

/**
 * Loads data and creates table for the selected tab on the details page
 * 
 * @param clickedTabId
 * 		The id of the clicked details tab
 * @param subTabId
 * 		The id of the clicked sub tab (for the 'Locations' tab)
 * @param selectedState
 * 		the state to filter on if search results need to be filtered by state (used from the View By State Sub Tab)
 */
function loadTabDetails(clickedTabId, subTabId, selectedState) {
    if (clickedTabId == 'overview') {
        $('#exportDetailsButton').show();
        $('#printDetailsButton').show();
        return;
    }

    //Check which tab and make ajax calls
    if (clickedTabId == 'locations') {
        //Get data for locations
        if ($('.showNoLocations').is(':visible')) {
            //No data for locations is displayed for inactive or renamed banks.  No need to load
            //data or display print and export buttons
            $('#exportDetailsButton').hide();
            $('#printDetailsButton').hide();
        } else {
            $('#exportDetailsButton').show();
            $('#printDetailsButton').show();
            //for allResults sub tab
            if (subTabId == 'allResultsLink') {
                createLocationDataTable(false, false, null);
                return;
            }

            //for filtered results
            if (subTabId == 'searchResultsLink') {
                if (selectedState != null) {
                    createLocationDataTable(false, true, selectedState);
                    return;
                } else {
                    createLocationDataTable(true, false, null);
                    return;
                }
            }

            //for results by state - data loaded at beginning to get state count
            if (subTabId == 'byStateLink') {
                createViewByStateDataTable();
                return;
            }
        }
    }

    if (clickedTabId == 'history') {
        if ($('#showNoHistory').is(':visible')) {
            $('#exportDetailsButton').hide();
            $('#printDetailsButton').hide();
        } else {
            $('#exportDetailsButton').show();
            $('#printDetailsButton').show();
            //Load history if not already loaded
            if (!historyTableLoaded) {
                createHistoryDataTable();
                return;
            }
        }
    }

    if (clickedTabId == 'identifications') {
        $('#exportDetailsButton').show();
        $('#printDetailsButton').show();
        if (!identificationsTableLoaded) {
            loadIdentificationDataTable();
            return;
        }
    }

    if (clickedTabId == 'financials') {

        if (!financialsTableLoaded) {
            loadfinancialsDataTable();
        } else {
            if (noFinancials) {
                $('#exportDetailsButton').hide();
                $('#printDetailsButton').hide();
            } else {
                $('#exportDetailsButton').show();
                $('#printDetailsButton').show();
            }
        }

        return;
    }
}

/**
 * Creates the history data table
 */
function createHistoryDataTable() {
    var deferred = $.Deferred();
    var legalNameFilter = $.trim(urlParamName);
    legalNameFilter = legalNameFilter.replace(/'/g, "''");
    historyTable = $('#historyTable').dataTable({
        "sPaginationType": "listbox"
        , "bInfo": true
		, "bSort": true
        , "iTabIndex": 147
        , "bLengthChange": true
        , "bFilter": true
        , "bProcessing": true
        , "bServerSide": false
        , "bRetrieve": true
        , "bDestroy": true
        , "fnServerData": function (sUrl, aoData, fnCallback, oSettings) {
            oSettings.jqXHR = $.ajax({
                "url": sUrl,
                "data": aoData,
                "success": fnCallback,
                "dataType": "jsonp",
                "cache": false,
                "complete": function (xhr, status) {
                    //Show or hide acquire/merger events when tab is navigated to.  Fix for browser 
                    //history having box already checked when returning to page and history showing wrong filter
                    if ($('#acquiredFilterCheckbox').is(':checked')) {
                        historyTable.fnFilterClear();
                    } else {
                        historyTable.fnFilter("^((?!810).*)$ | ^((?!811).*)$ | ^((?!812).*)$", 2, true);
                    }
                    deferred.resolve();
                }
            });
        }
        , "sAjaxSource": APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/History?$callback=historyCallback&$format=json&$filter=" + buildHistoryFilter()
        , "sAjaxDataProp": "d.results"
        , "aaSorting": [[0, 'asc']]
        , "asStripeClasses": ['odd', 'even']
        , "aoColumns": [
              { "mDataProp": function (d) { return parseUTC(d.orgEffDate, 'm/d/yy', false); }, "sClass": "essential" }
            , {
                "mDataProp": function (d) {
                    if (d.eventDescription) {
                        return parseEventDescription(d);
                    } else {
                        return "";
                    }
                }, "sClass": "essential"
            }
            , { "mDataProp": function (d) { return d.changeCode; }, "bVisible": false }
        ]
        , "oLanguage": {
            "sZeroRecords": "No results found"
        }
        , "sDom": '<"top"ilp>rt<"bottom"p>'
        , "responsive": "true"
        ,"columnDefs":  [{ "width":"20%", "targets":0 } ]
    });
    return deferred.promise();
}

/**
 * Parses the event description to add links and bold text
 * 
 * @param d
 * 		The data set containing the event description and other information
 * @returns
 * 		A formatted event description
 */
function parseEventDescription(d) {

    var eventDescription = d.eventDescription;

    //Check event for links and add anchor tags
    eventDescription = eventDescription.replace(/(\/idasp[^\s|^\r\n|^\n]+)/, '<a href=\"' + LEGACY_APP_HOST_PREFIX + '$1\">' + LEGACY_APP_HOST_PREFIX + '$1</a>');

    //replace bracketed URL message
    eventDescription = eventDescription.replace("<URL of external Information Gateway page>", "")

    //Use cert and legal name
    if (d.changeCode == "1" || d.changeCode == "110" || d.changeCode == "150") {

        if (d.certClickable == "certClickable") {
            //create the url
            var url = './detail.html?bank=' + d.certNumber + '&name=' + encodeURLParameter(d.legalName) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            //Replace the cert with a link
            eventDescription = eventDescription.replace(d.certNumber, "<a tabIndex=\"1001\" title=\"Go To Cert Number " + d.certNumber + "\" href=\"" + url + "\">" + d.certNumber + "</a>");
        }
        if (d.certClickable != "certClickable" && d.changeCode == "150") {
            toCertDoesNotExist = true;
        }
        if (d.dvstCertClickable == "dvstCertClickable" && d.changeCode == "150") {
            var name = d.prevLegalName || d.orgDvstLegalName || d.legalName;
            var url = './detail.html?bank=' + d.orgDvstCertNum + '&name=' + encodeURLParameter(name) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            //Replace the cert with a link
            eventDescription = eventDescription.replace("(" + d.orgDvstCertNum + ")", "(<a tabIndex=\"1001\" title=\"Go To Cert Number " + d.orgDvstCertNum + "\" href=\"" + url + "\">" + d.orgDvstCertNum + "</a>)");
        }


        //Use cert and legal name and bold legal name
    } else if (d.changeCode == "420" || d.changeCode == "510") {
        //Bold the institution name
        eventDescription = eventDescription.replace(d.legalName, "<span class=\"cs-fontb\">" + d.legalName + "</span>");
        if (d.certClickable == "certClickable") {
            //create the url
            var url = './detail.html?bank=' + d.certNumber + '&name=' + encodeURLParameter(d.legalName) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            //Replace the cert with a link
            eventDescription = eventDescription.replace(d.certNumber, "<a tabIndex=\"1001\" title=\"Go To Cert Number " + d.certNumber + "\" href=\"" + url + "\">" + d.certNumber + "</a>");
        }

        //If a merge/acquired event, link to acquiring cert and name
    } else if (d.changeCode == "211" || d.changeCode == "212" || d.changeCode == "213" || d.changeCode == "215" || d.changeCode == "216" ||
			d.changeCode == "217" || d.changeCode == "221" || d.changeCode == "222" || d.changeCode == "223" || d.changeCode == "225") {
        if (d.acqCertClickable == "acqCertClickable") {
            //create the url
            var url = './detail.html?bank=' + d.orgAcqCertNum + '&name=' + encodeURLParameter(d.orgAcqLegalName) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            //Replace the cert with a link 
            eventDescription = eventDescription.replace(d.orgAcqCertNum, "<a tabIndex=\"1001\" title=\"Go To Cert Number " + d.orgAcqCertNum + "\" href=\"" + url + "\">" + d.orgAcqCertNum + "</a>");
        }
        //make the line bold
        eventDescription = "<span class=\"cs-fontb\">" + eventDescription + "</span>";


        //If a divest event, linking to divest cert and name
    } else if (d.changeCode == "810" || d.changeCode == "811" || d.changeCode == "812") {
        if (d.dvstCertClickable == "dvstCertClickable") {
            //create the url
            var url = './detail.html?bank=' + d.orgDvstCertNum + '&name=' + encodeURLParameter(d.orgDvstLegalName) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            //Replace the cert with a link
            eventDescription = eventDescription.replace(d.orgDvstCertNum, "<a tabIndex=\"1001\" title=\"Go To Cert Number " + d.orgDvstCertNum + "\" href=\"" + url + "\">" + d.orgDvstCertNum + "</a>");
        }
    }

    return eventDescription;
}

/**
 * Loads data and performs post-processing after the history ajax call completes
 * @param data
 * 		The data returned from the server
 */
function historyCallback(data) {

    //process results and add to datatable
    var d = data.d.results;

    //Turn history off if results are empty
    if (!d || !d.length) {
        $('#showHistory').hide();
        $('#showHistory').remove();
        $('#showNoHistory').show();
    }


    historyTable.fnAddData(d);

    //hide the processing div and the paginator if not needed
    $('.dataTables_processing').css('visibility', 'hidden');

    historyTableLoaded = true;

    //Create header from first record
    var info = d[0];
    var historyHeaderString = "<h5 class=\"pvs\">History of " + urlParamName + " (FDIC #: " + urlParamBank + ")</h5>";
    $('.js-historyHeader').replaceWith(function () {
        return historyHeaderString;
    });



    //search for acquired event
    var hasAcquired = false;
    for (var i = 0; i < d.length; i++) {
        if (d[i].changeCode == "810" || d[i].changeCode == "811" || d[i].changeCode == "812") {
            hasAcquired = true;
            break;
        }
    }

    if (hasAcquired) {
        //Filter out acquired events
        historyTable.fnFilter("^((?!810).*)$ | ^((?!811).*)$ | ^((?!812).*)$", 2, true);
    } else {
        //remove button
        $('#acquiredFilterCheckboxDiv').remove();
    }


    //Loop through records to see if there is a merge event
    var isMergingEvent = false;
    for (var i = 0; i < d.length; i++) {
        if (d[i].changeCode == "211" || d[i].changeCode == "212" || d[i].changeCode == "213" || d[i].changeCode == "215" || d[i].changeCode == "216" ||
				d[i].changeCode == "217" || d[i].changeCode == "221" || d[i].changeCode == "222" || d[i].changeCode == "223" || d[i].changeCode == "225") {
            isMergingEvent = true;
            break;
        }
    }

    //If there is a merged record, use the last event in the history to create the second header
    if (isMergingEvent) {
        var info = d[d.length - 1];
        //create history header		
        var historyAcquiredInfoString = "<h5 class=\"pbs\">This institution is currently part of " + info.orgAcqLegalName + ", " + capitalize(info.orgAcqCity) + ", " + info.orgAcqState + " (FDIC #: " + info.orgAcqCertNum + ")</h5>";
        $('.js-historyAcquiredInfo').replaceWith(function () {
            return historyAcquiredInfoString;
        });
    }

    if (certChangedEvent) {
        var establishedDate = $('#historyTable tbody tr:first td:first').html();
        establishedDate = formatDate(establishedDate);
        $(".tmpl-establishedDate").text(establishedDate);
    }

    //For banks that had a cert change, the divesting bank may never have been FDIC insured. Must change anchor create previously
    if (toCertDoesNotExist) {
        var searchString = "See successor institution,";
        var $certChange = $(".changeCert:contains('" + searchString + "')");
        var $bankNameSpan = $certChange.find("span");
        var text = $.trim($certChange.text());
        //get rid of middle space
        var firstHalfText = text.substring(0, text.indexOf(searchString) + searchString.length);
        var lastHalfText = text.substring(text.indexOf(searchString) + searchString.length + 1, (text.length + 1));
        var wholeText = $.trim(firstHalfText) + $.trim(lastHalfText);
        var newText = wholeText.replace(searchString, "The successor institution is ");
        var newHtml = newText.replace($bankNameSpan.text(), $bankNameSpan[0].outerHTML);
        $certChange.html(newHtml);
    }
}

/**
 * Creates a data table for all branch locations for the bank
 * 
 * @param filteredBySearchCriteria
 * 		true to use search criteria filters or false otherwise
 * @param filteredByState
 * 		true to use state filter or false otherwise
 * @param selectedState
 * 		A state to filter or null for foreign country
 */
function createLocationDataTable(filteredBySearchCriteria, filteredByState, selectedState) {

    if (locationsTable != null) {
        var sUrl = createAjaxSource(filteredBySearchCriteria, filteredByState, selectedState);
        locationsTable.fnReloadAjax(sUrl, function () {
            displayFilterString(filteredBySearchCriteria, filteredByState, selectedState);
        });
    } else {

        locationsTable = $('.js-locationdatatable').dataTable({
            "sPaginationType": "listbox"
          , "iDisplayLength": 25
          , "iTabIndex": 145 //tabindex="137"
          , "bLengthChange": true
          , "bProcessing": true
          , "bServerSide": true
          , "bRetrieve": true
          , "bDestroy": true
          , "aaSorting": [[6, 'asc'], [5, 'asc']]
         , "fnServerData": function (sUrl, aoData, fnCallback, oSettings) {
             oSettings.jqXHR = $.ajax({
                 url: sUrl,
                 data: aoData,
                 dataType: "jsonp",
                 success: function (data) {
                     var result = locationsCallback(data);
                     fnCallback(result);
                     buildResponsiveTableMenu("locationsTable", 24);
                 },
                 error: function (XMLHttpRequest, textStatus, errorThrown) {
                     showThrottledError({},
                     genErrMsg,
                     supressErrorMessageTime)
                 },
                 timeout: ajaxTimeout
             });
         }
            , "fnServerParams": function (aoData) {
                createQueryParams(aoData);
            }
            , "sAjaxSource": function () {
                return createAjaxSource(filteredBySearchCriteria, filteredByState, selectedState);
            }()
            , "fnInitComplete": function () {
                displayFilterString(true, false, null);
            }
          , "aoColumns":
                [{ "mDataProp": "id", "sClass": "essential tc5" },
                { "mDataProp": "branchNum", "sClass": "optional tc5" },
                { "mDataProp": "branchName", "sClass": "essential" },
                { "mDataProp": "address" },
                { "mDataProp": "county", "sClass": "optional" },
                { "mDataProp": "city", "sClass": "optional" },
                { "mDataProp": "state", "sClass": "essential" },
                {
                    "mDataProp": function (d) {
                        //remove decimals
                        var zip = d.zip.split(".")[0];
                        //if zip is not all zeros
                        //if(!/[0]{1,5}/i.test(zip)) {
                        if ($.trim(zip) != '0') {
                            //pad with leading zeros
                            for (var i = 0; i < 5 - zip.length; i++) {
                                zip = "0" + zip;
                            }
                        } else {
                            zip = '';
                        }
                        return zip;
                    }, "sClass": "optional"
                },
                { "mDataProp": function (d) { return lookupServiceTypeCode(d.servTypeCd); } },
                { "mDataProp": function (d) { return parseUTC(d.establishedDate, 'mm/dd/yy', false); }, "sClass": "tc10" },
                {
                    "mDataProp": function (d) {
                        var acquiredDate = parseUTC(d.acquiredDate, 'mm/dd/yy', false);
                        if (acquiredDate == '12/31/9999') {
                            return '';
                        } else {
                            return acquiredDate;
                        }
                    }, "sClass": "tc10"
                }]
          , "oLanguage": {
              "sZeroRecords": "No results found",
              "sLengthMenu": 'Show <select tabindex="146">' +
              '<option value="25">25</option>' +
              '<option value="50">50</option>' +
              '<option value="100">100</option>' +
              '</select> records'
          },
            "sDom": '<"top"ilp>rt<"bottom"p>'
        });
    }
}

/**
 * Creates the ajax source
 * 
 * @param filteredBySearchCriteria
 * 		Whether or not to use the search parameters from the url
 * @param filteredByState
 * 		whether or not the search is only to be filtered by state
 * @param selectedState
 * 		The state to filter by
 * @returns {String}
 * 		the ajax source string
 */
function createAjaxSource(filteredBySearchCriteria, filteredByState, selectedState) {
    var filterStr = "";
    if (filteredByState) {
        filterStr = buildLocationsSearchFilter(urlParamBank, null, null, selectedState, null);
    } else {
        if (filteredBySearchCriteria) {
            filterStr = buildLocationsSearchFilter(urlParamBank, urlParamAddress, urlParamCity, urlParamState, urlParamZip);
        } else {
            filterStr = buildLocationsSearchFilter(urlParamBank, null, null, null, null);
        }
    }

    return APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Branch?$format=json&$inlinecount=allpages&$filter=" + filterStr + "&$callback=?";
}


/**
 * Displays the the current filter being used to filter the locations
 * 
 * @param filteredBySearchCriteria
 * 		Whether or not search criteria are being used (if not "None" is displayed)
 * @param filteredByState
 * 		Whether or not to display the input state
 * @param selectedState
 * 		The state to display if filteredByState is true
 */
function displayFilterString(filteredBySearchCriteria, filteredByState, selectedState) {
    if (filteredBySearchCriteria) {
        var address = urlParamAddress;
        var city = urlParamCity;
        var state = urlParamState;
        var zip = urlParamZip;

        //create a filter string
        var filterString = "\"";

        if (address && address != "null") {
            filterString = filterString + address + " ";
        }
        if (city && city != "null") {
            filterString = filterString + city;
        }

        if ((city && city != "null") && (state && state != "null")) {
            filterString = filterString + ", ";
        }

        if (state && state != "null") {
            filterString = filterString + state;
        }

        if (((city && city != "null") && (zip && zip != "null")) || ((state && state != "null") && (zip && zip != "null"))) {
            filterString = filterString + " ";
        }

        if (zip && zip != "null") {
            filterString = filterString + zip;
        }

        filterString = filterString + "\"";

        if ((!address || address == "null") && (!city || city == "null") && (!state || state == "null") && (!zip || zip == "null")) {
            $('.tmpl-currentFilter').text("None");
        } else {
            $('.tmpl-currentFilter').text(filterString);
        }
    }

    if (!filteredBySearchCriteria) {
        if (filteredByState) {
            $('.tmpl-currentFilter').text("\"" + selectedState + "\"");
        } else {
            $('.tmpl-currentFilter').text("\"None\"");
        }
    }

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

    $.each(aoData, function (key, pair) {
        if (pair.name === "iDisplayLength") {
            //$top = iDisplayLength
            aoData.push({ "name": "$top", "value": pair.value });
        }
        if (pair.name === "iDisplayStart") {
            //$skip = iDisplayStart
            aoData.push({ "name": "$skip", "value": pair.value });
        }
        if (pair.name === "iSortCol_0") {
            if (pair.value === 0) {
                sortCol = "id";
            }
            if (pair.value === 1) {
                sortCol = "branchNum";
            }
            if (pair.value === 2) {
                sortCol = "branchName";
            }
            if (pair.value === 3) {
                sortCol = "address";
            }
            if (pair.value === 4) {
                sortCol = "county";
            }
            if (pair.value === 5) {
                sortCol = "city";
            }
            if (pair.value === 6) {
                sortCol = "state";
            }
            if (pair.value === 7) {
                sortCol = "zip";
            }
            if (pair.value === 8) {
                sortCol = "servTypeCd";
            }
            if (pair.value === 9) {
                sortCol = "establishedDate";
            }
            if (pair.value === 10) {
                sortCol = "acquiredDate";
            }
        }
        if (pair.name === "sSortDir_0") {
            sortDir = pair.value;
        }
        //A second sort column only happens on initialization, default sort
        if (pair.name === "iSortCol_1") {
            defaultSort = "state asc,city asc";
        }

    });

    //$orderby = iSortCol_0 sSortDir_0
    if (sortCol && sortDir) {
        if (defaultSort) {
            aoData.push({ "name": "$orderby", "value": defaultSort });
        } else {
            aoData.push({ "name": "$orderby", "value": sortCol + " " + sortDir });
        }
    }

    return aoData;
}

/**
 * Loads data and performs post-processing after the locations ajax call completes
 * @param data
 * 		The data returned from the server
 */
function locationsCallback(data) {

    numResults = +data.d.__count;

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
 * Makes an ajax call to get data for the identifications tab on the details page
 */
function loadIdentificationDataTable() {
    //For identifications tab
    var odataURL = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Institution?$callback=identificationsCallback&$format=json&$filter=certNumber eq " + urlParamBank;
    $.ajax({
        dataType: "jsonp",
        url: odataURL,
        jsonpCallback: "identificationsCallback",
        success: identificationsCallback,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            showThrottledError({},
            genErrMsg,
            supressErrorMessageTime)
        },
        timeout: ajaxTimeout
    });
}

function loadfinancialsDataTable() {
    //For identifications tab
    var odataURL = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/Institution?$callback=financialsCallback&$format=json&$filter=certNumber eq " + urlParamBank;
    $.ajax({
        dataType: "jsonp",
        url: odataURL,
        jsonpCallback: "financialsCallback",
        success: financialsCallback,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            showThrottledError({},
            genErrMsg,
            supressErrorMessageTime)
        },
        timeout: ajaxTimeout
    });
}

/**
 * Processes data for identifications tab on the details page
 * 
 * @param data
 * 		The bank details loaded by the AJAX call
 */
function identificationsCallback(data) {
    var d = data["d"]["results"];

    // multiple returned data fix
    if ($.isArray(d)) d = d[0];

    $.each(d, function (key, value) {
        //add value to html element - don't use all columns, because overview and detail header will get overridden
        if (key == 'highRegulatoryHolder' ||
				key == 'docketNumber' ||
				key == 'ncuaID' ||
				key == 'charterNumber' ||
				key == 'fedReserveID' ||
				key == 'certNumber' ||
				key == 'uniNum') {
            if (value) {
                value = value.split(".")[0];
                if (value === '0') {
                    value = "Not available or not applicable";
                }
            } else {
                value = "Not available or not applicable";
            }
            $('.tmpl-' + key).text(value);
        }
    });
    identificationsTableLoaded = true;
}

/**
 * Processes data for financials tab on the details page
 * 
 * @param data
 * 		The bank details loaded by the AJAX call
 */

function financialsCallback(data) {
    var d = data["d"]["results"];

    // multiple returned data fix
    if ($.isArray(d)) d = d[0];

    $.each(d, function (key, value) {

        if (key == 'totalAssets' ||
				key == 'totalDeposits') {
            if (!value || value == 0) {
                noFinancials = true;
            }
        }
        //format dollar values
        if (key == 'totalAssets' ||
				key == 'totalDeposits' ||
				key == 'domesticDeposits' ||
				key == 'bankEquityCapital' ||
				key == 'netIncome' ||
				key == 'quarterlyNetIncome') {
            if (value && value != '0') {
                value = formatAmountInDollars(value, false);
            }
            else {
                value = "Not available or not applicable";
            }
            //replace value in template
            $('.tmpl-' + key).text(value);
        }

        //format percent values
        if (key == 'returnOnAssets' ||
				key == 'quarterlyReturnOnAssets' ||
				key == 'preTaxReturnOnAssets' ||
				key == 'quarterlyPreTaxReturnOnAssets' ||
				key == 'returnOnEquity' ||
				key == 'quarterlyReturnOnEquity') {
            if (value && value != '0') {
                value = formatPercentage(value);
            }
            else {
                value = "Not available or not applicable";
            }
            //replace value in template
            $('.tmpl-' + key).text(value);
        }

        if (key == 'reportDate') {
            if (value) {
                value = parseUTC(value, 'MM d, yy', false);
            }
            else {
                value = "Not available or not applicable";
            }
            //replace value in template
            $('.tmpl-' + key).text('as of ' + value);
        }
    });

    if (noFinancials) {
        $('#noFinancialsDetails').show();
        $('#exportDetailsButton').hide();
        $('#printDetailsButton').hide();
    } else {
        $('#bankFinancialsDetailedInfo').show();
        //Show appropriate rows on financial tab for inactive/active bank
        if (bankStatus == 'Inactive') {
            $('.activeBankFinancialDetails').hide();
        }
        $('#exportDetailsButton').show();
        $('#printDetailsButton').show();
    }

    financialsTableLoaded = true;
}


/**
 * Loads the data for the view by state view of branch locations for the bank
 */
function loadViewByStateDataTable() {

    //create object to hold state name and count
    function StateCount(name, count) {
        this.name = name;
        this.count = count;
    }

    var officesByStateData = [];
    var officesByOtherData = [];

    //get the counts
    var sUrl = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT + "/rest/resource/brnchCntBySt/" + urlParamBank + "/?jsoncallback=?";

    $.ajax({
        url: sUrl,
        dataType: 'json',
        data: '',
        success: function (dataSet) {

            //create the count objects and store them in the appropriate array depending on whether they are a state or other region
            var name = "";
            var count = 0;
            $.each(dataSet, function (i, data) {
                $.each(data, function (key, value) {
                    //alert(key + ":" + value);

                    if (key == 'stName') {
                        name = value;
                    }

                    if (key == 'countBySt') {
                        count = value;
                    }

                });
                if (name && count) {
                    var stCount = new StateCount(name, count);
                    if (name != 'American Samoa' &&
                            name != 'Federated States Of Micronesia' &&
                            name != 'Guam' &&
                            name != 'Marshall Islands' &&
                            name != 'Northern Mariana Islands' &&
                            name != 'Palau' &&
                            name != 'Puerto Rico' &&
                            name != 'Virgin Islands Of The U.S.') {
                        officesByStateData.push(stCount);
                    } else {
                        officesByOtherData.push(stCount);
                    }
                    name = "";
                    count = 0;
                }
            });
        },
        complete: function (xhr, status) { saveStateData(officesByStateData, officesByOtherData); }
    });
}

/**
 * Saves data after the state ajax call completes into global variables for use by the details tab
 * @param officesByStateData
 * @param officesByOtherData
 */
function saveStateData(officesByStateData, officesByOtherData) {
    officesByState = officesByStateData;
    officesByOther = officesByOtherData;
    //Populate any elements that need the number of states that have office (Active bank detail page) - this was previously loaded by loadViewByStateDataTable
    $('.tmpl-stateOffCnt').text(officesByState.length);
}


/**
 * Creates a data table for the view by state view of branch locations for the bank
 * 
 * @param officesByState
 * 		The array of offices for states
 * @param officesByOther
 * 		The array of offices for other areas
 */
function createViewByStateDataTable() {

    //compare function for Array.sort
    function compare(a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    }

    //sort lists
    officesByState.sort(compare);
    officesByOther.sort(compare);

    //determine number of state columns
    var stateColumns = Math.ceil(officesByState.length / 10);

    var table = "<div class=\"byState-wrapper\">";
    table = table + "<table class=\"nameCountColumn table table-responsive table-striped table-bordered\">";
    table = table + "<th style=\"padding:15px 5px 15px 80px;\">States</th><th style=\"text-align:center; padding-top:15px; padding-bottom:15px;\">No. of Entries</th><tbody>";
    //create html for state columns
    for (var x = 0; x < stateColumns; x++) {

        for (var y = x * 10; y < (x + 1) * 10 && y < officesByState.length; y++) {

            table = table + "<tr><td>" + officesByState[y].name + "</td><td><a href=\"#\" tabindex=\"24\" onclick=\"setFilteredLocationDataTableByState('" + officesByState[y].name + "')\" class=\"count\">" + officesByState[y].count + "</a></td></tr>";
        }
    }

    //create html for other columns if there are any
    if (officesByOther.length > 0) {

        table = table + "<th style=\padding:15px 5px 15px 80px;\">Territories</th>";
        for (var x = 0; x < officesByOther.length; x++) {

            table = table + "<tr><td>" + officesByOther[x].name + "</td><td><a href=\"#\" tabindex=\"24\" onclick=\"setFilteredLocationDataTableByState('" + officesByOther[x].name + "')\" class=\"count\">" + officesByOther[x].count + "</a></td></tr>";
        }

    }

    var foreignOfficeCount = $('#foreignOfficeCount').text();
    if (+foreignOfficeCount > 0) {

        table = table + "<th style=\"padding:15px 5px 15px 80px;\">Other Countries</th>";
        table = table + "<tr><td>Foreign Offices</td><td><a href=\"#\" tabindex=\"24\" onclick=\"setFilteredLocationDataTableByState(" + null + ")\" class=\"count\">" + foreignOfficeCount + "</a></td></tr>";

    }

    table = table + "</tbody></table></div>";

    $("#byState").html(table);
}


/**
 * Filters the location data table by a state
 * 
 * @param stateName
 * 		The state to filter on
 */
function setFilteredLocationDataTableByState(stateName) {
    var selectedState = "";
    if (stateName) {
        var stateTermsArray = getStateTermsArray();
        for (var x = 0; x < stateTermsArray.length; x++) {
            var stateTerms = stateTermsArray[x];
            for (var y = 0; y < stateTerms.length; y++) {
                var stateTerm = stateTerms[y].toLowerCase();
                if (stateName.toLowerCase() == stateTerm) {
                    selectedState = stateTerms[1];
                    break;
                }
            }
        }
    } else {
        stateName = "Foreign Countries";
        selectedState = "Foreign Countries";
    }

    //turn byStateLink link on and hide byState
    $("#byStateLink").addClass('linkOn').removeClass('linkOff');
    $("#byState").hide();

    //show results
    $("#results").show();

    gSelectedState = selectedState;
    loadTabDetails("locations", "searchResultsLink", selectedState);
}

/**
 * Loads details for detail header and overview tab (which is on by default)
 * 
 * @param data
 * 		The bank details loaded by the AJAX call
 */
function detailsCallback(data) {

    var d = data["d"]["results"];

    //If there are no details for the bank
    if (d.length == 0) {
        $('#bankDetails').remove();
        $('#noBankDetails').show();
        $('.tmpl-name').text(urlParamName);
        $('.tmpl-certNumber').text(urlParamBank);
        $("#contentLoadingDiv").remove();
    } else {
        $("#noBankDetails").remove();


        // multiple returned data fix
        if ($.isArray(d)) d = d[0];

        //Fix for banks with a 410 event type of NS
        if (d.instClassCode == 'NS') {
            d.changeDesc = 'NoLongerFDICIns';
        }

        if (d.changeDesc == null || d.changeDesc == 'Renamed') {
            d.status = 'Active';
        } else {
            d.status = 'Inactive';
        }
        //save status in global
        bankStatus = d.status;

        //Always display the name that was clicked on in search results
        var clickedName = urlParamName;
        d.name = clickedName;

        //Fix for active banks displaying as Renamed
        if (d.name == d.legalName && d.changeDesc == 'Renamed') {
            d.changeDesc = null;
        }

        //Fix for renamed banks displaying as Active
        if (d.name != d.legalName && d.changeDesc == null) {
            d.changeDesc = 'Renamed';
        }

        //Turn locations off for inactive or renamed banks
        if (d.status == 'Inactive' || d.changeDesc == 'Renamed') {
            $('.showLocations').hide();
            $('.showLocations').remove();
            $('.showNoLocations').show();
        }

        //save data for history tab
        uniNum = d.uniNum;
        ultCertCity = d.ultCertCity;
        ultCertName = $.trim(d.ultCertNum);
        ultCertNum = d.ultCertNum;
        ultCertState = d.ultCertState;

        var numOfficesCount = 0;

        $.each(d, function (key, value) {
            // fix naming inconsistencies
            //key = key == 'insuredFrmDt' ? 'insuredDate' : key;
            key = key == 'insuredToDt' ? 'insuredEndDate' : key;
            key = key == 'inActiveAsofDt' ? 'inactiveDate' : key;

            // if prevLegalName is blank use legalName?
            //d.prevLegalName = $.trim(d.prevLegalName).length == 0 ? d.legalName : d.prevLegalName;

            //Parse date from DB
            if (key.indexOf('Date') > 1) {
                var subtractOneDay = false;
                if (key == 'asOfDate') {
                    subtractOneDay = true;
                }
                value = parseUTC(value, 'MM d, yy', subtractOneDay);
            }

            //For holding company
            if (key == 'holdingCompany') {
                //If it has no value put N/A
                if (!value || d.status != 'Active' || d.changeDesc == 'Renamed') {
                    value = 'N/A';
                }
            }

            //Add word County to county value
            if (key == 'county') {
                value = value + ' County';
            }

            if (key == 'forOffCnt' || key == 'domOffCnt' || key == 'othAreaOffCnt' || key == 'stateOffCnt' || key == 'officeCount') {
                //strip the decimal portion off of these counts
                if (value) {
                    value = value.split(".")[0];
                    //For office count
                    if (key == 'officeCount') {
                        numOfficesCount = value;
                    }
                }

            }

            //replace FACode with the web address of the represented regulator
            if (key == 'FACode') {
                if (value == 'FDIC') {
                    value = LEGACY_APP_HOST_PREFIX + "/starsmail/index.asp";
                } else if (value == 'FED') {
                    value = "http://www.FederalReserveConsumerHelp.gov";
                } else if (value == 'OCC') {
                    value = "http://www.helpwithmybank.gov";
                }
            }

            //add value to html element		
            $('.tmpl-' + key).text(value);
        });

        //Add num offices to html element
        //For inactive
        if (numOfficesCount == 0 || d.status != 'Active' || d.changeDesc == 'Renamed') {
            $('.tmpl-officeCountLocations').text('N/A');
            //Otherwise it has location, add the text locations at the end of the number
        } else {
            $('.tmpl-officeCountLocations').text(numOfficesCount + " Locations");
        }


        //remove uneeded elements based on whether bank is active or inactive.  
        //If inactive, remove elements based on why it is inactive (Note: all uneeded divs are being removed instead of hidden so that they don't show up in a screenreader )

        //List of elements by class or id: .activeBank, .renamedBank, .uninsuredBank, .mergedBankwga, .mergedBankwOga, .closedBankwga, .closedBankwOga, .changeCert
        //                                 #insuredSince, #charterClass, #address, #regulatedBy, #website

        //Case: Active
        if (d.status == 'Active') {
            //use insured since text
            $('.js-inactiveAsOfSince').text("Insured Since ");
            //remove inactive date so only insured since date shows
            $('#inactiveDate').remove();
            //use active graphic
            $('#graphImage').attr("src", "./images/graph.png");
            if (d.changeDesc == 'Renamed') {
                //Case: Name Changed - use .renamedBank
                $('.activeBank, .uninsuredBank, .mergedBankwga, .mergedBankwOga, .closedBankwga, .closedBankwOga, .changeCert, #bankHoldingCompany, #certNumber, #establishedDate, #address, #contactSingle, #insuredSince, #charterClass, #regulatedBy, #regulatorInfo, #website').remove();
                //Change listed status to Active
                $('.tmpl-status').text("Active");
            } else {
                //Case: Active non-renamed bank - use .activeBank
                $('.renamedBank, .uninsuredBank, .mergedBankwga, .mergedBankwOga, .closedBankwga, .closedBankwOga, .changeCert, #contactDouble').remove();
            }
            //Case: Inactive
        } else {
            //use inactive graphics
            $('#graphImage').attr("src", "./images/inactiveGraph.png");
            //use inactive colors
            $('.active-status').addClass('inactive-status').removeClass('active-status');
            //use inactive as of text
            $('.js-inactiveAsOfSince').text("Inactive as of ");
            //remove insured date so only inactive as of date shows
            $('#insuredDate').remove();

            if (d.changeDesc == 'NoLongerFDICIns') {
                //Case: No longer FDIC insured - use .uninsuredBank
                $('.activeBank, .renamedBank, .mergedBankwga, .mergedBankwOga, .closedBankwga, .closedBankwOga, .changeCert, #lastFinancials, #contactDouble, #insuredSince, #charterClass, #address, #regulatedBy, #regulatorInfo, #website').remove();
            } else if (d.changeDesc == 'MerAcqWGovtAssist') {
                //Case: Merger Acquisition - use .mergedBankwga
                $('.activeBank, .renamedBank, .uninsuredBank, .mergedBankwOga, .closedBankwga, .closedBankwOga, .changeCert, #contactSingle, #regulatedBy, #regulatorInfo, #website').remove();
            } else if (d.changeDesc == 'MerAcqWOGovtAssist') {
                //Case: Merger Acquisition - use .mergedBankwOga
                $('.activeBank, .renamedBank, .uninsuredBank, .mergedBankwga, .closedBankwga, .closedBankwOga, .changeCert, #contactSingle, #regulatedBy, #regulatorInfo, #website').remove();
            } else if (d.changeDesc == 'ClosedWGovtAssist') {
                //Case: Merger Acquisition - use .closedBankwga
                $('.activeBank, .renamedBank, .uninsuredBank, .mergedBankwga, .mergedBankwOga, .closedBankwOga, .changeCert, #contactDouble, #regulatedBy, #regulatorInfo, #website').remove();
            } else if (d.changeDesc == 'ClosedWOGovtAssist') {
                //Case: Merger Acquisition - use .closedBankwOga
                $('.activeBank, .renamedBank, .uninsuredBank, .mergedBankwga, .mergedBankwOga, .closedBankwga, .changeCert, #contactDouble, #regulatedBy, #regulatorInfo, #website').remove();
            } else if (d.changeDesc == 'CertChanged') {
                //Case: Cert Changed - use .changeCert
                $('.activeBank, .renamedBank, .uninsuredBank, .mergedBankwga, .mergedBankwOga, .closedBankwga, .closedBankwOga, #lastFinancials, #contactDouble, #insuredSince, #charterClass, #address, #regulatedBy, #regulatorInfo, #website').remove();
                if (!historyTableLoaded) {
                    var historyTablePromise = createHistoryDataTable();
                }
                certChangedEvent = true;

                //Not sure about status, so remove from header and change graphic and isntitution color to black
                $("#status").remove();
                $("#statusBullet").remove();
                $("#date").remove();

                //var source = $("#graphImage").attr("src");
                //source = source.replace("inactiveGraph", "unknownGraph");
                //$("#graphImage").attr("src", source);

                //$("#graph .inactive").removeClass("inactive");
            } else {
                //Case: Undefined - no info - remove all
                $('.activeBank, .renamedBank, .uninsuredBank, .mergedBankwga, .mergedBankwOga, .closedBankwga, .closedBankwOga, .changeCert, #contactDouble,  #contactSingle,  #insuredSince,  #charterClass, #address, #charterClass, #address, #regulatedBy, #regulatorInfo, #website').remove();
            }

        }

        //Handle awarning NOTE for US branches of foreign offices.  This is hard-coded for Bank of China and State Bank of India
        //Removing uneeded bank from DOM
        if (d.certNumber === '33652' || d.certNumber === '33653') {
            //if bank of china, remove bank of India from DOM
            $('.foreignUSBranchBankOfIndia').remove();
        } else if (d.certNumber === '33682' || d.certNumber === '33664') {
            //if bank of India, remove bank of China from DOM
            $('.foreignUSBranchBankOfChina').remove();
        } else {
            //if neither, remove both
            $('.foreignUSBranchBankOfIndia').remove();
            $('.foreignUSBranchBankOfChina').remove();
        }

        //Show any remaining detail divs that weren't removed during processing
        $('.cs-hide').removeClass('cs-hide');

        //Replaces span element with the name of the bank to check for financial details
        $('.js-lastFinancialsNameOrLegalName').text(function () {
            if (d.changeDesc == 'Renamed') {
                return d.legalName;
            } else {
                return d.name;
            }
        });

        //Replaces span element with anchor to retrieve financials by cert
        $('.js-lastFinancialsLinkFinancialsTab').replaceWith(function () {
            var text = "Financial Report";
            var url = LEGACY_APP_HOST_PREFIX + "/idasp/confirmation_outside.asp?inCert1=" + d.certNumber;
            return '<a tabIndex="134" href="' + url + '">' + text + '</a>';
        });

        //Replaces span element with anchor element
        $('.js-toRegulatorSiteLink').replaceWith(function () {
            var url = $.trim($(this).text());

            if (url && url != "null") {
                //check to see if the website is in the fdic.gov domain (or Dev/QA - whatever is in bankFindProperties as the prefix for the legacy app)
                var isFdicDomain = url.indexOf(LEGACY_APP_HOST_PREFIX) >= 0 ? true : false;

                //if fdic domain use normal link, otherwise format and go to leaving site warning page
                if (isFdicDomain) {
                    return '<a id="consumerAssistanceWebsite" tabIndex="134" href="' + url + '">' + url + '</a>';
                } else {
                    //If url exists and doesn't have http:// add it
                    if (url.length > 0 && url.indexOf("http") != 0) {
                        url = "http://" + url;
                    }

                    //go to leaving site warning page
                    return '<a id="consumerAssistanceWebsite" tabindex="134"  href="./leavingBankFind.html?website=' + url + '">' + url + '</a>';
                }
            } else {
                return "<span class=\"value\">Web site not available</span>";
            }
        });

        //Replaces span element with anchor element and formats for website
        $('.js-toSiteLink').replaceWith(function () {
            var url = $.trim($(this).text());

            if (url && url != "null") {
                //If url exists and doesn't have http:// add it
                if (url.length > 0 && url.indexOf("http") != 0) {
                    url = "http://" + url;
                }

                return '<a tabIndex="132" href="./leavingBankFind.html?website=' + url + '">' + url + '</a>';
            } else {
                return "<span class=\"value\">Web site not available</span>";
            }
        });

        //Replaces span element with anchor to retrieve bank details by acquired Cert - displays span element text as link text
        $('.js-toBankDetailLinkByAcqCert').replaceWith(function () {
            var text = $.trim($(this).text());
            var url = "./detail.html?bank=" + d.acqCert + "&name=" + encodeURLParameter(d.acqName) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            return '<a tabIndex="132" href="' + url + '">' + text + '</a>';
        });

        //Replaces span element with anchor to retrieve bank details by acquired Cert - displays span element text as link text
        $('.js-toBankDetailLinkByAcqCertWithFdicNum').replaceWith(function () {
            var text = $.trim($(this).text());
            var url = "./detail.html?bank=" + d.acqCert + "&name=" + (encodeURLParameter($.trim(d.acqName))) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            return '<a tabIndex="132" href="' + url + '">' + text + ' (FDIC #' + d.acqCert + ')</a>.';
        });

        //Replaces span element with anchor to retrieve bank details by ultimate Cert - displays span element text as link text
        $('.js-toBankDetailLinkByUltCert').replaceWith(function () {
            var text = $.trim($(this).text());
            var url = "./detail.html?bank=" + d.ultCertNum + "&name=" + encodeURLParameter($.trim(d.ultCertName)) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            return '<a tabIndex="132" href="' + url + '">' + text + '</a>';
        });

        //Replaces span element with anchor to retrieve bank details by Cert - displays span element text as link text
        $('.js-toCurrentBankDetailLinkByCert').replaceWith(function () {
            var text = $.trim($(this).text());
            var url = "./detail.html?bank=" + d.certNumber + "&name=" + encodeURLParameter(d.legalName) + "&searchName=" + encodeURLParameter(urlParamSearchName) + "&searchFdic=" + urlParamSearchFdic + "&city=" + encodeURLParameter(urlParamCity) + "&state=" + urlParamState + "&zip=" + urlParamZip + "&address=" + encodeURLParameter(urlParamAddress) + "&tabId=2";
            return '<a tabIndex="132" href="' + url + '">' + text + '</a>';
        });

        var cityName = urlParamCity;
        cityName = cityName != 'null' ? cityName : "";
        var stateCode = urlParamState;
        stateCode = stateCode != 'null' ? stateCode : "";

        //Replaces span element with anchor to  DIRS Info Request by Cert - displays span element text as link text
        $('.js-toRequestBankDetailLinkByCert').replaceWith(function () {
            var text = $.trim($(this).text());
            var url = LEGACY_APP_HOST_PREFIX + '/idasp/DIRSInfoRequest.asp?INST_CERT_NUM=' + d.certNumber + '&INST_NME=' + d.name + "&RQST_CITY_NME=" + cityName + "&INST_STATE_CDE=" + stateCode;
            return '<a tabIndex="132" href="' + url + '">' + text + '</a>';
        });

        //Replaces span element with anchor to  DIRS Info Request by legal name or acquired name - displays span element text as link text
        $('.js-toRequestBankDetailLinkByAcqCertOrLegalName').replaceWith(function () {
            var certNum = "";
            var name = "";
            if (d.changeDesc == 'MerAcqWGovtAssist' || d.changeDesc == 'MerAcqWOGovtAssist' || d.changeDesc == 'CertChanged') {
                certNum = d.acqCert;
                name = d.acqName || d.ultCertName;
            } if (d.changeDesc == 'Renamed') {
                certNum = d.certNumber;
                name = d.legalName;
            }
            var url = LEGACY_APP_HOST_PREFIX + "/idasp/DIRSInfoRequest.asp?INST_CERT_NUM=" + certNum + '&INST_NME=' + name + "&RQST_CITY_NME=" + cityName + "&INST_STATE_CDE=" + stateCode;
            return '<a tabIndex="132" href="' + url + '">' + name + '</a>';
        });

        /**
         * Display the appropriate tab, as determined by the tabId param
         */
        displayTab();

        $.when(historyTablePromise).then(function () {
            $("#contentLoadingDiv").remove();
            $("#bankDetails").show();
        });
    }
}

/**
 * Builds the locations search filter string for the ajax request
 * 
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
function buildLocationsSearchFilter(certNumber, address, city, state, zip) {
    var str = "";

    str = str + "certNumber eq " + certNumber + "";

    if (address) {
        var encodedAddress = address;
        encodedAddress = encodedAddress.replace(/&/g, "%26");
        encodedAddress = encodedAddress.replace(/'/g, "%27%27");
        encodedAddress = encodedAddress.replace(/#/g, "%23");
        str = str + " and substringof('" + encodedAddress.toUpperCase() + "',address)";
    }

    if (city) {
        var encodedCity = city;
        encodedCity = encodedCity.replace(/&/g, "%26");
        encodedCity = encodedCity.replace(/'/g, "%27%27");
        encodedCity = encodedCity.replace(/#/g, "%23");
        str = str + " and substringof('" + encodedCity.toUpperCase() + "',city)";
    }

    if (state) {
        if (state === "Foreign Countries") {
            str = str + " and state eq NULL";
        } else {
            str = str + " and state eq '" + state.toUpperCase() + "'";
        }
    }

    if (zip) {
        str = str + " and startswith(zip," + zip + ")";
    }

    return str;
}

/**
 * Looks up the service type code name
 * @param code
 * 		The service type code
 * @returns
 * 		The name associated with the code
 */
function lookupServiceTypeCode(code) {
    code = code.replace("11", "Full Service Brick and Mortar Office");
    code = code.replace("12", "Full Service Retail Office");
    code = code.replace("13", "Full Service Cyber Office");
    code = code.replace("14", "Full Service Mobile Office");
    code = code.replace("15", "Full Service Home/Phone Banking");
    code = code.replace("16", "Full Service Seasonal Office");
    code = code.replace("21", "Limited Service Administrative Office");
    code = code.replace("22", "Limited Service Military Facility");
    code = code.replace("23", "Limited Service Facility Office");
    code = code.replace("24", "Limited Service Loan Production Office");
    code = code.replace("25", "Limited Service Consumer Credit Office");
    code = code.replace("26", "Limited Service Contractual Office");
    code = code.replace("27", "Limited Service Messenger Office");
    code = code.replace("28", "Limited Service Retail Office");
    code = code.replace("29", "Limited Service Mobile Office");
    code = code.replace("30", "Limited Service Trust Office");
    code = code.replace("99", "Limited Service - Other");
    return code;
}

/**
 * DataTable API extension that allows all filters to be reset
 * @param oSettings
 * 		The datatables settings
 * @param bDraw
 * 		true to redraw table
 */
jQuery.fn.dataTableExt.oApi.fnFilterClear = function (oSettings) {
    var i, iLen;     /* Remove global filter */
    oSettings.oPreviousSearch.sSearch = "";
    /* Remove the text of the global filter in the input boxes */    if (typeof oSettings.aanFeatures.f != 'undefined') {
        var n = oSettings.aanFeatures.f;
        for (i = 0, iLen = n.length ; i < iLen ; i++) {
            $('input', n[i]).val('');
        }
    }     /* Remove the search text for the column filters - NOTE - if you have input boxes for these     * filters, these will need to be reset     */
    for (i = 0, iLen = oSettings.aoPreSearchCols.length ; i < iLen ; i++) {
        oSettings.aoPreSearchCols[i].sSearch = ""
    }     /* Redraw */
    oSettings.oApi._fnReDraw(oSettings);
};





