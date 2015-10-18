var DOGES;
(function (DOGES) {
    var Pcb = (function () {
        function Pcb(PC, Acc, Xreg, Yreg, Zflag, PID) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (PID === void 0) { PID = _PID++; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.PID = PID;
        }
        return Pcb;
    })();
    DOGES.Pcb = Pcb;
})(DOGES || (DOGES = {}));
