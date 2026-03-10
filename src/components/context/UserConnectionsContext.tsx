import React, { createContext, useContext, useState } from 'react';

type UserRowProps = {
  name: string;
  is_logged_in?: boolean;
  live_score?: number;
  live_total_score?: number;
  live_question_number?: number;
  recording_received?: boolean;
  recording_presigned_url?: string;
};

type UserConnectionsContextType = {
  userRows: UserRowProps[];
  setUserRows: React.Dispatch<React.SetStateAction<UserRowProps[]>>;
  liveQuizId: string | null; // Add live_quiz_id state
  setLiveQuizId: React.Dispatch<React.SetStateAction<string | null>>; // Add setter for live_quiz_id
  myLiveQuestionNumber?: number; // Optional state for the user's own live question number
  setMyLiveQuestionNumber?: React.Dispatch<React.SetStateAction<number | undefined>>; // Optional setter for the user's own live question number
};

// Create the context
const UserConnectionsContext = createContext<UserConnectionsContextType | undefined>(undefined);

// Create the provider
export const UserConnectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRows, setUserRows] = useState<UserRowProps[]>([]);
  const [liveQuizId, setLiveQuizId] = useState<string | null>(null); // Add state for live_quiz_id
  const [myLiveQuestionNumber, setMyLiveQuestionNumber] = useState<number | undefined>(undefined); // Add state for the user's own live question number
 

  return (
    <UserConnectionsContext.Provider value={{ userRows, setUserRows, liveQuizId, setLiveQuizId, myLiveQuestionNumber, setMyLiveQuestionNumber }}>
      {children}
    </UserConnectionsContext.Provider>
  );
};

// Custom hook to use the context
export const useUserConnections = (): UserConnectionsContextType => {
  const context = useContext(UserConnectionsContext);
  if (!context) {
    throw new Error('useUserConnections must be used within a UserConnectionsProvider');
  }
  return context;
};