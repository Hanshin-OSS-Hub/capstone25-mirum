import { IconCheck, IconClose } from '@/shared/assets/icons.js';

/**
 * 프로젝트 초대 카드 컴포넌트
 * @param props
 */
export function InvitationCard(props) {
  const { invitations, loadingId, onAccept, onReject } = props;

  if (!Array.isArray(invitations)) {
    return (
      <div className="py-10 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="py-10 text-center text-sm font-bold text-muted-foreground">
        새로운 초대가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations
        .filter((invitation) => invitation.status === 'INVITED')
        .map((invitation) => (
          <div
            key={invitation.inviteId}
            className="rounded-[24px] border border-border bg-muted/40 p-5 shadow-sm transition-all hover:bg-card hover:shadow-md"
          >
            <div className="mb-4">
              <p className="text-base font-black leading-tight text-foreground">
                {invitation.projectName}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-tighter text-gray-400">
                Invited by {invitation.inviterName || 'Unknown'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAccept(invitation.inviteId)}
                disabled={loadingId === invitation.inviteId}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black text-white transition-all active:scale-95 ${
                  loadingId === invitation.inviteId
                    ? 'bg-gray-300 opacity-60'
                    : 'bg-blue-600 shadow-lg shadow-blue-100 hover:bg-blue-700'
                }`}
              >
                <IconCheck size={16} />
                <span>수락</span>
              </button>
              <button
                onClick={() => onReject(invitation.inviteId)}
                disabled={loadingId === invitation.inviteId}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-xs font-black text-muted-foreground transition-all active:scale-95 ${
                  loadingId === invitation.inviteId
                    ? 'opacity-60'
                    : 'hover:border-border hover:bg-muted'
                }`}
              >
                <IconClose size={16} />
                <span>거절</span>
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
