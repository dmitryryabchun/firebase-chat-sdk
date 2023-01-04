export function splitIntoChunks<T>(arr: T[]): T[][] {
    const portion = 10;
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += portion) {
        let chunk;
        chunk = arr.slice(i, i + portion);
        chunks.push(chunk);
    }
    return chunks;
}