import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom";
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState } from "../utils/jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { CiCalendar } from "react-icons/ci";
import dayjs from "dayjs";
import TermsModal from "./account/accountJoin/TermsModal";
import { Modal } from "bootstrap";

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import { toast } from "react-toastify";


export default function Menu() {
  // 이동 도구
  const navigate = useNavigate();

  // jotai state
  const [loginId, setloginId] = useAtom(loginIdState);
  const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
  const [accessToken, setAccessToken] = useAtom(accessTokenState);
  const [logincomplete, setLoginComplete] = useAtom(loginCompleteState);
  const isLogin = useAtomValue(loginState);
  const isAdmin = useAtomValue(adminState);
  const clearLogin = useSetAtom(clearLoginState);

  //state
  const [open, setOpen] = useState(false);

  // 화면이 로딩될때마다 accessToken이 있는 경우 axios에 설정하는 코드 구현
  useEffect(() => {
    if (accessToken?.length > 0) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
    //판정이 끝난 시점
    setLoginComplete(true);
  }, [accessToken]);

  //callback
  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  // 로그아웃
  const logout = useCallback(async (e) => {
    e.stopPropagation();//더 이상의 이벤트 확산을 금지
    e.preventDefault();//a태그 기본 동작도 금지

    clearLogin();

    await axios.delete("/account/logout");

    // axios에 설정된 헤더 제거
    delete axios.defaults.headers.common["Authorization"];

    // 메인페이지로 이동
    navigate("/");

    closeMenu();
  });


  {/* 추가 */ }

  const modal = useRef();
  const today = dayjs();

  // state
  const [tags, setTags] = useState([]);
  // const [tag, setTag] = useState([]); //보내기용 데이터
  const [selectTag, setSelectTag] = useState([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(null);
  const [scheduleName, setScheduleName] = useState("");
  const [checked, setChecked] = useState(false);


  //callback
  const openModal = useCallback(() => {
    cleanData();
    const instance = Modal.getOrCreateInstance(modal.current);
    instance.show();
    tagData();
  }, [modal])


  const closeModal = useCallback(() => {
    const instance = Modal.getInstance(modal.current);
    instance.hide();
  }, [modal])



  const tagData = useCallback(async () => {
    const { data } = await axios.get("http://localhost:8080/schedule/tagList");
    // console.log(data);
    // console.log(data[1].tagName);
    setTags(data);
  }, []);

  const tagCheck = useCallback((tagName) => {

    setSelectTag(prev => prev.includes(tagName) ?
      prev.filter(tag => tag !== tagName) : [...prev, tagName]);

  }, [selectTag])

  const cleanData = () => {
    setTags([]);
    setSelectTag([]);
    setStartDate(dayjs());
    setEndDate(null);
    setScheduleName("");
  };

  const sendDate = useCallback(async () => {

    try {
      const { data } = await axios.post("http://localhost:8080/schedule/insert",

        {
          scheduleName: scheduleName,
          scheduleOwner: "testuser1",
          scheduleStartDate: startDate ? startDate.format("YYYY-MM-DDTHH:mm:ss") : null,
          scheduleEndDate: endDate ? endDate.format("YYYY-MM-DDTHH:mm:ss") : null,
          tagNoList: selectTag

        })

      toast.success("[" + data.scheduleName + "] 일정, 등록 완료!");
      console.log("데이터 확인" + data.scheduleNo);
      closeModal();
      navigate(`/schedulePage/${data.scheduleNo}`);

    } catch (error) {
      toast.error("일정 등록이 실패되었습니다.");
    }

  }, [scheduleName, startDate]);



  // 카테고리 목록 만들기
  const categories = Array.from(new Set(tags.map(t => t.tagCategory)));



  return (
    <>

      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">메인</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor04" aria-controls="navbarColor04" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarColor04">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="/">Home
                  <span className="visually-hidden">(current)</span>
                </a>
              </li>
              {isLogin === true ? (<>
                {/* 로그인 시 나와야 하는 화면 */}
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" onClick={logout}>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>로그아웃</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="#">
                    <i className="fa-solid fa-user-plus"></i>
                    <span>{loginId} ({loginLevel})</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="/mypage">
                    <i className="fa-solid fa-user-plus"></i>
                    <span></span>
                  </Link>
                </li>
              </>) : (<>
                {/* 비로그인 시 나와야 하는 화면 */}
                <li className="nav-item" onClick={closeMenu}>
                  <Link className="nav-link" to="/account/login">
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>로그인</span>
                  </Link>
                </li>
                <li className="nav-item" onClick={closeMenu}>
                  {/* TermsModal 안에 "회원가입" 글자와 모달 로직이 다 들어있습니다 */}
                  <TermsModal />
                </li>
              </>)}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="#">Action</a>
                  <a className="dropdown-item" href="#">Another action</a>
                  <a className="dropdown-item" href="#">Something else here</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#">Separated link</a>
                </div>
              </li>
            </ul>
            {/* <form className="d-flex">
        <input className="form-control me-sm-2" type="search" placeholder="Search"/>
        <button className="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
      </form> */}

            <button
              className="btn btn-primary fs-5 d-flex align-items-center justify-content-center lh-1"
              href="#" type="button" onClick={openModal} >
              <CiCalendar className="fs-2 me-1" />새일정 등록하기
            </button>
          </div>
        </div>
      </nav>

      {/* 모달 */}
      <div className="modal" tabIndex="999" ref={modal} data-bs-focus="false">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">일정 등록하기</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true"></span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col">
                  <label className="form-label" >일정 제목</label>
                  <input
                    type="text" className="form-control" style={{ height: "57px" }}
                    value={scheduleName} onChange={(e) => setScheduleName(e.target.value)}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">


                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                    <DemoContainer
                      components={['DateTimePicker', 'DateTimePicker', 'DateTimePicker']}
                    >

                      <DemoItem>
                        <label className="form-label" >시작일</label>
                        <div className="form-check d-flex justify-content-end align-items-center ">
                          <input
                            type="checkbox" className="form-check-input" id="checkbox"
                            checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                          <label className="form-check-label ms-2" htmlFor="checkbox" >종료일 설정하기</label>
                        </div>

                        <DateTimePicker
                          format="YYYY / MM / DD (dd) HH:mm"
                          views={['year', 'month', 'day', 'hours', 'minutes']} value={startDate}
                          onChange={setStartDate} />
                      </DemoItem>
                      <DemoItem >
                        <label className={` form-label ${checked ? "d-block" : "d-none"}`}> 종료일</label>
                        <DateTimePicker className={`${checked ? "d-block" : "d-none"}`}
                          format="YYYY / MM / DD (dd) HH:mm" value={endDate}
                          onChange={setEndDate} disablePast minDateTime={startDate}
                          views={['year', 'month', 'day', 'hours', 'minutes']} />
                      </DemoItem>

                    </DemoContainer>
                  </LocalizationProvider>




                </div>
                <h4 className="mt-4">어떤 스타일의 일정인가요?</h4>
                {categories.map((category, index) => {
                  const categoryTegs = tags.filter(t => t.tagCategory === category)
                    .slice(0, 5); //카테고리당 5개만
                  return (
                    <>
                      <div className=" mt-2" key={category}>
                        <label className="form-label"
                          name="tagCategory" >{category}</label>
                      </div>

                      <div className="d-flex justify-content-center p-0 ">
                        {categoryTegs.map((tag) => (
                          <button
                            key={tag.tagNo} type="button"
                            name="tagName" onClick={() => tagCheck(tag.tagName)}
                            className={`btn m-auto ${selectTag.includes(tag.tagName) ? "btn-primary" : "btn-outline-primary"}`}>
                            #{tag.tagName}
                          </button>
                        ))}
                      </div>
                      {index !== categories.length - 1 && <hr className="my-3 w-90 mx-auto" />}
                    </>);
                })}
              </div>

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">취소</button>
              <button type="button" className="btn btn-primary" onClick={sendDate}>등록하기</button>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}