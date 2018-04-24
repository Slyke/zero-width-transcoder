# Zero-Width-Transcoder

## Description
This plugin allows you to hide text inside other text, without it appearing that there's anything different about it.

## Chrome Store
You can find it here: https://chrome.google.com/webstore/detail/mjbadipfgkbceacghfcacpiekejpbpfb

## Encoding
Place the text you want to hide the message in into the Input Text field (Plain Text), then place the text you want to hide into the Secret Text field, and click Encode.
The original text should appear in the Result field, but it will have the Secret Text hidden inside it.


## Decoding
Place text that has the hidden text inside it (for example, copy, then paste the text from the Result field from the Encoding step) into the Input Text field.
Click on the Decode button, and a copy of the hidden text will appear in the Result field.


## How Does It Work?
The Secret Text is first transformed into its binary represetnation, and then encoded into special characters that have 0 width.
There are 4 special characters used: A starting one, an ending one, one for binary 0 and one for binary 1.
The special characters are then spreadout evenly between each of the characters from the Input Text.


## Future versions
Future version of this will allow for different transcoding options (like only placing hidden characters in spaces, using HTML entities and so on).
