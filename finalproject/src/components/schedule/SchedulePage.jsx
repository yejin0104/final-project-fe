import { Route, Routes, useParams } from "react-router-dom";
import Reply from "./Reply";
import Review from "./Review";
import Schedule from "./Schedule";
import { useAtomValue } from "jotai";
import { loginIdState } from "../../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";



export default function SchedulePage() {

  const accountId = useAtomValue(loginIdState);
  const [memberList, setMemberList] = useState([]);

  const { scheduleNo } = useParams();

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => { toast.success("링크 복사 완료") });
  }, []);

  useEffect(()=>{

    async function loadMember() {
      const {data} = await axios.get(`/schedule/memberList/${scheduleNo}`);
      setMemberList(data);
      console.log("데이터확인 =", data);
    }

    loadMember();
    

  }, []);


  return (
    <>
      <div className="container">
        <div className=" map-area">
          <div className="schedule-list">

            <Schedule />

          </div>
          <div className="d-flex detail-box justify-content-center align-items-center">
            <div className="d-flex justify-content-center align-items-center box">
              <span>참여자 : </span>
              {memberList.map((member)=>(
                <span className="ms-1">{member.scheduleMemberNickname}</span>
              ))}
            </div>
            <div className="d-flex justify-content-center align-items-center box ms-2"
              onClick={copyUrl}>
              <FaLink /><span className="ms-1 point">일정 공유하기</span>
              </div>
          </div>
          <div className=" map">지도!!</div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col">
              <Reply />
              {/* <Review/> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
