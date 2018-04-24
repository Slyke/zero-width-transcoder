var mainDoc;
var cmdHowToUse;
var divHowToUse;
var options;
var txtInputText;
var txtSecretText;
var txtOutputText;
var lblErrorMessage;
var cmdEncodeData;
var cmdDecodeData;
var cmdExpandCollapse;
var chkHTMLEntitiesEncoding;

var uFEFF = '\uFEFF'; // u65279
var u200B = '\u200B'; // u8203
var u200C = '\u200C'; // u8204
var u200D = '\u200D'; // u8205

var htmluFEFF = "&#xfeff;";
var htmlu200B = "&#x200b;";
var htmlu200C = "&#x200c;";
var htmlu200D = "&#x200d;";

var binary0;
var binary1;
var encodeStart;
var encodeEnd;

// Debug
// var uFEFF = '!'; // u65279
// var u200B = '1'; // u8203
// var u200C = '0'; // u8204
// var u200D = '@'; // u8205

var setEncodingCharacters = function(htmlEntities) {
  if (htmlEntities) {
    binary0 = htmlu200C;
    binary1 = htmlu200B;
    encodeStart = htmlu200D;
    encodeEnd = htmluFEFF;
  } else {
    binary0 = u200C;
    binary1 = u200B;
    encodeStart = u200D;
    encodeEnd = uFEFF;
  }

}

var toggle = function(divBlock) {
  divBlock.style.display = divBlock.style.display === "none" ? "block" : "none";
  try {
    window.scroll({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
  } catch (e) {
      let before = window.pageYOffset;

      window.scrollTo(0, window.innerHeight);
      
      if (before === window.pageYOffset) {
          console.warn("Your browser doesn't seem to support scrolling.");
      }
  }
}

var pasteSelection = function(textBox) {
  chrome.tabs.query({active:true, windowId: chrome.windows.WINDOW_ID_CURRENT}, 
  function(tab) {
    chrome.tabs.sendMessage(tab[0].id, {method: "getSelection"}, 
    function(response) {
      try {
        if (response.data) {
          textBox.innerHTML = response.data;
        }
      } catch (e) {
        console.error('Error getting text from tab: ', e)
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
  mainDoc = document.getElementById("mainDoc");
  cmdHowToUse = document.getElementById("cmdHowToUse");
  divHowToUse = document.getElementById("howToUse");
  options = document.getElementById("options");
  txtInputText = document.getElementById("txtInputText");
  txtSecretText = document.getElementById("txtSecretText");
  txtOutputText = document.getElementById("txtOutputText");
  lblErrorMessage = document.getElementById("errorMsg");
  cmdEncodeData = document.getElementById("cmdEncodeText");
  cmdDecodeData = document.getElementById("cmdDecodeText");
  cmdExpandCollapse = document.getElementById("cmdExpandCollapse");
  cmdOptions = document.getElementById("cmdOptions");
  chkHTMLEntitiesEncoding = document.getElementById("chkHTMLEntitiesEncoding");

  cmdHowToUse.addEventListener('click', function() {
    if (divHowToUse.style.display === "block") {
      cmdHowToUse.innerHTML = "How To Use \u25BC";
    } else {
      cmdHowToUse.innerHTML = "How To Use \u25B2";
    }

    if (options.style.display === "block") {
      cmdOptions.click();
    }
    
    toggle(divHowToUse);
  });

  cmdOptions.addEventListener('click', function() {
    if (options.style.display === "block") {
      cmdOptions.innerHTML = "Options \u25BC";
    } else {
      cmdOptions.innerHTML = "Options \u25B2";
    }

    if (divHowToUse.style.display === "block") {
      cmdHowToUse.click();
    }
    
    toggle(options);
  });

  cmdExpandCollapse.addEventListener('click', function() {
    var currentWidth = document.body.style.width || document.body.clientWidth;
    currentWidth = currentWidth.toString().replace('px', '');

    if (currentWidth > 525) {
      cmdExpandCollapse.innerHTML = "Expand \u25BA";
      mainDoc.style.width = '512px';
      localStorage.setItem("mainBodyExpanded", false);
    } else {
      cmdExpandCollapse.innerHTML = "Collapse \u25C4";
      mainDoc.style.width = '768px';
      localStorage.setItem("mainBodyExpanded", true);
    }
  });

  cmdEncodeData.addEventListener('click', function() {
    txtOutputText.value = encodeText(txtInputText.value, txtSecretText.value);
  });

  cmdDecodeData.addEventListener('click', function() {
    txtOutputText.value = decodeText(txtInputText.value);
  });

  chkHTMLEntitiesEncoding.addEventListener('click', function() {
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("chkHTMLEntitiesEncoding", chkHTMLEntitiesEncoding.checked)
    }
    console.log();
  });

  txtInputText.addEventListener("change", clearResultAndError);
  txtSecretText.addEventListener("change", clearResultAndError);
  
  if (typeof(Storage) !== "undefined") {
    chkHTMLEntitiesEncoding.checked = (localStorage.getItem("chkHTMLEntitiesEncoding") === "true");

    if (localStorage.getItem("mainBodyExpanded") === "true") {
      cmdExpandCollapse.click();
    }
  }
};

var decodeText = function(inputText) {
  var binaryText = zeroWidthToBinary(inputText);
  var result = binaryToText(binaryText);

  return result;
}

var encodeText = function(inputText, hiddenText) {
  var encodedHiddenText = "";

  setEncodingCharacters(localStorage.getItem("chkHTMLEntitiesEncoding") === "true");

  var secretText = textToBinary(hiddenText);

  if (inputText.length > 2) {
    encodedHiddenText = binaryToZeroWidth(secretText);
  } else {
    showError("Error: Input Text is not long enough to interweave");
  }

  var result = interlaceLetters(inputText, encodedHiddenText);

  return result;
}

var setupUI = function() {
  pasteSelection(txtInputText);
  divHowToUse.style.display = "none";
  lblErrorMessage.style.display = "none";
  options.style.display = "none";
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
  return inputString.split(encodeStart).map((charChunkPre) => {
    var charChunk = charChunkPre.split(encodeEnd)[0];
    return charChunk.split('').map((char) => {
      if (char === binary1) {
        return '1';
      } else if (char === binary0) {
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
        return binary1;
      } else if (num === 0) {
        return binary0;
      }
      return '';
    }).join('');
    return encodeStart + binaryTextResult + encodeEnd;
  });
};

var interlaceLetters = function(baseString, interweaveStringArray) {

  var firstLast = [baseString[0], baseString[baseString.length - 1]];
  var useableBase = baseString.substring(1, baseString.length - 1);
  var result = [];

  if (interweaveStringArray.length < useableBase.length) {
    var every = Math.round(useableBase.length / interweaveStringArray.length);
    for (var i = 0, len = useableBase.length, interW = 0; i < len; i += every, interW++) {
      result.push(useableBase.substr(i, every));
      result.push(interweaveStringArray[interW]);
    }
  } else {

    var every = interweaveStringArray.length / useableBase.length;
    for (var i = 0; i < useableBase.length; i++) {
      interweaveStringArray.slice(i * every, ((i * every) + every)).map((intWArr) => {
        result.push(intWArr);
      });
      result.push(useableBase[i]);
    }
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
