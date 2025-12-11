import React, { useState, useEffect, useRef } from 'react';

export default function CounselorDashboard(){


  // --- [1] 상태 관리 (State) ---
  
  // 선택된 채팅방 ID
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  
  // 채팅 메시지 입력값
  const [inputText, setInputText] = useState("");

  // 가상의 채팅방 목록 데이터 (DB에서 가져왔다고 가정)
  const [rooms, setRooms] = useState([
    { id: 1, userName: '김철수', status: 'WAITING', title: '제주도 3박 4일 일정 문의', userGrade: 'GOLD' },
    { id: 2, userName: '이영희', status: 'ACTIVE', title: '부산 맛집 추천해주세요', userGrade: 'SILVER' },
    { id: 3, userName: '박민수', status: 'WAITING', title: '강릉 당일치기 코스', userGrade: 'BRONZE' },
  ]);

  // 가상의 채팅 메시지 데이터 (채팅방 ID별로 저장)
  const [messages, setMessages] = useState({
    1: [
      { sender: 'user', text: '안녕하세요, 제주도 일정을 짜고 있는데 너무 어려워요.', time: '14:00' },
    ],
    2: [
      { sender: 'user', text: '부산역 근처 맛집 있나요?', time: '13:50' },
      { sender: 'me', text: '안녕하세요! 국밥 좋아하시나요?', time: '13:51' },
      { sender: 'user', text: '네 좋아합니다!', time: '13:52' },
    ],
    3: [
      { sender: 'user', text: '바다가 보고싶어요.', time: '15:00' }
    ]
  });

  // 스크롤 자동 내리기용 Ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedRoomId]);


  // --- [2] 이벤트 핸들러 ---

  // 방 클릭 시
  const handleRoomClick = (id) => {
    setSelectedRoomId(id);
    // 대기중인 방을 클릭하면 '진행중'으로 상태 변경 시뮬레이션
    setRooms(prevRooms => prevRooms.map(room => 
      room.id === id && room.status === 'WAITING' 
        ? { ...room, status: 'ACTIVE' } 
        : room
    ));
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedRoomId) return;

    const newMessage = {
      sender: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [selectedRoomId]: [...(prev[selectedRoomId] || []), newMessage]
    }));

    setInputText("");
  };

  // 엔터키 전송
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // 상담 종료 버튼
  const handleCloseChat = () => {
    alert("상담이 종료되었습니다.");
    setSelectedRoomId(null);
  };

  // --- [3] 현재 선택된 방의 정보 찾기 ---
  const currentRoom = rooms.find(r => r.id === selectedRoomId);
  const currentMessages = messages[selectedRoomId] || [];


  // --- [4] 화면 렌더링 (JSX) ---
  return (
    <div style={styles.container}>
      
      {/* 1. 왼쪽: 채팅방 목록 (List) */}
      <div style={styles.leftPane}>
        <div style={styles.paneHeader}>상담 요청 목록</div>
        <div style={styles.listContainer}>
          {rooms.map(room => (
            <div 
              key={room.id} 
              onClick={() => handleRoomClick(room.id)}
              style={{
                ...styles.roomItem,
                backgroundColor: selectedRoomId === room.id ? '#e6f7ff' : 'white',
                borderLeft: room.status === 'WAITING' ? '4px solid #ff4d4f' : '4px solid #52c41a'
              }}
            >
              <div style={{fontWeight: 'bold', display:'flex', justifyContent:'space-between'}}>
                {room.userName}
                <span style={{
                  fontSize: '12px', 
                  color: room.status === 'WAITING' ? '#ff4d4f' : '#52c41a',
                  border: `1px solid ${room.status === 'WAITING' ? '#ff4d4f' : '#52c41a'}`,
                  padding: '2px 6px', borderRadius: '4px'
                }}>
                  {room.status === 'WAITING' ? '대기' : '상담중'}
                </span>
              </div>
              <div style={{fontSize: '13px', color: '#666', marginTop: '5px'}}>
                {room.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 중앙: 채팅창 (Chat) */}
      <div style={styles.centerPane}>
        {selectedRoomId ? (
          <>
            <div style={styles.chatHeader}>
              <span>💬 {currentRoom.userName}님과의 상담</span>
              <button onClick={handleCloseChat} style={styles.closeButton}>상담 종료</button>
            </div>

            <div style={styles.messageArea}>
              {currentMessages.map((msg, index) => (
                <div key={index} style={{
                  ...styles.messageRow,
                  justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    ...styles.messageBubble,
                    backgroundColor: msg.sender === 'me' ? '#1890ff' : '#f0f0f0',
                    color: msg.sender === 'me' ? 'white' : 'black',
                  }}>
                    {msg.text}
                  </div>
                  <span style={styles.timeText}>{msg.time}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                style={styles.input}
              />
              <button onClick={handleSendMessage} style={styles.sendButton}>전송</button>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <h3>상담할 고객을 선택해주세요</h3>
            <p>좌측 목록에서 대기 중인 고객을 클릭하세요.</p>
          </div>
        )}
      </div>

      {/* 3. 오른쪽: 고객 정보 & 지도 (Info) */}
      <div style={styles.rightPane}>
        <div style={styles.paneHeader}>고객 여행 정보</div>
        {selectedRoomId ? (
          <div style={{padding: '20px'}}>
            <div style={styles.infoCard}>
              <strong>👤 회원 정보</strong>
              <p>이름: {currentRoom.userName}</p>
              <p>등급: {currentRoom.userGrade}</p>
            </div>

            <div style={styles.infoCard}>
              <strong>🗺️ 작성중인 일정 (지도)</strong>
              {/* 지도 API가 들어갈 자리 */}
              <div style={styles.mapPlaceholder}>
                [ Kakao Map Area ]<br/>
                {currentRoom.title} 관련<br/>
                지도 화면이 표시됩니다.
              </div>
            </div>

            <div style={styles.infoCard}>
              <strong>📅 상세 일정</strong>
              <ul style={{paddingLeft: '20px', margin: '10px 0'}}>
                <li>1일차: 공항 도착 → 렌터카</li>
                <li>2일차: 성산일출봉 → 카페</li>
                <li>3일차: 서귀포 시장 → 복귀</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{padding: '20px', color: '#999', textAlign: 'center'}}>
            정보 없음
          </div>
        )}
      </div>

    </div>
  );
};

// --- [5] 인라인 스타일 객체 (CSS 없이 사용하기 위함) ---
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    backgroundColor: '#f5f5f5'
  },
  // 왼쪽 영역
  leftPane: {
    width: '300px',
    backgroundColor: 'white',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column'
  },
  listContainer: {
    overflowY: 'auto',
    flex: 1
  },
  roomItem: {
    padding: '15px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  // 중앙 영역
  centerPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRight: '1px solid #ddd',
  },
  chatHeader: {
    height: '60px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    fontWeight: 'bold',
    fontSize: '18px',
    backgroundColor: 'white'
  },
  messageArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#f9f9f9'
  },
  messageRow: {
    display: 'flex',
    marginBottom: '10px',
    alignItems: 'flex-end'
  },
  messageBubble: {
    maxWidth: '60%',
    padding: '10px 15px',
    borderRadius: '15px',
    fontSize: '14px',
    lineHeight: '1.4',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  timeText: {
    fontSize: '10px',
    color: '#999',
    marginLeft: '5px',
    marginRight: '5px',
    marginBottom: '2px'
  },
  inputArea: {
    height: '70px',
    borderTop: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    backgroundColor: 'white'
  },
  input: {
    flex: 1,
    height: '40px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    padding: '0 15px',
    marginRight: '10px',
    outline: 'none'
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  closeButton: {
    padding: '5px 10px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999'
  },
  // 오른쪽 영역
  rightPane: {
    width: '350px',
    backgroundColor: 'white',
    overflowY: 'auto'
  },
  paneHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
    fontWeight: 'bold',
    fontSize: '16px',
    backgroundColor: '#fafafa'
  }, 
  infoCard: {
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  mapPlaceholder: {
    width: '100%',
    height: '200px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '10px'
  }
};