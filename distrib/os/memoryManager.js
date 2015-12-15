///<reference path="../globals.ts" />
var DOGES;
(function (DOGES) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        // Loads the program into memory
        MemoryManager.loadProgram = function (programInput, priority) {
            // Return a memory bound violation if Resident List is full
            // Create a PCB
            var newPcb = new DOGES.Pcb();
            // Find free memory to assign the base and limit registers
            newPcb.base = this.fetchFreeBlock();
            newPcb.priority = priority;
            if (newPcb.base === null) {
                // _StdOut.putText("Memory very full. Cannot load. Much sadness.");
                var processFilename = DOGES.ProcessManager.createProcessFilename(newPcb);
                _FileSystem.createFile(processFilename);
                newPcb.inFileSystem = true;
                _FileSystem.writeFile(processFilename, programInput);
            }
            else {
                newPcb.limit = newPcb.base + PROGRAM_SIZE - 1;
                newPcb.inFileSystem = false;
                // Then load the program into memory
                this.loadToMemory(programInput, newPcb.base);
            }
            // Push the new PCB into the Resident list
            _ResidentList.push(newPcb);
            _StdOut.putText("Assigned Process ID: " + newPcb.PID);
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
        // Takes the program out of the file system and puts it in main memory
        // for continued execution
        MemoryManager.rollIn = function (program) {
            program.base = this.fetchFreeBlock();
            // Look up the program from the file system
            var programFilename = DOGES.ProcessManager.createProcessFilename(program);
            var data = _FileSystem.readFile(programFilename);
            // Then load the program from the file system to main memory
            this.loadToMemory(data, program.base);
            _FileSystem.deleteFile(programFilename);
            program.limit = program.base + PROGRAM_SIZE - 1;
            program.inFileSystem = false;
        };
        // Takes the program out of main memory and stores it in the file system
        // for later execution
        MemoryManager.rollOut = function (program) {
            // Create a new file for the rolled-out program
            var programFilename = DOGES.ProcessManager.createProcessFilename(program);
            var programInput = this.fetchProgramInput(program.base);
            _FileSystem.createFile(programFilename);
            // Then write the program data into the file system
            _FileSystem.writeFile(programFilename, programInput);
            program.state = PS_READY;
            program.base = null;
            program.limit = null;
            program.inFileSystem = true;
        };
        // Returns the program input in that particular memory segment
        MemoryManager.fetchProgramInput = function (startAddress) {
            var programInput = "";
            for (var i = startAddress; i < startAddress + PROGRAM_SIZE; i++) {
                programInput += _Memory.memArray[i];
            }
            return programInput;
        };
        // Finds the next available memory block and returns the appropriate address
        MemoryManager.fetchFreeBlock = function () {
            var freeAddress = 0;
            if (_ResidentList.length > 0) {
                for (var i = 0; i < _ResidentList.length; i++) {
                    if (_ResidentList[i] !== undefined
                        && _ResidentList[i].base === freeAddress
                        && _ResidentList[i].base !== null) {
                        freeAddress += PROGRAM_SIZE;
                        if (freeAddress >= PROGRAM_SIZE * PROGRAM_LIMIT) {
                            freeAddress = null;
                        }
                        console.log(freeAddress);
                    }
                }
            }
            return freeAddress;
        };
        // Returns two bytes already allocated in memory
        MemoryManager.fetchTwoBytes = function (address) {
            return _Memory.memArray[_CurrentProgram.base + address];
        };
        // Clears one memory segment in main memory
        MemoryManager.clearSegment = function (startPoint) {
            if (startPoint === null || startPoint === undefined) {
                startPoint = 0;
            }
            for (var i = startPoint; i < (startPoint + PROGRAM_SIZE); i++) {
                _Memory.memArray[i] = "00";
            }
        };
        // Clears all memory partitions
        MemoryManager.clearAll = function () {
            _Memory.init();
            _ResidentList = [];
            DOGES.Control.memoryManagerLog(_Memory.memArray);
        };
        return MemoryManager;
    })();
    DOGES.MemoryManager = MemoryManager;
})(DOGES || (DOGES = {}));
