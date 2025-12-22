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
import AccountLogin from "./account/AccountLogin";
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

{/* 마이페이지 */ }
import MyPage from "./mypage/mypage";
import MyInformation from "./mypage/MyInformation";
import MyPayment from "./mypage/MyPayment";
import MySchedule from "./mypage/MySchedule";
import MyWishList from "./mypage/MyWishList";
import { ShareGate } from "./schedule/ShareGate";

// 고객센터 화면
import CounselorDashboard from "./dashboard/CounselorDashboard";
import Unauthorized from "./error/Unauthorized";

{/* 관리자*/ }
import AdminHome from "./admin/AdminHome";

import AccountSearch from "./admin/search/AccountSearch";
import AccountDashboard from "./admin/dashboard/AdminDashboard";

import Private from "./guard/Private";
import Admin from "./guard/Admin";
import Home from "./Home";
import MemberReview from "./schedule/MemberReview";
import Review from "./schedule/Review";
import AdminSchedule from "./admin/schedule/AdminSchedule";
import AdminCounselor from "./admin/counselor/AdminCounselor";
import AdminPayment from "./admin/payment/AdminPayment";

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
                    <Route path="/account/findId" element={<AccountFindId />}></Route>
                    <Route path="/account/findPw" element={<AccountFindPw />}></Route>
                    <Route path="/account/joinFinish" element={<AccountJoinFinish />}></Route>

                    {/* 관리자 페이지 */}
                     <Route path="/admin" element={<Admin><AdminHome/></Admin>}>
                        <Route path="/admin/search" element={<Admin><AccountSearch/></Admin>}></Route>
                        <Route path="/admin/dashboard" element={<Admin><AccountDashboard/></Admin>}></Route>
                        <Route path="/admin/payments" element={<Admin><AdminPayment/></Admin>} />
                        <Route path="/admin/schedules" element={<Admin><AdminSchedule/></Admin>} />
                        <Route path="/admin/counselors" element={<Admin><AdminCounselor/></Admin>} />
                    </Route>

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
                    <Route path="/scheduleList/" element={<ScheduleList />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/schedule/memberReview" element={<MemberReview />} />
                    <Route path="/schedule/review" element={<Review />} />

                    {/* 비회원 확인용 */}
                    <Route path="/share/:shareKey" element={<ShareGate/>}></Route>

                    <Route path="/schedulePage/:scheduleNo" element={<SchedulePage />} >
                        <Route index element={<ScheduleData />} />
                        <Route path="data" element={<ScheduleData />} />
                        <Route path="search" element={<ScheduleSearch />} />
                    </Route>

                    <Route path="kakaotest" element={<KakaoMapTest />}></Route>

                    

                    {/* 마이페이지(중첩 라우팅) */}
                    <Route path="/mypage" element={<MyPage />}>
                        <Route path="info" element={<MyInformation />} />
                        <Route path="pay" element={<MyPayment />} />
                        <Route path="schedule" element={<MySchedule />} />
                        <Route path="wishlist" element={<MyWishList />} />
                    </Route>

                    {/* 디자인 확인을 위해 유지(향후 삭제) */}
                    <Route path="/example" element={<Main />} />

                    {/* 메인페이지 이동 */}
                    <Route path="/" element={<Home/>}></Route>

                    {/* 에러 페이지 */}
                    <Route path="/unauthorized" element={<Unauthorized />}></Route>
                </Routes>
            </div>
        </div>
    </>)
}