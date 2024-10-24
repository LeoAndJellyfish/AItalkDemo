import type { NodeTypes } from '@xyflow/react';

import { PositionLoggerNode } from './PositionLoggerNode';
import { AppNode } from './types';

export const initialNodes: AppNode[] = [
  {
    id: '0',
    type: 'input',
    position: { x: 0, y: 0 },
    data: { label: 'wire' },
  },
  {
    id: '1',
    type: 'position-logger',
    position: { x: -100, y: 100 },
    data: { label: 'drag me!' },
  },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'your ideas' } },
  {
    id: '3',
    type: 'output',
    position: { x: 0, y: 200 },
    data: { label: 'with React Flow' },
  },
];

export const nodeTypes = {//存放自定义节点类型
  'position-logger': PositionLoggerNode,
  // Add any of your custom nodes here!
} satisfies NodeTypes;
