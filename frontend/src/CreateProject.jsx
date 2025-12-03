// src/createproject.jsx
import { useState } from "react";
import "./createproject.css";

function CreateProject({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      description: desc.trim(),
    });

    setName("");
    setDesc("");
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div
        className="cp-modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="cp-header">
          <h2>새 프로젝트 만들기</h2>
          <button className="cp-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 상단 스텝 표시 (1,2,3) */}
        <div className="cp-steps">
          <div className="cp-step cp-step-active">1</div>
          <div className="cp-step-line" />
          <div className="cp-step">2</div>
          <div className="cp-step-line" />
          <div className="cp-step">3</div>
        </div>

        <form className="cp-form" onSubmit={handleSubmit}>
          <label className="cp-label">
            프로젝트 이름<span className="cp-required">*</span>
            <input
              className="cp-input"
              placeholder="예: 캡스톤 디자인 프로젝트"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="cp-label">
            프로젝트 설명 <span className="cp-optional">(선택사항)</span>
            <textarea
              className="cp-textarea"
              placeholder="프로젝트에 대한 간단한 설명을 입력하세요."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
            />
          </label>

          <div className="cp-footer">
            <button
              type="button"
              className="cp-button cp-button-ghost"
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className="cp-button cp-button-primary">
              다음
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;
