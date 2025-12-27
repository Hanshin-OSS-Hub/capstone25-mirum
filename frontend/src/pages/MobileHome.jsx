import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css';
import { HiOutlineBell, HiBars3 } from "react-icons/hi2";
import { HiHome, HiOutlineRocketLaunch, HiOutlineFolder, HiCheck } from "react-icons/hi2";

function History() {

    const mockHistory = [
        {
            id: 1,
            activity: "create task",
            projectName: "웹 개발 프로젝트",
            taskName: "기획서 작성",
            user: "김철수",
            date: "2025-12-20 10:00 AM"
        },
        {
            id: 2,
            activity: "request review",
            projectName: "모바일 앱 개발",
            taskName: "UI 디자인",
            user: "이영희",
            date: "2025-12-19 02:30 PM"
        },
        {
            id: 3,
            activity: "complete task",
            projectName: "백엔드 개발 프로젝트",
            taskName: "API 설계",
            user: "박민수",
            date: "2025-12-18 09:45 AM"
        }
    ];

    const HistoryIcon = [
        { type: "create task", icon: "📝", backgroundColor: "#fbbf24", desc: "작업을 생성했습니다" },
        { type: "request review", icon: "👥", backgroundColor: "#3b82f6", desc: "리뷰를 요청했습니다" },
        { type: "complete task", icon: "✅", backgroundColor: "#22c55e", desc: "작업을 완료했습니다" },
    ]

    const [history, setHistory] = useState(mockHistory);

        // useEffect(() => {
        //     fetch(`/users/${userId}/activity-history`)
        //     .then(response => response.json())
        //     .then(data => setHistory(data));
        // }, [userId]);

    return (
        <>
          <div style={ { border: "1px solid #000", display: "flex", flexDirection: "column"} }>
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
                        <p style={ { textAlign: "center" } }>최근 활동이 없습니다.</p>
                    )
                }
            </div>
          </div>
        </>
    )
}

function UrgentTasksDashboard() {

    const mockTasks = [
        {
            id: 1,
            title: "기획서 최종본 작성",
            assignees: ["김철수", "이영희"],
            status: "진행중",
            startDate: "2025-12-20",
            dueDate: "2025-12-28"
        },
        {
            id: 2,
            title: "API 명세서 검토",
            assignees: ["박민수"],
            status: "대기중",
            startDate: "2025-12-21",
            dueDate: "2025-12-27"
        },
        {
            id: 3,
            title: "UI 디자인 시안 제출",
            assignees: ["최지은", "홍길동", "박민수"],
            status: "완료",
            startDate: "2025-12-18",
            dueDate: "2025-12-24"
        },
        {
            id: 4,
            title: "DB 스키마 설계",
            assignees: ["이영희"],
            status: "진행중",
            startDate: "2025-12-22",
            dueDate: "2025-12-29"
        }
    ];

    const [tasks, setTasks] = useState(mockTasks);

    // useEffect(() => {
    //     fetch(`/users/${userId}/urgent-tasks`)
    //     .then(response => response.json())
    //     .then(data => setTasks(data));
    // }, [userId]);

    return (
        <div style={ { margin: "20px 0", display: "flex", flexDirection: "column"} }>
          {/* <div className="mb-4 flex gap-2"> */}
          <div className="summary-cards" style={ { maxHeight: "500px", overflowY: "auto", marginBottom: "0" } }>
            {
                tasks.length === 0 ? (
                <p style={ { textAlign: "center" } }>할당된 작업이 없습니다.</p>
                ) : (
                    tasks.slice(0, 3).map((task, index) => (
                    // <div key={index} className="bg-white rounded-lg p-4 shadow flex flex-1 items-center justify-between">
                    <div className="card summary-card" key={index} style={ { padding: "5%" } }>
                        <div style={ { width: "100%", display: "flex", flexDirection: "column"} }>
                            <div style={ { margin: "0", border: "1px solid #000", display: "flex", flexDirection: "row", justifyContent: "space-between"} }>
                                <h3 style={ {border: "1px solid #000"} }>{task.title}</h3>
                                <p style={ { width: "40px", height: "20px", fontSize: "12px", border: "1px solid #000", borderRadius: "25px", textAlign: "center" } }>{task.status}</p> 
                            </div>
                            <div style={ { fontSize: "12px", display: "flex", flexDirection: "row", justifyContent: "space-between"} }>
                                <span>{
                                    task.assignees.slice(0, 2).join(", ")
                                    + (task.assignees.length > 2 ? ` 등 ${task.assignees.length}명` : "")
                                }</span>
                                <span>{task.dueDate}</span>
                            </div>
                        </div>
                    </div> )
                    )
                )
            }           
          </div>
        </div>
    )
}

