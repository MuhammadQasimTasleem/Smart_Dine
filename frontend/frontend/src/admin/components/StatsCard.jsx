const StatsCard = ({ title, value, icon, trend, trendValue, color = "primary" }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-content">
        <h3 className="stats-card-title">{title}</h3>
        <p className="stats-card-value">{value}</p>
        {trend && (
          <span className={`stats-card-trend ${trend}`}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
