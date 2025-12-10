import { useNavigate } from "react-router-dom";
import KakaoPayLayout from "./KakaoPayLayout";

export default function KakaoPayFail() {
    const navigate = useNavigate();

    return (
        <KakaoPayLayout title="결제에 실패했습니다">
            <p>결제를 처리하던 중 오류가 발생했습니다.</p>
            <p>다시 시도하거나 다른 결제 수단을 이용해 주세요.</p>

            <button className="kakao-button" onClick={() => navigate("/")}>
                확인
            </button>
        </KakaoPayLayout>
    );
}