import { useCallback, useEffect, useState } from "react";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import KakaoLoader from "./useKakaoLoader";
import {v4 as uuidv4} from "uuid";

import "./KakaoMapTest.css";
import axios from "axios";
import { DndProvider } from "react-dnd";
import MarkerListSection from "../dnd/MarkerListSection";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function KakaoMapTest() {
    KakaoLoader()

    const [markerIds, setMarkerIds] = useState([]);
    const [location, setLocation] = useState({});
    const [duration, setDuration] = useState({});
    const [distance, setDistance] = useState({});
    const [content, setContent] = useState({});
    const [polyLine, setPolyLine] = useState([]);
    const [selectedType, setSelectedType] = useState({
        RECOMMEND : true,
        TIME : false,
        DISTANCE : false
    })

    const [center, setCenter] = useState({
        lng: 126.9780,
        lat: 37.5665,
    })

    const addMarker = useCallback(async (latlng) => {
        const id = uuidv4();
        const address = {
            x: latlng.getLng(),
            y: latlng.getLat(),
        }
        
        const {data} = await axios.post("/kakaoMap/getAddress", address);
        console.log(data);
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
        
        setMarkerIds(prev => [...prev, id]);
        console.log(markerIds.length);
        setLocation(prev => ({
            ...prev,
            [id] : {
                no : markerIds.length + 1,
                ...address,
                name : addressName[0],
            }
        }));

        setDuration(prev => ({
            ...prev,
            [id] : {
                RECOMMEND : null,
                TIME : null,
                DISTANCE : null
            }
        }))
        
        setDistance(prev => ({
            ...prev,
            [id] : {
                RECOMMEND : null,
                TIME : null,
                DISTANCE : null
            }
        }))

        setContent(prev => ({
            ...prev,
            [id] : {
                content : "메모영역"
            }
        }))
    }, [markerIds]);

    const removeMarker = useCallback((id) => {
        setMarkerIds(prev => prev.filter(m => m !== id));

        setLocation(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });

        setDuration(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });

        setDistance(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });

        setContent(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });

        setPolyLine(prev => prev.length <= 1 ? [] : prev);
        
    }, [setMarkerIds, setLocation, setDuration, setDistance, setContent, setPolyLine]);


    const markerElements = useCallback(e=>{
        return (markerIds.map(id => (
        <MapMarker
            key={id}
            position={{ lng: location[id].x, lat: location[id].y  }}
        />
        )));
    }, [location, markerIds]);

    const polyLineElements = useCallback(e=>{
        return (
            polyLine.filter(pl => selectedType[pl.priority])
                .map((pl, idx) => (
                <Polyline
                    key={idx}
                    path={pl.linePath}
                    strokeWeight={5}
                    strokeColor={pl.color}
                    strokeOpacity={0.7}
                    strokeStyle="solid"
                />
            ))
        )
    }, [polyLine, selectedType])

    const searchAllRoot = useCallback(async (e) => {
        setPolyLine([]);
        if(markerIds.length <= 1) return;
        const priorities = ["RECOMMEND", "TIME", "DISTANCE"];
        console.log(Object.values(location));
        if(markerIds.length === 2) {
            const results = await Promise.all(
                priorities.map(priority =>
                    axios.post(`/kakaoMap/search?priority=${priority}`, Object.values(location))
                )
            );
            
            const colors = ["#0052FF", "#FF2D2D", "#00B050"];
            results.forEach((result,index) => {
                const {summary, sections} = result.data.routes[0];
                
                const {roads, duration, distance} = sections[0];
                const {priority} = summary;
                console.log(result)
                // console.log(`roads : ${roads} || duration : ${duration} || distance : ${distance}`);
                // console.log(`priority : ${priority}`);
                const linePath = [];
                roads.forEach(({vertexes}) => {
                    for (let i = 0; i < vertexes.length; i += 2){
                        linePath.push({lng : vertexes[i], lat : vertexes[i+1]});
                    }
                });
                setDuration(prev => {
                    const next = { ...prev };
                    markerIds.forEach(id => {
                        next[id] = {
                        ...(next[id] || {}),
                        [priority]: duration,
                        };
                    });
                    return next;
                });
                setDistance(prev => {
                    const next = { ...prev };
                    markerIds.forEach(id => {
                        next[id] = {
                        ...(next[id] || {}),
                        [priority]: distance,
                        };
                    });
                    return next;
                })
                setPolyLine(prev => [
                    ...prev,
                    { linePath, color : colors[index], priority : priorities[index] }
                ])                
            });
        } else {
            const {data} = await axios.post("/kakaoMap/searchAll", Object.values(location));
            const {sections} = data.routes[0]
            const colors = ["#0052FF", "#FF2D2D", "#00B050"];
            sections.map(({roads}, index) => {
                const linePath = [];
                roads.forEach(({vertexes}) => {
                    for (let i = 0; i < vertexes.length; i += 2){
                        linePath.push({lng : vertexes[i], lat : vertexes[i+1]});
                    }
                });
                setPolyLine(prev => [
                    ...prev,
                    { linePath, color : colors[index % 3], priority : priorities[0] }
                ])
            })
        }
    }, [location, markerIds])

    const selectType = useCallback(e => {
        const {name} = e.target;
        setSelectedType(prev => ({
            ...prev,
            [name] : !prev[name]
        }))
    }, [location])

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
                {polyLineElements()}
                </Map>
                <div className="marker-list">
                    <h4 className="text-center">Marker List</h4>
                    <DndProvider backend={HTML5Backend}>
                        <MarkerListSection
                            markerIds={markerIds}
                            location={location}
                            duration={duration}
                            distance={distance}
                            content={content}
                            selectedType={selectedType}
                            setMarkerIds={setMarkerIds}
                            setContent={setContent}
                            setLocation={setLocation}
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
                </div>
            </div>
        </>
    )
}