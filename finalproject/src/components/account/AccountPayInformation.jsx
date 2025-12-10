import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import "../kakaopay/KakaoPay.css";

export default function AccountPayInformation() {
    const [paymentList, setPaymentList] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {

        const { data } = await axios.get("/payment/account");
        setPaymentList(data);
    }, []);

    const calculateStatus = useCallback(payment => {
        const { paymentTotal, paymentRemain } = payment;
        if (paymentTotal === paymentRemain) return "결제 완료";
        if (paymentRemain === 0) return "결제 전체 취소";
        return "결제 부분 취소";
    }, []);

    const numberWithComma = useCallback((x) => {
        if (x === null || x === undefined || x === '') {
            return '';
        }

        const numString = String(x);

        const parts = numString.split('.');
        const integerPart = parts[0];
        const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return formattedInteger + decimalPart;
    }, []);


    return (<>

        <Jumbotron subject="내 카카오페이 결제 내역" detail=""></Jumbotron>

        <div className="row mt-4">
            <div className="col-6">
                <Link to="/kakaopay/buy" className="none-decortion">카카오페이 결제하기</Link>
            </div>
            <div className="col-6">
                <Link to="/" className="none-decortion">홈</Link>
            </div>
        </div>

        <hr />
        {paymentList.map(payment => (
            <div className="row mb-4" key={payment.paymentNo}>
                <div className="col">
                    <div className="p-4 shadow rounded">
                        <h2>{payment.paymentName}</h2>
                        <div>거래금액 : 총 {numberWithComma(payment.paymentTotal)}원</div>
                        <div>거래번호 : {payment.paymentTid}</div>
                        <div>거래일시 : {payment.paymentTime}</div>
                        <div>상태 : {calculateStatus(payment)}</div>
                        <div className="mt-2 text-end">
                            <Link to={`/kakaopay/pay/detail/${payment.paymentNo}`} className="btn btn-info">자세히 보기 <FaArrowRight /></Link>
                            {/* /kakaopay/pay/detail */}
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </>)
}