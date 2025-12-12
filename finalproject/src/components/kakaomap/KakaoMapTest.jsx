import { useCallback, useEffect, useState } from "react";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import KakaoLoader from "./useKakaoLoader";
import {v4 as uuidv4} from "uuid";

import "./KakaoMapTest.css";
import axios from "axios";
import { DndProvider } from "react-dnd";
import MarkerListSection from "../dnd/MarkerListSection";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FaPlus } from "react-icons/fa6";

export default function KakaoMapTest() {
    KakaoLoader()

    const [days, setDays] = useState({
        1: {
            markerIds : [ /* uuid1, uuid2 */],
            routes : [
                /*
                {
                        routeKey : uuid1##uuid2,
                        priority : "RECOMMEND", "TIME", "DISTANCE",
                        distance: int,
                        duration: int,
                        linepath : [ linepath ]
                    
                },
                {
                    
                        routeKey : uuid2##uuid3,
                        priority : "RECOMMEND", "TIME", "DISTANCE",
                        distance: int,
                        duration: int,
                        linepath : [ linepath ]
                }
                */
            ],
        },
    });
    const [mes, setMes] = useState({
        "상담사ID" : {
            content : []
        },
        "상담자ID" : {
            content : []
        }
    })
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
        RECOMMEND : true,
        TIME : false,
        DISTANCE : false
    })

    const [center, setCenter] = useState({
        lng: 126.9780,
        lat: 37.5665,
    })

    const [searchData, setSearchKeyword] = useState({
        query : ""
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

    const addTempMarker = useCallback((latlng) => {
        setTempMarker(prev => ([
            ...prev,
            {
                x: latlng.getLng(),
                y: latlng.getLat(),
            }
        ]))
    }, [])

    const addMarker = useCallback(async (latlng) => {
        const id = uuidv4();
        const address = {
            x: latlng.getLng(),
            y: latlng.getLat(),
        }
        
        const {data} = await axios.post("/kakaoMap/getAddress", address);
        const addressName = data.documents.map(({address, road_address}) => {
            if(road_address === null){
                return address.address_name;
            }
            if(road_address.building_name.length !== 0){
                return road_address.building_name
            }
            if(road_address.road_name.length !== 0){
                return road_address.road_name
            }
            if(road_address.address_name.length !== 0){
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
                content: "메모영역"
            }
        }));
    }, [days, selectedDay, searchList]);

    // 주소 검색
    const addMarkerForSearch = useCallback(async (e)=>{
        setSearchList([]);
        const {data} = await axios.post("/kakaoMap/searchAddress", searchData);
        // const {documents} = data;
        // console.log(data);
        data.map(element => {

            setSearchList(prev => ([
                ...prev,
                {
                    addressName : element.address_name,
                    categoryGroupName : element.category_group_name,
                    phone : element.phone,
                    placeName : element.place_name,
                    placeUrl : element.place_url,
                    roadAddressName : element.road_address_name,
                    x : element.x,
                    y : element.y
                }
            ]))
        })
    }, [days, selectedDay, searchData]);

    // 마커 삭제
    const removeMarker = useCallback((id) => {
        const currentMarkerIds = days[selectedDay]?.markerIds || [];
        const updatedMarkerIds = currentMarkerIds.filter(markerId => markerId !== id);
        
        // 이 시점에 updatedMarkerIds는 삭제된 ID가 제거된 새로운 ID 목록입니다.

        setDays(prevDays => {
            const currentDay = prevDays[selectedDay];
            if (!currentDay) return prevDays;

            // 1-1. markerIds 배열에서 ID 제거는 이미 위에서 필터링된 updatedMarkerIds 사용
            
            // 1-2. routes 배열 정리 (가장 중요한 부분)
            // routes 배열의 각 segment는 routeKey (예: "uuidA-uuidB")를 가지고 있습니다.
            const updatedRoutes = (currentDay.routes || []).filter(segment => {
                const { routeKey } = segment;
                
                // 삭제하려는 마커 ID가 routeKey의 시작점 또는 끝점인지 확인합니다.
                // 1. key.startsWith(id + '##') : 이 경로의 시작 마커가 삭제될 마커인 경우
                // 2. key.endsWith('##' + id)   : 이 경로의 끝 마커가 삭제될 마커인 경우
                
                // 해당 segment가 삭제된 마커 ID를 포함하고 있으면 (true) -> 필터링에서 제외(false)
                if (routeKey.startsWith(id + '##') || routeKey.endsWith('##' + id)) {
                    return false; // 이 경로는 제거
                }
                return true; // 이 경로는 유지
            });


            // 1-3. days 상태 업데이트 결과 반환
            return {
                ...prevDays,
                [selectedDay]: {
                    ...currentDay,
                    markerIds: updatedMarkerIds, // 필터링된 ID 목록 적용
                    // 새로운 routes 배열 적용
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

    }, [days, selectedDay, setDays, setMarkerData]); 

    const markerElements = useCallback(e=>{
        return (days[selectedDay].markerIds?.map(id => (
        <MapMarker
            key={id}
            position={{ lng: markerData[id].x, lat: markerData[id].y  }}
            image={
                {
                    src:'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
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
                            y: (markerData[id].no-1)*46+10
                        },
                        spriteSize : {
                            width: 36,
                            height: 691
                        }
                    }

                }
            }
        />
        )));
    }, [markerData, selectedDay, days]);

    const tempMarkerElements = useCallback(e=>{
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
            position={{ lng: marker.x, lat: marker.y  }}
            onClick={e=>handleMarkerClick(marker)}
        />
        )));
    }, [tempMarker]);

    const PRIORITY_COLORS = {
        "RECOMMEND": "#0052FF",
        "TIME": "#FF2D2D",
        "DISTANCE": "#00B050"
    };

    const polylineElements = useCallback(() => {
        return (
            polyline
                // 선택된 타입에 따라 필터링 (selectedType: { RECOMMEND: true, ... })
                .filter(pl => selectedType[pl.priority]) 
                .map((pl, idx) => (
                    <Polyline
                        key={idx}
                        path={pl.linepath}
                        strokeWeight={5}
                        strokeOpacity={0.7}
                        strokeStyle="solid"
                        strokeColor={PRIORITY_COLORS[pl.priority]} 
                    />
                ))
        );
        
    }, [polyline, selectedType]); // polyline이 업데이트되면 렌더링

    const searchAllRoot = useCallback(async (e) => {
        resetData();
        if(days[selectedDay]?.markerIds.length <= 1) return;
        const priorities = ["RECOMMEND", "TIME", "DISTANCE"];
        if(days[selectedDay]?.markerIds.length === 2) {
            const selectedDayMarkerData = days[selectedDay]?.markerIds.map(id => markerData[id]);

            const results = await Promise.all(
                priorities.map(priority =>
                    axios.post(`/kakaoMap/search?priority=${priority}`, Object.values(selectedDayMarkerData))
                )
            );
            const newRoutes = [];
            
            results.forEach(result => {
            const { summary, sections } = result.data.routes[0];
            const priority = summary.priority || "RECOMMEND"; // 경로 타입 (priority) 추출

            // sections는 경로를 구성하는 개별 구간 (Segment) 배열입니다.
            sections.forEach(section => {
                const { roads, duration, distance } = section;
                
                const startId = days[selectedDay].markerIds[0]; // 마커 ID
                const endId = days[selectedDay].markerIds[1]; // 마커 ID
                const routeKey = `${startId}##${endId}`;

                // Polyline 좌표 데이터 생성
                const linepath = [];
                roads.forEach(({ vertexes }) => {
                    for (let i = 0; i < vertexes.length; i += 2) {
                        linepath.push({ lng: vertexes[i], lat: vertexes[i + 1] });
                    }
                });

                // 4. 단일 경로 세그먼트 객체 (RouteSegmentDto와 매핑) 생성
                const routeSegment = {
                    routeKey: routeKey,
                    priority: priority,
                    distance: distance,
                    duration: duration,
                    linepath: linepath, 
                };

                newRoutes.push(routeSegment);
            });
            
        });

        // 5. State 업데이트 (한 번만 호출)
        setDays(prev => ({
            ...prev,
            [selectedDay]: {
                ...prev[selectedDay],
                routes: [
                    ...(prev[selectedDay]?.routes || []), // 기존 경로 유지
                    ...newRoutes, // 새 경로 추가
                ],
            },
        }));

        // setPolyLine(prev => [
        //     ...prev,
        //     {linepath: {...polylineData}, }
        // ])
        } else {
            const selectedDayMarkerData = days[selectedDay]?.markerIds.map(id => markerData[id]);
            const {data} = await axios.post("/kakaoMap/searchAll", Object.values(selectedDayMarkerData));
            const {summary, sections} = data.routes[0];
            
            const {priority} = summary;
            const newRoutes = [];

            sections.map(({roads, duration, distance}, index) => {
                const fromId = days[selectedDay].markerIds[index];
                const toId = days[selectedDay].markerIds[index+1];
                const key = `${fromId}##${toId}`;

                const linepath = [];
                roads.forEach(({vertexes}) => {
                    for (let i = 0; i < vertexes.length; i += 2){
                        linepath.push({lng : vertexes[i], lat : vertexes[i+1]});
                    }
                });
                const routeSegment = {
                    routeKey : key,
                    priority : priority,
                    distance : distance,
                    duration : duration,
                    linepath : linepath
                };
                newRoutes.push(routeSegment);


            })
            setDays(prev => ({
               ...prev,
               [selectedDay]: {
                    ...prev[selectedDay],
                    routes : [
                        ...(prev[selectedDay]?.routes || []),
                        ...newRoutes
                    ]
                }
            }));
        }
    }, [days, selectedDay])

    const resetData = useCallback(e => {
        setPolyLine([]);
    }, [])

    const selectType = useCallback(e => {
        const {name} = e.target;
        setSelectedType(prev => ({
            ...prev,
            [name] : !prev[name]
        }))
    }, [])

    const addDays = useCallback(e=>{
        setDays(prev => ({
            ...prev,
            [Object.keys(prev).length + 1] : {
                markerIds : [],
                routes: []
            }   
        }));
        setSelectedDay(selectedDay+1);
    }, [selectedDay]);

    const sendData = useCallback(async (e)=>{
        const {data} = await axios.post("/kakaoMap/insertData", {data : {days: days, markerData: markerData}})
        console.log(data);
    }, [days, markerData])

    const changeStrValue = useCallback((e) => {
        const {name, value} = e.target;
        setSearchKeyword(prev => ({ ...prev, [name]: value }));
    }, [])

    // polyline을 가져와서 사용하기 위한 Effect
    useEffect(() => {
        const routes = days[selectedDay]?.routes;

        if (!routes || routes.length === 0) {
            setPolyLine([]);
            return;
        }

        const linesToRender = routes.map(segment => {
        // segment: { routeKey: "uuid1-uuid2", priority: "RECOMMEND", linepath: [...] }
        
            // linepath가 빈 배열이 아닌지 확인해야 합니다.
            if (!segment.linepath || segment.linepath.length === 0) {
                console.warn(`[Day ${selectedDay}] priority: ${segment.priority}의 linepath가 비어있습니다.`);
                return null; // 이 segment는 건너뜁니다.
            }

            // 렌더링 상태 (linesToRender)에 필요한 객체 형태로 변환
            return {
                priority: segment.priority,
                linepath: segment.linepath
            };
        }).filter(segment => segment !== null); // null 값을 필터링하여 제거

        // 3. PolyLine 상태 갱신
        setPolyLine(linesToRender);
        
        // selectedDay나 days가 바뀔 때마다 실행되어 polyline을 갱신합니다.
    }, [selectedDay, days, setPolyLine]);



    return (
        <>            
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
                <div className="marker-list">
                    <h4 className="text-center">Marker List</h4>
                    <div className="row day-line">
                        <div className="col d-flex add-day">
                            {Object.keys(days).map(dayKey => (
                                <button name={`${dayKey}`} className="btn btn-outline-secondary" key={dayKey}
                                    onClick={e=> setSelectedDay((e.target.name))}>
                                    {dayKey}
                                </button>
                            ))}
                            <button className="btn btn-outline-success" onClick={addDays}>
                                <FaPlus/>
                            </button>
                        </div>
                        <div className="row">
                            <div className="col text-center fs-4">
                                {selectedDay}Day
                            </div>
                        </div>
                    </div>
                    <DndProvider backend={HTML5Backend}>
                        <MarkerListSection
                            markerIds={days[selectedDay].markerIds}
                            routes={days[selectedDay].routes}
                            markerData={markerData}
                            selectedDay={selectedDay}
                            selectedType={selectedType}
                            setDays={setDays}
                            setMarkerData={setMarkerData}
                            removeMarker={removeMarker}
                        />
                    </DndProvider>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <button type="button" className="btn btn-secondary" onClick={searchAllRoot}>테스트 조회용</button>
                    <button type="button" className="btn btn-secondary ms-1" name="RECOMMEND" onClick={selectType}>추천경로</button>
                    <button type="button" className="btn btn-secondary ms-1" name="TIME" onClick={selectType}>최단시간</button>
                    <button type="button" className="btn btn-secondary ms-1" name="DISTANCE" onClick={selectType}>최단길이</button>
                    <button type="button" className="btn btn-secondary ms-1" onClick={sendData}>데이터 전송</button>
                </div>
                <div className="row mt-2">
                    <label className="col-sm-3 col-form-label">
                        <span>주소</span>
                    </label>    
                    <div className="col-sm-9 d-flex">
                        <input className="form-control flex-grow-1 w-auto" name="query" value={searchData.query} onChange={changeStrValue}/>
                        <button className="btn btn-secondary" onClick={addMarkerForSearch}>검색</button>
                    </div>
                </div>
                {searchList?.map((list,index) => {
                    const customLatLng = {
                            getLat: () => parseFloat(list.y),
                            getLng: () => parseFloat(list.x)
                        };
                    return (
                    <div className="row mt-1 border shadow" key={index}>
                        <div className="col" onClick={() => addTempMarker(customLatLng)}>
                            <p>매장명 : {list.placeName}</p>
                            <p>주소 : {list.addressName}</p>
                            <p>도로명 주소 : {list.roadAddressName}</p>
                            <p>업종 : {list.categoryGroupName}</p>
                            <p>전화번호 : {list.phone}</p>
                            <p>매장 홈페이지 : {list.placeUrl}</p>
                        </div>
                    </div>
                    )
                    }
                )} 
            </div>
        </>
    )
}