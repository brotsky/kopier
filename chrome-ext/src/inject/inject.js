$ = jQuery;

function utf8_to_b64( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    
    var imgs = $(html).find("img");
    
    var images = [];
    
    for(var i = 0 ; i < imgs.length ; i++) {
        images.push({
            "src" : $(imgs[i]).attr("src"),
            "srcWithBase" : imgs[i].currentSrc
        });
    }
        
    
    var data = {
        html : html,
        images : images
    }
        
    return data;
}

var selectedContentJSON = function() {
    
    var htmlData = getSelectionHtml();
    
    var data = {
        "selectionHTML" : utf8_to_b64(htmlData.html),
        "text" : utf8_to_b64(document.getSelection().toString()),
        "images" : htmlData.images
    }
    
    return JSON.stringify(data);
    
}

chrome.extension.onRequest.addListener(function(request, sender, callback) {
    
    //we could use request to store user info
    
    if (request.action == "getKopied") {
        
        console.log(selectedContentJSON());
        
        callback(selectedContentJSON());
    }
});


 chrome.storage.onChanged.addListener(function(changes, namespace) {
        
        console.log(JSON.parse( changes.kopierData.newValue) );
        return;
        for (key in changes) {
          var storageChange = changes[key];
          
          
          
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
      });


