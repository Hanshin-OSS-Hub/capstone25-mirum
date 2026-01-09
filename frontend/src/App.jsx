import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
// import PrivateRoute from "./components/PrivateRoute"

// ✅ 상세 페이지 컴포넌트
import Project from "./pages/Project.jsx";
import Home from './pages/Home.jsx'
import Page from './pages/Page.jsx'
import './App.css'


function NavigationSetter() {
  const navigate = useNavigate();

  useEffect(() => {
    // 리액트의 navigate 함수를 윈도우 전역 변수에 연결!
    window.REACT_APP_NAVIGATE = navigate;
  }, [navigate]);

  return null; // 화면에는 아무것도 안 그립니다.
}


function App() {

  return (
    <>
      <BrowserRouter>
        <NavigationSetter />
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
