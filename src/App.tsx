import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from  "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "../src/components/ProtectedRoute"
import SubCategory from "./components/SubCategory"
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
          <Route path="sub_categories_student/:sub_category_id" element={<SubCategory />} />
          <Route path="sub_categories/:sub_category_id/take_quiz/:quiz_id" element={<TakeQuiz />} />
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

///sub_categories/${id}/take_quiz/${quiz.id}`
///sub_categories/8/take_quiz/35