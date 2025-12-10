import { Route, Routes } from "react-router-dom";
import KakaoMapTest from "./kakaomap/KakaoMapTest";
{/* 카카오페이 관련 */ }
import KakaoPay from "./kakaopay/KakaoPay";
import KakaoPaySuccess from "./kakaopay/KakaoPaySuccess";
import KakaoPayCancel from "./kakaopay/KakaoPayCancel";
import KakaoPayFail from "./kakaopay/KakaoPayFail";
{/* 카카오페이 관련 */ }
{/* 카카오페이 결제 내역 */ }
import AccountPayInformation from "./account/AccountPayInformation";
import AccountPayDetail from "./account/AccountPayDetail";
{/* 카카오페이 결제 내역 */ }


export default function Content() {
    return (<>
        <div className="row">
            <div className="col-md-10 offset-md-1">
                {/* 분할된 화면의 주소를 지정하는 영역 (path=주소 , element=화면) */}
                <Routes>
                    {/* 메인 페이지 */}
                    {/* <Route path="/" element={<Home/>}></Route> */}

                    <Route path="kakaotest" element={<KakaoMapTest />}></Route>

                    {/* 카카오페이 관련 */}
                    <Route path="/kakaopay/buy" element={<KakaoPay />}></Route>
                    <Route path="/kakaopay/buy/success" element={<KakaoPaySuccess />}></Route>
                    <Route path="/kakaopay/buy/cancel" element={<KakaoPayCancel />}></Route>
                    <Route path="/kakaopay/buy/fail" element={<KakaoPayFail />}></Route>
                    {/* 카카오페이 관련 */}

                    {/* 카카오페이 결제 내역 */}
                    <Route path="/kakaopay/pay/info" element={<AccountPayInformation />}></Route>
                    <Route path="/kakaopay/pay/detail" element={<AccountPayDetail />}></Route>
                    <Route path="/kakaopay/pay/detail/:paymentNo" element={<AccountPayDetail />}></Route>
                    {/* 카카오페이 결제 내역 */}
                </Routes>
            </div>
        </div>
    </>)
}