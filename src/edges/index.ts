import type { Edge, EdgeTypes } from '@xyflow/react';

export const initialEdges: Edge[] = [
  { id: '0->1', source: '0', target: '1'},
];

export const edgeTypes = {//存放自定义边类型
  // Add your custom edge types here!
} satisfies EdgeTypes;
