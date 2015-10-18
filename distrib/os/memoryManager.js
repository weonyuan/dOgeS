var DOGES;
(function (DOGES) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.loadProgram = function (programInput) {
            var newPcb = new DOGES.Pcb();
            this.loadToMemory(programInput);
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
        MemoryManager.fetchMemory = function (address) {
            return _Memory.memArray[address];
        };
        return MemoryManager;
    })();
    DOGES.MemoryManager = MemoryManager;
})(DOGES || (DOGES = {}));
