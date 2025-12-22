import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    FaEye, FaHeart, FaUser, FaGlobeAmericas, FaLock, FaTrash, FaSearch,
    FaChevronLeft, FaChevronRight
} from "react-icons/fa";

export default function AdminSchedule() {
    // 1. 상태 관리
    const [scheduleVO, setScheduleVO] = useState({
        list: [],
        page: 1,
        count: 0,
        last: false
    });
    const [loading, setLoading] = useState(false);

    // 검색 및 필터 상태
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPublic, setFilterPublic] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const theme = {
        primary: "#86C9BB",
        background: "#f8f9fa",
        white: "#ffffff",
        border: "#eeeeee",
        text: "#333333",
        muted: "#888888",
        radius: "16px",
        shadow: "0 4px 12px rgba(0,0,0,0.05)"
    };

    // 2. 데이터 로드 함수 (ScheduleListVO 구조에 맞춤)
    const loadSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post("/admin/schedule/list", {
                page: currentPage,
                // 백엔드에서 필터링 파라미터를 명칭에 맞게 조정하세요 (예: keyword, publicType 등)
                keyword: searchTerm,
                schedulePublic: filterPublic === "ALL" ? null : filterPublic

            });

            // 백엔드에서 보낸 ScheduleListVO를 통째로 저장하거나 필요한 부분 추출
            setScheduleVO(response.data);
        } catch (error) {
            console.error("일정 목록 로드 실패", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterPublic]);

    useEffect(() => {
        loadSchedules();
    }, [currentPage]);

    // 3. 핸들러 (검색/필터 시 1페이지로 이동)
    const handleFilterChange = (e) => {
        setFilterPublic(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return dateStr.split('T')[0];
    };

    // 전체 페이지 수 계산 (VO의 count 이용)
    const totalPages = Math.ceil(scheduleVO.count / 10);

    return (
        <div style={{ padding: "10px", animation: "fadeIn 0.5s ease" }}>
            <div style={{
                backgroundColor: theme.white, borderRadius: theme.radius,
                padding: "2rem", boxShadow: theme.shadow
            }}>
                {/* 헤더 섹션 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                    <div>
                        <h3 style={{ fontWeight: "700", margin: 0 }}>전체 일정 관리</h3>
                        <p style={{ color: theme.muted, fontSize: "0.9rem", marginTop: "5px" }}>
                            총 <strong>{scheduleVO.count}</strong>개의 일정이 검색되었습니다.
                        </p>
                    </div>

                    {/* 필터 및 검색바 */}
                    <div style={{ display: "flex", gap: "10px" }}>
                        <select
                            value={filterPublic}
                            onChange={handleFilterChange}
                            style={{
                                padding: "8px 12px", borderRadius: "8px", border: `1px solid ${theme.border}`,
                                outline: "none", cursor: "pointer"
                            }}
                        >
                            <option value="ALL">전체 공개여부</option>
                            <option value="Y">공개됨 (Y)</option>
                            <option value="N">비공개 (N)</option>
                        </select>

                        <div style={{ position: "relative" }}>
                            <FaSearch style={{ position: "absolute", left: "12px", top: "12px", color: "#ccc" }} size={14} />
                            <input
                                type="text"
                                placeholder="일정명 또는 작성자 검색"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{
                                    padding: "8px 12px 8px 35px", borderRadius: "8px",
                                    border: `1px solid ${theme.border}`, outline: "none", width: "240px"
                                }}
                            />
                            <button 
                                onClick={()=>{loadSchedules()}}
                                className="ms-2"
                                style={{ 
                                    backgroundColor: theme.primary, color: "white", border: "none",
                                    padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
                                }}
                            >
                                검색
                            </button>
                        </div>
                    </div>
                </div>

                {/* 테이블 영역 */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${theme.border}`, color: theme.muted, fontSize: "0.85rem" }}>
                                <th style={{ padding: "1rem", textAlign: "center" }}>번호</th>
                                <th style={{ padding: "1rem", textAlign: "left" }}>일정 정보</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>작성자</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>기간</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>인기도</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>공개여부</th>
                                <th style={{ padding: "1rem", textAlign: "center" }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && scheduleVO.list && scheduleVO.list.length > 0 ? (
                                scheduleVO.list.map((item) => (
                                    <tr key={item.scheduleNo} style={{ borderBottom: `1px solid ${theme.border}`, transition: "0.2s" }}>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center", fontSize: "0.9rem", color: theme.muted }}>
                                            {item.scheduleNo}
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{
                                                    fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px", fontWeight: "800",
                                                    backgroundColor: item.scheduleState === 'open' ? "#e3f2fd" : "#f5f5f5",
                                                    color: item.scheduleState === 'open' ? "#1976d2" : "#999"
                                                }}>
                                                    {item.scheduleState?.toUpperCase()}
                                                </span>
                                                <span style={{ fontWeight: "700", color: "#333" }}>{item.scheduleName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.9rem" }}>
                                                <FaUser size={12} color={theme.primary} /> {item.scheduleOwner}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center", fontSize: "0.85rem" }}>
                                            <div style={{ color: "#555" }}>{formatDate(item.scheduleStartDate)}</div>
                                            <div style={{ color: theme.muted, fontSize: "0.75rem" }}>~ {formatDate(item.scheduleEndDate)}</div>
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "10px", fontSize: "0.85rem" }}>
                                                <span title="좋아요"><FaHeart color="#ff6b6b" /> {item.scheduleLike}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center" }}>
                                            {item.schedulePublic === 'Y' ?
                                                <FaGlobeAmericas color={theme.primary} size={18} /> :
                                                <FaLock color="#ccc" size={18} />
                                            }
                                        </td>
                                        <td style={{ padding: "1.2rem 1rem", textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                                                <button style={{
                                                    border: `1px solid ${theme.primary}`, background: "white", color: theme.primary,
                                                    padding: "5px 10px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold"
                                                }}>상세</button>
                                                <button style={{
                                                    border: "none", background: "#fff0f0", color: "#ff4d4f",
                                                    padding: "5px 10px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer"
                                                }}><FaTrash size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ padding: "5rem", textAlign: "center", color: theme.muted }}>
                                        {loading ? "데이터를 불러오는 중..." : "등록된 여행 일정이 없습니다."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이징 버튼 영역 */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "2.5rem", gap: "8px" }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{
                                background: "none", border: "none", cursor: currentPage === 1 ? "default" : "pointer",
                                color: currentPage === 1 ? "#ccc" : theme.text, display: "flex", alignItems: "center"
                            }}
                        >
                            <FaChevronLeft size={14} />
                        </button>

                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setCurrentPage(idx + 1)}
                                style={{
                                    width: "35px", height: "35px", borderRadius: "8px",
                                    border: "none", cursor: "pointer",
                                    backgroundColor: currentPage === idx + 1 ? theme.primary : "transparent",
                                    color: currentPage === idx + 1 ? "white" : theme.text,
                                    fontWeight: currentPage === idx + 1 ? "700" : "500"
                                }}
                            >
                                {idx + 1}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{
                                background: "none", border: "none", cursor: currentPage === totalPages ? "default" : "pointer",
                                color: currentPage === totalPages ? "#ccc" : theme.text, display: "flex", alignItems: "center"
                            }}
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}