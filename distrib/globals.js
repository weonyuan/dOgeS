/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "dOgeS"; // such app
var APP_VERSION = "0.3"; // very post-alpha
var CPU_CLOCK_INTERVAL = 50; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
// Interrupts
var KEYBOARD_IRQ = 1;
var SYSCALL_IRQ = 2;
var UNKNOWN_OPCODE_IRQ = 3;
var CPU_BREAK_IRQ = 4;
var RUN_PROGRAM_IRQ = 5;
var STEP_IRQ = 6;
var STEP_MODE_IRQ = 7;
var MEMORY_VIOLATION_IRQ = 8;
var CONTEXT_SWITCH_IRQ = 9;
// Process States (used for context switching)
var PS_NEW = 0;
var PS_READY = 1;
var PS_RUNNING = 2;
var PS_WAITING = 3;
var PS_TERMINATED = 4;
// Scheduling routines
var RR_SCH = 0;
var PROGRAM_LIMIT = 3;
var PROGRAM_SIZE = 256; // every program is allocated 256 bytes
var MEMORY_SIZE = PROGRAM_SIZE * PROGRAM_LIMIT;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _PID = 0;
var _ProcessManager;
var _CpuScheduler;
var _CycleCount = 0;
var _ResidentList = null;
var _ReadyQueue = null;
var _Quantum = 6; // Quantum for Round Robin scheduling
var _StepMode = false;
var _CurrentProgram;
var _CurrentScheduler = 0; // Default to Round Robin
var _MemoryManager;
var _Memory;
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas; // Initialized in Control.hostInit().
var _HistoryCanvas;
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue; // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue = null; // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers = null; // when clearly 'any' is not what we want. There is likely a better way, but what is it?
// Standard input and output
var _StdIn; // Same "to null or not to null" issue as above.
var _StdOut;
// UI
var _Console;
var _OsShell;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _hardwareClockID = null;
var _taskbarClockID = null;
var _CurrentBufferIndex = 0;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    DOGES.Control.hostInit();
};
