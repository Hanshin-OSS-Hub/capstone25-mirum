import { useEffect, useMemo, useRef, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  MIRUM_BAR_CHART_ANIMATION,
  MIRUM_BAR_NUMBERS_ANIMATION,
} from '@/features/ai/chart/mirumBarChartAnimation.js';
import {
  mirumLineRevealPlugin,
  setMirumLineRevealProgress,
} from '@/features/ai/chart/mirumLineRevealPlugin.js';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { IconRefresh, IconRobot, IconSparkles } from '@/shared/assets/icons.js';
import { LoadingSpinner } from '@/shared/components/index.js';
import { useIsDarkTheme } from '@/shared/hooks/useIsDarkTheme.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  mirumLineRevealPlugin,
);

const chartColor = {
  inProgress: '#60A5FA',
  done: '#2563EB',
};

const weekLabels = ['월', '화', '수', '목', '금', '토', '일'];

const isValidDate = (value) => {
  if (!value) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime());
};
const getHealthStatus = (healthScore) => {
  if (healthScore >= 70) return { label: '양호', tone: 'text-emerald-600' };
  if (healthScore >= 40) return { label: '주의', tone: 'text-amber-600' };
  return { label: '위험', tone: 'text-rose-600' };
};
const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed;
};
const formatDateTime = (iso) => {
  const d = toDate(iso);
  if (!d) return '-';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(
    2,
    '0',
  )} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * 프로젝트 분석 리포트 뷰어 컴포넌트
 * @param {object} props
 * @param {string} props.report - 마크다운 형식의 리포트 내용
 * @param {boolean} props.isLoading - 생성 중 여부
 * @param {Function} props.onGenerate - 리포트 생성 시작 콜백
 * @param {object} props.context - 프로젝트/작업/멤버 컨텍스트
 * @param {{id: string, label: string, createdAt: string, report: string}[]} [props.reportHistory]
 * @param {string | null} [props.activeReportId]
 * @param {(reportId: string) => void} [props.onSelectReport]
 */
