import React from 'react';

interface ExplanationProps {
  answer_key?: string; // Optional answer key prop
  children: React.ReactNode; // Accepts any valid React content as children
}

const Explanation: React.FC<ExplanationProps> = ({ children }) => {
  return (
    <div className="explanation-container p-4 border rounded-md bg-gray-100">
      <div className='text-lg text-green-700 mb-3'>Correct answer:</div>
      <div>{children}</div>
    </div>
  );
};

export default Explanation;