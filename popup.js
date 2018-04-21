var cmdHowToUse;
var divHowToUse;
var txtInputText;
var txtSecretText;
var txtOutputText;
var lblErrorMessage;
var cmdEncodeData;
var cmdDecodeData;

// var uFEFF = '\uFEFF'; // u65279
// var u200B = '\u200B'; // u8203
// var u200C = '\u200C'; // u8204
// var u200D = '\u200D'; // u8205

var uFEFF = '!'; // u65279
var u200B = '1'; // u8203
var u200C = '0'; // u8204
var u200D = '@'; // u8205

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

  cmdDecodeData.addEventListener('click', function() {
    txtOutputText.value = decodeText(txtInputText.value);
  });

  txtInputText.addEventListener("change", clearResultAndError);
  txtSecretText.addEventListener("change", clearResultAndError);
};

var decodeText = function(inputText) {
  var binaryText = zeroWidthToBinary(inputText);
  var result = binaryToText(binaryText);

  return result;
}

var encodeText = function(inputText, hiddenText) {
  var encodedHiddenText = "";

  var secretText = textToBinary(hiddenText);

  if (inputText.length > 2) {
    encodedHiddenText = binaryToZeroWidth(secretText);
  } else {
    showError("Error: Input text is not long enough to interweave");
  }

  var result = interlaceLetters(inputText, encodedHiddenText);

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

var binaryToText = function(inputString) {
  return inputString.split(' ').map(num => (num.length > 6 ? String.fromCharCode(parseInt(num, 2)) : '')).join('');
};

var textToBinary = function(inputString) {
  return inputString.split('').map(char => zeroPad(char.charCodeAt(0).toString(2)));
};

var zeroWidthToBinary = function(inputString) {
  return inputString.split(u200D).map((charChunkPre) => { // invisible &#65279; '﻿'
    var charChunk = charChunkPre.split(uFEFF)[0];
    return charChunk.split('').map((char) => {
      if (char === u200B) { // invisible &#8203; '​'
        return '1';
      } else if (char === u200C) { // invisible &#8204; '‌'
        return '0';
      } else {
        return '';
      }
    }).join('');
  }).join(' ');
}

var binaryToZeroWidth = function(binaryTextArray) {
  return binaryTextArray.map((binaryChar) => {
    var binaryTextResult = binaryChar.split('').map((binaryNum) => {
      var num = parseInt(binaryNum, 10);
      if (num === 1) {
        return u200B; // invisible &#8203;
      } else if (num === 0) {
        return u200C; // invisible &#8204;
      }
      return '';
    }).join('');
    return u200D + binaryTextResult + uFEFF;
  });
};

var interlaceLetters = function(baseString, interweaveStringArray) {

  var firstLast = [baseString[0], baseString[baseString.length - 1]];
  var useableBase = baseString.substring(1, baseString.length - 1);
  console.log("useableBase", useableBase);
  var result = [];

  if (interweaveStringArray.length < useableBase.length) {
    var every = useableBase.length / interweaveStringArray.length;
    for (var i = 0, len = useableBase.length, interW = 0; i < len; i += every, interW++) {
      result.push(useableBase.substr(i, every));
      result.push(interweaveStringArray[interW]);
    }
  } else {

    var every = interweaveStringArray.length / useableBase.length;
    console.log("every", every);
    for (var i = 0; i < useableBase.length; i++) {
      interweaveStringArray.slice(i * every, every + 1).map((intWArr) => {
        result.push(intWArr);
      });
      result.push(useableBase[i]);
    }
    // for (var i = 0, len = interweaveStringArray.length, interW = 0; i < len; i += every, interW++) {
    //   console.log("interweaveStringArray", interweaveStringArray);
    //   interweaveStringArray.slice(i, every).map((intWArr) => {
    //     result.push(intWArr);
    //   });
    //   console.log("result1", result);
    //   result.push(useableBase[interW]);
    //   console.log("useableBase[interW]", useableBase[interW]);
    //   console.log("result2", result);
    // }
  }

  result.push(firstLast[1]);
  result.unshift(firstLast[0]);

  return result.join('');
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