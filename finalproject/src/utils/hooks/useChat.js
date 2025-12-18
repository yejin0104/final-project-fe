import { useState } from 'react';
import axios from 'axios'; 

export default function useChat() {
  // 팝업의 열림/닫힘 상태
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  // 채팅방 상태 관리
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatNo, setChatNo] = useState(null);

  const openChat = async () => {
    closePopup(); // 팝업 닫기
    try {
      // 채팅방 생성 API 호출
      const response = await axios.post("http://localhost:8080/chat", {});
      const newChatNo = response.data.chatNo;

      // 채팅방 번호 저장하고, 채팅방 열기
      setChatNo(newChatNo);
      setIsChatOpen(true);
      console.log("채팅방 생성 성공, 채팅방 번호:", newChatNo);
      console.log("isChatOpen:", isChatOpen);
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      // 에러 처리 로직 추가 (예: 사용자에게 오류 메시지 표시)
    }
  };

  const closeChat = () => setIsChatOpen(false);

  return {
    isPopupOpen,
    openPopup,
    closePopup,
    isChatOpen,
    openChat,
    closeChat,
    chatNo,
  };
}
