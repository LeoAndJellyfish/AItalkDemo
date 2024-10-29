import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from "axios";
import { useCallback, useRef, useState } from 'react';
import { edgeTypes, initialEdges } from './edges';
import { initialNodes, nodeTypes } from './nodes';

var nid = 1;

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [input, setInput] = useState("");
  const currentLastNode = useRef(initialNodes[1]);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const getId = () => `${++nid}`;
  // 点击节点时，将当前节点设置为“最后节点”
  const handleNodeClick = useCallback((_event: any, node: Node) => {
    if(node.id!=='0')currentLastNode.current = node;
  }, []);
  const onNodeDragStop = useCallback((_event: any, node: Node) => {
    if(currentLastNode.current.id===node.id) currentLastNode.current=node; // 更新当前最后节点为移动后的节点
  }, []);
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((oldEdges) => addEdge(connection, oldEdges));
    },
    [setEdges],
  );
  // 添加新的节点并自动连接到当前“最后节点”，然后更新为新节点
  const addNode = useCallback((position: { x: number; y: number }, label: string,sourse?:string) => {
    const newNode = {
      id: getId(),
      type: 'default',
      position,
      data: { label },
    };
    setNodes((oldNodes) => [...oldNodes, newNode]);
    const sourseId = sourse || currentLastNode.current.id;
    setEdges((oldEdges) => addEdge({ id: `${sourseId}->${newNode.id}`, source: sourseId, target: newNode.id }, oldEdges));
    currentLastNode.current = newNode;
    return newNode;
  }, [setNodes, setEdges, getId, currentLastNode]);

  // 发送消息并获取 AI 回复
  const sendMessage = async () => {
    if (input.trim() === "") return;
    // 添加用户消息节点
    const userMessageNode = addNode({ x: currentLastNode.current.position.x, y: currentLastNode.current.position.y + 70 }, `User: ${input}`);

    setInput(""); // 清空输入框

    // 构建请求体
    const data = {
      model: "yi-lightning",
      messages: [{ role: "user", content: input }],
      temperature: 0.3,
      max_tokens: 100,
    };

    try {
      // 调用 Lingyi Wanwu API
      const response = await axios.post(
        "https://api.lingyiwanwu.com/v1/chat/completions",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
        }
      );

      const aiReply = response.data.choices[0].message.content.trim();
      // 添加 AI 回复节点
      addNode({ x: userMessageNode.position.x, y: userMessageNode.position.y + 70 }, `AI: ${aiReply}`, userMessageNode.id);

    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  return(
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onNodeDoubleClick={handleNodeClick}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
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
  );
}
 





export default function App() {
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}
