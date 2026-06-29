import { useCallback } from 'react';
import api from '../api';
import type { QuestionProps } from '../components/shared/types';

interface CreateNextQuestionAttemptResponse {
  next_question_attempt: { id: number } | null;
  next_question: QuestionProps | null;
  number_of_incorrect_attempts: number;
}

// The state setters createNextQuestionAttempt needs to drive. They are stable
// (React guarantees setState identity), so the returned callback stays stable too.
interface Handlers {
  setQuestion: (q: QuestionProps) => void;
  setQuestionAttemptId: (id: number) => void;
  setAnswerSubmitted: (v: boolean) => void;
  setIncorrectCount: (n: number) => void;
  setShowReviewPrompt: (v: boolean) => void;
  setEndOfQuiz: (v: boolean) => void;
}

/**
 * Returns a `createNextQuestionAttempt(quizAttemptId, currentQuestionNumber)` function
 * that asks the server for the next question attempt and updates quiz state accordingly:
 *  - next question available  -> show it
 *  - none left, with errors   -> prompt to review incorrect questions
 *  - none left, no errors      -> end the quiz
 *
 * The dynamic values (quizAttemptId, currentQuestionNumber) are passed at call time
 * so the callback never reads stale closure values.
 */
export function useCreateNextQuestionAttempt({
  setQuestion,
  setQuestionAttemptId,
  setAnswerSubmitted,
  setIncorrectCount,
  setShowReviewPrompt,
  setEndOfQuiz,
}: Handlers) {
  return useCallback(
    async (quizAttemptId: number, currentQuestionNumber: number | undefined) => {
      const url = `/api/quiz_attempts/${quizAttemptId}/create_next_question_attempt/`;
      try {
        const response = await api.post<CreateNextQuestionAttemptResponse>(url, {
          current_question_number: currentQuestionNumber,
        });

        if (response.data.next_question_attempt) {
          const next_question = response.data.next_question;
          if (next_question) {
            setAnswerSubmitted(false);
            setQuestion(next_question);
            setQuestionAttemptId(response.data.next_question_attempt.id);
          } else {
            console.log(
              'Error: Question Attempt returned from server but found no next question in the response. This should not happen'
            );
          }
        } else {
          // No next question attempt: end of quiz reached.
          const number_of_incorrect_attempts = response.data.number_of_incorrect_attempts;
          if (number_of_incorrect_attempts > 0) {
            setIncorrectCount(number_of_incorrect_attempts);
            setTimeout(() => setShowReviewPrompt(true), 800);
          } else {
            setEndOfQuiz(true);
          }
        }
      } catch (error) {
        console.error('Error creating next question attempt:', error);
      }
    },
    [
      setQuestion,
      setQuestionAttemptId,
      setAnswerSubmitted,
      setIncorrectCount,
      setShowReviewPrompt,
      setEndOfQuiz,
    ]
  );
}
