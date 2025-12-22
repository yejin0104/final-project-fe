import { Calendar, User, MapPin, Star, Heart, Search, Filter, Plus } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// [필수] 커스텀 훅 임포트 (경로 확인해주세요)
import { usePagination } from "../../utils/hooks/usePagination";

export default function ScheduleList() {
  const navigate = useNavigate();
  dayjs.locale('ko');

  // =================================================================================
  // [핵심] 커스텀 훅 사용 (기존의 useState, useEffect, loadData 대체)
  // 1. "/schedule/" : 데이터를 가져올 백엔드 주소
  // 2. 6 : 한 번에 보여줄 카드 개수 (limit)
  // 3. list: schedule -> 훅에서 받은 list를 'schedule'이라는 이름으로 사용
  // =================================================================================
  const { list: schedule, hasMore, nextPage } = usePagination("/schedule/", 6);

  const [activeTab, setActiveTab] = useState("전체"); 
  const MINT_COLOR = "#78C2AD";

  // --- [스타일 정의] ---
  const styles = {
    heroSection: {
        backgroundColor: "#f8fdfb", 
        padding: "60px 0",
        marginBottom: "40px",
        borderRadius: "0 0 30px 30px", 
        borderBottom: "1px solid #eef5f3"
    },
    filterBtn: (isActive) => ({
        padding: "10px 20px",
        borderRadius: "30px",
        border: isActive ? `1px solid ${MINT_COLOR}` : "1px solid #eee",
        backgroundColor: isActive ? MINT_COLOR : "white",
        color: isActive ? "white" : "#555",
        fontWeight: "600",
        fontSize: "0.95rem",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: isActive ? "0 4px 10px rgba(120, 194, 173, 0.3)" : "none",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    }),
    card: {
      border: "none",
      borderRadius: "24px", 
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
      backgroundColor: "white",
      height: "100%",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    },
    cardImageWrapper: {
        height: "260px", 
        width: "100%",
        position: "relative",
        overflow: "hidden"
    },
    cardImage: {
      height: "100%",
      width: "100%",
      objectFit: "cover",
      transition: "transform 0.7s ease",
    },
    cardBody: {
      padding: "1.8rem",
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    tag: {
      fontSize: "0.8rem",
      color: MINT_COLOR,
      backgroundColor: "#effbf8",
      padding: "6px 14px",
      borderRadius: "30px",
      fontWeight: "700",
      marginRight: "8px",
      display: "inline-flex",
      alignItems: "center",
      marginBottom: "8px",
    },
    grayTag: {
      fontSize: "0.8rem",
      color: "#555",
      backgroundColor: "#f1f3f5",
      padding: "6px 14px",
      borderRadius: "30px",
      fontWeight: "600",
      marginRight: "8px",
      display: "inline-flex",
      alignItems: "center",
      marginBottom: "8px",
    },
    userImage: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        backgroundColor: "#f1f3f5",
        marginRight: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #eee"
    },
    dateBadge: {
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: "6px 12px",
        borderRadius: "12px",
        fontSize: "0.85rem",
        color: "#666",
        fontWeight: "600",
        marginTop: "auto"
    }
  };

  const getDurationText = (start, end) => {
    if (!start || !end) return "";
    const s = dayjs(start);
    const e = dayjs(end);
    const nights = e.diff(s, 'day');
    const days = nights + 1;
    if (nights === 0) return `당일치기`;
    return `${nights}박 ${days}일`;
  };

  const categories = ["전체", "힐링", "맛집투어", "커플여행", "우정여행", "가족여행"];

  return (
    <>
      <div style={styles.heroSection}>
        <div className="container text-center">
            <div className="d-inline-flex align-items-center justify-content-center mb-3 px-3 py-1 rounded-pill" style={{backgroundColor: "white", border: `1px solid ${MINT_COLOR}`, color: MINT_COLOR, fontSize: "0.9rem", fontWeight: "bold"}}>
                <Star size={16} className="me-2" fill={MINT_COLOR} />
                인기 여행 코스 모음
            </div>
            <h2 style={{ fontWeight: "900", color: "#222", marginBottom: "15px", fontSize: "2.5rem" }}>
                어디로 떠나볼까요?
            </h2>
            <p className="text-muted" style={{ fontSize: "1.1rem" }}>
                다른 여행자들의 생생한 일정으로 영감을 얻어보세요.
            </p>
            
            <div className="mx-auto mt-4 p-2 bg-white rounded-pill shadow-sm d-flex align-items-center" style={{ maxWidth: "500px", border: "1px solid #eee" }}>
                <Search size={20} className="ms-3 text-muted" />
                <input type="text" placeholder="원하는 테마를 검색해보세요" className="form-control border-0 shadow-none" />
                <button className="btn rounded-pill text-white fw-bold px-4 text-nowrap" style={{ backgroundColor: MINT_COLOR }}>검색</button>
            </div>
        </div>
      </div>

      <div className="container pb-5">
        
        <div className="d-flex flex-wrap gap-2 mb-5 justify-content-center">
            {categories.map((cat) => (
                <button 
                    key={cat} 
                    onClick={() => setActiveTab(cat)}
                    style={styles.filterBtn(activeTab === cat)}
                >
                    {activeTab === cat && <Filter size={14} />}
                    {cat}
                </button>
            ))}
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-5">
            {schedule.map((item) => (
            <div key={item.scheduleNo} className="col">
                <Link to={`/schedulePage/${item.scheduleNo}`} className="text-decoration-none text-dark">
                <div
                    style={styles.card}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-12px)";
                        e.currentTarget.style.boxShadow = "0 20px 40px rgba(120, 194, 173, 0.2)";
                        const img = e.currentTarget.querySelector('.card-img-top');
                        if(img) img.style.transform = "scale(1.08)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)";
                        const img = e.currentTarget.querySelector('.card-img-top');
                        if(img) img.style.transform = "scale(1)";
                    }}
                >
                    <div style={styles.cardImageWrapper}>
                        <img
                            className="card-img-top"
                            style={styles.cardImage}
                            src={item.scheduleImage && item.scheduleImage !== "null"
                            ? `http://localhost:8080/attachment/download?attachmentNo=${item.scheduleImage}`
                            : "/images/default-schedule.png"}
                            onError={(e) => e.target.src = "/images/default-schedule.png"}
                            alt={item.scheduleName}
                        />
                        
                        <div style={{
                            position: "absolute", top: "20px", left: "20px",
                            backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "10px",
                            padding: "8px 14px", fontSize: "0.8rem", fontWeight: "800",
                            color: item.schedulePublic === 'Y' ? MINT_COLOR : "#ff6b6b",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            letterSpacing: "0.5px"
                        }}>
                            {item.schedulePublic === 'Y' ? 'OPEN TRIP' : 'PRIVATE'}
                        </div>

                        <div style={{
                            position: "absolute", top: "20px", right: "20px",
                            width: "42px", height: "42px", borderRadius: "50%",
                            backgroundColor: "rgba(0,0,0,0.2)", backdropFilter: "blur(5px)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", transition: "0.2s"
                        }}>
                            <Heart size={20} />
                        </div>
                    </div>

                    <div style={styles.cardBody}>
                        <div className="mb-3 d-flex flex-wrap gap-2">
                            {item.unitFirst && (
                                <span style={styles.grayTag}>
                                    <MapPin size={14} className="me-1" strokeWidth={2.5} />
                                    {item.unitFirst}
                                </span>
                            )}
                            {item.tags && item.tags.split(',').slice(0, 3).map((tag, idx) => (
                                <span key={idx} style={styles.tag}>#{tag}</span>
                            ))}
                            {item.unitCount > 1 && (
                                <span style={styles.grayTag}>+{item.unitCount - 1}개 장소</span>
                            )}
                        </div>

                        <h4 className="fw-bold mb-3 text-truncate" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px', color: '#222' }}>
                            {item.scheduleName}
                        </h4>

                        <div className="d-flex align-items-center mb-4">
                             <div style={styles.userImage}>
                                <User size={16} color="#888" />
                             </div>
                             <span className="text-muted small fw-bold">{item.scheduleOwner}</span>
                        </div>

                        <div style={{ borderTop: "1px solid #f1f3f5", paddingTop: "1.2rem", marginTop: "auto" }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div style={styles.dateBadge}>
                                    <Calendar size={14} className="me-2 text-muted" />
                                    {getDurationText(item.scheduleStartDate, item.scheduleEndDate)}
                                </div>
                                <div className="d-flex align-items-center text-secondary fw-bold small">
                                    <User size={16} className="me-1" />
                                    {item.memberCount}명
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </Link>
            </div>
            ))}
        </div>

        {/* 4. 더보기 버튼 (데이터가 더 있을 때만 표시) */}
        {hasMore && (
            <div className="text-center mt-5">
                <button 
                    className="btn btn-lg rounded-pill px-5 py-3 fw-bold" 
                    onClick={nextPage}
                    style={{ 
                        border: "1px solid #eee", 
                        backgroundColor: "white", 
                        color: "#555", 
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px" 
                    }}
                >
                    <Plus size={20} />
                    일정 더 보기
                </button>
            </div>
        )}
      </div>
    </>
  );
}