///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */

module DOGES {

    // Extends DeviceDriver
    export class DeviceDriverFileSystem extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "File system driver loaded";
            // More?
        }
    }
}
