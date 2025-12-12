import { useCallback, useEffect, useState } from "react";
import "./Schedule.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { TiDelete } from "react-icons/ti";


export default function Reply() {

  const [input, setInput] = useState("");
  const [replyList, setReplyList] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [time, setTime] = useState(null);
  const [scheduleUnitNo, setScheduleUnitNo] = useState("");
  const [scheduleUnitList, setScheduleUnitList] = useState([]);
  const [showunitList, setShowUnitList] = useState([]);
  const [editReviewNo, setEditReviewNo] = useState(null);
  const [editReply, setEditReply] = useState("");
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showReviewUnitList, setShowReviewUnitList] = useState([]);

    const cleanData = useCallback(() => {
      setInput("");
      setAccountName("");

  }, []);

  const { scheduleNo } = useParams();

  async function loadReplyList() {

    try {
      const { data } = await axios.get(`http://localhost:8080/review/list/${scheduleNo}`);

      setReplyList(data);

    } catch (error) {
      <h2>대기중</h2>
    }
  };

  async function loadScheduleUnitList() {

    try {
      const { data } = await axios.get(`http://localhost:8080/review/list/${scheduleNo}/unit`);
      console.log(data[1].scheduleUnitNo);
      setShowUnitList(data);

    } catch (error) {

    }
  }
  useEffect(() => {
    loadReplyList();
    loadScheduleUnitList();
  }, []);

  async function loadReviewUnitList(reviewNo) {
    console.log("숫자"+reviewNo)
    const {data} = await axios.get(`http://localhost:8080/review/unit/${reviewNo}`);
    console.log(data);
    setShowReviewUnitList(data);
  }



  const sendData = useCallback(async () => {

    cleanData();
    try {
      const { data } = await axios.post("http://localhost:8080/review/insert",
        {
          scheduleNo: Number(scheduleNo),
          scheduleUnitList: scheduleUnitList,
          reviewContent: input,
        }
      );
      setAccountName(data.reviewWriterNickname);
    loadReplyList();
    loadScheduleUnitList();

    } catch (error) {

    }

  }, [scheduleNo, scheduleUnitList, input, replyList])

  const deleteScheduleUnitNo = useCallback(async (scheduleUnitNo)=>{
    console.log(scheduleUnitNo);
    await axios.delete(`http://localhost:8080/review/unit/${scheduleUnitNo}`);
        loadReplyList();
    
  }, []);

  const checkScheduleUnitNo = useCallback((scheduleUnitNo) => {

    setScheduleUnitList(prev => prev.includes(scheduleUnitNo) ?
      prev.filter(no => no !== scheduleUnitNo) : [...prev, scheduleUnitNo]);

  }, [scheduleUnitNo]);

  const sendUpdateReply = useCallback( async (reply) => {

      await axios.patch(`http://localhost:8080/review/${reply.reviewNo}`, {
      reviewContent : editReply
     });
     setEditReviewNo(null);
    loadReplyList();
    loadScheduleUnitList();

  }, [editReply]);

  const updateReplyMode = useCallback((reply) => {

    loadReviewUnitList(reply.reviewNo);
    setEditReply(reply.reviewContent);
    setEditReviewNo(reply.reviewNo);

  }, [editReviewNo, editReply]);

  const deleteReply = useCallback((reply) => {

    Swal.fire({
  title: "댓글을 삭제하시겠습니까?",
  text: "삭제 후에는 복구가 불가능합니다.",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "삭제",
  cancelButtonText : "취소"
}).then(async (result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: "삭제 완료!",
      icon: "success"
    });
    await axios.delete(`http://localhost:8080/review/${reply.reviewNo}`);
    loadReplyList();
  }
  
  loadScheduleUnitList();
});
    
  }, [])

  return (
    <>
      {/* 댓글 박스 영역 */}
      <div className="row mt-2">
        <div className="col-12 border">
          {/* 댓글 개수 헤더 */}
          <div className="row">
            <div className="col-12 m-3">
              <span>댓글 {replyList.length}</span>
            </div>
            {/* <hr /> */}
          </div>

          {/* 댓글 한 줄 */}
          {replyList.map((reply) => (
            <div className="row mt-1" key={reply.reviewNo}>
              {/* 프로필 이미지 */}
              <div className="col-12 col-sm-5 col-md-4 d-flex justify-content-center">
                <img
                  className="member-img"
                  src="https://img.freepik.com/free-photo/closeup-shot-cute-golden-retriever-puppy-resting-grass-ground_181624-21135.jpg?semt=ais_hybrid&w=740&q=80"
                />
              </div>
              {/* 닉네임 + 내용 */}
              {editReviewNo === reply.reviewNo ? (<>               
               {/* 댓글 수정화면 */}
              <div className="col-12 col-sm-7 col-md-8 text-center text-sm-start ">
                {/* <div className="mb-2">
                  <span className="fs-6">{reply.reviewWriterNickname}</span>
                  <span className="ms-2">({reply.reviewWtime})</span>
                </div> */}
                <div className={`my-3 d-flex align-items-center `}>
                  {showReviewUnitList.map((unit, index) => (
                <span key={unit.scheduleUnitNo} 
                className={`border border-secondary p-1 rounded me-1 small ${hoverIndex === index && "bg-secondary text-white"}`}
                  onClick={(e) => deleteScheduleUnitNo(unit.scheduleUnitNo)} 
                  onMouseEnter={()=>setHoverIndex(index)} onMouseLeave={()=>setHoverIndex(null)}>
                  {index + 1}번 일정<TiDelete/>
                </span>
              ))}
              </div>
                <textarea className="fs-5 form-control no-resize h-60"
                value={editReply} onChange={(e)=>{setEditReply(e.target.value)}} />
              </div>
              <div className="fs-4 text-center text-md-end mt-2">
                <button className="btn btn-primary ms-2 " onClick={() => sendUpdateReply(reply)}>저장</button>
                <button className="btn btn-warning ms-2 " onClick={()=> setEditReviewNo(null)}>취소</button>
              </div>
              </>
              ) :(
                <>
              <div className="col-12 col-sm-7 col-md-8 text-center text-sm-start mt-2 ">
                <div className="mb-2">
                  <span className="fs-6">{reply.reviewWriterNickname}</span>
                  <span className="ms-2">({reply.reviewWtime})</span>
                </div>
                <div>
                  {showunitList.map((unit, index) => (
                <span key={unit.scheduleUnitNo} className="border border-secondary p-1 rounded me-1 small" value={unit.scheduleUnitNo}
                  onClick={(e) => checkScheduleUnitNo(e.target.value)}>
                  {index + 1}번 일정
                </span>
              ))}
              </div>
              <div className="mt-2">
                <span className="fs-5">{reply.reviewContent}</span>
              </div>
              </div>
              <div className="fs-4 text-center text-md-end">
                <button className="btn btn-primary ms-2 " onClick={() => updateReplyMode(reply)}>수정</button>
                <button className="btn btn-warning ms-2 " onClick={() => deleteReply(reply)}>삭제</button>
              </div>
                </>
              )}



              {/* 구분선 */}
              <hr className="divider mt-3" />
            </div>

          ))}

          {/* 아래 일정 리스트 영역 */}
          <div className="row ">
            <div className="col m-110 d-flex gap-2 flex-wrap">
              {showunitList.map((unit, index) => (
                <button key={unit.scheduleUnitNo} className="btn btn-secondary small" value={unit.scheduleUnitNo}
                  onClick={(e) => checkScheduleUnitNo(e.target.value)}>
                  {index + 1}번 일정
                </button>
              ))}
            </div>
          </div>
          <div className="row mt-1">
            <div className="col d-flex align-items-center gap-2 m-2">
              <button className="btn btn-primary text-nowrap p-3 fs-6">사진</button>
              <input className="form-control py-3 m-2"
                value={input} onChange={(e) => setInput(e.target.value)} />
              <button
                className="btn btn-primary text-nowrap p-3 fs-6"
                onClick={sendData}>등록</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
