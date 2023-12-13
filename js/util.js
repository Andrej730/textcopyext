function sendGreetingToBackground(msg) {
	chrome.runtime.sendMessage({
        greeting: msg
    }, function(response) {});

}