import { useOutletContext } from "react-router-dom";
import MarkerListSection from "../dnd/MarkerListSection";
import { FaPlus } from "react-icons/fa6";
import { FaRoute } from "react-icons/fa";

export default function ScheduleData() {

    const {
        days, // 전체 days 객체
        markerData,
        setDays,
        setMarkerData,
        removeMarker,
        routes,
        addDays,
        setSelectedDay,
        searchAllRoot,
    } = useOutletContext();

    return (<>
        <div className="all-schedule-container">
            {Object.keys(days).map((dayKey) => (
                <div key={dayKey} className="day-group mb-5">
                    {/* 날짜별 구분선 */}
                    <div className="col-12 day-divider my-3">
                        <div className="p-2 border-start border-primary border-4 bg-light d-flex justify-content-between align-items-center"
                            onClick={() => setSelectedDay(dayKey)}>
                            <span className="fw-bold fs-5 text-primary">{dayKey} DAY</span>
                            <div>
                                {/* 날짜별 경로 버튼 */}
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={(e) => {
                                    e.stopPropagation(); // 부모 클릭 이벤트 방지
                                    searchAllRoot(dayKey); // 해당 날짜만 검색하도록 파라미터 전달
                                }}>경로보기</button>
                                <span className="badge bg-secondary">{days[dayKey].markerIds.length} Places</span>
                            </div>
                        </div>
                    </div>


                    {/* 해당 날짜의 마커 리스트 섹션 */}
                    <MarkerListSection
                        selectedDay={dayKey}
                        markerIds={days[dayKey].markerIds}
                        routes={routes}
                        markerData={markerData}
                        setDays={setDays}
                        setMarkerData={setMarkerData}
                        removeMarker={removeMarker}
                    />
                </div>

            ))}
            <div>
                <div className="d-grid gap-2">
                    <button className="btn btn-primary w-100 mb-2" onClick={searchAllRoot}>
                        <FaRoute className="me-2" /> 전체 경로 검색하기
                    </button>
                    <button className="btn btn-outline-success w-100" onClick={addDays}>
                        <FaPlus /> 날짜 추가
                    </button>
                </div>
            </div>
        </div>
    </>)
}