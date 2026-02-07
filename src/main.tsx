import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store, persistor} from "./redux/store";
import { PersistGate } from 'redux-persist/integration/react'
//import { WebSocketProvider } from "./components/context/WebSocketContext";

//const wsUrl = `${import.meta.env.VITE_WS_PROTOCOL}://${import.meta.env.VITE_WS_URL}/ws/socket-server/`;


createRoot(document.getElementById('root')!).render(

     <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    <App />
    </PersistGate>
    </Provider>

)
