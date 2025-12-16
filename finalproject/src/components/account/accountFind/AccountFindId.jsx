import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../accountJoin/Stepper";
import AccountFindIdStep1 from "./AccountFindIdStep1";
import AccountFindIdStep2 from "./AccountFindIdStep2";

// Minty 테마 색상 정의
const MINT_COLOR = "#78C2AD";
export default function AccountFindId() {
    //이동 도구
    const navigate = useNavigate();

    // 현재 단계
    const [step, setStep] = useState(1);

    // 찾은 아이디 저장
    const [foundId, setFoundId] = useState("");

    // step1이 성공하면 step2로 이동
    const step1Success = useCallback((foundId) => {
        setFoundId(foundId);//번호 저장
        setStep(2);//step2로 이동
    }, []);

    //render
    return (
        <>
            <div className="py-5">
                <Stepper currentStep={step} />

                {/* 조건부 렌더링(step에 따라 교체) */}
                {step === 1 ? (
                    <AccountFindIdStep1 onNext={step1Success} />
                ) : (
                    <AccountFindIdStep2 foundId={foundId} />
                )}
            </div>
        </>
    )
}