module DOGES {
  export class MemoryManager {
    constructor() {}

    public static loadToMemory(userInput): void {
      for (var i = 0; i < _Memory.memArray.length; i++) {
        if (i === 0) {
          var currentCode: number = 0;
        } else {
          currentCode += 3;
        }
        _Memory.memArray[i] = userInput.substring(currentCode, currentCode + 2);
        console.log(_Memory.memArray[i]);
      }
    }
  }
}