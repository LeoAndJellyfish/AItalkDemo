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
const getId = () => `${++nid}`;

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [input, setInput] = useState("");
  const [lastNode, setLastNode] = useState<Node>(initialNodes[1]); // 初始为根节点
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  // 点击节点时，将当前节点设置为“最后节点”
  const handleNodeClick = useCallback((event: any, node: Node) => {
    setLastNode(node);
  }, []);

  // 添加新的节点并自动连接到当前“最后节点”，然后更新为新节点
  const addNode = useCallback((position: { x: number; y: number }, label: string) => {
    const newNode = {
      id: getId(),
      type: 'default',
      position,
      data: { label },
    };
    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => addEdge({ id: `${lastNode.id}->${newNode.id}`, source: lastNode.id, target: newNode.id }, eds));
    setLastNode(newNode); // 更新“最后节点”
  }, [lastNode, setNodes, setEdges]);

  // 发送消息并获取 AI 回复
  const sendMessage = async () => {
    if (input.trim() === "") return;

    // 添加用户消息节点，并自动更新“最后节点”
    addNode({ x: lastNode.position.x, y: lastNode.position.y + 70 }, `User: ${input}`);
    setInput(""); // 清空输入框

    // 构建请求体
    const data = {
      model: "yi-lightning",
      messages: [{ role: "user", content: input }],
      temperature: 0.3,
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
      // 添加 AI 回复节点并更新“最后节点”
      addNode({ x: lastNode.position.x, y: lastNode.position.y + 70 }, `AI: ${aiReply}`);
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
        onNodeClick={handleNodeClick}
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
