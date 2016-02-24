/**********************************************************************************
 Page Name:	   navBar.js
 Author:	   FDIC BDS Team
 Description:  The javaScript functions and variables for the global navigation menu
 Revisions:	
 *********************************************************************************
*/

var RootPath = ""; //default
var CurrentMenuItem; //current selected menu item in a dropwdown menu
var bankDataGuideUrl = "https://fdic.gov/bank/statistical/guide/"
var currMenuLink; //Url link for the current selected menu item in a dropwdown menu
var MyPathName = window.location.pathname.toLowerCase();
var MyHome = APP_SERVER_HOST_PREFIX + CONTEXT_ROOT;
var SEAFHome = SEAF_APP_HOST_PREFIX;

var NavBarItemArray = [
    "", //index 0 base, don't remove
    "FDIC gov",
    "Banks",
    "Reports & Analysis",
    "Reference Tables",
    "Data Download",
    "BankFind"
];

//Banks dropdown menu (index: 1)
var BanksDdlArray = [
     ["BankFind",  //title
      "<ul><li> Learn if your bank is insured. </li> \
             <li> View locations.</li> \
             <li> Review a bank's  history.</li> \
             <li> Get summary information. </li></ul>", //description 
      "/index.html" //url
     ],

     ["Institution Directory (ID)", //title  (Details and Financials)
      "<span> Use more criteria to: </span> \
         <ul><li> Find FDIC Insured Banks and their locations. </li> \
             <li> Get comprehensive financial or demographic reports. </li> \
             <li> Get current and historical data. </li> \
             <li> Find groups of banks. </li> \
             <li> Find a bank holding company (BHC). </li></ul>",  //description
             //description
      "/idasp/advSearchLanding.asp" //url
     ],

     ["Summary of Deposits (SOD)",  //title (Branch Office & Deposits)
      "<ul> <li> Results of the annual survey of branch office deposits <br/> \
                   as of June 30th  for all FDIC-insured institutions. </li> \
              <li> Data is available by institution and/or geographic area <br/> \
                   in reports or data downloads. </li> </ul>", //description
      "/sod/sodInstBranch.asp?barItem=1" //url
     ],

     ["Securities Exchange Act Filings",  //title
      "<span> This system contains two groups of securities disclosure filings: <span> \
         <ul><li> Beneficial ownership report filings on Forms 3, 4, and 5 <br/> \
                  by directors, officers, and principal shareholders of <br/> \
                  depository institutions. </li> \
             <li> Other securities disclosure documents filed by or pertaining <br/> \
                  to FDIC-supervised depository institutions with a class of <br/> \
                  securities registered under the Exchange Act. </li> </ul>", //description
      SEAFHome + "/fcxweb/efr/index.html"//url
     ]]; //Banks

//Reports Analysis dropdown menu (index: 2)
var ReportsAnalysisDdlArray = [
     ["Summary of Deposits (SOD)",  //title (Deposit Market Share Report)
      "<span> Based on the annual survey of branch office deposits as of <br/> </span> \
         <span> June 30th, market share reports are available by geographic <br/> </span> \
         <span> area (Deposit Market Share Report, Pro Forma HHI) or by <br/> </span>  \
         <span> institution (Market Presence, Growth Rates). </span>", //description
      "/sod/sodMarketBank.asp?barItem=2" //url
     ],

     ["Statistics on Depository Institutions (SDI)",  //title (Comparison Reports)
      "<ul><li> Financial data from  1992 to present. </li>  \
             <li> Compare up to four columns. </li>  \
             <li> Create custom peers, reports, and downloads. </li>  \
             <li> Predefined industry reports. </li> </ul>", //description
      "/sdi/main.asp?formname=compare" //url
     ],

     ["Statistics on Depository Institutions (SDI)",  //title (Predefined Standard Industry Reports)
      "<ul> <li> Detailed aggregate financial information for common <br/> \
		         standard peer groups. </li>  \
	        <li> Based on legacy Statistics on Banking (SOB) reports. </li> </ul>", //description
      "/sdi/main.asp?formname=standard" //url
     ],

     ["Historical Statistics on Banking (HSOB)",  //title (Bank Failures)
      "<span> A complete look historically of bank failures and assistance <br/> </span> \
         <span> transactions of all FDIC-insured institutions back to 1934. </span> ", //description
      "/hsob/SelectRpt.asp?EntryTyp=30&Header=1" //url
     ],

     ["Reports of Structure Changes (ROC)",  //title
      "<span> Searchable database for structure transactions <br/> </span> \
         <span> (e.g., new institution, mergers, closings) for institutions <br/> </span> \
         <span> or offices for a specific date, date range, or quarter date <br/> </span> \
         <span> based on either the processed date or effective date. </span>", //description
      "/roc/index.asp" //url
     ]
]; //Reports Analysis

