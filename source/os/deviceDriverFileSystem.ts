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
        constructor(public tracks: number = 0,
                    public sectors: number = 0,
                    public blocks: number = 0,
                    public blockSize: number = 0,
                    public metaSize: number = 0) {
            // Override the base method pointers.
            super(this.krnFsDriverEntry, this.krnFsISR);

            // Constants for the file system.
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;

            // Total size (bytes) of a block.
            this.blockSize = 64;

            // Bytes allocated for the block's meta.
            this.metaSize = 4;
        }

        public krnFsDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "File system driver loaded.";
            this.displayFsLog();
        }

        public krnFsISR(params) {

        }

        public format(): void {
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var key: string = i + ":" + j + ":" + k;
                        sessionStorage.setItem(key, this.initalizeBlock());
                    }
                }
            }
        }

        // Initalize block data with zeroes
        public initalizeBlock(): string {
            var data: string = "";
            for (var i = 0; i < this.blockSize; i++) {
                data += "0";
            }

            return data;
        }

        // Display the file system log
        public displayFsLog(): void {
            var hdHTML = document.getElementById("fsTable");
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var row = document.createElement("tr");
                        document.getElementById("fsTable").appendChild(row);

                        var cell = document.createElement("td");
                        cell.className = "tsb";
                        cell.textContent = i + ":" + j + ":" + k;
                        row.appendChild(cell);
                    }
                }
            }
        }
    }
}
