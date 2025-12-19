import { atom } from "jotai";
import {atomWithStorage} from "jotai/utils";

//회원의 아이디 상태
export const loginIdState = atomWithStorage("loginId", "", sessionStorage);//joati + persist

//회원의 등급 상태
export const loginLevelState = atomWithStorage("loginLevel", "", sessionStorage);

//회원의 게스트 키
export const guestKeyState = atomWithStorage("guestKey", "", sessionStorage);

//accessToken
export const accessTokenState = atomWithStorage("accessToken", "", sessionStorage);//브라우저를 닫으면 로그인이 풀림

//refreshToken
export const refreshTokenState = atomWithStorage("refreshToken", "", sessionStorage);

export const messageHistoryState = atomWithStorage("messageHistory", [], sessionStorage);

//회원인지 판정
export const loginState = atom(get => {
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length > 0 && loginLevel?.length > 0;
});

//관리자인지 판정
export const adminState = atom(get => {
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length > 0 && loginLevel === "관리자";
})

//비회원인지 판정
export const guestState = atom(get => {
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId === null && loginLevel === "비회원";
})

//상담사인지 판정 
export const counselorState = atom(get=>{
    const loginId = get(loginIdState);
    const loginLevel = get(loginLevelState);
    return loginId?.length > 0 && loginLevel === "상담사";
});

export const clearLoginState = atom(null, (get,set)=>{
    set(loginIdState,"");
    set(loginLevelState,"");
    set(accessTokenState,"");
    set(refreshTokenState,"");

    set(loginCompleteState, false);
}); 

export const clearMessageState = atom(null, (get, set)=>{
    set(messageHistoryState, "");
})

// 로그인 판정이 완료되었는지 확인하기 위한 데이터
export const loginCompleteState = atom(false);

// 현재 접속한 방 ID (고객은 1개, 상담사는 여러 방 중 현재 포커스된 방)
export const currentChatIdState = atom("");

// 채팅방 ID를 키로 하여 메시지 리스트를 저장하는 맵 (Map) 형태의 상태
// 예: { 'room123': [{ sender: 'customer', text: '안녕하세요' }, ...], ... }
export const messagesByChatIdState = atom({});

// WebSocket 연결 상태 (UI 표시용)
// 예: 'connected', 'connecting', 'disconnected'
export const wsConnectionState = atom("disconnected");

// DevTools에서 확인하기 위한 이름 설정
loginIdState.debugLabel = "loginId";
loginLevelState.debugLabel = "loginLevel";
loginState.debugLabel = "loginState";
accessTokenState.debugLabel = "accessToken";
adminState.debugLabel = "adminState";
loginCompleteState.debugLabel = "loginCompleteState";
refreshTokenState.debugLabel = "refreshToken";

counselorState.debugLabel = "counselorState";
currentChatIdState.debugLabel = "currentChatIdState";
messagesByChatIdState.debugLabel = "messagesByChatIdState";
wsConnectionState.debugLabel = "wsConnectionState";
guestKeyState.debugLabel = "guestKeyState";