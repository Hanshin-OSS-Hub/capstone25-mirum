import { BrowserRouter, Routes, Route } from "react-router-dom"
// import PrivateRoute from "./components/PrivateRoute"

// ✅ 상세 페이지 컴포넌트
import Project from "./pages/Project.jsx";
import Home from './pages/Home.jsx'
import Page from './pages/Landing.jsx'
import './App.css'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={ <Page /> } />
            <Route path="dashboard" element={ 
              // <PrivateRoute>
                <Home />
              /* </PrivateRoute>  */
              }
            />
            <Route path="/project/:id" element={<Project />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}



export default App
