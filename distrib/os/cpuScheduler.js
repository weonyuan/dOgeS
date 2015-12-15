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
        // Perform context switching
        CpuScheduler.performContextSwitch = function () {
            // Grab the next program once context switch is
            // done on the current program
            var nextProgram = this.findNextProgram();
            // Update the display
            DOGES.ProcessManager.pcbLog(_CurrentProgram);
            if (nextProgram !== null && nextProgram !== undefined) {
                if (_CurrentScheduler === RR_SCH) {
                    this.roundRobinSwitch(nextProgram);
                }
                else if (_CurrentScheduler === FCFS_SCH) {
                    this.fcfsSwitch(nextProgram);
                }
                else if (_CurrentScheduler === PRIORITY_SCH) {
                    this.prioritySwitch(nextProgram);
                }
                var previousProgram = _CurrentProgram;
                // Then set the next program as the current program so it can run
                _CurrentProgram = nextProgram;
                _CurrentProgram.state = PS_RUNNING;
                this.programSwapping(previousProgram);
                _CPU.start(_CurrentProgram);
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
            // If Priority scheduling, find the next program with
            // the lowest priority (top priority)
            if (_CurrentScheduler === PRIORITY_SCH) {
                // How low can you go?
                lowestPriority = Number.MAX_VALUE;
                var lowestPriorityLocation = 0;
                for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                    if (_ReadyQueue.q[i].priority < lowestPriority) {
                        lowestPriority = _ReadyQueue.q[i].priority;
                        lowestPriorityLocation = i;
                    }
                }
                // Take the top priority program out of queue
                // for execution
                nextProgram = _ReadyQueue.q.splice(lowestPriorityLocation, 1)[0];
            }
            else {
                // Otherwise, just pop off the next program in line
                nextProgram = _ReadyQueue.dequeue();
            }
            console.log(nextProgram);
            return nextProgram;
        };
        CpuScheduler.programSwapping = function (previousProgram) {
            // If the current program is in the file system, roll out the
            // last program into the file system to bring the current one
            // to memory
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
        };
        // FCFS Context Switching
        CpuScheduler.fcfsSwitch = function (nextProgram) {
            // wow. such recycle.
            this.roundRobinSwitch(nextProgram);
        };
        // TODO: Priority Context Switching
        CpuScheduler.prioritySwitch = function (nextProgram) {
            for (var i = 0; i < _ResidentList.length; i++) {
                if (_CurrentProgram.PID === _ResidentList[i].PID) {
                    _ResidentList.splice(i, 1);
                    break;
                }
            }
            DOGES.MemoryManager.clearSegment(_CurrentProgram.base);
        };
        return CpuScheduler;
    })();
    DOGES.CpuScheduler = CpuScheduler;
})(DOGES || (DOGES = {}));
