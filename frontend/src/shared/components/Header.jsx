import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetInviteList } from '@/features/invitations/api/useGetInviteList.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import ProfileModal from '@/features/auth/components/ProfileModal.jsx';
import ReceivedInvitationsModal from '@/features/invitations/components/ReceivedInvitationsModal.jsx';
import { IconBell, IconMoon, IconSun } from '@/shared/assets/icons.js';
import UserProfileImg from '@/shared/components/UserProfileImg.jsx';
import { Button, IconButton } from '@/shared/components/ui/index.js';
import {
  applyDomTheme,
  persistThemePreference,
  readThemePreference,
  toggleThemeAppearance,
} from '@/shared/lib/theme.js';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [themePreference, setThemePreference] = useState(readThemePreference);
  const invitationAreaRef = useRef(null);
  const profileAreaRef = useRef(null);
  const { data: receivedInvitations = [], refetch: refetchInvitations } = useGetInviteList(
    30000,
    !!user?.username,
  );

  const handleBack = () => {
    navigate('/dashboard');
  };

  const toggleInvitationModal = () => {
    setIsProfileModalOpen(false);
    const nextOpen = !isInvitationModalOpen;
    setIsInvitationModalOpen(nextOpen);
    if (nextOpen) {
      refetchInvitations();
    }
  };

  useEffect(() => {
    applyDomTheme(themePreference);
    persistThemePreference(themePreference);
  }, [themePreference]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isInsideInvitation = invitationAreaRef.current?.contains(target);
      const isInsideProfile = profileAreaRef.current?.contains(target);

      if (!isInsideInvitation) {
        setIsInvitationModalOpen(false);
      }
      if (!isInsideProfile) {
        setIsProfileModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="relative flex w-full items-center justify-between py-4">
      {/* Logo Section */}
      <div className="group flex cursor-pointer items-center gap-2.5" onClick={handleBack}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-lg shadow-blue-100 transition-all group-hover:bg-blue-700">
          M
        </div>
        <span className="text-lg font-black tracking-tight text-foreground">Mirum</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <IconButton
          className="relative border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-primary"
          onClick={() => setThemePreference((prev) => toggleThemeAppearance(prev))}
          title={
            themePreference === 'light' ? '테마: 라이트 (클릭: 다크)' : '테마: 다크 (클릭: 라이트)'
          }
        >
          {themePreference === 'light' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </IconButton>

        <div ref={invitationAreaRef} className="relative">
          <IconButton
            className="relative border-transparent bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-primary"
            onClick={toggleInvitationModal}
            title="알림 및 초대"
          >
            <IconBell size={20} />
            {receivedInvitations.length > 0 && (
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background"></span>
            )}
          </IconButton>

          {isInvitationModalOpen && (
            <ReceivedInvitationsModal onClose={() => setIsInvitationModalOpen(false)} />
          )}
        </div>

        <div ref={profileAreaRef} className="relative">
          <Button
            variant="secondary"
            size="sm"
            className="h-10 gap-2 px-3"
            onClick={() => {
              setIsInvitationModalOpen(false);
              setIsProfileModalOpen(!isProfileModalOpen);
            }}
          >
            <UserProfileImg
              name={user?.nickname || user?.username}
              profileImg={user?.profileImg}
              size="sm"
              className="border-background"
            />
            <span className="pr-1 text-xs font-bold text-foreground">
              {user?.nickname || '사용자'}
            </span>
          </Button>

          {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
