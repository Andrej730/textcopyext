$(function() {
    var talkToBack = function(text) {
        chrome.runtime.sendMessage({
            greeting: text
        }, function(response) {
            updateFront(response.result);
            var enabled = response.result;
            document.getElementById("spanButtonChange").innerHTML = enabled ? "Off" : "On";
    document.getElementById("spanStatus").className = enabled ? "label label-success" : "label label-warning";
    document.getElementById("spanStatus").innerHTML = enabled ? "On" : "Off";
        });
    }
    talkToBack("getEnabled");
    $('#switchEnable').on('click', function(e) {
        talkToBack("changeEnabled");
    });
});

function updateFront(enabled) {
    
}