import { memo } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './ItemTypes'
import { FaXmark } from "react-icons/fa6"
const style = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
    backgroundColor: 'white',
    cursor: 'move',
}

export const Marker = memo(function Marker({
    id, location, duration, distance, content, moveMarker, findMarker, onRemove, changeStrValue
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
        <div ref={(node) => drag(drop(node))} style={{ ...style, opacity }}>
            <div className="row">
                <div className="col">
                    <span>{location.no}번 마커 ({id.substring(0, 6)})</span> 
                </div>
                <div className="col text-end">
                    <FaXmark className="text-danger ms-2 text-end" onClick={onRemove} />
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="row schedule-item">
                        <div className="col-3">
                            <div><span className="badge bg-success fs-5">1</span></div>
                            <div><span>시간 {duration.RECOMMEND}</span></div>
                            <div><span>거리 {distance.RECOMMEND}</span></div>
                        </div>
                        <div className="col-9">
                            <div>장소 {location.name}</div>
                            <textarea name="content" placeholder={content.content} onChange={changeStrValue}></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
})
