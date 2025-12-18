import './App.css'
import { BrowserRouter, Link } from "react-router-dom"
import Menu from "./components/Menu"
import Footer from "./components/Footer"
import Content from "./components/Content"


// Jotai 개발자 도구 설정
import "jotai-devtools/styles.css"; // 디자인
import { DevTools } from "jotai-devtools"; // 도구
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { Bounce, ToastContainer } from "react-toastify";
import ServiceCenterButton from "./components/servicecenter/ServiceCenterButton"
import ServiceCenterPopup from "./components/servicecenter/ServiceCenterPopup"
import ChatSocket from "./components/servicecenter/ChatSocket"
import useChat from "./utils/hooks/useChat"
import { accessTokenState, clearLoginState, refreshTokenState } from "./utils/jotai"
import { useAtom, useSetAtom } from "jotai"
import CounselorBlocker from "./components/dashboard/CounselorBlocker"

function App() {
  const { isPopupOpen, openPopup, closePopup, isChatOpen,
    openChat, closeChat, chatNo, } = useChat();

  // jotai state
  const [accessToken, setAccessToken] = useAtom(accessTokenState);
  const [refreshToken, setRefreshToken] = useAtom(refreshTokenState);
  const clearLogin = useSetAtom(clearLoginState);


  return (
    <>
      <BrowserRouter>
      <CounselorBlocker />
        {/* Jotai 개발자 도구 */}
        {process.env.NODE_ENV === "development" && <DevTools />}

        <Menu />
        <div className="container-fluid my-5 pt-5">
          <Content />

          <hr />
          <Footer />
        </div>

        {/* 고객센터 버튼 최상단에 배치 */}
        <ServiceCenterButton onButtonClick={openPopup} />

        {/* 팝업 열기 */}
        {isPopupOpen && (
          <ServiceCenterPopup
            isOpen={isPopupOpen}
            onClose={closePopup}
            onChatConnect={openChat} // 팝업에서 채팅방 생성
          />
        )}

        {/* 채팅방 모달 열기 */}
        {isChatOpen && chatNo && ( // chatNo가 있을 때만 렌더링
          <ChatSocket isChatOpen={isChatOpen} onChatClose={closeChat} currentChatNo={chatNo} />
        )}
      </BrowserRouter>

      {/* 토스트 메세지 컨테이너 */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  )
}

export default App
