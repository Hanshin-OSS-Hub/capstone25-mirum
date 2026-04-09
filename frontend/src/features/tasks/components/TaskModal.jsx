import { useEffect, useMemo, useState } from 'react';
// import { taskStatus } from '@/features/tasks/types/task.js';
import { useUpdateTask } from '@/features/tasks/api/useUpdateTask.js';
import TaskNote from '@/features/note/components/TaskNote.jsx';
import TaskModalEditor from '@/features/tasks/components/TaskModalEditor.jsx';
import { IconClose, IconEdit } from '@/shared/assets/icons.js';
import { reviewTask } from '../../ai/api/reviewTask.js';

export default function TaskModal(props) {
  const { task, onClose, members, myUserName } = props;
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReviewerOpen, setIsReviewerOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task, notes: task.notes || '' });

  // region AI 리뷰 관련 상태
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [review, setReview] = useState('');
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  // endregion
  const { mutate: updateTask } = useUpdateTask();

  useEffect(() => {
    setEditedTask({ ...task, notes: task.notes || '' });
    setIsEditMode(false); // 태스크가 바뀔 때마다 기본 뷰로 초기화
    setAiError('');
    setIsAiLoading(false);
    setReview('');
    setReviewError('');
    setIsReviewLoading(false);
    setIsReviewerOpen(false);
  }, [task]);

  useEffect(() => {
    if (task) {
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      document.documentElement.style.overflow = 'auto';
    };
  }, [task]);

  const isAssignee = useMemo(() => {
    return (myUserName || '') === (task.assignee || '');
  }, [myUserName, task.assignee]);

  const getStatusText = (status) => {
    switch (status) {
      case 'DONE':
        return '완료';
      case 'IN_PROGRESS':
        return '진행중';
      default:
        return '대기';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateDot = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${day}.`;
  };

  const handleSave = () => {
    updateTask(
      {
        requestData: {
          taskId: editedTask.taskId, // 반드시 포함
          title: editedTask.title,
          description: editedTask.description,
          status: editedTask.status,
          assigneeId: editedTask.assigneeId,
          assigneeName: editedTask.assigneeName,
          dueDate: editedTask.dueDate,
          tags: editedTask.tags,
          notes: editedTask.notes,
        },
        projectId: Number(task.projectId),
      },
      {
        onSuccess: () => {
          // 서버 통신이 '성공'했을 때만 편집 모드를 종료합니다.
          setIsEditMode(false);
        },
      },
    );
  };

  const handleClose = () => {
    if (editedTask.notes !== task.notes) {
      updateTask(
        {
          requestData: {
            taskId: editedTask.taskId,
            notes: editedTask.notes,
          },
          projectId: Number(task.projectId),
        },
        {
          onSuccess: () => {
            // 서버 통신이 '성공'했을 때만 편집 모드를 종료합니다.
            setIsEditMode(false);
          },
        },
      );
    }
    onClose();
  };

  const handleAiSummarize = async () => {
    const noteText = editedTask.notes?.trim();
    if (!noteText) {
      setAiError('정리할 메모를 먼저 입력해주세요.');
      return;
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setAiError('VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
      return;
    }

    setAiError('');
    setIsAiLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                '사용자의 메모를 업무용으로 깔끔하게 정리해줘. 핵심만 불릿 포인트로 정리하고, 제목 1개 + 항목 3~6개 형태로 한국어로 답해.',
            },
            {
              role: 'user',
              content: noteText,
            },
          ],
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'AI 정리에 실패했습니다.');
      }

      const summarized = data?.choices?.[0]?.message?.content?.trim();
      if (!summarized) {
        throw new Error('AI 응답이 비어 있습니다.');
      }

      setEditedTask((prev) => ({
        ...prev,
        notes: summarized,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 정리 중 오류가 발생했습니다.';
      setAiError(message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleReviewTask = async () => {
    const noteText = editedTask.notes?.trim();
    if (!noteText) {
      setReviewError('리뷰할 메모가 없습니다. 메모를 입력한 뒤 다시 시도해주세요.');
      setReview('');
      return;
    }

    setReviewError('');
    setReview('');
    setIsReviewLoading(true);

    try {
      const result = await reviewTask({
        title: editedTask.title,
        description: editedTask.description,
        notes: editedTask.notes,
        assignee: editedTask.assignee,
        status: editedTask.status,
        dueDate: editedTask.dueDate,
        tags: editedTask.tags,
      });
      setReview(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI 리뷰 생성 중 오류가 발생했습니다.';
      setReviewError(message);
    } finally {
      setIsReviewLoading(false);
    }
  };

  const reviewItems = useMemo(() => {
    if (!review) return [];

    return review
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-*•]\s*/, ''));
  }, [review]);

  // 읽기 전용 뷰 (기본 화면)
  const TeamView = () => {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusPill(editedTask.status)}`}
            >
              {getStatusText(editedTask.status)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReviewerOpen((prev) => !prev)}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                isReviewerOpen
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              AI 리뷰어
            </button>

            {isAssignee ? (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="cursor-pointer rounded-lg p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-600"
                aria-label="edit"
                title="편집하기"
              >
                <IconEdit className="text-lg" />
              </button>
            ) : null}

            {/* ✅ 팀원 화면에도 나가기 버튼 추가 */}
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50"
            >
              <IconClose className="text-lg" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">{editedTask.title}</h2>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">담당자</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                    {(editedTask.assigneeName || '?').slice(0, 1)}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {editedTask.assigneeName || '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">마감일</p>
                <p className="text-sm font-medium text-gray-900">
                  {editedTask.dueDate ? formatDateDot(editedTask.dueDate) : '-'}
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">상태</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${getStatusDotColor(editedTask.status)}`}
                  ></span>
                  <p className="text-sm font-medium text-gray-900">
                    {getStatusText(editedTask.status)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-gray-800">태그</p>
            <div className="flex flex-wrap gap-2">
              {editedTask.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
              {(!editedTask.tags || editedTask.tags.length === 0) && (
                <span className="text-sm text-gray-400">태그가 없습니다</span>
              )}
            </div>
          </div>

          <div className="my-8 border-t border-gray-100"></div>

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">메모</h3>

            {/*<button*/}
            {/*    type="button"*/}
            {/*    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium cursor-default"*/}
            {/*>*/}
            {/*  미리보기*/}
            {/*</button>*/}
          </div>

          {/* 마크다운 노트 */}
          <TaskNote
            notes={editedTask.notes}
            isReadOnly={false}
            onChange={(text) => {
              setEditedTask({ ...editedTask, notes: text });
            }}
            onAiSummarize={handleAiSummarize}
            isAiLoading={isAiLoading}
            aiError={aiError}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative flex h-full w-full items-center justify-center p-4">
        <div
          className={`flex h-[92vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 ${isReviewerOpen ? 'max-w-7xl' : 'max-w-5xl'}`}
        >
          <div className="min-w-0 flex-1">
            {isEditMode ? (
              <TaskModalEditor
                editedTask={editedTask}
                setEditedTask={setEditedTask}
                teamMembers={members}
                onSave={handleSave}
                onCancel={() => setIsEditMode(false)}
              />
            ) : (
              TeamView()
            )}
          </div>

          {isReviewerOpen ? (
            <aside className="flex w-[340px] flex-col border-l border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">AI 동료 리뷰어</h3>
                  <button
                    type="button"
                    onClick={() => setIsReviewerOpen(false)}
                    className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="reviewer close"
                  >
                    <IconClose className="text-lg" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Task 메모를 바탕으로 개선점을 제안합니다.
                </p>
              </div>

              <div className="border-b border-gray-100 p-4">
                <button
                  type="button"
                  onClick={handleReviewTask}
                  disabled={isReviewLoading}
                  className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  AI 리뷰 받기
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-900">AI 리뷰 결과</p>

                  {isReviewLoading ? (
                    <p className="text-sm text-gray-600">AI가 리뷰 중입니다...</p>
                  ) : null}

                  {!isReviewLoading && reviewError ? (
                    <p className="text-sm text-red-600">{reviewError}</p>
                  ) : null}

                  {!isReviewLoading && !reviewError && reviewItems.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
                      {reviewItems.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  ) : null}

                  {!isReviewLoading && !reviewError && reviewItems.length === 0 ? (
                    <p className="text-sm text-gray-400">아직 생성된 리뷰가 없습니다.</p>
                  ) : null}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
