
import { useParams } from 'react-router-dom';
//import api from "../api";
import { useEffect, useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';

function TakeQuiz() {

   const {quiz_id } = useParams<{ sub_category_id: string, quiz_id: string }>();
   const [fetchQuizEnabled, setFetchQuizEnabled] = useState(true)  // only fetch quiz once

   const {data: quiz} = useQuiz(
      quiz_id ? quiz_id : ""
    , fetchQuizEnabled
)

    useEffect(() => {
        if (quiz) {
            console.log("Quiz fetched:", quiz);
            setFetchQuizEnabled(false); // disable further fetching
        }
    }, [quiz]);
/* 
   useEffect(() => {
     api.get(`/api/sub_categories/${params.sub_category_id}/quizzes/${params.quiz_id}/take`)
         .then((res) => {
            console.log("Quiz data:", res.data);
            // Handle quiz data here
         })
         .catch((err) => alert(err));
    }, [params.sub_category_id, params.quiz_id]);
*/

  return (
    <div>TakeQuiz</div>
  )
}

export default TakeQuiz