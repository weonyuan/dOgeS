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

        public krnFsDriverEntry(): void {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "File system driver loaded.";
            this.displayFsLog();
        }

        public krnFsISR(params): void {

        }

        public format(): void {
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var key: string = i + ":" + j + ":" + k;
                        sessionStorage.setItem(key, this.initializeBlock());
                    }
                }
            }
        }

        // Initialize file system
        public init(): void {
            // Format the file system
            this.format();

            // Then initialize the MBR
            var mbrKey = "0:0:0";
            var mbrMeta = "1---";
            var mbrData = mbrMeta + "001100";
            
            this.writeData(mbrKey, mbrData)

            this.driverEntry();
        }

        // Initalize block data with zeroes
        public initializeBlock(): string {
            var data: string = "";
            for (var i = 0; i < this.blockSize; i++) {
                data += "0";
            }

            return data;
        }

        public writeData(key, data): void {
            if (data !== undefined &&
                data !== null) {
                var encodedData = data.substring(0, this.metaSize);

                // Encode the data from ASCII to hex
                for (var j = this.metaSize; j < data.length; j++) {
                    encodedData += data.charCodeAt(j).toString(16);
                }

                // Then pad the data if necessary
                if (encodedData.length < this.blockSize) {
                    for (var i = encodedData.length - 1; i < this.blockSize; i++) {
                        encodedData += "0";
                    }
                }

                sessionStorage.setItem(key, encodedData);
            }
        }

        // Display the file system log
        public displayFsLog(): void {
            var hdHTML = document.getElementById("fsTable");
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var currentKey = i + ":" + j + ":" + k;
                        var currentData = sessionStorage.getItem(currentKey);

                        var row = document.createElement("tr");
                        document.getElementById("fsTable").appendChild(row);

                        var cell = document.createElement("td");
                        cell.className = "fs-tsb";
                        cell.textContent = currentKey;
                        row.appendChild(cell);

                        var cell = document.createElement("td");
                        cell.className = "fs-meta";
                        cell.textContent = currentData.substring(0, this.metaSize);
                        row.appendChild(cell);

                        var cell = document.createElement("td");
                        cell.className = "fs-data";
                        cell.textContent = currentData.substring(this.metaSize, this.blockSize);
                        row.appendChild(cell);
                    }
                }
            }
        }

        public findFreeBlock(): void {

        }

        public createFile(filename): void {
            console.log('createFile ' + filename);
            // sessionStorage.setItem
        }

        public readFile(filename): void {

        }

        public writeFile(filename): void {

        }

        public deleteFile(filename): void {

        }
    }
}
