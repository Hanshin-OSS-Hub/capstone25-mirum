import { useState } from 'react';
import {
    HiOutlineBell, HiOutlineFolder, HiCheck, HiOutlineUsers, HiPlus,
    HiHome, HiUser // 👈 아이콘 추가 임포트
} from "react-icons/hi2";
import CreateProjectModal from './CreateProject';
import '../App.css'
import { useNavigate } from "react-router-dom";


function Home(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState(props.projects || []);

    const navigate = useNavigate();   // ✅ 이 줄 추가

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
                                    <strong>{projects.length}</strong>
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
                                <button className="primary-btn" onClick={() => setIsModalOpen(true)}>+ 새 프로젝트</button>
                            </div>

                            <div className="project-grid">
                            {
                                projects.map((project) => {
                                    return(
                                        // 1. 최상위 요소에 고유한 'key'를 추가합니다. (project.id가 가장 이상적입니다.)
                                        <div
                                            key={project.id}
                                            className="card project-card"
                                            onClick={() =>
                                                navigate(`/project/${project.id}`, {
                                                state: { project },   // ✅ 프로젝트 전체 정보를 함께 넘김
                                                })
                                            }
                                        >
                                            <div className="project-header">
                                                <div className="project-text">
                                                    {/* 2. 하드코딩된 텍스트를 props로 받은 데이터로 교체합니다. */}
                                                    <h3>{project.title}</h3>
                                                    <p className="project-desc">{project.description}</p>
                                                </div>

                                                <div className="project-icon">📂</div>
                                            </div>

                                            <div className="progress-bar">
                                                {/* 3. 진행률(progress)과 같은 동적인 데이터도 style에 적용할 수 있습니다. */}
                                                <div className="full" style={{ width: `${project.progress}%` }}></div>
                                            </div>

                                            <div className="card-footer">
                                                {/* 4. 나머지 데이터도 모두 동적으로 렌더링합니다. */}
                                                
                                            <span>👤 {project.members.length || 0}명</span>
                                            <span>📅 {project.day ? project.day.slice(0, 10) : "날짜 미정"}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                                 {/* 프로젝트 카드 1 */}
                                {/* <div className="card project-card">
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
                                </div> */}


                                {/*<div className="card project-card">
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
                                </div> */}

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
                            
                                <CreateProjectModal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    onCreateProjectSuccess={(data) => {
                                        setIsModalOpen(false);
                                        alert("프로젝트 생성 완료!");
                                        setProjects((prev) => [...prev, data]);
                                    }}
                                />

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

// function Home() {
//     return(
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//                 <i className="ri-team-line text-white text-lg"></i>
//               </div>
//               <h1 className="text-xl font-bold text-gray-900">mirum</h1>
//             </div>
//             <button
//               onClick={() => setIsCreateModalOpen(true)}
//               className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
//             >
//               <i className="ri-add-line text-lg"></i>
//               <span>새 프로젝트</span>
//             </button>
//           </div>
//         </div>
//       </header>
//       </div>
//       )
// }

export default Home;