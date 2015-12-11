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
                    public dataLength: number = 0,
                    public metaSize: number = 0) {
            // Override the base method pointers.
            super(this.krnFsDriverEntry, this.krnFsISR);

            // Constants for the file system.
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;

            // Total size (bytes) of a block.
            this.blockSize = 64;
            this.dataLength = 120;

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
                        var key: string = i.toString() + j.toString() + k.toString();
                        sessionStorage.setItem(key, this.initializeBlock());
                    }
                }
            }

            this.displayFsLog();
        }

        // Initalize block data with zeroes
        public initializeBlock(): string {
            var data: string = "";
            for (var i = 0; i < this.dataLength + this.metaSize; i++) {
                data += "0";
            }

            return data;
        }

        // Initialize file system
        public init(): void {
            // Format the file system
            this.format();

            // Then initialize the MBR
            var mbrKey = this.findFreeDirEntry();

            // MBR is allocated to 0:0:0 but pointers are '-'
            // to prevent other files overwriting this
            var mbrMeta = "1---";
            var mbrData = mbrMeta + "001100";
            
            this.writeData(mbrKey, mbrData);

            this.driverEntry();
        }

        // Looks for the first bit in the meta section
        public isUsed(block): boolean {
            var isUsed = false;

            if (block !== undefined && block !== null) {
                if (block.charAt(0) === "1") {
                    return true;
                }
            }

            return isUsed;
        }

        // Returns the next available block address in directory entry
        public findFreeDirEntry(): string {
            var key = null;
            for (var i = 0; i < this.sectors; i++) {
                for (var j = 0; j < this.blocks; j++) { 
                    key = "0" + i.toString() + j.toString();
                    
                    if (!this.isUsed(sessionStorage.getItem(key))) {
                        return key;
                        break;
                    }
                }
            }
        }

        // Returns the next available block address in data entry
        public findFreeDataEntry(): string {
            var key = null;
            for (var i = 1; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        key = i.toString() + j.toString() + k.toString();

                        if (!this.isUsed(sessionStorage.getItem(key))) {
                            return key;
                            break;
                        }
                    }
                }
            }
        }

        public findFreeBlock(): void {

        }

        // Returns the TSB address location of the filename
        public findFile(filename): string {
            var key = null;
            var data = null;
            var encodedFilename = this.encodeString(filename);

            console.log("encodedFilename: " + encodedFilename);
            for (var i = 0; i < this.sectors; i++) {
                for (var j = 0; j < this.blocks; j++) {
                    key = "0" + i.toString() + j.toString();
                    data = sessionStorage.getItem(key).substring(this.metaSize);

                    // Keep iterating through the directory entry until
                    // we find a filename match in the file system
                    if (data === encodedFilename) {
                        return key;
                        break;
                    }
                    console.log(key);
                }
            }

            return null;
        }

        // Encodes the provided string to hex
        public encodeString(data): string {
            var encodedString = "";

            for (var i = 0; i < data.length; i++) {
                encodedString += data.charCodeAt(i).toString(16);
            }

            console.log(encodedString.length);

            // Then pad the string with 0s if necessary
            for (var j = encodedString.length; j < this.dataLength; j++) {
                encodedString += "0";
            }

            console.log(encodedString);
            return encodedString;
        }

        // Display the file system log
        public displayFsLog(): void {
            var fsHTML = document.getElementById("fsContent");
            fsHTML.innerHTML = "";

            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var currentKey: string = i.toString() + j.toString() + k.toString();
                        var currentData = sessionStorage.getItem(currentKey);

                        var row = document.createElement("tr");
                        fsHTML.appendChild(row);

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
                        cell.textContent = currentData.substring(this.metaSize);
                        row.appendChild(cell);
                    }
                }
            }
        }

        // Used to determine whether to set the pointer null
        // or to the next block where the data surpasses its allocated size
        public defineAddressPointer(data): string {
            if (data.length <= (this.blockSize - this.metaSize)) {
                return "---";
            } else {
                return this.findFreeDataEntry();
            }
        }

        public createFile(filename): void {
            var data = "1000" + filename;
            if (filename.length <= this.blockSize - this.metaSize) {
                this.writeData(this.findFreeDirEntry(), data);
            } else {
                console.log("error: filename too large.");                
            }

            this.displayFsLog();
        }

        public readFile(filename): void {

        }

        // Writes the data into the specified file.
        public writeFile(filename, data): void {
            var length = data.length;
            while (length / (this.blockSize - this.metaSize) > 0) {
                var newKey = this.findFreeDataEntry();
                var newData = "1" + this.defineAddressPointer(data) + this.encodeString(data);

                sessionStorage.setItem(newKey, newData);
                length -= this.blockSize - this.metaSize;
            }
            
            this.displayFsLog();
        }

        public deleteFile(filename): void {

        }

        // Writes the encoded data into the specified TSB address.
        public writeData(key, data): void {
            if (data !== undefined &&
                data !== null) {
                var encodedData = data.substring(0, this.metaSize);

                // Encode the data from ASCII to hex
                encodedData += this.encodeString(data.substring(this.metaSize));

                sessionStorage.setItem(key, encodedData);
            }
        }
    }
}
