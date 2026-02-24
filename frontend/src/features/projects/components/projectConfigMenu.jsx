import { useNavigate } from "react-router-dom";
import { useDeleteProject } from "@/features/projects/api/useDeleteProject.js";

export default function ProjectConfigMenu(props) {
  const navigate = useNavigate();

  const { projectId, setIsConfigMenuOpen, setIsUpdateModalOpen, setIsMemberModalOpen } = props;
  const { mutate: deleteProject } = useDeleteProject();

  const handleDeleteProject = () => {
    if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      deleteProject(projectId, {
        onSuccess: () => {
          navigate("/dashboard");
        }
      });
    }
  }

  return (
      <div style={ { position: "absolute", top: 40, right: 0, background: "#fff", border: "1px solid #ccc", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 1000, } }>
          <span style={ { padding: "2.5px 5px 0 0", display: "block", fontSize: 11, cursor: "pointer", textAlign: "right" } }
                onClick={() => props.setIsConfigMenuOpen(false)}>
            ✕
          </span>
        <ul style={ { display: "flex", flexDirection: "column", listStyle: "none", padding: 10, gap: 10 } }>
          <li style={{ cursor: "pointer" }} onClick={() => { setIsConfigMenuOpen(false); setIsMemberModalOpen(true); }}>멤버 관리</li>
          <li style={{ cursor: "pointer" }} onClick={() => { setIsConfigMenuOpen(false); setIsUpdateModalOpen(true); }}>프로젝트 수정</li>
          <li style={{ cursor: "pointer" }} onClick={() => { setIsConfigMenuOpen(false); handleDeleteProject(); }}>프로젝트 삭제</li>
        </ul>
      </div>
  );
}
