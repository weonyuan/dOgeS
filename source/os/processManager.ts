module DOGES {

  export class ProcessManager {
    constructor() {}

    public static determineContextSwitch(): boolean {
      // Figure out the scheduling method
        console.log(_CycleCount);
      if (_CurrentScheduler === RR_SCH) {
        if (_CycleCount >= _Quantum) {
          return true;
        }
      }

      return false;
    }

    public static performContextSwitch(): void {
        // Grab the next program once context switch is
        // done on the current program
        var nextProgram = _ReadyQueue.dequeue();
        if (nextProgram !== null) {
            if (_CurrentProgram.state !== PS_TERMINATED) {
                _CurrentProgram.state = PS_READY;
                _ReadyQueue.enqueue(_CurrentProgram);
                this.pcbLog(_CurrentProgram);
            } else if (_CurrentProgram.state === PS_TERMINATED) {
                this.stopProcess();
            }

            _CurrentProgram = nextProgram;
            _CurrentProgram.state = PS_RUNNING;
            _CPU.start(_CurrentProgram);
        } else if (_CurrentProgram.state === PS_TERMINATED) {
            // CPU is finished running
            this.stopProcess();

            _CPU.init();
            Control.cpuLog();

            _Console.advanceLine();
            _OsShell.putPrompt();

            _CurrentProgram = null;
        }

        _CycleCount = 0;
    }

    //TODO: rename process
    public static runProcess(): void {
      _CurrentProgram = _ReadyQueue.dequeue();

      _CurrentProgram.state = PS_RUNNING;
      _CPU.start(_CurrentProgram);
    }

    public static stopProcess(): void {
      _CPU.isExecuting = false;

      for (var i = 0; i < _ResidentList.length; i++) {
          if (_CurrentProgram.PID === _ResidentList[i].PID) {
              _ResidentList.splice(i, 1);
          }
      }

      this.pcbLog(_CurrentProgram);
      this.clearLog(_CurrentProgram);

      _CycleCount = 0;
    }

    // Updates the processes in the PCB panel
    public static pcbLog(pcb): void {
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
        pcbHTML.getElementsByClassName("turnaround")[0].textContent = pcb.turnaround.toString();
        pcbHTML.getElementsByClassName("waiting")[0].textContent = pcb.waiting.toString();
        

        console.log("PID: " + pcb.PID + ", PC: " + pcb.PC);
      } else {
        this.createPcbRow(pcb);
      }
    }

    // Creates a new row for the PCB and the accompanying cells
    public static createPcbRow(pcb): void {
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
    }

    public static clearLog(pcb): void {
      var pcbHTML = document.getElementById("pcb-" + pcb.PID);
      pcbHTML.remove();
    }

    // Returns the appropriate state by its defined integer constant
    public static getProcessStateString(stateInt): string {
      if (stateInt === PS_NEW) {
        return "New";
      } else if (stateInt === PS_READY) {
        return "Ready";
      } else if (stateInt === PS_RUNNING) {
        return "Running";
      } else if (stateInt === PS_WAITING) {
        return "Waiting";
      } else if (stateInt === PS_TERMINATED) {
        return "Terminated";
      } else {
        return "ERR";
      }
    }
  }
}