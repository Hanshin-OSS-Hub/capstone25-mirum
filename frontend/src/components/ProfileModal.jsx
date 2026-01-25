import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, client } from '../api/client';
import { useAuth } from '../context/useAuth';
import { HiPencil } from 'react-icons/hi2';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function UserEditModal(props) {
  const [draftName, setDraftName] = useState(props.user?.nickname || "");
  const [draftEmail, setDraftEmail] = useState(props.user?.email || "");

  useEffect(() => {
    setDraftName(props.user?.nickname || "");
    setDraftEmail(props.user?.email || "");
  }, [props.user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (props.onSave) {
      props.onSave({ username: props.user.username, nickname: draftName, email: draftEmail });
    }
    props.onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={props.onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px"
        }}>
          <h1>프로필 수정</h1>
          {/* 닫기 버튼 */}
          <button
              type="button"
              className="login-close-btn"
              onClick={props.onClose}
          >
            닫기버튼
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <h4>아이디</h4>
          <input
            type="text"
            disabled
            value={ props.user?.username ?? '' }
            style={{ width: '100%', padding: '8px', marginBottom: '12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <h4>이름</h4>
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <h4>이메일</h4>
          <input
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '12px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
            <button 
              type="submit"
              className="login-button"
            >
              저장
            </button>

            <div
                style={{
                  width: 'auto',
                  padding: '10px',
                  border: 'none',
                  background: 'none',
                  display: "flex",
                  justifyContent: "center",
                  // alignItems: "center",
                  // textAlign: "center"
                }}
            >
              <span style={{
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
                onClick={() => props.onDelete()}
              >
                회원탈퇴
              </span>
            </div>
          </div>



            {/*<button*/}
            {/*  style={{*/}
            {/*    width: 'auto',*/}
            {/*    padding: '10px',*/}
            {/*    border: 'none',*/}
            {/*    background: 'none',*/}
            {/*    color: '#9ca3af',*/}
            {/*    fontSize: '14px',*/}
            {/*    cursor: 'pointer',*/}
            {/*    transition: 'all 0.2s',*/}
            {/*    fontWeight: 500,*/}
            {/*  }}*/}
            {/*  onMouseEnter={(e) => {*/}
            {/*    e.target.style.color = '#6b7280';*/}
            {/*    e.target.style.background = '#f3f4f6';*/}
            {/*    e.target.style.borderRadius = '6px';*/}
            {/*  }}*/}
            {/*  onMouseLeave={(e) => {*/}
            {/*    e.target.style.color = '#9ca3af';*/}
            {/*    e.target.style.background = 'none';*/}
            {/*  }}*/}
            {/*  onClick={() => props.onDelete()}*/}
            {/*>*/}
            {/*  회원탈퇴*/}
            {/*</button>*/}
        </form>
      </div>
    </div>
  );
}


function ProfileModal(props) {
  const navigate = useNavigate();
  const { user, logout, deleteUser, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
    navigate('/');
    props.onClose();
  };

  /**
   * 회원정보 업데이트 API
   * 
   * 현재 상태:
   * @param {Object} updatedData - { name: string, email: string }
   * @returns {void} 서버가 userId만 반환하므로 클라이언트의 updatedData를 사용하여 updateUser() 호출
   * 
   * 다른 방식 (서버에서 전체 유저 정보 반환):
   * @param {Object} updatedData - { name: string, email: string }
   * @returns {void} 서버가 { id, username, name, email, ... } 를 반환하므로 response.data를 updateUser()에 전달
   * 서버 응답 예시: { "id": 1(?), "username": "user123", "name": "홍길동", "email": "hong@example.com" }
   */

  const handleProfileSaveApi = (updatedData) => {
    api.put('/user', updatedData)
      .then(() => {
        updateUser(updatedData);
        alert('회원정보가 성공적으로 업데이트되었습니다.');
      })
      .catch(error => {
        alert(error.message || '회원정보 업데이트에 실패했습니다. 다시 시도해주세요.');
      });
  }

  const handleProfileSaveTest = (updatedData) => {
    updateUser(updatedData);
    alert('프로필이 성공적으로 업데이트되었습니다. (데모 모드)');
  };

  /**
   * 회원탈퇴 API
   * 
   * @returns {Promise<void>} 사용자 확인 후 DELETE /user API 호출, 성공 시 로그아웃 및 메인 페이지 이동
   * @description 회원탈퇴 확인 후 서버에 탈퇴 요청을 보내고, AuthContext의 deleteUser()로 상태 초기화
   */
  const handleDeleteUserApi = async () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      try {
        // await api.delete('/user');
        await client('/user', { method: 'DELETE', body: JSON.stringify({ username: user.username }) });
        deleteUser();
        navigate('/');
        props.onClose();
      } catch (error) {
        alert(error.message || '회원탈퇴에 실패했습니다.');
      }
    }
  };

  const handleDeleteUserTest = () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      deleteUser();
      navigate('/');
      props.onClose();
    }
  }

  const handleProfileSave = USE_MOCK ? handleProfileSaveTest : handleProfileSaveApi;
  const handleDeleteUser = USE_MOCK ? handleDeleteUserTest : handleDeleteUserApi;

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
          // zIndex: 100,
          // animation: 'slideIn 0.2s ease-out',
        }}
      >
        {/* <style>{`
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
        `}</style> */}

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
                  position: 'relative',
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
                {user.nickname?.charAt(0) || '?'}
                <HiPencil 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    backgroundColor: 'white', 
                    borderRadius: '50%', 
                    padding: '2px',
                    color: '#000',
                    // zIndex: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsEditModalOpen(true)}
                  size={24} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                  {user.nickname || '사용자'}
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

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleLogout}
                style={{
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
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
            로딩 중...
          </div>
        )}
      </div>

      {/* 프로필 수정 모달 */}
      {isEditModalOpen && (
        <UserEditModal onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleProfileSave} onDelete={handleDeleteUser} />
      )}
    </>
  );
}

export default ProfileModal;
