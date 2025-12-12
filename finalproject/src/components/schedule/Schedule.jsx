import { FaSearchLocation } from "react-icons/fa";
import "./Schedule.css";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";



export default function Schedule() {

    const location = useLocation();
    const isSearch = location.pathname.endsWith("/shearch");

    

    return (<>

        {/* 일정 리스트 */}
        <div className="row mt-1">
            <div className="col d-flex justify-content-center">
                <Link to="data" className="btn btn-primary w-100">리스트</Link>
                <Link to="shearch" className="btn btn-primary ms-2 w-100">검색</Link>
            </div>

            { isSearch ? (<>
            <div className="col-12 mt-2 d-flex item-group">
                <input className="form-control" placeholder="검색어 입력" />
                <div className="fs-3 input-group-text"><FaSearchLocation /></div>
            </div>
            
                </>) : (<>
            <div className="col-12 d-flex mt-2 align-items-center justify-content-center">
                <span className="fs-3 mb-3"><TiWeatherPartlySunny /></span>
                <h4><span className="m-2">일정 제목</span></h4>
                <span className="badge bg-warning p-2 mb-2">계획중</span>
            </div>
                
                </>)
            }

            <Outlet/>


        </div>

        <div className="row">
            <div className="col">
                <h2></h2>
            </div>
        </div>

    </>)
}