import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useAtom } from "jotai";
// import { accessTokenState, loginIdState, refreshTokenState, messagesByChatIdState, wsConnectionState } from "../utils/jotai";
import { accessTokenState, loginIdState, refreshTokenState, messagesByChatIdState, wsConnectionState as wsStatusAtom, } from "../../utils/jotai";

export default function ChatSocket({ isChatOpen, onChatClose, currentChatNo }) {

    if (!isChatOpen || !currentChatNo) {
        return null;
    }

    //방 번호 수신
    // const {chatNo} = useParams();
    // const navigate = useNavigate();

    const chatNo = currentChatNo;

    const [loginId, setLoginId] = useAtom(loginIdState);
    //const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);//나의 액세스 토큰
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);//나의 리프레시 토큰
    const [messagesByChatId, setMessagesByChatId] = useAtom(messagesByChatIdState); //메세지 저장할 빈 배열 하나 생성 (jotai 스타일)
    //const [wsConnectionState, setWsConnectionState] = useAtom(wsConnectionState);
    const [wsConnectionState, setWsConnectionState] = useAtom(wsStatusAtom);

    const [checkComplete, setCheckComplete] = useState(null);
    const [client, setClient] = useState(null);
    const [input, setInput] = useState("");
    //상담사가 여러 채팅방을 오가며 동시에 관리해야 하는 시스템에서는 로컬 상태는 한계가 있음 - jotai 스타일로 바꿔 저장
    const [history, setHistory] = useState([]);
    const [last, setLast] = useState(null);

    const stompClientRef = useRef(null);

    // --- 메시지 업데이트 로직 함수화 ---
    const updateMessages = useCallback((messageData) => {
        const currentChatId = String(chatNo);

        setMessagesByChatId(prevMap => {
            const currentMessages = prevMap[currentChatId] || [];

            return {
                ...prevMap,
                [currentChatId]: [...currentMessages, messageData]
            };
        });
    }, [chatNo, setMessagesByChatId]);

    // 날짜 포맷 함수 (오전/오후 00:00 형식)
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleSend = useCallback(() => {
        console.log("handleSend 호출됨");
        if (client && wsConnectionState === 'connected' && input.trim() !== '') {

            const messageToSend = {
                messageSender: loginId,
                chatNo: chatNo,
                messageType: 'TALK',
                content: input.trim(),
            }

            // STOMP 클라이언트를 사용하여 메시지 발행 (Publish)
            client.publish({
                destination: `/app/message/${chatNo}`,
                body: JSON.stringify(messageToSend),
                headers: {
                    'content-type': 'application/json',
                    accessToken: `Bearer ${accessToken}`,
                    refreshToken: `Bearer ${refreshToken}`
                }
            });
            console.log("메시지 전송:", messageToSend);

            setInput(""); // 입력창 초기화
        }
    }, [client, wsConnectionState, input, loginId, chatNo, setInput, accessToken, refreshToken]);

    const checkParty = useCallback(async () => {
        try {
            const { data } = await axios.post("http://localhost:8080/chat/check", { chatNo: chatNo });

            if (data.result === false) {
                setCheckComplete(false);
            }
            else {
                setCheckComplete(true);
            }
        }
        catch (e) {
            console.error("채팅방 입장 검사 실패:", e);
            setCheckComplete(false);
        }
    }, [chatNo]);

    const loadHistory = useCallback(async () => {
        const  {data} =await axios.get(`/message/messageOrigin/${chatNo}`);
        setHistory(data.message);
        setLast(data.last);
        console.log("1");
    }, []);
    const loadMoreHistory = useCallback(async ()=>{
        const lastMessage = history.at(-1);
        console.log(lastMessage);
        const {data} = await axios.get(`/message/messageOrigin/${chatNo}/messageNo/${lastMessage.messageNo}`)
        setHistory(prev=>[...prev, ...data.message]);
        setLast(data.last);
        moveScrollBottom();
        console.log("2")
    }, [history]);

    const connectToServer = useCallback(() => {
        setWsConnectionState("connecting"); // 💡 연결 시도 시작 시 상태 변경

        // const socket = new SockJS(import.meta.env.VITE_WEBSOCKET_URL);
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                accessToken: `Bearer ${accessToken}`,
                refreshToken: `Bearer ${refreshToken}`
            },

            onConnect: () => {
                setWsConnectionState("connected"); // 연결 성공 시 상태 변경

                client.subscribe(`/public/message/${chatNo}`, (message) => {
                    const json = JSON.parse(message.body);
                    //updateMessages(json); // Jotai 상태 업데이트
                    setHistory(prev => [...prev, json]); // 로컬 history 업데이트
                });

                //토큰 갱신 / 메세지 업데이트 문법 수정 (상태 객체를 jotai로 변경했으니까)
                client.subscribe(`/private/message/${chatNo}/token/${loginId}`, (message) => {
                    const json = JSON.parse(message.body);
                    //토큰 갱신
                    setAccessToken(json.accessToken);
                    setRefreshToken(json.refreshToken);
                });
                client.subscribe(`/private/message/${chatNo}/warning/${loginId}`, (message) => {
                    //문자열 형태의 데이터를 JavaScript 객체로 변환하는 작업
                    //body : 서버가 클라이언트(React 앱)에게 보낸 메시지 내용의 핵심 부분
                    const json = JSON.parse(message.body);
                    //updateMessages(json); // 업데이트 함수 호출
                    setHistory(prev => [...prev, json]);
                });
                client.subscribe(`/public/message/${chatNo}/system`, (message) => {
                    const json = JSON.parse(message.body);
                    //updateMessages(json); // 업데이트 함수 호출
                    setHistory(prev => [...prev, json]);
                });
            },
            debug: (str) => console.log(str),

            //연결 오류 및 종료 시 
            onStompError: (frame) => {
                console.log('STOMP ERROR : ', frame);
                setWsConnectionState("disconnected");
            },

            onWebSocketClose: () => {
                //서버나 네트워크 문제로 연결이 끊어졌을 때
                setWsConnectionState("disconnected");
            },

        });
        client.activate();

        return client;
    }, [loginId, accessToken, refreshToken, setWsConnectionState, chatNo]);

    const disconnectFromServer = useCallback((client) => {
        if (client) {
            client.deactivate();
        }
    }, []);

    const currentMessages = messagesByChatId[chatNo] || [];

    const connectionMessage = useCallback(() => {
        switch (wsConnectionState) {
            case 'connecting':
                return "상담사 연결 중... 잠시만 기다려주세요. (Connecting)";
            case 'disconnected':
                return "연결이 끊어졌습니다. (Disconnected)";
            case 'connected':
            default:
                return null;
        }
    }, [wsConnectionState]);

    //특정 메세지의 시간이 출력되어야 하는지 판정하는 함수
    const isTimeVisible = useCallback((cur, next)=>{
        if(!next) return true;
        if(cur.messageSender !== next.messageSender) return true;
        if(formatTime(cur.time) !== formatTime(next.time)) return true;
        return false;
    }, []);

    //특정 메세지의 아이디와 등급이 출력되어야 하는지 판정하는 함수
    const isSenderVisible = useCallback((cur, prev)=>{
        if(!prev) return true;
        if(cur.messageSender !== prev.messageSender) return true;
        return false;
    }, []);

    useEffect(() => {
        checkParty();
    }, [checkParty, chatNo]);// checkParty의 최신상태 불러오기

    useEffect(() => {
        if (checkComplete === true && chatNo) {
            const client = connectToServer();
            setClient(client);
            loadHistory();

        }
        return () => {
            if (client) {
            disconnectFromServer(client);
            setClient(null);
        }
        };
        // else {
        //     disconnectFromServer(client);
        //     setClient(null);
        // }
    }, [checkComplete, chatNo]);

    const messageWrapper = useRef(null);
    const moveScrollTop = useCallback(()=>{
        if(messageWrapper.current) {//연결이 되어 있다면
            const {scrollHeight, clientHeight} = messageWrapper.current;
            const height = scrollHeight - clientHeight;
            messageWrapper.current.scrollTop = -height;//맨 위로 고정(column-reverse)
        }
    }, []);
    const moveScrollBottom = useCallback(()=>{
        if(messageWrapper.current) {//연결이 되어 있다면
            const {scrollHeight, clientHeight} = messageWrapper.current;
            const height = scrollHeight - clientHeight;
            messageWrapper.current.scrollTop = height;
        }
    }, []);

    return (
        <>
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} role="dialog">
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px', margin: 'auto' }}>
                    <div className="modal-content">
                        {/* 헤더 부분 */}
                        <div className="modal-header bg-primary text-white p-3">
                            <h5 className="modal-title fs-5">1:1 고객지원 채팅</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => { disconnectFromServer(client); onChatClose(); }} />
                        </div>

                        {/* 채팅 본문 */}
                        <div className="modal-body p-0" style={{ height: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} ref={messageWrapper}>
                            
                            {/* 1. 연결 상태 알림 */}
                            {wsConnectionState !== 'connected' && (
                                <div className={`alert ${wsConnectionState === 'disconnected' ? 'alert-danger' : 'alert-warning'} m-2 p-2 text-center small`}>
                                    {connectionMessage()}
                                    {wsConnectionState === 'connecting' && <div className="spinner-border spinner-border-sm ms-2" role="status"></div>}
                                </div>
                            )}

                            <div className="p-3 flex-grow-1">
                                {/* 2. 상담사 대기 문구 (상담사가 보낸 TALK 메시지가 없을 때만 표시) */}
                                {history.filter(m => (m.messageType === 'TALK') && (m.messageSender !== loginId)).length === 0 && (
                                    <div className="alert alert-light text-center small mb-3 border">
                                        상담사가 입장 전입니다. 메시지를 남겨주시면 곧 연결해 드리겠습니다.
                                    </div>
                                )}

                                {/* 3. 통합 메시지 출력 */}
                                {history.map((m, index) => {
                                    // 내 메시지인지 확인 (실시간 sender 또는 DB messageSender)
                                    const isMyMsg = (m.messageSender === loginId);
                                    // const senderName = m.sender || m.messageSender;
                                    // const content = m.text || m.messageContent; // text 필드와 messageContent 필드 모두 대응
                                    const senderName = m.messageSender;
                                    const content = m.messageContent;

                                    // 일반 채팅 (TALK)
                                    if (m.messageType === "TALK") {
                                        return (
                                            <div key={index} className={`d-flex mb-3 ${isMyMsg ? 'justify-content-end' : 'justify-content-start'}`}>
                                                <div className={`p-2 rounded ${isMyMsg ? 'bg-info text-white' : 'bg-light border'}`} style={{ maxWidth: '80%' }}>
                                                    {isSenderVisible(m, history[index - 1]) && (
                                                        <small className="fw-bold d-block mb-1">{senderName}</small>
                                                    )}
                                                    <div style={{ wordBreak: 'break-all' }}>{content}</div>
                                                    <small className="opacity-75" style={{ fontSize: '10px' }}>
                                                        {formatTime(m.time || m.messageTime)}
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // 시스템/경고 메시지
                                    if (m.messageType === "warning" || m.messageType === "system") {
                                        return (
                                            <div className="text-center my-2" key={index}>
                                                <span className="badge bg-secondary opacity-50 small">{content}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>

                        {/* 입력창 및 푸터 */}
                        <div className="modal-footer p-2 border-top">
                            {last === false && (
                                <button className="btn btn-sm btn-outline-secondary w-100 mb-2" onClick={loadMoreHistory}>이전 메시지 더 보기</button>
                            )}
                            <div className="input-group">
                                <input type="text" className="form-control" value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    // onKeyDown={(e) => {if (e.key === 'Enter') {handleSend();}}}
                                    placeholder="메시지를 입력하세요..."
                                    disabled={wsConnectionState !== 'connected'} />
                                <button className="btn btn-success" onClick={handleSend}
                                    disabled={wsConnectionState !== 'connected' || input.trim() === ''}>전송</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // return (
    //     <>
    //         <div className="modal fade show d-block" tabIndex="-1"
    //             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} role="dialog">
    //             <div className="modal-dialog modal-dialog-centered modal-sm"
    //                 style={{ maxWidth: '400px', margin: 'auto' }}>
    //                 <div className="modal-content">
    //                     <div className="modal-header bg-primary text-white p-3">
    //                         <h5 className="modal-title fs-5">1:1 고객지원 채팅</h5>
    //                         <button type="button" className="btn-close btn-close-white"
    //                             data-bs-dismiss="modal" aria-label="Close"
    //                             onClick={() => { disconnectFromServer(client); onChatClose(); }} />
    //                     </div>

    //                     <div className="modal-body p-0" style={{ height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
    //                         {(wsConnectionState !== 'connected') && (
    //                             <div className={`alert ${wsConnectionState === 'disconnected' ? 'alert-danger' : 'alert-warning'} m-2 p-2 text-center`}>
    //                                 {connectionMessage()}
    //                                 {wsConnectionState === 'connecting' && <div className="spinner-border spinner-border-sm ms-2" role="status"></div>}
    //                             </div>
    //                         )}

    //                         {/* <div className="p-3 flex-grow-1">
    //                             {currentMessages.length > 0 ? (
    //                                 currentMessages.map((msg, index) => (
    //                                     <div key={index} className={`d-flex mb-2 ${msg.sender === loginId ? 'justify-content-end' : 'justify-content-start'}`}>
    //                                         <div className={`p-2 rounded ${msg.sender === loginId ? 'bg-info text-white' : 'bg-light border'}`} style={{ maxWidth: '75%' }}>
    //                                             <small className="fw-bold d-block mb-1">{msg.sender}</small>
    //                                             {msg.text || msg.messageContent}
    //                                         </div>
    //                                     </div>
    //                                 ))
    //                             ) : (
    //                                 // 메시지가 없을 때
    //                                 <div className="text-center text-muted mt-5">
    //                                     <p>💬</p>
    //                                     <p>상담사 연결 대기 중입니다. 잠시만 기다려주세요.</p>
    //                                 </div>
    //                             )}
    //                         </div> */}
    //                         <div className="p-3 flex-grow-1">
    //                             {/* 1. 상담사가 없을 때만 보여주는 안내 문구 (상시 노출 혹은 조건부) */}
    //                             {history.filter(m => m.type === 'TALK' && m.sender !== loginId).length === 0 && (
    //                                 <div className="alert alert-light text-center small mb-3">
    //                                     상담사가 입장 전입니다. 메시지를 남겨주시면 곧 연결해 드리겠습니다.
    //                                 </div>
    //                             )}

    //                             {/* 2. 메시지 목록은 항상 렌더링하도록 수정 */}
    //                             {currentMessages.map((msg, index) => (
    //                                 <div key={index} className={`d-flex mb-2 ${msg.sender === loginId ? 'justify-content-end' : 'justify-content-start'}`}>
    //                                     <div className={`p-2 rounded ${msg.sender === loginId ? 'bg-info text-white' : 'bg-light border'}`} style={{ maxWidth: '75%' }}>
    //                                         <small className="fw-bold d-block mb-1">{msg.sender}</small>
    //                                         {/* 로그를 보니 필드명이 'text'입니다! */}
    //                                         {msg.text} 
    //                                     </div>
    //                                 </div>
    //                             ))}
    //                         </div>
    //                     </div>

    //                     <div className="modal-footer p-2">
    //                         <div className="input-group">
    //                             <input type="text" className="form-control" value={input}
    //                                 onChange={(e) => setInput(e.target.value)}
    //                                 placeholder={wsConnectionState === 'connected' ? "메시지를 입력하세요..." : "연결 상태 확인 중..."}
    //                                 disabled={wsConnectionState !== 'connected'} />
    //                             <button type="button" className="btn btn-success"
    //                                 onClick={handleSend}
    //                                 disabled={wsConnectionState !== 'connected' || input.trim() === ''}>
    //                                 전송
    //                             </button>
    //                         </div>
    //                     </div>

    //                     <div className="row mt-4">
    //                         <div className="col message-wrapper">
    //                             {history.map((m, index) => {//여기는 함수
    //                                 if (m.type === "TALK") {//일반 채팅일 경우 보여줄 화면
    //                                     return (
    //                                         <div className={`message-block ${loginId === m.messageSender ? 'my' : ''}`} key={index}>
    //                                             {isSenderVisible(m, history[index - 1]) === true && (
    //                                                 <h5 className="text-primary">({m.messageSender})</h5>
    //                                             )}

    //                                             {m.messageContent || m.text}

    //                                             {isTimeVisible(m, history[index + 1]) === true && (
    //                                                 <div className="time">{formatTime(m.messageTime)}</div>
    //                                             )}
    //                                         </div>
    //                                     );
    //                                 }
    //                                 if (m.messageType === "warning") {
    //                                     return (
    //                                         <div className="warning-block" key={m.messageNo}>{m.messageContent}</div>
    //                                     );
    //                                 }
    //                                 if (m.messageType === "system") {
    //                                     return (
    //                                         <div className="system-block" key={m.messageNo}>{m.messageContent}</div>
    //                                     );
    //                                 }
    //                             })}
    //                         </div>
    //                     </div>
                        
    //                     {last === false && (
    //                         <button className="btn btn-outline-secondary w-100 my-4" onClick={loadMoreHistory}>메세지 더 보기</button>
    //                     )}
    //                 </div>
    //             </div>
    //         </div>
    //     </>
    // )
}