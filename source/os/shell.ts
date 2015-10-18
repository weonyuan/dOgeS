///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module DOGES {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhere,
                                  "whereami",
                                  "- Displays the user's current location.");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new ShellCommand(this.shellBsod,
                                  "bsodwow",
                                  "- Initiates the Blue Screen of Death.");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                                 "status",
                                 "<string> - Sets the status on the graphical taskbar.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- Loads the code in the User Program Input.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
              "run",
              "<pid> - Runs a program already in memory");
            this.commandList[this.commandList.length] = sc;

            // suchspin
            sc = new ShellCommand(this.shellSpin,
                "suchspin",
                "- Dogey the Shiba will spin. Just for you.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;

            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (cmd.length === 0) {
                  // Just advance the line and write the prompt again.
                  _StdOut.advanceLine();
                  this.putPrompt();
                } else if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }

            // Store the input into the buffer history.
            if (Utils.trim(buffer).length != 0) {
                _KernelBuffers.push(buffer);
            }
            _CurrentBufferIndex = _KernelBuffers.length;
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "ver":
                        _StdOut.putText("Ver displays the current OS version.");
                        break;
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown terminates the current OS session but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen and resets the cursor position.");
                        break;
                    case "man":
                        _StdOut.putText("Man displays a detailed description of a command (i.e., man).");
                        break;
                    case "trace":
                        _StdOut.putText("Trace turns the OS trace on or off, depending on the parameter value (on/off) following the command.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 takes the given string and performs rot13 obfuscation on it.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt sets the prompt for the terminal.");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current date and time (based on your timezone).");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays your current location.");
                        break;
                    case "bsodwow":
                        _StdOut.putText("Bsodwow initiates the Blue Screen of Death.");
                        break;
                    case "status":
                        _StdOut.putText("Status updates the status message on the taskbar.");
                        break;
                    case "load":
                        _StdOut.putText("Load allocates the appropriate space amount in the main memory and loads the user program there.");
                        break;
                    case "run":
                      _StdOut.putText("Run executes the user program already allocated in the main memory.");
                        break;
                    case "suchspin":
                        _StdOut.putText("Suchspin spins Dogey the Shiba infinitely without hurting your eyes (hopefully).");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args) {
            var datetime = new Date().toString();
            _StdOut.putText(datetime);
        }

        public shellWhere(args) {
            var location = [
                "Yes.",
                "You are in Dogeland. The land of the doges.",
                "Why ask me? You know where you are.",
                "Ruff!",
                "You are on a web browser.",
                "Such home.",
                "Somewhere in Marist College."
            ]
            var randomNum = Math.floor(Math.random() * location.length);
            _StdOut.putText(location[randomNum]);
        }

        public shellBsod(args) {
            _Kernel.krnTrapError("INITIATED_BSOD_CMD");
        }

        public shellStatus(args) {
            if (args.length > 0) {
                // Set status based from status command in console
                for (var i = 0; i < args.length; i++) {
                    if (i === 0) {
                        (<HTMLDivElement>document.getElementById("status")).innerHTML = args[i];
                    } else {
                        (<HTMLDivElement>document.getElementById("status")).innerHTML += " " + args[i];
                    }
                }
            }
            else {
                _StdOut.putText("Usage: status <msg>  Please supply a message.");
            }
        }

        public shellLoad(args) {
            // Validate the input by allowing only hexadecimal numbers and spaces
            var programInput: string = (<HTMLTextAreaElement> document.getElementById("taProgramInput")).value;
            var currentChar: string = "";
            var isValid: boolean;

            if (programInput.length > 0) {
                for (var j = 0; j < programInput.length; j++) {
                    // We want to read one character at a time
                    currentChar = programInput.substring(j, j + 1);

                    // If any character in user input is invalid, the entire input is invalid.
                    if (!currentChar.match(/([a-fA-F0-9\s])/g)) {
                        isValid = false;
                    }
                }

                if (isValid === false) {
                    _StdOut.putText("Wat. Such invalid code.");
                } else {
                    var pid: number = MemoryManager.loadProgram(programInput);
                    _StdOut.putText("Much loading. Very appreciate.");
                    _Console.advanceLine();
                    _StdOut.putText("Assigned Process ID: " + pid);
                }
            } else {
                _StdOut.putText("Need code input. Much appreciate.");
            }
        }

        public shellRun(args) {
            if (args.length > 0) {
               // Run the program
              _KernelInterruptQueue.enqueue(new Interrupt(RUN_PROGRAM_IRQ, args[0]));
            } else {
              _StdOut.putText("Usage: run <pid>  Please supply a valid PID.");
            }
        }

        public shellSpin(args) {
            document.getElementById("dogey").style.animation = "2s spinRight infinite linear";
            document.getElementById("dogey").style.webkitAnimation = "2s spinRight infinite linear";
        }
    }
}
