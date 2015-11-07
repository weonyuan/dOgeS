var DOGES;
(function (DOGES) {
    var ProcessManager = (function () {
        function ProcessManager() {
        }
        ProcessManager.determineContextSwitch = function () {
            // Figure out the scheduling method
            if (_CurrentScheduler === RR_SCH) {
                if (_CycleCount > _Quantum) {
                    return true;
                }
            }
            return false;
        };
        ProcessManager.performContextSwitch = function () {
            console.log('performContextSwitch()');
            if (_CurrentProgram.state !== PS_TERMINATED) {
                _CurrentProgram.state = PS_READY;
                _ReadyQueue.push(_CurrentProgram);
            }
            else if (_CurrentProgram.state === PS_TERMINATED) {
                _CPU.isExecuting = false;
                for (var i = 0; i < _ResidentList.length; i++) {
                    if (_CurrentProgram.PID === _ResidentList[i].PID) {
                        _ResidentList.splice(i, 1);
                    }
                }
                this.pcbLog(_CurrentProgram);
            }
            console.log(_ResidentList);
        };
        //TODO: rename process
        ProcessManager.runProcess = function () {
            _CurrentProgram = _ReadyQueue.dequeue();
            var nextProgram = _ReadyQueue.dequeue();
            _CurrentProgram.state = PS_RUNNING;
            _CPU.init();
            _CPU.isExecuting = true;
        };
        ProcessManager.stopProcess = function () {
            _CPU.isExecuting = false;
            _CPU.init();
            // Set the current program to null
            _CurrentProgram = null;
            DOGES.Control.cpuLog();
            this.pcbLog(_CurrentProgram);
            this.clearLog(_CurrentProgram);
            _Console.advanceLine();
            _OsShell.putPrompt();
        };
        // Updates the processes in the PCB panel
        ProcessManager.pcbLog = function (pcb) {
            var pcbHTML = document.getElementById("pcb-" + pcb.PID);
            if (pcbHTML !== null) {
                // console.log(pcbHTML.getElementsByClassName("pid")[0].textContent);
                pcbHTML.getElementsByClassName("pid")[0].textContent = pcb.PID.toString();
                pcbHTML.getElementsByClassName("pc")[0].textContent = pcb.PC.toString();
                pcbHTML.getElementsByClassName("accumulator")[0].textContent = pcb.Acc.toString();
                pcbHTML.getElementsByClassName("xRegister")[0].textContent = pcb.Xreg.toString();
                pcbHTML.getElementsByClassName("yRegister")[0].textContent = pcb.Yreg.toString();
                pcbHTML.getElementsByClassName("zFlag")[0].textContent = pcb.Zflag.toString();
                pcbHTML.getElementsByClassName("state")[0].textContent = this.getProcessStateString(pcb.state);
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
            cell.className = "state";
            cell.textContent = this.getProcessStateString(pcb.state);
            pcbHTML.appendChild(cell);
        };
        ProcessManager.clearLog = function (pcb) {
            var pcbHTML = document.getElementById("pcb-" + pcb.PID);
            // pcbHTML.remove();
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
        return ProcessManager;
    })();
    DOGES.ProcessManager = ProcessManager;
})(DOGES || (DOGES = {}));
