import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api, client } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import { IconClose, IconPencil, IconTrash, IconUser } from '@/shared/assets/icons.js';
import { LoadingSpinner, UserProfileImg } from '@/shared/components/index.js';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  IconButton,
  Input,
} from '@/shared/components/ui/index.js';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 프로필 정보 수정 모달 (현대적인 디자인 리뉴얼)
 * @param root0
 * @param root0.user
 * @param root0.onSave
 * @param root0.onDelete
 * @param root0.onClose
 */
function UserEditModal({ user, onSave, onDelete, onClose }) {
  const [draftName, setDraftName] = useState(user?.nickname || '');
  const [draftEmail, setDraftEmail] = useState(user?.email || '');

  useBodyScrollLock(true);

  useEffect(() => {
    setDraftName(user?.nickname || '');
    setDraftEmail(user?.email || '');
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ username: user.username, nickname: draftName, email: draftEmail });
    }
  };

  const modalContent = (
    <Dialog open={true}>
      <DialogOverlay onClick={onClose} className="bg-black/40" />
      <DialogContent className="max-w-[min(28rem,calc(100vw-2rem))] rounded-[32px] duration-200">
        {/* Header */}
        <DialogHeader className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
          <DialogTitle className="text-xl">프로필 정보 수정</DialogTitle>
          <IconButton
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:bg-muted"
          >
            <IconClose size={20} />
          </IconButton>
        </DialogHeader>

        <DialogBody className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Username (Read-only) */}
              <div className="space-y-2">
                <label className="px-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  계정 아이디
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/60 px-4 py-3.5 text-muted-foreground shadow-inner">
                  <IconUser size={18} />
                  <span className="text-sm font-bold">{user?.username || '-'}</span>
                </div>
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <label className="px-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  닉네임
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                    <IconPencil size={18} />
                  </div>
                  <Input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="h-auto bg-white py-3.5 pl-12 pr-4 text-sm font-bold text-gray-800"
                    placeholder="닉네임을 입력하세요"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="px-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  이메일 주소
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                    <IconUser size={18} />
                  </div>
                  <Input
                    type="email"
                    value={draftEmail}
                    onChange={(e) => setDraftEmail(e.target.value)}
                    className="h-auto bg-card py-3.5 pl-12 pr-4 text-sm font-bold text-foreground"
                    placeholder="example@mirum.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <Button
                type="submit"
                className="h-auto w-full py-4 text-sm font-black shadow-xl shadow-blue-100"
              >
                변경 사항 저장
              </Button>
              <Button
                type="button"
                onClick={onDelete}
                variant="ghost"
                className="h-auto justify-center gap-2 rounded-xl py-3 text-xs font-bold text-muted-foreground transition-all hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400"
              >
                <IconTrash size={14} />
                회원탈퇴
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );

  return createPortal(modalContent, document.body);
}

/**
 * 헤더 프로필 퀵 메뉴 모달
 * @param root0
 * @param root0.onClose
 */
function ProfileModal({ onClose }) {
  const navigate = useNavigate();
  const { user, logout, deleteUser, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const handleProfileSaveApi = (updatedData) => {
    api
      .put('/user', updatedData)
      .then(() => {
        updateUser(updatedData);
        notify.success('회원정보가 성공적으로 업데이트되었습니다.');
        setIsEditModalOpen(false);
      })
      .catch((error) => {
        notify.error(getErrorMessage(error, '회원정보 업데이트에 실패했습니다.'));
      });
  };

  const handleProfileSaveTest = (updatedData) => {
    updateUser(updatedData);
    notify.success('프로필이 성공적으로 업데이트되었습니다. (데모 모드)');
    setIsEditModalOpen(false);
  };

  const handleDeleteUserApi = async () => {
    if (window.confirm('정말 탈퇴하시겠습니까? 모든 프로젝트 데이터가 소실됩니다.')) {
      try {
        await client('/user', {
          method: 'DELETE',
          body: JSON.stringify({ username: user.username }),
        });
        deleteUser();
        navigate('/');
        onClose();
      } catch (error) {
        notify.error(getErrorMessage(error, '회원탈퇴에 실패했습니다.'));
      }
    }
  };

  const handleDeleteUserTest = () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      deleteUser();
      navigate('/');
      onClose();
    }
  };

  const handleProfileSave = USE_MOCK ? handleProfileSaveTest : handleProfileSaveApi;
  const handleDeleteUser = USE_MOCK ? handleDeleteUserTest : handleDeleteUserApi;

  return (
    <>
      <div className="animate-in slide-in-from-top-4 absolute right-0 top-[68px] z-[60] w-[min(320px,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] overflow-hidden rounded-[32px] border border-border bg-popover p-2 text-popover-foreground shadow-2xl ring-1 ring-black/5 duration-300 dark:ring-white/10">
        {user ? (
          <div className="flex flex-col">
            {/* User Info Header */}
            <div className="flex items-center gap-4 rounded-[28px] border border-border bg-muted/40 p-5">
              <UserProfileImg
                name={user.nickname || user.username}
                profileImg={user.profileImg}
                size="lg"
                className="h-14 w-14 ring-2 ring-background"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-black text-foreground">
                  {user.nickname || '사용자'}
                </h3>
                <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">
                  {user.email || user.username}
                </p>
              </div>
            </div>

            {/* Quick Menu */}
            <div className="space-y-1 p-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted hover:text-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <IconPencil size={16} />
                </div>
                프로필 수정
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-muted-foreground transition-all hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted transition-colors hover:bg-red-500/20">
                  <IconClose size={16} />
                </div>
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center">
            <LoadingSpinner size="sm" label="사용자 확인 중..." />
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <UserEditModal
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleProfileSave}
          onDelete={handleDeleteUser}
        />
      )}
    </>
  );
}

export default ProfileModal;
