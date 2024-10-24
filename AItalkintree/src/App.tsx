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
import { useCallback, useState } from 'react';

import '@xyflow/react/dist/style.css';

import { edgeTypes, initialEdges } from './edges';
import { initialNodes, nodeTypes } from './nodes';

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [inputValue, setInputValue] = useState(''); // 输入框状态
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value); // 更新输入框的值
  };

  const handleSend = () => {
    console.log('发送内容:', inputValue); // 发送按钮的处理逻辑
    //创建用户消息节点，连接到当前的节点
    //api获取ai回复内容
    //创建AI回复节点，连接到当前的节点
    setInputValue(''); // 发送后清空输入框
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
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="请输入内容"
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleSend}>发送</button>
      </div>
    </div>
  );
}
