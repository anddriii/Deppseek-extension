import axios from 'axios';

export async function queryDeepseek(prompt: string) {
    try {
        const response = await axios({
            method: 'post',
            url: 'http://localhost:11434/api/generate',
            data: {
                model: 'deepseek-r1:8b',
                prompt: prompt,
            },
            responseType: 'stream' // Menangani streaming response
        });

        let fullResponse = '';
        
        return new Promise<string>((resolve, reject) => {
            response.data.on('data', (chunk: Buffer) => {
                const dataStr = chunk.toString().trim();
                try {
                    const jsonData = JSON.parse(dataStr);
                    if (jsonData.response) {
                        fullResponse += jsonData.response;
                    }
                    if (jsonData.done) {
                        resolve(fullResponse);
                    }
                } catch (error) {
                    console.error('Error parsing Deepseek response:', error);
                }
            });

            response.data.on('end', () => {
                resolve(fullResponse || 'No response from AI');
            });

            response.data.on('error', (error: any) => {
                reject('Error fetching AI response: ' + error.message);
            });
        });

    } catch (error) {
        console.error('Error querying Deepseek:', error);
        return 'Error fetching AI response';
    }
}
