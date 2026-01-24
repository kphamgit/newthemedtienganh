import { useQuery } from '@tanstack/react-query';
import fetchQuizQuestions from '../fetch_apis/fetchQuizQuestions';

export const useQuiz = (quiz_id: string, enabled: boolean) => {
  //send only quiz_attempt_id to server. Server will decide which question to fetch
  //console.log('useQuiz quiz_id=', quiz_id, 'enabled=', enabled);
  return useQuery({
    queryKey: ['quiz', quiz_id],
    queryFn: () => fetchQuizQuestions(quiz_id),
    enabled: enabled, // prevents the query from running if enabled is falsy
    staleTime: 5000, // 5 minutes
    //staleTime: 0, // no caching, always refetch
  });
};

// fetchQuizAttempt = async (quiz_id: string | undefined, user_id: string | undefined):

/*
const apiUrl = 'https://api.example.com/protected-resource'; // Replace with your API endpoint
const userToken = 'your_actual_bearer_token'; // Retrieve this from storage (e.g., localStorage, localStorage)

fetchWithBearerToken(apiUrl, userToken)
  .then(data => {
    console.log('Data received:', data);
  })
  .catch(error => {
    console.error('Failed to fetch data:', error.message);
  });
*/
