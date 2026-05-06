import { getFileExtension } from './fileFormatters.js';

/**
 * FileListTable 전용 파일 타입/아이콘 표현 유틸리티
 * - 파일명/콘텐츠 타입을 기반으로 리스트 뷰에 필요한 아이콘 타입과 서브 라벨을 계산합니다.
 * @param {string} filename
 * @param {string} contentType
 * @returns {{ iconType: 'ppt' | 'excel' | 'pdf' | 'doc' | 'image' | 'video' | 'file', subLabel: string }}
 */
export function getListItemTypeStyle(filename = '', contentType = '') {
  const name = filename.toLowerCase();
  const ext = getFileExtension(filename);

  // 1단계: 아이콘 타입 결정
  /** @type {'ppt' | 'excel' | 'pdf' | 'doc' | 'image' | 'video' | 'file'} */
  let iconType = 'file';

  if (name.endsWith('.ppt') || name.endsWith('.pptx')) iconType = 'ppt';
  else if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv'))
    iconType = 'excel';
  else if (name.endsWith('.pdf')) iconType = 'pdf';
  else if (name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.hwp'))
    iconType = 'doc';
  else if (contentType?.startsWith('image/')) iconType = 'image';
  else if (contentType?.startsWith('video/')) iconType = 'video';

  // 2단계: 서브 라벨 결정
  let subLabel = '';

  if (iconType === 'image') {
    subLabel = ext ? ext.toUpperCase() : 'IMAGE';
  } else if (iconType === 'video') {
    subLabel = ext ? ext.toUpperCase() : 'VIDEO';
  } else if (iconType === 'pdf') {
    subLabel = 'PDF';
  } else if (ext) {
    subLabel = ext.toUpperCase();
  } else {
    subLabel = 'FILE';
  }

  return { iconType, subLabel };
}
