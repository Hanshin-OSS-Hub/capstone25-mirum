import { BrowserRouter } from "react-router-dom"
// import PrivateRoute from "./components/PrivateRoute"
import AppRoutes from './utils/AppRoutes.jsx'
import './App.css'
import TempProject from './임시/Project..jsx'

export default function App() {

  return (
    <>
      <BrowserRouter>
        {/* <AppRoutes /> */}
        <TempProject />
      </BrowserRouter>
    </>
  )
}