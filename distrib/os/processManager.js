var DOGES;
(function (DOGES) {
    var ProcessManager = (function () {
        function ProcessManager() {
        }
        // Called when run/runall command is entered
        ProcessManager.startRun = function () {
            if (_ReadyQueue.getSize() > 0) {
                if (_CurrentProgram === null) {
                    _CurrentProgram = _ReadyQueue.dequeue();
                    _CurrentProgram.state = PS_RUNNING;
                    _CPU.start(_CurrentProgram);
                }
                else {
                    // A little bit of hacking...called when a new program is
                    // called to run in the middle of program execution
                    _ReadyQueue["q"][_ReadyQueue.getSize() - 1].state = PS_READY;
                }
            }
        };
        // Removes the process from Resident list and memory
        ProcessManager.stopProgram = function () {
            for (var i = 0; i < _ResidentList.length; i++) {
                if (_CurrentProgram.PID === _ResidentList[i].PID) {
                    _ResidentList.splice(i, 1);
                    break;
                }
            }
            _CPU.isExecuting = false;
            // Clear the memory allocation and the logs
            DOGES.MemoryManager.clearSegment(_CurrentProgram.base);
            DOGES.Control.memoryManagerLog(_Memory.memArray);
            _CPU.init();
            DOGES.Control.cpuLog();
            // Reset the cycle count and current program
            _CurrentProgram = null;
            _CycleCount = 0;
        };
        // Updates the processes in the PCB panel
        ProcessManager.pcbLog = function (pcb) {
            var pcbHTML = document.getElementById("pcb-" + pcb.PID);
            if (pcbHTML !== null) {
                pcbHTML.getElementsByClassName("pid")[0].textContent = pcb.PID.toString();
                pcbHTML.getElementsByClassName("pc")[0].textContent = pcb.PC.toString();
                pcbHTML.getElementsByClassName("accumulator")[0].textContent = pcb.Acc.toString(16).toUpperCase();
                pcbHTML.getElementsByClassName("xRegister")[0].textContent = pcb.Xreg.toString();
                pcbHTML.getElementsByClassName("yRegister")[0].textContent = pcb.Yreg.toString();
                pcbHTML.getElementsByClassName("zFlag")[0].textContent = pcb.Zflag.toString();
                pcbHTML.getElementsByClassName("state")[0].textContent = this.getProcessStateString(pcb.state);
                pcbHTML.getElementsByClassName("turnaround")[0].textContent = pcb.turnaround.toString();
                pcbHTML.getElementsByClassName("waiting")[0].textContent = pcb.waiting.toString();
                pcbHTML.getElementsByClassName("location")[0].textContent = this.getLocationString(pcb.inFileSystem);
            }
            else {
                this.createPcbRow(pcb);
            }
        };
        // Creates a new row for the PCB and the accompanying cells
        ProcessManager.createPcbRow = function (pcb) {
            var pcbHTML = document.getElementById("pcb-" + pcb.PID);
            var row = document.createElement("tr");
            row.id = "pcb-" + pcb.PID;
            document.getElementById("pcbTable").getElementsByTagName("tbody")[0].appendChild(row);
            pcbHTML = document.getElementById("pcb-" + pcb.PID);
            var cell = document.createElement("td");
            cell.className = "pid";
            cell.textContent = pcb.PID;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "pc";
            cell.textContent = pcb.PC;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "accumulator";
            cell.textContent = pcb.Acc;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "xRegister";
            cell.textContent = pcb.Xreg;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "yRegister";
            cell.textContent = pcb.Yreg;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "zFlag";
            cell.textContent = pcb.zFlag;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "base";
            cell.textContent = pcb.base;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "limit";
            cell.textContent = pcb.limit;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "state";
            cell.textContent = this.getProcessStateString(pcb.state);
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "turnaround";
            cell.textContent = pcb.turnaround;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "waiting";
            cell.textContent = pcb.waiting;
            pcbHTML.appendChild(cell);
            cell = document.createElement("td");
            cell.className = "location";
            cell.textContent = this.getLocationString(pcb.inFileSystem);
            pcbHTML.appendChild(cell);
        };
        // Returns the appropriate state by its defined integer constant
        ProcessManager.getProcessStateString = function (stateInt) {
            if (stateInt === PS_NEW) {
                return "New";
            }
            else if (stateInt === PS_READY) {
                return "Ready";
            }
            else if (stateInt === PS_RUNNING) {
                return "Running";
            }
            else if (stateInt === PS_WAITING) {
                return "Waiting";
            }
            else if (stateInt === PS_TERMINATED) {
                return "Terminated";
            }
            else {
                return "ERR";
            }
        };
        // Returns the appropriate location by its defined boolean
        ProcessManager.getLocationString = function (inFileSystem) {
            if (inFileSystem) {
                return "File System";
            }
            else {
                return "Memory";
            }
        };
        // Generates a filename for the process to be swapped
        ProcessManager.createProcessFilename = function (pcb) {
            return "process" + pcb.PID;
        };
        return ProcessManager;
    })();
    DOGES.ProcessManager = ProcessManager;
})(DOGES || (DOGES = {}));