//Reference Tables dropdown menu (index: 3)
var ReferenceTablesDdlArray = [
    ["Summary of Deposits (SOD)",  //title (Deposit Summary Tables)
     "<ul><li> Standardized tables provide aggregate results <br/> \
               of the annual survey of branch office deposits <br/> \
               (SOD) as of June 30th. </li> \
	      <li> National, regional, state and county data are  <br/> \
               available for data back to 1994. </li> </ul>", //description
     "/sod/sodSummary.asp?barItem=3" //url
    ],

    ["Historical Statistics on Banking (HSOB)", //title (Annual Financial Data)
     "<span> Annual summary of financial and structural data <br/> </span> \
      <span> back to 1934 for all FDIC-insured institutions. <br/> </span> \
      <span> These data can be used to identify and analyze <br/> </span> \
      <span> long-term trends and to develop benchmarks to </span>  \
      <span> evaluate the current condition of the banking <br/> </span>  \
      <span> and thrift industries. </span>  \
      <ul><li> Commercial bank data back to 1934. </li> \
          <li> Savings institution data back to 1984. </li></ul>", //description
     "/hsob/SelectRpt.asp?EntryTyp=10&Header=1" //url
    ]
]; //Reference Table

//Data Download dropdown menu (index: 4)
var DataDownloadDdlArray = [
     ["Statistics on Depository Institutions (SDI)",  //title (All Predefined Financial Data)
       "<ul><li> Quarterly financial data for all FDIC-Insured institutions. </li> \
              <li> Predefined downloadable ZIP files contains all SDI Reports <br/>  \
                   and report items. </li> \
	          <li> Each ZIP file contains data for one reporting quarter. </li> </ul>", //description
      "/sdi/download_large_list_outside.asp" //url
     ],

     ["Statistics on Depository Institutions (SDI)",  //title (Custom Financial Data)
       "<ul><li> Quarterly financial data for all FDIC-Insured institutions. </li> \
              <li> Select report items from any SDI Report. </li> \
              <li> Select one or many FDIC Insured Institutions. </li> \
	          <li> Select time periods 1992 to present. </li> </ul>", //description
      "/sdi/main.asp?formname=customddownload" //url
     ],

     ["Institution Directory (ID)",  //title (Institutions & Locations)
      "<span> Predefined datasets for all FDIC-insured institutions (Updated weekly): </span> \
         <ul><li>Current list of all institutions.</li> \
             <li>Current locations for all institutions (branches and main offices). </li></ul>", //description
      "/idasp/advSearch_warp_download_all.asp?intTab=1" //url
     ],

     ["Predefined datasets for all FDIC-insured institutions. ",  //title (Financial Data)
       "<ul><li> Each of the downloadable ZIP files contains all financial items available \
                 for all FDIC insured institutions. </li> \
        <li> Each ZIP file contains data for one reporting quarter. </li>", //description
       "/idasp/advSearch_warp_download_all.asp?intTab=2" //url
     ],

     ["Quarterly Banking Profile (QBP)Time Series Spreadsheets",  //title (Aggregate Time Series Data)
      "<span> Aggregate data for all FDIC-insured institutions for each quarter <br/> </span> \
       <span> back to 1984 in downloadable Excel spreadsheet files. </span>", //description
      "/idasp/advSearch_warp_download_all.asp?intTab=4" //url
     ],

     ["Branch Office Deposits",  //title (State Data on Branch Office and Deposits)
      "<ul><li>  Annual Summary of Deposits survey of branch office deposits as of June 30. Data is available back to 1994.</li> <br/> </ul>", //description
     ["/idasp/advSearch_warp_download_all.asp?intTab=3", "/sod/dynaDownload.asp?barItem=6"]]//url

]; //Data Download

