module DOGES {
  export class MemoryManager {
    constructor() {}

    public static loadProgram(programInput): number {
      var newPcb = new Pcb();

      this.loadToMemory(programInput);

      return newPcb.pid;
    }

    public static loadToMemory(programInput): void {
      programInput = programInput.replace(/\s/g, "").toUpperCase();

      for (var i = 0; i < programInput.length / 2; i++) {
        if (i === 0) {
          var currentCode: number = 0;
        } else {
          currentCode = currentCode + 2;
        }
        _Memory.memArray[i] = programInput.substring(currentCode, currentCode + 2);
        
        DOGES.Control.memoryManagerLog(_Memory.memArray);
      }
    }
  }
}