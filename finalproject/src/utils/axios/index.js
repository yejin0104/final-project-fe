import axios from "axios";
import { getDefaultStore } from "jotai";
import { accessTokenState, clearLoginState, refreshTokenState } from "../jotai";


// 외부에서 jotai를 이용하기 위한 도구 생성
const store = getDefaultStore();

// axios setting
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.timeout = 10000;

//axios interceptor
axios.interceptors.request.use((config)=>{//config는 axios 설정
    config.headers["Frontend-Url"] = window.location.href;
    return config;
})

axios.interceptors.response.use((response) => {
    const newAccessToken = response.headers["access-token"];
    if(newAccessToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        store.set(accessTokenState, newAccessToken);
    }
    return response;
}, async (error) => {
    try {
        //console.log(error.response.data?.status);
        //console.log(error.response.data?.message);
        const data = error.response?.data;
        if(data?.status === "401" && data?.message === "TOKEN_EXPIRED") {//토큰이 만료된 경우
            const refreshToken = store.get(refreshTokenState);//컴포넌트 외부에서 쓰는 코드
            const response = await axios.post("/account/refresh", { 
                refreshToken : `Bearer ${refreshToken}` 
            });
            //response안에는 반드시 다시 발급된 accessToken과 refreshToken이 있어야 함
            // - jotai 또는 axios에 대한 갱신작업
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
            store.set(accessTokenState, response.data.accessToken);
            store.set(refreshTokenState, response.data.refreshToken);

            const originalRequest = error.config;//원래 하려고 했던 요청 정보
            originalRequest.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
            return axios(originalRequest);//원래 하려던 요청을 다시 진행
        }
    }
    catch(ex) {//refresh token마저 사용이 불가능한 상황
        store.set(clearLoginState);//모든 jotai state 초기화(컴포넌트 외부에서만 가능한 코드)
        location.href = "/account/login";
    }
    return Promise.reject(error);//에러 발생 처리
});