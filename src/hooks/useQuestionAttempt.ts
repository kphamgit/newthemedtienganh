import { useQuery } from '@tanstack/react-query';
import { fetchQuestionAttempt } from '../fetch_apis/fetchQuestionAttempt';

export const useQuestionAttempt = (quiz_attempt_id: string, question_number: number,  enabled: boolean) => {
  //console.log('useQuestionAttempt :', 'quiz attempt id: ', quiz_attempt_id , ' question id: ', question_id, ' enabled=', enabled,);
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
    queryKey: ['question_attempt', question_number],
    queryFn: () => fetchQuestionAttempt(quiz_attempt_id, question_number),
    //enabled: !!quiz_id, // prevents the query from running if quiz_id is falsy
    //enabled: quiz_id !== '' && user_id !== '', // prevents the query from running if quiz_id or user_id is empty
    enabled: enabled,
    //staleTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000, //data is always fresh
  });


};

// fetchQuizAttempt = async (quiz_id: string | undefined, user_id: string | undefined):