//global help dropdown menu (index: 5)
var HelpArray = [
     ["Bank Data Guide",  //title
       "", //description
      "https://www.fdic.gov/bank/statistical/guide/BankDataGuide.pdf" //url
     ],
     ["Questions",  //title
       "", //description
      "/idasp/DIRSInfoRequest.asp" //url
     ],

     ["Tutorials",  //title
       "", //description
      "/sdi/main.asp?formname=tutorial" //url
     ],
     ["BankFind Glossary",  //title
       "", //description
      "/glossary.html" //url
     ],

     ["Details and Financials - ID",  //title 
      "", //description
      ["/idasp/advInfoPage.asp?formname=sitemap"
       , "/idasp/loadWhatsNew.asp"
       , "/idasp/advInfoPage.asp?formname=disclaimer"
       , "/idasp/definitions.asp?SystemForm=ID&HelpItem=BestViewed"]//url
     ],

     ["Summary Of Deposits",  //title 
       "", //description
       ["/sod/sodHelp.asp?barItem=8"
       , "/sod/sodDataAvailability.asp"
       , "https://www.fdic.gov/news/news/financial/2015/fil15024.html"
       , "/sod/pdf/SOD_Instructions.pdf"
       , "/sod/sod_frm_inst.asp"
       , "https://www5.fdicconnect.gov"] //url
     ],

     ["Statistics on Depository Institutions",  //title
      "", //description
      ["/sdi/main.asp?formname=glossary"
      , "/sdi/homehelp.asp?SystemForm=ID&HelpItem=FAQ"
      , "/sdi/loadWhatsNew.asp"
      , "/sdi/main.asp?formname=disclaimer"
      , "/sdi/main.asp?formname=viewing"] //url
     ],

     ["Reports of Structure Changes",  //title
      "", //description
      ["/roc/bimonth.asp"
      , "/roc/data_availibility.asp"] //url
     ],

     ["Historical Statistics on Banking",  //title
      "", //description
      ["/hsob/Help.asp?EntryTyp=60&Header=1"
      , "/hsob/data_availability.asp"
      , "/hsob/Helpindex.asp"] //url
     ]
]; //Data Download

/************************** functions **************************/

//Intial setup
function InitSetup() {

    UpdateTargetUrls(); //Check and update server name in the Urls

    if (!IsMobile()) {
        UpdateBreadCrumb("");
    }

} //InitSetup

//Loop thru all menu items and update the host name in its url
function UpdateTargetUrls() {
    $(".navContainer li >a").each(function () {
        var url = $(this).attr('href');

        //Dynamically update url 
        if (url !== undefined && url != "" && url.indexOf("http") < 0) {
            $(this).attr("href", MyHome + url);
        }
    });
}

