module DOGES {
  
    export class Memory {

        constructor(public bytes: number = MEMORY_SIZE,
                    public memArray: Array<string> = new Array(bytes),
                    public base: number = 0,
                    public limit: number = MEMORY_SIZE - 1) {

        }

        public init(): void {
            for (var i = 0; i < this.memArray.length; i++) {
                this.memArray[i] = "00";
            }
        }
    }
}