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
          width: '320px', // 원래 크기로 축소 (400px -> 320px)
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '20px',
          zIndex: 999,
        }}
      >
        {/*<div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>*/}
        {/*  <button */}
        {/*    onClick={() => setActiveTab('received')} */}
        {/*    style={{ */}
        {/*      fontWeight: activeTab === 'received' ? 'bold' : 'normal',*/}
        {/*      borderBottom: activeTab === 'received' ? '2px solid #2563eb' : 'none',*/}
        {/*      paddingBottom: '4px',*/}
        {/*      cursor: 'pointer',*/}
        {/*      background: 'none',*/}
        {/*      border: 'none',*/}
        {/*      color: activeTab === 'received' ? '#2563eb' : '#6b7280'*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    받은 초대*/}
        {/*  </button>*/}
        {/*  <button */}
        {/*    onClick={() => setActiveTab('sent')} */}
        {/*    style={{ */}
        {/*      fontWeight: activeTab === 'sent' ? 'bold' : 'normal',*/}
        {/*      borderBottom: activeTab === 'sent' ? '2px solid #2563eb' : 'none',*/}
        {/*      paddingBottom: '4px',*/}
        {/*      cursor: 'pointer',*/}
        {/*      background: 'none',*/}
        {/*      border: 'none',*/}
        {/*      color: activeTab === 'sent' ? '#2563eb' : '#6b7280'*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    보낸 초대*/}
        {/*  </button>*/}
        {/*</div>*/}

        <InvitationsList
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