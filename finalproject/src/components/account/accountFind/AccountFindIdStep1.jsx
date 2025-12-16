import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

const MINT_COLOR = "#78C2AD";

const AccountFindIdStep1 = ({ onNext }) => {
    //state 
    const [contactType, setContactType] = useState("phone"); // 'phone' | 'email' (인증 방식 선택)
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState(""); // 이메일 상태 추가

    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false); // 인증번호 발송 여부
    const [isVerified, setIsVerified] = useState(false); // 인증 완료 여부
    const [foundId, setFoundId] = useState(""); // 찾은 아이디

    const [certFeedback, setCertFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(180); // 180초(3분)
    const timerRef = useRef(null);

    // 탭 변경 시 상태 초기화
    const handleTypeChange = (type) => {
        setContactType(type);
        setPhone("");
        setEmail("");
        setCertNumber("");
        setIsSent(false);
        setIsVerified(false);
        setCertFeedback("");
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // 시간 포맷 변환 (180 -> 03:00)
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // 타이머 시작
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(180);
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

    // 1. 인증번호 발송 (아이디 찾기용 - 통합)
    const sendCert = useCallback(async () => {
        let url = "";
        let params = {};

        // (1) 휴대폰 인증일 때
        if (contactType === "phone") {
            if (!phone) return;
            const cleanPhone = phone.replace(/-/g, "");
            const regex = /^010[1-9][0-9]{7}$/;
            if (!regex.test(cleanPhone)) {
                alert("휴대폰 번호를 정확히 입력해주세요.");
                return;
            }
            url = "http://localhost:8080/cert/sendPhoneForFind";
            params = { phone: cleanPhone };
        }
        // (2) 이메일 인증일 때
        else {
            if (!email) return;
            const regex = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            if (!regex.test(email)) {
                alert("이메일 형식을 정확히 입력해주세요.");
                return;
            }
            url = "http://localhost:8080/cert/sendEmailForFind";
            params = { email: email };
        }

        try {
            // [수정] await 키워드 사용 및 url 변수 사용
            await axios.post(url, null, { params: params });

            setIsSent(true);
            setCertFeedback("");
            setCertNumber("");
            startTimer();
            alert("인증번호가 발송되었습니다");
        }
        catch (e) {
            console.error(e);
            if (e.response && e.response.status === 404) {
                alert("일치하는 회원 정보가 없습니다. 회원가입을 진행해주세요.");
            } else {
                alert("메시지 발송 실패 (잠시 후 다시 시도해주세요)");
            }
        }
    }, [contactType, phone, email, startTimer]);

    // 2. 인증번호 확인 및 아이디 찾기
    const checkCert = useCallback(async () => {
        if (timeLeft === 0) {
            setCertFeedback("입력 시간이 초과되었습니다. 재전송해주세요.");
            return;
        }

        try {
            // 인증 타겟 설정
            const certTarget = contactType === "phone" ? phone.replace(/-/g, "") : email;

            // [1] 인증번호 확인 (await 적용)
            const response = await axios.post("http://localhost:8080/cert/check", {
                certTarget: certTarget,
                certNumber: certNumber
            });

            if (response.data === true) {
                if (timerRef.current) clearInterval(timerRef.current);

                // [2] 실제 아이디 요청
                const idParams = {};
                if (contactType === 'phone') {
                    idParams.accountContact = certTarget;
                } else {
                    idParams.accountEmail = certTarget;
                }

                try {
                    // [수정] await 적용 및 API 호출
                    const idResponse = await axios.post("http://localhost:8080/account/findId", null, {
                        params: idParams
                    });

                    onNext(idResponse.data);
                    alert("본인인증이 완료되었습니다.");
                } catch (e) {
                    console.error(e);
                    alert("아이디 정보를 불러오는데 실패했습니다.");
                }
            }
            else {
                setCertFeedback("인증번호가 일치하지 않습니다");
            }
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        }
    }, [contactType, phone, email, certNumber, timeLeft, onNext]);


    //render
    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col">
                    <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                        <div className="card-body p-5">
                            <h3 className="fw-bold mb-4 text-center">아이디 찾기</h3>
                            <p className="text-muted mb-4 text-center">회원가입 시 등록한 정보로 인증해주세요.</p>

                            {/* 탭 선택 */}
                            <ul className="nav nav-pills nav-fill mb-4 border rounded p-1 bg-light">
                                {['phone', 'email'].map(type => (
                                    <li className="nav-item" key={type}>
                                        <button className={`nav-link fw-bold ${contactType === type ? 'active shadow-sm' : ''}`}
                                            onClick={() => handleTypeChange(type)}
                                            style={{
                                                backgroundColor: contactType === type ? 'white' : 'transparent',
                                                color: contactType === type ? MINT_COLOR : '#6c757d',
                                                border: 'none'
                                            }}>
                                            {type === 'phone' ? '휴대폰 인증' : '이메일 인증'}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* 입력 폼 */}
                            <div className="row mt-4 align-items-center">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    {contactType === 'phone' ? '휴대폰' : '이메일'} <span className="text-danger">*</span>
                                </label>
                                <div className="col-sm-9">
                                    <div className="d-flex gap-2">
                                        <input type="text" className="form-control"
                                            placeholder={contactType === 'phone' ? "- 없이 숫자만" : "example@email.com"}
                                            value={contactType === 'phone' ? phone : email}
                                            onChange={e => contactType === 'phone' ? setPhone(e.target.value) : setEmail(e.target.value)}
                                            disabled={isSent}
                                        />
                                        <button className="btn text-white text-nowrap" onClick={sendCert} disabled={isSent}
                                            style={{ backgroundColor: isSent ? '#6c757d' : MINT_COLOR, minWidth: "100px" }}>
                                            {isSent ? "발송됨" : "인증요청"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 인증번호 입력 */}
                            {isSent && (
                                <div className="row mt-4 align-items-start">
                                    <label className="col-sm-3 col-form-label fw-bold">인증번호 <span className="text-danger">*</span></label>
                                    <div className="col-sm-9">
                                        <div className="d-flex gap-2 position-relative">
                                            <input type="text" className={`form-control ${certFeedback ? 'is-invalid' : ''}`}
                                                placeholder="6자리 숫자" value={certNumber} onChange={e => { setCertNumber(e.target.value); setCertFeedback("") }}
                                                disabled={timeLeft === 0}
                                            />
                                            <button className="btn text-white text-nowrap" onClick={checkCert} disabled={timeLeft === 0}
                                                style={{ backgroundColor: timeLeft === 0 ? '#6c757d' : MINT_COLOR, minWidth: "100px" }}>
                                                확인
                                            </button>
                                        </div>
                                        {certFeedback && <div className="invalid-feedback d-block fw-bold">{certFeedback}</div>}
                                        <div className={`form-text fw-bold mt-2`} style={{ color: timeLeft === 0 ? 'red' : MINT_COLOR }}>
                                            {timeLeft === 0 ? "시간 초과" : `* 3분 이내 입력 (${formatTime(timeLeft)})`}
                                        </div>
                                        {timeLeft === 0 && (
                                            <button className="btn btn-sm mt-2 w-100 fw-bold bg-white" onClick={() => { setIsSent(false); setCertNumber(""); setCertFeedback(""); }}
                                                style={{ color: MINT_COLOR, borderColor: MINT_COLOR }}>
                                                인증번호 재전송 하기
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountFindIdStep1;