module DOGES {

  export class ProcessManager {
    constructor() {}

    // Updates the processes in the PCB panel
    public static pcbLog(): void {
      document.getElementById("pcb-pid").innerHTML = _CurrentProgram.PID.toString();
      document.getElementById("pcb-pc").innerHTML = _CurrentProgram.PC.toString();
      document.getElementById("pcb-accumulator").innerHTML = _CurrentProgram.Acc.toString();
      document.getElementById("pcb-xRegister").innerHTML = _CurrentProgram.Xreg.toString();
      document.getElementById("pcb-yRegister").innerHTML = _CurrentProgram.Yreg.toString();
      document.getElementById("pcb-zFlag").innerHTML = _CurrentProgram.Zflag.toString();
    }

    public static clearLog(): void {
      document.getElementById("pcb-pid").innerHTML = "";
      document.getElementById("pcb-pc").innerHTML = "";
      document.getElementById("pcb-accumulator").innerHTML = "";
      document.getElementById("pcb-xRegister").innerHTML = "";
      document.getElementById("pcb-yRegister").innerHTML = "";
      document.getElementById("pcb-zFlag").innerHTML = "";
    }
  }
}