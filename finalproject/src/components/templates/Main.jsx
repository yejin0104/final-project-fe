import "../schedule/Schedule.css"
import { Link } from "react-router-dom";


export default function Main() {


    return (<>
    
    <div className="row mt-5">
        <div className="col py-4 bg-dark d-flex">

            <div className="row m-2">
                <div className="col p-2">
                    <div className="slider-img">
                        <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
                    </div>
                    <div className="mt-3 gap-1">
                    <div><h5  className="text-light">부산에 왔다면 이곳</h5></div>
                    <div>장소</div>
                    <div>
                        <span className="badge bg-primary p-2 mt-2">#참고할 만한 가이드</span>
                    </div>
                    </div>
                </div>
            </div>

            <div className="row m-2">
                <div className="col p-2">
                    <div className="slider-img down">
                        <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
                    </div>
                    <div className="mt-3 gap-1">
                    <div><h5  className="text-light">부산에 왔다면 이곳</h5></div>
                    <div>장소</div>
                    <div>
                        <span className="badge bg-primary p-2 mt-2">#참고할 만한 가이드</span>
                    </div>
                    </div>
                </div>
            </div>

            <div className="row m-2">
                <div className="col p-2">
                    <div className="slider-img">
                        <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
                    </div>
                    <div className="mt-3 gap-1">
                    <div><h5  className="text-light">부산에 왔다면 이곳</h5></div>
                    <div>장소</div>
                    <div>
                        <span className="badge bg-primary p-2 mt-2">#참고할 만한 가이드</span>
                    </div>
                    </div>
                </div>
            </div>

            <div className="row m-2">
                <div className="col p-2">
                    <div className="slider-img down">
                        <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
                    </div>
                    <div className="mt-3 gap-1">
                    <div><h5  className="text-light">부산에 왔다면 이곳</h5></div>
                    <div>장소</div>
                    <div>
                        <span className="badge bg-primary p-2 mt-2">#참고할 만한 가이드</span>
                    </div>
                    </div>
                </div>
            </div>


        </div>
    </div>
    <div className="row">
        <div className="col m-4 text-center">
            <h2>나만의 일정을 만들어보세요!</h2>
        </div>
    </div>
    <div className="row">
        <div className="col text-center">
            <h4  >
                <Link className="text-decoration-none " ><span className="p-2">조회수</span></Link>
                 <span style={{color:"#b2bec3"}}>|</span>
                 <Link className="text-decoration-none " ><span className="p-2">추천수</span></Link>
                  <span style={{color:"#b2bec3"}}>|</span>
                  <Link  className="text-decoration-none "><span className="p-2">최신글</span></Link>
                  </h4>
        </div>
    </div>

    
    <div className="row mt-4 g-3">
         
            {/* 이미지 카드 */}
        <div className="col-md-3 col-sm-6">
            <div className="rounded shadow p-0 px-0 mb-3">
           <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
            <div className="gap-2 text-center">
                <div className="fs-4 mt-1">나리농원</div>
                <div>경기 양주시</div>
                <div className="d-flex flex-wrap justify-content-center gap-1 p-3">
                <div className=" badge bg-primary p-1">#분위기 좋은</div>
                <div className=" badge bg-primary p-1 ">#감성적인</div>
                </div>
            </div>
            </div>
        </div>
            {/* 이미지 카드 */}
        <div className="col-md-3 col-sm-6">
            <div className="rounded shadow p-0 px-0 mb-3">
           <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
            <div className="gap-2 text-center">
                <div className="fs-4 mt-1">나리농원</div>
                <div>경기 양주시</div>
                <div className="d-flex flex-wrap justify-content-center gap-1 p-3">
                <div className=" badge bg-primary p-1">#분위기 좋은</div>
                <div className=" badge bg-primary p-1 ">#감성적인</div>
                </div>
            </div>
            </div>
        </div>
            {/* 이미지 카드 */}
        <div className="col-md-3 col-sm-6">
            <div className="rounded shadow p-0 px-0 mb-3">
           <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
            <div className="gap-2 text-center">
                <div className="fs-4 mt-1">나리농원</div>
                <div>경기 양주시</div>
                <div className="d-flex flex-wrap justify-content-center gap-1 p-3">
                <div className=" badge bg-primary p-1">#분위기 좋은</div>
                <div className=" badge bg-primary p-1 ">#감성적인</div>
                </div>
            </div>
            </div>
        </div>
            {/* 이미지 카드 */}
        <div className="col-md-3 col-sm-6">
            <div className="rounded shadow p-0 px-0 mb-3">
           <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
            <div className="gap-2 text-center">
                <div className="fs-4 mt-1">나리농원</div>
                <div>경기 양주시</div>
                <div className="d-flex flex-wrap justify-content-center gap-1 p-3">
                <div className=" badge bg-primary p-1">#분위기 좋은</div>
                <div className=" badge bg-primary p-1 ">#감성적인</div>
                </div>
            </div>
            </div>
        </div>
            {/* 이미지 카드 */}
        <div className="col-md-3 col-sm-6">
            <div className="rounded shadow p-0 px-0 mb-3">
           <img className="w-100" src="https://www.visitbusan.net/uploadImgs/files/hqimgfiles/20200327141200390_thumbL"/>
            <div className="gap-2 text-center">
                <div className="fs-4 mt-1">나리농원</div>
                <div>경기 양주시</div>
                <div className="d-flex flex-wrap justify-content-center gap-1 p-3">
                <div className=" badge bg-primary p-1">#분위기 좋은</div>
                <div className=" badge bg-primary p-1 ">#감성적인</div>
                </div>
            </div>
            </div>
        </div>
           
        

    </div>


    <div className="row">
        <div className="col">
            <img className="m-2 banner-img" src="https://img.freepik.com/free-vector/flat-design-travel-twitter-header_23-2149086254.jpg?semt=ais_se_enriched&w=740&q=80"/>
        </div>
    </div>
    
    </>)
}