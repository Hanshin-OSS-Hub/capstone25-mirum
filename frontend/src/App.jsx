// import Header from './components/common/Header.jsx'
// import HeroSection from './components/common/ProjectCard2.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
// import Page from './pages/Page.jsx'
// import Login from './Login.jsx'
import './App.css'
import {
    HiOutlineBell, HiOutlineFolder, HiCheck, HiOutlineUsers, HiPlus,
    HiHome, HiUser // 👈 아이콘 추가 임포트
} from "react-icons/hi2";

function Home(props) {
    return (
        <div className="phone-mockup-wrapper">
        <div className="dashboard-container">
            {/* 1. 헤더 영역 */}
            {/*<Header />*/}
            <header className="header">
                <div className="header-left">
                    <div className="logo-box">M</div>
                    <span className="logo-text">Mirum</span>
                </div>
                <div className="header-right">
                    <button className="profile-btn" style={ { backgroundColor: "transparent" }}>
                        <HiOutlineBell size={20} />
                    </button>
                    <button className="profile-btn">김</button>
                </div>
            </header>

            {/* 2. 메인 콘텐츠 영역 (회색 배경) */}
            <main className="main-content">
                <div className="content-inner">

                {/* 인사말 섹션 */}
                <section className="greeting-section">
                    <h1>안녕하세요, 김학생님! 👋</h1>
                    <p>오늘도 팀 프로젝트를 효율적으로 관리해보세요.</p>
                </section>

                {/* 요약 카드 섹션 (가로 배치) */}
                <section className="summary-cards">
                    <div className="card summary-card">
                        <div className="card-info">
                            <span>진행 중인 프로젝트</span>
                            <strong>2</strong>
                        </div>
                        <div className="icon-box blue">📂</div>
                    </div>

                    <div className="card summary-card">
                        <div className="card-info">
                            <span>완료된 작업</span>
                            <strong>10</strong>
                        </div>
                        <div className="icon-box green">✅</div>
                    </div>

                    <div className="card summary-card">
                        <div className="card-info">
                            <span>팀원 수</span>
                            <strong>5</strong>
                        </div>
                        <div className="icon-box purple">👨‍👩‍👧‍👦</div>
                    </div>
                </section>

                {/* 내 프로젝트 섹션 */}
                <section className="project-section">
                    <div className="section-header">
                        <h2>내 프로젝트</h2>
                        <button className="primary-btn">+ 새 프로젝트</button>
                    </div>

                    <div className="project-grid">
                        {/*{*/}
                        {/*    props.projects.map((p, i) => (*/}
                        {/*    <ProjectCard*/}
                        {/*        key={i}*/}
                        {/*        title={p.title}*/}
                        {/*        desc={p.desc}*/}
                        {/*        progress={p.progress}*/}
                        {/*        members={p.members}*/}
                        {/*        day={p.day}*/}
                        {/*        color={p.color} // 색상 전달*/}
                        {/*    />*/}
                        {/*    ))*/}
                        {/*}*/}

                        {/* 프로젝트 카드 1 */}
                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>웹사이트 디자인 프로젝트</h3>
                                    <p className="project-desc">팀 협업 웹사이트 개발</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="full" style={{ width: '65%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>


                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>마케팅 전략</h3>
                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="fell" style={{ width: '35%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>마케팅 전략</h3>
                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="fill" style={{ width: '65%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>마케팅 전략</h3>
                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="fill" style={{ width: '65%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>마케팅 전략</h3>
                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="fill" style={{ width: '65%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>마케팅 전략</h3>
                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="fill" style={{ width: '65%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>마케팅 전략</h3>
                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="fill" style={{ width: '65%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        <div className="card project-card">
                            <div className="project-header">
                                <div className="project-text">
                                    <h3>마케팅 전략</h3>
                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                </div>

                                <div className="project-icon">📂</div>
                            </div>

                            <div className="progress-bar">
                                <div className="fill" style={{ width: '65%' }}></div>
                            </div>

                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        {/* 프로젝트 카드 2
                        <div className="card project-card">
                            <div style = { { "display" : "flex", "gap": "24px"} }>
                                <h3>마케팅 과제</h3>
                                <div className="project-icon">📂</div>
                            </div>
                            <p className="project-desc">브랜드 전략 수립 및 분석</p>
                            <div className="progress-bar">
                                <div className="fill" style={{width: '30%'}}></div>
                            </div>
                            <div className="card-footer">
                                <span>👤 2명</span>
                                <span>📅 1일 전</span>
                            </div>
                        </div>        */}
                    </div>
                </section>
                </div>
            </main>
            <nav className="mobile-tab-bar">
                <button className="tab-item active">
                    <HiHome size={24} />
                    <span>홈</span>
                </button>
                <button className="tab-item">
                    <HiOutlineFolder size={24} />
                    <span>프로젝트</span>
                </button>
                <button className="tab-item">
                    <HiCheck size={24} />
                    <span>작업</span>
                </button>
                <button className="tab-item">
                    <HiUser size={24} />
                    <span>내 정보</span>
                </button>
            </nav>
        </div>
        </div>
        // <>
        // {/* Header */}
        //   <header className="header">{/*"bg-white border-b border-gray-200">*/}
        //     <div className="container">
        //       <div>
        //         <div>
        //           <div className="logo">
        //               로고
        //           </div>
        //           <button>
        //               미룸
        //           </button>
        //         </div>
        //       </div>
        //         <div className="img">
        //           <button>알림</button>
        //           <button>내 정보</button>
        //         </div>
        //       </div>
        //   </header>
        //   <section>
        //       <p>
        //         <div style = { { "margin-bottom" : "10%" } }>
        //           <h2>안녕하세요, 김 학생님! 👋</h2>
        //           <text>오늘도 팀 프로젝트를 효율적으로 관리해보세요</text>
        //         </div>
        //         <div style = { { "display": "inline-flex", "justify-content": "space-between", "margin-bottom": "20%" } }>
        //             진행중인 프로젝트 /
        //             완료된 작업 /
        //             팀원 수(?)
        //         </div>
        //         <div>
        //             <h3>
        //                 프로젝트 목록
        //                 <button>프로젝트 생성</button>
        //             </h3>
        //         </div>
        //         <div>
        //             프로젝트 1 / 프로젝트 2 / 프로젝트 3
        //             프로젝트 4 / 프로젝트 5 / 프로젝트 6
        //         </div>
        //       </p>
        //   </section>
        //   <footer>
        //
        //   </footer>
        // </>
    )
}

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
            {/* <Route path="login" element={<Login />} /> */}
            <Route path="dashboard" element={ <Home projects={projects} /> } />
        </Routes>
      </BrowserRouter>
    </>
  )
}





export default App
