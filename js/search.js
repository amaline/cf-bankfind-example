/*
 * $Workfile: search.js$
 * $Id: search.js,v 1.7, 2014-01-31 22:50:08Z, Goltermann_Jason D.$
 * $Author: Goltermann_Jason D.$
 * Created $Date: 1/31/2014 5:50:08 PM EST$
 * $Revision: 8$
 *
 * Copyright 2012 by Federal Deposit Insurance Corporation
 */

$(document).ready(function() {
	
		/**
		 * Search - Clears the search criteria
		 */
		$('#clearButton').click(function() {
			$('#bankname').val("");
			$('#city').val("");
			$('#address').val("");
			$('#fdicNumber').val("");
			$('#zipcode').val("");
			$('#state').val("");
			//enable all fields
			$('#fdicNumber').removeAttr('disabled');
			$('#bankname').removeAttr('disabled');
			$('#address').removeAttr('disabled');
			$('#state').removeAttr('disabled');
			$('#city').removeAttr('disabled');
			$('#zipcode').removeAttr('disabled');
		});
		
		/**
		 * Search - Disables other fields if FDIC Cert # is used
		 */
		$('#fdicNumber').blur( function() {
			if($(this).val()) {
				toggleSearchFields(false);
			} else {
				toggleSearchFields(true);
			}
		});
				
		
		/**
		 * Search - Bank name search auto complete functionality
		 */ 
		if ( $('.js-bankname').length ) {
			$(".js-bankname").autocomplete( {
			    source: function (req, add) {
			        var nameList = createFuzzyList(req.term);
			        var suggestions = [];
			        for (var x = 0; x < nameList.length; x++) {
			            searchTerm = nameList[x].replace(/\^/g, "%20");



			            $.ajax({
			                url: APP_SERVER_HOST_PREFIX + CONTEXT_ROOT +
                                "/rest/resource/BankNames/" + encodeURLParameter(searchTerm) +
                                "?jsoncallback=?",
			                dataType: 'json',
			                success: function (data) {
			                    if (!$.isArray(data)) {
			                        data = [data];
			                    }

			                    $.each(data, function (i, val) {
			                        suggestions.push(val);
			                    });

			                    add(suggestions);
			                    },
			                error: function (XMLHttpRequest, textStatus, errorThrown) {
			                    showThrottledError({},
                                genErrMsg,
                                supressErrorMessageTime)
			                },
			                timeout: ajaxTimeout

			            });
			        }
				}
				, delay : 0
				, minLength : 3
			} );
		}
		
		/**
		 * Search - City search auto complete functionality
		 */ 
		if ( $('.js-cityname').length ) {
			$(".js-cityname").autocomplete( {
			    source: function (req, add) {


			        $.ajax({
			            url: APP_SERVER_HOST_PREFIX + CONTEXT_ROOT +
                            "/rest/resource/Cities/" + req.term +
                            "?jsoncallback=?",
			            dataType: 'json',
			            success: function (data) {
			                var suggestions = [],
                            d = data;

			                if (!$.isArray(d)) d = [d];

			                $.each(d, function (i, val) {
			                    suggestions.push(val);
			                });

			                add(suggestions);
			            },
			            error: function (XMLHttpRequest, textStatus, errorThrown) {
			                showThrottledError({},
                            genErrMsg,
                            supressErrorMessageTime)
			            },
			            timeout: ajaxTimeout

			        });

				}
				, delay : 0
				, minLength : 3
			} );
		}
});

/**
 * This method will disable or enable all fields except FDIC number based on the value of a toggle. True for disable other seach fields, false for enable
 * @param toggle
 * 		Whether to enable or disable search fields besides FDIC number
 */
function toggleSearchFields(toggle) {
	if(toggle) {
		//enable fields
		$('#bankname').removeAttr('disabled');
		$('#address').removeAttr('disabled');
		$('#state').removeAttr('disabled');
		$('#city').removeAttr('disabled');
		$('#zipcode').removeAttr('disabled');
	} else {
		//disable fields
		$('#bankname').attr('disabled', 'disabled');
		$('#address').attr('disabled', 'disabled');
		$('#state').attr('disabled', 'disabled');
		$('#city').attr('disabled', 'disabled');
		$('#zipcode').attr('disabled', 'disabled');
	}
}
/**
 * Creates additional search strings based on whether the search term can be written in more than one way.  
 * For instance, if the search string was '1st Bank', the terms returned are: '1st Bank' and 'First Bank'
 * 
 * @param searchString
 * 		The original search string
 * @returns {Array}
 * 		An array with search terms created from the original search term
 */
