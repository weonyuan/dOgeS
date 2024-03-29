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
            // Override the base method pointers
            super(this.krnFsDriverEntry, this.krnFsISR);

            // Constants for the file system
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;

            // Total size (bytes) of a block
            this.blockSize = 64;
            this.dataLength = 120;

            // Bytes allocated for the block's meta
            this.metaSize = 4;
        }

        public krnFsDriverEntry(): void {
            // Initialization routine for this, the kernel-mode File System Device Driver
            this.status = "File system driver loaded.";
            this.displayFsLog();
        }

        public krnFsISR(params): void {

        }

        // Format the entire file system but retai
        public format(): void {
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var key: string = i.toString() + j.toString() + k.toString();
                        sessionStorage.setItem(key, this.initializeBlock());
                    }
                }
            }

            this.createMBR();
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
            this.driverEntry();
        }

        // Create the master boot record
        public createMBR(): void {
            // Then initialize the MBR
            var mbrKey = this.findFreeDirEntry();

            // MBR is allocated to 0:0:0 but pointers are '-'
            // to prevent other files overwriting this
            var mbrMeta = "1---";
            var mbrData = mbrMeta + "001100";

            this.writeData(mbrKey, mbrData);
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

        // Returns the next available block address in file entry
        public findFreeFileEntry(): string {
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

        // Returns the TSB address location of the filename in directory entry
        public findDirEntryByFilename(filename): string {
            var key = null;
            var data = null;
            var encodedFilename = this.encodeString(filename);

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

            // Then pad the string with 0s if necessary
            for (var j = encodedString.length; j < this.dataLength; j++) {
                encodedString += "0";
            }

            return encodedString;
        }

        // Decodes the string from hex to ASCII
        public decodeString(data): string {
            var decodedString = "";
            var hexPair = "";

            for (var i = this.metaSize; i < data.length; i++) {
                hexPair += data.charAt(i);
                if (hexPair.length % 2 === 0) {
                    // We've reached the end of the data
                    if (hexPair === "00") {
                        break;
                    } else {
                        // Decode the pair from hex to ASCII
                        decodedString += String.fromCharCode(parseInt(hexPair, 16));
                    }

                    hexPair = "";
                }
            }

            return decodedString;
        }

        // Used to determine whether to set the pointer null
        // or to the next block where the data surpasses its allocated size
        public defineAddressPointer(numChunks): string {
            if (numChunks <= 1) {
                return "---";
            } else {
                return this.findFreeFileEntry();
            }
        }

        //////////////////////////////////////////////////////////////////////////
        //                                                                      //
        // FILE OPERATIONS                                                      //
        //                                                                      //
        //////////////////////////////////////////////////////////////////////////
        public createFile(filename): any {
            var response = {
                "status": "ERROR",
                "header": ""
            };

            // Filename too big
            if (filename.length > this.blockSize - this.metaSize) {
                response.header = "The filename is too long.";
                return response;
            }

            // Directory entry is full
            if (this.findFreeDirEntry() === null) {
                response.header = "Directory entry is full. Cannot create file.";
                return response;
            }

            // File already exists
            if (this.findDirEntryByFilename(filename) !== null) {
                response.header = "There is already an existing file with this name.";
                return response;
            }

            var data = "1000" + filename;
            this.writeData(this.findFreeDirEntry(), data);

            this.displayFsLog();

            response.status = "SUCCESS";
            response.header = "Much success. Created file " + filename + ".";

            return response;
        }

        public readFile(filename): any {
            var response = {
                "status": "ERROR",
                "header": "",
                "body": ""
            };

            // First find the filename
            var dirEntryKey = this.findDirEntryByFilename(filename);

            // File does not exist
            if (dirEntryKey === null) {
                response.header = "Cannot read file " + filename + ". File does not exist.";
                return response;
            }

            // Then find the file in the directory entry
            var dirEntry = sessionStorage.getItem(dirEntryKey);

            // TSB of the file's data starting point
            var startFileKey = dirEntry.substring(1, this.metaSize);
            var startFile = sessionStorage.getItem(startFileKey);

            // TSB pointer to next data block of file
            // var startFileMeta = startFile.substring(1, this.metaSize);
            var fileEntryMeta = startFile.substring(1, this.metaSize);
            var data = this.decodeString(startFile);

            // Keep reading until we reach a null pointer
            while (fileEntryMeta !== "---") {
                var fileEntry = sessionStorage.getItem(fileEntryMeta);
                fileEntryMeta = fileEntry.substring(1, this.metaSize);
                data += this.decodeString(fileEntry);
            }

            response.status = "SUCCESS";
            response.header = "File " + filename + " successfully read.";
            response.body = data;

            return response;
        }

        // Write the data into the specified file
        public writeFile(filename, data): any {
            var response = {
                "status": "ERROR",
                "header": ""
            };

            var dataChunks: string[] = [];
            var chunkSize: number = this.blockSize - this.metaSize;
            var dirEntryKey: string = this.findDirEntryByFilename(filename);

            // File does not exist
            if (dirEntryKey === null) {
                response.header = "Cannot write file " + filename + " . File does not exist.";
                return response;
            }

            // Out of file entry blocks
            if (dataChunks.length > this.getNumFreeFileEntries()) {
                response.header = "Data too big. There is not enough free space on file system to write file.";
                return response;
            }

            var dirEntry: string = sessionStorage.getItem(dirEntryKey);
            var dirEntryMeta: string = dirEntry.substring(1, this.metaSize);

            // Data chunking process by 60 bytes
            for (var i = 0; i < (data.length / (this.blockSize - this.metaSize)); i++) {
                dataChunks.push(data.substring(i * chunkSize, (i + 1) * chunkSize));
            }

            // If data is not a multiple of the chunk size, push the remaining characters in
            if (data.length % chunkSize === 0) {
                dataChunks.push(data.substring(data.length % chunkSize, data.length));
            }

            // If TSB pointer is null or 000, data has not been written to the file yet
            if (dirEntryMeta === "---" || dirEntryMeta === "000") {
                // Allocate data blocks and store data there
                var startAddress = this.findFreeFileEntry();    // start point of file entry block
                var dirEntry = "1" + startAddress + dirEntry.substring(this.metaSize);
                dirEntryMeta = dirEntry.substring(1, this.metaSize);
                
                // Write to newly allocated file entry blocks until all data has been accounted for
                // Then allocate and add the new data in
                while (dataChunks.length > 0) {
                    sessionStorage.setItem(dirEntryMeta, "1");

                    var newKey = this.defineAddressPointer(dataChunks.length);
                    var newData = "1" + newKey + this.encodeString(dataChunks.splice(0, 1)[0]);

                    sessionStorage.setItem(dirEntryMeta, newData);

                    // Adjust the directory entry pointer
                    dirEntryMeta = newKey;
                }
                
                // Update the file's directory entry
                sessionStorage.setItem(dirEntryKey, dirEntry);
            } else {
                // File already has data stored, so overwrite the data
                var fileEntry: string = sessionStorage.getItem(dirEntryMeta);
                var fileEntryKey: string = fileEntry.substring(1, this.metaSize);

                // Clear the old data
                this.clearBlocks(fileEntryKey);

                // Then allocate and add the new data in
                while (dataChunks.length > 0) {
                    sessionStorage.setItem(dirEntryMeta, "1");

                    var newKey = this.defineAddressPointer(dataChunks.length);
                    var newData = "1" + newKey + this.encodeString(dataChunks.splice(0, 1)[0]);

                    sessionStorage.setItem(dirEntryMeta, newData);

                    // Adjust the directory entry pointer
                    dirEntryMeta = newKey;
                }
            }

            this.displayFsLog();

            response.status = "SUCCESS";
            response.header = "Data successfully written to file " + filename + ".";

            return response;
        }

        public deleteFile(filename): any {
            var response = {
                "status": "ERROR",
                "header": ""
            };

            // Look up the file through the directory entry first
            var dirEntryKey: string = this.findDirEntryByFilename(filename);

            // File does not exist
            if (dirEntryKey === null) {
                response.header = "Cannot delete file " + filename + ". File does not exist.";
                return response;
            }

            var dirEntry: string = sessionStorage.getItem(dirEntryKey);

            // Clear its data from the file entry
            var fileEntryKey: string = dirEntry.substring(1, this.metaSize);
            this.clearBlocks(fileEntryKey);

            // Then clear the file from directory entry
            sessionStorage.setItem(dirEntryKey, this.initializeBlock());

            this.displayFsLog();

            response.status = "SUCCESS";
            response.header = "Successfully deleted file " + filename + ".";

            return response;
        }

        // List all files stored in the directory entry
        public listFiles(): any {
            var response = {
                "status": "ERROR",
                "header": "",
                "body": []
            };

            // Iterate over directory entry
            for (var i = 0; i < this.sectors; i++) {
                for (var j = 1; j < this.blocks; j++) {
                    var key = "0" + i.toString() + j.toString();
                    var dirEntry = sessionStorage.getItem(key);

                    if (this.isUsed(dirEntry)) {
                        response.body.push(key + ": " + this.decodeString(dirEntry));
                    }
                }
            }

            response.status = "SUCCESS";
            response.header = "Successfully listed all files in the file system.";
            return response;
        }

        // Clear the specified block or a chain of block data
        public clearBlocks(key): void {
            while (key !== "---" && key !== "000") {
                var currentData: string = sessionStorage.getItem(key);
                var currentKey: string = key;
                key = currentData.substring(1, this.metaSize);
                sessionStorage.setItem(currentKey, this.initializeBlock());
            }
        }

        // Get the number of free file entry blocks
        // Kinda similar to getFreeFileEntry but this iterates through whole file system
        public getNumFreeFileEntries(): number {
            var key = null;
            var numEntries = 0;

            for (var i = 1; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        key = i.toString() + j.toString() + k.toString();

                        if (!this.isUsed(sessionStorage.getItem(key))) {
                            numEntries++;
                        }
                    }
                }
            }

            return numEntries;
        }

        // Write the encoded data into the specified TSB address
        public writeData(key, data): void {
            if (data !== undefined &&
                data !== null) {
                var encodedData = data.substring(0, this.metaSize);

                // Encode the data from ASCII to hex
                encodedData += this.encodeString(data.substring(this.metaSize));

                sessionStorage.setItem(key, encodedData);
            }
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
    }
}
