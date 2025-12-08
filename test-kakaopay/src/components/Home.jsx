import { Link } from "react-router-dom";
import Jumbotron from "./templates/Jumbotron";


export default function Home() {

    return (

        <>
            <Jumbotron subject="홈" detail="카카오결제 바로가기 모음" />

            <div className="row mt-4">
                <div className="col-6">
                    <Link to="/kakaopay/buy">카카오페이 결제하기</Link>
                </div>
                <div className="col-6">
                    <Link to="kakaopay/pay/info">결제 내역 보기</Link>
                </div>
            </div>

        </>

    )
}