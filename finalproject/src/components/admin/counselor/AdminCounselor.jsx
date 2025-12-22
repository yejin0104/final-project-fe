import { FaHeadset } from "react-icons/fa";

export default function AdminCounselor() {
    const theme = {
        primary: "#86C9BB",
        background: "#f8f9fa",
        white: "#ffffff",
        text: "#333333",
        muted: "#888888",
        radius: "16px",
        shadow: "0 4px 12px rgba(0,0,0,0.05)"
    };
    
    return (
        <div style={{ padding: "10px" }}>
            <div style={{ backgroundColor: theme.white, borderRadius: theme.radius, padding: "2rem", boxShadow: theme.shadow }}>
                <h3 style={{ fontWeight: "700", marginBottom: "2rem" }}>상담사 승인 및 관리</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", padding: "1.5rem", border: `1px solid ${theme.border}`, borderRadius: theme.radius }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: `${theme.primary}22`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: "1.5rem" }}>
                            <FaHeadset color={theme.primary} size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h5 style={{ margin: 0, fontWeight: "bold" }}>김상담 (counselor_kim)</h5>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: theme.muted }}>신청일: 2024-05-15 | 전문분야: 국내여행, 제주도</p>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button style={{ padding: "8px 20px", border: "none", borderRadius: "8px", backgroundColor: theme.primary, color: "white", fontWeight: "bold" }}>승인</button>
                            <button style={{ padding: "8px 20px", border: "none", borderRadius: "8px", backgroundColor: "#f5f5f5", color: "#666" }}>거절</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}