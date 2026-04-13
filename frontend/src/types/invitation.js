/**
 * 초대 도메인에서 사용하는 공통 타입 정의입니다.
 * 백엔드 InviteResponseDTO 및 ProjectInvite 엔티티 스펙을 기준으로 합니다.
 */

/**
 * @typedef {'INVITED' | 'ACCEPTED' | 'DECLINED'} InvitationStatus
 */

/**
 * @typedef {Object} Invitation
 * @property {number} inviteId - 초대 식별자. InviteResponseDTO.inviteId / ProjectInvite.id 에 해당합니다.
 * @property {string} projectName - 초대가 속한 프로젝트 이름. InviteResponseDTO.projectName 과 매핑됩니다.
 * @property {string} inviterName - 초대를 보낸 사용자 이름. InviteResponseDTO.inviterName 및 ProjectInvite.inviterName 과 매핑됩니다.
 * @property {string} invitedName - 초대를 받은 사용자 이름(username). InviteResponseDTO.invitedName 과 동일한 의미입니다.
 * @property {InvitationStatus} status - 초대 상태. InviteStatus enum 의 문자열 표현과 일치해야 합니다.
 * @property {string} inviteDate - 초대 생성 시각(ISO 문자열). ProjectInvite.inviteDate 에 해당합니다.
 * @property {string | null} [responseDate] - 초대 응답 시각(ISO 문자열). ProjectInvite.responseDate 에 해당합니다.
 */
