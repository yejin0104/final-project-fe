import { useState, useEffect, useCallback, useRef } from "react";
import { FaTrash, FaUser, FaHeart, FaPen, FaCamera } from "react-icons/fa";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSchedule } from "react-icons/ai";
import { MdPayment } from "react-icons/md";
import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { accessTokenState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState } from "../../utils/jotai";
import Swal from 'sweetalert2'
import { toast } from "react-toastify";

// 눈이 편안한 색상 팔레트 정의
const PALETTE = {
    activeText: "#4e9f86",   // 글자색: 딥 민트
    activeBg: "#effbf8",     // 배경색: 파스텔 민트
    hoverBg: "#f7fdfb",      // 호버색
    defaultText: "#555555",  // 기본 글자
    border: "#eaeaea",       // 경계선
    dangerBg: "#fff5f5",     // 위험(탈퇴) 배경
    dangerText: "#e03131",   // 위험(탈퇴) 글자
    dangerHover: "#ffc9c9"   // 위험(탈퇴) 호버
};

export default function MyPage() {

    // 이동 도구
    const navigate = useNavigate();

    // 파일 업로드를 위한 ref
    const fileInputRef = useRef(null);

    // jotai state
    const [loginId, setloginId] = useAtom(loginIdState);
    const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
    const [accessToken, setAccessToken] = useAtom(accessTokenState);
    const [logincomplete, setLoginComplete] = useAtom(loginCompleteState);
    const isLogin = useAtomValue(loginState);
    const clearLogin = useSetAtom(clearLoginState);

    // 링크 공통 스타일
    const linkBaseStyle = {
        borderRadius: "12px",
        transition: "all 0.2s ease",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        marginBottom: "6px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        letterSpacing: "-0.3px"
    };

    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);
    const [profileUrl, setProfileUrl] = useState("/images/default-profile.jpg");

    // state (내 정보)
    const [myInfo, setMyinfo] = useState({
        accountId: "",
        accountNickname: "",
        accountEmail: "",
        accountBirth: "",
        accountGender: "",
        accountContact: "",
        accountLevel: "",
        attachmentNo: null
    });

    useEffect(() => {
        if (logincomplete) {
            loadData();
        }
    }, [logincomplete]);

    useEffect(() => {
        // 경로가 정확히 '/mypage'일 때만 info로 리다이렉트
        if (location.pathname === '/mypage' || location.pathname === '/mypage/') {
            navigate('info', { replace: true });
        }
        setActiveTab(location.pathname);
    }, [location.pathname, navigate]);

    const loadData = useCallback(async () => {
        try {
            const resp = await axios.get("/account/mypage");
            setMyinfo(resp.data);

            if (resp.data.attachmentNo) {
                setProfileUrl(`http://localhost:8080/attachment/download?attachmentNo=${resp.data.attachmentNo}`);
            } else {
                setProfileUrl("/images/default-profile.jpg");
            }
        }
        catch (e) {
            console.log("정보 불러오기 실패");
        }
    }, []);

    // 프로필 이미지 수정 핸들러
    const handleProfileImage = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // FormData
        const formData = new FormData();
        formData.append("attach", file);

        try {
            const resp = await axios.post("/account/profile", formData);
            if (resp) loadData();

            Swal.fire({
                icon: 'success',
                title: '프로필 변경 완료',
                text: '프로필 이미지가 성공적으로 변경되었습니다.',
                confirmButtonColor: '#78C2AD',
                timer: 1500,
                showConfirmButton: false
            });

        }
        catch (error) {
            console.error("프로필 이미지 업로드 실패", error);
            Swal.fire({
                icon: 'error',
                title: '변경 실패',
                text: '이미지 업로드 중 오류가 발생했습니다.',
                confirmButtonColor: '#78C2AD'
            });
        }

        finally {
            // input 초기화 (같은 파일 다시 선택 가능하도록)
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }

    }, []);

    const deleteAccount = useCallback(async (e) => {
        // [수정] Swal 하나로 통합하여 디자인 적용
        const result = await Swal.fire({
            title: '회원 탈퇴',
            html: `
                <div style="text-align: center;">
                    <p style="color: #e03131; font-weight: bold; margin-bottom: 10px; font-size: 1.1rem;">
                        정말로 탈퇴하시겠습니까?
                    </p>
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px; line-height: 1.5;">
                        탈퇴 시 모든 일정과 정보가 삭제되며<br/>
                        <span style="color: #e03131;">복구할 수 없습니다.</span><br/><br/>
                        본인 확인을 위해 비밀번호를 입력해주세요.
                    </p>
                </div>
            `,
            icon: 'warning',
            input: 'password',
            inputPlaceholder: '비밀번호 입력',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: '탈퇴하기',
            cancelButtonText: '취소',
            confirmButtonColor: '#e03131', // 위험 색상 (Red)
            cancelButtonColor: '#adb5bd',  // 회색
            reverseButtons: true, // 버튼 순서 변경
            focusCancel: true,    // 취소 버튼에 포커스 (실수 방지)
            customClass: {
                input: 'form-control text-center mx-auto w-75', // 입력창 스타일
                popup: 'rounded-4 shadow-lg' // 팝업 둥글게
            }
        });

        if (result.isConfirmed && result.value) {
            const rawPassword = result.value;

            try {
                await axios.post("/account/withdraw", { accountPw: rawPassword });

                window.sessionStorage.removeItem("accessToken");
                window.localStorage.removeItem("refreshToken");
                delete axios.defaults.headers.common["Authorization"];

                clearLogin();

                // [수정] 성공 알림도 예쁘게
                Swal.fire({
                    icon: 'success',
                    title: '탈퇴 완료',
                    text: '그동안 서비스를 이용해주셔서 감사합니다.',
                    confirmButtonColor: '#78C2AD'
                }).then(() => {
                    navigate("/");
                });

            } catch (e) {
                console.error(e);
                Swal.fire({
                    icon: 'error',
                    title: '탈퇴 실패',
                    text: '비밀번호가 일치하지 않거나 오류가 발생했습니다.',
                    confirmButtonColor: '#78C2AD'
                });
            }
        }
    }, [clearLogin, navigate]);

    // render
    return (
        <div className="container-fluid p-0" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
            <div className="row g-0 h-100">
                {/* 1. 사이드바 영역 */}
                <nav className="col-2 d-none d-md-block bg-white d-flex flex-column justify-content-between"
                    style={{ minHeight: "100vh", borderRight: `1px solid ${PALETTE.border}`, position: "relative" }}>

                    <div className="pt-5 px-3">
                        {/* 프로필 영역 */}
                        <div className="text-center mb-5">
                            <div className="position-relative d-inline-block">
                            <img src={profileUrl} className="rounded-circle border shadow-sm"
                                style={{ width: "120px", height: "120px", objectFit: "cover" }}
                                onError={(e) => {
                                    e.target.src = "/images/default-profile.jpg";
                                }}
                                alt="프로필" />

                            {/* [추가] 숨겨진 파일 입력창 */}
                            <input
                                type="file"
                                style={{ display: "none" }}
                                ref={fileInputRef}
                                onChange={handleProfileImage}
                                accept="image/*"
                            />

                            {/* [수정] 사진 변경 버튼 (카메라 아이콘으로 변경) */}
                            <button
                                onClick={() => fileInputRef.current.click()} // 클릭 시 파일 선택창 열기
                                className="btn btn-sm position-absolute bottom-0 end-0 rounded-circle border shadow-sm d-flex align-items-center justify-content-center"
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    backgroundColor: "white",
                                    color: "#555",
                                    transform: "translate(0, 0)", // 위치 미세 조정
                                }}
                                title="프로필 사진 변경"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                                    e.currentTarget.style.color = "#333";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "white";
                                    e.currentTarget.style.color = "#555";
                                }}
                            >
                                <FaCamera size={16} />
                            </button>
                            </div>
                            <h5 className="fw-bold m-0 mt-2" style={{ color: "#333", fontSize: "1.1rem" }}>{myInfo.accountNickname}</h5>
                        </div>

                        {/* 메뉴 링크들 */}
                        <ul className="nav flex-column">
                            {[
                                { path: "/mypage/info", icon: FaUser, label: "내 정보" },
                                { path: "/mypage/schedule", icon: AiOutlineSchedule, label: "내 일정" },
                                { path: "/mypage/pay", icon: MdPayment, label: "결제 내역" },
                                { path: "/mypage/wishlist", icon: FaHeart, label: "찜 목록" }
                            ].map((item) => {
                                const isActive = activeTab === item.path;
                                return (
                                    <li className="nav-item" key={item.path}>
                                        <Link
                                            to={item.path}
                                            style={{
                                                ...linkBaseStyle,
                                                backgroundColor: isActive ? PALETTE.activeBg : "transparent",
                                                color: isActive ? PALETTE.activeText : PALETTE.defaultText,
                                                fontWeight: isActive ? "600" : "500",
                                            }}
                                            onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = PALETTE.hoverBg)}
                                            onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = "transparent")}
                                        >
                                            <item.icon className="me-3" size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* 하단 회원탈퇴 버튼 */}
                    <div className="p-3 mb-4 mt-auto">
                        <hr className="mb-4" style={{ borderColor: PALETTE.border }} />
                        <button
                            className="btn w-100 d-flex align-items-center justify-content-center"
                            style={{
                                backgroundColor: PALETTE.dangerBg,
                                color: PALETTE.dangerText,
                                border: "1px solid #ffec99",
                                borderColor: "rgba(224, 49, 49, 0.1)",
                                borderRadius: "12px",
                                padding: "12px",
                                fontWeight: "600",
                                fontSize: "0.9rem",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e03131";
                                e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = PALETTE.dangerBg;
                                e.currentTarget.style.color = PALETTE.dangerText;
                            }}
                            onClick={deleteAccount}
                        >
                            <FaTrash className="me-2" /> 회원탈퇴
                        </button>
                    </div>
                </nav>

                {/* 2. 콘텐츠 영역 (Outlet) */}
                <main className="col-md-10 ms-sm-auto col-lg-10 px-md-5 py-5">
                    <div className="container-fluid" style={{ maxWidth: "1100px" }}>
                        <div className="d-flex align-items-center pb-3 mb-4 border-bottom" style={{ borderColor: PALETTE.border }}>
                            <h2 className="h3 fw-bold m-0" style={{ color: "#2c3e50" }}>
                                {activeTab.includes('info') && "내 프로필"}
                                {activeTab.includes('schedule') && "나의 여행 일정"}
                                {activeTab.includes('pay') && "결제 내역 확인"}
                                {activeTab.includes('wishlist') && "내가 찜한 목록"}
                                {activeTab === '/mypage' && "마이 페이지"}
                            </h2>
                        </div>
                        <div className="bg-white rounded-4 p-5" style={{
                            minHeight: "500px",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                            border: `1px solid ${PALETTE.border}`
                        }}>
                            {/* [핵심 수정] 
                                Outlet을 통해 자식 컴포넌트(MyInfo 등)에게 
                                1. myInfo (현재 데이터)
                                2. setMyinfo (데이터 갱신 함수)
                                를 모두 전달합니다.
                            */}
                            <Outlet context={{ myInfo, setMyInfo: setMyinfo }} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}