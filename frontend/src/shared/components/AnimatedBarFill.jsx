import { useEffect, useState } from 'react';

/**
 * 가로 막대 폭을 0에서 목표 %까지 부드럽게 채웁니다 (DOM용 미니 차트·진행 바).
 * @param {object} props
 * @param {number} props.targetPercent - 0~100
 * @param {number} [props.durationMs]
 * @param {string} [props.trackClassName]
 * @param {string} props.barClassName
 */
export default function AnimatedBarFill({
  targetPercent,
  durationMs = 1000,
  trackClassName = 'h-2 w-full rounded-full bg-muted overflow-hidden',
  barClassName,
}) {
  const [widthPct, setWidthPct] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const start = performance.now();
    const to = Math.min(100, Math.max(0, Number(targetPercent) || 0));
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setWidthPct(to * eased);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [targetPercent, durationMs]);

  return (
    <div className={trackClassName}>
      <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${widthPct}%` }} />
    </div>
  );
}
