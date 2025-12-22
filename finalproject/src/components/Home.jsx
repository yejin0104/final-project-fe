import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, Heart, Star, Calendar, ArrowRight, User, Hash } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';

// Swiper React 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// --- [Mock Data] 메인 배너 데이터 (배너는 관리자 기능 없으면 보통 하드코딩 합니다) ---
const banners = [
    {
        id: 1,
        title: "이번 주말, 어디로 떠날까?",
        subtitle: "TripPlanner가 추천하는 이번 주 베스트 여행지",
        bgColor: "#78C2AD", // Minty Main
        btnColor: "#4a9c85"
    },
    {
        id: 2,
        title: "친구들과 함께하는 우정여행",
        subtitle: "일정 투표부터 장소 선정까지 한 번에 해결하세요.",
        bgColor: "#6CC3D5", // Cyan-ish
        btnColor: "#4aa3b5"
    },
    {
        id: 3,
        title: "나만의 숨은 명소 공유",
        subtitle: "당신만 알고 있는 핫플레이스를 일정에 담아 공유해보세요.",
        bgColor: "#F3969A", // Pink-ish
        btnColor: "#d67579"
    }
];

export default function Home() {
    const navigate = useNavigate();
    const MINT_COLOR = "#78C2AD";

    // State
    const [schedules, setSchedules] = useState([]); // 전체 일정 리스트
    const [tagList, setTagList] = useState([]);     // 태그 목록 (DB에서 가져옴)
    const [selectedTag, setSelectedTag] = useState("전체"); // 선택된 필터 태그

    // 데이터 로드
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // 1. 추천 일정 로드 (여기서는 전체 최신순을 가져오지만, 백엔드에 /best가 있다면 그걸 쓰세요)
            const scheduleResp = await axios.get("/schedule/");
            setSchedules(scheduleResp.data);

            // 2. 태그 목록 로드
            const tagResp = await axios.get("/schedule/tagList");
            // 태그가 너무 많으면 UI가 깨지므로 랜덤 or 상위 10개만 자르거나 전체 다 보여줌
            setTagList(tagResp.data); 
        } catch (e) {
            console.error("데이터 로드 실패", e);
        }
    };

    // 필터링 로직: 선택된 태그가 "전체"면 모두, 아니면 해당 태그가 포함된 일정만
    const filteredSchedules = selectedTag === "전체" 
        ? schedules 
        : schedules.filter(item => item.tags && item.tags.includes(selectedTag));

    // 여행 기간 계산 함수
    const getDurationText = (start, end) => {
        if (!start || !end) return "";
        const s = dayjs(start);
        const e = dayjs(end);
        const nights = e.diff(s, 'day');
        const days = nights + 1;
        if (nights === 0) return `당일치기`;
        return `${nights}박 ${days}일`;
    };

    // Custom Styles
    const styles = {
        sectionTitle: {
            fontWeight: "800",
            color: "#333",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        sectionDesc: {
            color: "#888",
            marginBottom: "2rem",
            fontSize: "0.95rem"
        },
        card: {
            border: "none",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            backgroundColor: "white",
            height: "100%",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            position: "relative"
        },
        cardImage: {
            height: "200px",
            width: "100%",
            objectFit: "cover",
        },
        cardBody: {
            padding: "1.2rem",
            flex: 1,
            display: "flex",
            flexDirection: "column"
        },
        tag: {
            fontSize: "0.75rem",
            color: MINT_COLOR,
            backgroundColor: "#effbf8",
            padding: "4px 8px",
            borderRadius: "6px",
            fontWeight: "600",
            marginRight: "6px",
            display: "inline-block",
            marginBottom: "6px"
        },
        bannerSlide: {
            height: "360px",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 4rem",
            color: "white",
            position: "relative",
            overflow: "hidden",
            width: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        },
        userImage: {
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#eee",
            marginRight: "6px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "10px",
            color: "#888"
        }
    };

    return (
        <div className="content-wrapper container py-4">
            {/* CSS 스타일 오버라이드 */}
            <style>
                {`
                    .swiper-pagination-bullet-active {
                        background-color: ${MINT_COLOR} !important;
                    }
                    .banner-swiper .swiper-pagination-bullet {
                        background-color: white !important;
                        opacity: 0.5;
                    }
                    .banner-swiper .swiper-pagination-bullet-active {
                        background-color: white !important;
                        opacity: 1;
                    }
                    .swiper-button-next, .swiper-button-prev {
                        color: ${MINT_COLOR} !important;
                    }
                    .banner-swiper .swiper-button-next, .banner-swiper .swiper-button-prev {
                        color: rgba(255,255,255,0.7) !important;
                    }
                `}
            </style>

            {/* 1. 메인 배너 슬라이더 */}
            <section className="mb-5">
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    navigation={true}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    loop={true}
                    className="banner-swiper"
                    style={{ borderRadius: '20px' }}
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <div style={{ ...styles.bannerSlide, backgroundColor: banner.bgColor }}>
                                {/* 배경 장식 */}
                                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                <div style={{ position: 'absolute', right: '100px', bottom: '-100px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />

                                <h1 className="display-5 fw-bold mb-3" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 1 }}>
                                    {banner.title}
                                </h1>
                                <p className="lead mb-4" style={{ opacity: 0.9, zIndex: 1 }}>
                                    {banner.subtitle}
                                </p>
                                <button className="btn text-white px-4 py-2 rounded-pill fw-bold shadow-sm"
                                    onClick={() => navigate('/schedule/list')} // 배너 클릭 시 리스트로
                                    style={{ backgroundColor: banner.btnColor, width: "fit-content", border: "none", zIndex: 1 }}>
                                    자세히 보기 <ArrowRight size={18} className="ms-1" />
                                </button>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* 2. 추천 일정 슬라이더 */}
            <section className="py-4">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h3 style={styles.sectionTitle}>
                            <Star fill="#FFD700" color="#FFD700" size={24} />
                            TripPlanner 추천 일정
                        </h3>
                        <p style={styles.sectionDesc}>
                            {selectedTag === "전체" 
                                ? "고민은 덜고 즐거움은 더하는 인기 코스를 만나보세요." 
                                : `#${selectedTag} 테마로 떠나는 여행 코스입니다.`}
                        </p>
                    </div>
                    {/* 전체보기 링크 수정 (실제 라우터 경로) */}
                    <Link to="/schedule/list" style={{ color: "#888", textDecoration: "none", fontSize: "0.9rem", fontWeight: "500" }}>
                        전체보기 &gt;
                    </Link>
                </div>

                {filteredSchedules.length > 0 ? (
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation={true}
                        breakpoints={{
                            640: { slidesPerView: 2 }, 
                            1024: { slidesPerView: 3 }, 
                        }}
                        style={{ paddingBottom: '20px' }}
                    >
                        {filteredSchedules.map((item) => (
                            <SwiperSlide key={item.scheduleNo} style={{ height: 'auto' }}>
                                <Link to={`/schedulePage/${item.scheduleNo}`} className="text-decoration-none text-dark">
                                    <div
                                        style={styles.card}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-5px)";
                                            e.currentTarget.style.boxShadow = "0 10px 20px rgba(120, 194, 173, 0.2)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
                                        }}
                                    >
                                        <div style={{ position: "relative" }}>
                                            {/* DB 이미지 연동 */}
                                            <img 
                                                src={item.scheduleImage && item.scheduleImage !== "null"
                                                    ? `/attachment/download?attachmentNo=${item.scheduleImage}`
                      
                      
                                                    : "/images/default-schedule.png"} 
                                                onError={(e) => e.target.src = "/images/default-schedule.png"}
                                                alt={item.scheduleName} 
                                                style={styles.cardImage} 
                                            />
                                            <div style={{
                                                position: "absolute", top: "10px", right: "10px",
                                                backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "20px",
                                                padding: "4px 8px", fontSize: "0.8rem", fontWeight: "bold",
                                                color: "#ff6b6b", display: "flex", alignItems: "center", gap: "4px"
                                            }}>
                                                <Heart size={12} fill="#ff6b6b" /> {0} {/* 좋아요 수는 현재 VO에 없으면 0 처리 */}
                                            </div>
                                        </div>

                                        <div style={styles.cardBody}>
                                            <div className="mb-2">
                                                {/* 첫번째 장소 태그 */}
                                                {item.unitFirst && <span style={styles.tag}>{item.unitFirst}</span>}
                                                {/* DB 해시태그 */}
                                                {item.tags && item.tags.split(',').slice(0, 2).map((tag, idx) => (
                                                    <span key={idx} style={{...styles.tag, backgroundColor: "#f1f3f5", color: "#666"}}>#{tag}</span>
                                                ))}
                                            </div>
                                            
                                            <h5 className="fw-bold mb-2 text-truncate" style={{ fontSize: '1.1rem' }}>{item.scheduleName}</h5>
                                            
                                            {/* 작성자 */}
                                            <div className="d-flex align-items-center mb-3">
                                                <div style={styles.userImage}><User size={12} /></div>
                                                <span className="text-muted small">{item.scheduleOwner}</span>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                                <div className="d-flex align-items-center text-muted small">
                                                    <MapPin size={14} className="me-1" /> 
                                                    {getDurationText(item.scheduleStartDate, item.scheduleEndDate)}
                                                </div>
                                                <div className="d-flex align-items-center text-muted small">
                                                    <User size={14} className="me-1" /> {item.memberCount}명
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    // 데이터가 없을 때 표시할 UI
                    <div className="text-center py-5 text-muted bg-light rounded-4">
                        <p className="mb-0">해당 테마의 추천 일정이 아직 없습니다 😅</p>
                    </div>
                )}
            </section>

            {/* 3. 키워드 섹션 (태그 필터) */}
            <section className="py-5">
                <h3 style={styles.sectionTitle}>
                    <Hash color={MINT_COLOR} size={24} className="me-2" />
                    어떤 약속이 있으신가요?
                </h3>
                <p style={styles.sectionDesc}>상황에 딱 맞는 태그를 선택해보세요.</p>

                <div className="d-flex flex-wrap gap-2">
                    {/* 전체 버튼 */}
                    <button 
                        className={`btn rounded-pill px-4 py-2 fw-bold shadow-sm ${selectedTag === '전체' ? 'text-white' : 'btn-outline-light text-dark'}`}
                        style={{ 
                            backgroundColor: selectedTag === '전체' ? MINT_COLOR : 'white',
                            borderColor: selectedTag === '전체' ? MINT_COLOR : '#eee', 
                            transition: "all 0.2s" 
                        }}
                        onClick={() => setSelectedTag("전체")}
                    >
                        전체
                    </button>

                    {/* DB 태그 리스트 매핑 (랜덤하게 섞거나 상위 10개만 보여주는 로직 추가 가능) */}
                    {tagList.map((tag) => (
                        <button 
                            key={tag.tagNo} 
                            className={`btn rounded-pill px-4 py-2 fw-bold shadow-sm ${selectedTag === tag.tagName ? 'text-white' : 'btn-outline-light text-dark'}`}
                            style={{ 
                                backgroundColor: selectedTag === tag.tagName ? MINT_COLOR : 'white',
                                borderColor: selectedTag === tag.tagName ? MINT_COLOR : '#eee',
                                transition: "all 0.2s" 
                            }}
                            onClick={() => setSelectedTag(tag.tagName)}
                        >
                            #{tag.tagName}
                        </button>
                    ))}
                </div>
            </section>

        </div>
    );
}