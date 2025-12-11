import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./AccountPay.css";
import { FaQuestionCircle } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import Jumbotron from "../templates/Jumbotron";
import { numberWithComma } from "../../utils/format";
import { confirm } from "../../utils/confirm";

export default function AccountPayDetail() {
    const { paymentNo } = useParams();

    const [payment, setPayment] = useState(null);
    const [paymentDetailList, setPaymentDetailList] = useState(null);
    const [kakaopayInfo, setKakaopayInfo] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        const { data } = await axios.get(`/payment/${paymentNo}`);
        const { paymentDto, paymentDetailList, responseVO } = data;
        setPayment(paymentDto);
        setPaymentDetailList(paymentDetailList);
        setKakaopayInfo(responseVO);
    }, []);

    const cancelAll = useCallback(async () => {

        const choice = await confirm({
            title: "모든 아이템을 환불하시겠습니까?",
            text: "환불은 돌이킬 수 없습니다.",
            icon: "error",
            confirmColor: "#0984e3",
            cancelColor: "#d63031",
            confirmText: "전체 환불",
            cancelText: "취소",
        });

        if (choice.isConfirmed === false)
            return;

        await axios.delete(`/payment/${paymentNo}`);

        toast.success("결제 전체 취소");
        loadData();
    }, []);

    const cancelUnit = useCallback(async (paymentDetail) => {

         const choice = await confirm({
            title: "해당 아이템을 환불하시겠습니까?",
            text: "환불은 돌이킬 수 없습니다.",
            icon: "error",
            confirmColor: "#0984e3",
            cancelColor: "#d63031",
            confirmText: "아이템 환불",
            cancelText: "취소",
        });

        if (choice.isConfirmed === false) 
            return;

        await axios.delete(`/payment/detail/${paymentDetail.paymentDetailNo}`);

        toast.success("결제 부분 취소");
        loadData();
    }, []);

    //return
    return (<>

        <div
            className="fade-jumbotron"
            style={{ animationDelay: `${0.03}s` }}
        >
            <Jumbotron subject="결제 상세 정보 조회" detail={`${paymentNo}번 거래 상세 정보 내역 조회`}></Jumbotron>
        </div>

        <div
            className="fade-label"
            style={{ animationDelay: `${0.03}s` }}
        >
            <h2 className="mt-5">결제 정보</h2>
        </div>

        <div className="row mt-4">
            <div className="col">
                {payment === null ? (
                    <h3>결제 정보 Loading</h3>
                ) : (

                    <>

                        <div
                            className="fade-item"
                            style={{ animationDelay: `${0.03}s` }}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                {/* 왼쪽 정보들 */}
                                <div style={{ flex: 1 }}>
                                    <div className="row">
                                        <div className="col-sm-3 text-primary">결제번호</div>
                                        <div className="col-sm-9 text-secondary">{payment.paymentNo}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3 text-primary">거래번호</div>
                                        <div className="col-sm-9 text-secondary">{payment.paymentTid}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3 text-primary">구매상품명</div>
                                        <div className="col-sm-9 text-secondary">{payment.paymentName}</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-3 text-primary">구매금액</div>
                                        <div className="col-sm-9 text-secondary">
                                            {numberWithComma(payment.paymentTotal)}원
                                        </div>
                                    </div>
                                </div>

                                {/* 오른쪽 cancel 버튼 */}
                                {(
                                    <div>
                                        <button className={`btn btn-outline-${payment.paymentRemain !== 0 ? "danger" : "secondary"} ms-3`} onClick={cancelAll}
                                            disabled={payment.paymentRemain === 0}>
                                            <FaXmark />
                                            <span>전체 환불</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>

                )}
            </div>
        </div>

        <hr className="my-3" />

        <div
            className="fade-label"
            style={{ animationDelay: `${0.03}s` }}
        >
            <h2>결제 상세</h2>
        </div>

        <div className="row mt-4">
            <div className="col">
                {paymentDetailList === null ? (
                    <h3>결제 상세 Loading</h3>
                ) : (

                    <>

                        {paymentDetailList.map((paymentDetail, i) => (
                            <div
                                key={i}
                                className="fade-item"
                                style={{ animationDelay: `${i * 0.03}s` }}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    {/* 왼쪽 정보들 */}
                                    <div style={{ flex: 1 }}>
                                        <div className="row">
                                            <div className="col-sm-3 text-primary">상세번호</div>
                                            <div className="col-sm-9 text-secondary">{paymentDetail.paymentDetailNo}</div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-3 text-primary">상품명</div>
                                            <div className="col-sm-9 text-secondary">{paymentDetail.paymentDetailItemName}</div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-3 text-primary">판매가격</div>
                                            <div className="col-sm-9 text-secondary">
                                                {numberWithComma(
                                                    paymentDetail.paymentDetailItemPrice * paymentDetail.paymentDetailQty
                                                )}원
                                                (
                                                {numberWithComma(paymentDetail.paymentDetailItemPrice)}원
                                                x
                                                {paymentDetail.paymentDetailQty}개
                                                )
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-3 text-primary">결제상태</div>
                                            <div className={`col-sm-9 text-${paymentDetail.paymentDetailStatus === "승인" ? "secondary" : "danger"}`}>{paymentDetail.paymentDetailStatus}</div>
                                        </div>
                                    </div>

                                    {(
                                        <div className="row">
                                            <div className="col">
                                                <button type="button" className={`btn btn-outline-${paymentDetail.paymentDetailStatus === "승인" ? "danger" : "secondary"}`}
                                                    onClick={e => cancelUnit(paymentDetail)}
                                                    disabled={paymentDetail.paymentDetailStatus !== "승인"}>
                                                    <FaXmark />
                                                    <span className="ms-2">이 아이템 환불</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>

                )}
            </div>
        </div>

        <hr className="my-3" />

        <div
            className="fade-label"
            style={{ animationDelay: `${0.03}s` }}
        >
            <h2>카카오페이 정보</h2>
        </div>

        <div className="row mt-4">
            <div className="col">
                {kakaopayInfo === null ? (
                    <h3>카카오페이 정보 Loading</h3>
                ) : (

                    <>
                        <div
                            className="fade-item"
                            style={{ animationDelay: `${0.03}s` }}
                        >

                            <div className="row">
                                <div className="col-sm-3 text-primary">거래번호</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.tid}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">가맹점코드</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.cid}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 상태</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.status}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">주문번호</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.partner_order_id}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">주문자</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.partner_user_id}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">구매 금액</div>
                                <div className="col-sm-9 text-secondary">
                                    <div className="custom-overlay d-flex align-items-center">
                                        {numberWithComma(kakaopayInfo.amount.total)}원
                                        <FaQuestionCircle className="text-primary ms-2" />
                                        <div className="custom-overlay-popup">
                                            <div className="row">
                                                <div className="col-6">비과세액</div>
                                                <div className="col-6">{numberWithComma(kakaopayInfo.amount.tax_free)}원</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-6">부가세액</div>
                                                <div className="col-6">{numberWithComma(kakaopayInfo.amount.vat)}원</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-6">포인트 사용</div>
                                                <div className="col-6">{numberWithComma(kakaopayInfo.amount.point)}원</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-6">할인 적용</div>
                                                <div className="col-6">{numberWithComma(kakaopayInfo.amount.discount)}원</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-6">컵 보증금</div>
                                                <div className="col-6">{numberWithComma(kakaopayInfo.amount.green_deposit)}원</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">취소 금액</div>
                                <div className="col-sm-9 text-secondary">
                                    {kakaopayInfo.cancel_amount !== null ? (
                                        <div className="custom-overlay d-flex align-items-center">
                                            {numberWithComma(kakaopayInfo.cancel_amount.total)}원
                                            <FaQuestionCircle className="text-primary ms-2" />
                                            <div className="custom-overlay-popup">
                                                <div className="row">
                                                    <div className="col-6">비과세액</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_amount.tax_free)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">부가세액</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_amount.vat)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">포인트 사용</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_amount.point)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">할인 적용</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_amount.discount)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">컵 보증금</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_amount.green_deposit)}원</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : "없음"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">취소 가능 금액</div>
                                <div className="col-sm-9 text-secondary">
                                    {kakaopayInfo.cancel_available_amount !== null ? (
                                        <div className="custom-overlay d-flex align-items-center">
                                            {numberWithComma(kakaopayInfo.cancel_available_amount.total)}원
                                            <FaQuestionCircle className="text-primary ms-2" />
                                            <div className="custom-overlay-popup">
                                                <div className="row">
                                                    <div className="col-6">비과세액</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_available_amount.tax_free)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">부가세액</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_available_amount.vat)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">포인트 사용</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_available_amount.point)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">할인 적용</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_available_amount.discount)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">컵 보증금</div>
                                                    <div className="col-6">{numberWithComma(kakaopayInfo.cancel_available_amount.green_deposit)}원</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : "없음"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 이름</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.item_name}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 코드</div>
                                <div className="col-sm-9 text-secondary">
                                    {kakaopayInfo.item_code || "없음"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 수량</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.quantity}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 시작시각</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.created_at}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 승인시각</div>
                                <div className="col-sm-9 text-secondary">{kakaopayInfo.approved_at}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 취소시각</div>
                                <div className="col-sm-9 text-secondary">
                                    {kakaopayInfo.canceled_at || "없음"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 카드정보</div>
                                <div className="col-sm-9 text-secondary">
                                    {kakaopayInfo.selected_card_info !== null ? (<>
                                        <div className="row">
                                            <div className="col-6">카드사</div>
                                            <div className="col-6">{kakaopayInfo.selected_card_info.card_corp_name}</div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">카드BIN</div>
                                            <div className="col-6">{kakaopayInfo.selected_card_info.bin}</div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">할부</div>
                                            <div className="col-6">
                                                {kakaopayInfo.selected_card_info.install_month > 0 ? "Y" : "N"}
                                                {kakaopayInfo.selected_card_info.install_month > 0 && (<>
                                                    (
                                                    무이자할부 : {kakaopayInfo.selected_card_info.interest_free_install},
                                                    할부기간 : {kakaopayInfo.selected_card_info.install_month}개월
                                                    )
                                                </>)}
                                            </div>
                                        </div>
                                    </>) : "없음"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-3 text-primary">결제 히스토리</div>
                                <div className="col-sm-9 text-secondary">
                                    {/* key는 애매할 경우 index를 쓸 수 있다(단, 읽기만 할 때 사용하는걸 권장) */}
                                    {kakaopayInfo.payment_action_details.map((detail, index) => (
                                        <div className="row mb-4" key={index}>
                                            <div className="col p-2 border rounded">

                                                <div className="row">
                                                    <div className="col-6">요청번호</div>
                                                    <div className="col-6">{detail.aid}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">요청시각</div>
                                                    <div className="col-6">{detail.approved_at}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">금액</div>
                                                    <div className="col-6">{numberWithComma(detail.amount)}원</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">유형</div>
                                                    <div className="col-6">{detail.payment_action_type}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-6">메모</div>
                                                    <div className="col-6">{detail.payload}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>)}
            </div>
        </div>
    </>);
}