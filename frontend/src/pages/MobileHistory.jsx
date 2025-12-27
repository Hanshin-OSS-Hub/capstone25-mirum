import { useNavigate } from "react-router-dom";
import "../App.css";
import { HiOutlineBell, HiBars3 } from "react-icons/hi2";
import { HiHome, HiOutlineRocketLaunch, HiCheck, HiOutlineFolder } from "react-icons/hi2";
import { mockHistory, HistoryIcon } from "../data/activityHistory.js";

function MobileHistory(props) {

    const navigate = useNavigate();

    return (
    <>
        <div className="phone-mockup-wrapper">
            <div className="dashboard-container">
              <header className="header">
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
                <section>
                    <div style={ {  display: "flex", flexDirection: "column"} }>
                        <h2 style={ { marginBottom: "5%", padding: "5%" } }>최근 활동 내역</h2>
                    <div className="summary-cards" style={ { maxHeight: "500px", overflowY: "auto", marginBottom: "0" } }>
                        {
                            mockHistory.length > 0 ? mockHistory.map((item, index) => (
                                <div key={index} className="card summary-card" style={ { padding: "5%" } }>
                                <div style={ { width: "100%", display: "flex", flexDirection: "column"} }>
                                    <div style={ { margin: "0",  display: "flex", flexDirection: "column", justifyContent: "center"} }>
                                        <div style={ { padding: "5px 0", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: "10px" } }>
                                            <div style={{ backgroundColor: HistoryIcon.find(icon => icon.type === item.activity).backgroundColor, width: "25px", height: "25px", border: "none", borderRadius: "10px", textAlign: "center",  margin: "5px" }}>
                                                <span>{HistoryIcon.find(icon => icon.type === item.activity).icon}</span>
                                            </div>
                                            <span style={ { fontSize: "14px" } }>{item.user}님이 {HistoryIcon.find(icon => icon.type === item.activity).desc}.</span>
                                        </div>
                                        <div style={ { marginLeft: "5px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"} }>
                                            <div style={ { fontSize: "12px", color: "#888" } }>{item.projectName} - {item.taskName}</div>
                                            <span style={ { fontSize: "12px", color: "#888" } }>{item.date}</span>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            )) : (
                                <p style={ { textAlign: "center", color: "#888"} }>최근 활동이 없습니다.</p>
                            )
                        }
                    </div>
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

export default MobileHistory;