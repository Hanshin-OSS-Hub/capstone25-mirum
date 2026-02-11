import { useState } from 'react';

function ProjectUpdateModal(props) {
    const [projectId, setProjectId] = useState(props.id || null);
    const [projectTitle, setProjectTitle] = useState(props.project?.projectName || '');
    const [projectDesc, setProjectDesc] = useState(props.project?.description || '');

    const handleClose = () => {
      if (props.onClose) {
          props.onClose();
      }
    }

    const handleSubmit = (event) => {   
      event.preventDefault();
      props.onUpdate({
        projectId: projectId,
        projectName: projectTitle,
        description: projectDesc
      });
    }

    return (
        <>
          <div style={ { position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center" } }>
            <div style={ { position: "relative", padding: "48px 56px 40px", width: "440px", border: "1px solid #e5e7eb", borderRadius: "32px", backgroundColor: "#fff", boxShadow: "0 20px 45px rgba(15, 23, 42, 0.16)"} }>
              <button style={ { position: "absolute", top: "18px", right: "22px", border: "None", background: "transparent", fontSize: "20px", color: "#9ca3af", cursor: "pointer"} }
                type='button' onClick={handleClose}
              >
                ✕
              </button>

              <h1 style={ { marginBottom: "24px", fontSize: "24px", fontWeight: "bold", color: "#111827", textAlign: "center"} }>프로젝트 수정</h1>

              <form onSubmit={handleSubmit} style={ { display: "flex", flexDirection: "column", gap: "20px" } }>
                <input type="text" value={projectTitle} placeholder="프로젝트 이름" style={ { width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "16px" } }
                onChange={(event) => setProjectTitle(event.target.value)} />
                <textarea value={projectDesc} placeholder="프로젝트 설명" style={ { width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "16px", minHeight: "100px", resize: "none" } }
                onChange={(event) => setProjectDesc(event.target.value)} />
                {
                  props.error && <div style={ { color: "red", fontSize: "14px" } }>{props.error}</div>
                }
                <button disabled={!projectTitle} type='submit' className={projectTitle ? 'login-button' : 'login-secondary-button'}>
                  수정하기
                </button>
              </form>
            </div>
          </div>
        </>
    );
}

export default ProjectUpdateModal;