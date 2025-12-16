import { Link } from "react-router-dom";

const MINT_COLOR = "#78C2AD";

const AccountFindIdStep2 = ({ foundId }) => {

    //render
    return (
        <>
            <div className="container mt-4" style={{ maxWidth: "600px" }}>
                <div className="mt-5 p-4 rounded text-center" style={{ backgroundColor: 'rgba(120, 194, 173, 0.1)', border: `1px solid ${MINT_COLOR}` }}>
                    <h5 className="fw-bold mb-3">회원님의 아이디는 다음과 같습니다.</h5>
                    <div className="display-6 fw-bold mb-4" style={{ color: MINT_COLOR }}>
                        {foundId}
                    </div>
                    <div className="d-flex gap-2 justify-content-center">
                        <Link to="/login" className="btn btn-lg text-white px-4 fw-bold" style={{ backgroundColor: MINT_COLOR, borderColor: MINT_COLOR }}>
                            로그인 하러가기
                        </Link>
                        <Link to="/account/findPw" className="btn btn-lg btn-outline-secondary px-4 fw-bold">
                            비밀번호 찾기
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )


}

export default AccountFindIdStep2;


