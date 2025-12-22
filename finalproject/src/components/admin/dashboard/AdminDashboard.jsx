import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify";
import { FaUsers, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

export default function AdminDashboard(){
    // 페이징 처리를 위한 통합 상태 관리
    const [pageData, setPageData] = useState({
        list: [],
        page: 1,
        count: 0,
        last: false
    });
    const [loading, setLoading] = useState(false);
    const pointColor = "#86C9BB"; // TripPlanner 민트색

    // 데이터를 로드하는 함수 (페이지 번호를 인자로 받음)
    const loadData = useCallback(async (pageNo = 1) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/admin/account/list/page/${pageNo}`);
            setPageData(data);
        } catch (error) {
            toast.error("데이터 로드 실패");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData])

    // 등급별 스타일 지정
    const getLevelStyle = (level) => {
        switch (level) {
            case "관리자": return { bg: "#FF6B6B22", color: "#FF6B6B" };
            case "상담사": return { bg: "#4D96FF22", color: "#4D96FF" };
            default: return { bg: `${pointColor}22`, color: pointColor };
        }
    };

    return (
        <div className="container-fluid py-5 px-4" style={{ backgroundColor: "#fbfcfd", minHeight: "100vh" }}>
            {/* 헤더 섹션 */}
            <div className="row mb-5">
                <div className="col-12 d-flex align-items-center justify-content-between">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#333" }}>Member Dashboard</h2>
                        <p className="text-muted mb-0">전체 회원의 이용 현황을 한눈에 파악할 수 있습니다.</p>
                    </div>
                    <div className="d-flex gap-3">
                        <div className="bg-white p-3 rounded-4 shadow-sm d-flex align-items-center">
                            <div className="rounded-circle p-2 me-3" style={{ backgroundColor: `${pointColor}22`, color: pointColor }}>
                                <FaUsers size={20}/>
                            </div>
                            <div>
                                <div className="small text-muted">총 회원 수</div>
                                <div className="fw-bold h5 mb-0">{pageData.count}명</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 리스트 카드 */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white py-4 px-4 border-0 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <div className="vr me-3" style={{ width: "4px", backgroundColor: pointColor, borderRadius: "2px", opacity: 1 }}></div>
                        <h5 className="mb-0 fw-bold">회원 정보 현황</h5>
                    </div>
                    <span className="text-muted small">Page {pageData.page}</span>
                </div>
                
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa", fontSize: "0.85rem", color: "#6c757d" }}>
                                <th className="ps-4 py-3 border-0">아이디</th>
                                <th className="border-0">닉네임</th>
                                <th className="border-0 text-center">등급</th>
                                <th className="border-0">연락처 / 이메일</th>
                                <th className="border-0 text-center">일정 현황</th>
                                <th className="border-0 text-center">가입일</th>
                                <th className="pe-4 border-0 text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && pageData.list.length > 0 ? (
                                pageData.list.map((account) => {
                                    const levelStyle = getLevelStyle(account.accountLevel);
                                    return (
                                        <tr key={account.accountId} style={{ cursor: "pointer", transition: "all 0.2s" }}>
                                            <td className="ps-4 py-3">
                                                <span className="fw-bold" style={{ color: "#444" }}>{account.accountId}</span>
                                            </td>
                                            <td>{account.accountNickname}</td>
                                            <td className="text-center">
                                                <span className="badge rounded-pill px-3 py-2" 
                                                      style={{ backgroundColor: levelStyle.bg, color: levelStyle.color, fontWeight: "600" }}>
                                                    {account.accountLevel}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="small fw-medium">{account.accountContact || "-"}</div>
                                                <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{account.accountEmail || "-"}</div>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <span className="fw-bold">{account.scheduleCount || 0}</span>
                                                    <span className="text-muted small">/</span>
                                                    <span className="text-muted small">{account.accountMaxSchedule || 0}개</span>
                                                </div>
                                                <div className="progress mt-1 mx-auto" style={{ height: "4px", width: "60px" }}>
                                                    <div className="progress-bar" role="progressbar" 
                                                        style={{ 
                                                            width: `${((account.scheduleCount || 0) / (account.accountMaxSchedule || 1)) * 100}%`,
                                                            backgroundColor: pointColor 
                                                        }}></div>
                                                </div>
                                            </td>
                                            <td className="text-center small text-secondary">
                                                {account.accountJoin ? account.accountJoin.split(' ')[0] : "-"}
                                            </td>
                                            <td className="pe-4 text-center">
                                                <button className="btn btn-sm rounded-3 border-0 px-3" 
                                                        style={{ backgroundColor: "#f1f3f5", color: "#666", fontSize: "0.75rem", fontWeight: "bold" }}>
                                                    상세
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-5 text-center text-muted">
                                        {loading ? "데이터 로딩 중..." : "등록된 회원 정보가 없습니다."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이징 컨트롤 바 추가 */}
                <div className="card-footer bg-white py-3 border-0 d-flex justify-content-center align-items-center gap-4">
                    <button 
                        className="btn btn-light btn-sm rounded-circle p-2"
                        disabled={pageData.page === 1 || loading}
                        onClick={() => loadData(pageData.page - 1)}
                        style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <FaChevronLeft size={12} />
                    </button>
                    
                    <div className="fw-bold" style={{ color: pointColor }}>
                        {pageData.page}
                    </div>

                    <button 
                        className="btn btn-light btn-sm rounded-circle p-2"
                        disabled={pageData.last || loading}
                        onClick={() => loadData(pageData.page + 1)}
                        style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}