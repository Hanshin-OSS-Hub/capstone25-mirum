export const mockHistory = [
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
        },
        // {
        //     id: 4,
        //     activity: "comment",
        //     projectName: "마케팅 캠페인",
        //     taskName: "SNS 홍보 전략",
        //     user: "최지은",
        //     date: "2025-12-17 11:15 AM"
        // },
        {
            id: 5,
            activity: "assign task",
            projectName: "데이터 분석 프로젝트",
            taskName: "데이터 수집",
            user: "한수진",
            date: "2025-12-16 03:00 PM"
        },
        {
            id: 6,
            activity: "change deadline",
            projectName: "콘텐츠 제작 프로젝트",
            taskName: "영상 편집",
            user: "김영수",
            date: "2025-12-15 01:20 PM"
        },
        {
            id: 7,
            activity: "upload file",
            projectName: "콘텐츠 제작 프로젝트",
            taskName: "영상 편집",
            user: "김영수",
            date: "2025-12-15 01:20 PM"
        },
        {
            id: 8,
            activity: "start task",
            projectName: "고객 지원 시스템 개선",
            taskName: "요구사항 분석",
            user: "이민호",
            date: "2025-12-14 10:10 AM"
        },
        {
            id: 9,
            activity: "complete project",
            projectName: "웹 개발 프로젝트",
            taskName: "기획서 작성",
            user: "김철수",
            date: "2025-12-20 10:00 AM"
        },
        {
            id: 10,
            activity: "approve",
            projectName: "백엔드 개발 프로젝트",
            taskName: "API 설계",
            user: "박민수",
            date: "2025-12-18 09:45 AM"
        },
        {
            id: 11,
            activity: "reject",
            projectName: "마케팅 캠페인",
            taskName: "SNS 홍보 전략",
            user: "최지은",
            date: "2025-12-17 11:15 AM"
        },
        {
            id: 12,
            activity: "update task",
            projectName: "데이터 분석 프로젝트",
            taskName: "데이터 수집",
            user: "한수진",
            date: "2025-12-16 03:00 PM"
        }
    ];

export const HistoryIcon = [
    { type: "create task", icon: "📝", backgroundColor: "#fbbf24", desc: "작업을 생성했습니다" },
    { type: "request review", icon: "👥", backgroundColor: "#3b82f6", desc: "리뷰를 요청했습니다" },
    { type: "complete task", icon: "🏆", backgroundColor: "#22c55e", desc: "작업을 완료했습니다" },
    { type: "update task", icon: "🔄", backgroundColor: "#8b5cf6", desc: "작업을 업데이트했습니다" },
    { type: "delete task", icon: "🗑️", backgroundColor: "#ef4444", desc: "작업을 삭제했습니다" },
    // { type: "comment", icon: "💬", backgroundColor: "#10b981", desc: "댓글을 남겼습니다" },
    { type: "assign task", icon: "👤", backgroundColor: "#f97316", desc: "작업을 할당했습니다" },
    { type: "change deadline", icon: "⏰", backgroundColor: "#6366f1", desc: "마감일을 변경했습니다" },
    { type: "upload file", icon: "📎", backgroundColor: "#14b8a6", desc: "파일을 업로드했습니다" },
    { type: "start task", icon: "🚀", backgroundColor: "#06b6d4", desc: "작업을 시작했습니다" },
    { type: "complete project", icon: "🏆", backgroundColor: "#22c55e", desc: "프로젝트를 완료했습니다" },
    { type: "approve", icon: "✅", backgroundColor: "#22c55e", desc: "작업 내용을 검토 완료했습니다" },
    { type: "reject", icon: "❌", backgroundColor: "#ef4444", desc: "작업 내용을 승인 거부했습니다" },
];