module DOGES {
  export class MemoryManager {
    constructor() {}

    public static loadProgram(programInput): number {
      var newPcb = new Pcb();

      this.loadToMemory(programInput);

      return newPcb.PID;
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

    // This function is fundamentally different than loadToMemory
    // since this is used for values, not the entire program input
    public static storeToMemory(value, targetAddress): void {
      _Memory.memArray[targetAddress] = value;
      DOGES.Control.memoryManagerLog(_Memory.memArray);
    }

    // Returns two bytes already allocated in memory
    public static fetchMemory(address): string {
      return _Memory.memArray[address];
    }
  }
}