var DOGES;
(function (DOGES) {
    var CpuScheduler = (function () {
        function CpuScheduler() {
        }
        CpuScheduler.determineContextSwitch = function () {
            // Figure out the scheduling method then determine
            if (_CurrentScheduler === RR_SCH) {
                if (_CycleCount >= _Quantum) {
                    _Kernel.krnTrace("Quantum value exceeded. Performing context switch...");
                    return true;
                }
            }
            else if (_CurrentScheduler === FCFS_SCH) {
                if (_CurrentProgram.state === PS_TERMINATED) {
                    _Kernel.krnTrace("Current program terminated. Performing context switch...");
                    return true;
                }
            }
            else if (_CurrentScheduler === PRIORITY_SCH) {
                if (_CurrentProgram.state === PS_TERMINATED) {
                    _Kernel.krnTrace("Current program terminated. Performing context switch...");
                    return true;
                }
            }
            return false;
        };
        // Perform Round Robin context switching
        CpuScheduler.performContextSwitch = function () {
            // Grab the next program once context switch is
            // done on the current program
            var nextProgram = _ReadyQueue.dequeue();
            // Update the display
            DOGES.ProcessManager.pcbLog(_CurrentProgram);
            if (nextProgram !== null) {
                if (_CurrentScheduler === RR_SCH) {
                    this.roundRobinSwitch(nextProgram);
                }
                else if (_CurrentScheduler === FCFS_SCH) {
                    this.fcfsSwitch(nextProgram);
                }
                else if (_CurrentScheduler === PRIORITY_SCH) {
                    this.prioritySwitch(nextProgram);
                }
            }
            else if (_CurrentProgram.state === PS_TERMINATED) {
                // CPU is finished running all programs
                DOGES.ProcessManager.stopProgram();
                _Console.advanceLine();
                _OsShell.putPrompt();
            }
            // Reset the cycle count after every context switch
            _CycleCount = 0;
        };
        // Find the next program to execute
        CpuScheduler.findNextProgram = function () {
            var nextProgram = null;
            var lowestPriority = null;
            if (_CurrentScheduler === PRIORITY_SCH) {
                for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                }
                console.log(_ReadyQueue);
                nextProgram = _ReadyQueue.dequeue();
            }
            else {
                nextProgram = _ReadyQueue.dequeue();
            }
            return nextProgram;
        };
        CpuScheduler.programSwapping = function (previousProgram) {
            if (_CurrentProgram.inFileSystem === true) {
                if (previousProgram.state !== PS_TERMINATED) {
                    DOGES.MemoryManager.rollOut(previousProgram);
                }
                DOGES.MemoryManager.rollIn(_CurrentProgram);
            }
        };
        // RR Context Switching
        CpuScheduler.roundRobinSwitch = function (nextProgram) {
            if (_CurrentProgram.state !== PS_TERMINATED) {
                // If the current program is not finished executing,
                // change its state to Ready and push it back into Ready queue
                _CurrentProgram.state = PS_READY;
                _ReadyQueue.enqueue(_CurrentProgram);
            }
            else if (_CurrentProgram.state === PS_TERMINATED) {
                // If the program is finished, remove the program from the
                // Resident list and clear allocated memory
                for (var i = 0; i < _ResidentList.length; i++) {
                    if (_CurrentProgram.PID === _ResidentList[i].PID) {
                        _ResidentList.splice(i, 1);
                        break;
                    }
                }
                DOGES.MemoryManager.clearSegment(_CurrentProgram.base);
            }
            var previousProgram = _CurrentProgram;
            // Then set the next program as the current program so it can run
            _CurrentProgram = nextProgram;
            _CurrentProgram.state = PS_RUNNING;
            this.programSwapping(previousProgram);
            _CPU.start(_CurrentProgram);
        };
        // FCFS Context Switching
        CpuScheduler.fcfsSwitch = function (nextProgram) {
            // wow. such recycle.
            this.roundRobinSwitch(nextProgram);
        };
        // TODO: Priority Context Switching
        CpuScheduler.prioritySwitch = function (nextProgram) {
        };
        return CpuScheduler;
    })();
    DOGES.CpuScheduler = CpuScheduler;
})(DOGES || (DOGES = {}));
