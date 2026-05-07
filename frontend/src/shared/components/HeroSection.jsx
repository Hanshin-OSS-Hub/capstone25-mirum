import { IconCheck, IconPlay, IconRocket } from '@/shared/assets/icons.js';

/**
 * 랜딩 페이지 히어로 섹션 컴포넌트
 * @param {object} props
 * @param {Function} props.onLoginOpen - 소셜 로그인 모달 열기 핸들러
 */
export default function HeroSection({ onLoginOpen }) {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-blue-100/30 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[700px] w-[700px] rounded-full bg-indigo-100/20 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-8 py-24 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-20 min-[1480px]:grid-cols-2">
          {/* Left Content */}
          <div className="text-left">
            <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-border bg-blue-50 px-5 py-2 shadow-[0_2px_10px_rgba(37,99,235,0.05)]">
              <IconRocket size={16} className="text-blue-600" />
              <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-blue-700">
                Team Collaboration Platform
              </span>
            </div>

            <h2 className="mb-10 text-[clamp(2.6rem,7vw,5rem)] font-black leading-[1.05] tracking-[-0.04em] text-foreground">
              <span className="block whitespace-nowrap">마감일까지</span>
              <span className="block whitespace-nowrap">
                <span className="text-blue-600">미루던</span> 일,
              </span>
              <span className="block whitespace-nowrap">
                이제{' '}
                <span className="relative font-black tracking-[-0.04em] text-blue-600">
                  미룸
                </span>
                에서
              </span>
              <span className="block whitespace-nowrap">함께 끝내보세요.</span>
            </h2>

            <p className="mb-12 max-w-lg text-[22px] font-medium leading-relaxed text-muted-foreground">
              대학생을 위한 가장 직관적인 프로젝트 관리 도구.
              <br />
              복잡한 절차 없이,{' '}
              <span className="font-semibold text-foreground">MIRUM</span>으로
              시작하세요.
            </p>

            <div className="flex flex-col gap-5 sm:flex-row">
              <button
                onClick={onLoginOpen}
                className="flex items-center justify-center gap-3 rounded-[28px] bg-blue-600 px-10 py-6 text-xl font-bold text-white shadow-[0_20px_40px_rgba(37,99,235,0.25)] transition-all hover:translate-y-[-2px] hover:bg-blue-700 active:scale-95"
              >
                <IconRocket size={24} />
                무료로 시작하기
              </button>
              <button className="flex items-center justify-center gap-3 rounded-[28px] border-[3px] border-border bg-card px-10 py-6 text-xl font-bold text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all hover:translate-y-[-2px] hover:opacity-80 active:scale-95">
                <IconPlay size={24} />
                데모 영상 보기
              </button>
            </div>

            <div className="mt-16 flex flex-row items-center gap-x-10 gap-y-4 text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <div className="flex items-center gap-2.5 whitespace-nowrap transition-colors hover:text-foreground">
                <IconCheck size={18} className="text-emerald-500" strokeWidth={3} />
                No Credit Card
              </div>
              <div className="flex items-center gap-2.5 whitespace-nowrap transition-colors hover:text-foreground">
                <IconCheck size={18} className="text-emerald-500" strokeWidth={3} />
                Unlimited Tasks
              </div>
              <div className="flex items-center gap-2.5 whitespace-nowrap transition-colors hover:text-foreground">
                <IconCheck size={18} className="text-emerald-500" strokeWidth={3} />
                Free for Students
              </div>
            </div>
          </div>

          {/* Right Content - Modern Stats Display */}
          <div className="animate-in fade-in zoom-in-95 hidden grid-cols-2 gap-8 duration-1000 min-[1480px]:grid">
            <StatCard label="Task Completion" value="98%" trend="+12%" color="blue" />
            <StatCard label="Time Saved" value="50%" trend="-2.4h" color="emerald" />
            <StatCard label="Student Users" value="10k+" trend="New" color="violet" />
            <StatCard label="User Rating" value="4.9" trend="★ ★ ★ ★ ★" color="amber" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, trend, color }) {
  const colors = {
    blue:    'text-blue-600 bg-blue-50/80 border-blue-100/50',
    emerald: 'text-emerald-600 bg-emerald-50/80 border-emerald-100/50',
    violet:  'text-violet-600 bg-violet-50/80 border-violet-100/50',
    amber:   'text-amber-600 bg-amber-50/80 border-amber-100/50',
  };

  return (
    <div className="group rounded-[48px] border border-border bg-card p-10 shadow-[0_32px_64px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] backdrop-blur-xl transition-all hover:scale-[1.03] hover:shadow-[0_48px_80px_rgba(0,0,0,0.06)]">
      <div className={`mb-8 inline-flex rounded-xl px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${colors[color]}`}>
        {trend}
      </div>
      <div className="mb-4 text-[56px] font-black leading-none tracking-[-0.04em] text-foreground transition-colors group-hover:text-blue-600">
        {value}
      </div>
      <div className="text-[13px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
