/* ------------
   Interrupt.ts
   ------------ */
var DOGES;
(function (DOGES) {
    var Interrupt = (function () {
        function Interrupt(irq, params) {
            this.irq = irq;
            this.params = params;
        }
        return Interrupt;
    })();
    DOGES.Interrupt = Interrupt;
})(DOGES || (DOGES = {}));
