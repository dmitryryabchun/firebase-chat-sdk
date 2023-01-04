"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitIntoChunks = void 0;
function splitIntoChunks(arr) {
    var portion = 10;
    var chunks = [];
    for (var i = 0; i < arr.length; i += portion) {
        var chunk = void 0;
        chunk = arr.slice(i, i + portion);
        chunks.push(chunk);
    }
    return chunks;
}
exports.splitIntoChunks = splitIntoChunks;
