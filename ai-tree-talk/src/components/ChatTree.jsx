import React, { useState, useEffect, useRef } from 'react';
import useChat from '../hooks/useChat';
import { jsPlumb } from 'jsplumb';

const ChatTreeJsPlumb = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  const jsPlumbInstance = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // 初始化 jsPlumb 实例
    jsPlumbInstance.current = jsPlumb.getInstance({
      Connector: ["Straight"],
      PaintStyle: { stroke: "#BDC3C7", strokeWidth: 2 },
      Endpoint: ["Dot", { radius: 5 }],
      EndpointStyle: { fill: "#BDC3C7" },
      Container: "chat-tree", // 指定容器
    });

    return () => {
      jsPlumbInstance.current.reset(); // 清除连接
    };
  }, []);

  useEffect(() => {
    const instance = jsPlumbInstance.current;

    // 清除之前的节点和连接
    instance.reset();

    // 创建消息节点
    messages.forEach((msg, index) => {
      const isUser = msg.role === 'user';
      const nodeId = `message-${index}`;

      // 创建节点
      const node = document.createElement('div');
      node.id = nodeId;
      node.className = 'message-node';
      node.style.backgroundColor = isUser ? '#4F93CE' : '#88D9B4';
      node.style.color = '#FFFFFF';
      node.style.borderRadius = '8px';
      node.style.padding = '10px';
      node.style.position = 'absolute';
      node.style.width = '120px';
      node.style.textAlign = 'center';
      node.style.cursor = 'move'; // 添加移动手势

      // 创建文本节点
      const textNode = document.createElement('div');
      textNode.innerText = msg.content; // 设置文本内容
      textNode.style.color = '#FFFFFF'; // 确保文本为白色
      textNode.style.fontSize = '14px'; // 设置字体大小

      // 将文本节点添加到消息节点
      node.appendChild(textNode);

      // 计算节点的位置
      const x = 100; // 初始水平位置
      const y = 100 + index * 80; // 垂直间隔
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      // 将节点添加到容器中
      containerRef.current.appendChild(node);

      // 添加拖拽功能
      instance.draggable(nodeId, {
        containment: "parent", // 限制在父容器内拖拽
      });

      // 添加连接线
      if (index > 0) {
        instance.connect({
          source: `message-${index - 1}`,
          target: nodeId,
          overlays: [["Arrow", { width: 10, length: 10, location: 1 }]],
        });
      }
    });

    // 设置容器
    instance.setContainer("chat-tree");

  }, [messages]); // 依赖 messages

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Chat with AI</h2>
      <div
        id="chat-tree"
        ref={containerRef}
        style={{
          position: 'relative',
          height: '400px',
          border: '2px solid #2C3E50',
          borderRadius: '8px',
          marginTop: '20px',
          overflow: 'hidden',
        }}
      />
      <form onSubmit={handleSubmit} style={{ marginTop: '10px', textAlign: 'center' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          style={{
            padding: '10px',
            width: '60%',
            borderRadius: '4px',
            border: '1px solid #BDC3C7',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 15px',
            marginLeft: '10px',
            borderRadius: '4px',
            backgroundColor: '#4F93CE',
            color: 'white',
            border: 'none',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatTreeJsPlumb;
