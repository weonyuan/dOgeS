var DOGES;
(function (DOGES) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        // Loads the program into memory, assigns a PID for the new PCB,
        // and pushes the new process into the resident queue.
        MemoryManager.loadProgram = function (programInput) {
            var newPcb = new DOGES.Pcb();
            _CurrentProgram = newPcb;
            this.loadToMemory(programInput);
            _ResidentQueue.enqueue(newPcb);
            return newPcb.PID;
        };
        MemoryManager.loadToMemory = function (programInput) {
            programInput = programInput.replace(/\s/g, "").toUpperCase();
            for (var i = 0; i < programInput.length / 2; i++) {
                if (i === 0) {
                    var currentCode = 0;
                }
                else {
                    currentCode = currentCode + 2;
                }
                _Memory.memArray[i] = programInput.substring(currentCode, currentCode + 2);
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
            _Memory.memArray[targetAddress] = value.toUpperCase();
            DOGES.Control.memoryManagerLog(_Memory.memArray);
        };
        // Returns two bytes already allocated in memory
        MemoryManager.fetchMemory = function (address) {
            return _Memory.memArray[address];
        };
        // Clears all memory partitions
        MemoryManager.clearAll = function () {
            _Memory.init();
            DOGES.Control.memoryManagerLog(_Memory.memArray);
        };
        return MemoryManager;
    })();
    DOGES.MemoryManager = MemoryManager;
})(DOGES || (DOGES = {}));
