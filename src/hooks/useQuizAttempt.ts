import { useQuery } from '@tanstack/react-query';
import { fetchQuizAttempt} from '../fetch_apis/fetchQuizAttempt';

export const useQuizAttempt = (quiz_id: string, _video_url: string | null, user_id: string, enabled: boolean) => {
  //console.log('useQuizAttempt quiz id=', quiz_id, "user id=", user_id, '  enabled=', enabled, " video url=", video_url);
  //const test_boolean = quiz_id !== '' && user_id !== ''
  //console.log("***** useQuizAttempt test_boolean=", test_boolean)
  /*
  if (video_url && video_url !== '') {
    console.log("useQuizAttempt using video quiz attempt")
    // use video quiz attempt fetch function
    return useQuery({
      queryKey: ['quiz_attempt_video', quiz_id, user_id],
      queryFn: () => fetchVideoQuizAttempt(quiz_id, user_id),
      enabled: enabled,
      staleTime: 1000, //data is always fresh
    });
  }
  */
 
  return useQuery({
    queryKey: ['quiz_attempt', quiz_id, user_id],
    queryFn: () => fetchQuizAttempt(quiz_id, user_id),
    //enabled: !!quiz_id, // prevents the query from running if quiz_id is falsy
    //enabled: quiz_id !== '' && user_id !== '', // prevents the query from running if quiz_id or user_id is empty
    enabled: enabled,
    //staleTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 0, // no caching, always refetch
  });


};

// fetchQuizAttempt = async (quiz_id: string | undefined, user_id: string | undefined):