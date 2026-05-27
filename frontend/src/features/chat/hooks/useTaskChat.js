import { useState, useRef, useEffect, useCallback } from 'react';
import { useGetChatMessages } from '@/features/chat/api/useGetChatMessages.js';
import { useSendChatMessage } from '@/features/chat/api/useSendChatMessage.js';
import { useMirumAI } from '@/features/ai/hooks/useMirumAI.js';

export function useTaskChat({ projectId, taskId, currentUser }) {
  const [newMessage, setNewMessage] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const chatBottomRef = useRef(null);

  const { data: chatMessages = [], isLoading: isChatLoading } = useGetChatMessages(taskId);
  const { mutate: sendMessage } = useSendChatMessage(taskId);
  const { askTaskAI, isLoading: isAiGenerating } = useMirumAI();

  const scrollChatToBottom = useCallback((behavior = 'smooth') => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  useEffect(() => {
    scrollChatToBottom('auto');
  }, [isChatLoading, scrollChatToBottom]);

  useEffect(() => {
    scrollChatToBottom('smooth');
  }, [chatMessages, scrollChatToBottom]);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isAiGenerating) return;

    // 사용자 메시지 서버에 저장
    sendMessage({
      author: currentUser || '나',
      message: trimmed,
      isAi: false,
    });
    setNewMessage('');

    // AI 모드일 경우 AI 답변 생성 및 서버 저장
    if (isAiMode) {
      try {
        const aiResponse = await askTaskAI(trimmed, projectId, taskId);
        sendMessage({
          author: 'MIRUM AI',
          message: aiResponse,
          isAi: true,
        });
      } catch (err) {
        console.error('AI 답변 생성 실패:', err);
      }
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    newMessage,
    setNewMessage,
    isAiMode,
    setIsAiMode,
    chatBottomRef,
    chatMessages,
    isChatLoading,
    isAiGenerating,
    handleSendMessage,
    handleChatKeyDown
  };
}