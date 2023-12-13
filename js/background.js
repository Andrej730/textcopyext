var enabled = true,
    tabToCopy = 0,
    myTabs = [];

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting === "changeEnabled") {
            enabled = !enabled;
            sendDetails(enabled);
            sendResponse({
                result: enabled
            });
        } else if (request.greeting === "getEnabled") {
            sendResponse({
                result: enabled
            });
        } else if (request.greeting === "imActiveTab") {
            //console.log("new tab to select " + sender.tab.id);
          tabToCopy = sender.tab.id;
        } else if (request.greeting === "doSingleSelect") {
            //console.log("telling tab " + tabToCopy +  " to do single select");

            chrome.tabs.sendMessage(tabToCopy, {
                greeting: 'doSelectSingle'
            }, function(response) {});
        } else if (request.greeting === "doRangeSelect") {
            //console.log("telling tab " + tabToCopy +  " to do range select");

            chrome.tabs.sendMessage(tabToCopy, {
                greeting: 'doSelectRange'
            }, function(response) {});
        }
return true;
    });

function sendDetails(sendData) {
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, {
                greeting: 'updateEnabled',
                result: enabled
            }, function(response) {});
        }
    });
}