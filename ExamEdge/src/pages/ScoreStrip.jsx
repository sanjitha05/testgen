import "./ScoreStrip.css";

export default function ScoreStrip({ data }) {
  return (
    <div className="score-strip">
      {data.map((item, idx) => (
        <div key={idx} className={`score-card ${item.type}`}>
          <div className="score-header">
            <span className="score-icon">{item.icon}</span>
            <span className="score-title">{item.label}</span>
          </div>

          <div className="score-value">
            <span className="score-main">{Number(item.score)}</span>
            <span className="score-total"> / {item.total}</span>
          </div>
  

          {/* <div
            className="score-indicator"
            style={{
              height: `${Math.min(
                (item.score / item.total) * 100,
                100
              )}%`,
            }}
          /> */}
        </div>
      ))}
    </div>
  );
}
