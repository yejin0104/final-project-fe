import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./AccountPay.css";
import { FaQuestionCircle } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import Jumbotron from "../templates/Jumbotron";
import { numberWithComma } from "../../utils/format";
import { confirm } from "../../utils/confirm";
import { useAtomValue } from "jotai";
import { loginCompleteState } from "../../utils/jotai";
import { formatDateTime } from "../../utils/dateFormat";

export default function AccountPayDetail() {
    const { paymentNo } = useParams();

    const [payment, setPayment] = useState(null);
    const [paymentDetailList, setPaymentDetailList] = useState(null);
    const [kakaopayInfo, setKakaopayInfo] = useState(null);
    const loginComplete = useAtomValue(loginCompleteState);

    useEffect(() => {
        if (loginComplete === true) {
            loadData();
        }
    }, [loginComplete]);

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

    // 환불 가능 여부는 payment_detail은 모르고 payment만 아니 부모가 환불 여부를 결정해준다
    const location = useLocation();
    const { isRefund } = location.state || {};

    // 카카오페이 공식 문서에 이 의외의 경우는 없다
    const paymentStatus = useCallback(status => {
        if (status === "READY") return "결제 요청";
        if (status === "SEND_TMS") return "결제 요청 메시지(TMS) 발송 완료";
        if (status === "OPEN_PAYMENT") return "사용자가 카카오페이 결제 화면 진입";
        if (status === "SELECT_METHOD") return "결제 수단 선택, 인증 완료";
        if (status === "ARS_WAITING") return "ARS 인증 진행 중";
        if (status === "AUTH_PASSWORD") return "비밀번호 인증 완료";
        if (status === "ISSUED_SID") return "SID 발급 완료";
        //if (status === "SUCCESS_PAYMENT") return "결제 완료";
        if (status === "PART_CANCEL_PAYMENT") return "부분 취소";
        if (status === "CANCEL_PAYMENT") return "결제 취소";
        if (status === "FAIL_AUTH_PASSWORD") return "사용자 비밀번호 인증 실패";
        if (status === "QUIT_PAYMENT") return "사용자가 결제 중단";
        if (status === "FAIL_PAYMENT") return "결제 승인 실패";

        return "결제 완료";
    }, []);
    // 카카오페이 공식 문서에 이 의외의 경우는 없다
    const paymentType = useCallback(type => {
        if (type === "PAYMENT")
            return "결제";
        if (type === "ISSUED_SID")
            return "SID 발급";
        return "취소";
    }, []);

    //return
    return (<>

        <div
            className="fade-jumbotron"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="row">
                <div className="col">
                    <h3 className="text-center">카카오페이 결제내역 상세조회</h3>
                    <p className="text-center text-desc">
                        카카오페이에서 결제내역을 상세하게 알아봅시다.
                    </p>
                </div>
            </div>
        </div>


        <div
            className="fade-item"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="d-flex align-items-center">
                {payment === null ? (

                    <div className="fw-bold" style={{ width: 220 }}>
                        결제 정보 Loading...
                    </div>

                ) : (

                    <>
                        <div className="d-flex flex-column w-100">

                            <div
                                className="fade-item w-100 mb-1"
                                style={{ animationDelay: `${0.03}s` }}
                            >
                                <div className="p-4 shadow rounded d-flex align-items-start w-100">

                                    {/* 상품명 영역 */}
                                    <div className="fw-bold me-3" style={{ width: 220 }}>
                                        결제 정보
                                    </div>

                                    {/* 중간 정보 + 버튼을 가로로 묶는 핵심 영역 */}
                                    <div className="d-flex align-items-center flex-grow-1">

                                        {/* 텍스트 3줄 영역 (가로폭 크게) */}
                                        <div className="d-flex flex-column gap-1 flex-grow-1">
                                            <div className="row">
                                                <div className="col-sm-4 text-primary">결제번호</div>
                                                <div className="col-sm-8 text-secondary">{payment.paymentNo}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-4 text-primary">거래번호</div>
                                                <div className="col-sm-8 text-secondary">{payment.paymentTid}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-4 text-primary">구매상품명</div>
                                                <div className="col-sm-8 text-secondary">{payment.paymentName}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-4 text-primary">구매금액</div>
                                                <div className="col-sm-8 text-secondary">
                                                    {numberWithComma(payment.paymentTotal)}원
                                                </div>
                                            </div>
                                        </div>

                                        {/* 환불 버튼 – 오른쪽 벽 고정 */}
                                        <div className="ms-auto d-flex justify-content-end" style={{ width: 250 }}>
                                            <button className={`btn btn-outline-${payment.paymentRemain !== 0 ? "danger" : "secondary"} ms-3`} onClick={cancelAll}
                                                disabled={isRefund === false || payment.paymentRemain === 0}>
                                                <FaXmark />
                                                <span>전체 환불</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>

                )}
            </div>
        </div>

        <hr className="my-3" />

        <div
            className="fade-item"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="d-flex align-items-center">
                {paymentDetailList === null ? (

                    <div className="fw-bold" style={{ width: 220 }}>
                        결제 상세 Loading...
                    </div>

                ) : (

                    <>
                        <div className="d-flex flex-column w-100">
                            {paymentDetailList.map((paymentDetail, i) => (

                                <div
                                    key={i}
                                    className="fade-item w-100 mb-1"
                                    style={{ animationDelay: `${i * 0.03}s` }}
                                >
                                    <div className="p-4 shadow rounded d-flex align-items-start w-100">

                                        {/* 상품명 영역 */}
                                        <div className="fw-bold me-3" style={{ width: 220 }}>
                                            {paymentDetail.paymentDetailItemName}
                                        </div>

                                        {/* 중간 정보 + 버튼을 가로로 묶는 핵심 영역 */}
                                        <div className="d-flex align-items-center flex-grow-1">

                                            {/* 텍스트 3줄 영역 (가로폭 크게) */}
                                            <div className="d-flex flex-column gap-1 flex-grow-1">
                                                <div className="row">
                                                    <div className="col-sm-4 text-primary">상세번호</div>
                                                    <div className="col-sm-8 text-secondary">
                                                        {paymentDetail.paymentDetailNo}
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-sm-4 text-primary">판매가격</div>
                                                    <div className="col-sm-8 text-secondary">
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
                                                    <div className="col-sm-4 text-primary">결제상태</div>
                                                    <div className={`col-sm-8 text-${paymentDetail.paymentDetailStatus === "승인" ? "secondary" : "danger"}`}>
                                                        {paymentDetail.paymentDetailStatus}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 환불 버튼 – 오른쪽 벽 고정 */}
                                            <div className="ms-auto d-flex justify-content-end" style={{ width: 250 }}>
                                                <button type="button" className={`btn btn-outline-${paymentDetail.paymentDetailStatus === "승인" ? "danger" : "secondary"}`}
                                                    onClick={e => cancelUnit(paymentDetail)} disabled={isRefund === false || paymentDetail.paymentDetailStatus !== "승인"}
                                                >
                                                    <FaXmark />
                                                    <span className="ms-2">이 아이템 환불</span>
                                                </button>
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

        <hr className="my-3" />

        <div
            className="fade-item"
            style={{ animationDelay: `${0.03}s` }}
        >
            <div className="d-flex align-items-center">
                {kakaopayInfo === null ? (

                    <div className="fw-bold" style={{ width: 220 }}>
                        카카오페이 정보 Loadin
                        g...
                    </div>

                ) : (

                    <>
                        <div className="d-flex flex-column w-100">

                            <div
                                className="fade-item w-100 mb-1"
                                style={{ animationDelay: `${0.03}s` }}
                            >
                                <div className="p-4 shadow rounded d-flex align-items-start w-100">

                                    {/* 상품명 영역 */}
                                    <div className="fw-bold me-3" style={{ width: 220 }}>
                                        카카오페이 정보
                                    </div>

                                    {/* 중간 정보 + 버튼을 가로로 묶는 핵심 영역 */}
                                    <div className="d-flex align-items-center flex-grow-1">

                                        {/* 텍스트 3줄 영역 (가로폭 크게) */}
                                        <div className="d-flex flex-column gap-1 flex-grow-1">
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
                                                <div className="col-sm-9 text-secondary">{paymentStatus(kakaopayInfo.status)}</div>
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
                                                        <span className="">
                                                            {numberWithComma(kakaopayInfo.amount.total)}원
                                                        </span>
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
                                                            <span className="">
                                                                {numberWithComma(kakaopayInfo.amount.total)}원
                                                            </span>
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
                                                <div className="col-sm-9 text-secondary">{formatDateTime(kakaopayInfo.created_at)}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-3 text-primary">결제 승인시각</div>
                                                <div className="col-sm-9 text-secondary">{formatDateTime(kakaopayInfo.approved_at)}</div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-3 text-primary">결제 취소시각</div>
                                                <div className="col-sm-9 text-secondary">
                                                    {(kakaopayInfo.canceled_at !== null) ? formatDateTime(kakaopayInfo.canceled_at) : "없음"}
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
                                                                    <div className="col-6">{formatDateTime(detail.approved_at)}</div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-6">금액</div>
                                                                    <div className="col-6">{numberWithComma(detail.amount)}원</div>
                                                                </div>
                                                                <div className="row">
                                                                    <div className="col-6">유형</div>
                                                                    <div className="col-6">{paymentType(detail.payment_action_type)}</div>
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

                                        {/* 환불 버튼 – 오른쪽 벽 고정 */}
                                        <div className="ms-auto d-flex justify-content-end" style={{ width: 250 }}>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>

                )}
            </div>
        </div>
    </>);
}