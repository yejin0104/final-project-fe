import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6"; // Asterisk, User 아이콘 제거
import axios from "axios";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import 'dayjs/locale/ko';

// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";

const AccountJoinStep2 = ({ verifiedPhone }) => {
    // 이동도구
    const navigate = useNavigate();

    //state
    const [account, setAccount] = useState({
        accountId: "", accountPw: "", accountPw2: "",
        accountEmail: "", accountBirth: "", accountGender: "",
        accountNickname: "", accountContact: verifiedPhone
    });
    const [accountClass, setAccountClass] = useState({
        accountId: "", accountPw: "", accountPw2: "",
        accountEmail: "", accountBirth: "", accountGender: "",
        accountNickname: "", accountContact: verifiedPhone
    });
    // 입력정보가 문제가 될 경우 나오는 피드백 state
    const [accountIdFeedback, setAccountIdFeedback] = useState("");
    const [accountPwFeedback, setAccountPwFeedback] = useState("");
    const [accountNicknameFeedback, setAccountNicknameFeedback] = useState("");

    //callback
    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setAccount(prev => ({ ...prev, [name]: value }));

        // 입력창을 비웠을 때 상태 초기화
        if (value.length === 0) {
            setAccountClass(prev => ({ ...prev, [name]: "" }));
            if (name === 'accountId') setAccountIdFeedback("");
            if (name === 'accountPw') setAccountPwFeedback("");
            if (name === 'accountNickname') setAccountNicknameFeedback("");
        }
    }, [account]);

    const changeDateValue = useCallback((newValue) => {
        if (newValue) {
            const formattedDate = newValue.format("YYYY-MM-DD");
            setAccount(prev => ({ ...prev, accountBirth: formattedDate }));
        }
        else {
            setAccount(prev => ({ ...prev, accountBirth: "" }));
        }
    }, [account]);

    //아이디 검사
    const checkAccountId = useCallback(async (e) => {
        const regex = /^[a-z][a-z0-9]{4,19}$/;
        const isValid = regex.test(account.accountId);
        if (isValid) {
            try {
                const { data } = await axios.get(`http://localhost:8080/account/accountId/${account.accountId}`);
                if (data === true) {
                    setAccountClass(prev => ({ ...prev, accountId: "is-valid" }));
                }
                else {
                    setAccountClass(prev => ({ ...prev, accountId: "is-invalid" }));
                    setAccountIdFeedback("이미 사용중인 아이디입니다");
                }
            } catch (e) { console.error(e); }
        }
        else {
            setAccountClass(prev => ({ ...prev, accountId: "is-invalid" }));
            setAccountIdFeedback("아이디는 영문 소문자로 시작하며 숫자를 포함한 5-20자로 작성하세요");
        }
        
        if(account.accountId.length === 0){
            setAccountClass(prev=>({...prev, accountId : ""}));
            setAccountIdFeedback("");
        }
    }, [account.accountId]);

    // 비밀번호 검사
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);
    
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

    //닉네임 검사
    const checkAccountNickname = useCallback(async () => {
        const regex = /^[가-힣0-9]{2,10}$/;
        const isValid = regex.test(account.accountNickname);
        if (isValid === true) {
            try {
                const { data } = await axios.get(`http://localhost:8080/account/accountNickname/${account.accountNickname}`);
                if (data === true) {
                    setAccountClass(prev => ({ ...prev, accountNickname: "is-valid" }));
                }
                else {
                    setAccountClass(prev => ({ ...prev, accountNickname: "is-invalid" }));
                    setAccountNicknameFeedback("이미 사용중인 닉네임입니다");
                }
            } catch(e) { console.error(e); }
        }
        else {
            setAccountClass(prev => ({ ...prev, accountNickname: "is-invalid" }));
            setAccountNicknameFeedback("한글 또는 숫자 2~10글자로 작성하세요");
        }
    }, [account.accountNickname]);

    // 이메일 검사
    const checkAccountEmail = useCallback(e => {
        const emailValue = account.accountEmail;
        if(emailValue.length === 0){
            setAccountClass(prev => ({ ...prev, accountEmail: "" }));
            return;
        }
        const regex = /^[a-z0-9]+@[a-z0-9.]+$/;
        const isValid = regex.test(account.accountEmail);
        if (isValid) {
            setAccountClass(prev => ({ ...prev, accountEmail: "is-valid" }));
        }
        else {
            setAccountClass(prev => ({ ...prev, accountEmail: "is-invalid" }));
        }
    }, [account.accountEmail]);

    // 모든 필수 항목 유효검사
    const accountValid = useMemo(() => {
        if (accountClass.accountId !== "is-valid") return false;
        if (accountClass.accountPw !== "is-valid") return false;
        if (accountClass.accountPw2 !== "is-valid") return false;
        if (accountClass.accountNickname !== "is-valid") return false;
        if (accountClass.accountEmail === "is-invalid") return false;
        return true;
    }, [accountClass, account.accountBirth, account.accountGender]);

    // 최종 가입
    const sendData = useCallback(async () => {
        if (accountValid === false) return;
        try {
            await axios.post("http://localhost:8080/account/join", account);
            navigate("/account/joinFinish");
        } catch(e) {
             if(e.response && e.response.status === 409) {
                alert(e.response.data.message || "이미 가입된 정보입니다.");
            } else {
                alert("가입 중 오류가 발생했습니다.");
            }
        }
    }, [account, accountValid, navigate]);

    // 버튼 스타일 생성 함수 (성별 선택용)
    const getGenderBtnStyle = (targetGender) => {
        const isActive = account.accountGender === targetGender;
        return {
            backgroundColor: isActive ? MINT_COLOR : 'white',
            color: isActive ? 'white' : '#6c757d',
            borderColor: isActive ? MINT_COLOR : '#6c757d',
            fontWeight: isActive ? 'bold' : 'normal'
        };
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col">
                    <div className="card shadow-sm border-0 mx-auto" style={{ width: "640px", maxWidth: "100%" }}>
                        <div className="card-body p-5">
                            <h3 className="fw-bold mb-4 text-center">2단계. 정보입력</h3>

                            {/* 아이디 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    아이디 <span className="text-danger">*</span>
                                </label>
                                <div className="col-sm-9">
                                    <div className="d-flex gap-2">
                                        <input type="text" className={`form-control ${accountClass.accountId}`}
                                            name="accountId" value={account.accountId} onChange={changeStrValue} />
                                        <button 
                                            type="button" 
                                            className="btn text-white text-nowrap" 
                                            style={{ backgroundColor: MINT_COLOR, borderColor: MINT_COLOR }}
                                            onClick={checkAccountId}
                                        >
                                            아이디확인
                                        </button>
                                    </div>
                                    {accountClass.accountId === "is-valid" && (
                                        <div className="valid-feedback d-block" style={{color: MINT_COLOR, fontWeight: 'bold'}}>사용 가능한 아이디입니다!</div>
                                    )}
                                    {accountClass.accountId === "is-invalid" && (
                                        <div className="invalid-feedback d-block">{accountIdFeedback}</div>
                                    )}
                                </div>
                            </div>

                            {/* 비밀번호 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    비밀번호 <span className="text-danger">*</span>
                                </label>
                                <div className="col-sm-9">
                                    <div className="position-relative">
                                        <input type={showPassword ? "text" : "password"}
                                            className={`form-control ${accountClass.accountPw}`}
                                            name="accountPw" value={account.accountPw} onChange={changeStrValue}
                                            onBlur={checkAccountPw} style={{paddingRight:"45px", backgroundImage : "none"}} />
                                        <span onClick={() => setShowPassword(!showPassword)}
                                            className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                                            style={{cursor: "pointer"}}>
                                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                                        </span>
                                    </div>
                                    {accountClass.accountPw === "is-valid" && (
                                        <div className="valid-feedback d-block" style={{color: MINT_COLOR, fontWeight: 'bold'}}>사용 가능한 비밀번호 형식입니다</div>
                                    )}
                                    {accountClass.accountPw === "is-invalid" && (
                                        <div className="invalid-feedback d-block">8~16자, 대문자/소문자/숫자/특수문자(!@#$) 필수</div>
                                    )}
                                </div>
                            </div>

                            {/* 비밀번호 확인 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    비밀번호 확인 <span className="text-danger">*</span>
                                </label>
                                <div className="col-sm-9">
                                    <div className="position-relative">
                                        <input type={showPasswordCheck ? "text" : "password"} 
                                            className={`form-control ${accountClass.accountPw2}`}
                                            name="accountPw2" value={account.accountPw2} onChange={changeStrValue}
                                            onBlur={checkAccountPw} style={{paddingRight:"45px", backgroundImage : "none"}} />
                                        <span onClick={() => setShowPasswordCheck(!showPasswordCheck)}
                                            className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
                                            style={{cursor: "pointer"}}>
                                            {showPasswordCheck ? <FaEye /> : <FaEyeSlash />}
                                        </span>
                                    </div>
                                    {accountClass.accountPw2 === "is-valid" && (
                                        <div className="valid-feedback d-block" style={{color: MINT_COLOR, fontWeight: 'bold'}}>비밀번호가 일치합니다</div>
                                    )}
                                    {accountClass.accountPw2 === "is-invalid" && (
                                        <div className="invalid-feedback d-block">비밀번호가 일치하지 않습니다</div>
                                    )}
                                </div>
                            </div>

                            {/* 닉네임 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    닉네임 <span className="text-danger">*</span>
                                </label>
                                <div className="col-sm-9">
                                    <div className="d-flex gap-2">
                                        <input type="text" className={`form-control ${accountClass.accountNickname}`}
                                            name="accountNickname" value={account.accountNickname} onChange={changeStrValue} />
                                        <button 
                                            type="button" 
                                            className="btn text-white text-nowrap" 
                                            style={{ backgroundColor: MINT_COLOR, borderColor: MINT_COLOR }}
                                            onClick={checkAccountNickname}
                                        >
                                            닉네임확인
                                        </button>
                                    </div>
                                    {accountClass.accountNickname === "is-valid" && (
                                        <div className="valid-feedback d-block" style={{color: MINT_COLOR, fontWeight: 'bold'}}>사용 가능한 닉네임입니다!</div>
                                    )}
                                    {accountClass.accountNickname === "is-invalid" && (
                                        <div className="invalid-feedback d-block">{accountNicknameFeedback}</div>
                                    )}
                                </div>
                            </div>

                            {/* 이메일 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    이메일
                                </label>
                                <div className="col-sm-9">
                                    <input type="text"
                                        className={`form-control ${accountClass.accountEmail}`}
                                        name="accountEmail" value={account.accountEmail} onChange={changeStrValue}
                                        onBlur={checkAccountEmail} placeholder="[선택] 아이디/비밀번호 찾기에 사용됩니다." />
                                    {accountClass.accountEmail === "is-invalid" && (
                                        <div className="invalid-feedback d-block">부적합한 이메일 형식입니다</div>
                                    )}
                                </div>
                            </div>

                            {/* 성별 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    성별
                                </label>
                                <div className="col-sm-9">
                                    <div className="btn-group w-100" role="group">
                                        <button type="button" className="btn"
                                            style={getGenderBtnStyle('남')}
                                            onClick={() => setAccount({ ...account, accountGender: '남' })}>남</button>
                                        <button type="button" className="btn"
                                            style={getGenderBtnStyle('여')}
                                            onClick={() => setAccount({ ...account, accountGender: '여' })}>여</button>
                                        <button type="button" className="btn"
                                            style={getGenderBtnStyle("")}
                                            onClick={() => setAccount({ ...account, accountGender: "" })}>선택안함</button>
                                    </div>
                                </div>
                            </div>

                            {/* 생년월일 */}
                            <div className="row mt-4">
                                <label className="col-sm-3 col-form-label fw-bold">
                                    생년월일
                                </label>
                                <div className="col-sm-9">
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                                        <DatePicker className="w-100" format="YYYY-MM-DD"
                                            disableFuture
                                            value={account.accountBirth ? dayjs(account.accountBirth) : null}
                                            onChange={changeDateValue}
                                            slotProps={{ textField: { size: 'small', className: 'form-control', inputProps: {readOnly: true, placeholder: "눌러서 날짜 선택"} } }} />
                                    </LocalizationProvider>
                                </div>
                            </div>

                            {/* 가입버튼 */}
                            <div className="row mt-5">
                                <div className="col">
                                    <button type="button" className="btn w-100 py-3 fw-bold text-white"
                                        style={{ 
                                            backgroundColor: accountValid ? MINT_COLOR : '#ccc', 
                                            borderColor: accountValid ? MINT_COLOR : '#ccc',
                                            transition: '0.3s'
                                        }}
                                        disabled={!accountValid} onClick={sendData}>
                                        <span>{accountValid ? "회원 가입하기" : "필수 항목을 모두 작성해주세요"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountJoinStep2;