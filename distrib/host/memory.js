var DOGES;
(function (DOGES) {
    var Memory = (function () {
        function Memory(bytes, memArray, base, limit) {
            if (bytes === void 0) { bytes = MEMORY_SIZE; }
            if (memArray === void 0) { memArray = new Array(bytes); }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = MEMORY_SIZE - 1; }
            this.bytes = bytes;
            this.memArray = memArray;
            this.base = base;
            this.limit = limit;
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
