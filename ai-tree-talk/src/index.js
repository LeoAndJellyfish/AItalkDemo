import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // 导入 App 组件
import './styles.css'; // 引入全局样式（如果有的话）

// 渲染 App 组件到 HTML 中 id 为 root 的 div
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // 确保这个 div 存在于 index.html 中
);
