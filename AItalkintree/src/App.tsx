import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from "axios";
import { useCallback, useState } from 'react';
import { edgeTypes, initialEdges } from './edges';
import { initialNodes, nodeTypes } from './nodes';

// 定义 Message 类型
type Message = {
  role: string;  // 角色（user 或 assistant）
  content: string; // 消息内容
};

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );
  const [messages, setMessages] = useState<Message[]>([]); // 用于存储聊天记录
  const [input, setInput] = useState("");// 用户输入
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;  // 获取apiKey

  // 发送消息并获取 AI 回复
  const sendMessage = async () => {
    if (input.trim() === "") return;  // 防止发送空消息

    // 构建请求体
    const data = {
        model: "yi-large",
        messages: [
            ...messages,  // 将之前的消息包含在内
            { role: "user", content: input }  // 新用户消息
        ],
        temperature: 0.3,  // 控制回复的创造性
    };

    try {
        // 调用 Lingyi Wanwu API
        const response = await axios.post(
            "https://api.lingyiwanwu.com/v1/chat/completions",
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`, // 使用 API 密钥
                },
            }
        );

        // 获取 AI 的回复
        const aiReply = response.data.choices[0].message.content.trim();

        // 更新消息列表
        setMessages([...messages, { role: "user", content: input }, { role: "assistant", content: aiReply }]);

        // 清空输入框
        setInput("");
    } catch (error) {
        console.error("Error fetching AI response:", error);
    }
  };


  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
      <div id="chat-box" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <input 
          id="user-input" 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type your message..." 
        />
        <button id="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
