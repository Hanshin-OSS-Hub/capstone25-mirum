import { useState } from 'react';
import { useAcceptInvitation } from '@/features/invitations/api/useAcceptInvitation.js';
import { useDeclineInvitation } from '@/features/invitations/api/useDeclineInvitation.js';
import { useGetInviteList } from '@/features/invitations/api/useGetInviteList.js';
import { InvitationCard } from '@/features/invitations/components/InvitationCard.jsx';
import { IconClose } from '@/shared/assets/icons.js';

/**
 * 프로젝트 초대 수신 목록 모달 컴포넌트
 * @param props
 */
export default function ReceivedInvitationsModal(props) {
  const [loadingId, setLoadingId] = useState(null);

  const { data: receivedInvitations } = useGetInviteList();
  const { mutate: accept } = useAcceptInvitation();
  const { mutate: decline } = useDeclineInvitation();

  const handleAccept = async (inviteId) => {
    setLoadingId(inviteId);
    accept(inviteId, { onSettled: () => setLoadingId(null) });
  };

  const handleReject = async (inviteId) => {
    setLoadingId(inviteId);
    decline(inviteId, { onSettled: () => setLoadingId(null) });
  };

  return (
    <div className="animate-in slide-in-from-top-4 absolute right-0 top-[68px] z-[60] w-[min(340px,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] rounded-[32px] border border-border bg-popover p-4 text-popover-foreground shadow-2xl ring-1 ring-black/5 duration-300 sm:p-6 dark:ring-white/10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-black text-foreground">프로젝트 초대</h2>
        <button
          onClick={props.onClose}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
        >
          <IconClose size={20} />
        </button>
      </div>

      <div className="custom-scrollbar max-h-[400px] overflow-y-auto">
        <InvitationCard
          invitations={receivedInvitations}
          loadingId={loadingId}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}
