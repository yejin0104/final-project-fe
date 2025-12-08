import './App.css'
import { BrowserRouter } from "react-router-dom"
import Menu from "./components/Menu"
import Footer from "./components/Footer"
import Content from "./components/Content"

// Jotai 개발자 도구 설정
import "jotai-devtools/styles.css"; // 디자인
import { DevTools } from "jotai-devtools"; // 도구
import { Map, MapMarker } from "react-kakao-maps-sdk";

function App() {
  return (
    <>
      
      <BrowserRouter>
            {/* Jotai에서 제공하는 데이터 공유 영역(생략시 전체 앱에 적용됨) */}
            {/* <Provider> */}
                {/* 
                    Jotai 개발자 도구 - 개발 모드에서만 작동하고 배포 시 자동으로 제거되어야 함
                    process.env.NODE_ENV 정보를 읽었을 때 development면 개발모드, production이면 배포모드
                */}
                {process.env.NODE_ENV === "development" && <DevTools/>}
                <Menu/>
                <div className="container-fluid my-5 pt-5">
                    <Content/>
                    <hr/>
                    <Footer/>
                </div>
            {/* </Provider> */}
        </BrowserRouter>
    </>
  )
}

export default App
