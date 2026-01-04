import { useQuery } from '@tanstack/react-query';
import { fetchQuizAttempt } from '../fetch_apis/fetchQuizAttempt';
import { type QuizAttemptCreatedProps } from '../components/shared/types';

export const useQuizAttempt = (
  quiz_id: string,
  _video_url: string | null,
  user_id: string,
  enabled: boolean
) => {
  return useQuery<QuizAttemptCreatedProps>({
    queryKey: ['quiz_attempt', quiz_id, user_id],
    queryFn: () => fetchQuizAttempt(quiz_id, user_id),
    enabled: enabled,
    staleTime: 0, // no caching, always refetch
  });
};