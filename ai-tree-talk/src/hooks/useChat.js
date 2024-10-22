// src/hooks/useChat.js
import { useState } from 'react';
import axios from 'axios';

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null); // 用于存储错误信息
  const API_BASE = 'https://api.lingyiwanwu.com/v1';
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY; // 从环境变量中提取 API 密钥

  const sendMessage = async (content) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content },
    ]);
    setError(null); // 清除之前的错误信息

    try {
      const response = await axios.post(
        `${API_BASE}/chat/completions`,
        {
          model: 'yi-lightning', // 替换为你选择的模型
          messages: [...messages, { role: 'user', content }],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        const aiMessage = response.data.choices[0].message; // 提取 AI 消息
        setMessages((prevMessages) => [
          ...prevMessages,
          aiMessage,
        ]);
      } else {
        throw new Error('No choices found in the response.');
      }
    } catch (error) {
      // 捕获错误并设置错误状态
      console.error('Error sending message:', error);
      setError('Failed to get a response from the AI. Please try again later.');
    }
  };

  return { messages, sendMessage, error }; // 返回 error 信息
};

export default useChat;
