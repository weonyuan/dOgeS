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
        function DeviceDriverFileSystem(tracks, sectors, blocks, blockSize, metaSize) {
            if (tracks === void 0) { tracks = 0; }
            if (sectors === void 0) { sectors = 0; }
            if (blocks === void 0) { blocks = 0; }
            if (blockSize === void 0) { blockSize = 0; }
            if (metaSize === void 0) { metaSize = 0; }
            // Override the base method pointers.
            _super.call(this, this.krnFsDriverEntry, this.krnFsISR);
            this.tracks = tracks;
            this.sectors = sectors;
            this.blocks = blocks;
            this.blockSize = blockSize;
            this.metaSize = metaSize;
            // Constants for the file system.
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            // Total size (bytes) of a block.
            this.blockSize = 64;
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
                        var key = i + ":" + j + ":" + k;
                        sessionStorage.setItem(key, this.initalizeBlock());
                    }
                }
            }
        };
        // Initalize block data with zeroes
        DeviceDriverFileSystem.prototype.initalizeBlock = function () {
            var data = "";
            for (var i = 0; i < this.blockSize; i++) {
                data += "0";
            }
            return data;
        };
        // Display the file system log
        DeviceDriverFileSystem.prototype.displayFsLog = function () {
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
        };
        return DeviceDriverFileSystem;
    })(DOGES.DeviceDriver);
    DOGES.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(DOGES || (DOGES = {}));
