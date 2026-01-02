import React from 'react';

interface ExplanationProps {
  children: React.ReactNode; // Accepts any valid React content as children
}

const Explanation: React.FC<ExplanationProps> = ({ children }) => {
  return (
    <div className="explanation-container p-4 border rounded-md bg-gray-100">
      <h2 className="text-lg font-bold mb-2">Explanation</h2>
      <div>{children}</div>
    </div>
  );
};

export default Explanation;