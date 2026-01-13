import { useState } from 'react';
import { HiCheck, HiXMark } from 'react-icons/hi2';
import { USE_MOCK } from '../pages/Home';

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
  const { invitations, onAccept, onReject } = props;
  const [loadingId, setLoadingId] = useState(null);

  const handleAccept = async (invitationId) => {
    setLoadingId(invitationId);
    try {
      if (onAccept) {
        await onAccept(invitationId);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (invitationId) => {
    setLoadingId(invitationId);
    try {
      if (onReject) {
        await onReject(invitationId);
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
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
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
        프로젝트 초대
      </h2>

      {invitations === null ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
          로딩 중...
        </div>
      ) : invitations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
          새로운 초대가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invitations
            .filter(invitation => invitation.status === "INVITED")  // INVITED 상태만 표시
            .map((invitation) => (
            <div
              key={invitation.id}
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
                  onClick={() => handleAccept(invitation)}
                  disabled={loadingId === `${invitation.projectName}-${invitation.inviterName}`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: loadingId === `${invitation.projectName}-${invitation.inviterName}` ? 'not-allowed' : 'pointer',
                    opacity: loadingId === `${invitation.projectName}-${invitation.inviterName}` ? 0.6 : 1,
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
                  onClick={() => handleReject(invitation)}
                  disabled={loadingId === `${invitation.projectName}-${invitation.inviterName}`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#6b7280',
                    borderRadius: '6px',
                    cursor: loadingId === `${invitation.projectName}-${invitation.inviterName}` ? 'not-allowed' : 'pointer',
                    opacity: loadingId === `${invitation.projectName}-${invitation.inviterName}` ? 0.6 : 1,
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
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectInvitationModal;
