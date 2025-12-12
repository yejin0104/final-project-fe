import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import dayjs from "dayjs";
import 'dayjs/locale/ko';  
import { useState } from "react";
export default function ScheduleList() {

    const today = dayjs();
    const todayStr = today.format("YYYY-MM-DD");
    console.log(today.format("YYYY-MM-DD"));
    dayjs.locale('ko')
    
    const [baseDate, setBaseDate] = useState(dayjs());
    const week = [...Array(7)].map((_, i) => baseDate.add(i-3, "day"));
    console.log(today);

    const prevWeek = () => {
        setBaseDate(prev=>prev.subtract(1, "week"))
    }

    const nextWeek = () => {
        setBaseDate(prev => prev.add(1, "week"))
    }

  return (
    <>
      <div className="row mt-5">
        <div className="col-2 col-md-1">
          <button className="btn btn-primary p-2 fs-3" onClick={prevWeek}>
            <MdNavigateBefore />
          </button>
        </div>
        <div className="col-8 col-md-10 d-flex flex-row flex-wrap justify-content-center ">
            {week.map((date, index)=> {

                const dayOfWeek = date.day(); // 0=일, 6=토
                
                //요일에 따른 클래스
                const colorClass = dayOfWeek === 0 ? "text-danger" : dayOfWeek === 6 ? "text-primary" : "text-dark";
                const todayClass = todayStr === date.format("YYYY-MM-DD") ? "today" : "";
                return (
            <div className={`flex-column fs-4 mx-1 mx-sm-2 mx-lg-4 mx-md-4   ${colorClass} ${todayClass}`} key={index}>
                <div className="px-md-0 px-lg-2">{date.format("DD")}</div>
                <div className="px-md-0 px-lg-2">{date.format("dd")}</div>
                </div>
            
            )})}
        </div>

        <div className="col-2 col-md-1">
          <button className="btn btn-primary  p-2 fs-3" onClick={nextWeek}>
            <MdNavigateNext />
          </button>
        </div>
      </div>
      <div className="row mt-4 g-2">
        
        <div className="col-md-6 ">
            <div className="row py-3 card-area mx-1">
                <div className="schedule-img col-6">
                    <span className="schedule-state badge bg-danger">진행중</span>
                    <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL"/>
                </div>
                <div className="col-6">
                    <div><h4>일정 제목</h4></div>
                    <div><span>1번 일정 외 X개</span></div>
                    <div><span>총 예상 소요시간</span></div>
                    <div className=""><span>시작일</span></div>
                </div>
            </div>
        </div>


        <div className="col-md-6 ">
            <div className="row py-3 card-area mx-1">
                <div className="schedule-img col-6">
                    <span className="schedule-state badge bg-danger">진행중</span>
                    <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL"/>
                </div>
                <div className="col-6">
                    <div><h4>일정 제목</h4></div>
                    <div><span>1번 일정 외 X개</span></div>
                    <div><span>총 예상 소요시간</span></div>
                    <div className=""><span>시작일</span></div>
                </div>
            </div>
        </div>


        <div className="col-md-6 ">
            <div className="row py-3 card-area mx-1">
                <div className="schedule-img col-6">
                    <span className="schedule-state badge bg-danger">진행중</span>
                    <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL"/>
                </div>
                <div className="col-6">
                    <div><h4>일정 제목</h4></div>
                    <div><span>1번 일정 외 X개</span></div>
                    <div><span>총 예상 소요시간</span></div>
                    <div className=""><span>시작일</span></div>
                </div>
            </div>
        </div>


        <div className="col-md-6 ">
            <div className="row py-3 card-area mx-1">
                <div className="schedule-img col-6">
                    <span className="schedule-state badge bg-danger">진행중</span>
                    <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL"/>
                </div>
                <div className="col-6">
                    <div><h4>일정 제목</h4></div>
                    <div><span>1번 일정 외 X개</span></div>
                    <div><span>총 예상 소요시간</span></div>
                    <div className=""><span>시작일</span></div>
                </div>
            </div>
        </div>


        <div className="col-md-6 ">
            <div className="row py-3 card-area mx-1">
                <div className="schedule-img col-6">
                    <span className="schedule-state badge bg-danger">진행중</span>
                    <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL"/>
                </div>
                <div className="col-6">
                    <div><h4>일정 제목</h4></div>
                    <div><span>1번 일정 외 X개</span></div>
                    <div><span>총 예상 소요시간</span></div>
                    <div className=""><span>시작일</span></div>
                </div>
            </div>
        </div>


        <div className="col-md-6 ">
            <div className="row py-3 card-area mx-1">
                <div className="schedule-img col-6">
                    <span className="schedule-state badge bg-danger">진행중</span>
                    <img className=" rounded w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200326112404471_thumbL"/>
                </div>
                <div className="col-6">
                    <div><h4>일정 제목</h4></div>
                    <div><span>1번 일정 외 X개</span></div>
                    <div><span>총 예상 소요시간</span></div>
                    <div className=""><span>시작일</span></div>
                </div>
            </div>
        </div>

      </div>
    </>
  );
}
