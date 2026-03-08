import {HiCheck, HiXMark, HiOutlineTrash} from "react-icons/hi2";

export function InvitationsList(props) {
  return (
      <>
        {/*<h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>*/}
        {/*  프로젝트 초대*/}
        {/*</h2>*/}
        {
          !Array.isArray(props.invitations) ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
                로딩 중...
              </div>
          ) : props.invitations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
                새로운 초대가 없습니다.
              </div>
          ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {
                  props.invitations
                      .filter(invitation => invitation.status === "INVITED")  // INVITED 상태만 표시
                      .map((invitation) => (
                          <div
                              key={invitation.inviteId}
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
                                  onClick={() => props.onAccept(invitation.inviteId)}
                                  disabled={props.loadingId === invitation.inviteId}
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: '#10b981',
                                    color: 'white',
                                    borderRadius: '6px',
                                    cursor: props.loadingId === invitation.inviteId ? 'not-allowed' : 'pointer',
                                    opacity: props.loadingId === invitation.inviteId ? 0.6 : 1,
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
                                  onClick={() => props.onReject(invitation.inviteId)}
                                  disabled={props.loadingId === invitation.inviteId}
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    color: '#6b7280',
                                    borderRadius: '6px',
                                    cursor: props.loadingId === invitation.inviteId ? 'not-allowed' : 'pointer',
                                    opacity: props.loadingId === invitation.inviteId ? 0.6 : 1,
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
                      ))
                }
              </div>
          )
        }
      </>
  );
}

// export function SentInvitationsList(props) {
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'ACCEPTED':
//         return <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>수락됨</span>;
//       case 'DECLINED':
//         return <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>거절됨</span>;
//       default:
//         return <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>대기중</span>;
//     }
//   };
//
//   return (
//       <>
//         {
//           !Array.isArray(props.invitations) ? (
//               <div style={ {textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px'} }>
//                 로딩 중...
//               </div>
//           ) : props.invitations.length === 0 ? (
//               <div style={ { textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: '14px'} }>
//                 보낸 초대가 없습니다.
//               </div>
//           ) : (
//               <div style={ { display: 'flex', flexDirection: 'column', gap: '12px' } }>
//                 {
//                   props.invitations
//                       .map((invitation) => (
//                           <div
//                               key={invitation.inviteId}
//                               style={{
//                                 padding: '12px',
//                                 border: '1px solid #e5e7eb',
//                                 borderRadius: '8px',
//                                 backgroundColor: '#f9fafb',
//                               }}
//                           >
//                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
//                               <div>
//                                 <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
//                                   {invitation.projectName}
//                                 </p>
//                                 <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
//                                   To: {invitation.invitedName}
//                                 </p>
//                               </div>
//                               {getStatusBadge(invitation.status)}
//                             </div>
//
//                             {invitation.status === 'INVITED' && (
//                                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
//                                   <button
//                                       onClick={() => props.onCancel && props.onCancel(invitation.inviteId)}
//                                       style={{
//                                         padding: '6px 10px',
//                                         border: '1px solid #e5e7eb',
//                                         background: 'white',
//                                         color: '#ef4444',
//                                         borderRadius: '6px',
//                                         cursor: 'pointer',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '4px',
//                                         fontSize: '12px',
//                                         fontWeight: 500,
//                                       }}
//                                   >
//                                     <HiOutlineTrash size={14} />
//                                     취소
//                                   </button>
//                                 </div>
//                             )}
//                           </div>
//                       ))
//                 }
//               </div>
//           )
//         }
//       </>
//   );
// }