function createFuzzyList(searchString) {
	//normalize search string
	searchString = $.trim(searchString);
	searchString = searchString.toLowerCase();
	//quotes not-supported
	searchString = searchString.replace(/"/g,"");
	//hashtag not-supported
	searchString = searchString.replace(/#/g,"");
	
	var allWayTermsArray =  getAllWayTermsArray();
	var oneWayTermsArray = getOneWayTermsArray();
	
	var searchTerms = [];
	//Check one way terms for matches
	for(var x = 0; x < oneWayTermsArray.length; x++) {
		var oneWayTerms = oneWayTermsArray[x];
		for(var y = 0; y < oneWayTerms.length - 1; y++) {
			var oneWayTerm = oneWayTerms[y];
			//remove carets from term for comparison
			oneWayTerm = oneWayTerm.replace(/^\^|\^$/g,"");
			oneWayTerm = oneWayTerm.replace(/\^/g," ");
			var searchRegex = new RegExp("(^|\\s)"+oneWayTerm+"(?=$|\\s)");
			var matches = searchString.match(searchRegex);
			if(matches) {
				searchString = searchString.replace(searchRegex, function(match, p1) {
					if(p1 == " ") {
						return " #"+searchTerms.length+"#";
					} else {
						return "#"+searchTerms.length+"#";
					}
				});
				searchTerms.push($.trim(oneWayTerms[oneWayTerms.length - 1]));	
				break;
			}
		}
	}
	
	
	//Check the allWayTermsArray for matches
	for(var x = 0; x < allWayTermsArray.length; x++) {
		var allWayTerms = allWayTermsArray[x];
		for(var y = 0; y < allWayTerms.length; y++) {
			var allWayTerm = allWayTerms[y];
			//remove carets from term for comparison
			allWayTerm = allWayTerm.replace(/^\^|\^$/g,"");
			allWayTerm = allWayTerm.replace(/\^/g," ");
			//If the term has dots, escape the dot for use in regex
			allWayTerm = allWayTerm.replace(/\./g,"\\.");
			var searchRegex = new RegExp("(^|\\s)"+allWayTerm+"(?=$|\\s)");
			var matches = searchString.match(searchRegex);
			if(matches) {
				searchString = searchString.replace(searchRegex, function(match, p1) {
					if(p1 == " ") {
						return " #"+searchTerms.length+"#";
					} else {
						return "#"+searchTerms.length+"#";
					}
				});
				searchTerms.push($.trim(matches[0]));
				break;
			}
		}
	}
	
	var masterTermList = searchString.split(' ');
	for(var i = 0; i < masterTermList.length; i++) {
		var replaceIndex = masterTermList[i].match(/#(\d)#/);
		if(replaceIndex) {
			masterTermList[i] = searchTerms[replaceIndex[1]];
		}
	}
	
	var searchList = [];
	
	//For each search Term (i.e. if search term was 'Community FSB' then this will loop twice)
	for(var z = 0; z < masterTermList.length; z++) {
		
		var term = masterTermList[z];
		var termList = [];
		
		//Check the allWayTermsArray for matches
		for(var x = 0; x < allWayTermsArray.length; x++) {
			var allWayTerms = allWayTermsArray[x];
			for(var y = 0; y < allWayTerms.length; y++) {
				var allWayTerm = allWayTerms[y];
				//remove carets from term for comparison
				allWayTerm = allWayTerm.replace(/^\^|\^$/g,"");
				allWayTerm = allWayTerm.replace(/\^/g," ");
				if(term == allWayTerm) {
					//If there is a match, push the entire array where that match was found into termList
					for(var y = 0; y < allWayTerms.length; y++) {
						termList.push(allWayTerms[y]);
					}
					break;
				}
			}
		}
		
		for(var x = 0; x < oneWayTermsArray.length; x++) {
			var oneWayTerms = oneWayTermsArray[x];
			for(var y = 0; y < oneWayTerms.length; y++) {
				var oneWayTerm = oneWayTerms[y];
				//remove carets from term for comparison
				oneWayTerm = oneWayTerm.replace(/^\^|\^$/g,"");
				oneWayTerm = oneWayTerm.replace(/\^/g," ");
				if(term == oneWayTerm) {
					//If there is a match, push only the last term of the array where that match was found into termList
					termList.push(oneWayTerms[oneWayTerms.length - 1]);
					break;
				}
			}
		}
	
		//The searchList will be empty the first time through
		var searchListLength = searchList.length;
		if(searchListLength == 0) {
			//If the first term had matches push them all
			if(termList.length > 0) {
				for(var x = 0; x < termList.length; x++) {
					searchList.push(termList[x]);
				}
			//otherwise just push the term
			} else {
				searchList.push(term);
			}
		//Otherwise, concatenate the existing terms with the new terms and push them into the list
		} else {
			var extendedSearchList = [];
			for(var x  = 0 ; x < searchListLength; x++) {
				//Once the termList is created for the search term, loop through it and append the extra terms onto the existing search terms
				if(termList.length > 0) {
					for(var y = 0; y < termList.length; y++) {
						extendedSearchList.push(searchList[x] + " " + termList[y]);
					}
				//No matches found, just push the term into the searchList
				} else {
					extendedSearchList[x] = searchList[x] + " " + term;
				}
			}
			searchList = extendedSearchList;
		}
	}
	return searchList;
}

/**
 * Creates an array of fuzzy search terms.
 * AllWayTerms are terms that are used in each direction, meaning that if the user search for '1st' they should use all the matching terms: '1st' and 'First'
 * @returns {Array}
 * 		an array of fuzzy search terms
 */
function getAllWayTermsArray() {
var allWayTermsArray = [
["^assoc^",	"assoc.",							"association"],
["s&l",		"^s^&^l^",		"^s^and^l^",		"savings^and^loan"],
["natl",	"natl.",							"national"],
["^grp^",	"grp.",								"group"],
["^inc^",	"inc.",								"incorporated"],
["^intl^",	"intl.",							"international"],
["^ltd^",	"ltd.",								"limited"],
["^co^",	"co.",								"company"],
["^corp^", 	"corp.",							"corporation"],
["^fsb^",	"f.s.b.",	"^f^s^b^",	"f.^s.^b.","federal^savings^bank"],
["^ssb^",	"s.s.b.",	"^s^s^b^",	"^s.^s.^b.^","state^savings^bank"],
["^sb^",	"s.b.",		"^s^b^",	"^s.^b.^",	"savings^bank"],
["^sa^",	"s.a.",		"^s^a^",	"^s.^a.^",	"savings^association"],
["^se^",	"s.e.",		"^s^e^",	"^s.^e.^", 	"southeast"],
["^sw^",	"s.w.",		"^s^w^",	"^s.^w.^",	"southwest"],
["^us^",	"u.s.",		"^u^s^",	"^u.^s.^", 	"united^states"],
["^s^",		"s.",								"south"],
["^fsa^",										"federal^savings^association"],
["^fa^",	"f.a.",		"^f^a^",	"^f.^a.^",	"federal^association"],
["^na^",	"n.a.",		"^n^a^",	"^n.^a.^",	"national^association"],
["^ne^",	"n.e.",		"^n^e^",	"^n.^e.^",	"northeast"],
["^nw^",	"n.w.",		"^n^w^",	"^n.^w.^",	"northwest"],
["^n^",		"n.",								"north"],
["^e^",		"e.",								"east"],
["^w^",		"w.",								"west"],
["&",											"and"],
["1st",											"first"],
["2nd",											"second"],
["3rd",											"third"],
["4th",											"fourth"],
["5th",											"fifth"],
["^mt^",	"mt.",								"mount"],
["^st^",	"st.",								"saint"],
["^st^",	"st.",								"street"],
["^st^",	"st.",								"state"],
["svgs",										"savings"],
["bb&t", "branch^banking^and^trust"],
["mandt", "m&t", "m & t", "m and t", "manufacturers^and^traders"]
];
return allWayTermsArray;
}

/**
 * Creates an array of fuzzy search terms.
 * OneWayTerms are terms that are used one direction, meaning that if the user search for 'Amex' they should not search on Amex, only on "Aerican Express"
 * @returns {Array}
 * 		an array of fuzzy search terms
 */
function getOneWayTermsArray() {
var oneWayTermsArray = [
["amex", 								"american^express"],
["bb and t",							"branch^banking^and^trust"],
["bnk",		"bk",						"bank"],
["bofa",	"b of a",					"bank^of^america"],
["e-trade",								"e*trade"],
["ibc",									"international^bank^of^commerce"],
["jpm",									"jpmorgan"],
["jpmc",								"jpmorgan^chase"]
];
return oneWayTermsArray;
}