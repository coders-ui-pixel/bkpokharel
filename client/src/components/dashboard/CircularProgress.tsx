interface CircularProgressProps {
  percent: number;
  label: string;
  size?: number;
}

export function CircularProgress({ percent, label, size = 120 }: CircularProgressProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const offset = circumference * (1 - clampedPercent / 100);

  return (
    <div className="circular-progress">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="circular-progress__value">
          {Math.round(clampedPercent)}%
        </text>
      </svg>
      <span className="circular-progress__label">{label}</span>
    </div>
  );
}
