import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, redirect, useNavigate, useParams } from "react-router-dom"
import { accessTokenState, guestKeyState, loginIdState, loginLevelState } from "../../utils/jotai";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";
import { guestNicknameState } from "../../../../test-kakaopay/src/utils/jotai";
import "./ShareGate.css";


export function ShareGate() {

  const { shareKey } = useParams();

  const navigate = useNavigate();

  const setAccessToken = useSetAtom(accessTokenState);
  const setLoginLevel = useSetAtom(loginLevelState);
  const setGuestKey = useSetAtom(guestKeyState);

  const accessToken = useAtomValue(accessTokenState);
  const loginLevel = useAtomValue(loginLevelState);
  const guestKey = useAtomValue(guestKeyState);
  const [checkNickname, setCheckNickname] = useState(null);

  const [scheduleNo, setScheduleNo] = useState(null);
  const loginId = useAtomValue(loginIdState);

  const [nickname, setNickname] = useState("");
  const setGuestNickname = useSetAtom(guestNicknameState);

  const hasGuestToken = accessToken?.length > 0 && loginLevel === "비회원";

  const modal = useRef();

  //callback
  const openModal = useCallback(() => {

    const instance = Modal.getOrCreateInstance(modal.current);
    instance.show();

  }, [modal])

const closeModal = useCallback(() => {
  if (!modal.current) return;

  const instance =
    Modal.getInstance(modal.current) || Modal.getOrCreateInstance(modal.current);

  instance.hide();
}, []);


  //
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.post("/share/verify", { shareKey });
        setScheduleNo(data);
        // 여기서 "비회원"을 강제로 박아도 되는데, 회원이면 덮어써질 수 있어서 주의
        // setLoginLevel("비회원");
      } catch (e) {
        toast.error("잘못된 경로입니다");
      }
    })();
  }, [shareKey]);


  const auth = useCallback(async () => {
    const { data } = await axios.post("/share/auth", {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(data);
    return data;
  }, [accessToken]);


  useEffect(() => {
    if (!scheduleNo) return; // 공유키 검증 끝나기 전이면 대기

    if (hasGuestToken) {
      (async () => {
        await auth();
        closeModal();
        navigate(`/schedulePage/${scheduleNo}`);
      })();
    }
    if (loginId?.length > 0) {
      closeModal();
      navigate(`/schedulePage/${scheduleNo}`);
    }
    else {
      openModal();
    }
  }, [scheduleNo, hasGuestToken, auth, navigate, openModal]);


  const enterGuest = useCallback(async () => {
    const { data } = await axios.post("/share/enter", { guestNickname: nickname })
    console.log("접속!");
    console.log(data);
    setGuestKey(data.guestKey);
    setAccessToken(data.accessToken);
    setLoginLevel("비회원");
    setGuestNickname(data.guestNickname);
    closeModal();

  }, [nickname, scheduleNo, closeModal, navigate, setGuestKey, setAccessToken, setLoginLevel]);

  const checkByNickname = useCallback(async () => {
    const { data } = await axios.post(`/share/nickname/${nickname}`);
    setCheckNickname(data);
  }, [nickname]);

 const goLogin = useCallback(() => {
  closeModal();

  navigate("/account/login", {
    state: { redirectTo: `/schedulePage/${scheduleNo}` },
    replace: true,
  });
}, [navigate, scheduleNo]);

  return (<>
    <div className="modal" ref={modal}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content sharegate-modal">
          <div className="modal-header sharegate-header">
            <div className="d-flex flex-column">
              <h5 className="modal-title mb-1">비회원 접속</h5>
              <small className="sharegate-subtitle">닉네임 하나로 바로 참여할 수 있어요</small>
            </div>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body sharegate-body">
            <div className="sharegate-tip">
              <span className="sharegate-tip-badge">TIP</span>
              <span>닉네임은 일정 댓글/리뷰에 표시됩니다</span>
            </div>

            <div className="mt-3">
              <label className="sharegate-label">비회원 닉네임</label>

              <div className="row g-2 align-items-start mt-1">
                <div className="col-9">
                  <input
                    type="text"
                    className={`form-control sharegate-input ${checkNickname === null
                      ? ""
                      : checkNickname
                        ? "is-invalid"
                        : "is-valid"
                      }`}
                    placeholder="예) 따뜻한여행자"
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setCheckNickname(null);
                    }}
                    value={nickname}
                  />

                  {checkNickname === null ? null : checkNickname ? (
                    <div className="invalid-feedback">이미 사용중인 닉네임입니다. 다시 작성해주세요.</div>
                  ) : (
                    <div className="valid-feedback">멋진 닉네임입니다!</div>
                  )}
                </div>

                <div className="col-3 d-grid">
                  <button
                    type="button"
                    className="btn sharegate-btn-outline"
                    onClick={checkByNickname}
                    disabled={!nickname?.trim()}
                  >
                    중복검사
                  </button>
                </div>
              </div>
            </div>

            <div className="sharegate-divider my-4" />

            <div className="sharegate-loginbox">
              <div className="sharegate-login-title">TripPlanner 회원이신가요?</div>
              <div className="sharegate-login-desc">로그인하면 내 일정/참여 기록을 더 편하게 관리할 수 있어요</div>
              <button
                type="button"
                className="sharegate-login-link btn btn-link p-0"
                onClick={goLogin}
              >
                로그인 하러 가기 →
              </button>
            </div>
          </div>

          <div className="modal-footer sharegate-footer">
            <button type="button" className="btn sharegate-btn-ghost" data-bs-dismiss="modal">취소</button>
            <button
              type="button"
              className="btn sharegate-btn-primary"
              onClick={enterGuest}
              disabled={checkNickname || !nickname?.trim()}
            >
              접속하기
            </button>
          </div>
        </div>
      </div>
    </div>

  </>)
}