export const formatDate = (dateValue) => {
  if (!dateValue) return '';
  let date;
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    date = new Date(year, month - 1, day, hour, minute, second);
  } else {
    date = new Date(dateValue);
  }
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateDot = (dateValue) => {
  if (!dateValue) return '';
  let d;
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    d = new Date(year, month - 1, day, hour, minute, second);
  } else {
    d = new Date(dateValue);
  }
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${day}.`;
};

/**
 * LocalDateTime (ISO 문자열, 배열, Date 객체 또는 날짜 필드를 가진 객체)을 YYYY-MM-DD 형식으로 변환합니다.
 * @param {any} dateValue
 * @returns {string}
 */
export const formatLocalDateTime = (dateValue) => {
  if (!dateValue) return '-';

  // 1. 배열인 경우 [year, month, day, ...]
  if (Array.isArray(dateValue)) {
    const [year, month, day] = dateValue;
    if (!year || !month || !day) return '-';
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 2. Date 객체인 경우
  if (dateValue instanceof Date) {
    if (Number.isNaN(dateValue.getTime())) return '-';
    const y = dateValue.getFullYear();
    const m = String(dateValue.getMonth() + 1).padStart(2, '0');
    const d = String(dateValue.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 3. 문자열인 경우 (ISO 8601)
  if (typeof dateValue === 'string') {
    return dateValue.slice(0, 10);
  }

  // 4. 객체인 경우 (Java LocalDateTime 기본 직렬화 형태 대응)
  if (typeof dateValue === 'object') {
    const year = dateValue.year;
    const month = dateValue.monthValue || dateValue.month; // 숫자 또는 문자열(MAY)
    const day = dateValue.dayOfMonth;

    if (year && month && day) {
      let monthStr = String(month);
      // 월이 문자열(예: "MAY")인 경우 대응 (필요시 추가 매핑 로직)
      if (Number.isNaN(Number(monthStr))) {
        const months = {
          JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4, MAY: 5, JUNE: 6,
          JULY: 7, AUGUST: 8, SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12
        };
        monthStr = String(months[monthStr.toUpperCase()] || monthStr);
      }
      return `${year}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return '-';
};

export const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const isTaskOverdue = (dueDate, status) => {
  if (!dueDate) return false;
  const today = new Date();
  let d;
  if (Array.isArray(dueDate)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dueDate;
    d = new Date(year, month - 1, day, hour, minute, second);
  } else {
    d = new Date(dueDate);
  }
  if (Number.isNaN(d.getTime())) return false;
  return d < today && status !== 'DONE';
};
