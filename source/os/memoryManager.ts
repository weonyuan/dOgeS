module DOGES {
  export class MemoryManager {
    constructor() {}

    // Loads the program into memory, assigns a PID for the new PCB,
    // and pushes the new process into the resident queue.
    public static loadProgram(programInput): number {
      var newPcb = new Pcb();
      _CurrentProgram = newPcb;
      
      this.loadToMemory(programInput);
      _ResidentQueue.enqueue(newPcb);

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
        
        Control.memoryManagerLog(_Memory.memArray);
      }
    }

    // This function is fundamentally different than loadToMemory
    // since this is used for values, not the entire program input
    public static storeToMemory(value, targetAddress): void {
      value += "";

      // Pad the value with leading 0
      if (value.length === 1) {
        value = "0" + value;
      }

      _Memory.memArray[targetAddress] = value.toUpperCase();
      Control.memoryManagerLog(_Memory.memArray);
    }

    // Returns two bytes already allocated in memory
    public static fetchMemory(address): string {
      return _Memory.memArray[address];
    }

    // Clears all memory partitions
    public static clearAll(): void {
        _Memory.init();
        Control.memoryManagerLog(_Memory.memArray);
    }
  }
}