import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";


export default function MySchedule() {
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

    if (!accountId) return;

    async function loadData() {
      const { data } = await axios.get(`/schedule/list/${accountId}`);
      setSchedule(data);
      console.log(data);
      // if(data.)
    }
    loadData();
  }, [accountId]);

  const todayBtn = useCallback((day) => {
    setSelectDay(day.format("YYYY-MM-DD"));
    console.log(day.format("YYYY-MM-DD"));
  }, [selectDay]);

  const scheduleDateSet = new Set();
  for (const s of schedule) {
    const day = dayjs(s.scheduleStartDate).format("YYYY-MM-DD");
    scheduleDateSet.add(day);
    console.log(scheduleDateSet);
  }

    //render
    return (<>
        <div className="row mt-5">
                <div className="col-2 col-md-1 ">
                  <button className="btn btn-primary p-2 fs-3" onClick={prevWeek}>
                    <MdNavigateBefore />
                  </button>
                </div>
                <div className=" col-8 col-md-10 d-flex flex-row flex-wrap justify-content-center ">
                  {week.map((date, index) => {
        
                    const dayOfWeek = date.day(); // 0=일, 6=토
        
                    //요일에 따른 클래스
                    const colorClass = dayOfWeek === 0 ? "text-danger" : dayOfWeek === 6 ? "text-primary" : "text-dark";
                    const todayClass = todayStr === date.format("YYYY-MM-DD") ? "today" : "";
        
                    //일정 있는지 확인
                    const dateStr = date.format("YYYY-MM-DD");
                    const hasSchedule = scheduleDateSet.has(dateStr);
        
                    return (<div className="day-wrapper " key={index}>
                      <div className="">
                        {today.format("YYYY-MM-DD") === date.format("YYYY-MM-DD") && (<span className="todayBg badge bg-success">TODAY</span>)}
                      </div>
        
                      <div className={`flex-column fs-4 mx-1 mx-sm-2 mx-lg-4 mx-md-4    ${colorClass} ${todayClass}
                        ${selectDay === date.format("YYYY-MM-DD") ? "selectday" : ""}`}
                        onClick={() => todayBtn(date)}>
                        <div className="px-md-0 px-lg-2">{date.format("DD")}</div>
                        <div className="px-md-0 px-lg-2">{date.format("dd")}</div>
                      </div>
                      {(!hasSchedule && selectDay === dateStr) && (
                        <button type="button" className="btn btn-secondary" >일정 없음</button>
                      )}
                    </div>
                    )
                  })}
                </div>
        
                <div className="col-2 col-md-1">
                  <button className="btn btn-primary  p-2 fs-3" onClick={nextWeek}>
                    <MdNavigateNext />
                  </button>
                </div>
              </div>
        
              <div className="row d-flex flex-nowrap align-items-center overflow-auto border rounded bg-dark mt-3">
                {schedule.map((schedule) => (
                  <>
                    {selectDay === dayjs(schedule.scheduleStartDate).format("YYYY-MM-DD") && (
                      <div key={schedule.scheduleNo} className="col-md-6 fs-4 m-2 selectDay ">
                        <Link to={`/schedulePage/${schedule.scheduleNo}`} className="text-decoration-none text-dark d-inline-block">
                          <div className="row py-3 card-area mx-1">
                            <div className="schedule-img col-6">
                              <span className="schedule-state badge bg-danger border">{schedule.scheduleState}</span>
                              <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL" />
                            </div>
                            <div className="col-6 d-flex flex-column justify-content-center">
                              <div><h3 className="fw-semibold">{schedule.scheduleName}</h3></div>
                              <div><span>{schedule.unitFirst?.scheduleUnitContent ? (<>
                                <span className="">{schedule.unitFirst.scheduleUnitContent}</span> {schedule.unitCount > 1 && `외 ${schedule.unitCount - 1}개`}
                              </>) : (
                                "세부 일정 없음"
                              )}</span></div>
                              <div className="mt-1"><span>{dayjs(schedule.scheduleStartDate).format("MM/DD(dd) A h:mm")}</span></div>
                            </div>
                          </div>
        
                        </Link>
                      </div>
                    )}
                  </>
                ))}
              </div>
        
        
        
              <div className="row mt-4 g-2">
        
                {schedule.map((schedule) => (
                  <div key={schedule.scheduleNo} className="col-md-6 fs-4 list schedule-item ">
                    <Link to={`/schedulePage/${schedule.scheduleNo}`} className="text-decoration-none text-dark ">
        
                      <div className="row py-3 card-area mx-1">
                        <div className="schedule-img col-6">
                          <span className="schedule-state badge bg-danger border">{schedule.scheduleState}</span>
                          <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL" />
                        </div>
                        <div className="col-6 d-flex flex-column justify-content-center">
                          <div><h3 className="fw-semibold">{schedule.scheduleName}</h3></div>
                          <div><span>{schedule.unitFirst?.scheduleUnitContent ? (<>
                            <span className="">{schedule.unitFirst.scheduleUnitContent}</span> {schedule.unitCount > 1 && `외 ${schedule.unitCount - 1}개`}
                          </>) : (
                            "세부 일정 없음"
                          )}</span></div>
                          <div className="mt-1"><span>{dayjs(schedule.scheduleStartDate).format("MM/DD(dd) A h:mm")}</span></div>
                        </div>
                      </div>
        
                    </Link>
                  </div>
                ))}
        
        
        
        
        
              </div>
    </>)
}