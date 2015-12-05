///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module DOGES {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "Keyboard driver loaded.";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (keyCode >= 48 && keyCode <= 57) {    // digits
                chr = String.fromCharCode(keyCode);

                if (isShifted) {
                    chr = this.handleShiftedSymbols(keyCode);
                }

                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 186) && (keyCode <= 192) ||    // symbols
                       (keyCode >= 219) && (keyCode <= 222)) {                         
                chr = String.fromCharCode(keyCode);

                if (isShifted) {
                    chr = this.handleShiftedSymbols(keyCode);
                } else {
                    chr = this.handleNonShiftedSymbols(keyCode);
                }

                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 38 ||                     // up arrow
                       keyCode == 40) {                     // down arrow
                if (keyCode == 38) {
                    if (_CurrentBufferIndex == 0) {
                        _CurrentBufferIndex = _KernelBuffers.length;
                    }
                    _CurrentBufferIndex--;
                } else {
                    if (_CurrentBufferIndex + 1 == _KernelBuffers.length) {
                        _CurrentBufferIndex = _KernelBuffers.length - 1;
                    } else {
                        _CurrentBufferIndex++;
                    }
                }
                _Console.handleBufferHistory(_CurrentBufferIndex);

            } else if (keyCode == 8) {                      // backspace
                var lastChar = _Console.buffer.charAt(_Console.buffer.length - 1);
                _Console.handleBackspace(lastChar);
            } else if (keyCode == 32 ||                     // space
                       keyCode == 13) {                     // enter
                chr = String.fromCharCode(keyCode);

                if (isShifted) {
                    chr = this.handleShiftedSymbols(keyCode);
                }

                _KernelInputQueue.enqueue(chr);
            } else if (keyCode == 9) {                      // tab
                // Set the regex so we look at possible commands from buffer
                var bufferRegex = new RegExp("^" + _Console.buffer + "\\w+");
                var matchedBuffer = "";
                var numMatched = 0;

                // Iterate through the commandList
                for (var i in _OsShell.commandList) {
                    if (bufferRegex.test(_OsShell.commandList[i].command)) {
                        numMatched++;
                        matchedBuffer = _OsShell.commandList[i].command;
                        
                        // If there are more than one match, do not return anything
                        if (numMatched > 1) {
                            matchedBuffer = "";
                            break;
                        }
                    }
                }

                if (numMatched === 1) {
                    // Fill in the missing characters of the buffer
                    _Console.putText(matchedBuffer.replace(_Console.buffer, ""));
                    _Console.buffer = matchedBuffer;
                }
            }
        }

        // The two symbol tables below are mapped to the appropriate key
        // ASCII values (U.S. QWERTY).
        public handleShiftedSymbols(keyCode) {
            var shiftedSymbols = {
                '48': ')',
                '49': '!',
                '50': '@',
                '51': '#',
                '52': '$',
                '53': '%',
                '54': '^',
                '55': '&',
                '56': '*',
                '57': '(',

                '186': ':',
                '187': '+',
                '188': '<',
                '189': '_',
                '190': '>',
                '191': '?',
                '192': '~',
                '219': '{',
                '220': '|',
                '221': '}',
                '222': '"'
            };

            return shiftedSymbols[keyCode];
        }

        public handleNonShiftedSymbols(keyCode) {
            var nonShiftedSymbols = {
                '186': ';',
                '187': '=',
                '188': ',',
                '189': '-',
                '190': '.',
                '191': '/',
                '192': '`',
                '219': '[',
                '220': '\\',
                '221': ']',
                '222': '\''
            };

            return nonShiftedSymbols[keyCode];
        }
    }
}
