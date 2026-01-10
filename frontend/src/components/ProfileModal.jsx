import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../pages/client';

function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

  // 컴포넌트가 마운트되거나 isOpen이 변경될 때 사용자 정보 가져오기
  useEffect(() => {
    if (!isOpen) return;

    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');

    setUserData({
      name: name || '사용자',
      email: email || '-',
      username: username || '-',
    });
  }, [isOpen]);

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
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

        {userData ? (
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
                {userData.name?.charAt(0) || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                  {userData.name || '사용자'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {userData.email || '-'}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              {userData.username && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ color: '#6b7280', fontWeight: 500 }}>아이디</span>
                  <span style={{ color: '#1f2937', fontWeight: 500 }}>{userData.username}</span>
                </div>
              )}
            </div>

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
