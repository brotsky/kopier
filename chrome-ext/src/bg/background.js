var kopierList = [];

function utf8_to_b64( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

chrome.storage.local.get(['kopierData'], function (result) {    
    if(typeof result.kopierData != "undefined") {
    
        kopierList = JSON.parse(result.kopierData);
            
    } else {
        chrome.storage.local.set({'kopierData': JSON.stringify(kopierList) }, function() {
        //after data is stored
        
        });
    }
    
});

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });


var mainPopup = document.getElementById("mainPopup");


    
function saveChanges(source) {
    // Get a value saved in a form.
    var theValue = source;
    // Check that there's some code there.
    if (!theValue) {
  //    message('Error: No value specified');
      return;
    }
     
    if(kopierList.length > 10)
        kopierList.shift();
        
    kopierList.push(source);
        
    var data = JSON.stringify(kopierList);
            
    // Save it using the Chrome extension storage API.
    chrome.storage.local.set({'kopierData': JSON.stringify(kopierList) }, function() {
        //after data is stored
                
        
    });
  }


function kopySelectedContent(info)
{
    
    
    try {
        chrome.tabs.getSelected(null, function (tab) {
                        
            chrome.tabs.sendRequest(tab.id, {action: "getKopied",custom:"brotsky"}, function(source) {
                                
                if(typeof source != "undefined")
                    saveChanges(JSON.parse(source));
                                                                
            });
        });
    }
    catch (ex) {
        console.log(ex);
    }
    
        
    
 var searchstring = info.selectionText;
 
 
}

chrome.contextMenus.create({title: "Kopy (⌘ + K)", contexts:["all"], onclick: kopySelectedContent});
