import { memo } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './ItemTypes'
import { FaXmark } from "react-icons/fa6"
// const style = {
//     border: '1px dashed gray',
//     padding: '0.5rem 1rem',
//     marginBottom: '.5rem',
//     backgroundColor: 'white',
//     cursor: 'move',
// }

export const Marker = memo(function Marker({
    id, duration, distance, markerData, moveMarker, findMarker, onRemove, changeStrValue
}) {
    const originalIndex = findMarker(id).index;
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemTypes.MARKER,
            item: { id, originalIndex },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            end: (item, monitor) => {
                const { id: droppedId, originalIndex } = item
                const didDrop = monitor.didDrop()
                if (!didDrop) {
                    moveMarker(droppedId, originalIndex)
                }
            },
        }),
        [id, originalIndex, moveMarker],
    )
    const [, drop] = useDrop(
        () => ({
            accept: ItemTypes.MARKER,
            hover({ id: draggedId }) {
                if (draggedId !== id) {
                    const { index: overIndex } = findMarker(id)
                    moveMarker(draggedId, overIndex)
                }
            },
        }),
        [findMarker, moveMarker],
    )
    const opacity = isDragging ? 0.3 : 1
    return (<>
         {/* 드래그/드롭 기능 연결 (ref) 및 외부 스타일 적용 */}
        <div ref={(node) => drag(drop(node))} className="col-12" style={{ opacity }}>
            <div className="row schedule-item"> {/* 드래그 영역을 schedule-item으로 감싸고 스타일 적용 */}
                
                {/* 1. 마커 순서, 소요 시간, 거리 정보 (3열) */}
                <div className="col-3 d-flex flex-column align-items-center justify-content-center">
                    {/* 순서 번호 */}
                    <div>
                        <span className="badge bg-success fs-5">{markerData.no}</span>
                    </div>
                    
                    {/* 소요 시간 (duration) - next 값이 0보다 클 때만 표시 */}
                    {duration?.next > 0 && (
                        <div className="mt-1">
                            {/* 실제 값 표시 */}
                            <span>{duration?.next}초</span>
                            {/* "소요시간" 레이블은 외부 컴포넌트(MarkerListSection)에서 Day 구분자 아래에 배치되는 것이 일반적입니다. */}
                        </div>
                    )}
                    
                    {/* (선택적) 거리 정보 표시 */}
                    {/* {distance?.next > 0 && (
                        <div className="mt-1">
                            <span>{distance?.next}미터</span>
                        </div>
                    )} */}
                </div>

                {/* 2. 장소 이름, 메모, 삭제 버튼 (9열) */}
                <div className="col-9">
                    <div className="d-flex justify-content-between align-items-start">
                        {/* 장소 이름 */}
                        <div className="fw-bold">{markerData.name}</div>
                        
                        {/* 삭제 버튼 */}
                        <FaXmark 
                            className="text-danger ms-2" 
                            onClick={onRemove} 
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    
                    {/* UUID 표시 (디버깅용) */}
                    <small className="text-muted d-block mb-1">({id.substring(0, 8)})</small>
                    
                    {/* 메모 영역 (textarea) */}
                    <textarea 
                        name="content" 
                        className="form-control mt-1" 
                        placeholder={markerData.content || "메모"} 
                        onChange={changeStrValue}
                        rows="2" // 줄 수 조정
                        style={{ resize: 'none' }} // 크기 조절 방지
                        defaultValue={markerData.content} // markerData.content를 초기값으로 설정
                    ></textarea>
                </div>
            </div>
        </div>
    </>)
})
