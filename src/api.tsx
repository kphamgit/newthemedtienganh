import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ;

console.log("API Base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Required for cookies to be sent/received
});

api.interceptors.response.use(
  (response) => {
    //console.log("API .******8 ... Response:", response);
    return response;
  }, // If the request succeeds, just return it
  async (error) => {
    console.log("API ... Response Error:", error);

    const originalRequest = error.config;
    /*
f you have an Axios Interceptor (the one we wrote earlier to handle refreshes), a 401 on a logout request can trigger an infinite loop:
You call /logout.
Server returns 401 (expired).
Interceptor catches 401 and tries to call /refresh.
Refresh fails or succeeds, and it tries to call /logout again.
The Fix: Tell your interceptor to ignore 401 errors specifically for the logout URL.
    */
    // handle 401 errors (not authorized) from server upong logging out. @Gemini suggestion
    // If the error is 401 and we haven't tried to refresh yet
    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("API ... 401 Error detected");
      const originalRequest = error.config;
      console.log("API ... originalRequest:", originalRequest);
      // Skip refresh logic if the request was to the logout endpoint
      /*
      if (originalRequest.url.includes('/logout/')) {
        console.log("Logout request failed with 401, not attempting to refresh.");
        return Promise.reject(error);
      }
      */
/*
      originalRequest._retry = true;

      try {
        console.log(" Error occured loging in, attempting to refresh...");
        // Call your refresh endpoint. 
        // Django will see the 'refresh_token' cookie and set a new 'access_token' cookie.
        await axios.post(`${BASE_URL}/api/api/token/refresh/`, {}, { withCredentials: true });

        // Retry the original request now that we have a new access cookie
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh token is also expired, the user must log in again
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
      */
    }

    return Promise.reject(error);
  }
);

export default api;