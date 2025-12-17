import "./Schedule.css";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { Link, Outlet, useLocation, useOutletContext, useParams } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";



export default function Schedule({ outletContext }) {

    const location = useLocation();
    // const isSearch = location.pathname.endsWith("/search");


    return (<>

        {/* 일정 리스트 */}
        <div className="row mt-1">
            {/* 탭 이동 버튼 */}
            <div className="col d-flex justify-content-center mb-3">
                <Link to="data" className="btn btn-primary w-100">리스트 보기</Link>
                <Link to="search" className="btn btn-outline-primary ms-2 w-100">장소 검색</Link>
            </div>

            {/* 상단 공통 섹션: 제목/날씨 (검색 시에도 보이면 좋음) */}
            <div className="col-12 d-flex mt-2 align-items-center justify-content-center">
                <span className="fs-3 mb-3"><TiWeatherPartlySunny /></span>
                <h4><span className="m-2">일정 제목</span></h4>
                <span className="badge bg-warning p-2 mb-2">계획중</span>
            </div>


            {/* 실제 내용 (ScheduleData 혹은 ScheduleSearch가 출력됨) */}
            <DndProvider backend={HTML5Backend}>
                <Outlet context={outletContext} />
            </DndProvider>


        </div>

        <div className="row">
            <div className="col">
                <h2></h2>
            </div>
        </div>

    </>)
}