import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from  "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "../src/components/ProtectedRoute"
import Category from "./components/Category"
import TakeQuiz from "./components/TakeQuiz"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>}
        >
          <Route path="categories/:category_id" element={<Category />} />
          <Route path="categories/:category_id/take_quiz/:quiz_id" element={<TakeQuiz />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

//   <Route path="sub_categories/:sub_category_id/take_quiz/:quiz_id" element={<TakeQuiz />} />