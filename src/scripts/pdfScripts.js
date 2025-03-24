import * as pdfjsLib from 'pdfjs-dist';

// 📌 Certifique-se de que o worker está no diretório correto (`public/pdfWorker/pdf.worker.mjs`)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfWorker/pdf.worker.mjs';

export async function extractTextFromPDF(arrayBuffer) {
    if (!arrayBuffer) return;

    try {
        // 📌 Garante que o PDF.js receba um ArrayBuffer corretamente
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `${pageText}\n`;
        }

        return fullText;
    } catch (error) {
        console.error('Erro ao processar o PDF:', error);
        return null;
    }
}
