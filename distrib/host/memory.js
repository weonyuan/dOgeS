var DOGES;
(function (DOGES) {
    var Memory = (function () {
        function Memory(bytes, memArray) {
            if (bytes === void 0) { bytes = 256; }
            if (memArray === void 0) { memArray = new Array(bytes); }
            this.bytes = bytes;
            this.memArray = memArray;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.memArray.length; i++) {
                this.memArray[i] = "00";
            }
        };
        return Memory;
    })();
    DOGES.Memory = Memory;
})(DOGES || (DOGES = {}));
