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
const APP_NAME: string    = "dOgeS";   // such app
const APP_VERSION: string = "0.3";   // very post-alpha

const CPU_CLOCK_INTERVAL: number = 50;   // This is in ms (milliseconds) so 1000 = 1 second.

const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;
const SYSCALL_IRQ: number = 2;
const UNKNOWN_OPCODE_IRQ: number = 3;
const CPU_BREAK_IRQ: number = 4;
const RUN_PROGRAM_IRQ: number = 5;
const STEP_IRQ: number = 6;
const STEP_MODE_IRQ: number = 7;

const PROGRAM_LIMIT: number = 3;
const PROGRAM_SIZE: number = 256; // every program is allocated 256 bytes
const MEMORY_SIZE: number = PROGRAM_SIZE * PROGRAM_LIMIT;

//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var _CPU: DOGES.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _PID: number = 0;
var _ProcessManager: DOGES.ProcessManager;

var _ResidentList: any = null;
var _ReadyQueue: any = null;
var _Quantum: number = 6; // Quantum for Round Robin scheduling

var _StepMode: boolean = false;

var _CurrentProgram;

var _MemoryManager: DOGES.MemoryManager;
var _Memory: DOGES.Memory;

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement;         // Initialized in Control.hostInit().
var _HistoryCanvas: HTMLCanvasElement;
var _DrawingContext: any; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;              // Additional space added to font size when advancing a line.

var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: DOGES.Kernel;
var _KernelInterruptQueue;          // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue: any = null;  // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers: any[] = null;   // when clearly 'any' is not what we want. There is likely a better way, but what is it?

// Standard input and output
var _StdIn;    // Same "to null or not to null" issue as above.
var _StdOut;

// UI
var _Console: DOGES.Console;
var _OsShell: DOGES.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;

var _hardwareClockID: number = null;
var _taskbarClockID: number = null;

var _CurrentBufferIndex: number = 0;

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

var onDocumentLoad = function() {
	DOGES.Control.hostInit();
};
