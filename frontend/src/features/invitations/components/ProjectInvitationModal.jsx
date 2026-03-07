import { useState } from 'react';
import { useGetInviteList } from "@/features/invitations/api/useGetInviteList.js";
import { useAcceptInvitation} from "@/features/invitations/api/useAcceptInvitation.js";
import { useDeclineInvitation } from "@/features/invitations/api/useDeclineInvitation.js";
import { InvitationsList } from "@/features/invitations/components/InvitationsList.jsx";

/**
 * [ProjectInvitationModal]
 * 프로젝트 초대 목록을 표시하고 수락/거절 처리하는 모달
 *
 * @param {Object} props
 * @param {Function} props.onClose - 모달 여닫힘 상태 제어
 */

export default function ProjectInvitationModal(props) {
  const [activeTab, setActiveTab] = useState('received');
  const [loadingId, setLoadingId] = useState(null);

  const { data: receivedInvitations, isLoading: isReceivedInvitationsLoading, error: receivedInvitationsError } = useGetInviteList();
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
          width: '400px',
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '20px',
          zIndex: 999,
        }}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setActiveTab('received')} style={{ fontWeight: activeTab === 'received' ? 'bold' : 'normal' }}>받은 초대</button>
          <button onClick={() => setActiveTab('sent')} style={{ fontWeight: activeTab === 'sent' ? 'bold' : 'normal' }}>보낸 초대</button>
        </div>
        {activeTab === 'received' ? (
            // 기존 받은 초대 목록 렌더링
            <InvitationsList invitations={receivedInvitations}
                             loadingId = {loadingId}
                             setLoadingId = {setLoadingId}
                             onAccept={handleAccept}
                             onReject={handleReject}
            />
        ) : (
            <></>
            // api 수정으로 삭제 예정
            // 보낸 초대 목록 렌더링
            // <SentProjectInvitationsList invitations={props.sentInvitations} />
        )}
      </div>
    </>
  );
}