//Update breadcrumb by the given parent menu item and the selected child menu item
function UpdateBreadCrumbText(topMenuItem, curMenuItem, lastNode) {
    if (IsMobile()) return;

    if (topMenuItem !== undefined && topMenuItem != "") {
        $('#hmenu').text(topMenuItem);
    }

    if (curMenuItem !== undefined && curMenuItem != "") {
        $('#hcurritem').text(curMenuItem);

        var urlStr;
        var prevLink = document.referrer.trim();
        //alert("prev link= " + prevLink);
        if (prevLink.indexOf("advSearch_warp_download_all") >= 0) {
            urlStr = prevLink.substring(0, prevLink.indexOf("?") + 1);
            if (curMenuItem.indexOf("Institutions") >= 0) {
                currMenuLink = urlStr + "intTab=1";
            } else if (curMenuItem.indexOf("Financial") >= 0) {
                currMenuLink = urlStr + "intTab=2";
            } else if (curMenuItem.indexOf("Branch Office") >= 0) {
                currMenuLink = urlStr + "intTab=3";
            } else if (curMenuItem.indexOf("Aggregate Time") >= 0) {
                currMenuLink = urlStr + "intTab=4";
            }
        }
    }

    if (lastNode !== undefined && lastNode != "") {
        $('#hhead').text(lastNode);
    }

    //Get the hidden values from the page
    var CurrentMenuItem = $('#hmenu').text();
    var CurrentMenuSelection = $('#hcurritem').text();
    var pageTitle = $('#hhead').text();

    //alert("hmenu/hcurritem/hhead= " + CurrentMenuItem + "/" + CurrentMenuSelection + "/" + pageTitle);

    var htmlStr = '<a tabindex="115" href="http://www.fdic.gov/index.html">' + "FDIC.gov" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                  '<a tabindex="116" href="http://www.fdic.gov/bank/" >' + "Industry Analysis" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                  '<a tabindex="117" href="http://www.fdic.gov/bank/statistical/" >' + "Bank Data & Statistics" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                  '<span class="cssBreadCrumbLastNode"> ' + CurrentMenuItem + ' </span>' + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                  '<a tabindex="118" href="' + currMenuLink + '">' + CurrentMenuSelection + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                  '<span class="cssBreadCrumbLastNode"> ' + pageTitle + ' </span>';

    $("#breadCrumbPath").html(htmlStr);

} //UpdateBreadCrumbText()

