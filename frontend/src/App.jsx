import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// import PrivateRoute from "./components/PrivateRoute"
import { DesktopRoute, MobileRoute } from "./components/ResponsiveRoute";

// 데스크톱 페이지
import Home from './pages/Home.jsx'
// 모바일 전용 페이지
import MobileHome from "./pages/MobileHome.jsx";
import MobileProjects from "./pages/MobileProjects.jsx";
import MobileHistory from "./pages/MobileHistory.jsx";
import MobileCalendar from "./pages/MobileCalendar.jsx";
import MobileMypage from "./pages/MobileMypage.jsx";
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

    const [activeTab, setActiveTab] = useState("home");

    return (
      <>
        <BrowserRouter>
          <NavigationSetter />
          <Routes>
              {/* <Route path="/" element={ <Page /> } /> */}
              {/* --- 반응형 라우팅 --- */}
              {/* 1. 데스크톱용 대시보드: /dashboard */}
              <Route path="/dashboard" element={
                //<Home projects={projects} />
                // <PrivateRoute>
                  <DesktopRoute redirectTo="/mobile/dashboard">
                    <Home />
                  </DesktopRoute>
                // </PrivateRoute>
              } />

              {/* 2. 모바일용 대시보드 (예: 요약 페이지) */}
              <Route path="/mobile/dashboard" element={
                //<PrivateRoute>
                  <MobileRoute redirectTo="/dashboard">
                    <MobileHome activeTab={activeTab} setActiveTab={setActiveTab}/>
                  </MobileRoute>
                //</PrivateRoute>
              } />
              
              <Route path="/mobile/projects" element={
                //<PrivateRoute>
                  <MobileRoute redirectTo="/dashboard">
                    <MobileProjects activeTab={activeTab} setActiveTab={setActiveTab}/>
                  </MobileRoute>
                //</PrivateRoute>
              } />

              <Route path="/mobile/history" element={
                //<PrivateRoute>
                  <MobileRoute redirectTo="/dashboard">
                    <MobileHistory activeTab={activeTab} setActiveTab={setActiveTab} />
                  </MobileRoute>
                //</PrivateRoute>
              } />

              <Route path="/mobile/calendar" element={
                //<PrivateRoute>
                  <MobileRoute redirectTo="/dashboard">
                    <MobileCalendar activeTab={activeTab} setActiveTab={setActiveTab} />
                  </MobileRoute>
                //</PrivateRoute>
              } />

              <Route path="/mobile/mypage" element={
                //<PrivateRoute>
                  <MobileRoute redirectTo="/dashboard">
                    <MobileMypage activeTab={activeTab} setActiveTab={setActiveTab} />
                  </MobileRoute>
                //</PrivateRoute>
              } />


              <Route path="*" element={ <div>404 Not Found</div> } />
          </Routes>
        </BrowserRouter>
      </>
    )
}



export default App
