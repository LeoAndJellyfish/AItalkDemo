import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY; // 从环境变量中获取 API 密钥
const API_URL = 'https://api.lingyiwanwu.com/v1/chat/completions';

async function chatWithAI(message:string) {
    try {
        // 构造请求的body
        const messages = [
            {"role": "user", "content": message}
        ]
        
        // 发送请求到第三方API
        const payload = {
            "model": 'yi-lightening',
            "messages": messages
        }
        const headers = {
            'Authorization': 'Bearer'+API_KEY,
            'Content-Type': 'application/json'
        }
        const response = await axios.post(API_URL, payload, {headers})

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('调用API时出错:', error);
        throw error;
    }
}

export { chatWithAI };
