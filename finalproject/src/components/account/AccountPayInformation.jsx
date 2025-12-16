import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import "../kakaopay/KakaoPay.css";
import "./AccountPay.css";
import { numberWithComma } from "../../utils/format";
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

    return (<>


        <div
            className="fade-jumbotron"
            style={{ animationDelay: `${0.03}s` }}
        >
            <Jumbotron subject="내 카카오페이 결제 내역" detail="카카오페이 결제 내역을 알아봅시다."></Jumbotron>
        </div>

        <div
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
        </div>


        <hr />
        {paymentList.map((payment, i) => (
            <div
                key={i}
                className="fade-item"
                style={{ animationDelay: `${i * 0.03}s` }}
            >
                <div className="row mb-4" key={payment.paymentNo}>
                    <div className="col">
                        <div className="p-4 shadow rounded">
                            <h2>{payment.paymentName}</h2>
                            <div>거래금액 : 총 {numberWithComma(payment.paymentTotal)}원</div>
                            <div>거래번호 : {payment.paymentTid}</div>
                            <div>거래일시 : {payment.paymentTime}</div>
                            <div>상태 : {calculateStatus(payment)}</div>
                            <div className="mt-2 text-end">
                                <Link to={`/kakaopay/pay/detail/${payment.paymentNo}`} className="btn btn-outline-info">자세히 보기 <FaArrowRight /></Link>
                                {/* /kakaopay/pay/detail */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </>)
}