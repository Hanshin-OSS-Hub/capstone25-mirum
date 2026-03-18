import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import ProfileModal from '@/features/auth/components/ProfileModal.jsx';
import ProjectInvitationModal from '@/features/invitations/components/ProjectInvitationModal.jsx';
import { IconBell } from '@/shared/assets/icons.js';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <header className="relative flex w-full items-center justify-between py-4">
      <div className="header-left cursor-pointer" onClick={handleBack}>
        <div className="logo-box">M</div>
        <span className="logo-text">Mirum</span>
      </div>
      <div className="header-right">
        <button
          className="profile-btn"
          style={{ backgroundColor: 'transparent' }}
          onClick={() => {
            setIsProfileModalOpen(false);
            setIsInvitationModalOpen(!isInvitationModalOpen);
          }}
        >
          <IconBell size={20} />
        </button>
        <button
          className="profile-btn"
          onClick={() => {
            setIsInvitationModalOpen(false);
            setIsProfileModalOpen(!isProfileModalOpen);
          }}
        >
          {/* 26.03.03 localStorage에 nickname이 저장되지 않아 흰 화면 뜸 */}
          {user?.nickname?.charAt(0) || '?'}
        </button>
      </div>

      {isInvitationModalOpen && (
        <ProjectInvitationModal onClose={() => setIsInvitationModalOpen(false)} />
      )}

      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
    </header>
  );
}
