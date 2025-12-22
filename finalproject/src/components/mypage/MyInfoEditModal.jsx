import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; // [추가] 안전장치
import { X } from "lucide-react";
import axios from "axios";

const MINT_COLOR = "#78C2AD";

const MyInfoEditModal = ({ isOpen, onClose, type, label, currentValue, onSuccess }) => {
    
    // [핵심 해결] 부모에서 props로 안 넘어올 경우를 대비해 Context에서 직접 가져옴
    const { myInfo } = useOutletContext();
    const accountId = myInfo?.accountId; 

    // [공통] 입력값 State
    const [newValue, setNewValue] = useState("");
    
    // [비밀번호 전용] State
    const [pwData, setPwData] = useState({ currentPw: "", newPw: "", confirmPw: "" });

    // [휴대폰 인증 전용] State
    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    // [닉네임 전용] State
    const [isNickChecked, setIsNickChecked] = useState(true);

    // 오늘 날짜 (생년월일 제한용)
    const todayStr = new Date().toISOString().split("T")[0];

    // 모달 열릴 때 초기값 세팅
    useEffect(() => {
        if (isOpen) {
            if (type === 'password') {
                setPwData({ currentPw: "", newPw: "", confirmPw: "" });
            } else {
                setNewValue(currentValue || "");
            }
            
            // 상태 초기화
            setIsSent(false);
            setIsVerified(false);
            setIsNickChecked(true); 
            setTimeLeft(0);
            if(timerRef.current) clearInterval(timerRef.current);
        }
    }, [isOpen, type, currentValue]);

    // 값 변경 핸들러
    const handleChange = (e) => {
        setNewValue(e.target.value);
        if (type === 'nickname') setIsNickChecked(false);
    };

    // -----------------------------------------------------------
    // [기능 1] 닉네임 중복 검사
    // -----------------------------------------------------------
    const checkNickname = async () => {
        if (!newValue) return;
        if (newValue === currentValue) {
            alert("현재 사용 중인 닉네임입니다.");
            setIsNickChecked(true);
            return;
        }
        try {
            const resp = await axios.get(`/account/accountNickname/${newValue}`);
            if (resp.data) {
                alert('사용 가능한 닉네임입니다.');
                setIsNickChecked(true);
            } else {
                alert('이미 사용 중인 닉네임입니다.');
                setIsNickChecked(false);
            }
        } catch (e) { 
            console.error(e);
            alert('중복 확인 중 오류가 발생했습니다.');
        }
    };

    // -----------------------------------------------------------
    // [기능 2] 휴대폰 인증 발송 & 확인
    // -----------------------------------------------------------
    const startTimer = () => {
        if(timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const sendCert = async () => {
        if (!newValue) return alert("휴대폰 번호를 입력해주세요.");
        
        // [추가] 현재 내 번호와 같은지 체크
        if (newValue === currentValue) {
            return alert("현재 등록된 휴대폰 번호와 동일합니다.");
        }

        try {
            await axios.post("/cert/sendPhone", null, { params: { phone: newValue } });
            setIsSent(true); 
            setTimeLeft(180); 
            startTimer();
            alert('인증번호가 발송되었습니다.');
        } catch(e) { 
            console.error(e);
            // [추가] 중복 번호 체크 (서버에서 409 Conflict 리턴 시)
            if(e.response && e.response.status === 409) {
                alert("이미 다른 계정에서 사용 중인 휴대폰 번호입니다.");
            } else {
                alert('인증번호 발송 실패'); 
            }
        }
    };

    const confirmCert = async () => {
        if (!certNumber) return alert("인증번호를 입력해주세요.");
        try {
            const resp = await axios.post("/cert/check", { certTarget: newValue, certNumber });
            if(resp.data) {
                setIsVerified(true); 
                clearInterval(timerRef.current);
                alert('인증되었습니다.');
            } else { 
                alert('인증번호가 일치하지 않습니다.'); 
            }
        } catch(e) { 
            console.error(e);
            alert('인증 확인 중 오류가 발생했습니다.');
        }
    };

    // -----------------------------------------------------------
    // [최종] 저장 (API 호출 분기 처리)
    // -----------------------------------------------------------
    const handleSave = async () => {
        let endpoint = "/account/edit";
        let payload = {};

        switch (type) {
            case "password":
                if (!pwData.currentPw || !pwData.newPw || !pwData.confirmPw) return alert("모든 항목을 입력해주세요.");
                if (pwData.newPw !== pwData.confirmPw) return alert("새 비밀번호가 일치하지 않습니다.");
                
                endpoint = "/account/changePw";
                // [확인] accountId가 여기서 사용됨. 콘솔로 확인 가능.
                console.log("비밀번호 변경 요청 ID:", accountId); 
                payload = { 
                    accountId: accountId, 
                    accountPw: pwData.newPw 
                }; 
                break;

            case "phone":
                if (!isVerified) return alert("휴대폰 인증을 완료해주세요.");
                endpoint = "/account/contact"; // 혹은 edit 통합 사용
                payload = { accountContact: newValue };
                break;
            
            case "nickname":
                if (!isNickChecked && newValue !== currentValue) return alert("닉네임 중복 확인이 필요합니다.");
                endpoint = "/account/edit"; // 혹은 edit 통합 사용
                payload = { accountNickname: newValue };
                break;
            
            case "email":
                endpoint = "/account/edit";
                payload = { accountEmail: newValue };
                break;
            
            case "gender":
                endpoint = "/account/edit";
                payload = { accountGender: newValue };
                break;
            
            case "birth":
                endpoint = "/account/edit";
                payload = { accountBirth: newValue };
                break;
            
            default: return;
        }

        try {
            // PATCH 요청 전송
            await axios.patch(endpoint, payload);
            
            alert('정보가 수정되었습니다.');
            
            if (type === 'password') {
                onSuccess({}); 
            } else {
                const key = type === 'phone' ? 'accountContact' : type === 'birth' ? 'accountBirth' : type === 'gender' ? 'accountGender' : `account${type.charAt(0).toUpperCase() + type.slice(1)}`;
                onSuccess({ [key]: newValue });
            }
        } catch (e) {
            console.error(e);
            if (e.response && e.response.status === 404) {
                alert("회원 정보를 찾을 수 없습니다. (ID 오류)");
            } else if (e.response && e.response.status === 409) {
                 alert("이미 사용 중인 정보입니다.");
            } else {
                alert('수정 실패: 입력 정보를 확인해주세요.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            
            <div className="bg-white rounded-4 shadow-lg overflow-hidden animate-fade-in-up" style={{ width: "400px", maxWidth: "90%" }}>
                {/* 헤더 */}
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{backgroundColor: MINT_COLOR, color: 'white'}}>
                    <h5 className="m-0 fw-bold">{label} 변경</h5>
                    <button onClick={onClose} className="btn p-0 text-white border-0 bg-transparent">
                        <X size={24} />
                    </button>
                </div>

                {/* 바디 */}
                <div className="p-4">
                    {/* 1. 비밀번호 변경 */}
                    {type === 'password' ? (
                        <div className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label small text-muted">현재 비밀번호</label>
                                <input type="password" className="form-control"
                                    value={pwData.currentPw} onChange={e => setPwData({...pwData, currentPw: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label small text-muted">새 비밀번호</label>
                                <input type="password" className="form-control"
                                    value={pwData.newPw} onChange={e => setPwData({...pwData, newPw: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label small text-muted">새 비밀번호 확인</label>
                                <input type="password" className={`form-control ${pwData.newPw && pwData.confirmPw && pwData.newPw !== pwData.confirmPw ? 'is-invalid' : ''}`} 
                                    value={pwData.confirmPw} onChange={e => setPwData({...pwData, confirmPw: e.target.value})} />
                                {pwData.newPw && pwData.confirmPw && pwData.newPw !== pwData.confirmPw && <div className="text-danger small mt-1">비밀번호가 일치하지 않습니다.</div>}
                            </div>
                        </div>
                    ) : type === 'phone' ? (
                        /* 2. 휴대폰 인증 */
                        <div className="d-flex flex-column gap-3">
                            <label className="form-label small text-muted">새 휴대폰 번호</label>
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="- 없이 입력" value={newValue} onChange={handleChange} readOnly={isSent}/>
                                <button className="btn btn-outline-secondary ms-2" onClick={sendCert} disabled={isSent}>
                                    {isSent ? "재전송" : "인증요청"}
                                </button>
                            </div>
                            {isSent && (
                                <div>
                                    <div className="input-group mb-1">
                                        <input type="text" className="form-control" placeholder="인증번호" value={certNumber} onChange={e=>setCertNumber(e.target.value)} disabled={isVerified}/>
                                        <button className="btn btn-outline-secondary" onClick={confirmCert} disabled={isVerified}>확인</button>
                                    </div>
                                    {!isVerified && <small className="text-danger">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</small>}
                                </div>
                            )}
                            {isVerified && <div className="text-success small fw-bold">인증이 완료되었습니다.</div>}
                        </div>
                    ) : type === 'nickname' ? (
                        /* 3. 닉네임 중복검사 */
                        <div className="d-flex flex-column gap-2">
                             <label className="form-label small text-muted">새 닉네임</label>
                            <div className="input-group">
                                <input type="text" className="form-control" value={newValue} onChange={handleChange} />
                                <button className="btn btn-outline-secondary ms-2" onClick={checkNickname}>중복확인</button>
                            </div>
                            {!isNickChecked && <small className="text-muted">중복 확인을 해주세요.</small>}
                        </div>
                    ) : type === 'gender' ? (
                        /* 4. 성별 선택 (Select) */
                        <div>
                            <label className="form-label small text-muted">성별</label>
                            <select className="form-select" value={newValue} onChange={handleChange}>
                                <option value="">선택</option>
                                <option value="남">남성</option>
                                <option value="여">여성</option>
                            </select>
                        </div>
                    ) : type === 'birth' ? (
                        /* 5. 생년월일 (DatePicker) */
                        <div>
                            <label className="form-label small text-muted">생년월일</label>
                            {/* [수정] 미래 날짜 선택 불가 (max 속성 추가) */}
                            <input type="date" className="form-control" value={newValue} onChange={handleChange} max={todayStr} />
                        </div>
                    ) : (
                        /* 6. 기타 (이메일 등) */
                        <div>
                            <label className="form-label small text-muted">{label}</label>
                            <input type="text" className="form-control" value={newValue} onChange={handleChange} />
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="p-3 border-top bg-light d-flex justify-content-end gap-2">
                    <button className="btn btn-light fw-bold text-secondary border" onClick={onClose}>취소</button>
                    <button className="btn fw-bold text-white" style={{ backgroundColor: MINT_COLOR, border: "none" }} onClick={handleSave}>
                        변경하기
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default MyInfoEditModal;