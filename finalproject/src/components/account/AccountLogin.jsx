import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom";
import { accessTokenState, loginIdState, loginLevelState, refreshTokenState } from "../../utils/jotai";
import TermsModal from "./accountJoin/TermsModal";
// 경로를 본인 프로젝트 구조에 맞게 수정하세요

export default function AccountLogin() {
    const navigate = useNavigate();

    // 1. Jotai State (전역 상태)
    const [loginId, setLoginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);

    // 2. 이미 로그인 상태라면 메인으로 리다이렉트
    useEffect(() => {
        if (loginId) {
            navigate("/", { replace: true });
        }
    }, [loginId, navigate]);

    // 3. 로컬 상태 (입력값 & 에러 상태)
    const [account, setAccount] = useState({ accountId: "", accountPw: "" });
    const [isLoginFail, setIsLoginFail] = useState(false); // 로그인 실패 여부

    // 입력 핸들러
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setAccount(prev => ({ ...prev, [name]: value }));
        if (isLoginFail) setIsLoginFail(false); // 입력 시작하면 에러 메시지/빨간테두리 숨김
    }, [isLoginFail]);

    // 로그인 요청
    const sendLogin = useCallback(async () => {
        if (!account.accountId || !account.accountPw) return;

        try {
            // 백엔드 요청
            const { data } = await axios.post("http://localhost:8080/account/login", account);
            
            // 상태 업데이트
            setLoginId(data.loginId);
            setLoginLevel(data.loginLevel);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);

            // Axios 헤더 설정
            axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;

            
            if (data.loginLevel === '상담사') {
                navigate("/counselor/dashboard");
            }
            else {
                navigate("/");
            }
            // 메인으로 이동
            //navigate("/");
        } catch (err) {
            setIsLoginFail(true); // 실패 표시
        }
    }, [account, setLoginId, setLoginLevel, setAccessToken, setRefreshToken, navigate]);

    // 엔터키 처리
    const handleEnter = (e) => {
        if (e.key === 'Enter') sendLogin();
    };

    // 로그인 상태면 화면 렌더링 방지
    if (loginId) return null;

    return (
        <>
            {/* Minty 테마 커스텀 스타일 (이 페이지 전용) */}
            <style>{`
                :root {
                    --minty-primary: #78C2AD; /* Minty 메인 컬러 */
                    --minty-hover: #5a9e8a;   /* 호버 시 색상 */
                }
                /* 텍스트 색상 */
                .text-minty { color: var(--minty-primary) !important; }
                
                /* 버튼 스타일 커스텀 */
                .btn-minty {
                    background-color: var(--minty-primary);
                    border-color: var(--minty-primary);
                    color: white;
                    transition: all 0.3s ease;
                }
                .btn-minty:hover {
                    background-color: var(--minty-hover);
                    border-color: var(--minty-hover);
                    color: white;
                    transform: translateY(-2px); /* 살짝 떠오르는 효과 */
                    box-shadow: 0 4px 8px rgba(120, 194, 173, 0.3);
                }

                /* 입력창 포커스 효과 (민트색 테두리) */
                .form-control:focus {
                    border-color: var(--minty-primary);
                    box-shadow: 0 0 0 0.25rem rgba(120, 194, 173, 0.25);
                }
                
                /* 실패 시 빨간 테두리에서도 아이콘 제거 (겹침 방지) */
                .form-control.is-invalid {
                    background-image: none !important;
                }

                /* 카드 스타일 */
                .card-login {
                    border: none;
                    border-radius: 1rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); /* 부드러운 그림자 */
                }

                /* 하단 링크 스타일 */
                .link-minty { color: #888; transition: color 0.2s; }
                .link-minty:hover { color: var(--minty-primary); text-decoration: underline !important; }
            `}</style>

            <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <div className="col-md-6 col-lg-5">
                    
                    {/* 카드형 레이아웃 시작 */}
                    <div className="card card-login bg-white">
                        <div className="card-body p-5">
                            
                            {/* 헤더 */}
                            <div className="text-center mb-5">
                                <h2 className="fw-bold text-minty mb-2">로그인</h2>
                                <p className="text-muted small">서비스 이용을 위해 로그인해주세요.</p>
                            </div>

                            {/* 아이디 입력 (Floating Label) */}
                            <div className="form-floating mb-3">
                                <input 
                                    type="text" 
                                    className={`form-control ${isLoginFail ? 'is-invalid' : ''}`} 
                                    id="floatingInput" 
                                    name="accountId"
                                    placeholder="아이디"
                                    value={account.accountId}
                                    onChange={changeStrValue}
                                />
                                <label htmlFor="floatingInput">아이디</label>
                            </div>

                            {/* 비밀번호 입력 (Floating Label) */}
                            <div className="form-floating mb-4">
                                <input 
                                    type="password" 
                                    className={`form-control ${isLoginFail ? 'is-invalid' : ''}`} 
                                    id="floatingPassword" 
                                    name="accountPw"
                                    placeholder="비밀번호"
                                    value={account.accountPw}
                                    onChange={changeStrValue}
                                    onKeyDown={handleEnter}
                                />
                                <label htmlFor="floatingPassword">비밀번호</label>
                            </div>

                            {/* 에러 메시지 (로그인 실패 시 등장) */}
                            {isLoginFail && (
                                <div className="alert alert-danger d-flex align-items-center p-2 mb-4 rounded-3" role="alert" style={{fontSize: '0.9rem'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle-fill me-2" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                                    </svg>
                                    <div>아이디 또는 비밀번호가 일치하지 않습니다.</div>
                                </div>
                            )}

                            {/* 로그인 버튼 */}
                            <div className="d-grid gap-2">
                                <button 
                                    type="button" 
                                    className="btn btn-minty btn-lg fw-bold"
                                    onClick={sendLogin}
                                >
                                    로그인
                                </button>
                            </div>

                            {/* 하단 링크 */}
                            <div className="d-flex justify-content-center mt-4 gap-3 text-muted" style={{fontSize: '0.85rem'}}>
                                <Link to="/account/findId" className="text-decoration-none link-minty">
                                    아이디 찾기
                                </Link>
                                <span style={{opacity: 0.3}}>|</span>
                                <Link to="/account/findPw" className="text-decoration-none link-minty">
                                    비밀번호 찾기
                                </Link>
                                <span style={{opacity: 0.3}}>|</span>
                                <div className="text-decoration-none text-minty fw-bold">
                                    <TermsModal/>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* 카드 끝 */}

                </div>
            </div>
        </>
    );
}