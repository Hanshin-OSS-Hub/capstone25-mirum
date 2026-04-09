// 타임라인의 lane 및 bar 배치를 계산하는 도메인 유틸
import { intersectsMonth, parseDate } from './timeline-date.js';

/**
 * 멤버에게 할당된 작업 목록을 받아, 월 단위로 겹침이 없는 lane 배열을 계산한다.
 * 각 task에는 `_taskStart`, `_taskEnd`가 Date 형태로 추가된다.
 */
export function buildLanes(tasks, monthStart, monthEnd) {
  const sorted = [...tasks]
    .map((task) => {
      // LocalDateTime(ISO) 문자열을 Date로 변환해서 이후 로직은 모두 Date 기반으로 처리
      const rawStart = parseDate(task.startDate || task.dueDate || task.createdDate);
      const rawEnd = parseDate(task.dueDate || task.startDate || task.createdDate);

      if (!rawStart || !rawEnd) return null;

      const taskStart = rawStart <= rawEnd ? rawStart : rawEnd;
      const taskEnd = rawStart <= rawEnd ? rawEnd : rawStart;

      return {
        ...task,
        _taskStart: taskStart,
        _taskEnd: taskEnd,
      };
    })
    .filter(Boolean)
    .filter((task) => intersectsMonth(task._taskStart, task._taskEnd, monthStart, monthEnd))
    .sort((a, b) => a._taskStart - b._taskStart || a._taskEnd - b._taskEnd);

  const lanes = [];

  // 각 task를 겹치지 않게 lane별로 배치한다.
  sorted.forEach((task) => {
    let laneIndex = 0;

    while (laneIndex < lanes.length) {
      const lastTask = lanes[laneIndex][lanes[laneIndex].length - 1];
      if (task._taskStart > lastTask._taskEnd) break;
      laneIndex += 1;
    }

    if (!lanes[laneIndex]) lanes[laneIndex] = [];
    lanes[laneIndex].push(task);
  });

  return lanes;
}