function SwipeableWeeklyCalendar({ weekDates, selectedIndex, onSelect, tasksByDate }) {

  return (
    <>
    <div style={{ width: "100%", margin: "20px 0" }}>
      {/* 스크롤 가능한 주간 캘린더 */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          marginBottom: "10px",
          gap: "4px",
          paddingBottom: "4px"
        }}
      >
        {
            weekDates.map((dateObj, idx) => (
            <div
                key={dateObj.date}
                style={{
                minWidth: "48px",
                textAlign: "center",
                padding: "8px 0",
                borderRadius: "12px",
                background: idx === selectedIndex ? "#2563eb" : "#f3f4f6",
                color: idx === selectedIndex ? "#fff" : "#333",
                fontWeight: idx === selectedIndex ? "bold" : "normal",
                cursor: "pointer"
                }}
                onClick={() => onSelect(idx)}
            >
                <div style={{ fontSize: "12px" }}>{dateObj.day}</div>
                <div style={{ fontSize: "16px" }}>{dateObj.date}</div>
            </div>
            ))
        }
      </div>

      {/* 선택한 날짜의 일정 리스트 */}
      <div style={{ border: "1px solid #000",  maxHeight: "100px", minHeight: "100px", background: "#fff", borderRadius: "12px", padding: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          {weekDates[selectedIndex].date}일 일정
        </div>
        {tasksByDate[weekDates[selectedIndex].date] && tasksByDate[weekDates[selectedIndex].date].length > 0 ? (
          tasksByDate[weekDates[selectedIndex].date].map((task, i) => (
            <div key={i} style={{ fontSize: "14px", marginBottom: "4px" }}>
              • {task}
            </div>
          ))
        ) : (
          <div style={{ fontSize: "14px", color: "#888" }}>일정이 없습니다.</div>
        )}
      </div>
    </div>
    </>
  );
}



function MobileHome(props) {
    const [selectedIndex, setSelectedIndex] = useState(1); // 예: 25일(월) 선택
    // const [tasks, setTasks] = useState([]);

    // 예시 weekDates: [{ day: "일", date: 24 }, ...]
    const weekDates = [
        { day: "일", date: 24 },
        { day: "월", date: 25 },
        { day: "화", date: 26 },
        { day: "수", date: 27 },
        { day: "목", date: 28 },
        { day: "금", date: 29 },
        { day: "토", date: 30 }
    ];

    const tasksByDate = {
        25: ["회의 참석", "API 설계 마감"],
        27: ["디자인 리뷰"],
        28: ["배포"]
    };

    const navigate = useNavigate();

    return (
        <>
        {/* <div className="max-w-[400px] mx-auto my-[50px] border-[10px] border-[#222] rounded-[40px] shadow-[0_0_15px_rgba(0, 0, 0, 0.4)] overflow-x-hidden overflow-y-auto [scrollbar-width:none] h-[700px]"> */}
        <div className="phone-mockup-wrapper">
            {/*<div className="flex flex-col font-[Pretendard, sans-serif] text-[#333] mx-auto min-h-full pt-0 pr-6 pb-10 pl-6 box-border"> */}
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
                {/* <div className="pt-6 pr-0 pb-20 bg-transparent flex flex-1 justify-center"> */}
                <div>
                  <section style={ { marginBottom: "40px"} }>
                    <div style={ { marginBottom: "5%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"} }>
                        <h2 style={ { border: "1px solid #000" } }>주간 일정</h2>
                        <span style={ { border: "1px solid #000", fontSize: "12px" } }>전체보기</span>
                    </div>
                    <SwipeableWeeklyCalendar 
                        weekDates={weekDates}
                        selectedIndex={selectedIndex}
                        onSelect={setSelectedIndex}
                        tasksByDate={tasksByDate}
                    />
                  </section>
                  <section style={ { marginBottom: "40px"} }>
                    <div style={ { marginBottom: "5%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"} }>
                        <h2 style={ { border: "1px solid #000" } }>내 작업</h2>
                        <span style={ { border: "1px solid #000", fontSize: "12px" } }>전체보기</span>
                    </div>
                    <UrgentTasksDashboard />
                  </section>
                  <section>
                    <div style={ { marginBottom: "5%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"} }>
                        <h2 style={ { border: "1px solid #000" } }>최근 활동</h2>
                        <span style={ { border: "1px solid #000", fontSize: "12px" } }>전체보기</span>
                    </div>
                    <History />
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

export default MobileHome;