import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";

const AccountFindPwStep1 = ({ onNext }) => {
    // 이동도구
    const navigate = useNavigate();

    //state
    const [accountId, setAccountId] = useState("");
    const [contactType, setContactType] = useState("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isChecked, setIsChecked] = useState(false);//존재하는 아이디인지만 확인

    const [certFeedback, setCertFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(180);
    const timerRef = useRef(null);

    // 탭 변경
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

    // 시간 포맷
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    // 타이머
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

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // 아이디 확인
    const checkId = useCallback(async (e) => {
        if (!accountId) {
            alert("아이디를 입력해주세요");
            return;
        }
        try {
            const { data } = await axios.get(`/account/accountId/${accountId}`)
            if (data === false) {//아이디가 존재
                setIsChecked(true);
            }
            else {
                setIsChecked(false);
            }
        }
        catch (e) {
            console.error("아이디 확인 중 오류:", e);
            alert("아이디 확인 중 오류가 발생했습니다.");
            setIsChecked(false);
        }

    }, [accountId]);

    // 1. 인증번호 발송
    const sendCert = useCallback(async () => {
        if (!accountId) {
            alert("아이디를 입력해주세요");
            return;
        }

        let url = "";
        let params = { accountId: accountId };

        if (contactType === "phone") {//휴대폰 인증
            if (!phone) return;
            const cleanPhone = phone.replace(/-/g, "");
            const regex = /^010[1-9][0-9]{7}$/;
            if (!regex.test(cleanPhone)) {
                alert("휴대폰 번호를 정확히 입력해주세요.");
                return;
            }
            url = "http://localhost:8080/cert/sendPhoneForFindPw";
            params.phone = cleanPhone;
        }
        else {
            if (!email) return;
            const regex = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            if (!regex.test(email)) {
                alert("이메일 형식을 정확히 입력해주세요.");
                return;
            }
            url = "http://localhost:8080/cert/sendEmailForFindPw";
            params.email = email;
        }
        try {
            await axios.post(url, null, { params: params });
            setIsSent(true);
            setCertFeedback("");
            setCertNumber("");
            startTimer();
            alert("인증번호가 발송되었습니다.");
        }
        catch (e) {
            console.error(e);
            alert("입력하신 아이디와 연락처 정보가 일치하는 회원을 찾을 수 없습니다.");
            setIsSent(false); // 실패 시 발송 상태 취소
        }
    }, [accountId, contactType, phone, email, startTimer]);

    // 2. 인증번호 확인 및 아이디 조회
    const checkCert = useCallback(async () => {
        if (timeLeft === 0) {
            setCertFeedback("입력 시간이 초과되었습니다. 재전송해주세요.");
            return;
        }

        try {
            const certTarget = contactType === "phone" ? phone.replace(/-/g, "") : email;

            // [1] 인증번호 확인 요청
            const response = await axios.post("http://localhost:8080/cert/check", {
                certTarget: certTarget,
                certNumber: certNumber
            });

            // 인증 성공 (response.data === true)
            if (response.data === true) {
                if (timerRef.current) clearInterval(timerRef.current);
                onNext(accountId);//다음 단계로 Id 넘겨줌
            } else {
                setCertFeedback("인증번호가 일치하지 않습니다");
            }
        } catch (e) {
            console.error(e);
            alert("인증 오류가 발생했습니다.");
        }
    }, [contactType, phone, email, certNumber, timeLeft, onNext, accountId]);


    // UI 렌더링
    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                <div className="card-body p-5">
                    <h3 className="fw-bold mb-4 text-center">비밀번호 찾기</h3>
                    <p className="text-muted mb-4 text-center">비밀번호를 재설정할 아이디를 입력해주세요.</p>

                    {/* 1. 아이디 입력 및 확인 버튼 (항상 보임) */}
                    <div className="row mb-4 align-items-center">
                        <label className="col-sm-3 col-form-label fw-bold">아이디 <span className="text-danger">*</span></label>
                        <div className="col-sm-9">
                            <div className="d-flex gap-2">
                                <input type="text" className="form-control"
                                    placeholder="아이디 입력"
                                    value={accountId}
                                    onChange={e => {
                                        setAccountId(e.target.value);
                                        setIsChecked(false); // 아이디 수정 시 확인 상태 초기화
                                    }}
                                    disabled={isChecked} // 확인 되면 수정 불가
                                />
                                <button
                                    type="button"
                                    className="btn text-white text-nowrap"
                                    onClick={checkId}
                                    disabled={isChecked}
                                    style={{
                                        backgroundColor: isChecked ? '#6c757d' : MINT_COLOR,
                                        minWidth: "100px"
                                    }}
                                >
                                    {isChecked ? "확인완료" : "다음"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. 아이디 확인이 완료(isChecked === true)된 경우에만 아래 내용 표시 */}
                    {isChecked && (
                        <>
                            <hr className="my-4" />
                            <p className="text-muted mb-4 text-center">등록된 정보로 본인인증을 진행해주세요.</p>

                            {/* 탭 선택 (이제 isChecked 안쪽에 위치함) */}
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

                            {/* 연락처 입력 */}
                            <div className="row align-items-center">
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

                            {/* 인증번호 입력창 (발송 성공 시 노출) */}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountFindPwStep1;

