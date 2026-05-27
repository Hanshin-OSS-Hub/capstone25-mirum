import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [READ] 파일 다운로드 API 훅
 * - 1단계: /model/downloadUrl 에 선택된 파일들의 uuid 배열을 보내 다운로드 URL 목록을 발급
 * - 2단계: 발급받은 URL들로 GET 요청을 보내 Blob을 받고, 브라우저에서 실제 다운로드 처리
 */
export const useDownloadFiles = () => {
  return useMutation({
    // params: { selectedFiles: NormalizedFileItem[] }
    mutationFn: async ({ selectedFiles }) => {
      // 선택된 파일이 없으면 조기 종료
      if (!selectedFiles || selectedFiles.length === 0) return;

      // 1. 선택된 파일들에서 UUID만 추출
      const uuids = selectedFiles.map((file) => file.uuid);

      // 2. 백엔드에 다운로드할 URL들을 요청
      // (가정: 반환 데이터가 [{ uuid: '...', url: '...' }, ...] 형태의 배열이라고 예상)
      /** @type {{ uuid: string, url: string }[]} */
      const downloadUrlsResponse = await api.post(`/api/files/downloadUrl`, uuids);

      // 3. 발급받은 URL들로 파일을 다운로드하기 위한 Promise 배열 생성
      const downloadPromises = downloadUrlsResponse.map(async (fileData) => {
        // 원본 선택 파일에서 이름과 타입 정보 가져오기 (매칭용)
        const originalFile = selectedFiles.find((f) => f.uuid === fileData.uuid);

        const response = await fetch(fileData.url, {
          method: 'GET',
          // S3 Pre-signed URL로 다운로드 시에는 보통 헤더를 별도로 안 넣어도 됩니다.
        });

        if (!response.ok) {
          throw new Error(`${originalFile?.originalFilename || '파일'} 다운로드 실패`);
        }

        const blob = await response.blob();

        // 4. 브라우저 단에서 실제 파일로 다운로드 처리 (<a> 태그 트릭)
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = originalFile?.originalFilename || 'downloaded_file'; // 다운로드될 파일명
        document.body.appendChild(link);
        link.click();

        // 정리 (메모리 누수 방지)
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      });

      // 모든 다운로드 작업이 완료될 때까지 대기
      await Promise.all(downloadPromises);
    },
    onSuccess: () => {},
    onError: (error) => {
      notify.error(getErrorMessage(error, '파일 다운로드에 실패했습니다.'));
    },
  });
};
