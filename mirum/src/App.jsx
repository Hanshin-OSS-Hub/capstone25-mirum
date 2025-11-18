import './App.css'
import {
    HiOutlineBell, HiOutlineFolder, HiCheck, HiOutlineUsers, HiPlus,
    HiHome, HiUser // 👈 아이콘 추가 임포트
} from "react-icons/hi2";

function App() {
  // const [count, setCount] = useState(0)
  //   const projects = [
  //       { title: "웹사이트 디자인 프로젝트", team: "팀 협업 사이트 개발", progress: 65, members: 3 },
  //       { title: "마케팅 과제", team: "브랜드 전략 수립 및 분석", progress: 30, members: 2 }
  //   ];

  return (
    <>
      <Home />
    </>
  )
}


function Home() {
    return (
        <div className="dashboard-container">
            {/* 1. 헤더 영역 */}
            <header className="header">
                <div className="header-left">
                    <div className="logo-box">M</div>
                    <span className="logo-text">미룸</span>
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
                        {/* 프로젝트 카드 1 */}
                        <div className="card project-card">
                            <div className="project-icon">📂</div>
                            <h3>웹사이트 디자인 프로젝트</h3>
                            <p className="project-desc">팀 협업 웹사이트 개발</p>
                            <div className="progress-bar">
                                <div className="fill" style={{width: '65%'}}></div>
                            </div>
                            <div className="card-footer">
                                <span>👤 3명</span>
                                <span>📅 2시간 전</span>
                            </div>
                        </div>

                        {/* 프로젝트 카드 2 */}
                        <div className="card project-card">
                            <div className="project-icon">📂</div>
                            <h3>마케팅 과제</h3>
                            <p className="project-desc">브랜드 전략 수립 및 분석</p>
                            <div className="progress-bar">
                                <div className="fill" style={{width: '30%'}}></div>
                            </div>
                            <div className="card-footer">
                                <span>👤 2명</span>
                                <span>📅 1일 전</span>
                            </div>
                        </div>
                    </div>
                </section>
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


export default App
