var enabled = false,
    otherKeyPressed = false,
    amIActive = false,
    keys = [],
    keyDownTimes = [],
    keyUpTimes = [],
    elements = [],
    cushionTime = 20,
    mouseX = 0,
    mouseY = 0;

$(function() {
    getEnabled();
    heyIHaveTheMouse();
});

$(document).mouseleave(function() {
    heyILostTheMouse();
});
$(document).mouseenter(function() {
    heyIHaveTheMouse();
});

//reset the keys on window blur to avoid losing a keyUp when switching windows
$(window).blur(function() {
    heyILostTheMouse();
    elements = [];
    if (keys) {
        resetAllKeys();
    }
});
$(window).focus(function() {
   // heyIHaveTheMouse();
});

$(document).keydown(function(e) {
    keyDownTimes[e.keyCode] = new Date().getTime();
    if (e.keyCode != 16 && e.keyCode != 17 && e.keyCode != 18) {
        otherKeyPressed = true;
        return;
    }
    var diff = keyDownTimes[e.keyCode] - keyUpTimes[e.keyCode];
    if (diff <= cushionTime && diff > 0) {
        keys[e.keyCode] = false;
    } else {
        keys[e.keyCode] = true;
    }
})
    .keyup(function(e) {
        keyUpTimes[e.keyCode] = new Date().getTime();
        if (otherKeyPressed) {
            //wait for all keys to be let up before resetting otherkeypressed
            keys[e.keyCode] = false;
            if (!isAnyKeyPressed()) {
                otherKeyPressed = false;
            }
            keys[e.keyCode] = false;
            return;
        } else if (keys[16] && keys[17]) {
            console.log("ctrl+shift");
            if (enabled) {
                messageBackground("doSingleSelect");
            }
        } else if (keys[18] && keys[17]) {
            //console.log("ctrl+alt");
            if (enabled) {
                messageBackground("doRangeSelect");
            }
        }
        keys[e.keyCode] = false;
    })
    .mousemove(function(e) {
       heyIHaveTheMouse();
        mouseX = e.clientX;
        mouseY = e.clientY;
       // console.log(mouseX + " "+ mouseY);
        //console.log(amIActive);
    });

function selectTextTwoElements(startElement, endElement) {
    var doc = document,
        range, selection;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.setStart(startElement, 0);
        range.setEnd(endElement, 1);
        if (range.startOffset === 1) {
            range.setStart(endElement, 0);
            range.setEnd(startElement, 1);
        }
        range.select();
        copyToClipboard(range.toString());
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.setStart(startElement, 0);
        range.setEnd(endElement, 1);
        if (range.startOffset === 1) {
            range.setStart(endElement, 0);
            range.setEnd(startElement, 1);
        }
        selection.removeAllRanges();
        selection.addRange(range);
        copyToClipboard(selection.toString());
    }
}

function selectTextSingleElement(startElement) {
    var doc = document,
        range, selection;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(startElement);
        range.select();
        console.log(range);
        copyToClipboard(range.toString());
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(startElement);
        selection.removeAllRanges();
        selection.addRange(range);
        console.log(selection.toString());
        copyToClipboard(selection.toString());
    }
}

function getEnabled() {
    chrome.runtime.sendMessage({
        greeting: "getEnabled"
    }, function(response) {
        enabled = response.result;
    });
}

//listen for updates from background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting) {
        if (request.greeting === 'updateEnabled') {
            enabled = request.result;
        } else if (request.greeting === "doSelectSingle") {
            //console.log("I was told to do single select");

            selectTextSingleElement(document.elementFromPoint(mouseX, mouseY));
        } else if (request.greeting === "doSelectRange") {
            //console.log("I was told to do range select");

            if (elements.length === 2)
                elements = [];
            elements.push(document.elementFromPoint(mouseX, mouseY));
            if (elements.length === 1)
                selectTextSingleElement(elements[0]);
            if (elements.length === 2)
                selectTextTwoElements(elements[0], elements[1]);
        }
    }
    return true;
});

function isAnyKeyPressed() {
    for (var i = 0; i < keys.length; i++)
        if (keys[i])
            return true;
    return false;
}

function resetAllKeys() {
    for (var i = 0; i < keys.length; i++)
        keys[i] = false;
}

function heyIHaveTheMouse() {
    //if (!amIActive) {
        //console.log("I have the mouse");
        amIActive = true;
        messageBackground("imActiveTab");
    //}
}

function heyILostTheMouse() {
    //console.log("I lost the mouse");

    amIActive = false;
}

function copyToClipboard(selectedText) {
    try {
        //document.execCommand('copy');
        //copy(getSelection().toString())
        /*if(document.execCommand('copy')){
            console.log('copied');
        }
        else{
            console.log('not copied :(');
        }*/
        navigator.clipboard.writeText(selectedText)
          .then(() => {
            console.log('Text Copied');
          });
    } catch (err) {
        console.log('Unable to copy');
    }
}

function messageBackground(msg) {
    chrome.runtime.sendMessage({
        greeting: msg
    }, function(response) {});

}