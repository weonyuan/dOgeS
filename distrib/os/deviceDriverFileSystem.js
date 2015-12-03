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
        function DeviceDriverFileSystem() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry);
        }
        DeviceDriverFileSystem.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "File system driver loaded";
            // More?
        };
        return DeviceDriverFileSystem;
    })(DOGES.DeviceDriver);
    DOGES.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(DOGES || (DOGES = {}));
