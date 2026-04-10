import { useState } from 'react';
import { HiCheck, HiXMark } from 'react-icons/hi2';

/**
 * ProjectInvitationModal
 * 프로젝트 초대 목록을 표시하고 수락/거절 처리하는 모달
 * 
 * @param {Object} props
 * @param {Array} props.invitations - 초대 목록 배열
 * @param {Function} props.onAccept - 초대 수락 콜백 (invitationId)
 * @param {Function} props.onReject - 초대 거절 콜백 (invitationId)
 */

function ProjectInvitationModal(props) {
  const [activeTab, setActiveTab] = useState('received');
  const [loadingId, setLoadingId] = useState(null);

  const handleAccept = async (invitationId) => {
    setLoadingId(invitationId);
    try {
      if (props.onAccept) {
        await props.onAccept(invitationId);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (invitationId) => {
    setLoadingId(invitationId);
    try {
      if (props.onReject) {
        await props.onReject(invitationId);
      }
    } finally {
      setLoadingId(null);
    }
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
            <ReceivedProjectInvitationsList invitations={props.receivedInvitations}
                                            loadingId = {loadingId}
                                            setLoadingId = {setLoadingId}
                                            onAccept={handleAccept}
                                            onReject={handleReject}
            />
        ) : (
            // 보낸 초대 목록 렌더링
            <SentProjectInvitationsList invitations={props.sentInvitations} />
        )}
      </div>
    </>
  );
}

function ReceivedProjectInvitationsList(props) {
  return (
    <>
      {/*<h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>*/}
      {/*  프로젝트 초대*/}
      {/*</h2>*/}
    {
      !Array.isArray(props.invitations) ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
            로딩 중...
          </div>
      ) : props.invitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
            새로운 초대가 없습니다.
          </div>
      ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {
              props.invitations
                  .filter(invitation => invitation.status === "INVITED")  // INVITED 상태만 표시
                  .map((invitation) => (
                      <div
                          key={invitation.inviteId}
                          style={{
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb',
                          }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                            {invitation.projectName}
                          </p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                            {invitation.inviterName || 'Unknown'}님의 초대
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                              onClick={() => props.onAccept(invitation.inviteId)}
                              disabled={props.loadingId === invitation.inviteId}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: 'none',
                                background: '#10b981',
                                color: 'white',
                                borderRadius: '6px',
                                cursor: props.loadingId === invitation.inviteId ? 'not-allowed' : 'pointer',
                                opacity: props.loadingId === invitation.inviteId ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                              }}
                          >
                            <HiCheck size={16} />
                            수락
                          </button>
                          <button
                              onClick={() => props.onReject(invitation.inviteId)}
                              disabled={props.loadingId === invitation.inviteId}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                color: '#6b7280',
                                borderRadius: '6px',
                                cursor: props.loadingId === invitation.inviteId ? 'not-allowed' : 'pointer',
                                opacity: props.loadingId === invitation.inviteId ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                              }}
                          >
                            <HiXMark size={16} />
                            거절
                          </button>
                        </div>
                      </div>
                  ))
              }
            </div>
          )
        }
      </>
  );
}

function SentProjectInvitationsList(props) {
  return (
    <>
      {
       !Array.isArray(props.invitations) ? (
         <div style={ {textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px'} }>
           로딩 중...
         </div>
       ) : props.invitations.length === 0 ? (
           <div style={ { textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px'} }>
             보낸 초대가 없습니다.
           </div>
       ) : (
           <div style={ { display: 'flex', flexDirection: 'column', gap: '12px' } }>
             {
               props.invitations
                   .map((invitation) => (
                     <label key={invitation.inviteId}>
                       <div style={ { padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb'} }>
                         <div style={ { marginBottom: '8px'} }>
                           <p>
                             {invitation.projectName}
                           </p>
                           <p>
                             {invitation.inviteeName}
                           </p>
                           <p>
                             {invitation.state}
                           </p>
                         </div>
                         <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                           <button>취소</button>
                         </div>
                       </div>
                     </label>
                   ))
             }
           </div>
        )
      }
    </>
  );
}

export default ProjectInvitationModal;
