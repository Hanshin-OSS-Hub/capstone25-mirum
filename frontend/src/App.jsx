import { BrowserRouter } from "react-router-dom"
// import PrivateRoute from "./components/PrivateRoute"
import AppRoutes from './utils/AppRoutes.jsx'

export default function App() {

  return (
    <>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  )
}