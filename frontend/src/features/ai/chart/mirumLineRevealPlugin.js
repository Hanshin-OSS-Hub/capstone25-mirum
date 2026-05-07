/** @type {WeakMap<import('chart.js').Chart, number>} */
export const mirumLineRevealProgressByChart = new WeakMap();

/** @type {WeakSet<import('chart.js').Chart>} */
const mirumLineRevealClipActive = new WeakSet();

/**
 * 꺾은선 차트 진행도(0~1). react-chartjs-2가 `options.plugins`를 통째로 덮어쓰므로 옵션 대신 WeakMap에 둡니다.
 * @param {import('chart.js').Chart} chart
 * @param {number} progress
 */
export function setMirumLineRevealProgress(chart, progress) {
  mirumLineRevealProgressByChart.set(chart, Math.min(1, Math.max(0, progress)));
}

/**
 * 꺾은선 차트를 왼쪽→오른쪽으로 “그려지는” 것처럼 보이게 하는 클립 플러그인.
 * `options.plugins.mirumLineReveal.enabled === true` 인 라인 차트만 적용합니다.
 * 진행도는 `setMirumLineRevealProgress` + `chart.update('none')`으로 갱신합니다.
 */
export const mirumLineRevealPlugin = {
  id: 'mirumLineReveal',
  /**
   * @param {import('chart.js').Chart} chart
   */
  afterInit(chart) {
    const reveal = chart.options.plugins?.mirumLineReveal;
    if (!reveal?.enabled || chart.config.type !== 'line') return;
    mirumLineRevealProgressByChart.set(chart, 0);
  },
  /**
   * @param {import('chart.js').Chart} chart
   */
  beforeDatasetsDraw(chart) {
    const reveal = chart.options.plugins?.mirumLineReveal;
    if (!reveal?.enabled || chart.config.type !== 'line') return;

    const progress = mirumLineRevealProgressByChart.get(chart) ?? 1;
    if (progress >= 1) return;

    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    ctx.save();
    ctx.beginPath();
    const width = (chartArea.right - chartArea.left) * progress;
    ctx.rect(chartArea.left, chartArea.top, Math.max(0, width), chartArea.bottom - chartArea.top);
    ctx.clip();
    mirumLineRevealClipActive.add(chart);
  },
  /**
   * @param {import('chart.js').Chart} chart
   */
  afterDatasetsDraw(chart) {
    const reveal = chart.options.plugins?.mirumLineReveal;
    if (!reveal?.enabled || chart.config.type !== 'line') return;

    const progress = mirumLineRevealProgressByChart.get(chart) ?? 1;
    if (progress >= 1) return;

    if (!mirumLineRevealClipActive.has(chart)) return;
    chart.ctx.restore();
    mirumLineRevealClipActive.delete(chart);
  },
};
