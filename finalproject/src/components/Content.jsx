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
{/* 회원 관련 */ }
import AccountJoin from "./account/accountJoin/AccountJoin";
import AccountLogin from "./account/accountLogin";
import AccountJoinFinish from "./account/accountJoin/AccountJoinFinish";
import AccountFindId from "./account/accountFind/AccountFindId";
import AccountFindPw from "./account/accountFind/AccountFindPw";
{/* 일정 관련 */ }
import ScheduleData from "./schedule/ScheduleData";
import Schedule from "./schedule/Schedule";
import ScheduleList from "./schedule/ScheduleList";
import SchedulePage from "./schedule/SchedulePage";
import ScheduleSearch from "./schedule/ScheduleSearch";
import Main from "./templates/Main";


// 고객센터 화면
import CounselorDashboard from "./dashboard/CounselorDashboard";
import Unauthorized from "./error/Unauthorized";







export default function Content() {
    return (<>
        <div className="row">
            <div className="col-md-10 offset-md-1">
                {/* 분할된 화면의 주소를 지정하는 영역 (path=주소 , element=화면) */}
                <Routes>
                    {/* 메인 페이지 */}
                    {/* <Route path="/" element={<Home/>}></Route> */}

                    {/* 상담 대기 목록 화면 */}
                    <Route path="/counselor/dashboard" element={<CounselorDashboard />} />

                    {/* 회원 관련 페이지 */}
                    <Route path="/account/join" element={<AccountJoin />}></Route>
                    <Route path="/account/login" element={<AccountLogin />}></Route>
                    <Route path="/account/findId" element={<AccountFindId/>}></Route>
                    <Route path="/account/findPw" element={<AccountFindPw/>}></Route>
                    <Route path="/account/joinFinish" element={<AccountJoinFinish/>}></Route>

                    

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

                    {/* 일정 관련 */}
                    <Route path="/scheduleList" element={<ScheduleList />} />

                    <Route path="/schedulePage/:scheduleNo" element={<SchedulePage />} >
                        <Route index element={<ScheduleData />} />
                        <Route path="data" element={<ScheduleData />} />
                        <Route path="shearch" element={<ScheduleSearch />} />
                    </Route>

                    <Route path="kakaotest" element={<KakaoMapTest />}></Route>


                    <Route path="/schedule" element={<Schedule />} />

                    <Route path="/" element={<Main />} />
                      
                    {/* 에러 페이지 */}
                    <Route path="/unauthorized" element={<Unauthorized/>}></Route>
                </Routes>
            </div>
        </div>
    </>)
}