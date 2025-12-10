// import "./KakaoPay.css";

export default function KakaoPayLayout({ title, children }) {
  return (
    <div className="child-fullscreen">
      <div className="kakao-bg">
        <div className="kakao-wrap">

          <section className="kakao-panel">
            <div className="kakao-panel__content">

              <div className="kakao-logo">
                <img src="/images/pay-logo.svg" alt="logo" />
              </div>
              <div className="kakao-box">
                <h2 className="kakao-title">{title}</h2>
                <div className="kakao-content">{children}</div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}