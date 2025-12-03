import './MobileProjectCard.css';

function MobileProjectCard(props) {

    const colorMap = {
        purple: { dot: "#a855f7", bg: "#f3e8ff" },
        blue:   { dot: "#3b82f6", bg: "#eff6ff" },
        green:  { dot: "#22c55e", bg: "#f0fdf4" },
    };

    const colorName = props.progress > 80 ? "purple" : (props.progress > 50 ? "blue" : "green");

    const theme = colorMap[colorName] || colorMap.blue;

    return (
        <>
          <div className="mobile-project-card" style={{ borderLeftColor: theme.dot }}>
            
            {/* 1. 카드 헤더: 색깔 점 + 제목 + 날짜 */}
            <div className="card-header-row">
                <div className="title-group">
                    <h3>{props.title}</h3>
                </div>
                <span className="date-text">{props.day}</span>
            </div>
            
            {/* 2. 설명 */}
            <p className="project-desc">{props.desc}</p>

            {/* 3. 카드 푸터: 멤버 + 진행률 */}
            <div className="card-footer-row">
                {/* 멤버 (동그라미 아바타) */}
                <div className="member-avatars">
                    {/* 멤버 이름이 배열로 들어오거나, 단순 텍스트인 경우 처리 */}
                    {Array.isArray(props.members) ? props.members.slice(0, 4).map((m, i) => (
                        <span key={i} className="avatar">{m}</span>
                    )) : <span className="avatar-text">{props.members[0]}</span>}
                </div>

                {/* 진행률 바 */}
                <div className="progress-wrapper">
                    <div className="progress-bar-slim">
                        <div className="fill" style={{ width: `${props.progress}%`, backgroundColor: theme.dot }} />
                    </div>
                    <span className="progress-text">{props.progress}%</span>
                </div>
            </div>
          </div>

            {/*<div className="card summary-card">*/}
            {/*    <div className="card-info">*/}
            {/*        <span>진행 중인 프로젝트</span>*/}
            {/*        <strong>2</strong>*/}
            {/*    </div>*/}
            {/*    <div className="icon-box blue">📂</div>*/}
            {/*</div>*/}
        </>
    )
}

export default MobileProjectCard;