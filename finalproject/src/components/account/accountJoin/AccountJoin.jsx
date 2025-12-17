import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import AccountJoinStep1 from "./AccountJoinStep1";
import AccountJoinStep2 from "./AccountJoinStep2";
import Stepper from "./Stepper";
import { atom, useAtomValue } from "jotai";
import { loginIdState } from "../../../utils/jotai";

export default function AccountJoin() {
    // 이동 도구
    const navigate = useNavigate();
    // 회원의 로그인 상태를 판별하여 차단
    const loginId = useAtomValue(loginIdState);
    useEffect(() => {
        if (loginId) navigate("/");
    }, [loginId]);

    // 현재 단계 (1. 본인인증, 2. 회원정보입력)
    const [step, setStep] = useState(1);

    // 인증된 전화번호를 저장
    const [verifiedPhone, setVerifiedPhone] = useState("");

    // step1이 성공하면 step2로 이동
    const step1Success = useCallback((phone) => {
        setVerifiedPhone(phone);//번호 저장
        setStep(2);//step2로 이동
    }, []);

    return (
        <>
            <Stepper currentStep={step} />

            {/* 조건부 랜더링(step에 따라 교체) */}
            {step === 1 ? (
                <AccountJoinStep1 onNext={step1Success}></AccountJoinStep1>
            ) : (
                <AccountJoinStep2 verifiedPhone={verifiedPhone} />
            )}
        </>

    )
}