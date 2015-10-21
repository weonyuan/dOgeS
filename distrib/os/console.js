///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var DOGES;
(function (DOGES) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _Canvas.height = 460;
            _HistoryCanvas.height = _Canvas.height;
        };
        Console.prototype.clearLine = function () {
            var startX = this.currentXPosition;
            var startY = this.currentYPosition - _DefaultFontSize;
            for (var i = 0; i < this.buffer.length; i++) {
                var currentChar = this.buffer.charAt(i);
                startX -= _DrawingContext.measureText(this.currentFont, this.currentFontSize, currentChar);
            }
            _DrawingContext.clearRect(startX, startY, this.currentXPosition, this.currentYPosition);
            this.currentXPosition = startX;
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.handleBufferHistory = function (_CurrentBufferIndex) {
            this.clearLine();
            this.buffer = _KernelBuffers[_CurrentBufferIndex];
            this.putText(_Console.buffer);
        };
        Console.prototype.handleBackspace = function (chr) {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, chr);
            // Backspacing to a previous line.
            if (this.currentXPosition <= 0 && this.buffer.length > 0) {
                this.currentXPosition = _Canvas.width;
                this.currentYPosition -= 21;
            }
            var startX = this.currentXPosition - offset;
            var startY = this.currentYPosition - _DefaultFontSize - 1;
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
            _DrawingContext.clearRect(startX, startY, this.currentXPosition, this.currentYPosition + 4);
            this.currentXPosition -= _DrawingContext.measureText(this.currentFont, this.currentFontSize, chr);
        };
        Console.prototype.handleSyscall = function (Xreg) {
            if (Xreg === 1) {
                // Print the integer stored in Y register
                this.putText(_CPU.Yreg.toString());
            }
            else if (Xreg === 2) {
                // Initialize starting point
                var currentAddress = _CPU.Yreg;
                var string = "";
                // Terminate at "00"
                while (DOGES.MemoryManager.fetchMemory(currentAddress) !== "00") {
                    var charAscii = _CPU.translateBase16(DOGES.MemoryManager.fetchMemory(currentAddress));
                    string += String.fromCharCode(charAscii);
                    currentAddress++;
                }
                this.putText(string);
            }
        };
        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Scan every character so we can check when to line wrap.
                for (var i = 0; i < text.length; i++) {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[i]);
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[i]);
                    var newXPosition = this.currentXPosition + offset;
                    // The 10 is there just so the character doesn't go offscreen.
                    if (newXPosition + 10 >= _Canvas.width) {
                        this.advanceLine();
                    }
                    else {
                        this.currentXPosition = newXPosition;
                    }
                    // Focus on the bottom of canvas when a character is typed.
                    document.getElementById("divConsole").scrollTop = document.getElementById("divConsole").scrollHeight;
                }
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            this.handleScrolling();
        };
        Console.prototype.handleScrolling = function () {
            if (this.currentYPosition > _Canvas.height) {
                // Define the history canvas size as the main canvas size.
                _HistoryCanvas.width = _Canvas.width;
                _HistoryCanvas.height = _Canvas.height;
                // Then draw whatever is on the main canvas to the history canvas.
                _HistoryCanvas.getContext("2d").drawImage(_Canvas, 0, 0);
                // Increase the main canvas height, which will clear everything drawn.
                _Canvas.height += _DefaultFontSize * 2 +
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _DrawingContext.fontAscent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin;
                // Then draw the history canvas back onto the extended main canvas.
                _DrawingContext.drawImage(_HistoryCanvas, 0, 0);
                // Automatically scroll to the bottom of shell.
                document.getElementById("divConsole").scrollTop = document.getElementById("divConsole").scrollHeight;
            }
        };
        Console.prototype.showBsod = function (msg) {
            _Canvas.width = 479;
            _Canvas.height = 472;
            // draw the blue background
            _DrawingContext.rect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.fillStyle = "#2067b2";
            _DrawingContext.fill();
            this.resetFillStyle();
            // draw the message
            _DrawingContext.font = "40pt Calibri";
            _DrawingContext.fillStyle = "#ffffff";
            _DrawingContext.fillText("wow", 40, 100);
            _DrawingContext.font = "12pt Calibri";
            _DrawingContext.fillText("such calibri. very blue. much rekt.", 40, 150);
            _DrawingContext.fillText("ERROR_MSG: " + msg, 40, 170);
        };
        Console.prototype.resetFillStyle = function () {
            _DrawingContext.fillStyle = "#dfdbc3";
        };
        return Console;
    })();
    DOGES.Console = Console;
})(DOGES || (DOGES = {}));
