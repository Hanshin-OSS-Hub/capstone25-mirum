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

// ─────────────────────────────────────────────
// Preview Mode: 하드코딩 더미 데이터 (previewMode=true 시 사용)
// 실제 API / MSW 없이도 UI 확인 가능
// ─────────────────────────────────────────────
const PREVIEW_CONTEXT = {
  project: {
    projectId: 'preview',
    title: 'MIRUM 캡스톤 프로젝트',
    description: '팀 협업 및 프로젝트 관리 플랫폼 개발',
    startDate: '2026-04-01T00:00:00.000Z',
  },
  summary: { total: 18, todo: 4, inProgress: 4, completed: 10 },
  members: [
    { name: 'kim', role: 'LEADER' },
    { name: 'lee', role: 'MEMBER' },
    { name: 'park', role: 'MEMBER' },
  ],
  tasks: [
    // DONE (10)
    {
      taskId: 1,
      title: '요구사항 분석',
      status: 'DONE',
      assigneeId: 'kim',
      dueDate: '2026-05-04T18:00:00.000Z',
      createdDate: '2026-04-25T09:00:00.000Z',
      updatedDate: '2026-05-02T15:30:00.000Z',
    },
    {
      taskId: 2,
      title: 'DB 설계',
      status: 'DONE',
      assigneeId: 'lee',
      dueDate: '2026-05-04T18:00:00.000Z',
      createdDate: '2026-04-25T09:00:00.000Z',
      updatedDate: '2026-05-03T11:00:00.000Z',
    },
    {
      taskId: 3,
      title: 'API 명세서 작성',
      status: 'DONE',
      assigneeId: 'park',
      dueDate: '2026-05-05T18:00:00.000Z',
      createdDate: '2026-04-26T09:00:00.000Z',
      updatedDate: '2026-05-04T16:00:00.000Z',
    },
    {
      taskId: 4,
      title: '인증 모듈 구현',
      status: 'DONE',
      assigneeId: 'kim',
      dueDate: '2026-05-05T18:00:00.000Z',
      createdDate: '2026-04-26T09:00:00.000Z',
      updatedDate: '2026-05-06T10:00:00.000Z',
    },
    {
      taskId: 5,
      title: '태스크 CRUD API',
      status: 'DONE',
      assigneeId: 'lee',
      dueDate: '2026-05-06T18:00:00.000Z',
      createdDate: '2026-04-27T09:00:00.000Z',
      updatedDate: '2026-05-05T14:00:00.000Z',
    },
    {
      taskId: 6,
      title: '파일 업로드 기능',
      status: 'DONE',
      assigneeId: 'park',
      dueDate: '2026-05-06T18:00:00.000Z',
      createdDate: '2026-04-27T09:00:00.000Z',
      updatedDate: '2026-05-04T17:00:00.000Z',
    },
    {
      taskId: 7,
      title: '알림 시스템 구현',
      status: 'DONE',
      assigneeId: 'kim',
      dueDate: '2026-05-07T18:00:00.000Z',
      createdDate: '2026-04-28T09:00:00.000Z',
      updatedDate: '2026-05-06T09:00:00.000Z',
    },
    {
      taskId: 8,
      title: '멤버 초대 기능',
      status: 'DONE',
      assigneeId: 'lee',
      dueDate: '2026-05-07T18:00:00.000Z',
      createdDate: '2026-04-28T09:00:00.000Z',
      updatedDate: '2026-05-08T08:00:00.000Z',
    },
    {
      taskId: 9,
      title: '대시보드 UI',
      status: 'DONE',
      assigneeId: 'park',
      dueDate: '2026-05-08T18:00:00.000Z',
      createdDate: '2026-04-29T09:00:00.000Z',
      updatedDate: '2026-05-07T17:00:00.000Z',
    },
    {
      taskId: 10,
      title: 'AI 리포트 컴포넌트',
      status: 'DONE',
      assigneeId: 'kim',
      dueDate: '2026-05-08T18:00:00.000Z',
      createdDate: '2026-04-29T09:00:00.000Z',
      updatedDate: '2026-05-07T16:00:00.000Z',
    },
    // IN_PROGRESS (4)
    {
      taskId: 11,
      title: '타임라인 뷰 개선',
      status: 'IN_PROGRESS',
      assigneeId: 'lee',
      dueDate: '2026-05-08T18:00:00.000Z',
      createdDate: '2026-04-30T09:00:00.000Z',
      updatedDate: '2026-05-05T10:00:00.000Z',
    },
    {
      taskId: 12,
      title: '채팅 기능 구현',
      status: 'IN_PROGRESS',
      assigneeId: 'park',
      dueDate: '2026-05-09T18:00:00.000Z',
      createdDate: '2026-04-30T09:00:00.000Z',
      updatedDate: '2026-05-05T11:00:00.000Z',
    },
    {
      taskId: 13,
      title: 'E2E 테스트 작성',
      status: 'IN_PROGRESS',
      assigneeId: 'kim',
      dueDate: '2026-05-10T18:00:00.000Z',
      createdDate: '2026-05-01T09:00:00.000Z',
      updatedDate: '2026-05-05T14:00:00.000Z',
    },
    {
      taskId: 14,
      title: '배포 파이프라인 설정',
      status: 'IN_PROGRESS',
      assigneeId: null,
      dueDate: '2026-05-11T18:00:00.000Z',
      createdDate: '2026-05-01T09:00:00.000Z',
      updatedDate: '2026-05-04T09:00:00.000Z',
    },
    // TODO (4)
    {
      taskId: 15,
      title: '모바일 반응형 대응',
      status: 'TODO',
      assigneeId: null,
      dueDate: '2026-05-11T18:00:00.000Z',
      createdDate: '2026-05-02T09:00:00.000Z',
      updatedDate: '2026-05-02T09:30:00.000Z',
    },
    {
      taskId: 16,
      title: '성능 최적화',
      status: 'TODO',
      assigneeId: null,
      dueDate: '2026-05-12T18:00:00.000Z',
      createdDate: '2026-05-02T09:00:00.000Z',
      updatedDate: '2026-05-02T09:30:00.000Z',
    },
    {
      taskId: 17,
      title: '접근성 개선',
      status: 'TODO',
      assigneeId: 'lee',
      dueDate: '2026-05-12T18:00:00.000Z',
      createdDate: '2026-05-03T09:00:00.000Z',
      updatedDate: '2026-05-03T09:30:00.000Z',
    },
    {
      taskId: 18,
      title: '최종 QA',
      status: 'TODO',
      assigneeId: 'park',
      dueDate: '2026-05-13T18:00:00.000Z',
      createdDate: '2026-05-03T09:00:00.000Z',
      updatedDate: '2026-05-03T09:30:00.000Z',
    },
  ],
  requester: { username: 'kim' },
};

