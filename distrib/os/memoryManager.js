var DOGES;
(function (DOGES) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        // Loads the program into memory
        MemoryManager.loadProgram = function (programInput) {
            // Return a memory bound violation if Resident List is full
            if (_ResidentList.length >= PROGRAM_LIMIT) {
                _StdOut.putText("Memory very full. Cannot load. Much sadness.");
            }
            else {
                // Create a PCB
                var newPcb = new DOGES.Pcb();
                // Find free memory to assign the base and limit registers
                newPcb.base = this.fetchFreeBlock();
                newPcb.limit = newPcb.base + PROGRAM_SIZE - 1;
                // Push the new PCB into the Resident list
                _ResidentList.push(newPcb);
                // Then load the program into memory
                this.loadToMemory(programInput, newPcb.base);
                _StdOut.putText("Assigned Process ID: " + newPcb.PID);
            }
        };
        MemoryManager.loadToMemory = function (programInput, startPoint) {
            programInput = programInput.replace(/\s/g, "").toUpperCase();
            for (var i = 0; i < programInput.length / 2; i++) {
                if (i === 0) {
                    var currentCode = 0;
                }
                else {
                    currentCode = currentCode + 2;
                }
                _Memory.memArray[i + startPoint] = programInput.substring(currentCode, currentCode + 2);
                DOGES.Control.memoryManagerLog(_Memory.memArray);
            }
        };
        // This function is fundamentally different than loadToMemory
        // since this is used for values, not the entire program input
        MemoryManager.storeToMemory = function (value, targetAddress) {
            value += "";
            // Pad the value with leading 0
            if (value.length === 1) {
                value = "0" + value;
            }
            if ((targetAddress + _CurrentProgram.base) <= _CurrentProgram.limit) {
                _Memory.memArray[targetAddress + _CurrentProgram.base] = value.toUpperCase();
                DOGES.Control.memoryManagerLog(_Memory.memArray);
            }
            else {
                // Memory out of bounds
                _Kernel.krnInterruptHandler(MEMORY_VIOLATION_IRQ, "");
            }
        };
        // Finds the next available memory block and returns the appropriate address
        MemoryManager.fetchFreeBlock = function () {
            var freeAddress = 0;
            if (_ResidentList.length > 0) {
                for (var i = 0; i < _ResidentList.length; i++) {
                    if (_ResidentList[i] !== undefined
                        && _ResidentList[i].base === freeAddress) {
                        freeAddress += PROGRAM_SIZE;
                    }
                }
            }
            return freeAddress;
        };
        // Returns two bytes already allocated in memory
        MemoryManager.fetchTwoBytes = function (address) {
            return _Memory.memArray[_CurrentProgram.base + address];
        };
        // Clears all memory partitions
        MemoryManager.clearAll = function () {
            _Memory.init();
            _ResidentList = [];
            //TODO: should clear the ready queue as well
            console.log(_ReadyQueue);
            DOGES.Control.memoryManagerLog(_Memory.memArray);
        };
        return MemoryManager;
    })();
    DOGES.MemoryManager = MemoryManager;
})(DOGES || (DOGES = {}));