//Update breadcrumb 
function UpdateBreadCrumb(lastNode) {
    if (IsMobile()) return;
    //Get the hidden values from the page
    var pageTitle = $('#hhead').text();
    var CurrentMenuSelection = $('#hcurritem').text();
    var CurrentMenuItem = $('#hmenu').text();

    if (lastNode != "") {
        pageTitle = lastNode;
    }

    //alert("[UpdateBreadCrumb] pageTitle= " + pageTitle + ", Link=" + document.referrer);

    if (CurrentMenuItem.indexOf('Help') >= 0) {
        UpdateUrlLinks(CurrentMenuSelection, pageTitle);
    } else {
        if (pageTitle.indexOf("Summary of Deposits") >= 0) {
            prevLink = document.referrer; //sodInstBranch2
            //alert('prevLink..' + prevLink);
            if (prevLink.indexOf("sodInstBranch") >= 0) {
                CurrentMenuSelection = "Branch Office Deposits";
                CurrentMenuItem = "Banks";
            } else if (prevLink.indexOf("sodInstBranch2") >= 0) {
                CurrentMenuSelection = "Branch Office Deposits";
                CurrentMenuItem = "Banks";
            }
            else if (prevLink.indexOf("sodSummary") >= 0) { //sodSummary
                CurrentMenuSelection = "Deposit Summary Tables";
                CurrentMenuItem = "Reference Tables";
            } else if (prevLink.indexOf("definitions") >= 0) { //sodSummary
                CurrentMenuSelection = "Deposit Summary Tables";
                CurrentMenuItem = "Reference Tables";
            } else {
                CurrentMenuSelection = "Deposit Market Share Reports";
                CurrentMenuItem = "Reports & Analysis";
            }
        }

        //Update urlLinks
        UpdateUrlLink(CurrentMenuSelection);
    }

    var htmlStr = '';
    if (CurrentMenuItem.indexOf('Help') >= 0) {
        htmlStr = '<a tabindex="119" href="http://www.fdic.gov/index.html">' + "FDIC.gov" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                      '<a tabindex="120" href="http://www.fdic.gov/bank/" >' + "Industry Analysis" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                      '<a tabindex="121" href="http://www.fdic.gov/bank/statistical/" >' + "Bank Data & Statistics" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                      '<span class="cssBreadCrumbLastNode"> ' + CurrentMenuItem + ' </span>' + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                      '<span class="cssBreadCrumbLastNode"> ' + CurrentMenuSelection + '<span class="cssBreadCrumbSeparator "> > </span>' +
                      '<span class="cssBreadCrumbLastNode"> ' + pageTitle + ' </span>';
    } else {
        htmlStr = '<a tabindex="122" href="http://www.fdic.gov/index.html">' + "FDIC.gov" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                     '<a tabindex="123" href="http://www.fdic.gov/bank/" >' + "Industry Analysis" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                     '<a tabindex="124" href="http://www.fdic.gov/bank/statistical/" >' + "Bank Data & Statistics" + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                     '<span class="cssBreadCrumbLastNode"> ' + CurrentMenuItem + ' </span>' + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                     '<a tabindex="125" href="' + currMenuLink + '">' + CurrentMenuSelection + '</a> <span class="cssBreadCrumbSeparator "> > </span>' +
                     '<span class="cssBreadCrumbLastNode"> ' + pageTitle + ' </span>';
    }

    //$("#breadCrumb").append(pageTitle);
    $("#breadCrumbPath").html(htmlStr);

    //highlight the menu selection
    if (CurrentMenuItem.indexOf("Banks") >= 0) {
        $("#Banks").css({ "color": "#ffffff", "background-color": "#374a60" })
    } else if (CurrentMenuItem.indexOf("Reports") >= 0) {
        $("#ReportsAnalysis").css({ "color": "#ffffff", "background-color": "#374a60" })
    } else if (CurrentMenuItem.indexOf("Reference") >= 0) {
        $("#ReferenceTables").css({ "color": "#ffffff", "background-color": "#374a60" })
    } else if (CurrentMenuItem.indexOf("Download") >= 0) {
        $("#DataDownload").css({ "color": "#ffffff", "background-color": "#374a60" })
    } else if (CurrentMenuItem.indexOf("Help") >= 0) {
        $("#GlobalHelp").css({ "color": "#ffffff", "background-color": "#374a60" })
    }
} //UpdateBreadCrumb()

//Update Url Links
function UpdateUrlLink(CurrentMenuSelection) {

    var toAddHost = true;

    //Update urlLink for Banks main Menu Item
    if (CurrentMenuSelection.indexOf("BankFind") >= 0) {
        currMenuLink = MyHome + "/bankfind"; //BanksDdlArray[0][2];
        toAddHost = false;
    } else if (CurrentMenuSelection.indexOf("Details and Financials") >= 0) {
        currMenuLink = BanksDdlArray[1][2];
    } else if (CurrentMenuSelection.indexOf("Branch Office Deposits") >= 0) {
        currMenuLink = BanksDdlArray[2][2];
    } else if (CurrentMenuSelection.indexOf("Securities Exchange Act Filings") >= 0) {
        currMenuLink = BanksDdlArray[3][2];
    }
        //Update urlLink for Reports & Analysis main Menu Item
    else if (CurrentMenuSelection.indexOf("Deposit Market Share Reports") >= 0) {
        currMenuLink = ReportsAnalysisDdlArray[0][2];
    } else if (CurrentMenuSelection.indexOf("Comparison Reports") >= 0) {
        currMenuLink = ReportsAnalysisDdlArray[1][2];
    } else if (CurrentMenuSelection.indexOf("Standard Industry Reports") >= 0) {
        currMenuLink = ReportsAnalysisDdlArray[2][2];
    } else if (CurrentMenuSelection.indexOf("Bank Failures") >= 0) {
        currMenuLink = ReportsAnalysisDdlArray[3][2];
    } else if (CurrentMenuSelection.indexOf("Reports of Structure Changes") >= 0) {
        currMenuLink = ReportsAnalysisDdlArray[4][2];
    }
        //Update urlLink for Reference main Menu Item
    else if (CurrentMenuSelection.indexOf("Deposit Summary Tables") >= 0) {
        currMenuLink = ReferenceTablesDdlArray[0][2];
    } else if (CurrentMenuSelection.indexOf("Annual Financial Data") >= 0) {
        currMenuLink = ReferenceTablesDdlArray[1][2];
    }
        //Update urlLink for Data Download main Menu Item
    else if (CurrentMenuSelection.indexOf("Quarterly Financial Data") >= 0) {
        currMenuLink = DataDownloadDdlArray[0][2];
    } else if (CurrentMenuSelection.indexOf("Custom Financial Data") >= 0) {
        currMenuLink = DataDownloadDdlArray[1][2];
    } else if (CurrentMenuSelection.indexOf("Institutions & Locations") >= 0) {
        currMenuLink = DataDownloadDdlArray[2][2];
    } else if (CurrentMenuSelection.indexOf("Aggregate Time Series Data") >= 0) {
        currMenuLink = DataDownloadDdlArray[3][2];
    } else if (CurrentMenuSelection.indexOf("National Data on Branch Office and Deposits") >= 0) {
        currMenuLink = DataDownloadDdlArray[5][2][0];
    } else if (CurrentMenuSelection.indexOf("State Data on Branch Office and Deposits") >= 0) {
        currMenuLink = DataDownloadDdlArray[5][2][1];
    }//End Data download

    if (toAddHost) currMenuLink = MyHome + currMenuLink;
}

