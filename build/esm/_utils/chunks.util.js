export function splitIntoChunks(arr) {
    var portion = 10;
    var chunks = [];
    for (var i = 0; i < arr.length; i += portion) {
        var chunk = void 0;
        chunk = arr.slice(i, i + portion);
        chunks.push(chunk);
    }
    return chunks;
}
