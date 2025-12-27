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
    const projects = [
        {
            title: "웹 개발 프로젝트",
            desc: "대학생을 위한 프로젝트 관리 도구 개발",
            progress: 65,
            members: ["김", "이", "박"],
            day: "3월 15일",
            color: "blue" // 파란색
        },
        {
            title: "마케팅 전략 수립",
            desc: "신제품 출시를 위한 마케팅 전략 기획",
            progress: 40,
            members: ["최", "정"],
            day: "4월 1일",
            color: "green" // 초록색
        },
        {
            title: "모바일 앱 개발",
            desc: "사용자 친화적인 모바일 앱 디자인 및 개발",
            progress: 90,
            members: ["강", "조", "한", "서"],
            day: "3월 30일",
            color: "purple" // 보라색
        },
        {
            title: "콘텐츠 제작 프로젝트",
            desc: "브랜드 홍보를 위한 영상 및 그래픽 콘텐츠 제작",
            progress: 55,
            members: ["윤", "임"],
            day: "4월 5일",
            color: "blue" // 파란색
        },
        {
            title: "고객 지원 시스템 개선",
            desc: "효율적인 고객 지원을 위한 시스템 업그레이드",
            progress: 30,
            members: ["신", "서", "권"],
            day: "4월 10일",
            color: "green" // 초록색
        },
        {
            title: "데이터 분석 프로젝트",
            desc: "고객 행동 패턴 분석 및 인사이트 도출",
            progress: 80,
            members: ["전", "오", "윤"], // 배열로 전달
            day: "3월 20일",
            color: "purple" // 보라색
        },
    ];

    const [activeTab, setActiveTab] = useState("home");

    return (
      <>
        <BrowserRouter>
          <NavigationSetter />
          <Routes>
              {/* <Route path="/" element={ <Page /> } /> */}
              {/* --- 대시보드 반응형 라우팅 --- */}
              {/* 1. 데스크톱용 대시보드: /dashboard */}
              <Route path="/dashboard" element={
                //<Home projects={projects} />
                // <PrivateRoute>
                  <DesktopRoute redirectTo="/mobile/dashboard">
                    <Home projects={projects} />
                  </DesktopRoute>
                // </PrivateRoute>
              } />

              {/* 2. 모바일용 대시보드 (예: 요약 페이지) */}
              <Route path="/mobile/dashboard" element={
                //<PrivateRoute>
                  <MobileRoute redirectTo="/dashboard">
                    {/* 모바일용으로 분리된 첫 번째 페이지 컴포넌트 */}
                    {/* <DashboardSummary /> */}
                    <MobileHome activeTab={activeTab} setActiveTab={setActiveTab}/>
                  </MobileRoute>
                //</PrivateRoute>
              } />
              
              <Route path="/mobile/projects" element={
                //<PrivateRoute>
                  <MobileRoute redirectTo="/dashboard">
                    <MobileProjects projects={projects} activeTab={activeTab} setActiveTab={setActiveTab}/>
                  </MobileRoute>
                //</PrivateRoute>
              } />
          </Routes>
        </BrowserRouter>
      </>
    )
}



export default App
