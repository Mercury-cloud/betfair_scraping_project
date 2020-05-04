//////   communication   ////////////

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ?
              "from a content script:" + sender.tab.url :
              "from the extension"); 
  let temp = request;
  // if(request.xApp) {
  //   console.log("request in detail-----", request);
  //   Http = new XMLHttpRequest();  
  //   Http.open("GET", request.url);
  //   Http.setRequestHeader('X-Application', request.xApp);
  //   Http.setRequestHeader('X-Authentication', request.xAuth);
  //   Http.send();
  //   Http.onreadystatechange = function() {
  //     // sendResponse(this.responseText);
  //     temp.data = this.responseText;
  //     // chrome.tabs.sendMessage(destination_id, this.responseText, function(response) {});      
  //   }
  // }
	chrome.tabs.query({url: temp.destination}, function(tabs) {
		destination_id = tabs[0].id;	
		console.log('destination_id', destination_id);
		chrome.tabs.sendMessage(destination_id, temp, function(response) {});
	});      

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



