module DOGES {
  
  export class Pcb {
    constructor(public PC: number = 0,
                public Acc: number = 0,
                public Xreg: number = 0,
                public Yreg: number = 0,
                public Zflag: number = 0,
                public PID: number = _PID++,
                public base: number = 0,
                public limit: number = 0,
                public state: number = PS_NEW,
                public turnaround: number = 0,
                public waiting: number = 0,
                public inFileSystem: boolean = false,
                public priority: number = DEFAULT_PRIORITY) {
    }
  }
}