import type { Node, NodeTypes } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: '0',
    type: 'input',
    position: { x: 0, y: 0 },
    data: { label: 'start' },
  },
  {
    id: '1',
    type: 'default',
    position: { x: 50, y: 70 },
    data: { label: 'AI:嗨，你好！有什么我可以帮你的？' },
  },
];

export const nodeTypes = {//存放自定义节点类型
  // Add any of your custom nodes here!
} satisfies NodeTypes;