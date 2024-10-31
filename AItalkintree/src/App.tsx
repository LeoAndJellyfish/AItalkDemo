import {
  Background,
  Controls,
  InternalNode,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useStoreApi,
  type Connection,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from "axios";
import { useCallback, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { edgeTypes } from './edges';
import { initialNodes, nodeTypes } from './nodes';
import useStore, { type RFState } from './store';

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addChildNode: state.addChildNode,
  add_Edge:state.add_Edge,
  saveFlow: state.saveFlow,           // 导入保存和恢复功能
  restoreFlow: state.restoreFlow,
  downloadFlow: state.downloadFlow,
  uploadFlow: state.uploadFlow,
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, addChildNode, add_Edge, saveFlow, restoreFlow, downloadFlow, uploadFlow } = useStore(
    useShallow(selector),
  );
  const [isLoading, setIsLoading] = useState(false);
  const store = useStoreApi();
  const [input, setInput] = useState("");
  const currentLastNodeID = useRef(initialNodes[1].id);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  // 点击节点时，将当前节点设置为“最后节点”
  const handleNodeClick = useCallback((_event: any, node: Node) => {
    if(node.id!=='0')currentLastNodeID.current = node.id;
  }, []);
  const onNodeDragStop = useCallback((_event: any, node: Node) => {
    if(currentLastNodeID.current===node.id) currentLastNodeID.current=node.id; // 更新当前最后节点为移动后的节点
  }, []);

  const handleFileUpload = (event:any) => {
    const file = event.target.files[0];
    currentLastNodeID.current = initialNodes[1].id; // 上传文件后，将当前最后节点设置为“AI:嗨，你好！有什么我可以帮你的？”
    if (file) uploadFlow(file);
  };

  const restoreFlowHandler = () => {
    currentLastNodeID.current = initialNodes[1].id; // 恢复流程后，将当前最后节点设置为“AI:嗨，你好！有什么我可以帮你的？”
    restoreFlow();
  };

  const getConversationHistory = (selectedNodeId:string) => {
    const labels = new Set(); // 使用 Set 以避免重复节点
  
    const visitParentNodes = (nodeId:string) => {
      // 查找所有指向当前节点的父边
      const edgesToParents = edges.filter(edge => edge.target === nodeId);
      // 遍历所有父节点
      edgesToParents.forEach(edge => {
        const parentNode = nodeLookup.get(edge.source);
        if (parentNode && parentNode.id!== '0') {
          visitParentNodes(parentNode.id); // 递归访问父节点
          labels.add(parentNode.data.label); // 添加父节点的 label
        }
      });
    };
  
    // 从选定节点开始收集对话记录
    const { nodeLookup } = store.getState();
    const currentNode = nodeLookup.get(selectedNodeId);
    if (currentNode) {
      visitParentNodes(selectedNodeId); // 访问父节点
      labels.add(currentNode.data.label); // 添加当前节点的 label
    }
  
    // 将所有节点的 label 合并成字符串
    return Array.from(labels).join(`;`);
  };


  const getChildNodePosition = (
    parentNode?: InternalNode,
  ) => {
    const { domNode } = store.getState();

    if (
      !domNode ||
      // we need to check if these properites exist, because when a node is not initialized yet,
      // it doesn't have a positionAbsolute nor a width or height
      !parentNode?.internals.positionAbsolute ||
      !parentNode?.measured.height
    ) {
      return;
    }
    // we are calculating with positionAbsolute here because child nodes are positioned relative to their parent
    return {
      x:
        parentNode.position.x,
      y:
        parentNode.position.y +
        parentNode.measured.height + 30,
    };
  };
  
  const onConnect = useCallback(
    (connection: Connection) => {
      add_Edge(connection.source,connection.target);
    },
    [getChildNodePosition],
  );

  //添加新的节点并自动连接到当前“最后节点”，然后更新为新节点
  const addNode = useCallback((label: string, parentNodeId?: string) => {
    const { nodeLookup } = store.getState();
    const parentNode = nodeLookup.get(parentNodeId? parentNodeId : currentLastNodeID.current);
    const childNodePosition = getChildNodePosition(parentNode);

    if (parentNode && childNodePosition) {
      const sonNode = addChildNode(parentNode, childNodePosition, label);
      currentLastNodeID.current = sonNode.id;
      return sonNode.id;
    }
  }, [getChildNodePosition]);
  // 创建临时节点
  const createTemp = () => {
    addNode(``);
  }
  // 发送消息并获取 AI 回复
  const sendMessage = async () => {
    if (input.trim() === ""|| isLoading) return;
    setIsLoading(true);

    const history = getConversationHistory(currentLastNodeID.current);
    console.log("当前对话历史",history);
    // 添加用户消息节点
    const sonid = addNode(`User: ${input}`);

    setInput(""); // 清空输入框

    // 构建请求体
    const data = {
      model: "yi-lightning",
      messages: [
        { role:"system", content: `请根据对话历史回答，避免任何编造的事实信息。Start:${history}`},
        { role: "user", content: input }
      ],
      temperature: 0.2,
      max_tokens: 500,
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
      addNode(`AI: ${aiReply}`,sonid);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setIsLoading(false);
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
        <button id="send-btn" onClick={sendMessage} disabled={isLoading}>Send</button>
        <button id="createtemp" onClick={createTemp}>创建空白节点</button>
      </Panel>
      <Panel position="top-left">
        <button onClick={saveFlow}>保存流程</button>
        <button onClick={restoreFlowHandler}>恢复流程</button>
        <button onClick={downloadFlow}>下载流程</button>
        <input type="file" onChange={handleFileUpload} />
      </Panel>
      <div id="version" style={{ position: 'absolute', bottom: 0, left: 0, fontSize: 12, color: 'gray' }}>{import.meta.env.VITE_APP_VERSION}</div>
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
