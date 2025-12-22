import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { FaMagnifyingGlass, FaUserGear, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { PiTildeBold } from "react-icons/pi";
import { toast } from "react-toastify";

export default function AccountSearch() {
    const [input, setInput] = useState({
        accountId: "",
        accountNickname: "",
        accountEmail: "",
        accountContact: "",
        accountBirth: "",
        minSchedule: "", maxSchedule: "",
        minScheduleCount: "", maxScheduleCount: "",
        beginAccountJoin: "", endAccountJoin: "",
        accountLevelList: ["일반회원", "상담사", "관리자"],
    });

    // 페이징 관련 상태 추가
    const [result, setResult] = useState({
        list: [],
        page: 1,
        count: 0,
        last: true
    });
    const [loading, setLoading] = useState(false);

    const pointColor = "#86C9BB";

    const getLevelBadge = (level) => {
        switch (level) {
            case "관리자": return { bg: "#FF6B6B22", color: "#FF6B6B" };
            case "상담사": return { bg: "#4D96FF22", color: "#4D96FF" };
            default: return { bg: `${pointColor}22`, color: pointColor };
        }
    };

    const changeStrValue = useCallback(e => {
        const { name, value } = e.target;
        setInput(prev => ({ ...prev, [name]: value }));
    }, []);

    // 데이터를 가져오는 함수 (페이지 번호를 인자로 받음)
    const sendData = useCallback(async (pageNo = 1) => {
        setLoading(true);
        try {
            // 서버에 검색 조건 + 페이지 번호 전송

            console.log("전송할 페이지 번호:", pageNo);
            const { data } = await axios.post("/admin/complexSearch", {
                ...input,
                page: pageNo
            });
            setResult(data); 
        } catch (error) {
            toast.error("검색 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, [input]);

    const changeAccountLevelList = useCallback(e => {
        const value = e.target.value;
        setInput(prev => ({
            ...prev,
            accountLevelList: prev.accountLevelList.includes(value)
                ? prev.accountLevelList.filter(level => level !== value)
                : [...prev.accountLevelList, value]
        }));
    }, []);

    return (
        <div className="container-fluid py-5 px-4" style={{ backgroundColor: "#fbfcfd", minHeight: "100vh" }}>
            {/* 타이틀 영역 */}
            <div className="d-flex align-items-center mb-5">
                <div className="p-3 rounded-4 me-3 text-white" style={{ backgroundColor: pointColor }}>
                    <FaUserGear size={30} />
                </div>
                <div>
                    <h2 className="fw-bold mb-0">Account Management</h2>
                    <p className="text-muted mb-0 small">상세 조건 검색 시 페이징 처리가 지원됩니다.</p>
                </div>
            </div>

            {/* 검색 필터 카드 */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-secondary">아이디 / 닉네임</label>
                            <div className="input-group">
                                <input type="text" className="form-control border-light-subtle" placeholder="아이디" name="accountId" onChange={changeStrValue} />
                                <input type="text" className="form-control border-light-subtle" placeholder="닉네임" name="accountNickname" onChange={changeStrValue} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-secondary">이메일</label>
                            <input type="text" className="form-control border-light-subtle" name="accountEmail" onChange={changeStrValue} />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-secondary">가입일 범위</label>
                            <div className="d-flex align-items-center gap-2">
                                <input type="date" className="form-control border-light-subtle" name="beginAccountJoin" onChange={changeStrValue} />
                                <PiTildeBold />
                                <input type="date" className="form-control border-light-subtle" name="endAccountJoin" onChange={changeStrValue} />
                            </div>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn w-100 py-2 fw-bold text-white rounded-3 shadow-sm" 
                                style={{ backgroundColor: pointColor }} onClick={() => sendData(1)}>
                                <FaMagnifyingGlass className="me-2" /> 검색
                            </button>
                        </div>
                        <div className="col-12 mt-3 border-top pt-3">
                            <div className="d-flex align-items-center gap-4">
                                <span className="small fw-bold text-secondary">회원 등급:</span>
                                {["일반회원", "상담사", "관리자"].map(level => (
                                    <div className="form-check form-check-inline" key={level}>
                                        <input className="form-check-input" type="checkbox" value={level} id={level}
                                            checked={input.accountLevelList.includes(level)} onChange={changeAccountLevelList} />
                                        <label className="form-check-label small" htmlFor={level}>{level}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 결과 테이블 카드 */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white py-4 px-4 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">검색 결과 <small className="text-muted ms-2" style={{fontSize:'0.8em'}}>{result.count}건</small></h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle" style={{ minWidth: "1000px" }}>
                        <thead className="bg-light">
                            <tr style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                                <th className="ps-4 py-3">아이디</th>
                                <th>닉네임</th>
                                <th>이메일 / 연락처</th>
                                <th className="text-center">등급</th>
                                <th className="text-center">생년월일</th>
                                <th className="text-center">일정 (현재/최대)</th>
                                <th className="text-center">가입일</th>
                                <th className="pe-4 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center py-5">데이터를 불러오는 중입니다...</td></tr>
                            ) : result.list.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted">검색 결과가 없습니다.</td></tr>
                            ) : (
                                result.list.map(account => {
                                    const badgeStyle = getLevelBadge(account.accountLevel);
                                    return (
                                        <tr key={account.accountId}>
                                            <td className="ps-4 fw-bold">{account.accountId}</td>
                                            <td>{account.accountNickname}</td>
                                            <td>
                                                <div className="small">{account.accountEmail}</div>
                                                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{account.accountContact || '-'}</div>
                                            </td>
                                            <td className="text-center">
                                                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}>
                                                    {account.accountLevel}
                                                </span>
                                            </td>
                                            <td className="text-center small">{account.accountBirth || '-'}</td>
                                            <td className="text-center">
                                                <span className="fw-bold text-dark">{account.scheduleCount}</span>
                                                <span className="text-muted small"> / {account.accountMaxSchedule}개</span>
                                            </td>
                                            <td className="text-center small text-secondary">{account.accountJoin}</td>
                                            <td className="pe-4 text-center">
                                                <button className="btn btn-outline-light btn-sm text-dark border-light-subtle px-3">수정</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이징 컨트롤 바 영역 추가 */}
                <div className="card-footer bg-white py-3 border-0 d-flex justify-content-center align-items-center gap-4">
                    <button 
                        className="btn btn-light btn-sm rounded-circle p-2"
                        disabled={result.page === 1 || loading}
                        onClick={() => sendData(result.page - 1)}
                    >
                        <FaChevronLeft size={14} />
                    </button>
                    
                    <span className="fw-bold" style={{ color: pointColor }}>{result.page}</span>

                    <button 
                        className="btn btn-light btn-sm rounded-circle p-2"
                        disabled={result.last || loading}
                        onClick={() => sendData(result.page + 1)}
                    >
                        <FaChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}