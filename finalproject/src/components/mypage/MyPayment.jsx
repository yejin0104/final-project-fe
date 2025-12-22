import { useOutletContext } from "react-router-dom";
import "../account/AccountPay.css";
import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react"
import { FaArrowRight, FaRegCreditCard, FaReceipt } from "react-icons/fa6"; // 아이콘 추가
import { Link } from "react-router-dom";
import "../kakaopay/KakaoPay.css";
import { numberWithComma } from "../../utils/format";
import { formatDateTime } from "../../utils/dateFormat";
import { useAtomValue } from "jotai";
import { loginCompleteState } from "../../utils/jotai";
import { throttle } from "lodash";

// 색상 팔레트 (MyPage와 통일)
const PALETTE = {
    primary: "#4e9f86",      // 메인 민트
    bg: "#f8f9fa",           // 배경 회색
    cardBg: "#ffffff",       // 카드 배경
    border: "#eaeaea",       // 테두리
    textPrimary: "#333333",  // 진한 글자
    textSecondary: "#888888",// 연한 글자
    danger: "#e03131",       // 취소/위험
    successBg: "#effbf8",    // 성공 배경 (연한 민트)
    successText: "#4e9f86",  // 성공 글자
    dangerBg: "#fff5f5",     // 취소 배경 (연한 빨강)
};

export default function MyPayment() {
    
    const [paymentList, setPaymentList] = useState([]);
    const loginComplete = useAtomValue(loginCompleteState);

    // 페이징 작업
    const [page, setPage] = useState(1);
    const [info, setInfo] = useState({
        page: 0, size: 0, begin: 0, end: 0, count: 0, last: true
    });

    const loading = useRef(false);

    useEffect(() => {
        if (loginComplete === true) {
            loadData();
        }
    }, [loginComplete, page]);

    const loadData = useCallback(async () => {
        loading.current = true;
        try {
            const response = await axios.get(`/payment/page/${page}`);
            if (page === 1) {
                setPaymentList(response.data.list);
            } else {
                setPaymentList(prev => ([...prev, ...response.data.list]));
            }
            const { list, ...others } = response.data;
            setInfo(others);
        } catch (e) {
            console.error(e);
        }
        loading.current = false;
    }, [page]);

    useEffect(() => {
        const listener = throttle(e => {
            const percent = getScrollPercent();
            if (percent === 100 && loading.current === false && !info.last) {
                setPage(prev => prev + 1);
            }
        }, 500);

        window.addEventListener("scroll", listener);
        return () => {
            window.removeEventListener("scroll", listener);
        };
    }, [info.last]);

    const getScrollPercent = useCallback(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollHeight <= clientHeight) return 0;
        const scrollableHeight = scrollHeight - clientHeight;
        if (scrollableHeight - scrollTop < 1) return 100;

        return (scrollTop / scrollableHeight) * 100;
    }, []);

    const calculateStatus = useCallback(payment => {
        const { paymentTotal, paymentRemain } = payment;
        if (paymentTotal === paymentRemain) return "결제 완료";
        if (paymentRemain === 0) return "전체 취소";
        return "부분 취소";
    }, []);

    const checkPaymentRefund = useCallback((paymentTime) => {
        const base = new Date(paymentTime).getTime();
        const after3Days = base + 3 * 24 * 60 * 60 * 1000;
        return Date.now() >= after3Days;
    }, []);

    // 상태별 뱃지 스타일 반환 함수
    const getStatusStyle = (status) => {
        if (status === "결제 완료") return { bg: PALETTE.successBg, color: PALETTE.successText };
        if (status === "전체 취소") return { bg: PALETTE.dangerBg, color: PALETTE.danger };
        return { bg: "#fff9db", color: "#f08c00" }; // 부분취소 등 (노랑/주황)
    };

    return (
        <div className="w-100">
            {/* 1. 헤더 영역 (심플하게 변경) */}
            <div className="mb-5 pb-3 border-bottom" style={{ borderColor: PALETTE.border }}>
                <h4 className="fw-bold mb-2" style={{ color: PALETTE.textPrimary }}>
                    결제 내역 조회
                </h4>
                <p className="m-0" style={{ fontSize: "0.95rem", color: PALETTE.textSecondary }}>
                    지난 30일간의 결제 내역을 확인하실 수 있습니다.
                </p>
            </div>

            {/* 2. 리스트 영역 */}
            <div className="d-flex flex-column gap-3">
                {paymentList === null ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-secondary" role="status"></div>
                    </div>
                ) : paymentList.length === 0 ? (
                    <div className="text-center py-5 rounded-4" style={{ backgroundColor: "#f9f9f9" }}>
                        <FaRegCreditCard size={40} color="#ddd" className="mb-3" />
                        <p className="text-secondary">결제 내역이 없습니다.</p>
                    </div>
                ) : (
                    paymentList.map((payment, i) => {
                        const status = calculateStatus(payment);
                        const statusStyle = getStatusStyle(status);

                        return (
                            <div
                                key={i}
                                className="bg-white p-4 rounded-4 position-relative fade-item"
                                style={{
                                    border: `1px solid ${PALETTE.border}`,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    animationDelay: `${i * 0.05}s`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.06)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
                                }}
                            >
                                {/* 상단: 날짜 및 상태 뱃지 */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span style={{ fontSize: "0.85rem", color: "#999" }}>
                                        {formatDateTime(payment.paymentTime)}
                                    </span>
                                    <span 
                                        className="px-2 py-1 rounded-3 fw-bold"
                                        style={{ 
                                            fontSize: "0.75rem", 
                                            backgroundColor: statusStyle.bg, 
                                            color: statusStyle.color 
                                        }}
                                    >
                                        {status}
                                    </span>
                                </div>

                                {/* 중단: 상품명 및 가격 */}
                                <div className="d-flex justify-content-between align-items-end mb-3">
                                    <div>
                                        <h5 className="fw-bold mb-1" style={{ color: PALETTE.textPrimary }}>
                                            {payment.paymentName}
                                        </h5>
                                        <div style={{ fontSize: "0.85rem", color: "#aaa" }}>
                                            TID: {payment.paymentTid}
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <span className="h5 fw-bold" style={{ color: PALETTE.primary }}>
                                            {numberWithComma(payment.paymentTotal)}
                                        </span>
                                        <span style={{ fontSize: "0.9rem", color: PALETTE.textPrimary }}> 원</span>
                                    </div>
                                </div>

                                {/* 하단: 구분선 및 버튼 */}
                                <div className="pt-3 border-top d-flex justify-content-end" style={{ borderColor: "#f1f1f1" }}>
                                    <Link
                                        to={`/kakaopay/pay/detail/${payment.paymentNo}`}
                                        state={{ isRefund: !checkPaymentRefund(payment.paymentTime) }}
                                        className="btn btn-sm d-flex align-items-center gap-2"
                                        style={{
                                            backgroundColor: "white",
                                            border: `1px solid ${PALETTE.primary}`,
                                            color: PALETTE.primary,
                                            borderRadius: "20px",
                                            padding: "6px 16px",
                                            fontSize: "0.85rem",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = PALETTE.primary;
                                            e.currentTarget.style.color = "white";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "white";
                                            e.currentTarget.style.color = PALETTE.primary;
                                        }}
                                    >
                                        <FaReceipt size={14} /> 
                                        상세 내역 보기 
                                        <FaArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}