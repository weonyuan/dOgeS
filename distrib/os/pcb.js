var DOGES;
(function (DOGES) {
    var Pcb = (function () {
        function Pcb(PC, Acc, Xreg, Yreg, Zflag, PID, base, Limit) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (PID === void 0) { PID = _PID++; }
            if (base === void 0) { base = 0; }
            if (Limit === void 0) { Limit = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.PID = PID;
            this.base = base;
            this.Limit = Limit;
        }
        return Pcb;
    })();
    DOGES.Pcb = Pcb;
})(DOGES || (DOGES = {}));
