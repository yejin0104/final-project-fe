import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { accessTokenState, guestKeyState, loginLevelState } from "../../utils/jotai";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";



export function ShareGate() {

    const {shareKey} = useParams();

    const navigate = useNavigate();

    const setAccessToken = useSetAtom(accessTokenState);
    const setLoginLevel = useSetAtom(loginLevelState);
    const setGuestKey = useSetAtom(guestKeyState);

    const accessToken = useAtomValue(accessTokenState);
    const loginLevel = useAtomValue(loginLevelState);
    const guestKey = useAtomValue(guestKeyState);

    const [scheduleNo, setScheduleNo] = useState(null);

    const [nickname, setNickname] = useState("");

    const hasGuestToken = accessToken?.length > 0 && loginLevel === "비회원";

      const modal = useRef();

      //callback
      const openModal = useCallback(() => {

        const instance = Modal.getOrCreateInstance(modal.current);
        instance.show();

      }, [modal])
    
      const closeModal = useCallback(() => {
        const instance = Modal.getInstance(modal.current);
        instance.hide();
      }, [modal])

      //
      const readShareKey = useCallback(async ()=>{

            try {
                const {data} = await axios.post("/share/verify",  {shareKey});
                console.log("data : ",data);
                console.log("실행1");
                setScheduleNo(data);
                setLoginLevel("비회원");
                console.log("실행2");
            } catch (error) {
                toast.error("잘못된 경로입니다");
                console.log("실행3");
            }
      }, [shareKey, setScheduleNo, setLoginLevel]);

      const auth = useCallback(async ()=>{
         const {data} = await axios.post("/share/auth", {accessToken : accessToken});
         console.log(data);
      }, [accessToken]);

      const  guestToken= useCallback(async ()=>{
        const {data} = await axios.post("/share/token", {guestKey : guestKey});
        console.log("토큰 발급 !! ",data);
        setAccessToken(data.accessToken);
      }, [guestKey]);


    useEffect(()=>{

        (async () => {
            
            //공유키 검사
            await readShareKey();
            console.log("공유키 검사");

            console.log(hasGuestToken);

        if(hasGuestToken) { //토큰 있으면 검사 후 일정 페이지로
            await auth();
            console.log("토큰 있음 실행");
            navigate(`/schedulePage/${scheduleNo}`);

        }else {// 없으면 닉네임 입력 후 토큰 발행
            openModal();
        }
    })();
    }, []);

    const enterGuest = useCallback(async ()=>{
         const {data} = await axios.post("/share/enter",{guestNickname : nickname})
        console.log("접속!");
        console.log(data);
        setGuestKey(data.guestKey);
        await guestToken();
        navigate(`/schedulePage/${scheduleNo}`);

    }, [guestToken, nickname, scheduleNo]);


    return (<>
    <h2>비회원확인용</h2>

    <div className="modal" ref={modal}>
  <div className="modal-dialog" role="document">
    <div className="modal-content ">
      <div className="modal-header bg-primary text-white p-3">
        <h5 className="modal-title">비회원 접속</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true"></span>
        </button>
      </div>
      <div className="modal-body">
        <div className="row mt-2">
            <div className="col">
                <div>비회원으로 활동할 닉네임을 설정해주세요</div>
            </div>
        </div>
            <div className="row mt-3">
            <div className="col-9">
                <input type="text" className="form-control" onChange={(e)=>setNickname(e.target.value)} value={nickname}/>
            </div>
            <div className="col-3">
                <button type="button" className="btn btn-secondary">중복검사</button>
            </div>
            </div>
      </div>
      <div className="modal-footer mt-2">
        <button type="button" className="btn btn-danger" data-bs-dismiss="modal">취소</button>
        <button type="button" className="btn btn-primary" onClick={enterGuest}>접속하기</button>
      </div>
    </div>
  </div>
</div>
    
    </>)
}