function UpdateUrlLinks(CurrentMenuSelection, pageTitle) {
    var toAddHost = true;

    if (CurrentMenuSelection.toLowerCase().indexOf("details and financials") >= 0) {
        if (pageTitle.indexOf("Glossary") >= 0) {
            currMenuLink = HelpArray[4][2][0];
        }
        else if (pageTitle.indexOf("Data Availability") >= 0) {
            currMenuLink = HelpArray[4][2][1];
        }
        else if (pageTitle.indexOf("Disclaimer and Methodology") >= 0) {
            currMenuLink = HelpArray[4][2][2];
        }
        else if (pageTitle.indexOf("Viewing Tips") >= 0) {
            currMenuLink = HelpArray[4][2][3];
        }
    } else
        if (CurrentMenuSelection.toLowerCase().indexOf("summary of deposits") >= 0) {
            if (pageTitle.indexOf("Help Features") >= 0) {
                currMenuLink = HelpArray[5][2][0];
            }
            else if (pageTitle.indexOf("Data Availability") >= 0) {
                currMenuLink = HelpArray[5][2][1];
            }
            else if (pageTitle.indexOf("Summary Of Deposits Worksheet") >= 0) {
                currMenuLink = HelpArray[5][2][4];
            }
        } else if (CurrentMenuSelection.toLowerCase().indexOf("statistics on depository institutions") >= 0) {
            if (pageTitle.indexOf("Glossary") >= 0) {
                currMenuLink = HelpArray[6][2][0];
            }
            else if (pageTitle.indexOf("Frequently Asked Questions") >= 0) {
                currMenuLink = HelpArray[6][2][1];
            }
            else if (pageTitle.indexOf("Data Availability") >= 0) {
                currMenuLink = HelpArray[6][2][2];
            }
            else if (pageTitle.indexOf("Disclaimer") >= 0) {
                currMenuLink = HelpArray[6][2][3];
            }
        } else if (CurrentMenuSelection.toLowerCase().indexOf("data availability") >= 0) {

            currMenuLink = HelpArray[6][2][2];

        } else if (CurrentMenuSelection.indexOf("Reports of Structure Changes") >= 0) {

            if (pageTitle.indexOf("Glossary") >= 0) {
                currMenuLink = HelpArray[7][2][0];
            }
            else if (pageTitle.indexOf("Data Availability") >= 0) {
                currMenuLink = HelpArray[7][2][1];
            }

        } else if (CurrentMenuSelection.indexOf("Historical Statistics On Banking") >= 0) {

            if (pageTitle.indexOf("Help") >= 0) {
                currMenuLink = HelpArray[8][2][0];
            }
            else if (pageTitle.indexOf("Data Availability") >= 0) {
                currMenuLink = HelpArray[8][2][1];
            }
            else if (pageTitle.indexOf("Index") >= 0) {
                currMenuLink = HelpArray[8][2][1];
            }

        }
        else if (CurrentMenuSelection.indexOf("Questions") >= 0) {
            currMenuLink = HelpArray[1][2];
        } else if (CurrentMenuSelection.indexOf("Tutorials") >= 0) {
            currMenuLink = HelpArray[2][2];
        } else if (CurrentMenuSelection.indexOf("BankFind Glossary") >= 0) {
            currMenuLink = HelpArray[3][2];
        }

    if (toAddHost) currMenuLink = MyHome + currMenuLink;
}


