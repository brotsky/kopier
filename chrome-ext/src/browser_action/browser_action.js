$ = jQuery;


var kopierList = [];

var kopierUser = [];

var kopierToken = false;

function utf8_to_b64( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

function updateKopier() {
    chrome.storage.local.set({'kopierData': JSON.stringify(kopierList) }, function() {
        //after data is stored
                
    });
}

function removeFromKopierList(key) {
    var temp = [];
    for(var i = 0 ; i < kopierList.length ; i++) {
        if(kopierList[i].key != key)
            temp.push(kopierList[i]);
    }
    
    kopierList = temp;
    
    updateKopier();
    
    renderTemplate();
}

function checkUser() {
    chrome.storage.local.get(['kopierUser'], function (result) {    
        if(typeof result.kopierUser != "undefined") {
            kopierUser = JSON.parse(result.kopierUser);                
        } else {
            kopierUser = [];
        }
        chrome.storage.local.get(['kopierToken'], function (result) {    
            
            console.log(result);
            
            if(typeof result.kopierToken != "undefined") {
            
                kopierToken = result.kopierToken;
                    
            } else {
                kopierToken = false;
            }
            
            var userTemplate = $('#userTemplate').html();
            Mustache.parse(userTemplate);   // optional, speeds up future uses
            var rendered = Mustache.render(userTemplate, {kopierUser: kopierUser, kopierToken : kopierToken});
            $('#userTarget').html(rendered);
            
            
        });
                
    });
    

}

function renderTemplate() {
        
  var template = $('#template').html();
  Mustache.parse(template);   // optional, speeds up future uses
  var rendered = Mustache.render(template, {kopiers: kopierList.reverse()});
  $('#target').html(rendered);
 
 

  
  
    new Clipboard('button.copyText', {
        text: function(trigger) {
            return b64_to_utf8(trigger.getAttribute('data-kopy-content'));
        }
    });
  
    $('button.copyHTML').click(function(){
        
        $("html-kopier").html(b64_to_utf8($(this).attr('data-kopy-content')));
        
        var htmlKopier = document.getElementsByTagName("html-kopier")[0];
        var range = document.createRange();
                
        var selection = window.getSelection();
            selection.removeAllRanges();
        
        range.selectNodeContents(htmlKopier);
        selection.addRange(range);
        
         document.execCommand("copy");
         
         htmlKopier.innerHTML = "";
        
    });
    
    $("button.delete").click(function(){
        removeFromKopierList(parseInt( $(this).attr("data-kopy-key") ));
    });
  
}

chrome.storage.local.get(['kopierData'], function (result) {    
    if(typeof result.kopierData != "undefined") {
        kopierList = JSON.parse(result.kopierData);
                
        for(var i = 0 ; i < kopierList.length ; i++) {
            kopierList[i].textRaw = b64_to_utf8(kopierList[i].text);
            kopierList[i].selectionHTMLRaw = b64_to_utf8(kopierList[i].selectionHTML);
            kopierList[i].key = kopierList.length - i - 1;
        }
        
        checkUser();
        
        renderTemplate();        
    }
    
});


chrome.extension.onRequest.addListener(function(request, sender, callback) {
    
    //we could use request to store user info
    
    if (request.action == "getKopied") {
        
        
        alert("getKopier action");
        
     //   console.log(selectedContentJSON());
        
     //   callback(selectedContentJSON());
    }
});

$("html").on("submit","#login form",function(e){
    e.preventDefault();
    
    $.ajax({
        url : "http://localhost:8000/kopier/api/login-api.php",
        method : "POST",
        data : $(this).serialize(),
        success : function(data){
            
            if(typeof data.error == "undefined") {
                $("#wrongpassword").addClass("hide");    
                                   
                for(var i = 0 ; i < kopierList.length ; i++) {   
                                        
                    var snippet = {
                        html : kopierList[i].selectionHTML,
                        text : kopierList[i].text,
                        images : kopierList[i].images,
                        copied_from : kopierList[i].copied_from
                    }
                
                    $.ajax({
                        url : "http://localhost:8000/kopier/api/snippet-api.php",
                        headers : {
                            "Authorization" : "Bearer " + kopierToken
                            },
                        method : "POST",
                        data : snippet,
                        success : function(data) {
                            console.log(data);
                        }
                    });
                }
                   
                chrome.storage.local.set({'kopierUser': JSON.stringify(data.user) }, function() {
                    
                    chrome.storage.local.set({'kopierToken': data.token }, function() {                        
                        checkUser();
                    });
                                    
                });
                setTimeout(function(){
                    $.ajax({
                        url : "http://localhost:8000/kopier/api/snippet-api.php",
                        headers : {
                            "Authorization" : "Bearer " + kopierToken
                            },
                        method : "GET",
                        success : function(data) {
                            console.log(data);
                            
                            kopierList = data;
                            
                            for(var i = 0 ; i < kopierList.length ; i++) {
                                kopierList[i].textRaw = b64_to_utf8(kopierList[i].text);
                                kopierList[i].selectionHTMLRaw = b64_to_utf8(kopierList[i].selectionHTML);
                                kopierList[i].key = kopierList.length - i - 1;
                            }
                            
                            updateKopier();
                            renderTemplate();
                        }
                    });
                },500);
                
            
            } else {
                $("#wrongpassword").removeClass("hide");
            }
            
        }
    })
    
});

$("html").on("click","#logout",function(e){
    e.preventDefault();
    chrome.storage.local.set({'kopierUser': false }, function() {
                
        chrome.storage.local.set({'kopierToken': false }, function() {
            
            
            kopierList = [];
            chrome.storage.local.set({'kopierData': JSON.stringify(kopierList) }, function() {
                //after data is stored
                
                checkUser();
                renderTemplate();
                
            });
            
            
        });
                                
    });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(typeof changes.kopierData != "undefined")
        kopierList = JSON.parse( changes.kopierData.newValue);        
});
