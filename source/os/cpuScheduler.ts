module DOGES {
  export class CpuScheduler {
    constructor() {}

    public static determineContextSwitch(): boolean {
        // Figure out the scheduling method then determine
        if (_CurrentScheduler === RR_SCH) {
            if (_CycleCount >= _Quantum) {
                _Kernel.krnTrace("Quantum value exceeded. Performing context switch...");
                return true;
            }
        }

        return false;
    }

    // Perform Round Robin context switching
    public static performContextSwitch(): void {
        // Grab the next program once context switch is
        // done on the current program
        var nextProgram = _ReadyQueue.dequeue();

        // Update the display
        ProcessManager.pcbLog(_CurrentProgram);
        if (nextProgram !== null) {
            if (_CurrentProgram.state !== PS_TERMINATED) {
                // If the current program is not finished executing,
                // change its state to Ready and push it back into Ready queue
                _CurrentProgram.state = PS_READY;
                _ReadyQueue.enqueue(_CurrentProgram);
            } else if (_CurrentProgram.state === PS_TERMINATED) {
                // If the program is finished, remove the program from the
                // Resident list and clear allocated memory
                for (var i = 0; i < _ResidentList.length; i++) {
                    if (_CurrentProgram.PID === _ResidentList[i].PID) {
                        _ResidentList.splice(i, 1);
                        break;
                    }
                }
                MemoryManager.clearSegment(_CurrentProgram.base);
            }

            // Then set the next program as the current program so it can run
            _CurrentProgram = nextProgram;
            _CurrentProgram.state = PS_RUNNING;
            _CPU.start(_CurrentProgram);
        } else if (_CurrentProgram.state === PS_TERMINATED) {
            // CPU is finished running all programs
            ProcessManager.stopProgram();

            _Console.advanceLine();
            _OsShell.putPrompt();
        }

        // Reset the cycle count after every context switch
        _CycleCount = 0;
    }
  }
}