//Update the text in the menu help panel
function UpdateMenuHelpPanel(elem, ddlArray, menuIndex) {
    $("#MenuTitle").text(ddlArray[menuIndex][0]); //titlle
    $("#MenuDesc").html(ddlArray[menuIndex][1]);  //description 	

    //check and set url
    //var url = $(elem).attr('href').trim(); //target url
    //if (url == "" || url == "#") {
    //    $(elem).attr('href', ddlArray[menuIndex][2]); //set target url
    //}


    //PrintMessage("url: " + ddlArray[menuIndex][2]);
    //$(elem).attr('href', ddlArray[menuIndex][2]); //set target url
}

function PrintMessage(msg) {
    $("#log").text(msg);
}

//Display the slide-out panel for the help text
function ShowSlidePanel(elem) {
    var id = elem.attr('id');
    var linkName = elem.text();  //link name
    var targetUrl = elem.attr('href') //target url
    var selectedMenuIndex = 0;

    if (id !== undefined && id != "") {
        parentMenuIndex = Math.floor(parseInt(id) / 100);
        selectedMenuIndex = parseInt(id) % 100 - 1;
    }

    RootPath = NavBarItemArray[parentMenuIndex];
    if (RootPath.indexOf("Help") >= 0) {
        return;
    } else {
        //Get the ul box (parent)
        parentElem = elem.parent().parent(); //The ul box

        //parentElem.css({"border": "1px solid red"}); //test
        var parentHeight = parentElem.innerHeight();
        var parentTop = parentElem.offset().top;
        var panelLeft = parentElem.offset().left + parentElem.width();
        var panelWidth = 420;
        var panelHeight = parentHeight;
        //var cssBoxShadow = "1px 1px 7px 2px rgba(0, 0, 0, 0.067)";

        //Update help text in the hover-over menu of dropdown

        if (RootPath.indexOf("Banks") >= 0) {
            panelHeight = panelHeight + 40;
            UpdateMenuHelpPanel(elem, BanksDdlArray, selectedMenuIndex);
        } else if (RootPath.indexOf("Reports & Analysis") >= 0) {
            panelWidth = panelWidth - 25;
            UpdateMenuHelpPanel(elem, ReportsAnalysisDdlArray, selectedMenuIndex);
        } else if (RootPath.indexOf("Reference Tables") >= 0) {
            panelHeight = panelHeight + 135;
            panelWidth = panelWidth - 90;
            UpdateMenuHelpPanel(elem, ReferenceTablesDdlArray, selectedMenuIndex);
        } else if (RootPath.indexOf("Data Download") >= 0) {
            panelWidth = panelWidth + 40;
            panelLeft = parentElem.offset().left - panelWidth + 3;
            UpdateMenuHelpPanel(elem, DataDownloadDdlArray, selectedMenuIndex);
            $('nav li:nth-child(n+2) li:first-child a').css({ "border-right": "1px solid #4f6b88" });
            $("#SlidePanel").css({ "border-right": "0px solid #d5e6f6" });
        }

        //PrintMessage("panelLeft: " + panelLeft + ", panelWidth: " + panelWidth +
        //             ", parentOffsetX: " + parentElem.offset().left + ", parentWidth: " + parentElem.width());

        //show the menu directly over the placeholder
        //set aria-hidden to false for accessibility

        $("#SlidePanel").attr("aria-hidden", "false");
        $("#SlidePanel").attr("role", "contentinfo");
        $("#SlidePanel").css({
            position: "fixed",
            top: parentTop + "px",
            height: panelHeight + "px",
            width: panelWidth + "px",
            left : panelLeft + "px",
          }).show();
    }

} //ShowSlidePanel()

