import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { accessTokenState, adminState, clearLoginState, loginCompleteState, loginIdState, loginLevelState, loginState } from "../utils/jotai";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { CiCalendar, CiUser, CiCreditCard1, CiMap } from "react-icons/ci";
import TermsModal from "./account/accountJoin/TermsModal";
import ScheduleModal from "./schedule/ScheduleModal";

export default function Menu() {
  // 이동 도구
  const navigate = useNavigate();
  const location = useLocation();


  // jotai state
  const [loginId, setloginId] = useAtom(loginIdState);
  const [loginLevel, setLoginLevel] = useAtom(loginLevelState);
  const [accessToken, setAccessToken] = useAtom(accessTokenState);
  const [logincomplete, setLoginComplete] = useAtom(loginCompleteState);
  const isLogin = useAtomValue(loginState);
  const isAdmin = useAtomValue(adminState);
  const clearLogin = useSetAtom(clearLoginState);

  // state
  const [open, setOpen] = useState(false);

  // 일정 모달 열림/닫힘 상태 관리
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  // 약관동의 모달 열림 / 닫힘 상태 관리
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  // 화면이 로딩될 때마다 실행
  useEffect(() => {
    // 1. 토큰이 유효한 경우
    if (accessToken && accessToken.length > 0) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }
    // 2. 토큰이 없는 경우 (로그아웃 상태)
    else {
      delete axios.defaults.headers.common["Authorization"];
    }
    // 3. 로그인 판정 완료 (로그인이든 아니든 로딩은 끝난 것임)
    setLoginComplete(true);

  }, [accessToken, setLoginComplete]);

  // callback
  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  // callback
  // 모달 열기 핸들러
  const openModal = useCallback(() => {
    if (isLogin) {
      setIsScheduleModalOpen(true);
    } else {
      if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?")) {
        navigate("/account/login");
      }
    }
  }, [isLogin, navigate]);

  // 모달 닫기 핸들러
  const closeModal = useCallback(() => {
    setIsScheduleModalOpen(false);
    setIsAgreementModalOpen(false);
  }, []);

  // 로그아웃
  const logout = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();

    clearLogin();

    await axios.delete("/account/logout");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/");
    closeMenu();
  });

  // --- [디자인] Minty 테마 스타일 객체 ---
  const styles = {
    navbar: {
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #eef2f5",
      boxShadow: "0 4px 20px rgba(120, 194, 173, 0.15)", // Minty 그림자
      padding: "0.8rem 1.5rem",
      fontFamily: "'Noto Sans KR', sans-serif",
    },
    brand: {
      color: "#78C2AD", // Minty Main Color
      fontWeight: "800",
      fontSize: "1.6rem",
      letterSpacing: "-0.5px",
      marginRight: "2rem",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      cursor: "pointer"
    },
    navLink: {
      color: "#5a5a5a",
      fontWeight: "500",
      fontSize: "1rem",
      margin: "0 10px",
      transition: "color 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      textDecoration: "none",
      cursor: "pointer"
    },
    activeLink: {
      color: "#78C2AD",
      fontWeight: "700",
    },
    // "새 일정 만들기" 버튼 스타일
    ctaButton: {
      backgroundColor: "#78C2AD",
      backgroundImage: "linear-gradient(45deg, #78C2AD 0%, #6CC3D5 100%)", // Minty Gradient
      border: "none",
      color: "white",
      padding: "10px 24px",
      borderRadius: "50px",
      fontWeight: "600",
      boxShadow: "0 4px 10px rgba(120, 194, 173, 0.3)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "1rem",
      cursor: "pointer"
    },
    // 우측 구분선
    divider: {
      borderLeft: "2px solid #f0f0f0",
      paddingLeft: "20px",
      height: "40px",
      display: "flex",
      alignItems: "center"
    },
    // ★ 프로필 아이콘 (원형)
    profileIconBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      border: "2px solid #78C2AD",
      color: "#78C2AD",
      backgroundColor: "#fff",
      marginRight: "15px",
      transition: "all 0.2s ease",
      textDecoration: "none",
      boxShadow: "0 2px 8px rgba(120, 194, 173, 0.2)",
      cursor: "pointer"
    },
    logoutText: {
      color: "#999",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      cursor: "pointer",
      padding: "6px 10px",
      borderRadius: "6px",
      transition: "all 0.2s"
    },
    loginLink: {
      color: "#78C2AD",
      fontWeight: "700",
      border: "2px solid #78C2AD",
      borderRadius: "30px",
      padding: "6px 20px",
      backgroundColor: "transparent",
      textDecoration: "none",
      transition: "all 0.3s ease",
      marginRight: "10px"
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top" style={styles.navbar}>
        <div className="container-fluid">
          {/* Brand Logo */}
          <Link className="navbar-brand" to="/" style={styles.brand}>
            {/* [수정] 로고 이미지 추가 (기존 아이콘 대체) */}
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{ height: "50px", marginRight: "5px", marginTop: "5px", objectFit: "contain" }}
              onError={(e) => e.target.style.display = 'none'} // 이미지 없으면 숨김
            />
            TripPlanner
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarColor04"
            aria-controls="navbarColor04"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ border: "none", color: "#78C2AD" }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarColor04">
            {/* --- Center Navigation --- */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item" onClick={closeMenu}>
                <Link className="nav-link" to="/" style={styles.navLink}>
                  홈
                </Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link className="nav-link" to="/scheduleList" style={styles.navLink}>
                  <CiMap style={{ fontSize: "1.2rem" }} /> 추천 일정
                </Link>
              </li>
              <li className="nav-item" onClick={closeMenu}>
                <Link className="nav-link" to="/kakaopay/buy" style={styles.navLink}>
                  <CiMap style={{ fontSize: "1.2rem" }} /> 결제
                </Link>
              </li>
            </ul>

            {/* --- Right Side Actions --- */}
            <div className="d-flex align-items-center flex-wrap gap-2">

              {/* 새 일정 만들기 버튼 (CTA) */}
              <button
                className="btn"
                type="button"
                onClick={openModal}
                style={styles.ctaButton}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 15px rgba(120, 194, 173, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 10px rgba(120, 194, 173, 0.3)";
                }}
              >
                <CiCalendar style={{ fontSize: "1.3rem" }} />
                <span>새 일정 만들기</span>
              </button>

              <div className="d-flex align-items-center ms-3" style={styles.divider}>
                {isLogin === true ? (
                  <>
                    {/* ★ 로그인 상태 */}

                    {/* 1. 프로필 아이콘 (클릭 시 마이페이지 이동) */}
                    <Link
                      to="/mypage"
                      title="마이페이지로 이동"
                      style={styles.profileIconBox}
                      onClick={closeMenu}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#78C2AD";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                        e.currentTarget.style.color = "#78C2AD";
                      }}
                    >
                      <CiUser style={{ fontSize: "1.5rem" }} />
                    </Link>

                    {/* 모바일 대응: 햄버거 메뉴 안에서도 마이페이지 텍스트 링크 */}
                    <Link
                      to="/mypage"
                      className="d-lg-none"
                      style={{ textDecoration: 'none', color: '#555', marginRight: '15px' }}
                      onClick={closeMenu}
                    >
                      마이페이지
                    </Link>

                    {/* 2. 로그아웃 버튼 */}
                    <Link
                      onClick={logout}
                      style={styles.logoutText}
                      onMouseOver={(e) => { e.currentTarget.style.color = "#F3969A"; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = "#999"; }}
                    >
                      <i className="fa-solid fa-right-from-bracket"></i>
                      <span className="d-none d-md-inline">로그아웃</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* 비로그인 상태 */}
                    <Link
                      to="/account/login"
                      onClick={closeMenu}
                      style={styles.loginLink}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#78C2AD";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#78C2AD";
                      }}
                    >
                      로그인
                    </Link>

                    {/* 회원가입 버튼 */}
                    <div className="ms-1" style={{ transform: "scale(0.95)" }}>
                      <span
                        className="nav-link"
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsAgreementModalOpen(true)} // 여기서 엽니다
                      >
                        회원가입
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 모달 컴포넌트 */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={closeModal}
      />
      <TermsModal isOpen={isAgreementModalOpen} onClose={closeModal} />
    </>
  );
}