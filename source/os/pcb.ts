module DOGES {
  
  export class Pcb {
    constructor(public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0,
                public pid: number = _PID++) {
    }
  }
}