//Hide the slide-out panel
function HideSlidePanel() {
    //set aria-hidden to true for accessibility
    $("#SlidePanel").attr("aria-hidden", "true");
    $("#SlidePanel").attr("role", "menuitem");
    $("#SlidePanel").hide();
}

//Update css when hovering over the 1st child of the dropdown menu of the 1st menu item (FDIC)
function MouseOverFdicFirstChild() {
    if (!IsMobile()) {
        $('nav li li:first-child a').css({ "color": "#382e0e", "background-color": "#f5e3a7" });
    }
}

//Update css when hovering out the 1st child of the dropdown menu of the 1st menu item (FDIC)
function MouseOutFdicFirstChild() {
    if (!IsMobile()) {
        $('nav li li:first-child a').css({ "color": "#ffffff", "background-color": "#6A571A" });
    }
}

//Update css when hovering over the 1st child of the dropdown menu of the 2nd to last menu items
function MouseOverNonFdicFirstChild() {
    if (!IsMobile()) {
        $('nav li li:first-child a').css({ "color": "#020202", "background-color": "#d5e6f6" });
    }
}

//Update css when hovering out the 1st child of the dropdown menu of the 2nd to last menu items
function MouseOutNonFdicFirstChild() {
    if (!IsMobile()) {
        $('nav li li:first-child a').css({ "color": "#ffffff", "background-color": "#374A60" });
    }
}

//Set the parent node to active when a child menu is selected
function SetParentActive(parentName) {

    ////doesn't work using parent() method

    //remove previous active state
    $('#FDIC').css({ "color": "#ffffff", "background-color": "#ad9442" }); //FDIC
    $('#Banks').css({ "color": "#ffffff", "background-color": "#6182A4" });
    $('#ReportsAnalysis').css({ "color": "#ffffff", "background-color": "#6182A4" });
    $('#ReferenceTables').css({ "color": "#ffffff", "background-color": "#6182A4" });
    $('#DataDownload').css({ "color": "#ffffff", "background-color": "#6182A4" });
    $('#GlobalHelp').css({ "color": "#ffffff", "background-color": "#6182A4" });


    if (parentName.indexOf(NavBarItemArray[1]) >= 0) {
        $('#FDIC').css({ "color": "#ffffff", "background-color": "#856d20" }); //FDIC
    } else if (parentName.indexOf(NavBarItemArray[2]) >= 0) {
        $('#Banks').css({ "color": "#ffffff", "background-color": "#374A60 " });
    } else if (parentName.indexOf(NavBarItemArray[3]) >= 0) {
        $('#ReportsAnalysis').css({ "color": "#ffffff", "background-color": "#374A60 " });
    } else if (parentName.indexOf(NavBarItemArray[4]) >= 0) {
        $('#ReferenceTables').css({ "color": "#ffffff", "background-color": "#374A60 " });
    } else if (parentName.indexOf(NavBarItemArray[5]) >= 0) {
        $('#DataDownload').css({ "color": "#ffffff", "background-color": "#374A60 " });
    } else if (parentName.indexOf(NavBarItemArray[6]) >= 0) {
        $('#GlobalHelp').css({ "color": "#ffffff", "background-color": "#374A60 " });
    }

} //SetParentActive

function IsMobile() {
    if ($(window).width() <= 680) {//TEMP - for small screen device
        return true;
    } else {
        return false;
    }
}