var cmdHowToUse;
var divHowToUse;
var txtInputText;
var txtSecretText;
var txtOutputText;
var lblErrorMessage;
var cmdEncodeData;
var cmdDecodeData;

var uFEFF = '\uFEFF'; // u65279
var u200B = '\u200B'; // u8203
var u200C = '\u200C'; // u8204
var u200D = '\u200D'; // u8205

var toggle = function(divBlock) {
  divBlock.style.display = divBlock.style.display === "none" ? "block" : "none";
  window.scroll(0, document.body.scrollHeight);
}

var pasteSelection = function(textBox) {
  chrome.tabs.query({active:true, windowId: chrome.windows.WINDOW_ID_CURRENT}, 
  function(tab) {
    chrome.tabs.sendMessage(tab[0].id, {method: "getSelection"}, 
    function(response) {
      try {
        textBox.innerHTML = response.data;
      } catch (e) {
        // NOP
      }
    });
  });
};

var clearResultAndError = function() {
  lblErrorMessage.style.display = "none";
  txtOutputText.style.display = "block";
  txtOutputText.value = "";
}

var setupUIHooks = function() {
  cmdHowToUse = document.getElementById("cmdHowToUse");
  divHowToUse = document.getElementById("howToUse");
  txtInputText = document.getElementById("txtInputText");
  txtSecretText = document.getElementById("txtSecretText");
  txtOutputText = document.getElementById("txtOutputText");
  lblErrorMessage = document.getElementById("errorMsg");
  cmdEncodeData = document.getElementById("cmdEncodeText");
  cmdDecodeData = document.getElementById("cmdDecodeText");

  cmdHowToUse.addEventListener('click', function() {
    toggle(divHowToUse);
  });

  cmdEncodeData.addEventListener('click', function() {
    txtOutputText.value = encodeText(txtInputText.value, txtSecretText.value);
  });

  txtInputText.addEventListener("change", clearResultAndError);
  txtSecretText.addEventListener("change", clearResultAndError);
};

var encodeText = function(inputText, hiddenText) {
  var encodedHiddenText = "";

  var secretText = textToBinary(hiddenText);
  var encodedHiddenText = "";

  if (inputText.length > 2) {
    encodedHiddenText = binaryToZeroWidth(secretText);
  } else {
    showError("Error: Input text is not long enough to interweave");
  }

  // var

  var result = interlaceLetters(inputText, hiddenText, interweaveTransformFunction);

  // if (true) {
  //   var 
  // }

  return result;
}

var setupUI = function() {
  pasteSelection(txtInputText);
  divHowToUse.style.display = "none";
  lblErrorMessage.style.display = "none";
};

var zeroPad = function(num) {
  return '00000000'.slice(String(num).length) + num;
};

var binaryToText = function(inputString){
  return inputString.split(' ').map(num => String.fromCharCode(parseInt(num, 2))).join('');
};

var textToBinary = function(inputString){
  return inputString.split('').map(char => zeroPad(char.charCodeAt(0).toString(2))).join(' ');
};

var zeroWidthToBinary = function(inputString) {
  return inputString.split(u65279).map((char) => { // invisible &#65279; '﻿'
    if (char === u200B) { // invisible &#8203; '​'
      return '1';
    } else if (char === u200C) { // invisible &#8204; '‌'
      return '0';
    }
    return ' ';
  }).join('');
}

var binaryToZeroWidth = function(binaryTextArray) {
  return binaryTextArray.split('').map((binaryNum) => {
    var num = parseInt(binaryNum, 10);
    if (num === 1) {
      return u200B; // invisible &#8203;
    } else if (num === 0) {
      return u200C; // invisible &#8204;
    }
    return u200D; // invisible &#8205; '‍'
  }).join(uFEFF); // invisible &#65279;
};

var binaryCharToZeroWidth = function(inputChar) {
  var num = parseInt(inputChar, 10);
  var res;

  if (num === 1) {
    res = u200B; // invisible &#8203;
  } else if (num === 0) {
    res = u200C; // invisible &#8204;
  } else {
    res = u200D; // invisible &#8205; '‍'
  }

  res += uFEFF; // invisible &#65279;
  return res;
}

var interweaveTransformFunction = function(inputString) {
  console.log(inputString, textToBinary(inputString));
  return binaryToZeroWidth(textToBinary(inputString));
}

var interlaceLetters = function(baseString, interweaveString, interweaveTransformFunction) {
  var i;
  // var trimmed = baseString.substring(1, baseString.length - 1);
  var trimmed = baseString;
  var l = Math.min(trimmed.length, interweaveString.length);
  var temp = '';

  for (i = 0; i < l; i++) {
    temp += trimmed[i] + interweaveTransformFunction(interweaveString[i]);
  }

  return temp + trimmed.slice(i) + interweaveTransformFunction(interweaveString.slice(i));
  // return baseString[0] + temp + trimmed.slice(i) + interweaveTransformFunction(interweaveString.slice(i)) + baseString[baseString.length - 1];
}

var showError = function(errorMessage) {
  lblErrorMessage.style.display = "block";
  txtOutputText.style.display = "none";
  txtOutputText.value = "";
  lblErrorMessage.innerHTML = errorMessage;
}

document.addEventListener('DOMContentLoaded', function() {
  setupUIHooks();
  setupUI();
}, false);





// $(function(){
//   $('#paste').click(function(){pasteSelection();});
// });
// function pasteSelection() {
//   chrome.tabs.query({active:true, windowId: chrome.windows.WINDOW_ID_CURRENT}, 
//   function(tab) {
//     chrome.tabs.sendMessage(tab[0].id, {method: "getSelection"}, 
//     function(response){
//       var text = document.getElementById('text'); 
//       text.innerHTML = response.data;
//     });
//   });
// }