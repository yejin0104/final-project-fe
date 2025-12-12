import { useCallback } from "react";
// import update from "immutability-helper";
import { Marker } from "./Marker";

export default function MarkerListSection({ markerIds, routes, markerData, setDays, setMarkerData, selectedDay, selectedType, removeMarker }) {
    // id로 마커 찾기
    const findMarker = useCallback((id) => {
        const index = markerIds.indexOf(id);
        return { id, index};
    }, [markerIds]);

    const moveMarker = useCallback((id, atIndex) => {
        setDays((prev) => {
            // console.log(prev[selectedDay].markerIds.indexOf(id))
            const currentMarkerIds = prev[selectedDay].markerIds;
            const fromIndex = currentMarkerIds.indexOf(id);
            if (fromIndex === -1 || atIndex < 0 || atIndex >= currentMarkerIds.length) {
                return prev;
            }

            const updated = [...currentMarkerIds];
            // console.log(updated)
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(atIndex, 0, moved);

            setMarkerData(prev => {
                const newMarkerData = { ...prev };

                // 1. 순서가 변경된 updated 배열을 순회합니다.
                updated.forEach((markerId, index) => {
                    // 2. 새로운 순서(index + 1)를 해당 markerId의 location에 할당합니다.
                    if (newMarkerData[markerId]) {
                        newMarkerData[markerId] = {
                            ...newMarkerData[markerId],
                            no: index + 1, // 1부터 시작하도록 설정
                        };
                    }
                });
                    
                return newMarkerData;
            });

            return {
                ...prev,
                [selectedDay] : {
                    ...prev[selectedDay],
                    markerIds : updated
                }
            };
        });
    }, [setMarkerData, setDays, selectedDay]);

    const changeStrValue = useCallback((e, id) => {
        const {name, value} = e.target;
        // console.log(`name = ${name} || value = ${value} || id = ${id}`);
        setMarkerData(prev =>({
            ...prev,
            [id] : {
                ...prev[id],
                [name] : value
            }
        }));
    }, [])


    // 리스트 렌더링 (여기가 DnD가 작동하는 영역)
    const listElements = markerIds.map((id, index) => {
        const prevId = markerIds[index - 1];
        const nextId = markerIds[index + 1];

        const prevKey = prevId ? `${prevId}##${id}` : null;
        const nextKey = nextId ? `${id}##${nextId}` : null;

        const durationForMarker = {
            prev: prevKey ? routes.find(route => route.routeKey === prevKey)?.duration : null,
            next: nextKey ? routes.find(route => route.routeKey === nextKey)?.duration : null,
        };
        const distanceForMarker = {
            prev: prevKey ? routes.find(route => route.routeKey === prevKey)?.distance : null,
            next: nextKey ? routes.find(route => route.routeKey === nextKey)?.distance : null,
        };
        return ( <Marker
            key={id}
            id={`${id}`}
            markerData={markerData[id]}
            duration={durationForMarker}
            distance={distanceForMarker}
            moveMarker={moveMarker}
            findMarker={findMarker}
            onRemove={() => removeMarker(id)}
            changeStrValue={(e) => changeStrValue(e, id)}
        />
    )});

    return (
        <div>
            {listElements}
        </div>
    );
}
