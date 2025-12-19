import { useParams } from "react-router-dom";
import Reply from "./Reply";
// import Review from "./Review";
import Schedule from "./Schedule";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { FaLink } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import KakaoLoader from "../kakaomap/useKakaoLoader";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import { v4 as uuidv4 } from "uuid";
import { loginIdState } from "../../utils/jotai";



export default function SchedulePage() {
    KakaoLoader()

    const accountId = useAtomValue(loginIdState);
    const [memberList, setMemberList] = useState([]);
    const [days, setDays] = useState({
        1: {
            markerIds: [/* uuid1, uuid2 */],
            routes: [
                /*
                {
                        routeKey : uuid1##uuid2,
                        priority : "RECOMMEND", "TIME", "DISTANCE",
                        type : "CAR", "WALK",
                        distance: int,
                        duration: int,
                        linepath : [ linepath ]
                    
                },
                {
                    
                        routeKey : uuid2##uuid3,
                        priority : "RECOMMEND", "TIME", "DISTANCE",
                        type : "CAR", "WALK",
                        distance: int,
                        duration: int,
                        linepath : [ linepath ]
                }
                */
            ],
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

          const {data} = await axios.get(`/schedule/share/${scheduleNo}`);
          console.log("shareKey",data);

          const url = `${window.location.origin}/share/${data}`;
          await navigator.clipboard.writeText(url);
          
          toast.success("링크 복사 완료")
    } catch (error) {
      
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
        scheduleName : "",
        schedulePublic : false,
        scheduleState : "",
        scheduleNo : scheduleNo
    })

    const PRIORITY_COLORS = {
        RECOMMEND: "#0052FF",
        TIME: "#FF2D2D",
        DISTANCE: "#00B050"
    };

    const changeScheduleValue = useCallback(e=>{
        const { name, value } = e.target;
        setScheduleDto(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const togglePublic = () => {
        setScheduleDto(prev => ({
            ...prev,
            schedulePublic: !prev.schedulePublic // true <-> false 반전
        }));
    };

    const copyUrl = useCallback(() => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => { toast.success("링크 복사 완료") });
    }, []);

    const addMarker = useCallback(async (latlng) => {
        const id = uuidv4();
        const address = {
            x: latlng.getLng(),
            y: latlng.getLat(),
        }

        const { data } = await axios.post("/kakaoMap/getAddress", address);
        const addressName = data.documents.map(({ address, road_address }) => {
            if (road_address === null) {
                return address.address_name;
            }
            if (road_address.building_name.length !== 0) {
                return road_address.building_name
            }
            if (road_address.road_name.length !== 0) {
                return road_address.road_name
            }
            if (road_address.address_name.length !== 0) {
                return road_address.address_name
            }

        })

        // 1. setDays를 먼저 실행하여 새로운 markerIds의 길이를 확정하고,
        //    기존의 distance/duration을 유지하며 마커 ID를 추가합니다.
        const currentDay = days[selectedDay] || { markerIds: [] };
        const markerNo = currentDay.markerIds.length + 1;
        setDays(prev => {
            return {
                ...prev,
                [selectedDay]: {
                    ...currentDay, // distance와 duration을 포함한 기존 필드 유지
                    markerIds: [...currentDay.markerIds, id], // 새 ID 추가
                }
            };
        });

        // 2. setMarkerData를 실행할 때, setDays에서 계산한 newMarkerNo를 사용합니다.
        //    (setDays 호출 직후 newMarkerNo가 업데이트 되므로 사용 가능)
        setMarkerData(prev => ({
            ...prev,
            [id]: {
                no: markerNo, // setDays에서 계산된 정확한 순서
                ...address,
                name: addressName[0],
                content: ""
            }
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
        // 1. 현재 days 상태를 가져와서 다음 날짜 번호를 정확히 계산
        // (Object.keys(days)를 사용하기 위해 의존성 배열에 days 추가 필요)
        const currentDayKeys = Object.keys(days).map(Number);

        // 키값 중 가장 큰 숫자 + 1 (중간에 삭제된 날짜가 있어도 안전함)
        const nextDay = currentDayKeys.length > 0 ? Math.max(...currentDayKeys) + 1 : 1;

        // 2. days 상태 업데이트 (계산해둔 nextDay 사용)
        setDays(prev => ({
            ...prev,
            [nextDay]: {
                markerIds: [],
                routes: []
            }
        }));

        // 3. 화면도 방금 만든 날짜(nextDay)로 강제 이동
        setSelectedDay(nextDay);

    }, [days]);

    const removeMarker = useCallback((dayKey, id) => {
        const currentMarkerIds = days[dayKey]?.markerIds || [];
        const updatedMarkerIds = currentMarkerIds.filter(markerId => markerId !== id);

        // 이 시점에 updatedMarkerIds는 삭제된 ID가 제거된 새로운 ID 목록입니다.

        setDays(prevDays => {
            // 1. 삭제할 마커가 속한 날짜 데이터를 가져옴
            const targetDay = prevDays[dayKey];
            if (!targetDay) return prevDays;

            // 2. 해당 날짜의 markerIds에서 ID 제거
            const updatedMarkerIds = targetDay.markerIds.filter(markerId => markerId !== id);

            // 3. 해당 날짜의 routes에서 삭제된 마커와 관련된 경로만 필터링
            const updatedRoutes = (targetDay.routes || []).filter(segment => {
                const { routeKey } = segment;
                // routeKey가 null이거나 형식이 다른 경우를 대비해 안전장치 추가
                if (!routeKey) return true; 

                // 삭제되는 마커가 시작점(start)이거나 끝점(end)인 경로를 제거
                const isRelated = routeKey.startsWith(id + '##') || routeKey.endsWith('##' + id);
                return !isRelated; 
            });

            // 4. 전체 days 상태에서 해당 dayKey만 교체하여 반환
            return {
                ...prevDays,
                [dayKey]: {
                    ...targetDay,
                    markerIds: updatedMarkerIds,
                    routes: updatedRoutes,
                },
            };
        });


        // 2. markerData 상태 업데이트
        setMarkerData(prevMarkerData => {
            const updatedMarkerData = { ...prevMarkerData };
            delete updatedMarkerData[id]; // 마커 데이터 제거

            // **markerData의 'no' 값 재정렬 (선택된 날짜의 마커만)**            
            const newMarkerData = { ...updatedMarkerData }; // 최종 반환할 객체

            updatedMarkerIds.forEach((markerId, index) => {
                // markerData에서 해당 ID의 데이터가 있는지 확인
                if (newMarkerData[markerId]) {
                    newMarkerData[markerId] = {
                        ...newMarkerData[markerId],
                        no: index + 1, // 새로운 순서 할당
                    };
                }
            });

            return newMarkerData;
        });

    }, [days, setDays, setMarkerData]);

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
        return (
            polyline
                // 선택된 타입에 따라 필터링 (selectedType: { RECOMMEND: true, ... })
                .filter(pl => selectedSearch === pl.type)
                .map((pl, idx) => (
                    <Polyline
                        key={idx}
                        path={pl.linepath}
                        strokeWeight={5}
                        strokeOpacity={0.7}
                        strokeStyle="solid"
                        strokeColor={selectedType[pl.priority] ? PRIORITY_COLORS[pl.priority] : "#4e4e4e"}
                        zIndex={selectedType[pl.priority] ? 10 : 1}
                    />
                ))
        );

    }, [polyline, selectedType, selectedSearch]);

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
        // 1. 대상 날짜 결정 (인자가 있으면 [day], 없으면 모든 날짜 키)
        const targetDayKeys = day ? [day] : Object.keys(days);

        // 유효한 날짜(마커가 2개 이상인 날짜)만 필터링
        const validDayKeys = targetDayKeys.filter(key => days[key]?.markerIds.length >= 2);

        if (validDayKeys.length === 0) return;

        const modes = ["CAR", "WALK"];
        const priorities = ["RECOMMEND", "TIME", "DISTANCE"];
        const requests = [];

        // 2. 모든 대상 날짜 x 모드 x 우선순위 조합으로 요청 생성
        validDayKeys.forEach(dayKey => {
            const markerIds = days[dayKey].markerIds;
            const markerValues = markerIds.map(id => markerData[id]);

            modes.forEach(mode => {
                const isCar = mode === "CAR";
                const baseUrl = isCar
                    ? (markerIds.length === 2 ? "/kakaoMap/search" : "/kakaoMap/searchAll")
                    : "/kakaoMap/searchForWalk";

                priorities.forEach(priority => {
                    requests.push({
                        dayKey, // 나중에 업데이트할 때 필요
                        mode,
                        priority,
                        promise: axios.post(`${baseUrl}?priority=${priority}`, markerValues)
                    });
                });
            });
        });

        try {
            // 3. 병렬 실행
            const responses = await Promise.all(requests.map(r => r.promise));

            // 4. 날짜별로 결과 임시 저장소 생성
            // 예: { "1": [], "2": [] }
            const newRoutesByDay = {};
            validDayKeys.forEach(k => { newRoutesByDay[k] = []; });

            // 5. 응답 결과 정제 및 분류
            responses.forEach((res, index) => {
                const { dayKey, mode, priority } = requests[index];
                const data = res.data;
                const currentMarkerIds = days[dayKey].markerIds;

                if (mode === "CAR") {
                    const { summary, sections } = data.routes[0];
                    sections.forEach((section, idx) => {
                        newRoutesByDay[dayKey].push({
                            routeKey: `${currentMarkerIds[idx]}##${currentMarkerIds[idx + 1]}`,
                            priority: summary.priority || priority,
                            distance: section.distance,
                            duration: section.duration,
                            linepath: parseVertexes(section.roads),
                            type: "CAR",
                        });
                    });
                } else {
                    data.distance.forEach((dist, idx) => {
                        newRoutesByDay[dayKey].push({
                            routeKey: `${currentMarkerIds[idx]}##${currentMarkerIds[idx + 1]}`,
                            priority: data.priority || priority,
                            distance: dist,
                            duration: data.duration[idx],
                            linepath: data.linepath[idx],
                            type: "WALK",
                        });
                    });
                }
            });

            // 6. 상태 업데이트 (여러 날짜를 한꺼번에 업데이트)
            setDays(prev => {
                const next = { ...prev };
                validDayKeys.forEach(dayKey => {
                    next[dayKey] = {
                        ...prev[dayKey],
                        routes: newRoutesByDay[dayKey] // 해당 날짜의 6가지 경로 조합 교체
                    };
                });
                return next;
            });

        } catch (err) {
            console.error("통합 경로 검색 중 오류 발생:", err);
        }
    }, [days, markerData]);

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
                schedulePublic: scheduleDto.schedulePublic? "Y":"N"
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
        const response = await axios.post(`/schedule/detail`, scheduleDto)
        const wrapper = response.data; // ScheduleInsertDataWrapperVO 객체

        // 1. 일정 상세 데이터 (days, markerData) 처리
        if (wrapper.data && wrapper.data.days && Object.keys(wrapper.data.days).length > 0) {
            setDays(wrapper.data.days);
            setMarkerData(wrapper.data.markerData);
        }

        // 2. 일정 기본 정보 (scheduleDto) 처리
        if (wrapper.scheduleDto) {
            setScheduleDto({
                ...wrapper.scheduleDto,
                // 중요: 서버의 "Y"/"N"을 React 상태인 true/false로 변환
                schedulePublic: wrapper.scheduleDto.schedulePublic === "Y"
            });
        }
    }, [])

    // polyline을 가져와서 사용하기 위한 Effect
    useEffect(() => {
        const routes = days[selectedDay]?.routes;

        if (!routes || routes.length === 0) {
            setPolyLine([]);
            return;
        }

        const linesToRender = routes.map(segment => {
            // segment: { routeKey: "uuid1-uuid2", priority: "RECOMMEND", linepath: [...], type:"WALK?CAR" }

            // linepath가 빈 배열이 아닌지 확인해야 합니다.
            if (!segment.linepath || segment.linepath.length === 0) {
                console.warn(`[Day ${selectedDay}] priority: ${segment.priority}의 linepath가 비어있습니다.`);
                return null; // 이 segment는 건너뜁니다.
            }

            // 렌더링 상태 (linesToRender)에 필요한 객체 형태로 변환
            return {
                priority: segment.priority,
                linepath: segment.linepath,
                type: segment.type,
            };
        }).filter(segment => segment !== null); // null 값을 필터링하여 제거

        // 3. PolyLine 상태 갱신
        setPolyLine(linesToRender);

        // selectedDay나 days가 바뀔 때마다 실행되어 polyline을 갱신합니다.
    }, [selectedDay, days, setPolyLine, selectedSearch]);

    useEffect(() => {

        async function loadMember() {
            const { data } = await axios.get(`/schedule/memberList/${scheduleNo}`);
            setMemberList(data);
            console.log("데이터확인 =", data);
        }

        loadMember();
    }, [scheduleNo]);

    useEffect(() => {
        loadData();
    }, [loadData])

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

    return (
        <>
            <div className="container">
                <div className=" map-area">
                    <div className="schedule-list">

                        {/* 1. SchedulePage에서 Schedule 컴포넌트 렌더링 */}
                        {/* SchedulePage의 상태와 함수를 Schedule 컴포넌트로 전달 */}
                        <Schedule
                            copyUrl={copyUrl}
                            memberList={memberList}
                            outletContext={outletContext} // context를 Schedule로 전달
                        />

                    </div>
                    <div className="d-flex detail-box justify-content-center align-items-center">
                            <button type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setScheduleDto(prev => ({...prev, schedulePublic: !prev.schedulePublic}))}>
                                <span>
                                    {scheduleDto.schedulePublic? "공개":"비공개"}
                                </span>
                            </button>
                        <div className="d-flex justify-content-center align-items-center box ms-2">
                            <span>참여자 : </span>
                            {memberList.map((member) => (
                                <span className="ms-1" key={member}>{member.scheduleMemberNickname}</span>
                            ))}
                        </div>
                        <div className="d-flex justify-content-center align-items-center box ms-2"
                            onClick={copyUrl}>
                            <FaLink /><span className="ms-1 point">일정 공유하기</span>
                        </div>
                    </div>
                    <div className="map-wrapper">
                        <Map
                            className="map-info"
                            center={center}
                            level={3}
                            onClick={(_, mouseEvent) => {
                                addMarker(mouseEvent.latLng);
                            }}
                        >
                            
                            {markerElements()}
                            {tempMarkerElements()}
                            {polylineElements()}
                        </Map>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col">
                            <Reply />
                            {/* <Review/> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
