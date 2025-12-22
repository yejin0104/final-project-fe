import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from "jotai";
import { accessTokenState, counselorState, loginIdState, loginLevelState, loginState, messageHistoryState, refreshTokenState } from "../../utils/jotai";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const API_URL = '/chat';

export default function CounselorDashboard() {
    const navigate = useNavigate();
    // const REQUIRED_LEVEL = '상담사';
    const [room, setRoom] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState({});
    const [checkedAuth, setCheckedAuth] = useState(false);

    const messagesEndRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);

    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);

    const [history, setHistory] = useAtom(messageHistoryState);

    
    const isLoggedIn = useAtomValue(loginState);
    const isCounselor = useAtomValue(counselorState);

    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);

    // useEffect(() => {
    //     if (checkedAuth) return;

    //     if (!isLoggedIn) {
    //         navigate("/account/login");
    //         setCheckedAuth(true);
    //         return;
    //     }

    //     if (!isCounselor) {
    //         //alert("상담사 전용 페이지입니다.");
    //         navigate("/unauthorized");
    //         setCheckedAuth(true);
    //         //return;
    //     }
    // }, [isLoggedIn, isCounselor, checkedAuth]);

    useEffect(() => {
        if (checkedAuth) return;

        const handleAuth = () => {
            if (!isLoggedIn) {
                navigate("/account/login");
                setCheckedAuth(true);
                return;
            }
            if (!isCounselor) {
                toast.error("상담사 전용 페이지입니다."); // 한 번만 호출
                navigate("/unauthorized");
                setCheckedAuth(true);
            }
        };

        handleAuth();
    }, [isLoggedIn, isCounselor, checkedAuth]);

    const fetchChatRooms = async () => {
        setIsLoading(true);
        try {
            // const rawToken = sessionStorage.getItem("accessToken");
            if (!accessToken) return;
            const token = accessToken.replace(/"/g, '');
            console.log(token)
            const response = await axios.get(`${API_URL}/counselor/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                const { data } = response;

                const convertedRooms = data.map(dto => ({
                    id: dto.chatNo,
                    userName: `고객 #${dto.chatNo}`,
                    status: dto.chatStatus,
                    title: dto.chatStatus === "WAITING" ? "새로운 상담 요청" : `진행 중인 채팅`,
                    userGrade: "N/A",
                    chatId: dto.chatId,
                    chatLevel: dto.chatLevel
                }));

                setRoom(prevRooms => {
                    return convertedRooms.map(newRoom => {
                        const prev = prevRooms.find(r => r.id === newRoom.id);
                        return prev ? { ...newRoom, ...prev } : newRoom;
                    });
                });
            }

        } catch (error) {
           if (error.response?.status === 403) {
            toast.error("상담사 전용 페이지입니다. 권한이 없습니다.", { toastId: "authError" });
            navigate("/unauthorized");
        }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChatRooms();

        const interval = setInterval(() => {
            if (!selectedRoomId) {
                fetchChatRooms();
            }
        }, 5000); //5초마다 갱신

        return () => clearInterval(interval);
        // console.log("상담사 채팅 대시보드 mounted, 자동 갱신 시작");

    }, [selectedRoomId]);

    //새로고침 후 채팅방 복구
    useEffect(() => {
        if(room.length === 0) return;

        const saveRoomId = sessionStorage.getItem("activeChatRoomId");
        if(!saveRoomId) return;

        const saveId = Number(saveRoomId);

        const reRoom = room.find(r => 
            r.id === saveId && 
            r.status === 'ACTIVE' && 
            r.chatId === loginId
        );

        if(reRoom) {
            setSelectedRoomId(saveId);
        }
        else {
            sessionStorage.removeItem("activeChatRoomId");
        }
    }, [loginId, room]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedRoomId]);

    // 1. 최초 1회 연결
    useEffect(() => {
        if (!accessToken) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                accessToken: `Bearer ${accessToken}`,
                refreshToken: `Bearer ${refreshToken}`,
            },
            onConnect: () => {
                console.log("STOMP 연결 완료");
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
            stompClientRef.current = null;
        };
    }, [accessToken, refreshToken]);

    useEffect(() => {
        console.log("Subscribing to room:", selectedRoomId);
        if (
            !stompClientRef.current ||
            !stompClientRef.current.connected ||
            !selectedRoomId
        ) return;

        subscriptionRef.current?.unsubscribe();

        subscriptionRef.current =
            stompClientRef.current.subscribe(
                `/public/message/${selectedRoomId}`,
                (msg) => {
                    const json = JSON.parse(msg.body);

                    setMessages(prev => ({
                        ...prev,
                        [selectedRoomId]: [
                            ...(prev[selectedRoomId] || []),
                            json
                        ]
                    }));
                }
            );

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
        };
    }, [selectedRoomId]);


    useEffect(() => {
        if (!selectedRoomId) return;

        const current = room.find(r => r.id === selectedRoomId);

        // CLOSED일 때만 나가게 수정
        if (current && current.status === 'CLOSED') {
            setSelectedRoomId(null);
        }
    }, [room, selectedRoomId]);

    // const updateChatStatus = async (chatNo, newStatus) => {
    //     //const rawToken = sessionStorage.getItem("accessToken");
    //     if (!accessToken) return;
    //     const token = accessToken.replace(/"/g, '');

    //     const updateData = {
    //         chatNo,
    //         chatStatus: newStatus,
    //     };

    //     await axios.post(`${API_URL}/status`, updateData, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         }
    //     });

    //     try {
    //         const response = await axios.post(`${API_URL}/status`, updateData, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 "Authorization": `Bearer ${token}`,
    //             }
    //         });

    //         // 성공 시 목록 새로고침
    //         if (response.status === 200 || response.status === 204) {
    //             // await fetchChatRooms();
    //         }
    //     } catch (error) {
    //         console.error("오류 발생 줄:", error.config);
    //         alert(`상태 변경 실패: ${error.response?.data || error.message}`);
    //     }
    // };

    const updateChatStatus = async (chatNo, newStatus) => {
    if (!accessToken) return;
    const token = accessToken.replace(/"/g, '');

    try {
        const response = await axios.post(
            `${API_URL}/status`,
            { chatNo, chatStatus: newStatus },
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            }
        );

        return response;
    } catch (error) {
        console.error("상태 변경 실패:", error);
        throw error;
    }
};

    const handleRoomClick = (id) => {
        const clickedRoom = room.find(r => r.id === id);
        if (!clickedRoom) return;

        setSelectedRoomId(id);
        sessionStorage.setItem("activeChatRoomId", id);

        if (clickedRoom.status === 'WAITING') {
            setRoom(prev =>
                prev.map(r =>
                    r.id === id
                        ? { ...r, status: 'ACTIVE', chatId: loginId }
                        : r
                )
            );
            updateChatStatus(id, 'ACTIVE');
        }
    };

    // const handleSendMessage = () => {
    //     if (!inputText.trim() || !selectedRoomId) return;

    //     const newMessage = {
    //         sender: 'me',
    //         text: inputText,
    //         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    //     };

    //     setMessages(prev => ({
    //         ...prev,
    //         [selectedRoomId]: [...(prev[selectedRoomId] || []), newMessage]
    //     }));

    //     setInputText("");
    // };

    const handleSendMessage = () => {
        // 로그를 추가하여 함수 호출 여부 확인
        console.log("전송 버튼 클릭됨, 입력값:", inputText);
        
        if (!inputText.trim() || !selectedRoomId || !stompClientRef.current) {
            console.error("전송 불가 상태:", { 
                text: !!inputText.trim(), 
                room: !!selectedRoomId, 
                client: !!stompClientRef.current 
            });
            return;
        }

        const payload = {
            messageSender: loginId,
            chatNo: selectedRoomId,
            messageType: "TALK",
            content: inputText,
        };

        stompClientRef.current.publish({
            destination: `/app/message/${selectedRoomId}`,
            headers: {
                accessToken: `Bearer ${accessToken}`,
                refreshToken: `Bearer ${refreshToken}`,
            },
            body: JSON.stringify(payload)
        });

        console.log("메시지 전송 완료:", payload);
        setInputText("");
};


    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSendMessage();
    };

    const handleCloseChat = async () => {
        if (!selectedRoomId) return;

        if (!window.confirm("정말 상담을 종료하시겠습니까?")) return;

        await updateChatStatus(selectedRoomId, "CLOSED");

        setRoom(prev => prev.filter(r => r.id !== selectedRoomId));
        setSelectedRoomId(null);
    };

    const currentRoom = room?.find(r => r.id === selectedRoomId) || null;
    const currentMessages = messages[selectedRoomId] || [];

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'WAITING': return { color: '#ff4d4f', border: '1px solid #ff4d4f', text: '대기 중' };
            case 'ACTIVE': return { color: '#52c41a', border: '1px solid #52c41a', text: '상담 중' };
            case 'CLOSED': return { color: '#999', border: '1px solid #999', text: '상담 종료' };
            default: return { color: '#666', border: '1px solid #666', text: '알 수 없음' };
        }
    };

    // if (!isLoggedIn || userLevel !== REQUIRED_LEVEL) return null;
    if (!isLoggedIn || !isCounselor) return null;

    return (
        <div style={styles.container}>
            {/* 왼쪽 패널 */}
            <div style={styles.leftPane}>
                <div style={styles.paneHeader}>
                    상담 요청 목록
                    <span style={styles.roomCount}> (총 {room.length}건)</span>
                </div>

                {/* 목록 */}
                <div style={styles.listContainer}>
                    {room.map(room => {
                        const badge = getBadgeStyle(room.status);

                        return (
                            <div key={room.id} onClick={() => handleRoomClick(room.id)}
                                style={{
                                    ...styles.roomItem,
                                    backgroundColor: selectedRoomId === room.id ? '#e6f7ff' : 'white',
                                    borderLeft: `4px solid ${badge.color}`,
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    {room.userName}
                                    <span style={{
                                        fontSize: '12px',
                                        color: badge.color,
                                        border: badge.border,
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        {badge.text}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                                    {room.title}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 중앙 패널 */}
            <div style={styles.centerPane}>
                {selectedRoomId ? (
                    currentRoom ? (
                        <>
                            <div style={styles.chatHeader}>
                                <span>{currentRoom?.userName}님과의 상담</span>

                                {currentRoom.status === "ACTIVE" && (
                                    <button onClick={handleCloseChat} style={styles.closeButton}>
                                        상담 종료
                                    </button>
                                )}

                                {currentRoom.status === "CLOSED" && (
                                    <span style={styles.closedBadge}>상담 종료됨</span>
                                )}
                            </div>

                            <div style={styles.messageArea}>
                                {(messages[selectedRoomId] || []).map((msg, i) => {
                                    // 백엔드 로그 기준: 전송 시 messageSender에 loginId를 담아 보냈으므로 확인
                                    console.log("Received message");
                                    const sender = msg.messageSender || msg.loginId; 
                                    const isMyMessage = sender === loginId;
                                    console.log("Message sender:", sender, "Is my message:", isMyMessage);
                                    return (
                                        <div key={i} style={{
                                            ...styles.messageRow,
                                            justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                                            display: 'flex',
                                            margin: '10px 0'
                                        }}>
                                            <div style={{
                                                ...styles.messageBubble,
                                                backgroundColor: isMyMessage ? '#1890ff' : '#f0f0f0',
                                                color: isMyMessage ? 'white' : 'black',
                                                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                                                borderRadius: '12px',
                                                padding: '8px 15px',
                                                maxWidth: '70%'
                                            }}>
                                                {/* content와 messageContent 둘 다 대응 */}
                                                {msg.content || msg.messageContent}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* {currentRoom?.status === 'ACTIVE' ? (
                                <div style={styles.inputArea}>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        style={styles.input}
                                        placeholder="메시지를 입력하세요..."
                                    />
                                    <button style={styles.sendButton} onClick={handleSendMessage}>전송</button>
                                </div>
                            ) : (
                                <div style={styles.inputDisabledArea}>
                                    종료된 상담에는 메시지를 보낼 수 없습니다.
                                </div>
                            )} */}
                            {currentRoom?.status === 'ACTIVE' && (
                                <div style={styles.inputArea}>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        style={styles.input}
                                        placeholder="메시지를 입력하세요..."
                                    />
                                    <button style={styles.sendButton} onClick={handleSendMessage}>
                                        전송
                                    </button>
                                </div>
                            )}

                            {currentRoom?.status === 'WAITING' && (
                                <div style={styles.inputDisabledArea}>
                                    상담사가 아직 입장하지 않았습니다.
                                </div>
                            )}

                            {currentRoom?.status === 'CLOSED' && (
                                <div style={styles.inputDisabledArea}>
                                    종료된 상담입니다.
                                </div>
                            )}

                        </>
                    ) : (
                        <div style={styles.emptyState}>
                            <p>채팅 데이터를 불러올 수 없습니다.</p>
                            <button onClick={fetchChatRooms}>다시 시도</button>
                        </div>
                    )
                ) : (
                    <div style={styles.emptyState}>
                        <h3>상담할 고객을 선택해주세요</h3>
                        <p>좌측에서 상담 방을 선택하세요.</p>
                    </div>
                )}
            </div>

            {/* 오른쪽 패널 */}
            <div style={styles.rightPane}>
                <div style={styles.paneHeader}>고객 정보</div>
                <div style={styles.rightContent}>
                    {currentRoom ? (
                        <div style={{ padding: '20px' }}>
                            <div style={styles.infoCard}>
                                <strong>회원 정보</strong>
                                <p>방 번호: {currentRoom?.id}</p>
                                <p>이름: {currentRoom?.userName}</p>
                                <p>등급: {currentRoom?.userGrade}</p>
                                <p>상태: {getBadgeStyle(currentRoom?.status).text}</p>
                                <p>배정 상담사: {currentRoom?.chatId || '없음'}</p>
                            </div>

                            <div style={styles.infoCard}>
                                <strong>지도 영역</strong>
                                <div style={styles.mapPlaceholder}>[ Kakao Map ]</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                            선택된 고객이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        width: '100%',
        overflow: 'hidden',
    },
    // 왼쪽 영역
    leftPane: {
        flex: '0 1 clamp(200px, 20vw, 280px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '800px',
    },
    paneHeader: {
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        fontWeight: 'bold',
        fontSize: '16px',
        backgroundColor: '#fafafa'
    },
    listContainer: {
        overflowY: 'auto',
        flex: 1,
    },
    roomCount: {
        fontWeight: 'normal',
        fontSize: '14px',
        color: '#999',
        marginLeft: '5px'
    },
    roomItem: {
        padding: '15px',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background 0.2s',
        '&:hover': {
            backgroundColor: '#f9f9f9'
        }
    },
    emptyList: {
        textAlign: 'center',
        padding: '20px',
        color: '#999',
        fontSize: '14px'
    },
    // 중앙 영역
    centerPane: {
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        minHeight: '800px',
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
    closedBadge: {
        fontSize: '12px',
        color: '#999',
        border: '1px solid #999',
        padding: '5px 10px',
        borderRadius: '5px'
    },
    messageArea: {
        flex: 1,
        minHeight: 0,
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
    inputDisabledArea: {
        height: '70px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        color: '#999',
        fontWeight: 'bold'
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
        flex: '0 1 clamp(220px, 22vw, 320px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        minHeight: '800px',
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
    },

    rightContent: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px'
    },
};