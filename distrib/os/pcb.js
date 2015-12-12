var DOGES;
(function (DOGES) {
    var Pcb = (function () {
        function Pcb(PC, Acc, Xreg, Yreg, Zflag, PID, base, limit, state, turnaround, waiting, inFileSystem, priority) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (PID === void 0) { PID = _PID++; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            if (state === void 0) { state = PS_NEW; }
            if (turnaround === void 0) { turnaround = 0; }
            if (waiting === void 0) { waiting = 0; }
            if (inFileSystem === void 0) { inFileSystem = false; }
            if (priority === void 0) { priority = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.PID = PID;
            this.base = base;
            this.limit = limit;
            this.state = state;
            this.turnaround = turnaround;
            this.waiting = waiting;
            this.inFileSystem = inFileSystem;
            this.priority = priority;
        }
        return Pcb;
    })();
    DOGES.Pcb = Pcb;
})(DOGES || (DOGES = {}));
