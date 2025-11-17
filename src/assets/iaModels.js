export const IA_MODELS = {
    openaiEmbeddings: {
        ['3']: {
            // Preço: 0.02
            // Tamanho do vetor: 1536
            small: 'text-embedding-3-small',

            // Preço: 0.13
            // Tamanho do vetor: 3072
            large: 'text-embedding-3-large'
        }
    },
    gpt: {
        // GPT 5.1
        // Janela de contexto: 400.000 tokens
        // Saída máxima: 128.000 tokens
        // Suporte a tokens de raciocínio
        ['5.1']: {
            // GPT 5.1 Padrão
            // Raciocínio: 4
            // Velocidade: 4
            // Preço: 1.25 / 10.00
            // Entrada: texto e imagem
            // Saída: texto e imagem
            // Limite de conhecimento: 30/09/24
            // Tarefas de codificação e de interação com agentes, com esforço configurável para raciocínio e não raciocínio.
            nano: 'gpt-5.1-2025-11-13',
        },

        // GPT 5
        // Janela de contexto: 400.000 tokens
        // Saída máxima: 128.000 tokens
        // Suporte a tokens de raciocínio
        ['5']: {
            // GPT 5 Nano
            // Raciocínio: 2
            // Velocidade: 5
            // Preço: 0.05 / 0.40
            // Entrada: texto e imagem
            // Saída: texto
            // Limite de conhecimento: 31/05/24
            // Excelente para tarefas de sumarização e classificação.
            nano: 'gpt-5-nano-2025-08-07',

            // GPT 5 Mini
            // Raciocínio: 3
            // Velocidade: 4
            // Preço: 0.25 / 2.00
            // Entrada: texto e imagem
            // Saída: texto
            // Limite de conhecimento: 31/05/24
            // Tarefas bem definidas e instruções precisas.
            mini: 'gpt-5-mini-2025-08-07',

            // GPT 5 Padrão
            // Raciocínio: 4
            // Velocidade: 3
            // Preço: 1.25 / 10.00
            // Entrada: texto e imagem
            // Saída: texto
            // Limite de conhecimento: 30/09/24
            // Modelo anterior para tarefas de codificação, raciocínio e agência em diversos domínios.
            default: 'gpt-5-2025-08-07'
        },

        // GPT 4.1
        // Janela de contexto: 1.047.576 tokens
        // Saída máxima: 32.768 tokens
        ['4.1']: {
            // GPT 4.1 Nano
            // Inteligência: 2
            // Velocidade: 5
            // Preço: 0.10 / 0.40
            // Entrada: texto e imagem
            // Saída: texto
            // Limite de conhecimento: 01/06/24
            // Se destaca no seguimento de instruções e na chamada de ferramentas.
            nano: 'gpt-4.1-nano-2025-04-14',

            // GPT 4.1 Mini
            // Inteligência: 3
            // Velocidade: 4
            // Preço: 0.40 / 1.60
            // Entrada: texto e imagem
            // Saída: texto
            // Limite de conhecimento: 31/05/24
            // Se destaca no seguimento de instruções e na chamada de ferramentas.
            mini: 'gpt-4.1-mini-2025-04-14',

            // GPT 4.1 Padrão
            // Inteligência: 4
            // Velocidade: 3
            // Preço: 2.00 / 8.00
            // Entrada: texto e imagem
            // Saída: texto
            // Limite de conhecimento: 31/05/24
            // Se destaca no seguimento de instruções e na chamada de ferramentas.
            default: 'gpt-4.1-2025-04-14'
        }
    }
}