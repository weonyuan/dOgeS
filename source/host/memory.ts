module DOGES {
  
    export class Memory {

        constructor(public bytes: number = 256,
                    public memArray: Array<string> = new Array(bytes)) {

        }

        public init(): void {
            for (var i = 0; i < this.memArray.length; i++) {
                this.memArray[i] = "00";
            }
            console.log(this.memArray);
        }
    }
}