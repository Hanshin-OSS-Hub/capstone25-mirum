import {useState, useEffect} from "react";
import '../App.css';
import { HiOutlineBell } from "react-icons/hi2";

function UrgentTasksDashboard() {

    const mockTasks = [
        {
            id: 1,
            title: "기획서 최종본 작성",
            assignees: ["김철수", "이영희"],
            status: "진행중",
            dueDate: "2025-12-28"
        },
        {
            id: 2,
            title: "API 명세서 검토",
            assignees: ["박민수"],
            status: "대기중",
            dueDate: "2025-12-27"
        },
        {
            id: 3,
            title: "UI 디자인 시안 제출",
            assignees: ["최지은", "홍길동", "박민수"],
            status: "완료",
            dueDate: "2025-12-24"
        },
        {
            id: 4,
            title: "DB 스키마 설계",
            assignees: ["이영희"],
            status: "진행중",
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
        <div style={ { border: "1px solid #000", display: "flex", flexDirection: "column"} }>
          <div style={ { marginBottom: "5%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"} }>
            <h2 style={ { border: "1px solid #000" } }>내 작업</h2>
            <span style={ { border: "1px solid #000", fontSize: "12px" } }>전체보기</span>
          </div>
          {/* <div className="mb-4 flex gap-2"> */}
          <div className="summary-cards" style={ { maxHeight: "500px", overflowY: "auto" } }>
            {
                tasks.length === 0 ? (
                <p style={ { textAlign: "center" } }>마감 임박 작업이 없습니다.</p>
                ) : (
                    tasks.slice(0, 3).map((task, index) => (
                    // <div key={index} className="bg-white rounded-lg p-4 shadow flex flex-1 items-center justify-between">
                    <div className="card summary-card" key={index} style={ { padding: "5%" } }>
                        <div style={ { width: "100%", display: "flex", flexDirection: "column"} }>
                            <div style={ { margin: "0", border: "1px solid #000", display: "flex", flexDirection: "row", justifyContent: "space-between"} }>
                                <h3 style={ {border: "1px solid #000"} }>{task.title}</h3>
                                <p style={ { width: "40px", height: "20px", fontSize: "12px", border: "1px solid #000", borderRadius: "25px", textAlign: "center" } }>뱃지</p> 
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



function MobileHome() {
    return (
        <>
        {/* <div className="max-w-[400px] mx-auto my-[50px] border-[10px] border-[#222] rounded-[40px] shadow-[0_0_15px_rgba(0, 0, 0, 0.4)] overflow-x-hidden overflow-y-auto [scrollbar-width:none] h-[700px]"> */}
        <div className="phone-mockup-wrapper">
            {/*<div className="flex flex-col font-[Pretendard, sans-serif] text-[#333] mx-auto min-h-full pt-0 pr-6 pb-10 pl-6 box-border"> */}
            <div className="dashboard-container">
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
                {/* <div className="pt-6 pr-0 pb-20 bg-transparent flex flex-1 justify-center"> */}
                <div style={ {paddingLeft: "5%", paddingRight: "5%"} }>
                    <UrgentTasksDashboard />
                </div>
            </div>
        </div>
        </>
    )
}

export default MobileHome;