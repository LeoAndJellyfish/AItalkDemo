import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from "axios";
import { useCallback, useRef, useState } from 'react';
import { edgeTypes, initialEdges } from './edges';
import { initialNodes, nodeTypes } from './nodes';

let nid = 1;

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [input, setInput] = useState("");
  const lastNodeRef = useRef<Node>(initialNodes[1]); // 使用 useRef 存储最后节点
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const reactFlowInstance = useReactFlow();
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );
  const getId = () => `${++nid}`;
  // 点击节点时，将当前节点设置为“最后节点”
  const handleNodeClick = useCallback((_event: any, node: Node) => {
    lastNodeRef.current = node; // 更新 lastNodeRef
  }, []);

  // 添加新的节点并自动连接到当前“最后节点”，然后更新为新节点
  const addNode = useCallback((position: { x: number; y: number }, label: string) => {
    const currentLastNode = lastNodeRef.current; // 获取当前的 lastNode
    const newNode = {
      id: getId(),
      type: 'default',
      position,
      data: { label },
    };
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges({ id: `${currentLastNode.id}->${newNode.id}`, source: currentLastNode.id, target: newNode.id });
    lastNodeRef.current = newNode; // 更新 lastNodeRef 为新添加的节点
  }, [setNodes, setEdges]);

  // 发送消息并获取 AI 回复
  const sendMessage = async () => {
    if (input.trim() === "") return;

    // 添加用户消息节点
    addNode({ x: lastNodeRef.current.position.x, y: lastNodeRef.current.position.y + 70 }, `User: ${input}`);

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
      addNode({ x: lastNodeRef.current.position.x, y: lastNodeRef.current.position.y + 70 }, `AI: ${aiReply}`);

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
