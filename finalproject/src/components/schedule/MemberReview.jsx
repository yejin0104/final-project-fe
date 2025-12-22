import "./MemberReview.css";
import { useMemo, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Modal } from "bootstrap";

export default function MemberReview({
  reviews = [],
  canWrite = true,
  isGuest = false,
  onSubmit,
}) {
  const modalRef = useRef(null);

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  // ✅ ShareGate 방식: Modal.getOrCreateInstance(ref).show()
  const openModal = useCallback(() => {
    if (!modalRef.current) return;
    const instance = Modal.getOrCreateInstance(modalRef.current);
    instance.show();
  }, []);

  // ✅ ShareGate 방식: getInstance() 없을 수도 있으니 안전하게
  const closeModal = useCallback(() => {
    if (!modalRef.current) return;
    const instance =
      Modal.getInstance(modalRef.current) ||
      Modal.getOrCreateInstance(modalRef.current);
    instance.hide();
  }, []);

  const prettyTime = useCallback((wtime) => {
    if (!wtime) return "";
    const diff = Date.now() - Number(wtime);
    const min = Math.floor(diff / 60000);
    if (min < 1) return "방금 전";
    if (min < 60) return `${min}분 전`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}시간 전`;
    const day = Math.floor(hour / 24);
    return `${day}일 전`;
  }, []);

  const avgRating = useMemo(() => {
    if (!reviews?.length) return 0;
    const sum = reviews.reduce(
      (acc, r) => acc + (Number(r.reviewRating) || 0),
      0
    );
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const submitReview = useCallback(async () => {
    const text = content.trim();
    if (!text) {
      toast.warning("후기를 입력해주세요!");
      return;
    }

    try {
      await onSubmit?.({ reviewContent: text, reviewRating: rating });
      toast.success("후기 등록 완료!");
      setContent("");
      setRating(5);
      closeModal();
    } catch (e) {
      toast.error("후기 등록 실패");
    }
  }, [content, rating, onSubmit, closeModal]);

  return (
    <>
      <div className="review-section">
        <div className="review-top">
          <div className="review-title-wrap">
            <h5 className="review-title">후기</h5>
            <div className="review-sub">
              {reviews?.length ? (
                <>
                  <span className="review-count"> {reviews.length}개</span>
                </>
              ) : (
                <span className="review-empty-hint">
                  아직 후기가 없어요. 첫 후기를 남겨보세요!
                </span>
              )}
            </div>
          </div>

          {canWrite && (
            <button
              type="button"
              className="review-write-btn"
              onClick={openModal}
            >
              + 후기 작성
            </button>
          )}
        </div>

        <div className="review-list">
          {!reviews?.length ? (
            <div className="review-empty">
              <div className="review-empty-icon">🗺️</div>
              <div className="review-empty-title">여행의 한 줄, 기다리는 중</div>
              <div className="review-empty-desc">
                참여자들이 느낀 분위기/팁을 공유해보세요.
              </div>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                className={`review-card ${r.muted ? "muted" : ""}`}
                key={r.reviewNo ?? `${r.reviewWriterNickname}-${r.reviewWtime}`}
              >
                <div className="review-header">
                  <div className="review-avatar">
                    <span className="review-avatar-txt">
                      {(r.reviewWriterNickname || "?").slice(0, 1)}
                    </span>
                  </div>

                  <div className="review-meta">
                    <div className="review-writer-row">
                      <div className="review-writer">
                        {r.reviewWriterNickname ?? "익명"}
                        {r.isGuest && (
                          <span className="review-guest-tag">비회원</span>
                        )}
                      </div>

                    </div>

                    <div className="review-time">{prettyTime(r.reviewWtime)}</div>
                  </div>
                </div>

                <div className="review-body">{r.reviewContent}</div>

                {(r.reviewImages?.length ?? 0) > 0 && (
                  <div className="review-images">
                    {r.reviewImages.slice(0, 3).map((img, idx) => (
                      <div className="review-img" key={idx}>
                        <img src={img.url} alt="" />
                      </div>
                    ))}
                    {r.reviewImages.length > 3 && (
                      <div className="review-img-more">
                        +{r.reviewImages.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 후기 작성 모달 (ShareGate 방식으로 제어) */}
      <div className="modal" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content review-modal">
            <div className="modal-header review-modal-header">
              <div className="d-flex flex-column">
                <h5 className="modal-title mb-1">후기 작성</h5>
                <small className="review-modal-subtitle">
                  참여자들에게 도움이 되는 한 줄을 남겨주세요
                </small>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeModal}
                aria-label="Close"
              />
            </div>

            <div className="modal-body review-modal-body">
              {isGuest && (
                <div className="review-tip">
                  <span className="review-tip-badge">TIP</span>
                  <span>
                    비회원 닉네임으로 작성한 후기는 수정/삭제가 제한될 수 있어요
                  </span>
                </div>
              )}


              <div className="mt-3">
                <label className="review-label">내용</label>
                <textarea
                  className="form-control review-textarea"
                  rows={4}
                  placeholder="예) 분위기 좋고 동선도 편했어요. 2차는 근처 ○○ 추천!"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={500}
                />
                <div className="review-counter">{content.length}/500</div>
              </div>
            </div>

            <div className="modal-footer review-modal-footer">
              <button
                type="button"
                className="btn review-btn-ghost"
                onClick={closeModal}
              >
                취소
              </button>
              <button
                type="button"
                className="btn review-btn-primary"
                onClick={submitReview}
                disabled={!content.trim()}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
