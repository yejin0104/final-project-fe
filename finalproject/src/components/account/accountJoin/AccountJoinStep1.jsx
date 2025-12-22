import axios from "axios";
import { useCallback, useState, useEffect, useRef } from "react";

// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";

const AccountJoinStep1 = ({ onNext }) => {
    // state
    const [phone, setPhone] = useState("");
    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false); // 인증번호 발송 여부

    // 피드백 메시지 & 타이머 상태
    const [certFeedback, setCertFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(180); // 3분
    const timerRef = useRef(null);

    // 시간 포맷 (180 -> 03:00)
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // 타이머 시작 함수
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(180); // 3분으로 리셋
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // 컴포넌트 해제 시 타이머 정리
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // 1. 인증번호 발송 (및 재발송)
    const sendCert = useCallback(async () => {
        if (!phone) return;
        const cleanPhone = phone.replace(/-/g, "");
        const regex = /^010[1-9][0-9]{7}$/;

        if (!regex.test(cleanPhone)) {
            alert("휴대폰 번호를 정확히 입력해주세요.");
            return;
        }

        // 재발송일 경우 확인 메시지 (선택 사항)
        if (isSent) {
            if(!window.confirm("인증번호를 재전송 하시겠습니까?")) return;
        }

        try {
            await axios.post("http://localhost:8080/cert/sendPhone", null, {
                params: { phone: cleanPhone }
            });

            // 상태 업데이트 (재발송 시 초기화 로직 포함)
            setIsSent(true);
            setCertFeedback(""); // 피드백 초기화
            setCertNumber("");   // 입력한 인증번호 초기화
            startTimer();        // 타이머 재시작
            
            alert(isSent ? "인증번호가 재전송되었습니다." : "인증번호가 발송되었습니다.");

        } catch (e) {
            if (e.response && e.response.status === 409) {
                alert("이미 가입된 번호입니다.\n로그인 페이지로 이동하거나 아이디 찾기를 이용해주세요.");
            } else {
                console.error(e);
                alert("메시지 발송 실패 (서버 연결 확인 필요)");
                // 테스트용 로직 (실제 사용 시 제거)
                setIsSent(true);
                setCertNumber("");
                startTimer();
            }
        }
    }, [phone, startTimer, isSent]);

    // 2. 인증번호 확인
    const checkCert = useCallback(async () => {
        if (timeLeft === 0) {
            setCertFeedback("입력 시간이 초과되었습니다. 재전송해주세요.");
            return;
        }
        if (!certNumber) {
            setCertFeedback("인증번호를 입력해주세요.");
            return;
        }

        try {
            const cleanPhone = phone.replace(/-/g, "");
            const response = await axios.post("http://localhost:8080/cert/check", {
                certTarget: cleanPhone,
                certNumber: certNumber
            });

            if (response.data === true) {
                setCertFeedback("");
                if (timerRef.current) clearInterval(timerRef.current);
                alert("본인인증이 완료되었습니다.");
                onNext(cleanPhone); // 다음 단계 이동
            } else {
                setCertFeedback("인증번호가 일치하지 않거나 만료되었습니다.");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        }
    }, [phone, certNumber, onNext, timeLeft]);

    const handleCertInput = (e) => {
        setCertNumber(e.target.value);
        if (certFeedback) setCertFeedback("");
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <div className="card border-0 shadow-lg" style={{ width: "100%", maxWidth: "480px", borderRadius: "20px", overflow: "hidden" }}>
                
                {/* 상단 디자인 라인 */}
                <div style={{ height: "6px", backgroundColor: MINT_COLOR }}></div>

                <div className="card-body p-5">
                    <div className="text-center mb-5">
                        <h3 className="fw-bold mb-2" style={{ color: "#333", letterSpacing: "-0.5px" }}>본인 인증</h3>
                        <p className="text-muted small">
                            안전한 서비스 이용을 위해<br/>휴대폰 인증을 진행해주세요.
                        </p>
                    </div>

                    {/* 1. 휴대폰 번호 입력 폼 */}
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-secondary ms-1">휴대폰 번호</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control form-control-lg bg-light border-0"
                                placeholder="01012345678"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                // 재전송이 가능해야 하므로 번호 수정은 막되, 버튼은 활성화
                                // 번호 수정이 필요하면 별도 버튼을 두거나 isSent를 false로 돌리는 로직 필요
                                readOnly={isSent} 
                                style={{ fontSize: "1rem", borderRadius: "10px 0 0 10px" }}
                            />
                            <button
                                type="button"
                                className="btn fw-bold ms-2"
                                style={{
                                    // 발송 후에는 흰색 배경에 민트 테두리로 변경 (재전송 느낌)
                                    backgroundColor: isSent ? 'white' : MINT_COLOR,
                                    color: isSent ? MINT_COLOR : 'white',
                                    border: isSent ? `1px solid ${MINT_COLOR}` : 'none',
                                    minWidth: "100px",
                                    borderRadius: "0 10px 10px 0",
                                    transition: "0.3s"
                                }}
                                onClick={sendCert}
                            >
                                {isSent ? "재전송" : "인증요청"}
                            </button>
                        </div>
                        {isSent && (
                             <div className="form-text ms-1 text-muted" style={{fontSize: "0.8rem"}}>
                                번호를 잘못 입력하셨나요? <span role="button" onClick={()=>{setIsSent(false); setPhone("");}} style={{textDecoration:'underline', cursor:'pointer'}}>다시 입력하기</span>
                             </div>
                        )}
                    </div>

                    {/* 2. 인증번호 입력 폼 (발송 성공 시 노출) */}
                    {isSent && (
                        <div className="mb-2 fade-in-up"> 
                            <label className="form-label fw-bold small text-secondary ms-1">인증번호</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className={`form-control form-control-lg bg-light border-0 ${certFeedback ? 'is-invalid' : ''}`}
                                    placeholder="인증번호 6자리"
                                    value={certNumber}
                                    onChange={handleCertInput}
                                    style={{ fontSize: "1rem", borderRadius: "10px 0 0 10px" }}
                                />
                                <button
                                    type="button"
                                    className="btn fw-bold text-white ms-2"
                                    style={{
                                        backgroundColor: timeLeft === 0 ? '#6c757d' : MINT_COLOR,
                                        minWidth: "100px",
                                        border: "none",
                                        borderRadius: "0 10px 10px 0"
                                    }}
                                    onClick={checkCert}
                                >
                                    확인
                                </button>
                            </div>

                            {/* 메시지 및 타이머 */}
                            <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                                <div>
                                    {certFeedback ? (
                                        <small className="text-danger fw-bold">{certFeedback}</small>
                                    ) : timeLeft === 0 ? (
                                        <small className="text-danger fw-bold">시간이 초과되었습니다.</small>
                                    ) : (
                                        <small className="text-success fw-bold">
                                            인증번호가 발송되었습니다.
                                        </small>
                                    )}
                                </div>
                                {timeLeft > 0 && (
                                    <span className="badge bg-light text-dark border">
                                        {formatTime(timeLeft)}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountJoinStep1;