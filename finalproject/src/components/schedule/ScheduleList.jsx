import { Calendar, User, MapPin, Star, Heart, Search, Filter, Plus } from "lucide-react";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- [내장 훅] 데이터 더보기 및 상태 관리 기능 ---
// 별도 파일 import 오류 방지를 위해 내부에 정의합니다.
const usePagination = (url, limit = 6) => {
  // 전체 데이터 (DB에서 가져온 원본)
  const [fullList, setFullList] = useState([]);

  // 화면에 보여줄 데이터 (잘라낸 것)
  const [list, setList] = useState([]);

  // 현재 페이지 번호
  const [page, setPage] = useState(1);

  // 더 보여줄 데이터가 있는지 여부
  const [hasMore, setHasMore] = useState(true);

  // 1. 최초 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const resp = await axios.get(url);
      const allData = resp.data;

      setFullList(allData);
      setList(allData.slice(0, limit));
      setHasMore(allData.length > limit);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  }, [url, limit]);

  // 2. 페이지 변경 시 데이터 추가 표시
  useEffect(() => {
    const nextEnd = page * limit;
    setList(fullList.slice(0, nextEnd));
    setHasMore(fullList.length > nextEnd);
  }, [page, fullList, limit]);

  // 3. 더보기 버튼 기능
  const nextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // [핵심] 4. 특정 아이템의 정보만 수정하는 함수 (좋아요 반영용)
  const updateItem = (targetId, newFields) => {
    setFullList(prevFullList =>
      prevFullList.map(item =>
        item.scheduleNo === targetId
          ? { ...item, ...newFields }
          : item
      )
    );
  };

  return { list, hasMore, nextPage, updateItem };
};


export default function ScheduleList() {
  const navigate = useNavigate();
  dayjs.locale('ko');

  // 내장된 usePagination 훅 사용
  const { list: schedule, hasMore, nextPage, updateItem } = usePagination("/schedule/", 6);

  const MINT_COLOR = "#78C2AD";

  // --- [좋아요 토글 핸들러] ---
  const handleLikeToggle = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 서버에 좋아요 요청
      const response = await axios.post(`/account/scheduleLike/${item.scheduleNo}`);

      const newCountFromServer = response.data;
      const currentIsLiked = item.isLiked;
      const currentCount = item.scheduleLikeCount || 0;

      // 2. 서버 응답 성공 시, updateItem을 사용해 리스트의 상태를 즉시 변경합니다.
      updateItem(item.scheduleNo, {
        isLiked: !currentIsLiked,
        scheduleLikeCount: typeof newCountFromServer === 'number'
          ? newCountFromServer
          : (currentIsLiked ? currentCount - 1 : currentCount + 1)
      });

    } catch (error) {
      console.error("좋아요 처리 중 오류 발생:", error);
      if (error.response?.status === 401) {
        if (window.confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
          navigate("/login");
        }
      }
    }
  };

  const styles = {
    heroSection: {
      backgroundColor: "#f8fdfb", padding: "60px 0", marginBottom: "40px",
      borderRadius: "0 0 30px 30px", borderBottom: "1px solid #eef5f3"
    },
    card: {
      border: "none", borderRadius: "24px", overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      backgroundColor: "white", height: "100%", cursor: "pointer",
      display: "flex", flexDirection: "column", position: "relative",
    }
  };

  const getDurationText = (start, end) => {
    if (!start || !end) return "";
    const s = dayjs(start); const e = dayjs(end);
    const nights = e.diff(s, 'day');
    const days = nights + 1;
    return nights === 0 ? `당일치기` : `${nights}박 ${days}일`;
  };

  return (
    <>
      <div style={styles.heroSection}>
        <div className="container text-center">
          <h2 style={{ fontWeight: "900", color: "#222", marginBottom: "15px", fontSize: "2.5rem" }}>어디로 떠나볼까요?</h2>
          <h5 className="text-muted">다른 여행자들의 생생한 일정으로 영감을 얻어보세요.</h5>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-5">
          {schedule.map((item) => (
            <div key={item.scheduleNo} className="col">
              <div style={styles.card} onClick={() => navigate(`/schedulePage/${item.scheduleNo}`)}>
                <div style={{ height: "260px", position: "relative", overflow: "hidden" }}>
                  <img
                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                    src={
                      item.scheduleImage
                        ? `http://localhost:8080/attachment/download/${item.scheduleImage}`
                        : "/images/default-schedule.png"
                    }
                    alt={item.scheduleName}
                  // onError={(e) => (console.log(e))}
                  />

                  <div style={{
                    position: "absolute", top: "20px", left: "20px",
                    backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "10px",
                    padding: "8px 14px", fontSize: "0.8rem", fontWeight: "800",
                    color: item.schedulePublic === 'Y' ? MINT_COLOR : "#ff6b6b"
                  }}>
                    {item.schedulePublic === 'Y' ? 'OPEN TRIP' : 'PRIVATE'}
                  </div>

                  {/* 좋아요 버튼 영역 */}
                  <div
                    onClick={(e) => handleLikeToggle(e, item)}
                    style={{
                      position: "absolute", top: "20px", right: "20px",
                      width: "auto", height: "36px", padding: "0 12px",
                      borderRadius: "20px",
                      // 이제 item.isLiked를 직접 참조합니다.
                      backgroundColor: item.isLiked ? "rgba(255,107,107,0.2)" : "rgba(0,0,0,0.3)",
                      backdropFilter: "blur(8px)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      gap: "8px", color: "white", cursor: "pointer", zIndex: 10,
                      border: item.isLiked ? `1px solid ${MINT_COLOR}` : "none",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <Heart
                      size={18}
                      fill={item.isLiked ? "#ff6b6b" : "rgba(255,255,255,0.4)"}
                      color={item.isLiked ? "#ff6b6b" : "white"}
                      style={{ transform: item.isLiked ? "scale(1.1)" : "scale(1)" }}
                    />
                    <span style={{ fontSize: "0.9rem", fontWeight: "700" }}>
                      {item.scheduleLikeCount || 0}
                    </span>
                  </div>
                </div>

                <div style={{ padding: "1.8rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h4 className="fw-bold mb-3">{item.scheduleName}</h4>
                  <div className="d-flex align-items-center mb-4">
                    <span className="text-muted small fw-bold">{item.scheduleOwner}</span>
                  </div>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="small text-muted">{getDurationText(item.scheduleStartDate, item.scheduleEndDate)}</span>
                    <span className="small fw-bold">{item.memberCount}명 참여</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-5">
            <button className="btn btn-lg rounded-pill px-5 border bg-white" onClick={nextPage}>
              <Plus size={20} className="me-2" />일정 더 보기
            </button>
          </div>
        )}
      </div>
    </>
  );
}