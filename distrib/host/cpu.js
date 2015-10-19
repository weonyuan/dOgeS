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
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute(this.fetch());
            DOGES.Control.cpuLog();
        };
        Cpu.prototype.fetch = function () {
            console.log("fetch()");
            return DOGES.MemoryManager.fetchMemory(this.PC);
        };
        Cpu.prototype.execute = function (opcode) {
            console.log("execute(" + opcode + ")");
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
        };
        // Load the accumlator with a constant
        Cpu.prototype.ldaConstant = function () {
            // Grab the next two param bytes
            var constant = this.base10Translate(this.fetchNextTwoBytes(this.PC));
            this.Acc = constant;
            console.log("ldaConstant()");
        };
        // Load the accumulator from memory
        Cpu.prototype.ldaMemory = function () {
            // Grab the next two bytes (this will be the address)
            var addressBase10 = this.base10Translate(this.fetchNextTwoBytes(this.PC));
            var source = DOGES.MemoryManager.fetchMemory(addressBase10);
            // Set the accumulator from the memory block value (base 10)
            this.Acc = this.base10Translate(source);
            console.log(addressBase10);
            console.log(source);
        };
        // Store the accumulator in memory
        Cpu.prototype.staMemory = function () {
            console.log("staMemory()");
            var destinationBase10 = this.base10Translate(this.fetchNextTwoBytes(this.PC));
            DOGES.MemoryManager.storeToMemory(this.Acc.toString(16), destinationBase10);
            console.log(this.Acc.toString(16));
        };
        // Adds address content to accumulator contents
        Cpu.prototype.adcAccumulator = function () {
        };
        // Load X register with constant
        Cpu.prototype.ldxConstant = function () {
        };
        // Load X register from memory
        Cpu.prototype.ldxMemory = function () {
        };
        // Load Y register with constant
        Cpu.prototype.ldyConstant = function () {
        };
        // Load Y register from memory
        Cpu.prototype.ldyMemory = function () {
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
        };
        // Branch n bytes
        Cpu.prototype.bneBytes = function () {
        };
        // Increment byte value
        Cpu.prototype.incByte = function () {
        };
        // Syscall
        Cpu.prototype.syscall = function () {
            _KernelInterruptQueue.enqueue(new DOGES.Interrupt(SYS_OPCODE_IRQ, ""));
        };
        Cpu.prototype.fetchNextTwoBytes = function (startAddress) {
            var nextTwoBytes = DOGES.MemoryManager.fetchMemory(++this.PC);
            return nextTwoBytes;
        };
        Cpu.prototype.base10Translate = function (hexCode) {
            return parseInt(hexCode, 16);
        };
        return Cpu;
    })();
    DOGES.Cpu = Cpu;
})(DOGES || (DOGES = {}));
