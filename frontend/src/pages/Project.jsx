// src/pages/Project.jsx
import React from "react";
import "./Project.css";
import "../App.css";
import { useLocation, useParams, useNavigate } from "react-router-dom";

function Project() {
  const navigate = useNavigate();
  const { id } = useParams();                 // /project/:id 에서 id 읽기
  const location = useLocation();
  const project = location.state?.project;    // Home에서 넘긴 project 객체

  // 새로고침 등으로 state가 날아갔을 때 대비
  const name = project?.title || "프로젝트 이름";
  const desc = project?.description || "프로젝트 설명";
  const memberCount = Array.isArray(project?.member)
    ? project.member.length
    : 0;
  const day = project?.day ? project.day.slice(0, 10) : "날짜 미정";

  const handleBack = () => {
    navigate("/dashboard"); // 대시보드(홈)로 돌아가기
  };

  // project 자체가 없는 경우 간단한 예외 화면
  if (!project) {
    return (
      <div className="pj-root">
        <header className="pj-top-bar">
          <div className="pj-top-inner">
            <div className="logo-area">
              <div className="logo-icon">M</div>
              <span className="logo-text">Mirum</span>
            </div>

            <div className="top-right">
              <button className="icon-button" onClick={handleBack}>
                ← 전체 프로젝트
              </button>
            </div>
          </div>
        </header>

        <main className="pj-main">
          <h1 className="pj-title">프로젝트 정보를 불러올 수 없습니다.</h1>
          <p className="pj-sub">URL id: {id}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="pj-root">
      <header className="pj-top-bar">
          <div className="pj-top-inner">
            <div className="logo-area">
              <div className="logo-icon">M</div>
              <span className="logo-text">Mirum</span>
            </div>

            <div className="top-right">
              <button className="icon-button" onClick={handleBack}>
                ← 전체 프로젝트
              </button>
            </div>
          </div>
        </header>

      <main className="pj-main">
        <div className="pj-header-row">
          <div>
            <h1 className="pj-title">{name}</h1>
            <p className="pj-sub">
              {desc}
              <br />
              <span style={{ fontSize: "14px", color: "#8b8b99" }}>
                시작일: {day} · 프로젝트 ID: {id}
              </span>
            </p>
          </div>

          <button className="pj-new-task-btn">+ 새 작업</button>
        </div>

        {/* 상단 요약 카드 4개 */}
        <section className="pj-summary-row">
          <div className="pj-summary-card">
            <span className="pj-summary-label">전체 작업</span>
            <span className="pj-summary-value">1</span>
          </div>
          <div className="pj-summary-card">
            <span className="pj-summary-label">완료</span>
            <span className="pj-summary-value">1</span>
          </div>
          <div className="pj-summary-card">
            <span className="pj-summary-label">진행중</span>
            <span className="pj-summary-value">0</span>
          </div>
          <div className="pj-summary-card">
            <span className="pj-summary-label">팀원</span>
            <span className="pj-summary-value">{memberCount}</span>
          </div>
        </section>

        {/* 멤버별 작업 리스트 */}
        <section className="pj-members">
          {/* 첫 번째 팀원 카드 (예시) */}
          <div className="pj-member-card">
            <div className="pj-member-header">
              <div className="pj-member-left">
                <div className="pj-member-avatar">박</div>
                <div>
                  <div className="pj-member-name">박규민</div>
                  <div className="pj-member-role">
                    디자이너 · minsue@university.ac.kr
                  </div>
                </div>
              </div>

              <div className="pj-member-stats">
                <span>작업 1개</span>
                <span className="pj-divider">·</span>
                <span>완료 1개</span>
              </div>
            </div>


            <div className="pj-task-card">
              <div className="pj-task-header">
                <div>
                  <span className="pj-badge pj-badge-red">높음</span>
                  <span className="pj-task-title">UI 디자인 완료</span>
                </div>
                <span className="pj-task-date">1월 15일</span>
              </div>
              <p className="pj-task-desc">
                메인 페이지와 로그인 페이지의 UI 디자인을 완료해야 합니다.
                사용자 경험을 고려하여 직관적인 인터페이스를 구성하세요.
              </p>
              <div className="pj-task-tags">
                <span className="pj-tag">디자인</span>
                <span className="pj-tag">UI/UX</span>
              </div>
            </div>
          </div>

          {/* 두 번째 팀원 (작업 없음 예시) */}
          <div className="pj-member-card">
            <div className="pj-member-header">
              <div className="pj-member-left">
                <div className="pj-member-avatar">백</div>
                <div>
                  <div className="pj-member-name">백종빈</div>
                  <div className="pj-member-role">
                    디자이너 · minsue@university.ac.kr
                  </div>
                </div>
              </div>

              <div className="pj-member-stats">
                <span>작업 1개</span>
                <span className="pj-divider">·</span>
                <span>완료 1개</span>
              </div>
            </div>
          </div>

          {/* 세 번째 팀원 예시 */}
          <div className="pj-member-card">
            <div className="pj-member-header">
              <div className="pj-member-left">
                <div className="pj-member-avatar">허</div>
                <div>
                  <div className="pj-member-name">허지훈</div>
                  <div className="pj-member-role">
                    디자이너 · minsue@university.ac.kr
                  </div>
                </div>
              </div>

              <div className="pj-member-stats">
                <span>작업 1개</span>
                <span className="pj-divider">·</span>
                <span>완료 1개</span>
              </div>
            </div>
          </div>

            <div className="pj-empty-tasks">
              아직 할당된 작업이 없습니다
              <button className="pj-link-button">새 작업 만들기</button>
            </div>
          
        </section>
      </main>
    </div>
  );
}

export default Project;
