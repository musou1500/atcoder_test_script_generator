chrome.browserAction.onClicked.addListener(() => 
  chrome.tabs.query({active:true, currentWindow:true}, ([tab]) => 
    chrome.tabs.sendMessage(tab.id, {type: "generate_testcase"})));
