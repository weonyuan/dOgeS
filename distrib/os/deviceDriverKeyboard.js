///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var DOGES;
(function (DOGES) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            console.log(params);
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||
                ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode >= 48 && keyCode <= 57) {
                chr = String.fromCharCode(keyCode);
                if (isShifted) {
                    chr = this.handleShiftedSymbols(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 8) {
                var lastChar = _Console.buffer.charAt(_Console.buffer.length - 1);
                _Console.handleBackspace(lastChar);
            }
            else if (keyCode == 32 ||
                keyCode == 13) {
                chr = String.fromCharCode(keyCode);
                if (isShifted) {
                    chr = this.handleShiftedSymbols(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 186) && (keyCode <= 192) ||
                (keyCode >= 219) && (keyCode <= 222)) {
                chr = String.fromCharCode(keyCode);
                if (isShifted) {
                    chr = this.handleShiftedSymbols(keyCode);
                }
                else {
                    chr = this.handleNonShiftedSymbols(keyCode);
                }
                console.log(chr);
                _KernelInputQueue.enqueue(chr);
            }
        };
        DeviceDriverKeyboard.prototype.handleShiftedSymbols = function (keyCode) {
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
        };
        DeviceDriverKeyboard.prototype.handleNonShiftedSymbols = function (keyCode) {
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
        };
        return DeviceDriverKeyboard;
    })(DOGES.DeviceDriver);
    DOGES.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(DOGES || (DOGES = {}));
