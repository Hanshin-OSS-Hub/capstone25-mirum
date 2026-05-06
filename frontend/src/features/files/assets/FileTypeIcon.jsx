import {
  IconFileExcel,
  IconFileGeneric,
  IconFileImage,
  IconFilePdf,
  IconFilePpt,
  IconFileText,
  IconFileVideo,
  IconFileZip,
  IconFolderFill,
} from '@/shared/assets/icons.js';

/**
 * 파일 확장자/타입에 따른 Remix Icon 렌더링 컴포넌트
 * @param {object} props
 * @param {string} props.type - 파일 타입 키워드 (ppt, excel, pdf, doc, image, video, zip, folder 등)
 * @param {string} [props.className] - 스타일 클래스
 * @param {number} [props.size] - 아이콘 크기
 */
export default function FileTypeIcon({ type, className = '', size = 32 }) {
  const iconMap = {
    ppt: IconFilePpt,
    excel: IconFileExcel,
    pdf: IconFilePdf,
    doc: IconFileText,
    image: IconFileImage,
    video: IconFileVideo,
    zip: IconFileZip,
    folder: IconFolderFill,
    file: IconFileGeneric,
  };

  const IconComponent = iconMap[type] || IconFileGeneric;

  return <IconComponent size={size} className={className} />;
}
