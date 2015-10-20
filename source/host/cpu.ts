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

module DOGES {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute(this.fetch());
            Control.cpuLog();
        }

        public fetch(): string {
            return MemoryManager.fetchMemory(this.PC);
        }

        public execute(opcode): void {
            console.log("execute(" + opcode + ")");
            if (opcode === "A9") {
                this.ldaConstant();
            } else if (opcode === "AD") {
                this.ldaMemory();
            } else if (opcode === "8D") {
                this.staMemory();
            } else if (opcode === "6D") {
                this.adcAccumulator();
            } else if (opcode === "A2") {
                this.ldxConstant();
            } else if (opcode === "AE") {
                this.ldxMemory();
            } else if (opcode === "A0") {
                this.ldyConstant();
            } else if (opcode === "AC") {
                this.ldyMemory();
            } else if (opcode === "EA") {
                this.nop();
            } else if (opcode === "00") {
                this.brk();
            } else if (opcode === "EC") {
                this.cpxMemory();
            } else if (opcode === "D0") {
                this.bneBytes();
            } else if (opcode === "EE") {
                this.incByte();
            } else if (opcode === "FF") {
                this.syscall();
            }

            // Increment program counter for every opcode executed
            this.PC++;
        }

        // Load the accumlator with a constant
        public ldaConstant(): void {
            // Grab the next two param bytes
            var constant = this.base10Translate(this.fetchNextTwoBytes(this.PC));
            this.Acc = constant;
        }

        // Load the accumulator from memory
        public ldaMemory(): void {            
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;

            var addressBase10 = this.base10Translate(memoryAddress);
            var source = MemoryManager.fetchMemory(addressBase10);
            
            // Set the accumulator from the memory block value (base 10)
            this.Acc = this.base10Translate(source);
        }

        // Store the accumulator in memory
        public staMemory(): void {
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;

            var destination = this.base10Translate(memoryAddress);
            MemoryManager.storeToMemory(this.Acc.toString(16), destination);        
        }

        // Adds address content to accumulator contents
        public adcAccumulator(): void {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;

            var addressBase10 = this.base10Translate(memoryAddress);
            var source = MemoryManager.fetchMemory(addressBase10);

            this.Acc += this.base10Translate(source);
            console.log("adc: " + this.Acc);
        }

        // Load X register with constant
        public ldxConstant(): void {
            var constant = this.base10Translate(this.fetchNextTwoBytes(this.PC));
            this.Xreg = constant;
        }

        // Load X register from memory
        public ldxMemory(): void {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;

            var addressBase10 = this.base10Translate(memoryAddress);
            var source = MemoryManager.fetchMemory(addressBase10);
            
            // Set the X register from the memory block value (base 10)
            this.Xreg = this.base10Translate(source);
        }

        // Load Y register with constant
        public ldyConstant(): void {
            var constant = this.base10Translate(this.fetchNextTwoBytes(this.PC));
            this.Yreg = constant;
        }

        // Load Y register from memory
        public ldyMemory(): void {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;

            var addressBase10 = this.base10Translate(memoryAddress);
            var source = MemoryManager.fetchMemory(addressBase10);
            
            // Set the Y register from the memory block value (base 10)
            this.Yreg = this.base10Translate(source);
        }        

        // No operation...literally
        public nop(): void {

        }

        // Break
        public brk(): void {
            _CPU.PC = this.PC;
            _CPU.Acc = this.Acc;
            _CPU.Xreg = this.Xreg;
            _CPU.Yreg = this.Yreg;
            _CPU.Zflag = this.Zflag;
            _KernelInterruptQueue.enqueue(new Interrupt(CPU_BREAK_IRQ, ""));
        }

        // Compare a byte in memory to X register
        public cpxMemory(): void {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;

            var addressBase10 = this.base10Translate(memoryAddress);
            var source = MemoryManager.fetchMemory(addressBase10);

            if (parseInt(source, 16) === this.Xreg) {
                this.Zflag = 1;
            } else {
                this.Zflag = 0;
            }
        }

        // Branch n bytes
        public bneBytes(): void {
            if (this.Zflag === 0) {
                console.log("BNE: zFlag = 0");
                // Fetch the next two bytes and branch by that amount
                this.PC += this.base10Translate(MemoryManager.fetchMemory(++this.PC)) + 1;
                if (this.PC >= PROGRAM_SIZE) {
                    this.PC -= PROGRAM_SIZE;
                }
            } else {
                this.PC++;
            }
        }

        // Increment byte value
        public incByte(): void {
            // Grab the next two bytes (this will be the address)
            var memoryAddress = this.fetchNextTwoBytes(this.PC);
            memoryAddress = this.fetchNextTwoBytes(this.PC) + memoryAddress;

            var addressBase10 = this.base10Translate(memoryAddress);
            var source = MemoryManager.fetchMemory(addressBase10);

            var sourceInt = parseInt(source, 16) + 1;
            MemoryManager.storeToMemory(sourceInt, addressBase10);
        }

        // Syscall
        public syscall(): void {
            _KernelInterruptQueue.enqueue(new Interrupt(SYSCALL_IRQ, this.Xreg));
        }

        public fetchNextTwoBytes(startAddress): string {
            var nextTwoBytes = MemoryManager.fetchMemory(++this.PC);

            return nextTwoBytes;
        }

        public base10Translate(hexCode): number {
            return parseInt(hexCode, 16);
        }
    }
}
