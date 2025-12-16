import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom"
import Stepper from "../accountJoin/Stepper";
import AccountFindPwStep1 from "./AccountFindPwStep1";
import AccountFindPwStep2 from "./AccountfindPwStep2";


export default function AccountFindPw() {
    const navigate = useNavigate();

    // 현재 단계
    const [step, setStep] = useState(1);

    // 아이디 저장
    const [accountId, setAccountId] = useState("");

    // step1이 성공하면 step2로 이동
    const step1Success = useCallback((accountId) => {
        setAccountId(accountId);
        setStep(2);//step2로 이동
    }, []);

    //render
    return (<>
        <div className="py-5">
            <Stepper currentStep={step} />

            {/* 조건부 렌더링(step에 따라 교체) */}
            {step === 1 ? (
                <AccountFindPwStep1 onNext={step1Success} />
            ) : (
                <AccountFindPwStep2 accountId={accountId} />
            )}
        </div>
    </>)
}