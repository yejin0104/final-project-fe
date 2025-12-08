import { Link } from "react-router-dom";
import Jumbotron from "../templates/Jumbotron";


export default function KakaoPaySuccess() {


    return (<>

        <Jumbotron subject="Final-Project-2조" detail="카카오결제 성공" />

        <div className="row mt-4">
            <div className="col">
                <Link to="/">홈</Link>
            </div>
        </div>
    </>)
}