export default function ProjectReportView({
  report,
  isLoading,
  onGenerate,
  context,
  reportHistory = [],
  activeReportId = null,
  onSelectReport,
}) {
  const isDarkTheme = useIsDarkTheme();
  const summary = context?.summary || { total: 0, todo: 0, inProgress: 0, completed: 0 };
  const tasks = useMemo(
    () => (Array.isArray(context?.tasks) ? context.tasks : []),
    [context?.tasks],
  );
  const members = useMemo(
    () => (Array.isArray(context?.members) ? context.members : []),
    [context?.members],
  );
  const totalTasks = summary.total || tasks.length;
  const completedTasks = summary.completed || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const unassignedCount = tasks.filter((task) => !task.assigneeId).length;
  const analysisPeriodDays = 7;
  const analysisStartTime = Date.now() - analysisPeriodDays * 24 * 60 * 60 * 1000;
  const completedWithDueDate = tasks.filter((task) => {
    if (task.status !== 'DONE') return false;
    return Boolean(toDate(task.dueDate)) && Boolean(toDate(task.updatedDate));
  });
  const scheduleMargins = completedWithDueDate
    .map((task) => {
      const due = toDate(task.dueDate);
      const updated = toDate(task.updatedDate);
      if (!due || !updated) return null;
      return Math.floor((due.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
    })
    .filter((margin) => typeof margin === 'number');
  const averageScheduleMargin =
    scheduleMargins.length > 0
      ? Number(
          (scheduleMargins.reduce((sum, value) => sum + value, 0) / scheduleMargins.length).toFixed(
            1,
          ),
        )
      : 0;
  const delayedDoneCount = scheduleMargins.filter((margin) => margin < 0).length;

  const statusChangedTasks = tasks.filter((task) => {
    const created = toDate(task.createdDate);
    const updated = toDate(task.updatedDate);
    if (!created || !updated) return false;
    if (updated.getTime() < analysisStartTime) return false;
    return updated.getTime() - created.getTime() > 60 * 60 * 1000;
  }).length;
  const statusChangeRate = totalTasks > 0 ? Math.round((statusChangedTasks / totalTasks) * 100) : 0;
  const delayedPenalty = totalTasks > 0 ? Math.round((delayedDoneCount / totalTasks) * 25) : 0;
  const unassignedPenalty = totalTasks > 0 ? Math.round((unassignedCount / totalTasks) * 20) : 0;
  const stagnationPenalty = Math.max(0, 12 - Math.round(statusChangeRate * 0.2));
  const healthScore = Math.max(
    0,
    Math.min(100, completionRate - delayedPenalty - unassignedPenalty - stagnationPenalty),
  );
  const health = getHealthStatus(healthScore);

  const [displayedHealthScore, setDisplayedHealthScore] = useState(0);
  /** 로딩 스피너가 떠 있는 동안 돌리면 끝난 뒤에야 화면이 보여 애니메이션이 안 보임 → 리포트 본문이 있을 때만 실행 */
  useEffect(() => {
    if (isLoading || !report) return;

    let rafId = 0;
    let cancelled = false;
    const durationMs = 1000;
    const from = 0;
    const to = healthScore;
    const start = performance.now();

    setDisplayedHealthScore(0);

    const tick = (now) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setDisplayedHealthScore(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [healthScore, isLoading, report]);

  const weeklyTrendData = useMemo(() => {
    const createdByDay = Array(7).fill(0);
    const doneByDay = Array(7).fill(0);
    tasks.forEach((task) => {
      if (isValidDate(task.dueDate)) {
        const dayIndex = new Date(task.dueDate).getDay();
        const index = (dayIndex + 6) % 7;
        createdByDay[index] += 1;
        if (task.status === 'DONE') {
          doneByDay[index] += 1;
        }
      }
    });
    return {
      labels: weekLabels,
      datasets: [
        {
          label: '마감 예정 작업',
          data: createdByDay,
          borderColor: chartColor.inProgress,
          backgroundColor: 'rgba(96,165,250,0.2)',
          tension: 0.35,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
        {
          label: '완료 작업',
          data: doneByDay,
          borderColor: chartColor.done,
          backgroundColor: 'rgba(37,99,235,0.18)',
          tension: 0.35,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [tasks]);

  const trendKey = useMemo(() => {
    const a = weeklyTrendData.datasets[0]?.data?.join(',') ?? '';
    const b = weeklyTrendData.datasets[1]?.data?.join(',') ?? '';
    return `${a}|${b}`;
  }, [weeklyTrendData]);

  const { memberLoadData, memberEntries } = useMemo(() => {
    const memberNameById = new Map(members.map((member) => [member.name, member.name]));
    const memberTaskMap = new Map();
    tasks.forEach((task) => {
      const key = task.assigneeId || 'UNASSIGNED';
      memberTaskMap.set(key, (memberTaskMap.get(key) || 0) + 1);
    });
    const entries = Array.from(memberTaskMap.entries()).sort((left, right) => right[1] - left[1]);
    return {
      memberEntries: entries,
      memberLoadData: {
        labels: entries.map(
          ([id]) => memberNameById.get(id) || (id === 'UNASSIGNED' ? '미배정' : id),
        ),
        datasets: [
          {
            label: '할당 작업 수',
            data: entries.map(([, count]) => count),
            backgroundColor: ['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#BFDBFE'],
            borderRadius: 8,
          },
        ],
      },
    };
  }, [tasks, members]);

  const memberBarKey = useMemo(
    () => memberLoadData.datasets[0]?.data?.join(',') ?? '',
    [memberLoadData],
  );

  const chartBaseOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDarkTheme ? '#94A3B8' : '#6B7280',
            font: { size: 11, weight: '700' },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: isDarkTheme ? '#94A3B8' : '#6B7280', font: { size: 11, weight: '700' } },
          grid: { color: isDarkTheme ? 'rgba(100,116,139,0.35)' : 'rgba(209,213,219,0.3)' },
        },
        y: {
          ticks: { color: isDarkTheme ? '#94A3B8' : '#6B7280', font: { size: 11, weight: '700' } },
          grid: { color: isDarkTheme ? 'rgba(100,116,139,0.35)' : 'rgba(209,213,219,0.3)' },
        },
      },
    }),
    [isDarkTheme],
  );

  const barChartOptions = useMemo(
    () => ({
      ...chartBaseOptions,
      animation: { ...MIRUM_BAR_CHART_ANIMATION },
      animations: {
        numbers: MIRUM_BAR_NUMBERS_ANIMATION,
      },
    }),
    [chartBaseOptions],
  );

  const lineChartOptions = useMemo(
    () => ({
      ...chartBaseOptions,
      animation: false,
      plugins: {
        ...chartBaseOptions.plugins,
        /** 진행도는 `setMirumLineRevealProgress`(WeakMap). 옵션만 두면 react-chartjs-2 병합 시 초기화됨 */
        mirumLineReveal: { enabled: true },
      },
    }),
    [chartBaseOptions],
  );

  const lineChartRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    /** @type {import('chart.js').Chart | null} */
    let activeLineChart = null;

    const runReveal = (chart) => {
      activeLineChart = chart;
      setMirumLineRevealProgress(chart, 0);
      chart.update('none');
      const durationMs = 1650;
      const start = performance.now();

      const tick = (now) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - start) / durationMs);
        setMirumLineRevealProgress(chart, progress);
        chart.update('none');
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setMirumLineRevealProgress(chart, 1);
          chart.update('none');
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    const waitForChart = () => {
      if (cancelled) return;
      const chart = lineChartRef.current;
      if (!chart) {
        rafId = requestAnimationFrame(waitForChart);
        return;
      }
      runReveal(chart);
    };

    waitForChart();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (activeLineChart) {
        setMirumLineRevealProgress(activeLineChart, 1);
      }
    };
  }, [trendKey]);

  const busiestMember = memberEntries[0] || null;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-border bg-card p-12 shadow-sm">
        <LoadingSpinner size="lg" label="AI가 프로젝트 전체 데이터를 정밀 분석 중입니다..." />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          모든 작업, 멤버 진행률, 마감 기한을 종합하여 리포트를 작성하고 있어요.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center transition-all hover:border-primary/40 hover:bg-primary/5">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary shadow-inner">
          <IconRobot size={40} className="text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">프로젝트 분석이 필요하신가요?</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          AI가 프로젝트의 현재 상태를 진단하고, 지연 위험이 있는 작업과 향후 성공 전략을 담은 전문
          리포트를 생성합니다.
        </p>
        <button
          onClick={onGenerate}
          className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95"
        >
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"></div>
          <IconSparkles size={20} />
          <span>분석 리포트 생성 시작하기</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI 리포트</h2>
        </div>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <IconRefresh size={16} />
          새로고침
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:row-span-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            프로젝트 건강도
          </p>
          <p
            className={`mt-3 text-5xl font-black transition-[opacity] duration-300 ${health.tone}`}
          >
            {displayedHealthScore}점
          </p>
          <p className={`mt-2 text-xl font-black ${health.tone}`}>{health.label}</p>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ width: `${displayedHealthScore}%` }}
            />
          </div>
          <div className="mt-4 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            기준: 70%+ 양호 · 40%+ 주의 · 그 외 위험
          </div>
        </div>
        {[
          { label: '전체 완료율', value: `${completionRate}%`, tone: 'text-blue-600' },
          { label: '주간 진척률', value: `${statusChangeRate}%`, tone: 'text-sky-600' },
          { label: '마감 지연 작업', value: `${delayedDoneCount}건`, tone: 'text-amber-600' },
          {
            label: '평균 마감 여유일',
            value: `${averageScheduleMargin > 0 ? '+' : ''}${averageScheduleMargin}일`,
            tone: 'text-indigo-600',
          },
          { label: '담당자 미배정', value: `${unassignedCount}건`, tone: 'text-rose-600' },
          {
            label: '최근 업데이트됨',
            value: `${statusChangedTasks}건`,
            tone: 'text-violet-600',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
            <p className={`mt-2 text-2xl font-black ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm xl:col-span-2">
          <h3 className="mb-3 text-sm font-black text-foreground">주간 작업 추이</h3>
          <div className="h-[280px]">
            <Line
              ref={lineChartRef}
              key={trendKey}
              data={weeklyTrendData}
              options={lineChartOptions}
            />
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-black text-foreground">주차별 리포트</h3>
          {reportHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">리포트 없음</p>
          ) : (
            <div className="space-y-2">
              {reportHistory.map((item) => {
                const isActive = item.id === activeReportId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectReport?.(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                      isActive
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] opacity-80">{formatDateTime(item.createdAt)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm xl:col-span-2">
          <h3 className="mb-3 text-sm font-black text-foreground">멤버별 작업 부하</h3>
          <div className="h-[280px]">
            <Bar key={memberBarKey} data={memberLoadData} options={barChartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-black text-foreground">AI 핵심 제안</h3>
          <ul className="space-y-3 text-sm font-medium text-muted-foreground">
            <li>
              -{' '}
              {busiestMember
                ? `${busiestMember[0]} 담당 작업이 ${busiestMember[1]}건으로 가장 높습니다.`
                : '멤버별 작업량 데이터를 확인하세요.'}
            </li>
            <li>- 지연 완료 작업은 {delayedDoneCount}건입니다.</li>
            <li>
              - 주간 작업 진척률은 {statusChangeRate}%로, 병목 가능 구간 점검이 필요합니다.
            </li>
          </ul>
        </div>
      </section>

      <details className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <summary className="cursor-pointer text-sm font-bold text-primary">
          AI 원문 리포트 보기
        </summary>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {report}
        </div>
      </details>
    </div>
  );
}
