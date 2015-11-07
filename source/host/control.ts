///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module DOGES {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Activate pretty Step Mode switch and set interrupt for toggling
            $("#stepModeSwitch").bootstrapSwitch();
            $("#stepModeSwitch").on("switchChange.bootstrapSwitch", function(event, state) {
              if (state) {
                _StepMode = true;
              } else {
                _StepMode = false;
              }

              _Kernel.krnInterruptHandler(STEP_MODE_IRQ, "");
            });

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement> document.getElementById("display");
            _HistoryCanvas = <HTMLCanvasElement> document.getElementById("history");

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static memoryManagerLog(memArray): void {
            // Create HTML table
          document.getElementById("memoryTable").innerHTML = "";

            for (var i = 0; i < memArray.length; i++) {
              if (i % 8 === 0) {
                // Create a new row if current row has 8 cells
                var row = document.createElement("tr");
                document.getElementById("memoryTable").appendChild(row);
                
                var cell = document.createElement("td");
                var hexString = i.toString(16);

                while (hexString.length < 3) {
                  hexString = "0" + hexString;
                }

                var data = document.createTextNode("0x" + hexString.toUpperCase());
                cell.appendChild(data);
                row.appendChild(cell);
              }
              var cell = document.createElement("td");
              var data = document.createTextNode(memArray[i]);
              var rows = document.getElementById("memoryTable").getElementsByTagName("tr");
              var lastRow = rows[rows.length - 1];
              cell.appendChild(data);
              lastRow.appendChild(cell);
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // The current locale time.
            var now: string = new Date().toLocaleString();

            // Build the log HTML string.
            var str: string;

            str =  '<div class="log">';
            str +=   '<div class="now">' + now + '</div>';
            str +=   '<div>';
            str +=     '<span class="source">' + source + '</span>';
            str +=     '<span class="msg">' + msg + '</span>';
            str +=     '<span class="clock">' + clock + '</span>';
            str +=   '</div>';
            str += '</div>';

            var taLog = <HTMLDivElement>document.getElementById("taHostLog");

            var lastMsg = document.getElementsByClassName("msg")[0];

            if (lastMsg) {
              // Just update the last log's clock value.
              if (lastMsg.firstChild.nodeValue === msg) {
                document.getElementsByClassName("clock")[0].textContent = clock.toString();
              } else {
                // Create a new log.
                taLog.innerHTML = str + taLog.innerHTML;
              }
            } else {
              // Create a new log.
              taLog.innerHTML = str + taLog.innerHTML;
            }
        }

        // Updates the CPU panel
        public static cpuLog(): void {
          document.getElementById("cpu-pc").innerHTML = _CPU.PC.toString();
          document.getElementById("cpu-accumulator").innerHTML = _CPU.Acc.toString();
          document.getElementById("cpu-xRegister").innerHTML = _CPU.Xreg.toString();
          document.getElementById("cpu-yRegister").innerHTML = _CPU.Yreg.toString();
          document.getElementById("cpu-zFlag").innerHTML = _CPU.Zflag.toString();
        }

        //
        // Host Events
        //
        public static hostBtnStep_click(): void {
          _Kernel.krnInterruptHandler(STEP_IRQ, "");
        }

        public static hostBtnStep_enable(): void {
          (<HTMLButtonElement>document.getElementById("btnStep")).disabled = false;
        }

        public static hostBtnStep_disable(): void {
          (<HTMLButtonElement>document.getElementById("btnStep")).disabled = true;
        }

        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Step Mode switch ...
            $("#stepModeSwitch").bootstrapSwitch("toggleDisabled");

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            this.cpuLog();

            _Memory = new Memory();
            _Memory.init();
            this.memoryManagerLog(_Memory.memArray);

            // ... then set the host and taskbar clocks pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            _taskbarClockID = setInterval(Devices.taskbarClockPulse, 100);

            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.            
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            // Disable the Halt button.
            btn.disabled = true;

            // Disable the Step Mode switch.
            $("#stepModeSwitch").bootstrapSwitch("toggleDisabled");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
    }
}
