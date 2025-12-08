import { useCallback, useEffect, useState } from "react";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import KakaoLoader from "./useKakaoLoader";
import {v4 as uuidv4} from "uuid";
import { FaXmark } from "react-icons/fa6";

import "./KakaoMapTest.css";
import axios from "axios";

export default function KakaoMapTest() {
    KakaoLoader()
    const [location, setLocation] = useState([]);
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

    const addMarker = useCallback(latlng => {
        setLocation(prev => [
            ...prev,
            {
                id : uuidv4(),
                no : prev.length+1, // 1번부터 시작하기위해 +1
                x : latlng.getLng(),
                y : latlng.getLat()
            }
        ]);
    }, []);

    const removeMarker = useCallback(marker => {
        setLocation(prev => {
            const filtered = prev.filter(m => m.id !== marker.id);

            if(filtered.length <= 1){
                setPolyLine([]);
            }

            return filtered.map((marker, index) => ({
                ...marker,
                no : index+1
            }));
        })
    }, []);

    const markerElements = useCallback(e=>{
        return (location.map(marker => (
        <MapMarker
            key={marker.id}
            position={{ lng: marker.x, lat: marker.y  }}
        />
        )));
    }, [location]);
    

    const listElements = useCallback(e=>{
        return (location.map(marker => (
        <div key={marker.id}>
            <span>{marker.no}번 마커({marker.id.substring(0, 6)})</span>
            <button className="btn text-end" onClick={e => removeMarker(marker)}>
                <FaXmark className=" text-danger"/>
            </button>
        </div>
    )));
    }, [location]);

    const rootElements = useCallback(e=>{
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
        if(location.length <= 1) return;
        const priorities = ["RECOMMEND", "TIME", "DISTANCE"];
        if(location.length === 2) {
            const results = await Promise.all(
                priorities.map(priority =>
                    axios.post(`/kakaoMap/search?priority=${priority}`, location)
                )
            );
            // const recommend = results[0]
            // const time = results[1]
            // const distance = results[2]
            
            const colors = ["#0052FF", "#FF2D2D", "#00B050"];
            results.forEach((result, index) => {
                const {roads} = result.data.routes[0].sections[0];
                const linePath = [];
                roads.map(({vertexes}) => {
                    for (let i = 0; i < vertexes.length; i += 2){
                        linePath.push({lng : vertexes[i], lat : vertexes[i+1]});
                    }
                });
                setPolyLine(prev => [
                    ...prev,
                    { linePath, color : colors[index], priority : priorities[index] }
                ])                
            });
        } else {
            const {data} = await axios.post("/kakaoMap/searchAll", location);
            const {sections} = data.routes[0]
            const colors = ["#0052FF", "#FF2D2D", "#00B050"];
            sections.map(({roads}) => {
                const linePath = [];
                roads.map(({vertexes}) => {
                    for (let i = 0; i < vertexes.length; i += 2){
                        linePath.push({lng : vertexes[i], lat : vertexes[i+1]});
                    }
                });
                setPolyLine(prev => [
                    ...prev,
                    { linePath, color : colors[0], priority : priorities[0] }
                ])
            })
        }
    }, [location])

    const selectType = useCallback(e => {
        const {name} = e.target;
        setSelectedType(prev => ({
            ...prev,
            [name] : !prev[name]
        }))
    }, [])

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
                {rootElements()}
                </Map>
                <div className="marker-list">
                    <h4 className="text-center">Marker List</h4>
                    {listElements()}
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