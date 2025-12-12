import { Route, Routes, useParams } from "react-router-dom";
import Reply from "./Reply";
import Review from "./Review";
import Schedule from "./Schedule";

export default function SchedulePage() {

  const {scheduleNo} = useParams();

  return (
    <>
      <div className="container">
        <div className=" map-area">
          <div className="schedule-list">

              <Schedule />

          </div>
          <div className="group">그룹원</div>
          <div className=" map">지도!!</div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col">
            <Reply/>
            {/* <Review/> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
