import axios from "axios";
import { useCallback, useState } from "react";

const AccountJoinStep1 = () => {
    //state
    const [phone, setPhone] = useState("");
    const [certNumber, setCertNumber] = useState("");
    const [isSent, setIsSent] = useState(false);// 인증번호 발송 여부

    //callback
    // 인증번호 발송
    const sendCert = useCallback(async()=> {
        if(!phone) return false;
        const regex = /^010[1-9][0-9]{7}$/;
        const isValid = regex.test(phone);
        if(!isValid) return false;
        
        const {data} = await axios.post("http://localhost:8080/cert/sendPhone", null, {params : {phone : phone}});
        setIsSent(true);
        alert("인증번호가 발송되었습니다");
    },[phone]);

    //인증번호 확인
    const checkCert = useCallback(async() =>{
        const response = await axios.post("http://localhost:8080/cert/check",{
            certTarget : phone,
            certNumber : certNumber
        });
        if(response.data === true){
            alert("인증 성공");
        }
    },[phone, certNumber, isSent]);

    return (
        <div className="row mt-4">
            <div className="col">
                <div className="card shadow-sm border-1">
                    <div className="card-body p-5">
                        <h3 className="fw-bold mb-4">1단계. 본인인증</h3>
                        <p className="text-muted mb-4">안전한 서비스 이용을 위해 휴대폰 인증을 진행해주세요.</p>

                        {/* 전화번호 입력 */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">휴대폰 번호</label>
                            <div className="d-flex gap-2">
                                <input type="text" className="form-control" placeholder="- 없이 숫자만 입력"
                                value={phone} onChange={e=>setPhone(e.target.value)}/>
                                <button type="button" className="btn btn-primary text-nowrap" onClick={sendCert} disabled={isSent}>
                                        {isSent ? "발송됨" : "인증요청"}
                                </button>
                            </div>
                        </div>

                        {/* 인증번호 입력(발송 성공 시에만 보임) */}
                        {isSent && (
                            <div className="mb-3">
                                <label className="form-label fw-bold">인증번호</label>
                                <div className="d-flex gap-2">
                                    <input type="text" className="form-control" placeholder="인증번호 6자리"
                                    value={certNumber} onChange={e=>setCertNumber(e.target.value)}/>
                                    <button className="btn btn-primary text-nowrap" onClick={checkCert}>
                                        확인
                                    </button>
                                </div>
                                <div className="form-text text-dnager mt-2">
                                    * 3분 이내에 입력해주세요
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountJoinStep1;