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
            // Override the base method pointers.
            _super.call(this, this.krnFsDriverEntry, this.krnFsISR);
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
            this.dataLength = dataLength;
            this.metaSize = metaSize;
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
        DeviceDriverFileSystem.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
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
            // Then initialize the MBR
            var mbrKey = this.findFreeDirEntry();
            // MBR is allocated to 0:0:0 but pointers are '-'
            // to prevent other files overwriting this
            var mbrMeta = "1---";
            var mbrData = mbrMeta + "001100";
            this.writeData(mbrKey, mbrData);
            this.driverEntry();
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
        // Returns the next available block address in data entry
        DeviceDriverFileSystem.prototype.findFreeDataEntry = function () {
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
        DeviceDriverFileSystem.prototype.findFreeBlock = function () {
        };
        // Returns the TSB address location of the filename
        DeviceDriverFileSystem.prototype.findFile = function (filename) {
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
        };
        // Encodes the provided string to hex
        DeviceDriverFileSystem.prototype.encodeString = function (data) {
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
        // Used to determine whether to set the pointer null
        // or to the next block where the data surpasses its allocated size
        DeviceDriverFileSystem.prototype.defineAddressPointer = function (data) {
            if (data.length <= (this.blockSize - this.metaSize)) {
                return "---";
            }
            else {
                return this.findFreeDataEntry();
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
        };
        // Writes the data into the specified file.
        DeviceDriverFileSystem.prototype.writeFile = function (filename, data) {
            var length = data.length;
            while (length / (this.blockSize - this.metaSize) > 0) {
                var newKey = this.findFreeDataEntry();
                var newData = "1" + this.defineAddressPointer(data) + this.encodeString(data);
                sessionStorage.setItem(newKey, newData);
                length -= this.blockSize - this.metaSize;
            }
            this.displayFsLog();
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (filename) {
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
        return DeviceDriverFileSystem;
    })(DOGES.DeviceDriver);
    DOGES.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(DOGES || (DOGES = {}));
