import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import { AppNode } from './types';

export const initialNodes: AppNode[] = [
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
    data: { label: '嗨，你好！' },
  },
];

export const nodeTypes = {//存放自定义节点类型
  'position-logger': PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
