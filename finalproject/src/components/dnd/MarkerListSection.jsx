import { useCallback } from "react";
// import update from "immutability-helper";
import { Marker } from "./Marker";

export default function MarkerListSection({ markerIds, location, duration, distance, content, setContent, setMarkerIds, setLocation, removeMarker }) {
    // id로 마커 찾기
    const findMarker = useCallback((id) => {
        const index = markerIds.indexOf(id);
        return { id, index};
    }, [markerIds]);

    const moveMarker = useCallback((id, atIndex) => {
        setMarkerIds((prev) => {
            const fromIndex = prev.indexOf(id);
            if (fromIndex === -1 || atIndex < 0 || atIndex >= prev.length) {
                return prev;
            }

            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(atIndex, 0, moved);
            setLocation(prev => {
            const newLoc = { ...prev };
                // 1. 순서가 변경된 updated 배열을 순회합니다.
                updated.forEach((markerId, index) => {
                    // 2. 새로운 순서(index + 1)를 해당 markerId의 location에 할당합니다.
                    if (newLoc[markerId]) {
                        newLoc[markerId] = {
                            ...newLoc[markerId],
                            no: index + 1, // 1부터 시작하도록 설정
                        };
                    }
                });
                    
                return newLoc;
            });

            return updated;
        });
        },
        [setMarkerIds, setLocation],
    );

    const changeStrValue = useCallback((e, id) => {
        const {name, value} = e.target;
        setContent(prev =>({
            ...prev,
            [id] : {
                ...prev[id],
                [name] : value
            }
        }));
    }, [])


    // 리스트 렌더링 (여기가 DnD가 작동하는 영역)
    const listElements = markerIds.map((id, index) => (
        <Marker
            key={id}
            id={`${id}`}
            location={location[id]}
            duration={duration[id]}
            distance={distance[id]}
            content={content[id]}
            moveMarker={moveMarker}
            findMarker={findMarker}
            onRemove={() => removeMarker(id)}
            changeStrValue={(e) => changeStrValue(e, id)}
        />
    ));

    return (
        <div>
            {listElements}
        </div>
    );
}
