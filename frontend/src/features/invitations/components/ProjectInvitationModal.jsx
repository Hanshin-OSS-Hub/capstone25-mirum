import { useState } from 'react';
import { useAcceptInvitation } from '@/features/invitations/api/useAcceptInvitation.js';
import { useDeclineInvitation } from '@/features/invitations/api/useDeclineInvitation.js';
import { useGetInviteList } from '@/features/invitations/api/useGetInviteList.js';
import { InvitationCard } from '@/features/invitations/components/InvitationCard.jsx';

/**
 * [ProjectInvitationModal]
 * 프로젝트 초대 목록을 표시하고 수락/거절 처리하는 모달
 *
 * @param {Object} props
 * @param {Function} props.onClose - 모달 여닫힘 상태 제어
 */

export default function ProjectInvitationModal(props) {
  const [loadingId, setLoadingId] = useState(null);

  const {
    data: receivedInvitations,
    isLoading: isReceivedInvitationsLoading,
    error: receivedInvitationsError,
  } = useGetInviteList();
  const { mutate: accept } = useAcceptInvitation();
  const { mutate: decline } = useDeclineInvitation();

  const handleAccept = async (inviteId) => {
    accept(inviteId);
  };

  const handleReject = async (inviteId) => {
    decline(inviteId);
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          width: '320px', // 원래 크기로 축소 (400px -> 320px)
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '20px',
          zIndex: 999,
        }}
      >
        <InvitationCard
          invitations={receivedInvitations}
          loadingId={loadingId}
          setLoadingId={setLoadingId}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </div>
    </>
  );
}
