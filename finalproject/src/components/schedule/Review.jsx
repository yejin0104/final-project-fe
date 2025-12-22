import { useCallback, useEffect, useState } from "react";
import "./Schedule.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { TiDelete } from "react-icons/ti";
import { useAtomValue } from "jotai";
import { accessTokenState, loginIdState, loginLevelState } from "../../utils/jotai";

export default function Review() {

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

    const accessToken = useAtomValue(accessTokenState);
    const loginId = useAtomValue(loginIdState);
    const loginLevel = useAtomValue(loginLevelState);

    const [profileUrl, setProfileUrl] = useState("/images/default-profile.jpg");

    const cleanData = useCallback(() => {
        setInput("");
        setAccountName("");

    }, []);

    const { scheduleNo } = useParams();

    async function loadData() {

        try {
            // 1) 댓글 리스트
            const { data } = await axios.get(`/review/list/${scheduleNo}`);
            console.log("댓글데이터확인=", data);
            setReplyList(data);

            // 2) 대표 일정의 세부일정 리스트(객체 리스트)
            const { data: unitData } = await axios.get(`/review/unit/list/${scheduleNo}`);
            console.log("대표일정 세부일정확인=", unitData);
            setShowUnitList(unitData);

        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        loadData();

    }, []);

    async function loadReviewUnitList(reviewNo) {
        console.log("숫자" + reviewNo)
        const { data } = await axios.get(`/review/unit/${reviewNo}`);
        console.log("유닛리스트 데이터확인", data);
        setShowReviewUnitList(data); ''
    }

    const sendData = useCallback(async () => {


        try {
            const { data } = await axios.post("/review/insert",
                {
                    scheduleNo: Number(scheduleNo),
                    scheduleUnitList: scheduleUnitList,
                    reviewContent: input,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            cleanData();
            console.log("댓글데이터 확인 ", data);
            setAccountName(data.reviewWriterNickname);
            loadData();
            setScheduleUnitList([]);

        } catch (error) {
            console.log("insert failed", error?.response?.status, error?.response?.data, error?.message);
            toast.error("댓글 등록 실패");
        }

    }, [scheduleNo, scheduleUnitList, input, replyList])

    const deleteScheduleUnitNo = useCallback(async (reviewNo, scheduleUnitNo) => {
        try {
            await axios.delete(`/review/unit/${reviewNo}`, {
                params: { scheduleUnitNo }
            });
            console.log(scheduleUnitNo);
            loadData();
            toast.success("성공");

        } catch (error) {
            toast.error("실패");
        }

    }, [scheduleNo, scheduleUnitList, input, accessToken, cleanData]);

    const checkScheduleUnitNo = useCallback((scheduleUnitNo) => {

        setScheduleUnitList(prev => prev.includes(scheduleUnitNo) ?
            prev.filter(no => no !== scheduleUnitNo) : [...prev, scheduleUnitNo]);

    }, [scheduleUnitNo]);

    const sendUpdateReply = useCallback(async (reply) => {

        await axios.patch(`/review/${reply.reviewNo}`, {
            reviewContent: editReply
        });
        setEditReviewNo(null);
        loadData();
        loadReviewUnitList();

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
            cancelButtonText: "취소"
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "삭제 완료!",
                    icon: "success"
                });
                await axios.delete(`/review/${reply.reviewNo}`);

            }
            loadData();

        });

    }, [])

