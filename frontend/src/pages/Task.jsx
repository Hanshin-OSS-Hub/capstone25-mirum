import { useMemo, useState } from "react";
import TaskCard from "../features/tasks/components/TaskCard.jsx";
import TaskModal from "../features/tasks/components/TaskModal.jsx";
import CreateTaskModal from "../features/tasks/components/CreateTaskModal.jsx";

export default function Task() {
  // ✅ 지금은 임시. 나중에 로그인 유저 이름으로 교체
  const currentUserName = "김민수";

  const [teamMembers] = useState([
    { id: 1, name: "김민수", role: "팀장", email: "minsu@university.ac.kr" },
    { id: 2, name: "이지영", role: "디자이너", email: "jiyoung@university.ac.kr" },
    { id: 3, name: "박준호", role: "개발자", email: "junho@university.ac.kr" },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "UI 디자인 완료",
      description:
          "메인 페이지와 로그인 페이지의 UI 디자인을 완료해야 합니다. 사용자 경험을 고려하여 직관적인 인터페이스를 구성해 주세요.",
      assignee: "김민수",
      dueDate: "2024-01-15",
      status: "completed",
      tags: ["디자인", "UI/UX"],
      createdAt: "2024-01-10",
      updatedAt: "2024-03-04",
      notes: "",
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return { total, todo, inProgress, completed };
  }, [tasks]);

  const todayISO = () => new Date().toISOString().split("T")[0];

  const handleCreateTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description || "",
      assignee: taskData.assignee || teamMembers[0]?.name || "",
      dueDate: taskData.dueDate || "",
      status: "todo",
      tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      createdAt: todayISO(),
      updatedAt: todayISO(),
      notes: "",
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    setSelectedTask(updated);
  };

  const openTask = (task) => setSelectedTask(task);
  const closeTask = () => setSelectedTask(null);

  const tasksByMember = useMemo(() => {
    const map = {};
    teamMembers.forEach((m) => (map[m.name] = []));
    tasks.forEach((t) => {
      if (!map[t.assignee]) map[t.assignee] = [];
      map[t.assignee].push(t);
    });
    return map;
  }, [tasks, teamMembers]);

  const getInitial = (name) => (name ? name.trim().slice(0, 1) : "?");

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="text-2xl font-bold text-gray-900">Mirum</div>
            </div>

            <button
                type="button"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => window.history.back()}
            >
              <i className="ri-arrow-left-line"></i>
              <span className="font-medium">전체 프로젝트</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">대학생 협업 프로젝트</h1>
              <p className="text-sm text-gray-500 mt-1">팀원들과 함께 작업을 관리하세요</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                파일
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                캘린더
              </button>
              <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                새 작업
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="전체 작업" value={stats.total} />
            <SummaryCard title="대기" value={stats.todo} />
            <SummaryCard title="진행중" value={stats.inProgress} />
            <SummaryCard title="완료" value={stats.completed} />
          </div>

          {/* Members */}
          <div className="space-y-6">
            {teamMembers.map((member) => {
              const list = tasksByMember[member.name] || [];
              const doneCount = list.filter((t) => t.status === "completed").length;

              return (
                  <div key={member.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                          {getInitial(member.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg font-semibold text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500 truncate">
                            {member.role} · {member.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-gray-600">
                          작업 <span className="font-semibold text-gray-900">{list.length}</span>개
                        </div>
                        <div className="text-green-700">
                          완료 <span className="font-semibold">{doneCount}</span>개
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      {list.length === 0 ? (
                          <div className="h-28 flex items-center justify-center text-gray-400">
                            아직 할당된 작업이 없습니다.
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {list.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={{ ...task, tags: Array.isArray(task.tags) ? task.tags : [] }}
                                    onClick={() => openTask(task)}
                                />
                            ))}
                          </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* Create */}
        <CreateTaskModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreateTask}
            teamMembers={teamMembers}
        />

        {/* Detail */}
        {selectedTask && (
            <TaskModal
                task={{ ...selectedTask, tags: Array.isArray(selectedTask.tags) ? selectedTask.tags : [] }}
                onClose={closeTask}
                onUpdate={handleUpdateTask}
                teamMembers={teamMembers}
                currentUserName={currentUserName}   // ✅ 이게 핵심
            />
        )}
      </div>
  );
}

function SummaryCard({ title, value }) {
  return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      </div>
  );
}