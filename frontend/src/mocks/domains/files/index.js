import { http } from 'msw';
import { successResponse } from '../common.js';

export const fileHandlers = [
  // [POST] 단체 Pre-signed URL 발급 요청
  http.post('*/api/files/presigned-upload', async ({ request }) => {
    const body = await request.json();
    const files = body.files || [];

    // 요청받은 파일 개수만큼 URL과 UUID를 생성합니다.
    const uuids = [];
    const urls = [];

    files.forEach((file, index) => {
      // 프론트엔드가 편하게 테스트할 수 있도록 가짜 고유 번호와 가짜 주소를 만듭니다.
      const uuid = `uuid_${Date.now()}_${index}_${file.fileName}`;
      const mockUploadUrl = `https://mock-s3-bucket.com/temp-upload/${uuid}`;

      uuids.push(uuid);
      urls.push(mockUploadUrl);
    });

    console.log(`MSW: 단체 임시 주소 발급 완료 - 총 ${files.length}개 파일`);

    // 배열 형태로 프론트엔드에 응답합니다.
    return successResponse(
      {
        uuids: uuids,
        urls: urls,
      },
      200,
    );
  }),

  // [POST] 단체 파일 업로드 결과 최종 보고
  http.post('*/api/files/upload-result', async ({ request }) => {
    const { uuids, status } = await request.json();

    console.log(
      `MSW: 에스쓰리(S3) 도착 최종 보고 완료 - 파일 수: ${uuids?.length}개, 상태: ${status}`,
    );
    console.log('MSW: 무사히 도착한 파일 고유번호들:', uuids);

    // 실제로는 여기서 받은 uuids를 활용해 데이터베이스의 상태를 변경합니다.

    return successResponse({ message: '모든 파일 업로드 결과 보고 완료' }, 200);
  }),
];
