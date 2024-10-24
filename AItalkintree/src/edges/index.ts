import type { Edge, EdgeTypes } from '@xyflow/react';

export const initialEdges: Edge[] = [
  { id: 'a->c', source: '0', target: '2'},
  { id: 'b->d', source: '1', target: '3' },
  { id: 'c->d', source: '2', target: '3'},
];

export const edgeTypes = {//存放自定义边类型
  // Add your custom edge types here!
} satisfies EdgeTypes;
