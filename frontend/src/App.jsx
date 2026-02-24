import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom"
// import PrivateRoute from "./components/PrivateRoute"
import AppRoutes from './utils/AppRoutes.jsx'
import './App.css'

const queryClient = new QueryClient();

export default function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
         <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
