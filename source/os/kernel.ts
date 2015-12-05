///<reference path="../globals.ts" />
///<reference path="queue.ts" />

/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module DOGES {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _KernelBuffers.push("");
            _ResidentList = new Array();
            _ReadyQueue = new Queue();
                   
            // Initialize the console.
            _Console = new Console();          // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the File System Driver
            this.krnTrace("Loading the file system driver.");
            _krnFileSystemDriver = new DeviceDriverFileSystem();    // Construct the file system.
            _krnFileSystemDriver.init();
            this.krnTrace(_krnFileSystemDriver.status);

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOgeS) {
                _GLaDOgeS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            clearInterval(_hardwareClockID);
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting && !_StepMode) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                Control.hostBtnStep_disable();
                this.handleCPUClockPulse();
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        }

        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case SYSCALL_IRQ:
                    _StdIn.handleSyscall(params);
                    break;
                case UNKNOWN_OPCODE_IRQ:
                    this.krnTrace("Unknown opcode: " + MemoryManager.fetchTwoBytes(_CPU.PC - 1));
                    _CurrentProgram.state = PS_TERMINATED;
                    CpuScheduler.performContextSwitch();
                    break;
                case CPU_BREAK_IRQ:
                    _CurrentProgram.state = PS_TERMINATED;
                    CpuScheduler.performContextSwitch();
                    break;
                case RUN_PROGRAM_IRQ:
                    if (_CPU.isExecuting
                        && CpuScheduler.determineContextSwitch()) {
                        CpuScheduler.performContextSwitch();
                    } else {
                        ProcessManager.startRun();
                    }
                    break;
                case STEP_IRQ:
                    this.krnStep();
                    break;
                case STEP_MODE_IRQ:
                    this.handleStepMode();
                    break;
                case MEMORY_VIOLATION_IRQ:
                    // Terminate program
                    this.krnTrace("Memory out of bounds. Terminating...");
                    _CurrentProgram.state = PS_TERMINATED;
                    CpuScheduler.performContextSwitch();
                    break;
                case CONTEXT_SWITCH_IRQ:
                    CpuScheduler.performContextSwitch();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        // Every step will cycle the CPU and update the PCB log
        public krnStep() {
            if (_CurrentProgram !== null) {
                this.handleCPUClockPulse();
            }
        }

        // Responsible for enabling/disabling step button
        public handleStepMode() {
            if (_StepMode) {
                Control.hostBtnStep_enable();
            } else {
                Control.hostBtnStep_disable();
            }
        }

        public handleCPUClockPulse() {
            if (CpuScheduler.determineContextSwitch()) {
                this.krnInterruptHandler(CONTEXT_SWITCH_IRQ, _CurrentProgram);
            }

            _CPU.cycle();

            for (var i = 0; i < _ResidentList.length; i++) {
                if (_ResidentList[i].state === PS_READY) {
                    _ResidentList[i].waiting++;
                    _ResidentList[i].turnaround++;

                    ProcessManager.pcbLog(_ResidentList[i]);
                }
            }

            if (_CurrentProgram !== null) {
                _CurrentProgram.turnaround++;
                ProcessManager.pcbLog(_CurrentProgram);
            }
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            _Console.showBsod(msg);
            this.krnShutdown();
        }
    }
}
