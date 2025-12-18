//import { VideoSegmentProps } from "../quiz_attempts/types";
//import { store } from "../../redux/store";
import { ACCESS_TOKEN } from "../constants";

const fetchWithBearerToken = async (quiz_id: string): Promise<any> => {
  try {
    // The second argument to fetch is the options object
    const token = localStorage.getItem(ACCESS_TOKEN);
    const baseURL = import.meta.env.VITE_API_URL
    const url = `${baseURL}/api/quizzes/${quiz_id}/questions`;
    const response = await fetch(url, {
      method: 'GET', // Or 'POST', 'PUT', 'DELETE', etc.
      headers: {
        'Authorization': `Bearer ${token}`, // Key part: 'Authorization': 'Bearer ' + token
        'Content-Type': 'application/json' // Add other headers as needed
      }
    });

    if (!response.ok) {
      // Handle non-successful responses (e.g., 401 Unauthorized)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response body as JSON
    const data: any = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export default fetchWithBearerToken;

/*
// Example usage:
const apiUrl = 'https://api.example.com/protected-resource'; // Replace with your API endpoint
const userToken = 'your_actual_bearer_token'; // Retrieve this from storage (e.g., localStorage, sessionStorage)

fetchWithBearerToken(apiUrl, userToken)
  .then(data => {
    console.log('Data received:', data);
  })
  .catch(error => {
    console.error('Failed to fetch data:', error.message);
  });
*/

/*
name        | varchar(255) | YES  |     | NULL    |                |
| quiz_number | int          | YES  |     | NULL    |                |
| unitId      | int          | YES  |     | NULL    |                |
| disabled    | tinyint(1)   | YES  |     | NULL    |                |
| video_url   | varchar(255) | YES  |     | NULL    |                |
+-------------+--------------+------+-----+---------+----------------+
*/

/*
  export const fetchQuiz = async (quiz_id: string): Promise<QuizProps> => {
   //console.log("fetchQuiz ENTRY quiz_id=", quiz_id);
      //const rootpath = store.getState().rootpath.value
      const baseURL = import.meta.env.VITE_API_URL
      const url = `${baseURL}/api/quizzes/${quiz_id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch  question attempt");
      //console.log("fetchLiveQuestion response json", response.json())
      return response.json();
    };
*/



  
  