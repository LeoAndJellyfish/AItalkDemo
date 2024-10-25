import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Node,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from "axios";
import { useCallback, useState } from 'react';
import { edgeTypes, initialEdges } from './edges';
import { initialNodes, nodeTypes } from './nodes';

let nid = 1;
const getId = () => ++nid;
var lastnode = {
  id: '1', 
  position:{x:50,y:70},
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [input, setInput] = useState("");// 用户输入
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;  // 获取apiKey
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const handleNodeClick = (event:any, node: Node) => {// TODO: 更改样式
    if(node.id){// 更新 lastId 为当前选中节点的 ID(根节点除外，添加到id1的节点)
      lastnode.id = node.id;
      lastnode.position = node.position;
    }
    else{
      lastnode.id = '1';
      lastnode.position = { x: 50, y: 70 };
    }
  };

  const addNewEdge = (source: string, target: string) => {
    const newEdge = {
      id: `${source}->${target}`, // 边的唯一 ID
      source, // 源节点 ID
      target, // 目标节点 ID
    };
    setEdges((eds) => addEdge(newEdge, eds)); // 添加新边
  };

  const addNode = (position: { x: number; y: number }, data: { label: string }) => {
    let tmpid = getId();
    const newNode = {
      id: `${tmpid}`, 
      type: 'default',
      position,
      data,
    };
    setNodes((nds) => nds.concat(newNode));
    addNewEdge(lastnode.id, `${tmpid}`);
    lastnode = newNode;
  };

  // 发送消息并获取 AI 回复
  const sendMessage = async () => {
    if (input.trim() === "") return;  // 防止发送空消息

    addNode({ x: lastnode.position.x, y: lastnode.position.y+70 },{ label: `User:${input}` })// 添加用户节点
    // 构建请求体
    const data = {
        model: "yi-lightning",
        messages: [{ role: "user", content: input }],// TODO: 将之前的消息包含在内
        temperature: 0.3,  // 控制回复的创造性
    };
    setInput("");// 清空输入框
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
        addNode({ x: lastnode.position.x, y: lastnode.position.y+70 },{ label: `AI:${aiReply}` })// 添加 AI 节点
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
        onNodeDoubleClick={handleNodeClick}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
        <Panel position="bottom-center">
          <input 
            id="user-input" 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your message..." 
          />
          <button id="send-btn" onClick={sendMessage}>Send</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
