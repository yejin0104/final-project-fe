import { Link, Outlet, useLocation } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";
import { 
    FaUserShield, 
    FaChartLine, 
    FaCreditCard, 
    FaMapMarkedAlt, 
    FaHeadset 
} from "react-icons/fa";

export default function AdminHome() {
    const location = useLocation();

    // 디자인 테마 설정
    const theme = {
        primary: "#86C9BB",
        background: "#f8f9fa",
        white: "#ffffff",
        text: "#333333",
        muted: "#888888",
        radius: "16px",
        shadow: "0 4px 12px rgba(0,0,0,0.05)"
    };

    // 관리자 메뉴 구성 (추가된 기능들 포함)
    const menus = [
        { name: "계정 대시보드", path: "/admin/dashboard", icon: <FaChartLine /> },
        { name: "계정 상세검색", path: "/admin/search", icon: <FaUserShield /> },
        { name: "결제 현황", path: "/admin/payments", icon: <FaCreditCard /> },
        { name: "전체 일정 관리", path: "/admin/schedules", icon: <FaMapMarkedAlt /> },
        { name: "상담사 관리", path: "/admin/counselors", icon: <FaHeadset /> },
    ];

    return (
        <div style={{ 
            backgroundColor: theme.background, 
            minHeight: "100vh", 
            padding: "20px",
            fontFamily: "'Pretendard', sans-serif" 
        }}>
            {/* 상단 헤더 영역 */}
            <Jumbotron 
                subject="Admin Center" 
                detail="트립플래너 플랫폼의 통합 관리 시스템입니다." 
            />

            {/* 네비게이션 메뉴 바 (이미지 상단 탭 스타일) */}
            <div style={{
                display: "flex",
                gap: "12px",
                padding: "10px",
                backgroundColor: theme.white,
                borderRadius: theme.radius,
                boxShadow: theme.shadow,
                marginBottom: "30px",
                overflowX: "auto",
                whiteSpace: "nowrap",
                msOverflowStyle: "none", // IE
                scrollbarWidth: "none", // Firefox
            }}>
                {menus.map((menu) => {
                    const isActive = location.pathname === menu.path;
                    return (
                        <Link 
                            key={menu.path} 
                            to={menu.path} 
                            style={{ textDecoration: "none", flexShrink: 0 }}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                backgroundColor: isActive ? `${theme.primary}15` : "transparent",
                                color: isActive ? theme.primary : theme.muted,
                                fontWeight: isActive ? "bold" : "500",
                                transition: "all 0.2s ease",
                                border: isActive ? `1px solid ${theme.primary}` : "1px solid transparent"
                            }}>
                                <span style={{ fontSize: "1.1rem" }}>{menu.icon}</span>
                                <span>{menu.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* 중첩 라우팅 컨텐츠 표시 영역 (Outlet) */}
            <div style={{
                animation: "fadeIn 0.4s ease-out"
            }}>
                {/* 아무 메뉴도 선택하지 않았을 때(Admin 메인) 보여줄 기본 문구 
                  또는 대시보드로 바로 리다이렉트 시키는 로직을 넣을 수 있습니다.
                */}
                {location.pathname === "/admin" ? (
                    <div style={{
                        textAlign: "center",
                        padding: "100px 20px",
                        backgroundColor: theme.white,
                        borderRadius: theme.radius,
                        boxShadow: theme.shadow,
                        color: theme.muted
                    }}>
                        <FaUserShield size={50} style={{ marginBottom: "20px", opacity: 0.3 }} />
                        <h3>관리자 메뉴를 선택해주세요</h3>
                        <p>상단 메뉴를 통해 각 관리 기능으로 이동할 수 있습니다.</p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>

            {/* 간단한 애니메이션 효과를 위한 style 태그 */}
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
}