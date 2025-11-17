export async function processInBatches(array, batchSize, callback) {
    const results = [];
    for(let i = 0; i < array.length; i += batchSize) {
        const batch = array.slice(i, i + batchSize);
        const result = await callback(batch, i / batchSize + 1);
        results.push(result);
    }
    return results;
}