import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
// import "./AccountPay.css"; // 스타일을 인라인/Bootstrap으로 대체하여 의존성 제거
import { FaQuestionCircle, FaArrowLeft, FaMoneyBillWave, FaList, FaInfoCircle, FaCreditCard, FaHistory } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { numberWithComma } from "../../utils/format";
import { confirm } from "../../utils/confirm";
import { useAtomValue } from "jotai";
import { loginCompleteState } from "../../utils/jotai";
import { formatDateTime } from "../../utils/dateFormat";

// 색상 팔레트 정의
const PALETTE = {
    primary: "#4e9f86",
    bg: "#f8f9fa",
    border: "#eaeaea",
    textPrimary: "#333",
    textSecondary: "#666",
    textLabel: "#888",
    danger: "#e03131",
    dangerBg: "#fff5f5",
    cardShadow: "0 2px 12px rgba(0,0,0,0.03)"
};

export default function AccountPayDetail() {
    const { paymentNo } = useParams();
    const navigate = useNavigate();

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
        try {
            const { data } = await axios.get(`/payment/${paymentNo}`);
            const { paymentDto, paymentDetailList, responseVO } = data;
            setPayment(paymentDto);
            setPaymentDetailList(paymentDetailList);
            setKakaopayInfo(responseVO);
        } catch (e) {
            console.error(e);
            toast.error("결제 정보를 불러오는데 실패했습니다.");
        }
    }, [paymentNo]);

    const cancelAll = useCallback(async () => {
        const choice = await confirm({
            title: "전체 환불하시겠습니까?",
            text: "이 작업은 되돌릴 수 없습니다.",
            icon: "warning",
            confirmColor: PALETTE.danger,
            confirmText: "전체 환불",
            cancelText: "취소",
        });

        if (choice.isConfirmed === false) return;

        try {
            await axios.delete(`/payment/${paymentNo}`);
            toast.success("결제가 전체 취소되었습니다.");
            loadData();
        } catch (e) {
            toast.error("환불 처리에 실패했습니다.");
        }
    }, [paymentNo, loadData]);

    const cancelUnit = useCallback(async (paymentDetail) => {
        const choice = await confirm({
            title: "선택한 상품을 환불하시겠습니까?",
            text: "부분 환불은 되돌릴 수 없습니다.",
            icon: "warning",
            confirmColor: PALETTE.danger,
            confirmText: "환불하기",
            cancelText: "취소",
        });

        if (choice.isConfirmed === false) return;

        try {
            await axios.delete(`/payment/detail/${paymentDetail.paymentDetailNo}`);
            toast.success("부분 환불이 완료되었습니다.");
            loadData();
        } catch (e) {
            toast.error("환불 처리에 실패했습니다.");
        }
    }, [loadData]);

    const location = useLocation();
    const { isRefund } = location.state || {};

    const paymentStatus = useCallback(status => {
        const map = {
            "READY": "결제 요청",
            "SEND_TMS": "메시지 발송",
            "OPEN_PAYMENT": "결제창 진입",
            "SELECT_METHOD": "인증 완료",
            "ARS_WAITING": "ARS 인증 중",
            "AUTH_PASSWORD": "비밀번호 인증",
            "ISSUED_SID": "SID 발급",
            "SUCCESS_PAYMENT": "결제 완료",
            "PART_CANCEL_PAYMENT": "부분 취소",
            "CANCEL_PAYMENT": "결제 취소",
            "FAIL_AUTH_PASSWORD": "인증 실패",
            "QUIT_PAYMENT": "결제 중단",
            "FAIL_PAYMENT": "승인 실패"
        };
        return map[status] || "결제 완료";
    }, []);

    const paymentType = useCallback(type => {
        if (type === "PAYMENT") return "결제";
        if (type === "ISSUED_SID") return "SID 발급";
        return "취소";
    }, []);

    // 공통 정보 행 컴포넌트
    const InfoRow = ({ label, value, isPrice = false, children }) => (
        <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: "#f1f1f1" }}>
            <span style={{ color: PALETTE.textLabel, fontSize: "0.9rem" }}>{label}</span>
            <div className="text-end" style={{ color: PALETTE.textPrimary, fontWeight: "500" }}>
                {children ? children : (
                    <span>{isPrice ? `${numberWithComma(value)}원` : value}</span>
                )}
            </div>
        </div>
    );

    // 섹션 헤더 컴포넌트
    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="d-flex align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: PALETTE.border }}>
            <Icon className="me-2" style={{ color: PALETTE.primary }} />
            <h5 className="m-0 fw-bold" style={{ color: "#444" }}>{title}</h5>
        </div>
    );

    if (payment === null || kakaopayInfo === null) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <div className="spinner-border text-secondary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="w-100 fade-item">
            {/* 1. 상단 네비게이션 & 타이틀 */}
            <div className="mb-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-link p-0 text-decoration-none mb-2 d-flex align-items-center"
                    style={{ color: "#888" }}
                >
                    <FaArrowLeft className="me-2" /> 목록으로 돌아가기
                </button>
                <h3 className="fw-bold" style={{ color: "#333" }}>결제 상세 내역</h3>
                <p style={{ color: "#999" }}>주문번호 {payment.paymentTid}의 상세 내역입니다.</p>
            </div>

            <div className="row g-4">
                {/* 왼쪽 컬럼: 결제 요약 정보 & 상품 목록 */}
                <div className="col-lg-7">
                    
                    {/* 카드 1: 결제 요약 */}
                    <div className="bg-white p-4 rounded-4 mb-4" style={{ boxShadow: PALETTE.cardShadow, border: `1px solid ${PALETTE.border}` }}>
                        <SectionHeader icon={FaMoneyBillWave} title="결제 요약 정보" />
                        
                        <div className="py-3 text-center mb-3 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                            <span className="d-block text-secondary mb-1" style={{ fontSize: "0.9rem" }}>총 결제 금액</span>
                            <span className="h3 fw-bold" style={{ color: PALETTE.primary }}>
                                {numberWithComma(payment.paymentTotal)}원
                            </span>
                        </div>

                        <InfoRow label="결제 번호" value={payment.paymentNo} />
                        <InfoRow label="거래 일시" value={formatDateTime(payment.paymentTime)} />
                        <InfoRow label="대표 상품명" value={payment.paymentName} />
                        <InfoRow label="결제 상태">
                            <span className={`badge rounded-pill ${payment.paymentRemain === 0 ? 'bg-danger' : 'bg-secondary'}`} 
                                  style={{ fontWeight: "normal", padding: "6px 10px" }}>
                                {payment.paymentRemain === 0 ? "전체 취소됨" : (payment.paymentRemain < payment.paymentTotal ? "부분 취소됨" : "결제 완료")}
                            </span>
                        </InfoRow>

                        {/* 전체 환불 버튼 */}
                        <div className="mt-4 pt-3 border-top text-end">
                            <button 
                                className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                                style={{ 
                                    backgroundColor: PALETTE.dangerBg, 
                                    color: PALETTE.danger, 
                                    border: "1px solid #ffc9c9",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontWeight: "600"
                                }}
                                onClick={cancelAll}
                                disabled={!isRefund || payment.paymentRemain === 0}
                            >
                                <FaXmark className="me-2" /> 전체 결제 취소
                            </button>
                        </div>
                    </div>

                    {/* 카드 2: 구매 상품 목록 */}
                    <div className="bg-white p-4 rounded-4" style={{ boxShadow: PALETTE.cardShadow, border: `1px solid ${PALETTE.border}` }}>
                        <SectionHeader icon={FaList} title="구매 상품 목록" />
                        
                        <div className="d-flex flex-column gap-3">
                            {paymentDetailList && paymentDetailList.map((detail, i) => (
                                <div key={i} className="p-3 rounded-3 border d-flex flex-column flex-sm-row align-items-sm-center justify-content-between" 
                                     style={{ borderColor: "#eee" }}>
                                    
                                    <div className="mb-2 mb-sm-0">
                                        <div className="fw-bold mb-1" style={{ color: "#444" }}>
                                            {detail.paymentDetailItemName}
                                        </div>
                                        <div style={{ fontSize: "0.85rem", color: "#888" }}>
                                            {numberWithComma(detail.paymentDetailItemPrice)}원 × {detail.paymentDetailQty}개
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <div className="fw-bold mb-2" style={{ color: PALETTE.primary }}>
                                            {numberWithComma(detail.paymentDetailItemPrice * detail.paymentDetailQty)}원
                                        </div>
                                        {detail.paymentDetailStatus === "승인" ? (
                                            <button 
                                                className="btn btn-outline-secondary btn-sm" 
                                                style={{ fontSize: "0.75rem", borderRadius: "20px" }}
                                                onClick={() => cancelUnit(detail)}
                                                disabled={!isRefund}
                                            >
                                                부분 취소
                                            </button>
                                        ) : (
                                            <span className="badge bg-danger" style={{ fontWeight: "normal" }}>취소 완료</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 오른쪽 컬럼: 카카오페이 상세 정보 */}
                <div className="col-lg-5">
                    <div className="bg-white p-4 rounded-4 h-100" style={{ boxShadow: PALETTE.cardShadow, border: `1px solid ${PALETTE.border}` }}>
                        <SectionHeader icon={FaInfoCircle} title="카카오페이 상세 정보" />

                        <div className="mb-4">
                            <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: "0.85rem" }}>기본 정보</h6>
                            <InfoRow label="가맹점 코드" value={kakaopayInfo.cid} />
                            <InfoRow label="상태" value={paymentStatus(kakaopayInfo.status)} />
                            <InfoRow label="승인 시각" value={formatDateTime(kakaopayInfo.approved_at)} />
                            {kakaopayInfo.canceled_at && (
                                <InfoRow label="취소 시각" value={formatDateTime(kakaopayInfo.canceled_at)} />
                            )}
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: "0.85rem" }}>금액 상세</h6>
                            {/* 툴팁/오버레이 대신 깔끔한 리스트로 표현 */}
                            <div className="p-3 rounded-3" style={{ backgroundColor: "#fafafa" }}>
                                <InfoRow label="공급가액" value={kakaopayInfo.amount.tax_free} isPrice />
                                <InfoRow label="부가세" value={kakaopayInfo.amount.vat} isPrice />
                                <InfoRow label="포인트 사용" value={kakaopayInfo.amount.point} isPrice />
                                <InfoRow label="할인 금액" value={kakaopayInfo.amount.discount} isPrice />
                            </div>
                        </div>

                        {kakaopayInfo.selected_card_info && (
                            <div className="mb-4">
                                <SectionHeader icon={FaCreditCard} title="결제 카드 정보" />
                                <InfoRow label="카드사" value={kakaopayInfo.selected_card_info.card_corp_name} />
                                <InfoRow label="할부" value={kakaopayInfo.selected_card_info.install_month > 0 ? `${kakaopayInfo.selected_card_info.install_month}개월` : "일시불"} />
                                {kakaopayInfo.selected_card_info.interest_free_install === "Y" && (
                                    <div className="text-end mt-1"><span className="badge bg-info text-dark">무이자 할부 적용</span></div>
                                )}
                            </div>
                        )}

                        <div>
                            <SectionHeader icon={FaHistory} title="결제/취소 이력" />
                            <div className="d-flex flex-column gap-2 mt-3">
                                {kakaopayInfo.payment_action_details.map((detail, index) => (
                                    <div key={index} className="p-3 border rounded-3 bg-white" style={{ borderColor: "#f0f0f0" }}>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="fw-bold" style={{ fontSize: "0.9rem", color: detail.amount < 0 ? PALETTE.danger : PALETTE.primary }}>
                                                {paymentType(detail.payment_action_type)}
                                            </span>
                                            <span style={{ fontSize: "0.8rem", color: "#888" }}>{formatDateTime(detail.approved_at)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span style={{ fontSize: "0.85rem", color: "#666" }}>요청번호: {detail.aid.substring(0, 10)}...</span>
                                            <span className="fw-bold" style={{ fontSize: "0.9rem" }}>{numberWithComma(detail.amount)}원</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}