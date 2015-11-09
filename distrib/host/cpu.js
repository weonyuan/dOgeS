///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var DOGES;
(function (DOGES) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.start = function (currentProgram) {
            if (currentProgram !== null) {
                this.PC = currentProgram.PC;
                this.Acc = currentProgram.Acc;
                this.Xreg = currentProgram.Xreg;
                this.Yreg = currentProgram.Yreg;
                this.Zflag = currentProgram.Zflag;
            }
            else {
                this.PC = 0;
                this.Acc = 0;
                this.Xreg = 0;
                this.Yreg = 0;
                this.Zflag = 0;
            }
            this.isExecuting = true;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            _CycleCount++;
            this.execute(this.fetch());
            _CurrentProgram.PC = this.PC;
            _CurrentProgram.Acc = this.Acc;
            _CurrentProgram.Xreg = this.Xreg;
            _CurrentProgram.Yreg = this.Yreg;
            _CurrentProgram.Zflag = this.Zflag;
            DOGES.Control.cpuLog();
        };
        Cpu.prototype.fetch = function () {
            return DOGES.MemoryManager.fetchTwoBytes(this.PC);
        };
        Cpu.prototype.execute = function (opcode) {
            if (opcode === "A9") {
                this.ldaConstant();
            }
            else if (opcode === "AD") {
                this.ldaMemory();
            }
            else if (opcode === "8D") {
                this.staMemory();
            }
            else if (opcode === "6D") {
                this.adcAccumulator();
            }
            else if (opcode === "A2") {
                this.ldxConstant();
            }
            else if (opcode === "AE") {
                this.ldxMemory();
            }
            else if (opcode === "A0") {
                this.ldyConstant();
            }
            else if (opcode === "AC") {
                this.ldyMemory();
            }
            else if (opcode === "EA") {
                this.nop();
            }
            else if (opcode === "00") {
                this.brk();
            }
            else if (opcode === "EC") {
                this.cpxMemory();
            }
            else if (opcode === "D0") {
                this.bneBytes();
            }
            else if (opcode === "EE") {
                this.incByte();
            }
            else if (opcode === "FF") {
                this.syscall();
            }
            // Increment program counter for every opcode executed
            this.PC++;
            console.log(opcode);
        };
        // Load the accumlator with a constant
        Cpu.prototype.ldaConstant = function () {
            // Grab the next two param bytes
            var constant = this.translateBase16(this.fetchNextTwoBytes(this.PC));
            this.Acc = constant;
        };
        // Load the accumulator from memory
        Cpu.prototype.ldaMemory = function () {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;
            var addressBase10 = this.translateBase16(memoryAddress);
            var source = DOGES.MemoryManager.fetchTwoBytes(addressBase10);
            // Set the accumulator from the memory block value (base 10)
            this.Acc = this.translateBase16(source);
        };
        // Store the accumulator in memory
        Cpu.prototype.staMemory = function () {
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;
            var destination = this.translateBase16(memoryAddress);
            DOGES.MemoryManager.storeToMemory(this.Acc.toString(16), destination);
        };
        // Adds address content to accumulator contents
        Cpu.prototype.adcAccumulator = function () {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;
            var addressBase10 = this.translateBase16(memoryAddress);
            var source = DOGES.MemoryManager.fetchTwoBytes(addressBase10);
            this.Acc += this.translateBase16(source);
        };
        // Load X register with constant
        Cpu.prototype.ldxConstant = function () {
            var constant = this.translateBase16(this.fetchNextTwoBytes(this.PC));
            this.Xreg = constant;
        };
        // Load X register from memory
        Cpu.prototype.ldxMemory = function () {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;
            var addressBase10 = this.translateBase16(memoryAddress);
            var source = DOGES.MemoryManager.fetchTwoBytes(addressBase10);
            // Set the X register from the memory block value (base 10)
            this.Xreg = this.translateBase16(source);
        };
        // Load Y register with constant
        Cpu.prototype.ldyConstant = function () {
            var constant = this.translateBase16(this.fetchNextTwoBytes(this.PC));
            this.Yreg = constant;
        };
        // Load Y register from memory
        Cpu.prototype.ldyMemory = function () {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;
            var addressBase10 = this.translateBase16(memoryAddress);
            var source = DOGES.MemoryManager.fetchTwoBytes(addressBase10);
            // Set the Y register from the memory block value (base 10)
            this.Yreg = this.translateBase16(source);
        };
        // No operation...literally
        Cpu.prototype.nop = function () {
        };
        // Break
        Cpu.prototype.brk = function () {
            _CPU.PC = this.PC;
            _CPU.Acc = this.Acc;
            _CPU.Xreg = this.Xreg;
            _CPU.Yreg = this.Yreg;
            _CPU.Zflag = this.Zflag;
            _KernelInterruptQueue.enqueue(new DOGES.Interrupt(CPU_BREAK_IRQ, ""));
        };
        // Compare a byte in memory to X register
        Cpu.prototype.cpxMemory = function () {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;
            var addressBase10 = this.translateBase16(memoryAddress);
            var source = DOGES.MemoryManager.fetchTwoBytes(addressBase10);
            console.log(memoryAddress);
            console.log(addressBase10);
            if (parseInt(source, 16) === this.Xreg) {
                this.Zflag = 1;
            }
            else {
                this.Zflag = 0;
            }
        };
        // Branch n bytes
        Cpu.prototype.bneBytes = function () {
            if (this.Zflag === 0) {
                // Fetch the next two bytes and branch by that amount
                this.PC += this.translateBase16(DOGES.MemoryManager.fetchTwoBytes(++this.PC)) + 1;
                if (this.PC >= PROGRAM_SIZE) {
                    this.PC -= PROGRAM_SIZE;
                }
            }
            else {
                this.PC++;
            }
        };
        // Increment byte value
        Cpu.prototype.incByte = function () {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;
            var addressBase10 = this.translateBase16(memoryAddress);
            var source = DOGES.MemoryManager.fetchTwoBytes(addressBase10);
            var sourceInt = parseInt(source, 16) + 1;
            DOGES.MemoryManager.storeToMemory(sourceInt.toString(16), addressBase10);
        };
        // Syscall
        Cpu.prototype.syscall = function () {
            _KernelInterruptQueue.enqueue(new DOGES.Interrupt(SYSCALL_IRQ, this.Xreg));
        };
        Cpu.prototype.fetchNextTwoBytes = function (startAddress) {
            var nextTwoBytes = DOGES.MemoryManager.fetchTwoBytes(++this.PC);
            return nextTwoBytes;
        };
        // Translate from base 16 to base 10
        Cpu.prototype.translateBase16 = function (hexCode) {
            return parseInt(hexCode, 16);
        };
        return Cpu;
    })();
    DOGES.Cpu = Cpu;
})(DOGES || (DOGES = {}));
