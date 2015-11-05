module DOGES {
  export class MemoryManager {
    constructor() {}

    // Loads the program into memory
    public static loadProgram(programInput): void {
      // Return a memory bound violation if Resident List is full
      if (_ResidentList.length === PROGRAM_LIMIT) {
        _StdOut.putText("Memory very full. Cannot load. Much sadness.");
        _Kernel.krnInterruptHandler(MEMORY_VIOLATION_IRQ);
      } else {
        // Create a PCB
        var newPcb = new Pcb();

        // Find free memory to assign the base and limit registers
        newPcb.base = this.fetchFreeBlock();
        newPcb.limit = newPcb.base + PROGRAM_SIZE - 1;

        // Push the new PCB into the Resident list
        _ResidentList.push(newPcb);
    
        // Then load the program into memory
        this.loadToMemory(programInput, newPcb.base);

        _StdOut.putText("Assigned Process ID: " + newPcb.PID);
      }
    }

    public static loadToMemory(programInput, startPoint): void {
      programInput = programInput.replace(/\s/g, "").toUpperCase();

      for (var i = 0; i < programInput.length / 2; i++) {
        if (i === 0) {
          var currentCode: number = 0;
        } else {
          currentCode = currentCode + 2;
        }
        _Memory.memArray[i + startPoint] = programInput.substring(currentCode, currentCode + 2);
        
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

    // Finds the next available memory block and returns the appropriate address
    public static fetchFreeBlock(): number {
      var freeAddress = 0;
      if (_ResidentList.length > 0) {
        for (var i = 0; i < _ResidentList.length; i++) {
          if (_ResidentList[i].base === freeAddress) {
            freeAddress += PROGRAM_SIZE;
          }
        }
      }

      return freeAddress;
    }

    // Returns two bytes already allocated in memory
    public static fetchTwoBytes(address): string {
      return _Memory.memArray[address];
    }

    // Clears all memory partitions
    public static clearAll(): void {
        _Memory.init();
        _ResidentList = [];
        //TODO: should clear the ready queue as well
        Control.memoryManagerLog(_Memory.memArray);
    }
  }
}