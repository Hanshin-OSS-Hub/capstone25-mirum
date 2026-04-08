import { useMemo } from 'react';
import { folderContentType, normalizeFileItem } from '@/features/files/types/file.js';

/*
  현재는 더미 데이터입니다.
  백엔드 실제 연동 시 /files/project?projectId={id} 응답값을
  normalizeFileItem에 넣어서 동일한 UI를 유지하면 됩니다.

  백엔드 명세:
  [
    {
      uuid,
      originalFilename,
      size,
      contentType,
      createdDate,
      createdBy
    }
  ]

  주의:
  폴더는 현재 백엔드 명세에 없어서 UI 확인용 더미로만 추가했습니다.
*/

const mockFileResponse = [
  {
    uuid: 'folder-001',
    originalFilename: '디자인 시안',
    size: 0,
    contentType: folderContentType,
    createdDate: '2026-03-27T10:15:30',
    createdBy: '김민수',
    itemCount: 12,
  },
  {
    uuid: 'folder-002',
    originalFilename: '참고 논문 모음',
    size: 0,
    contentType: folderContentType,
    createdDate: '2026-03-26T14:20:10',
    createdBy: '박준호',
    itemCount: 8,
  },
  {
    uuid: 'folder-003',
    originalFilename: '이미지 자료',
    size: 0,
    contentType: folderContentType,
    createdDate: '2026-03-25T09:30:00',
    createdBy: '이지영',
    itemCount: 15,
  },
  {
    uuid: '8d3x-132k-1123-pptx',
    originalFilename: '발표 PPT 초안.pptx',
    size: 2516582,
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    createdDate: '2026-03-24T11:20:00',
    createdBy: '이지영',
  },
  {
    uuid: '8d3x-132k-1123-xlsx',
    originalFilename: '통일비용 분석.xlsx',
    size: 1887436,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    createdDate: '2026-03-23T13:40:00',
    createdBy: '최수진',
  },
  {
    uuid: '8d3x-132k-1123-hwp',
    originalFilename: '발표 대본.hwp',
    size: 159744,
    contentType: 'application/x-hwp',
    createdDate: '2026-03-22T15:15:00',
    createdBy: '김민수',
  },
  {
    uuid: '8d3x-132k-1123-pdf',
    originalFilename: '통일 설문조사 결과.pdf',
    size: 3355443,
    contentType: 'application/pdf',
    createdDate: '2026-03-21T17:50:00',
    createdBy: '박준호',
  },
  {
    uuid: '8d3x-132k-1123-jpg',
    originalFilename: '고양이 사진.jpg',
    size: 2202009,
    contentType: 'image/jpeg',
    createdDate: '2026-03-20T08:10:00',
    createdBy: '이지영',
    previewUrl: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=400&q=80',
  },
  {
    uuid: '8d3x-132k-1123-mp4',
    originalFilename: '강아지 동영상.mp4',
    size: 16043213,
    contentType: 'video/mp4',
    createdDate: '2026-03-19T12:05:00',
    createdBy: '박준호',
    previewUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
  },
  {
    uuid: '8d3x-132k-1123-jpg-2',
    originalFilename: '통일 관련 사진들.jpg',
    size: 4404019,
    contentType: 'image/jpeg',
    createdDate: '2026-03-18T18:25:00',
    createdBy: '최수진',
    previewUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
  },
  {
    uuid: '8d3x-132k-1123-mp4-2',
    originalFilename: '발표 연습 영상.mp4',
    size: 30094131,
    contentType: 'video/mp4',
    createdDate: '2026-03-17T16:45:00',
    createdBy: '김민수',
    previewUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
];

export function useGetFiles(projectId) {
  const data = useMemo(() => {
    if (!projectId) return [];
    return mockFileResponse.map(normalizeFileItem);
  }, [projectId]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
