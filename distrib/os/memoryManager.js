var DOGES;
(function (DOGES) {
    var MemoryManager = (function () {
        function MemoryManager() {
        }
        MemoryManager.loadToMemory = function (userInput) {
            for (var i = 0; i < _Memory.memArray.length; i++) {
                if (i === 0) {
                    var currentCode = 0;
                }
                else {
                    currentCode += 3;
                }
                _Memory.memArray[i] = userInput.substring(currentCode, currentCode + 2);
                console.log(_Memory.memArray[i]);
            }
        };
        return MemoryManager;
    })();
    DOGES.MemoryManager = MemoryManager;
})(DOGES || (DOGES = {}));
