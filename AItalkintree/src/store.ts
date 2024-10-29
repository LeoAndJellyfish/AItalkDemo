import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnEdgesChange,
  type OnNodesChange,
  type XYPosition,
} from '@xyflow/react';
import { create } from 'zustand';
var nid = 1;
const getId = () => `${++nid}`;
export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addChildNode: (parentNode: Node, position: XYPosition,label: string) => Node;
  add_Edge:(source: string,target: string) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [
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
  ],
  edges: [
    { id: '0->1', source: '0', target: '1'},
  ],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  addChildNode: (parentNode: Node, position: XYPosition, label: string) => {
    const newNode = {
      id: getId(),
      type: 'default',
      position:position,
      data: { label },
    };
    
    const newEdge = {
      id: `${parentNode.id}->${newNode.id}`,
      source: parentNode.id,
      target: newNode.id,
    };
    
    set({
      nodes: [...get().nodes, newNode],
      edges: addEdge(newEdge,get().edges),
    });
    return newNode;
  },
  add_Edge:(source:string,target:string) => {
    const newEdge = {
      id: `${source}->${target}`,
      source: source,
      target: target,
    };
    set({
      edges: addEdge(newEdge,get().edges),
    });
  },
}));
  
export default useStore;