import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import "./ScheduleListV3.css";
import Swal from "sweetalert2";


export default function MySchedule() {

  // 부모(Mypage)에서 넘겨준 정보를 받아서 사용
  const { myInfo, setMyInfo } = useOutletContext();

  const accountId = useAtomValue(loginIdState);

  const today = dayjs();
  const todayStr = today.format("YYYY-MM-DD");
  dayjs.locale('ko')

  const [baseDate, setBaseDate] = useState(dayjs());
  const week = [...Array(7)].map((_, i) => baseDate.add(i - 3, "day"));

  const prevWeek = () => {
    setBaseDate(prev => prev.subtract(1, "week"))
  }

  const nextWeek = () => {
    setBaseDate(prev => prev.add(1, "week"))
  }

  const [schedule, setSchedule] = useState([]);
  const [selectDay, setSelectDay] = useState(null);


  useEffect(() => {

    if (!myInfo.accountId) return;

    async function loadData() {
      const { data } = await axios.get(`/schedule/list/${myInfo.accountId}`);
      setSchedule(data);
      // console.log(data);
      // if(data.)
    }
    loadData();
  }, [myInfo.accountId]);

  const deleteSchedule = useCallback(async (scheduleNo) => {
    Swal.fire({
      title: "일정 삭제하시겠습니까?",
      text: "삭제 후에는 복구가 불가능합니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "삭제",
      cancelButtonText: "취소"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // 1. 서버에 삭제 요청
          await axios.delete(`/schedule/delete/${scheduleNo}`);

          // 2. 화면 상태 갱신 (filter를 사용해 삭제된 번호만 제외)
          setSchedule(prev => prev.filter(s => s.scheduleNo !== scheduleNo));

          // 3. 성공 알림
          Swal.fire({
            title: "삭제 완료!",
            icon: "success",
            timer: 1500, // 1.5초 후 자동으로 닫힘
            showConfirmButton: false
          });
        } catch (error) {
          // 에러 처리
          Swal.fire({
            title: "삭제 실패",
            text: "오류가 발생했습니다.",
            icon: "error"
          });
        }
      }
    });
  }, [])

  const todayBtn = useCallback((day) => {
    setSelectDay(day.format("YYYY-MM-DD"));
    // console.log(day.format("YYYY-MM-DD"));
  }, [selectDay]);

  const scheduleDateSet = new Set();
  for (const s of schedule) {
    const day = dayjs(s.scheduleStartDate).format("YYYY-MM-DD");
    scheduleDateSet.add(day);
    // console.log(scheduleDateSet);
  }

  // 상태 뱃지 클래스
  const stateBadgeClass = (state) => {
    if (state === "약속전") return "tp-state-before";
    if (state === "진행중") return "tp-state-ongoing";
    if (state === "종료") return "tp-state-ended";
    return "";
  };

  return (
    <>
      {/* ===== 주간 네비게이션 ===== */}
      <div className="row mt-5 align-items-center">
        <div className="col-2 col-md-1 d-flex justify-content-start">
          <button className="btn tp-btn fs-3" onClick={prevWeek} aria-label="이전 주">
            <MdNavigateBefore />
          </button>
        </div>

        <div className="col-8 col-md-10">
          <div className="d-flex justify-content-center gap-2 gap-md-3 flex-wrap">
            {week.map((date, index) => {
              const dateStr = date.format("YYYY-MM-DD");
              const hasSchedule = scheduleDateSet.has(dateStr);
              const isSelected = selectDay === dateStr;
              const isToday = todayStr === dateStr;

              return (
                <div key={index}>
                  <button
                    type="button"
                    className="btn p-0 border-0 bg-transparent"
                    onClick={() => todayBtn(date)}
                  >
                    <div style={{ height: 20 }}>
                      {isToday && <span className="tp-state tp-state-ongoing">TODAY</span>}
                    </div>

                    <div
                      className={`px-3 py-2 tp-day ${isSelected ? "selected" : ""}`}
                      style={{ width: 72 }}
                    >
                      <div className="tp-day-num fs-4">{date.format("DD")}</div>
                      <div className="small">{date.format("dd")}</div>

                      <div className="mt-2 d-flex justify-content-center">
                        {hasSchedule ? (
                          <span className="tp-dot" />
                        ) : (
                          <span className="tp-dot" style={{ opacity: 0.3 }} />
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-2 col-md-1 d-flex justify-content-end">
          <button className="btn tp-btn fs-3" onClick={nextWeek} aria-label="다음 주">
            <MdNavigateNext />
          </button>
        </div>
      </div>

      {/* ===== 선택 날짜 가로 스크롤 ===== */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="tp-scroll-wrap p-3">
            <div className="d-flex flex-nowrap gap-3 overflow-auto">
              {schedule
                .filter(
                  (s) => selectDay === dayjs(s.scheduleStartDate).format("YYYY-MM-DD")
                )
                .map((s) => (
                  <div key={s.scheduleNo} className="flex-shrink-0" style={{ width: 420 }}>
                    <Link
                      to={`/schedulePage/${s.scheduleNo}`}
                      className="text-decoration-none text-dark d-block"
                    >
                      {/* ✅ row/col 말고 flex 카드로 고정 */}
                      <div className="tp-card shadow-sm p-3 d-flex gap-3 align-items-stretch">
                        {/* 이미지 */}
                        <div className="tp-img" style={{ width: 160, height: 120 }}>
                          <span className={`tp-state shadow-sm ${stateBadgeClass(s.scheduleState)}`}>
                            {s.scheduleState}
                          </span>
                          <img
                            style={{ height: "100%", width: "100%", objectFit: "cover" }}

                            className="w-100 border shadow-sm"
                            src={`http://localhost:8080/attachment/download/${s.scheduleImage}`

                            } onError={(e) => {
                              "/images/default-schedule.png";
                            }}
                          />
                        </div>



                        {/* 내용 */}
                        <div className="d-flex flex-column justify-content-center flex-grow-1">
                          <h5 className="fw-semibold tp-title text-truncate mb-2">
                            {s.scheduleName},
                          </h5>

                          <div className="tp-meta small mb-2 text-truncate">
                            {s.unitFirst?.scheduleUnitContent ? (
                              <>
                                {s.unitFirst.scheduleUnitContent}
                                {s.unitCount > 1 && ` 외 ${s.unitCount - 1}개`}
                              </>
                            ) : (
                              "세부 일정 없음"
                            )}
                          </div>

                          <div>
                            <span className="badge bg-white text-dark border shadow-sm">
                              {dayjs(s.scheduleStartDate).format("MM/DD(dd) A h:mm")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}

              {/* 일정 없을 때 */}
              {schedule.filter(
                (s) => selectDay === dayjs(s.scheduleStartDate).format("YYYY-MM-DD")
              ).length === 0 && (
                  <div className="w-100 text-center tp-meta py-4">
                    선택한 날짜에 일정이 없습니다
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 전체 일정 리스트 ===== */}
      <div className="row mt-4 g-3">
        {schedule.map((s) => (
          <div key={s.scheduleNo} className="col-12 col-md-6">
            {/* 부모 컨테이너에 position-relative 추가 */}
            <div className="position-relative h-100">

              {/* X 버튼 추가 */}
              <button
                className="btn btn-sm btn-link text-secondary position-absolute"
                style={{
                  top: "5px",
                  right: "5px",
                  zIndex: 10, // 카드보다 위에 오도록
                  textDecoration: "none"
                }}
                onClick={(e) => {
                  e.preventDefault(); // 링크 이동 방지
                  e.stopPropagation(); // 이벤트 버블링 방지
                  // 여기에 삭제 함수나 로직 추가 (예: onDelete(s.scheduleNo))
                  deleteSchedule(s.scheduleNo)
                }}
              >
                <i className="fa-solid fa-xmark fs-5"></i> {/* 폰트어썸 예시 (없으면 'X'로 대체) */}
                <span className="text-dark">✕</span>
              </button>

              <Link
                to={`/schedulePage/${s.scheduleNo}`}
                className="text-decoration-none text-dark d-block h-100"
              >
                <div className="tp-card shadow-sm p-3 d-flex gap-3 h-100 align-items-stretch">
                  <div className="tp-img" style={{ width: 160 }}>
                    <span className={`tp-state shadow-sm ${stateBadgeClass(s.scheduleState)}`}>
                      {s.scheduleState}
                    </span>
                    <img
                      style={{ height: "100%", width: "100%", objectFit: "cover" }}

                      className="w-100 border shadow-sm"
                      src={`http://localhost:8080/attachment/download/${s.scheduleImage}`} alt=""
                    />
                  </div>

                  <div className="d-flex flex-column justify-content-center flex-grow-1">
                    <h5 className="fw-semibold tp-title text-truncate mb-2 pe-3"> {/* X 버튼 공간을 위해 pe-3 추가 */}
                      {s.scheduleName}
                    </h5>

                    <div className="tp-meta small mb-2 text-truncate">
                      {s.unitFirst?.scheduleUnitContent ? (
                        <>
                          {s.unitFirst.scheduleUnitContent}
                          {s.unitCount > 1 && ` 외 ${s.unitCount - 1}개`}
                        </>
                      ) : (
                        "세부 일정 없음"
                      )}
                    </div>
                    <div>
                      <span className="badge bg-white text-dark border shadow-sm">
                        {dayjs(s.scheduleStartDate).format("MM/DD(dd) A h:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}