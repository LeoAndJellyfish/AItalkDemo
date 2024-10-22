import React from 'react';

const MessageNode = ({ message }) => {
  return (
    <div className="message-node">
      <p><strong>{message.role}:</strong> {message.content}</p>
    </div>
  );
};

export default MessageNode;
