import { useViewport } from '../useViewport';
import ProjectCard from '../components/ProjectCard';
import '../App.css';
import {
    HiOutlineBell, HiOutlineFolder, HiCheck, HiOutlineUsers, HiPlus,
    HiHome, HiUser // 👈 아이콘 추가 임포트
} from "react-icons/hi2";

function Home({ projects = [] }) {
    const { isMobile } = useViewport();

    return (
        <>
          <div className="dashboard-container">
            {/* /!* 1. 헤더 영역 *!/*/}
            {/* <Header /> */}
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
                        <h1>안녕하세요, 김미룸님! 👋</h1>
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
                                <span>함께 한 사람</span>
                                <strong>5</strong>
                            </div>
                            <div className="icon-box purple">👨‍👩‍👧‍👦</div>
                        </div>
                    </section>

                    {/* 내 프로젝트 섹션 */}
                    <section className="project-cards">
                        <div className="project-header">
                            <h2>내 프로젝트</h2>
                            <button className="primary-btn">+ 새 프로젝트</button>
                        </div>

                        {/* 화면 크기에 따라 다른 레이아웃과 컴포넌트를 렌더링 */}
                        <div className="project-grid">
                            {
                            projects.map((p, i) =>
                                    <ProjectCard
                                        key={i}
                                        title={p.title}
                                        desc={p.desc}
                                        progress={p.progress}
                                        members={p.members}
                                        day={p.day}
                                    />
                            )}
                        </div>
                    </section>
                </div>
            </main>
          </div> {/* 대시보드 컨테이너 닫기 */}
        </>
    )}

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
export default Home