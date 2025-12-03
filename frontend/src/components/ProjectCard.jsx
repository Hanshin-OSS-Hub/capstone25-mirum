import './ProjectCard.css';

function ProjectCard(props) {
    const colorMap = {
        purple: { dot: "#a855f7", bg: "#f3e8ff", fill: "#9333ea" },
        blue:   { dot: "#3b82f6", bg: "#eff6ff", fill: "#2563eb" },
        green:  { dot: "#22c55e", bg: "#f0fdf4", fill: "#16a34a" },
    };

    // progress 값에 따라 동적으로 색상을 결정합니다.
    const colorName = props.progress > 80 ? "purple" : (props.progress > 50 ? "blue" : "green");
    const theme = colorMap[colorName] || colorMap.blue;

    return (
        <>
            <div className="project-card">
                <div className="project-header">
                    <div className="project-text">
                        <h3>{props.title}</h3>
                        <p className="project-desc">{props.desc}</p>
                    </div>
                    <div className="project-icon" style={{ backgroundColor: theme.bg }}>📂</div>
                </div>
                <div className="progress-bar">
                    {/* progress-bar의 fill 클래스에 동적 색상 적용 */}
                    <div className="fill" style={{ width: `${props.progress}%`, backgroundColor: theme.fill }}></div>
                </div>

                <div className="card-footer">
                    <span>👤 {props.members.length}명</span>
                    <span>📅 2시간 전</span>
                </div>
            </div>
        </>
    )
}

export default ProjectCard;