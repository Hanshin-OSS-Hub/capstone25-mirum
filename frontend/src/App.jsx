import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

// import PrivateRoute from "./components/PrivateRoute"
// import { DesktopRoute, MobileRoute } from "./components/ResponsiveRoute";
import Home from './pages/Home.jsx'
// 모바일용 페이지 예시 (실제 파일 생성 필요)
// import DashboardSummary from './pages/DashboardSummary.jsx';
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
            title: "데이터 분석 프로젝트",
            desc: "고객 행동 패턴 분석 및 인사이트 도출",
            progress: 80,
            members: ["전", "오", "윤"], // 배열로 전달
            day: "3월 20일",
            color: "purple" // 보라색
        },
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
        }
    ];

  return (
    <>
      <BrowserRouter>
        <NavigationSetter />
        <Routes>
            {/* <Route path="/" element={ <Page /> } /> */}
            {/* --- 대시보드 반응형 라우팅 --- */}
            {/* 1. 데스크톱용 대시보드: /dashboard */}
            <Route path="/dashboard" element={
              <Home projects={projects} />
              // <PrivateRoute>
              //   <DesktopRoute redirectTo="/dashboard/summary">
              //     <Home projects={projects} />
              //   </DesktopRoute>
              // </PrivateRoute>
            } />

            {/* 2. 모바일용 대시보드 (예: 요약 페이지) */}
            {/* <Route path="/dashboard/summary" element={
              <PrivateRoute>
                <MobileRoute redirectTo="/dashboard"> */}
                  {/* 모바일용으로 분리된 첫 번째 페이지 컴포넌트 */}
                  {/* <DashboardSummary /> */}
                  {/* <div>모바일 대시보드 요약 페이지</div>
                </MobileRoute>
              </PrivateRoute>
            } /> */}
            {/* 여기에 모바일용 두 번째 페이지 라우트 추가 가능 */}
        </Routes>
      </BrowserRouter>
    </>
  )
}



export default App
