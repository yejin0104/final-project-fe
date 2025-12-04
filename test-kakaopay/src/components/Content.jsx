import KakaoPay from "./kakaopay/KakaoPay";
import KakaoPaySuccess from "./kakaopay/KakaoPaySuccess";
import KakaoPayCancel from "./kakaopay/KakaoPayCancel";
import KakaoPayFail from "./kakaopay/KakaoPayFail";
import { Route, Routes } from "react-router-dom";


export default function Content () {

    //render
    return (<>
        {/* 전체 화면의 폭을 통제하기 위한 추가코드 */}
        <div className="row">
            <div className="col-md-10 offset-md-1">

                {/* 분할된 화면의 주소를 지정하는 영역 (path=주소 , element=화면) */}
                <Routes>
                    {/* 메인 페이지 */}
                    <Route path="/" element={<KakaoPay/>}></Route>

                    <Route path="/success" element={<KakaoPaySuccess/>}></Route>
                    <Route path="/cancel" element={<KakaoPayCancel/>}></Route>
                    <Route path="/fail" element={<KakaoPayFail/>}></Route>
                </Routes>

            </div>
        </div>

    </>)
}