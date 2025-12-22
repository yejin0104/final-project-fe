import { useParams } from "react-router-dom";
import Reply from "./Reply";
// import Review from "./Review";
import Schedule from "./Schedule";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaLink } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import KakaoLoader from "../kakaomap/useKakaoLoader";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import { v4 as uuidv4 } from "uuid";
import { accessTokenState, guestState, loginIdState } from "../../utils/jotai";
import Swal from "sweetalert2";
import MemberReview from "./MemberReview";
import Review from "./Review";



export default function SchedulePage() {
    KakaoLoader()
    const accessToken = useAtomValue(accessTokenState);
    const guest = useAtomValue(guestState);
    const loginId = useAtomValue(loginIdState);


    const accountId = useAtomValue(loginIdState);
    const [memberList, setMemberList] = useState([]);
    const [days, setDays] = useState({
        1: {
            markerIds: [],
            routes: {
                CAR: { RECOMMEND: [], TIME: [], DISTANCE: [] },
                WALK: { RECOMMEND: [], TIME: [], DISTANCE: [] }
            },
        },
    });
    const [markerData, setMarkerData] = useState({
        /* 
            uuid-1 : {
                no: int,
                x: double,
                y: double,
                name: string,
                content: string
        */
    })

    const [selectedDay, setSelectedDay] = useState(1)
    const [polyline, setPolyLine] = useState([]);
    const [selectedType, setSelectedType] = useState({
        RECOMMEND: true,
        TIME: false,
        DISTANCE: false
    })
    const [selectedSearch, setSelectedSearch] = useState("CAR")
    const copyUrl = useCallback(async () => {

        try {

            const { data } = await axios.get(`/schedule/share/${scheduleNo}`);
            console.log("shareKey", data);

            const url = `${window.location.origin}/share/${data}`;
            await navigator.clipboard.writeText(url);

            toast.success("링크 복사 완료")
        } catch (error) {
            toast.error('링크 생성 실패');
        }

    }, []);
    const [center, setCenter] = useState({
        lng: 126.9780,
        lat: 37.5665,
    })

    const [searchData, setSearchKeyword] = useState({
        query: ""
    })

    const [searchList, setSearchList] = useState([
        /*
        {
            addressName : "",
            categoryGroupName : "",
            phone : "",
            placeName : "",
            placeUrl : "",
            roadAddressName : "",
            x : "",
            y : ""
        }
        */
    ])

    const [tempMarker, setTempMarker] = useState([
        /*
        {
            x: double,
            y: double,
        }
         */
    ])
    const { scheduleNo } = useParams();
    const [scheduleDto, setScheduleDto] = useState({
        scheduleName: "",
        schedulePublic: false,
        scheduleState: "",
        scheduleNo: scheduleNo
    })


    useEffect(() => {
        console.log("SchedulePage params scheduleNo =", scheduleNo);
    }, [scheduleNo]);

    const PRIORITY_COLORS = {
        RECOMMEND: "#0052FF",
        TIME: "#FF2D2D",
        DISTANCE: "#00B050"
    };

    // Marker 추가
    const addMarker = useCallback(async (latlng) => {
        const id = uuidv4();
        const address = { x: latlng.getLng(), y: latlng.getLat() };

        const { data } = await axios.post("/kakaoMap/getAddress", address);
        const addressName = data.documents.map(({ address, road_address }) => {
            if (road_address === null) return address.address_name;
            return road_address.building_name || road_address.road_name || road_address.address_name;
        });

        const currentDay = days[selectedDay] || { markerIds: [] };
        const markerNo = currentDay.markerIds.length + 1;

        setDays(prev => ({
            ...prev,
            [selectedDay]: {
                ...prev[selectedDay],
                markerIds: [...prev[selectedDay].markerIds, id],
            }
        }));

        setMarkerData(prev => ({
            ...prev,
            [id]: { no: markerNo, ...address, name: addressName[0], content: "" }
        }));
    }, [days, selectedDay]);

    const addTempMarker = useCallback((latlng) => {
        setTempMarker(prev => ([
            ...prev,
            {
                x: latlng.getLng(),
                y: latlng.getLat(),
            }
        ]))
    }, [])


    const addDays = useCallback(() => {
        const currentDayKeys = Object.keys(days).map(Number);
        const nextDay = currentDayKeys.length > 0 ? Math.max(...currentDayKeys) + 1 : 1;

        setDays(prev => ({
            ...prev,
            [nextDay]: {
                markerIds: [],
                routes: {
                    CAR: { RECOMMEND: [], TIME: [], DISTANCE: [] },
                    WALK: { RECOMMEND: [], TIME: [], DISTANCE: [] }
                }
            }
        }));
        setSelectedDay(nextDay);
    }, [days]);

    const removeMarker = useCallback((dayKey, id) => {
        setDays(prevDays => {
            const targetDay = prevDays[dayKey];
            if (!targetDay) return prevDays;

            const updatedMarkerIds = targetDay.markerIds.filter(markerId => markerId !== id);

            // 모든 타입(CAR, WALK)과 모든 우선순위에서 해당 마커 관련 경로 제거
            const updatedRoutes = { ...targetDay.routes };
            ["CAR", "WALK"].forEach(mode => {
                ["RECOMMEND", "TIME", "DISTANCE"].forEach(priority => {
                    if (updatedRoutes[mode] && updatedRoutes[mode][priority]) {
                        updatedRoutes[mode][priority] = updatedRoutes[mode][priority].filter(route =>
                            !route.routeKey.startsWith(id + '##') && !route.routeKey.endsWith('##' + id)
                        );
                    }
                });
            });

            return {
                ...prevDays,
                [dayKey]: {
                    ...targetDay,
                    markerIds: updatedMarkerIds,
                    routes: updatedRoutes,
                },
            };
        });

        setMarkerData(prevMarkerData => {
            const updatedMarkerData = { ...prevMarkerData };
            delete updatedMarkerData[id];
            const currentMarkerIds = days[dayKey]?.markerIds.filter(mId => mId !== id) || [];
            currentMarkerIds.forEach((mId, index) => {
                if (updatedMarkerData[mId]) {
                    updatedMarkerData[mId] = { ...updatedMarkerData[mId], no: index + 1 };
                }
            });
            return updatedMarkerData;
        });
    }, [days]);

    const markerElements = useCallback(() => {
        const currentDayData = days[selectedDay];

        // 해당 날짜 데이터나 markerIds가 없으면 아무것도 그리지 않음
        if (!currentDayData || !currentDayData.markerIds) {
            return null;
        }
        return (currentDayData.markerIds?.map(id => (
            <MapMarker
                key={id}
                position={{ lng: markerData[id].x, lat: markerData[id].y }}
                image={
                    {
                        src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
                        size: {
                            width: 36,
                            height: 37
                        },
                        options: {
                            offset: {
                                x: 13,
                                y: 37
                            },
                            spriteOrigin: {
                                x: 0,
                                y: (markerData[id].no - 1) * 46 + 10
                            },
                            spriteSize: {
                                width: 36,
                                height: 691
                            }
                        }

                    }
                }
            />
        )));
    }, [markerData, selectedDay, days]);

    const tempMarkerElements = useCallback(() => {
        const handleMarkerClick = (clickedMarker) => {
            // 1. addMarker 함수 호출을 위한 customLatLng 객체 생성
            const customLatLng = {
                getLat: () => parseFloat(clickedMarker.y),
                getLng: () => parseFloat(clickedMarker.x)
            };

            // 2. tempMarker 목록에서 클릭된 마커를 제거
            setTempMarker(prevTempMarkers => {
                // 클릭된 마커(clickedMarker)와 x, y 좌표가 모두 일치하지 않는
                // 마커들만 필터링하여 새로운 배열을 만듭니다.
                const newTempMarkers = prevTempMarkers.filter(
                    (marker) => !(marker.x === clickedMarker.x && marker.y === clickedMarker.y)
                );
                return newTempMarkers;
            });

            // 3. addMarker 함수 호출 (주요 로직 수행)
            return addMarker(customLatLng);
        };
        return (tempMarker?.map((marker, index) => (
            <MapMarker
                key={index}
                position={{ lng: marker.x, lat: marker.y }}
                onClick={() => handleMarkerClick(marker)}
            />
        )));
    }, [tempMarker, addMarker]);

    const polylineElements = useCallback(() => {
        const currentDayRoutes = days[selectedDay]?.routes;
        if (!currentDayRoutes || !currentDayRoutes[selectedSearch]) return null;

        const modeRoutes = currentDayRoutes[selectedSearch];

        return Object.keys(selectedType).map(priority => {
            if (selectedType[priority] && modeRoutes[priority]) {
                return modeRoutes[priority].map((segment, idx) => (
                    <Polyline
                        key={`${priority}-${idx}`}
                        path={segment.linepath}
                        strokeWeight={5}
                        strokeOpacity={0.7}
                        strokeStyle="solid"
                        strokeColor={PRIORITY_COLORS[priority]}
                        zIndex={10}
                    />
                ));
            }
            return null;
        });
    }, [days, selectedDay, selectedSearch, selectedType]);

    const parseVertexes = (roads) => {
        const linepath = [];
        roads.forEach(({ vertexes }) => {
            for (let i = 0; i < vertexes.length; i += 2) {
                linepath.push({ lng: vertexes[i], lat: vertexes[i + 1] });
            }
        });
        return linepath;
    }

    const searchAllRoot = useCallback(async (day = null) => {
        const targetDayKeys = day ? [day] : Object.keys(days);
        const validDayKeys = targetDayKeys.filter(key => days[key]?.markerIds.length >= 2);

        if (validDayKeys.length === 0) return;

        const mode = selectedSearch;
        const activePriorities = Object.keys(selectedType).filter(key => selectedType[key] === true);
        if (activePriorities.length === 0) return;

        const requests = [];
        const cachedUpdates = []; // 캐시에서 찾은 데이터를 임시 보관

        validDayKeys.forEach(dayKey => {
            const markerIds = days[dayKey].markerIds;
            const currentOrderKey = markerIds.join(","); // 마커 ID 순서를 문자열로 변환 (캐시 키)
            const markerValues = markerIds.map(id => markerData[id]);
            console.log(`[검색 시도] 일자: ${dayKey}, 순서: ${currentOrderKey}`);

            activePriorities.forEach(priority => {
                const cacheKey = `${dayKey}-${mode}-${priority}`;

                // 1. 캐시 확인: 해당 날짜/모드/우선순위에 동일한 마커 순서의 기록이 있는지 확인
                if (routeHistory.current[cacheKey] && routeHistory.current[cacheKey][currentOrderKey]) {
                    console.log(`%c[캐시 적중] ${cacheKey} - 기존 데이터를 불러옵니다.`, "color: #4CAF50; font-weight: bold");
                    cachedUpdates.push({
                        dayKey, mode, priority,
                        data: routeHistory.current[cacheKey][currentOrderKey]
                    });
                } else {
                    // 2. 캐시에 없으면 API 요청 목록에 추가
                    console.log(`%c[캐시 실패] ${cacheKey} - 서버에 새로 요청합니다.`, "color: #FF9800; font-weight: bold");
                    const baseUrl = mode === "CAR"
                        ? (markerIds.length === 2 ? "/kakaoMap/search" : "/kakaoMap/searchAll")
                        : "/kakaoMap/searchForWalk";

                    requests.push({
                        dayKey, mode, priority, currentOrderKey, // 나중에 캐시에 저장하기 위해 orderKey 포함
                        promise: axios.post(`${baseUrl}?priority=${priority}`, markerValues)
                    });
                }
            });
        });

        // 모든 데이터가 캐시에 있다면 API 호출 없이 상태 업데이트 후 종료
        if (requests.length === 0 && cachedUpdates.length > 0) {
            setDays(prev => {
                const nextDays = { ...prev };
                cachedUpdates.forEach(({ dayKey, mode, priority, data }) => {
                    if (!nextDays[dayKey].routes[mode]) nextDays[dayKey].routes[mode] = {};
                    nextDays[dayKey].routes[mode][priority] = data;
                });
                return nextDays;
            });
            return;
        }

        try {
            // API 요청 실행
            const responses = await Promise.all(requests.map(r => r.promise));

            setDays(prev => {
                const nextDays = { ...prev };

                // A. 캐시에서 가져온 데이터 먼저 적용
                cachedUpdates.forEach(({ dayKey, mode, priority, data }) => {
                    if (!nextDays[dayKey].routes[mode]) nextDays[dayKey].routes[mode] = {};
                    nextDays[dayKey].routes[mode][priority] = data;
                });

                // B. API로 새로 받은 데이터 적용 및 캐시 저장
                responses.forEach((res, index) => {
                    const { dayKey, mode, priority, currentOrderKey } = requests[index];
                    const data = res.data;
                    const currentMarkerIds = nextDays[dayKey].markerIds;

                    if (!nextDays[dayKey].routes) nextDays[dayKey].routes = { CAR: {}, WALK: {} };
                    if (!nextDays[dayKey].routes[mode]) nextDays[dayKey].routes[mode] = {};

                    const routeSegments = [];
                    if (mode === "CAR") {
                        const { sections } = data.routes[0];
                        sections.forEach((section, idx) => {
                            routeSegments.push({
                                routeKey: `${currentMarkerIds[idx]}##${currentMarkerIds[idx + 1]}`,
                                distance: section.distance,
                                duration: section.duration,
                                linepath: parseVertexes(section.roads),
                            });
                        });
                    } else {
                        data.distance.forEach((dist, idx) => {
                            routeSegments.push({
                                routeKey: `${currentMarkerIds[idx]}##${currentMarkerIds[idx + 1]}`,
                                distance: dist,
                                duration: data.duration[idx],
                                linepath: data.linepath[idx],
                            });
                        });
                    }

                    // 특정 모드/우선순위 결과 업데이트
                    nextDays[dayKey].routes[mode][priority] = routeSegments;

                    // [핵심] 결과를 히스토리에 저장하여 다음번에 재사용
                    const cacheKey = `${dayKey}-${mode}-${priority}`;
                    if (!routeHistory.current[cacheKey]) routeHistory.current[cacheKey] = {};
                    routeHistory.current[cacheKey][currentOrderKey] = routeSegments;
                    console.log(`[캐시 저장] ${cacheKey}의 결과를 히스토리에 기록했습니다.`);
                });

                return nextDays;
            });
        } catch (err) {
            toast.error("경로 검색 중 오류가 발생했습니다.");
            console.error(err);
        }
    }, [days, markerData, selectedSearch, selectedType]);
    // 주소 검색
    const addMarkerForSearch = useCallback(async () => {
        setSearchList([]);
        const { data } = await axios.post("/kakaoMap/searchAddress", searchData);
        // const {documents} = data;
        // console.log(data);
        data.map(element => {

            setSearchList(prev => ([
                ...prev,
                {
                    addressName: element.address_name,
                    categoryGroupName: element.category_group_name,
                    phone: element.phone,
                    placeName: element.place_name,
                    placeUrl: element.place_url,
                    roadAddressName: element.road_address_name,
                    x: element.x,
                    y: element.y
                }
            ]))
        })
    }, [searchData]);

    const selectType = useCallback(e => {
        const { name } = e.target;
        setSelectedType(() => ({
            [name]: true
        }))
    }, [])

    const selectSearch = useCallback(e => {
        const { name } = e.target;
        setSelectedSearch(name)
    }, [])

    const sendData = useCallback(async () => {
        const payload = {
            data: {
                days: days,
                markerData: markerData
            },
            scheduleDto: {
                ...scheduleDto,
                schedulePublic: scheduleDto.schedulePublic ? "Y" : "N"
            }
        };
        const { data } = await axios.post("/kakaoMap/insertData", payload)
        console.log(data);
        setScheduleDto(prev => ({
            ...prev,
            scheduleName: data.scheduleName,
            scheduleState: data.scheduleState,
            schedulePublic: data.schedulePublic === "Y"
        }));
    }, [days, markerData, scheduleDto])

    const loadData = useCallback(async () => {
        console.log("loadData called with scheduleNo =", scheduleNo);

        if (!scheduleNo) return;

        try {
            const response = await axios.post(`/schedule/detail`, scheduleDto);
            const wrapper = response.data; // ScheduleInsertDataWrapperVO 객체

            // 1. 일정 상세 데이터 (days, markerData) 처리
            if (wrapper.data && wrapper.data.days && Object.keys(wrapper.data.days).length > 0) {
                const loadedDays = wrapper.data.days;
                setDays(loadedDays);
                setMarkerData(wrapper.data.markerData);

                // [캐시 추가 로직] DB에서 가져온 경로 데이터를 히스토리에 등록
                Object.keys(loadedDays).forEach(dayKey => {
                    const dayObj = loadedDays[dayKey];
                    const markerIds = dayObj.markerIds;

                    // 마커가 2개 미만이면 경로가 없으므로 스킵
                    if (!markerIds || markerIds.length < 2) return;

                    const currentOrderKey = markerIds.join(","); // 현재 순서 지문
                    const routesMap = dayObj.routes; // { CAR: { RECOMMEND: [...] }, WALK: {...} }

                    if (routesMap) {
                        Object.keys(routesMap).forEach(mode => {
                            const priorities = routesMap[mode];
                            Object.keys(priorities).forEach(priority => {
                                const routeSegments = priorities[priority];

                                // 데이터가 존재하는 경우에만 캐시에 저장
                                if (routeSegments && routeSegments.length > 0) {
                                    const cacheKey = `${dayKey}-${mode}-${priority}`;

                                    if (!routeHistory.current[cacheKey]) {
                                        routeHistory.current[cacheKey] = {};
                                    }

                                    // 이 순서(OrderKey)에 대한 경로 데이터를 기억함
                                    routeHistory.current[cacheKey][currentOrderKey] = routeSegments;

                                    console.log(`%c[DB 캐시 등록] ${cacheKey}`, "color: #3498db; font-weight: bold", currentOrderKey);
                                }
                            });
                        });
                    }
                });
            }

            // 2. 일정 기본 정보 (scheduleDto) 처리
            if (wrapper.scheduleDto) {
                setScheduleDto({
                    ...wrapper.scheduleDto,
                    schedulePublic: wrapper.scheduleDto.schedulePublic === "Y"
                });
            }
        } catch (error) {
            console.error("데이터 로드 중 오류 발생:", error);
            toast.error("일정을 불러오는 데 실패했습니다.");
        }
    }, [scheduleNo, scheduleDto]); // scheduleDto 추가 (보통 axios 호출 시 사용하므로)

    // polyline을 가져와서 사용하기 위한 Effect
    useEffect(() => {
        const modeRoutes = days[selectedDay]?.routes?.[selectedSearch];
        if (!modeRoutes) {
            setPolyLine([]);
            return;
        }

        const activeLines = [];
        Object.keys(selectedType).forEach(priority => {
            if (selectedType[priority] && modeRoutes[priority]) {
                modeRoutes[priority].forEach(seg => {
                    activeLines.push({ ...seg, priority, type: selectedSearch });
                });
            }
        });
        setPolyLine(activeLines);
    }, [selectedDay, days, selectedSearch, selectedType]);

    const loadMember = useCallback(async () => {
        const { data } = await axios.get(`/schedule/memberList/${scheduleNo}`);
        setMemberList(data);
    }, [scheduleNo]);

    //일정 시작 시간에 따른 상태를 바꾸기 위한 콜백
    const refreshScheduleState = useCallback(async () => {
        if (!scheduleNo) return;
        const { data } = await axios.patch(`/schedule/${scheduleNo}/state`);
        // data 예: { scheduleNo, scheduleState, scheduleStartDate, scheduleEndDate }
        setScheduleDto(prev => ({
            ...prev,
            scheduleState: data.scheduleState,
        }));
    }, [scheduleNo]);

    //시작할 때 진행되는 이팩트
    useEffect(() => {
        loadMember();
        refreshScheduleState().catch(console.log);


    }, [loadMember, refreshScheduleState]);

    // 링크를 타고 들어온 회원 멤버 리스트에 추가
    useEffect(() => {
        if (!scheduleNo) return;
        if (!accountId) return;      // 로그인 안 했으면 패스
        if (guest) return;           // 비회원이면 패스 (회원만 자동참여)

        // memberList가 아직 로딩 전이면 패스
        if (!Array.isArray(memberList)) return;

        // 이미 멤버인지 체크
        const already = memberList.some(m => m.accountId === accountId);
        if (already) return;

        (async () => {
            try {
                await axios.post(`/share/member/${scheduleNo}`, { accountId: loginId });

                loadMember();
            } catch (e) {
                console.log("멤버 자동추가 실패", e);
            }
        })();
    }, [scheduleNo, accountId, guest, memberList]);


    useEffect(() => {
        if (!scheduleNo) return; // 안전장치
        console.log("번호확인", scheduleNo);
        loadData();
    }, [scheduleNo]);

    useEffect(() => {
        const currentDayMarkers = days[selectedDay]?.markerIds || [];

        if (currentDayMarkers.length >= 2) {
            console.log("자동 검색 시작");
            searchAllRoot(selectedDay);
        }
    }, [selectedSearch, selectedType, selectedDay]);

    const currentDayData = days[selectedDay] || { markerIds: [], routes: [] }; // 데이터가 없으면 빈 배열 반환

    const outletContext = {
        days,
        markerIds: currentDayData.markerIds,
        routes: currentDayData.routes,
        markerData,
        selectedDay,
        center,
        searchData,
        searchList,
        tempMarker,
        polyline,
        accountId,
        memberList,
        scheduleNo,
        selectedSearch,
        selectedType,
        setDays,
        setMarkerData,
        removeMarker,
        setCenter,
        setSearchKeyword,
        setSearchList,
        setTempMarker,
        setSelectedDay,
        setSelectedType,
        setSelectedSearch,
        setPolyLine,
        copyUrl,
        addMarker,
        addDays,
        searchAllRoot,
        addMarkerForSearch,
        addTempMarker,
        selectType,
        selectSearch,
        sendData,
        scheduleDto
    };

    const toggleSchedulePublicWithSwal = async () => {
        const nextState = !scheduleDto.schedulePublic;

        const result = await Swal.fire({
            title: nextState ? "공개로 변경할까요?" : "비공개로 변경할까요?",
            text: nextState
                ? "공개하면 링크를 가진 사람이 일정을 볼 수 있어요."
                : "비공개로 바꾸면 나만 볼 수 있어요.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "변경",
            cancelButtonText: "취소",
            confirmButtonColor: nextState ? "#79c6b5" : "#6c757d", // 민트/그레이
            cancelButtonColor: "#adb5bd",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        await axios.patch("/schedule/public", {
            scheduleNo: Number(scheduleDto.scheduleNo),
            schedulePublic: nextState,
        });

        setScheduleDto((prev) => ({
            ...prev,
            schedulePublic: nextState,
        }));

        await Swal.fire({
            title: "변경 완료!",
            text: nextState ? "일정이 공개되었습니다." : "일정이 비공개로 변경되었습니다.",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
        });
    };

    const [reviews, setReviews] = useState([]);

    const loadReviews = useCallback(async () => {
        const { data } = await axios.get(`/review/list/${scheduleNo}`);
        setReviews(data);
    }, [scheduleNo]);

    useEffect(() => { loadReviews(); }, [loadReviews]);

    const handleSubmit = async (payload) => {
        await axios.post(
            "/review/insert",
            { scheduleNo: Number(scheduleNo), reviewContent: payload.reviewContent, scheduleUnitList: [] },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        await loadReviews();
    };

    console.log("scheduleDto", scheduleDto);
    return (
        <>
            <div className="container-fluid px-3 py-3 schedule-page">

                {/* ===== 상단: 좌 패널 + 우 지도 ===== */}
                <div className="row g-3 align-items-stretch">

                    {/* 좌측 패널 */}
                    <div className="col-12 col-lg-4 col-xl-3">
                        <div className="panel-card h-100">

                            {/* 상단 액션/정보 바 */}
                            <div className="panel-topbar">
                                <button
                                    type="button"
                                    className={`btn ${scheduleDto.schedulePublic ? "btn-success" : "btn-outline-secondary"} btn-sm`}
                                    onClick={toggleSchedulePublicWithSwal}

                                >
                                    {scheduleDto.schedulePublic ? "공개" : "비공개"}
                                </button>

                                {!guest && (
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copyUrl}>
                                        <FaLink className="me-1" />
                                        공유
                                    </button>
                                )}
                            </div>

                            {/* 참여자 */}
                            <div className="panel-members">
                                <span className="panel-label">참여자</span>
                                <div className="panel-member-chips">
                                    {memberList.map((member) => (
                                        <span className="member-chip"
                                            key={member.scheduleMemberNo}
                                        >
                                            {member.scheduleMemberNickname}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="panel-divider" />

                            {/* Schedule 컴포넌트 영역 */}
                            <div className="panel-body">
                                <Schedule
                                    copyUrl={copyUrl}
                                    memberList={memberList}
                                    outletContext={outletContext}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 우측 지도 */}
                    <div className="col-12 col-lg-8 col-xl-9">
                        <div className="map-card h-100">
                            <Map
                                className="map-info"
                                center={center}
                                level={3}
                                onClick={(_, mouseEvent) => addMarker(mouseEvent.latLng)}
                            >
                                {markerElements()}
                                {tempMarkerElements()}
                                {polylineElements()}
                            </Map>
                        </div>
                    </div>

                </div>

                {/* ===== 하단: 댓글 ===== */}
                <div className="row mt-3">
                    <div className="col-12">
                        <div className="reply-card-wrap">
                            {(scheduleDto.scheduleState === "약속전" ||
                                scheduleDto.scheduleState === "진행중") && <Reply memberList={memberList} />}

                            {scheduleDto.public === true || <Review />}

                            {scheduleDto.scheduleState === "종료" && (
                                scheduleDto.schedulePublic ? (
                                    <Review />
                                ) : (
                                    <MemberReview
                                        reviews={reviews}
                                        canWrite={true}
                                        isGuest={guest}
                                        onSubmit={handleSubmit}
                                    />
                                )
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </>
    );

}
