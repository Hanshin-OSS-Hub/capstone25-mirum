import MobileProjectCard from '../components/MobileProjectCard';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiBars3, HiCheck, HiHome, HiOutlineFolder, HiOutlineRocketLaunch, HiOutlinePlus, HiEllipsisHorizontal } from "react-icons/hi2";
import "../App.css";

function MobileProjects(props) {
    const navigate = useNavigate();

    return (
        <>
          <div className="phone-mockup-wrapper">
            <div className="dashboard-container" style={ { justifyContent: "center"} }>
                <header className="header" style={ { marginBottom: "40px"} }>
                    <div className="header-left">
                        <div className="logo-box">M</div>
                        <span className="logo-text">Mirum</span>
                    </div>
                    <div className="header-right">
                        <button style={ { border: "1px solid #000", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
                            <HiOutlineBell size={20} />
                        </button>
                        <button style={ { border: "1px solid #000", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
                            <HiBars3 size={20} />
                        </button>
                    </div>
                </header>
                <div>
                    <section style={ { marginBottom: "10%" } }>
                        <div style={ { marginBottom: "5%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"} }>
                            <h2 style={ { border: "1px solid #000" } }>최근 프로젝트</h2>
                            <span style={ { border: "1px solid #000", fontSize: "12px" } }><HiOutlinePlus size={20} /></span>
                        </div>
                        <div className="project-list">
                            {props.projects.slice(0, 3).map((p, i) =>
                                <MobileProjectCard
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
                    {/* 전체 프로젝트 섹션 */}
                    <section style={ { marginBottom: "10%" } }>
                        <div style={ { marginBottom: "5%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"} }>
                            <h2 style={ { border: "1px solid #000" } }>전체</h2>
                            <span style={ { border: "1px solid #000", fontSize: "12px" } }><HiEllipsisHorizontal size={20} /></span>
                        </div>
                        <div className="project-list" key={props.projects.length}>
                            {props.projects.map((p, i) =>
                                <MobileProjectCard
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
            </div>
            <nav className="mobile-tab-bar">
                <button className={`tab-item ${props.activeTab === "home" ? "active" : ""}`} 
                onClick={() => { props.setActiveTab("home"); 
                                navigate("/mobile/dashboard"); }}>
                    <HiHome size={24} />
                    <span>홈</span>
                </button>

                <button className={`tab-item ${props.activeTab === "projects" ? "active" : ""}`} 
                onClick={() => { props.setActiveTab("projects");
                                navigate("/mobile/projects"); }}>
                    <HiOutlineRocketLaunch size={24} />
                    <span>프로젝트</span>
                </button>

                <button className="tab-item">
                    <HiCheck size={24} />
                    <span>작업</span>
                </button>

                <button className={`tab-item ${props.activeTab === "files" ? "active" : ""}`} 
                onClick={() => { props.setActiveTab("files");
                                navigate("/mobile/files"); }}>
                    <HiOutlineFolder size={24} />
                    <span>파일</span>
                </button>

                <button className="tab-item">
                    <div className="profile-btn">김</div>
                    <span>내 정보</span>
                </button>
            </nav>
          </div>
        </>
    )
}

export default MobileProjects;