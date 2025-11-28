import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Home from './pages/Home.jsx'
import Page from './pages/Page.jsx'
import Login from './Login.jsx'
import './App.css'
import {
    HiOutlineBell, HiOutlineFolder, HiCheck, HiOutlineUsers, HiPlus,
    HiHome, HiUser // 👈 아이콘 추가 임포트
} from "react-icons/hi2";



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
             <Route path="/" element={ <Page /> } />
             <Route path="login" element={<Login />} />
            <Route path="dashboard" element={ <Home /> } />
        </Routes>
      </BrowserRouter>
    </>
  )
}



export default App
