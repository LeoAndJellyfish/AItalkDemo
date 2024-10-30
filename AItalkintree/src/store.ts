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
import { nanoid } from 'nanoid/non-secure';
import { create } from 'zustand';

const flowKey = "myFlowData"; // 保存到localStorage的键

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addChildNode: (parentNode: Node, position: XYPosition, label: string) => Node;
  add_Edge: (source: string, target: string) => void;
  saveFlow: () => void;
  restoreFlow: () => void;
  downloadFlow: () => void;   // 新增下载功能
  uploadFlow: (file: File) => void;  // 新增上传功能
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
  edges: [{ id: '0->1', source: '0', target: '1' }],

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  addChildNode: (parentNode: Node, position: XYPosition, label: string) => {
    const newNode = {
      id: nanoid(),
      type: 'default',
      position,
      data: { label },
    };
    const newEdge = {
      id: `${parentNode.id}->${newNode.id}`,
      source: parentNode.id,
      target: newNode.id,
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: addEdge(newEdge, get().edges),
    });
    return newNode;
  },

  add_Edge: (source: string, target: string) => {
    const newEdge = { id: `${source}->${target}`, source, target };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  saveFlow: () => {
    const flowData = { nodes: get().nodes, edges: get().edges };
    localStorage.setItem(flowKey, JSON.stringify(flowData));
  },

  restoreFlow: () => {
    const savedFlow = localStorage.getItem(flowKey);
    if (savedFlow) {
      const { nodes, edges } = JSON.parse(savedFlow);
      set({ nodes, edges });
    }
  },

  // 导出流程数据为 JSON 文件
  downloadFlow: () => {
    const flowData = { nodes: get().nodes, edges: get().edges };
    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowData.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // 上传 JSON 文件并恢复流程数据
  uploadFlow: (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const { nodes, edges } = JSON.parse(result);
        set({ nodes, edges });
      }
    };
    reader.readAsText(file);
  },
}));

export default useStore;
