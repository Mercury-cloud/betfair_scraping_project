//////   communication   ////////////

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ?
              "from a content script:" + sender.tab.url :
              "from the extension"); 
  console.log('request__xapp----', request.xApp);
  if(request.url != undefined ) {
    if(request.type === 'graph'){
      console.log("request in detail-----", request);
      Http = new XMLHttpRequest();  
      Http.open("GET", request.url);
      Http.setRequestHeader('X-Application', request.xApp);
      Http.setRequestHeader('X-Authentication', request.xAuth);
      Http.send();
      Http.onreadystatechange = function() {
        if(Http.readyState === XMLHttpRequest.DONE) {
          var status = Http.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            // The request has been completed successfully
            console.log('received graph data on background:', Http.responseText);
            sendResponse(Http.responseText);
          } else {
            // Oh no! There has been an error with the request!
          }
        }          
      }
    }
    else if(request.type === 'chart') {
      Http = new XMLHttpRequest();  
      Http.open("GET", request.url);
      Http.setRequestHeader("Accept", "application/json, text/plain, */*");
      Http.setRequestHeader('X-Application', request.xApp);
      Http.send();
      Http.onreadystatechange = function() {
        if(Http.readyState === XMLHttpRequest.DONE) {
          var status = Http.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            // The request has been completed successfully
            console.log('received chart data on background:', Http.responseText);
            sendResponse(Http.responseText);
          } else {
            // Oh no! There has been an error with the request!
          }
        }          
      }
    }
    else if(request.type === 'table'){
      $.ajax({
          url: request.url,
          type: "GET",
          dataType: "json"
        }).done(function(res) {
          console.log('received table data on background: ', res);
          sendResponse(res);
        });
    }
  }
  else{
  	chrome.tabs.query({url: request.destination}, function(tabs) {
  		destination_id = tabs[0].id;	
  		console.log('destination_id', destination_id);
  		chrome.tabs.sendMessage(destination_id, request, function(response) {});
  	});      

  }
  return true;

});	


// ////////////////////////////////////////

chrome.runtime.onInstalled.addListener(function() {
  
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        // pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});



