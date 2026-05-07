import { useMemo, useState } from 'react';
import { UNIFIED_USER_TYPE } from '@/constants/unifiedUserConstants.js';
import { IconClose, IconSearch, IconUserAdd } from '@/shared/assets/icons.js';
import { UserProfileImg } from '@/shared/components/index.js';
import {
  Badge,
  Dialog,
  DialogBody,
  DialogContent,
  DialogOverlay,
  IconButton,
  SearchInput,
} from '@/shared/components/ui/index.js';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';
import { useDragScroll } from '@/shared/hooks/useDragScroll.js';
import { useInviteMember } from '../api/useInviteMember.js';

/**
 * @param {object} props
 * @param {import('@/types/unifiedUser.js').UnifiedUser[]} props.members - 멤버 목록
 */
function InviteMembersModal(props) {
  const { projectId, myUsername, members, pendingInvites, onClose } = props;
  const [userInput, setUserInput] = useState('');

  useBodyScrollLock(true);
  const { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, isDragging } = useDragScroll();

  const unifiedList = useMemo(() => {
    const memberList = [...members]
      .sort((left, right) => {
        if (left.role === 'LEADER' && right.role !== 'LEADER') return -1;
        if (left.role !== 'LEADER' && right.role === 'LEADER') return 1;
        return (left.nickname || left.username || '').localeCompare(
          right.nickname || right.username || '',
        );
      })
      .map((m) => ({
        id: m.username,
        username: m.username,
        nickname: m.nickname,
        type: UNIFIED_USER_TYPE.MEMBER,
        role: m.role,
        profileImg: m.profileImg,
      }));

    const invitationList = pendingInvites.map((i) => ({
      id: i.inviteId,
      username: i.invitedName,
      nickname: i.invitedName,
      type: UNIFIED_USER_TYPE.INVITED,
      inviteId: i.inviteId,
      inviterName: i.inviterName,
      status: i.status,
    }));

    return [...memberList, ...invitationList];
  }, [members, pendingInvites]);

  const { mutate: InviteMember } = useInviteMember();

  const filteredMembers = unifiedList.filter(
    (user) =>
      user.username?.toLowerCase().includes(userInput.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(userInput.toLowerCase()),
  );

  const canInvite =
    userInput.trim() && !unifiedList.some((user) => user.username === userInput.trim());

  const handleInviteMember = (userInput) => {
    InviteMember({
      projectId: projectId,
      invitedName: userInput,
    });
  };

  return (
    <Dialog open={true}>
      <DialogOverlay onClick={onClose} />
      <DialogContent className="max-w-[480px]">
        <DialogBody className="p-10">
          {/* Close Button */}
          <IconButton
            className="absolute right-6 top-6 rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <IconClose size={24} />
          </IconButton>

          <h1 className="mb-8 text-center text-2xl font-black text-foreground">
            프로젝트 멤버 초대
          </h1>

          {/* Search & Invite Input */}
          <div className="mb-8 flex items-center gap-3">
            <div className="relative flex-1">
              <SearchInput
                icon={IconSearch}
                type="text"
                value={userInput}
                placeholder="검색 또는 초대할 아이디"
                inputClassName="h-auto rounded-2xl bg-muted/60 py-3.5 text-sm font-bold text-foreground focus:bg-card focus:ring-4 focus:ring-primary/20"
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>
            <IconButton
              disabled={!canInvite}
              onClick={() => handleInviteMember(userInput)}
              className={`h-12 w-12 shrink-0 rounded-2xl text-white shadow-lg transition-all active:scale-90 ${
                canInvite
                  ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-300 shadow-none'
              }`}
            >
              <IconUserAdd size={22} />
            </IconButton>
          </div>

          {/* Member List */}
          <div 
            ref={ref}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className={`hide-scrollbar h-80 space-y-3 overflow-y-auto px-1 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {filteredMembers.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between rounded-[24px] border border-border bg-card p-4 shadow-sm transition hover:border-primary/35"
              >
                <div className="flex items-center gap-4">
                  <UserProfileImg
                    name={user.nickname}
                    size="md"
                    pendingInvite={user.type !== UNIFIED_USER_TYPE.MEMBER}
                    profileImg={user.profileImg}
                  />
                  <div>
                    <p className="text-sm font-black text-foreground">{user.nickname}</p>
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.type === UNIFIED_USER_TYPE.MEMBER && user.role === 'LEADER' && (
                    <Badge variant="leader">Leader</Badge>
                  )}
                  {user.type === UNIFIED_USER_TYPE.MEMBER ? (
                    user.username === myUsername && <Badge variant="me">Me</Badge>
                  ) : (
                    <Badge variant="waiting" className="h-5 min-w-[58px] px-2">
                      {user.status === 'INVITED' ? 'Waiting' : user.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default InviteMembersModal;
