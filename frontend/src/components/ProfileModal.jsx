import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 로그아웃 처리
  const handleLogout = () => {
    logout(); // AuthContext의 logout 함수 (localStorage 자동 정리)
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 모달 */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          width: '300px',
          padding: '20px',
          zIndex: 100,
          animation: 'slideIn 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {user ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                {user.name?.charAt(0) || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                  {user.name || '사용자'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {user.username || '-'}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {user.email || '-'}
                </p>
              </div>
            </div>

            {/* <div style={{ marginBottom: '20px' }}>
              {user.username && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    fontSize: '14px',
                  }}
                >
                </div>
              )}
            </div> */}

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                border: 'none',
                background: 'none',
                color: '#9ca3af',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.background = '#f3f4f6';
                e.target.style.borderRadius = '6px';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#9ca3af';
                e.target.style.background = 'none';
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
            로딩 중...
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileModal;
