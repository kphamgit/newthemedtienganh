import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import store from "./redux/store";
//import { WebSocketProvider } from "./components/context/WebSocketContext";

//const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/`;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Provider store={store}>
   
    <App />
  
    </Provider>
  </StrictMode>,
)
