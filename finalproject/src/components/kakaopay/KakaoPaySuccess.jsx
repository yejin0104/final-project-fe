import { useNavigate } from "react-router-dom";
import KakaoPayLayout from "./KakaoPayLayout";

export default function KakaoPaySuccess() {
    const navigate = useNavigate();

    return (
        <KakaoPayLayout title="결제가 완료되었습니다">
            <p>카카오페이 결제가 정상적으로 처리되었습니다.</p>
            <p>이용해 주셔서 감사합니다.</p>

            <button className="kakao-button" onClick={() => navigate("/")}>
                확인
            </button>
        </KakaoPayLayout>
    );
}