///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */
var DOGES;
(function (DOGES) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem(tracks, sectors, blocks, blockSize, dataLength, metaSize) {
            if (tracks === void 0) { tracks = 0; }
            if (sectors === void 0) { sectors = 0; }
            if (blocks === void 0) { blocks = 0; }
            if (blockSize === void 0) { blockSize = 0; }
            if (dataLength === void 0) { dataLength = 0; }
            if (metaSize === void 0) { metaSize = 0; }
            // Override the base method pointers
            _super.call(this, this.krnFsDriverEntry, this.krnFsISR);
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
            this.dataLength = dataLength;
            this.metaSize = metaSize;
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
        DeviceDriverFileSystem.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver
            this.status = "File system driver loaded.";
            this.displayFsLog();
        };
        DeviceDriverFileSystem.prototype.krnFsISR = function (params) {
        };
        DeviceDriverFileSystem.prototype.format = function () {
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var key = i.toString() + j.toString() + k.toString();
                        sessionStorage.setItem(key, this.initializeBlock());
                    }
                }
            }
            this.createMBR();
            this.displayFsLog();
        };
        // Initalize block data with zeroes
        DeviceDriverFileSystem.prototype.initializeBlock = function () {
            var data = "";
            for (var i = 0; i < this.dataLength + this.metaSize; i++) {
                data += "0";
            }
            return data;
        };
        // Initialize file system
        DeviceDriverFileSystem.prototype.init = function () {
            // Format the file system
            this.format();
            this.driverEntry();
        };
        // Create the master boot record
        DeviceDriverFileSystem.prototype.createMBR = function () {
            // Then initialize the MBR
            var mbrKey = this.findFreeDirEntry();
            // MBR is allocated to 0:0:0 but pointers are '-'
            // to prevent other files overwriting this
            var mbrMeta = "1---";
            var mbrData = mbrMeta + "001100";
            this.writeData(mbrKey, mbrData);
        };
        // Looks for the first bit in the meta section
        DeviceDriverFileSystem.prototype.isUsed = function (block) {
            var isUsed = false;
            if (block !== undefined && block !== null) {
                if (block.charAt(0) === "1") {
                    return true;
                }
            }
            return isUsed;
        };
        // Returns the next available block address in directory entry
        DeviceDriverFileSystem.prototype.findFreeDirEntry = function () {
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
        };
        // Returns the next available block address in file entry
        DeviceDriverFileSystem.prototype.findFreeFileEntry = function () {
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
        };
        // Returns the TSB address location of the filename in directory entry
        DeviceDriverFileSystem.prototype.findDirEntryByFilename = function (filename) {
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
        };
        // Encodes the provided string to hex
        DeviceDriverFileSystem.prototype.encodeString = function (data) {
            var encodedString = "";
            for (var i = 0; i < data.length; i++) {
                encodedString += data.charCodeAt(i).toString(16);
            }
            // Then pad the string with 0s if necessary
            for (var j = encodedString.length; j < this.dataLength; j++) {
                encodedString += "0";
            }
            return encodedString;
        };
        // Decodes the string from hex to ASCII
        DeviceDriverFileSystem.prototype.decodeString = function (data) {
            var decodedString = "";
            var hexPair = "";
            for (var i = this.metaSize; i < data.length; i++) {
                hexPair += data.charAt(i);
                if (hexPair.length % 2 === 0) {
                    // We've reached the end of the data
                    if (hexPair === "00") {
                        break;
                    }
                    else {
                        // Decode the pair from hex to ASCII
                        decodedString += String.fromCharCode(parseInt(hexPair, 16));
                    }
                    hexPair = "";
                }
            }
            console.log(decodedString);
            return decodedString;
        };
        // Used to determine whether to set the pointer null
        // or to the next block where the data surpasses its allocated size
        DeviceDriverFileSystem.prototype.defineAddressPointer = function (numChunks) {
            if (numChunks <= 1) {
                return "---";
            }
            else {
                return this.findFreeFileEntry();
            }
        };
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            var data = "1000" + filename;
            if (filename.length <= this.blockSize - this.metaSize) {
                this.writeData(this.findFreeDirEntry(), data);
            }
            else {
                console.log("error: filename too large.");
            }
            this.displayFsLog();
        };
        DeviceDriverFileSystem.prototype.readFile = function (filename) {
            // First find the filename
            var dirEntryKey = this.findDirEntryByFilename(filename);
            // Then find the file in the directory entry
            var dirEntry = sessionStorage.getItem(dirEntryKey);
            // TSB of the file's data starting point
            var startFileKey = dirEntry.substring(1, this.metaSize);
            var startFile = sessionStorage.getItem(startFileKey);
            // TSB pointer to next data block of file
            // var startFileMeta = startFile.substring(1, this.metaSize);
            var fileEntryMeta = startFile.substring(1, this.metaSize);
            // var fileEntryMeta = startFileMeta;
            var data = this.decodeString(startFile);
            // Keep reading until we reach a null pointer
            while (fileEntryMeta !== "---") {
                var fileEntry = sessionStorage.getItem(fileEntryMeta);
                console.log(fileEntry);
                fileEntryMeta = fileEntry.substring(1, this.metaSize);
                data += this.decodeString(fileEntry);
            }
            return data;
        };
        // Writes the data into the specified file
        DeviceDriverFileSystem.prototype.writeFile = function (filename, data) {
            var dataChunks = [];
            var chunkSize = this.blockSize - this.metaSize;
            var dirEntryKey = this.findDirEntryByFilename(filename);
            var dirEntry = sessionStorage.getItem(dirEntryKey);
            var dirEntryMeta = dirEntry.substring(1, this.metaSize);
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
                console.log("allocate new file blocks");
                // Allocate data blocks and store data there
                var startAddress = this.findFreeFileEntry(); // start point of file entry block
                var dirEntry = "1" + startAddress + dirEntry.substring(this.metaSize);
                // Write to newly allocated file entry blocks until all data has been accounted for
                // Then allocate and add the new data in
                while (dataChunks.length > 0) {
                    sessionStorage.setItem(dirEntryMeta, "1");
                    var newKey = this.defineAddressPointer(dataChunks.length);
                    console.log("newKey: " + newKey);
                    var newData = "1" + newKey + this.encodeString(dataChunks.splice(0, 1)[0]);
                    sessionStorage.setItem(dirEntryMeta, newData);
                    // Adjust the directory entry pointer
                    dirEntryMeta = newKey;
                }
                // Update the file's directory entry
                sessionStorage.setItem(dirEntryKey, dirEntry);
            }
            else {
                // File already has data stored, so overwrite the data
                var fileEntry = sessionStorage.getItem(dirEntryMeta);
                var fileEntryKey = fileEntry.substring(1, this.metaSize);
                // Clear the old data
                this.clearBlocks(fileEntryKey);
                // Then allocate and add the new data in
                while (dataChunks.length > 0) {
                    sessionStorage.setItem(dirEntryMeta, "1");
                    var newKey = this.defineAddressPointer(dataChunks.length);
                    console.log("newKey: " + newKey);
                    var newData = "1" + newKey + this.encodeString(dataChunks.splice(0, 1)[0]);
                    sessionStorage.setItem(dirEntryMeta, newData);
                    // Adjust the directory entry pointer
                    dirEntryMeta = newKey;
                }
            }
            this.displayFsLog();
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (filename) {
            var dirEntryKey = this.findDirEntryByFilename(filename);
            var dirEntry = sessionStorage.getItem(dirEntryKey);
            // Clear its data from the file entry
            var fileEntryKey = dirEntry.substring(1, this.metaSize);
            this.clearBlocks(fileEntryKey);
            // Then clear the file from directory entry
            sessionStorage.setItem(dirEntryKey, this.initializeBlock());
            this.displayFsLog();
        };
        DeviceDriverFileSystem.prototype.listFiles = function () {
            // Iterate over directory entry
            for (var i = 0; i < this.sectors; i++) {
                for (var j = 1; j < this.blocks; j++) {
                    var key = "0" + i.toString() + j.toString();
                    var dirEntry = sessionStorage.getItem(key);
                    if (this.isUsed(dirEntry)) {
                        _StdOut.putText(key + ": " + this.decodeString(dirEntry));
                        _StdOut.advanceLine();
                    }
                }
            }
        };
        DeviceDriverFileSystem.prototype.clearBlocks = function (key) {
            while (key !== "---" && key !== "000") {
                var currentData = sessionStorage.getItem(key);
                var currentKey = key;
                key = currentData.substring(1, this.metaSize);
                sessionStorage.setItem(currentKey, this.initializeBlock());
            }
        };
        // Writes the encoded data into the specified TSB address.
        DeviceDriverFileSystem.prototype.writeData = function (key, data) {
            if (data !== undefined &&
                data !== null) {
                var encodedData = data.substring(0, this.metaSize);
                // Encode the data from ASCII to hex
                encodedData += this.encodeString(data.substring(this.metaSize));
                sessionStorage.setItem(key, encodedData);
            }
        };
        // Display the file system log
        DeviceDriverFileSystem.prototype.displayFsLog = function () {
            var fsHTML = document.getElementById("fsContent");
            fsHTML.innerHTML = "";
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var currentKey = i.toString() + j.toString() + k.toString();
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
        };
        return DeviceDriverFileSystem;
    })(DOGES.DeviceDriver);
    DOGES.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(DOGES || (DOGES = {}));
