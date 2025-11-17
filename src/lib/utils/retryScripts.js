export async function withRetry(fn, {
    retries = 3,
    baseDelay = 500,       
    factor = 2,            
    retryOn = []         
} = {}){
    let attempt = 0;
    while(attempt <= retries) {
        try {
            return await fn();
        } catch(err) {
            const shouldRetry =
                retryOn.length === 0 ||
                retryOn.includes(err?.status) ||
                retryOn.includes(err?.code);
            if(!shouldRetry || attempt === retries) {
                throw err;
            }
            const delay = baseDelay * Math.pow(factor, attempt);
            console.warn(`Tentativa ${attempt + 1} falhou. Retentando em ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            attempt++;
        }
    }
}