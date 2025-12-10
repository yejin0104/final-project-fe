import { Route, Routes } from "react-router-dom";
import KakaoMapTest from "./kakaomap/KakaoMapTest";
import TestDnd from "./dnd/TestDnd";



export default function Content(){
    return (<>
        <div className="row">
            <div className="col-md-10 offset-md-1">
                {/* 분할된 화면의 주소를 지정하는 영역 (path=주소 , element=화면) */}
                <Routes>
                    {/* 메인 페이지 */}
                    {/* <Route path="/" element={<Home/>}></Route> */}
                    <Route path="kakaotest" element={<KakaoMapTest/>}></Route>
                    <Route path="testdnd" element={<TestDnd/>}></Route>
                </Routes>
            </div>
        </div>
    </>)
}