const canEdit = (reply) =>
  reply.reviewWriterType === "USER" && reply.accountId === loginId;


    return (
        <>
            <div className="row mt-2">
                <div className="col-12 reply-wrap-v3">
                    {/* 헤더 */}
                    <div className="reply-topbar-v3">
                        <div className="reply-title-v3"> 공개용 댓글</div>
                        <div className="reply-count-v3">{replyList.length}개</div>
                    </div>

                    <div className="reply-divider-v3" />

                    {/* 리스트 */}
                    <div className="reply-list-v3">
                        {replyList.map((reply, index) => (
                            <div className="reply-card-v3" key={reply.reviewNo}>
                                {/* 카드 헤더: 프로필/닉네임/시간 + 액션 */}
                                <div className="reply-card-head-v3">
                                    <div className="reply-user-v3">
                                        <div className="reply-avatar-wrap-v3">
                                            <img
                                                className="reply-avatar-v3"
                                                src={
                                                    (reply.attachmentNo ?? reply.attachments?.[0]?.attachmentNo)
                                                        ? `http://localhost:8080/attachment/download?attachmentNo=${reply.attachmentNo ?? reply.attachments?.[0]?.attachmentNo}`
                                                        : profileUrl
                                                }
                                                alt=""
                                            />
                                        </div>

                                        <div className="reply-user-meta-v3">
                                            <div className="reply-writer-v3">{reply.reviewWriterNickname}
                                            </div>
                                            <div className="reply-time-v3">{reply.reviewWtime}</div>
                                        </div>
                                    </div>

                                    {/* 버튼 영역 (기능/조건식 그대로) */}
                                    <div className="reply-actions-v3">
                                        {canEdit(reply) ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="reply-action-btn-v3"
                                                    onClick={() => updateReplyMode(reply)}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    type="button"
                                                    className="reply-action-btn-v3 danger"
                                                    onClick={() => deleteReply(reply)}
                                                >
                                                    삭제
                                                </button>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                {/* 댓글에 포함된 세부일정 태그: "표시만" (선택 state랑 분리) */}
                                {editReviewNo !== reply.reviewNo && reply.scheduleUnitNoList?.filter(Boolean).length > 0 && (
                                    <div className="reply-tags-v3">
                                        {reply.scheduleUnitNoList
                                            .filter(Boolean)
                                            .map((unitNo, index) => (
                                                <span key={`${reply.reviewNo}-${unitNo}`} className="reply-badge-mint">
                                                    {index + 1}번 일정 (#{unitNo})
                                                </span>
                                            ))}
                                    </div>
                                )}


                                {/* 내용 or 수정모드 (기존 기능 유지) */}
                                {editReviewNo === reply.reviewNo ? (
                                    <>
                                        {/* 수정모드: 삭제 pill (기존 기능 유지: deleteScheduleUnitNo + hoverIndex) */}
                                        <div className="reply-pills-v3 edit">
                                            {reply.scheduleUnitNoList
                                                ?.filter((unitNo, index) => unitNo)
                                                .map((unitNo, index) => (
                                                    <span
                                                        key={`${reply.reviewNo}-${unitNo}`}
                                                        className={`reply-pill-v3 danger ${hoverIndex === index ? "is-hover" : ""
                                                            }`}
                                                        onClick={() => deleteScheduleUnitNo(reply.reviewNo, unitNo)}
                                                        onMouseEnter={() => setHoverIndex(index)}
                                                        onMouseLeave={() => setHoverIndex(null)}
                                                    >
                                                        {index + 1}번 일정 (#{unitNo}) <TiDelete />
                                                    </span>
                                                ))}
                                        </div>

                                        <div className="reply-editbox-v3">
                                            <textarea
                                                className="reply-textarea-v3"
                                                value={editReply}
                                                onChange={(e) => setEditReply(e.target.value)}
                                            />
                                            <div className="reply-edit-actions-v3">
                                                <button
                                                    type="button"
                                                    className="reply-btn-v3 primary"
                                                    onClick={() => sendUpdateReply(reply)}
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    type="button"
                                                    className="reply-btn-v3"
                                                    onClick={() => setEditReviewNo(null)}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="reply-content-v3">{reply.reviewContent}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 아래 일정 리스트 (기존 기능 유지) */}
                    <div className="reply-selectwrap-v3">
                        <div className="reply-select-title-v3">일정 선택</div>
                        <div className="reply-select-list-v3">
                            {showunitList.map((unit, index) => {
                                const isSelect = scheduleUnitList.includes(unit.scheduleUnitNo);
                                return (
                                    <button
                                        type="button"
                                        key={unit.scheduleUnitNo}
                                        className={`reply-unit-btn-v3 ${isSelect ? "selected" : ""}`}
                                        onClick={() => {
                                            checkScheduleUnitNo(unit.scheduleUnitNo);
                                        }}
                                    >
                                        {index + 1}번 일정 (#{unit.scheduleUnitNo})
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    {/* 입력 바 (기존 기능 유지) */}
                    <div className="reply-inputbar-v3">
                        <input
                            className="reply-input-v3"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="button" className="reply-btn-v3 primary" onClick={sendData}>
                            등록
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

}