const PREVIEW_REPORT = `# 📊 MIRUM 캡스톤 프로젝트 AI 종합 분석 리포트

## 1. 프로젝트 건강도 요약
- **상태:** 🟡 주의 (Caution)
- **진행률:** 전체 18개 작업 중 **10개(56%)** 완료됨.
- **총평:** 전체적으로 안정적으로 진행되고 있으나, 미배정 작업 및 소수의 지연 완료 건이 존재해 지속적인 모니터링이 필요합니다.

## 2. 작업 진행 현황 분석
- **Todo (대기):** 4개
- **In Progress (진행 중):** 4개
- **Done (완료):** 10개
- **분석:** 진행 중인 작업 중 배포 파이프라인 설정이 미배정 상태입니다. 조속한 담당자 배정이 필요합니다.

## 3. ⚠️ 위험 요소 및 지연 경고
- **지연 완료:** '인증 모듈 구현', '멤버 초대 기능' 2건이 마감일 이후 완료되었습니다.
- **미배정 작업:** 현재 **3개**의 작업에 담당자가 없습니다. (배포 파이프라인 설정, 모바일 반응형 대응, 성능 최적화)

## 4. 💡 MIRUM AI의 제언
1. **업무 분산:** kim 담당 작업이 5건으로 가장 높습니다. 남은 작업을 균등 배분하세요.
2. **미배정 해소:** TODO 상태의 미배정 작업 2건을 즉시 배정하여 병목을 예방하세요.
3. **마감 관리:** 이번 주 내 진행 중 작업 4건의 완료를 목표로 일정을 점검하세요.

---
*본 리포트는 MIRUM AI가 프로젝트 실시간 데이터를 바탕으로 작성했습니다.*`;
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
 * @param {boolean} [props.previewMode] - true 시 하드코딩 더미 데이터로 렌더링 (API 없이 UI 확인용)
 */
export default function ProjectReportView({
  report: reportProp,
  isLoading,
  onGenerate,
  context: contextProp,
  reportHistory = [],
  activeReportId = null,
  onSelectReport,
  previewMode = false,
}) {
  const context = previewMode ? PREVIEW_CONTEXT : contextProp;
  const report = previewMode ? PREVIEW_REPORT : reportProp;
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
  const analysisPeriodDays = 14;
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
          { label: '완료율', value: `${completionRate}%`, tone: 'text-blue-600' },
          { label: '지연 완료', value: `${delayedDoneCount}건`, tone: 'text-amber-600' },
          { label: '미배정 작업', value: `${unassignedCount}건`, tone: 'text-rose-600' },
          { label: '작업 진척률 (2주)', value: `${statusChangeRate}%`, tone: 'text-sky-600' },
          {
            label: '평균 일정 여유일',
            value: `${averageScheduleMargin}일`,
            tone: 'text-indigo-600',
          },
          {
            label: '업데이트 감지 작업',
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
              - 최근 2주 작업 진척률은 {statusChangeRate}%로, 병목 가능 구간 점검이 필요합니다.
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
