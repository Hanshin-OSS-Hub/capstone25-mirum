import rawInvitationsData from '../../../../../global/data/dummyInvitations.json';
import '../../types/invitation.js';

/** @typedef {import('../../../types/invitation.js').Invitation} Invitation */

/**
 * invitations.json 원본 데이터를 Invitation 타입 배열로 노출하는 in-memory DB 모델입니다.
 *
 * @type {Invitation[]}
 */
export const invitationsDB = rawInvitationsData.map((invitation) => ({
  inviteId: invitation.inviteId,
  projectName: invitation.projectName,
  inviterName: invitation.inviterName,
  invitedName: invitation.invitedName,
  status: invitation.status,
  inviteDate: invitation.inviteDate,
  responseDate: invitation.responseDate ?? null,
  projectId: invitation.projectId,
}));
