import "./Schedule.css";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { Link, Outlet, useLocation } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";



export default function Schedule({ outletContext }) {

    const location = useLocation();
    // const isSearch = location.pathname.endsWith("/search");


    return (<>

        {/* 일정 리스트 */}
            {/* 탭 이동 버튼 */}
            {/* 일정 리스트 상단 제어 섹션 */}
            <div className="row mt-1 px-2">
                {/* 1. 탭 이동 버튼: 현재 경로에 따라 활성화 스타일 적용 */}
                <div className="col-12 d-flex justify-content-center mb-4 tab-group">
                    <Link
                        to="data"
                        className={`btn w-100 ${location.pathname.endsWith("/data") ? 'tab-active' : 'tab-inactive'}`}
                    >
                        리스트 보기
                    </Link>
                    <Link
                        to="search"
                        className={`btn w-100 ms-2 ${location.pathname.endsWith("/search") ? 'tab-active' : 'tab-inactive'}`}
                    >
                        장소 검색
                    </Link>
                </div>

                {/* 2. 상단 공통 섹션: 제목/날씨 */}
                <div className="col-12">
                    <div className="schedule-header d-flex align-items-center justify-content-center shadow-sm">
                        <span className="weather-icon"><TiWeatherPartlySunny /></span>
                        <h5 className="schedule-title mb-0">{outletContext.scheduleDto.scheduleName}</h5>
                        <span className="badge rounded-pill bg-warning ms-2 text-dark" style={{ fontSize: '0.75rem' }}>계획중</span>
                    </div>
                </div>

                {/* 3. 이동 수단 선택 */}
                <div className="col-12 text-center mt-3">
                    <p className="option-group-label mb-2">이동 수단</p>
                    <div className="d-flex justify-content-center">
                        <button
                            type="button"
                            className={`btn btn-option ${outletContext.selectedSearch === "CAR" ? "active" : ""}`}
                            name="CAR"
                            onClick={outletContext.selectSearch}
                        >
                            자동차
                        </button>
                        <button
                            type="button"
                            className={`btn btn-option ${outletContext.selectedSearch === "WALK" ? "active" : ""}`}
                            name="WALK"
                            onClick={outletContext.selectSearch}
                        >
                            도보
                        </button>
                    </div>
                </div>

                {/* 4. 경로 옵션 선택 */}
                <div className="col-12 text-center mt-3 mb-3">
                    <p className="option-group-label mb-2">경로 최적화</p>
                    <div className="d-flex justify-content-center flex-wrap gap-1">
                        <button
                            type="button"
                            className={`btn btn-option ${outletContext.selectedType?.RECOMMEND ? "active" : ""}`}
                            name="RECOMMEND"
                            onClick={outletContext.selectType}
                        >
                            추천경로
                        </button>
                        <button
                            type="button"
                            className={`btn btn-option ${outletContext.selectedType?.TIME ? "active" : ""}`}
                            name="TIME"
                            onClick={outletContext.selectType}
                        >
                            최단시간
                        </button>
                        <button
                            type="button"
                            className={`btn btn-option ${outletContext.selectedType?.DISTANCE ? "active" : ""}`}
                            name="DISTANCE"
                            onClick={outletContext.selectType}
                        >
                            최단길이
                        </button>
                    </div>
                </div>
            </div>



            {/* 실제 내용 (ScheduleData 혹은 ScheduleSearch가 출력됨) */}
            <DndProvider backend={HTML5Backend}>
                <Outlet context={outletContext} />
            </DndProvider>



    </>)
}