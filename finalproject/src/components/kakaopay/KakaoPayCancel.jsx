
import { useNavigate } from "react-router-dom";
import KakaoPayLayout from "./KakaoPayLayout";

export default function KakaoPayCancel() {
    const navigate = useNavigate();

    return (
        <KakaoPayLayout title="결제가 취소되었습니다">
            <p>사용자 요청에 의해 결제가 취소되었습니다.</p>
            <p>필요 시 다시 결제를 진행할 수 있습니다.</p>

            <button className="kakao-button" onClick={() => navigate("/")}>
                확인
            </button>
        </KakaoPayLayout>
    );
}