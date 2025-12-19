import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import "../kakaopay/KakaoPay.css";
import "./AccountPay.css";
import { numberWithComma } from "../../utils/format";
import { formatDateTime } from "../../utils/dateFormat";
import { useAtom, useAtomValue } from "jotai";
import { accessTokenState, loginCompleteState } from "../../utils/jotai";

export default function AccountPayInformation() {

    //jotai state
    // const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [paymentList, setPaymentList] = useState([]);
    const loginComplete = useAtomValue(loginCompleteState);

    useEffect(() => {
        // 토큰이 있을 때만 데이터 로드 (선택 사항)
        if (loginComplete === true) {
            loadData();
        }
    }, [loginComplete]); // 토큰이 로드되면 실행

    const loadData = useCallback(async () => {

        const { data } = await axios.get("/payment/account")
        setPaymentList(data);
    }, [setPaymentList]);

    const calculateStatus = useCallback(payment => {
        const { paymentTotal, paymentRemain } = payment;
        if (paymentTotal === paymentRemain) return "결제 완료";
        if (paymentRemain === 0) return "결제 전체 취소";
        return "결제 부분 취소";
    }, []);

    const checkPaymentRefund = useCallback((paymentTime) => {
        const base = new Date(paymentTime).getTime();
        const after3Days = base + 3 * 24 * 60 * 60 * 1000;

        return Date.now() >= after3Days;
    }, []);

    const statusTextColor = useCallback((payment) => {
        const { paymentTotal, paymentRemain } = payment;
        if (paymentTotal === paymentRemain) return "info";
        if (paymentRemain === 0) return "danger";
        return "dark";
    }, []);

    return (<>


        <div
            className="fade-jumbotron"
            style={{ animationDelay: `${0.03}s` }}
        >
            {/* <Jumbotron subject="내 카카오페이 결제 내역" detail="카카오페이 결제 내역을 알아봅시다."></Jumbotron> */}

            <div className="row">
                <div className="col">
                    <h3 className="text-center ellipsis">카카오페이 결제내역 조회</h3>
                    <p className="text-center text-desc ellipsis">
                        카카오페이에서 결제내역을 알아봅시다.
                    </p>
                </div>
            </div>
        </div>

        {/* <div
            className="fade-link"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="row my-4">
                <div className="col-6 text-center">
                    <Link to="/kakaopay/buy" className="none-decortion">카카오페이 결제하기</Link>
                </div>
                <div className="col-6 text-center">
                    <Link to="/" className="none-decortion">홈</Link>
                </div>
            </div>
        </div> */}


        <hr className="mt-5" />

        <div
            className="fade-item"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="d-flex align-items-center">
                {paymentList === null ? (

                    <div className="fw-bold ellipsis" style={{ width: 220 }}>
                        결제 내역 조회 Loading...
                    </div>

                ) : (

                    <>
                        <div className="d-flex flex-column w-100">
                            {paymentList.map((payment, i) => (

                                <div
                                    key={i}
                                    className="fade-item w-100 mb-1"
                                    style={{ animationDelay: `${i * 0.03}s` }}
                                >
                                    <div className="p-4 shadow rounded d-flex align-items-start w-100">

                                        {/* 상품명 영역 */}
                                        <div className="fw-bold me-3 ellipsis" style={{ width: 220 }}>
                                            {payment.paymentName}
                                        </div>

                                        {/* 중간 정보 + 버튼을 가로로 묶는 핵심 영역 */}
                                        <div className="d-flex align-items-center flex-grow-1">

                                            {/* 텍스트 3줄 영역 (가로폭 크게) */}
                                            <div className="d-flex flex-column gap-1 flex-grow-1">
                                                <div className="row">
                                                    <div className="col-sm-4 text-primary ellipsis">거래금액</div>
                                                    <div className="col-sm-8 text-secondary ellipsis">총 {numberWithComma(payment.paymentTotal)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-4 text-primary ellipsis">거래번호</div>
                                                    <div className="col-sm-8 text-secondary ellipsis">{payment.paymentTid}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-4 text-primary ellipsis">거래일시</div>
                                                    <div className="col-sm-8 text-secondary ellipsis">{formatDateTime(payment.paymentTime)}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-4 text-primary ellipsis">상태</div>
                                                    <div className={`col-sm-8 text-${statusTextColor(payment)} ellipsis`}>{calculateStatus(payment)}</div>
                                                </div>
                                            </div>

                                            {/* 환불 버튼 – 오른쪽 벽 고정 */}
                                            <div className="ms-auto d-flex justify-content-end" style={{ width: 250 }}>
                                                <Link
                                                    to={`/kakaopay/pay/detail/${payment.paymentNo}`}
                                                    state={{ isRefund: !checkPaymentRefund(payment.paymentTime) }}
                                                    className="btn btn-outline-info ellipsis"
                                                    style={{ fontSize: "0.8em" }}
                                                >
                                                    자세히 보기 <FaArrowRight />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            ))}
                        </div>
                    </>

                )}
            </div>
        </div>
    </>)
}