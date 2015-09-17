///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module DOGES {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { //    Delete key
                    this.backspaceChar();
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                    console.log(this.buffer);

                // TODO: Write a case for Ctrl-C.
            }
        }

        public backspaceChar(): void {
            var lastChar = this.buffer.charAt(this.buffer.length - 1);
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
            this.currentXPosition = this.currentXPosition - offset;
            console.log(this.currentXPosition);
            console.log(this.currentYPosition);
            console.log(offset);
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - 13, this.currentXPosition, 20);
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                if (this.currentXPosition + offset > _Canvas.width) {                    
                    // line wrap
                    this.advanceLine();
                    this.currentXPosition = 0;
                } else {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                    // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
         }

        public advanceLine(): void {
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
        }

        public handleScrolling(): void {
            if (this.currentYPosition > _Canvas.height) {
                // define the history canvas size as the main canvas size
                _HistoryCanvas.width = _Canvas.width;
                _HistoryCanvas.height = _Canvas.height;

                // then draw whatever is on the main canvas to the history canvas
                _HistoryCanvas.getContext("2d").drawImage(_Canvas, 0, 0);

                // increase the main canvas height, which will clear everything drawn
                _Canvas.height += 45;
                
                // then draw the history canvas back onto the extended main canvas
                _DrawingContext.drawImage(_HistoryCanvas, 0, 0);

                // automatically scroll to the bottom of shell
                document.getElementById("divConsole").scrollTop = document.getElementById("divConsole").scrollHeight;
            }
        }

        public showBsod(msg): void {
            console.log("showBsod(msg)");
            console.log(msg);
            
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
        }
        
        public resetFillStyle(): void {
            _DrawingContext.fillStyle = "#dfdbc3";
        }
    }
 }
