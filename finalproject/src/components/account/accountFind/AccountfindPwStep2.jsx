import axios from "axios";
import { useCallback, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6"; // Asterisk, User 아이콘 제거
import { useNavigate } from "react-router-dom";

const MINT_COLOR = "#78C2AD";

const AccountfindPwStep2 = ({ accountId }) => {
    // 이동도구
    const navigate = useNavigate();
    
    const [account, setAccount] = useState({
        accountPw: "",
        accountPw2: ""
    })

    const [accountClass, setAccountClass] = useState({
        accountPw: "",
        accountPw2: ""
    })
    // 비밀번호 검사
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    //callback
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setAccount(prev => ({ ...prev, [name]: value }));

        // 입력창을 비웠을 때 상태 초기화
        if (value.length === 0) {
            setAccountClass(prev => ({ ...prev, [name]: "" }));
        }
    }, [account.accountPw, account.accountPw2]);

    const checkAccountPw = useCallback((e)=>{
        const regex = /^(?=.*?[A-Z]+)(?=.*?[a-z]+)(?=.*?[0-9]+)(?=.*?[!@#$]+)[A-Za-z0-9!@#$]{8,16}$/;
        const isValid1 = regex.test(account.accountPw);
        const isValid2 = (account.accountPw === account.accountPw2);

        setAccountClass(prev=>({
            ...prev,
            accountPw: account.accountPw.length > 0 ? (isValid1 ? "is-valid" : "is-invalid") : "",
            accountPw2: account.accountPw2.length > 0 ? (isValid2 && isValid1 ? "is-valid" : "is-invalid") : ""
        }));

    }, [account.accountPw, account.accountPw2]);

    // 비밀번호 변경 요청
    const changePw = useCallback(async () => {
        const regex = /^(?=.*?[A-Z]+)(?=.*?[a-z]+)(?=.*?[0-9]+)(?=.*?[!@#$]+)[A-Za-z0-9!@#$]{8,16}$/;
        if (!regex.test(account.accountPw)) {
            alert("비밀번호 형식이 올바르지 않습니다. (8~16자, 대문자/소문자/숫자/특수문자 포함)");
            return;
        }
        if (account.accountPw !== account.accountPw2) {
            alert("비밀번호 확인이 일치하지 않습니다.");
            return;
        }
        try {
            await axios.patch("/account/changePw", {
                accountId: accountId,
                accountPw: account.accountPw
            });
            alert("비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.");
            navigate("account/login");
        }
        catch (e) {
            console.error(e);
            alert("비밀번호 변경 중 오류가 발생했습니다.");
        }
    }, [accountId, account.accountPw, account.accountPw2]);

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                <div className="card-body p-5">
                    <h3 className="fw-bold mb-4 text-center">비밀번호 재설정</h3>

                    <div className="alert alert-success text-center fw-bold mb-4" style={{ backgroundColor: 'rgba(120, 194, 173, 0.2)', color: '#4a8a7a', border: 'none' }}>
                        본인 인증이 완료되었습니다.<br />새로운 비밀번호를 설정해주세요.
                    </div>

                    {/* 새 비밀번호 입력 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label fw-bold">
                            비밀번호 <span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-9">
                            <div className="position-relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control ${accountClass.accountPw}`}
                                    name="accountPw"
                                    value={account.accountPw}
                                    onChange={changeStrValue}
                                    onBlur={checkAccountPw}
                                    placeholder="영문/숫자/특수문자 포함 8~16자"
                                    style={{ paddingRight: "45px", backgroundImage : "none" }}
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                                    style={{ cursor: "pointer" }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {accountClass.accountPw === "is-valid" && (
                                <div className="valid-feedback d-block" style={{ color: MINT_COLOR, fontWeight: 'bold' }}>사용 가능한 비밀번호 형식입니다</div>
                            )}
                            {accountClass.accountPw === "is-invalid" && (
                                <div className="invalid-feedback d-block">8~16자, 대문자/소문자/숫자/특수문자(!@#$) 필수</div>
                            )}
                        </div>
                    </div>

                    {/* 새 비밀번호 확인 */}
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label fw-bold">
                            비밀번호 확인 <span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-9">
                            <div className="position-relative">
                                <input
                                    type={showPasswordCheck ? "text" : "password"}
                                    className={`form-control ${accountClass.accountPw2}`}
                                    name="accountPw2"
                                    value={account.accountPw2}
                                    onChange={changeStrValue}
                                    onBlur={checkAccountPw}
                                    placeholder="비밀번호 재입력"
                                    style={{ paddingRight: "45px", backgroundImage : "none" }}
                                />
                                <span
                                    onClick={() => setShowPasswordCheck(!showPasswordCheck)}
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                                    style={{ cursor: "pointer" }}
                                >
                                    {showPasswordCheck ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {accountClass.accountPw2 === "is-valid" && (
                                <div className="valid-feedback d-block" style={{ color: MINT_COLOR, fontWeight: 'bold' }}>비밀번호가 일치합니다</div>
                            )}
                            {accountClass.accountPw2 === "is-invalid" && (
                                <div className="invalid-feedback d-block">비밀번호가 일치하지 않습니다</div>
                            )}
                        </div>
                    </div>

                    <button
                        className="btn w-100 py-3 fw-bold text-white fs-5 mt-4"
                        style={{ backgroundColor: MINT_COLOR, borderColor: MINT_COLOR }}
                        onClick={changePw}
                    >
                        비밀번호 변경하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountfindPwStep2;