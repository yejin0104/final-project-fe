import { useCallback, useEffect, useMemo, useState } from "react";
// import "./KakaoPay.css"; // CSS 파일 의존성 제거
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { numberWithComma } from "../../utils/format";
import { useAtomValue } from "jotai";
import { loginCompleteState } from "../../utils/jotai";
import { FaMinus, FaPlus, FaCheck } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";

// 색상 팔레트
const PALETTE = {
    primary: "#4e9f86",
    bg: "#f8f9fa",
    border: "#eaeaea",
    cardBg: "#ffffff",
    textPrimary: "#333",
    textSecondary: "#666",
    selectedBorder: "#4e9f86",
    selectedBg: "#effbf8"
};

export default function KakaoPay() {

    const loginComplete = useAtomValue(loginCompleteState);
    const navigate = useNavigate();

    // 화면 크기 감지
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isMobile = width < 768;

    // 상태
    const [shopList, setShopList] = useState([]);
    
    // 데이터 로드
    useEffect(() => {
        if (loginComplete) {
            loadData();
        }
    }, [loginComplete]);

    const loadData = useCallback(async () => {
        try {
            const { data } = await axios.get("/shop/");
            setShopList(
                data.map(item => ({
                    ...item,
                    check: false,
                    qty: 1
                }))
            );
        } catch (e) {
            console.error("상품 목록 로드 실패", e);
        }
    }, []);

    // 체크 로직
    const toggleCheck = useCallback((shopNo) => {
        setShopList(prev => 
            prev.map(shop => 
                shop.shopNo === shopNo ? { ...shop, check: !shop.check } : shop
            )
        );
    }, []);

    // 수량 변경 로직 (버튼식)
    const updateQty = useCallback((shopNo, delta) => {
        setShopList(prev => 
            prev.map(shop => {
                if (shop.shopNo !== shopNo) return shop;
                const newQty = Math.max(1, shop.qty + delta);
                return { ...shop, qty: newQty, check: true }; // 수량 변경 시 자동 체크
            })
        );
    }, []);

    // 계산
    const checkedShopList = useMemo(() => shopList.filter(shop => shop.check), [shopList]);
    const checkedTotal = useMemo(() => 
        checkedShopList.reduce((sum, shop) => sum + shop.shopPrice * shop.qty, 0), 
        [checkedShopList]
    );

    // 결제
    const purchase = useCallback(async () => {
        if (checkedShopList.length === 0) return;
        
        try {
            const payload = checkedShopList.map(shop => ({
                no: shop.shopNo,
                qty: shop.qty
            }));
            const { data } = await axios.post("/kakaopay/buy", payload);
            // PC/Mobile 환경에 따라 리다이렉트 URL 분기 가능하나 여기선 PC URL 사용
            // 모바일이면 data.next_redirect_mobile_url 사용 고려
            const redirectUrl = isMobile && data.next_redirect_mobile_url ? data.next_redirect_mobile_url : data.next_redirect_pc_url;
            window.location.href = redirectUrl; // 외부 링크 이동은 window.location이 확실함
        } catch (e) {
            console.error("결제 준비 실패", e);
            alert("결제 준비 중 오류가 발생했습니다.");
        }
    }, [checkedShopList, isMobile]);

    return (
        <div className="w-100 fade-item pb-5">
            {/* 1. 헤더 영역 */}
            <div className="text-center mb-5 pt-4">
                <h3 className="fw-bold mb-2" style={{ color: PALETTE.textPrimary }}>
                    멤버십 상품 구매
                </h3>
                <p style={{ color: PALETTE.textSecondary }}>
                    일정 생성 제한을 늘리고 더 자유롭게 여행을 계획해보세요.
                </p>
            </div>

            {/* 2. 상품 목록 영역 */}
            <div className="container" style={{ maxWidth: "1000px" }}>
                <div className="row g-4 justify-content-center">
                    {shopList.map((shop) => (
                        <div key={shop.shopNo} className="col-12 col-md-6 col-lg-4">
                            <div 
                                className="card h-100 border-0 shadow-sm position-relative overflow-hidden"
                                style={{ 
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    border: shop.check ? `2px solid ${PALETTE.selectedBorder}` : "2px solid transparent",
                                    backgroundColor: shop.check ? PALETTE.selectedBg : PALETTE.cardBg,
                                    transform: shop.check ? "translateY(-4px)" : "none"
                                }}
                                onClick={() => toggleCheck(shop.shopNo)}
                            >
                                {/* 체크 표시 배지 */}
                                {shop.check && (
                                    <div className="position-absolute top-0 end-0 p-3">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{ width: "24px", height: "24px", backgroundColor: PALETTE.primary, color: "white" }}>
                                            <FaCheck size={12} />
                                        </div>
                                    </div>
                                )}

                                <div className="card-body p-4 d-flex flex-column align-items-center text-center">
                                    <div className="mb-3 p-3 rounded-circle" style={{ backgroundColor: "#e6f4f1" }}>
                                        <FaCartShopping size={24} color={PALETTE.primary} />
                                    </div>
                                    
                                    <h5 className="fw-bold mb-2" style={{ color: "#333" }}>{shop.shopName}</h5>
                                    <p className="text-muted small mb-3">{shop.shopDesc || "일정 생성 개수가 증가합니다."}</p>
                                    
                                    <h4 className="fw-bold mb-4" style={{ color: PALETTE.primary }}>
                                        {numberWithComma(shop.shopPrice)}원
                                    </h4>

                                    {/* 수량 조절 스텝퍼 */}
                                    <div 
                                        className="d-flex align-items-center justify-content-between rounded-pill px-2 py-1 mt-auto"
                                        style={{ backgroundColor: "white", border: `1px solid ${PALETTE.border}`, width: "140px" }}
                                        onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 전파 방지
                                    >
                                        <button 
                                            className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: "32px", height: "32px", color: "#888" }}
                                            onClick={() => updateQty(shop.shopNo, -1)}
                                            disabled={shop.qty <= 1}
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span className="fw-bold" style={{ color: "#333" }}>{shop.qty}</span>
                                        <button 
                                            className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: "32px", height: "32px", color: "#888" }}
                                            onClick={() => updateQty(shop.shopNo, 1)}
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. 하단 결제 바 (Bottom Bar) */}
            <div 
                className="fixed-bottom bg-white border-top py-3 px-4 shadow-lg"
                style={{ 
                    zIndex: 1000,
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px"
                }}
            >
                <div className="container" style={{ maxWidth: "1000px" }}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex flex-column">
                            <span style={{ fontSize: "0.9rem", color: "#888" }}>
                                총 {checkedShopList.length}개 선택
                            </span>
                            <span className="h4 fw-bold m-0" style={{ color: PALETTE.primary }}>
                                {numberWithComma(checkedTotal)}원
                            </span>
                        </div>
                        <button 
                            className="btn btn-lg text-white px-5 rounded-pill"
                            style={{ 
                                backgroundColor: checkedShopList.length > 0 ? "#FFEB00" : "#ccc", // 카카오페이 노란색
                                color: checkedShopList.length > 0 ? "#3C1E1E" : "#fff",
                                fontWeight: "bold",
                                border: "none",
                                transition: "all 0.2s"
                            }}
                            onClick={purchase}
                            disabled={checkedShopList.length === 0}
                        >
                            <span style={{ color: checkedShopList.length > 0 ? "#3C1E1E" : "white" }}>
                                {isMobile ? "결제하기" : "카카오페이 결제"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* 하단 바 공간 확보용 여백 */}
            <div style={{ height: "100px" }} className="pb-4"></div>
        </div>
    );
}