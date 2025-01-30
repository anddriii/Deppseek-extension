import axios from 'axios';

export async function queryDeepseek(prompt: string) {
    try {
        const startTime = Date.now();
        const response = await axios({
            method: 'post',
            url: 'http://localhost:11434/api/generate',
            data: {
                model: 'deepseek-r1:8b',
                prompt: prompt,
            },
            responseType: 'stream'
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
                        const endTime = Date.now(); // Waktu selesai response
                        const elapsedTime = (endTime - startTime) / 1000; // Dalam detik
                        console.log(`Response time: ${elapsedTime.toFixed(2)} seconds`);
                        resolve(fullResponse);
                    }
                } catch (error) {
                    console.error('Error parsing Deepseek response:', error);
                }
            });

            response.data.on('end', () => {
                const endTime = Date.now();
                const elapsedTime = (endTime - startTime) / 1000;
                console.log(`Response time: ${elapsedTime.toFixed(2)} seconds`);
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
