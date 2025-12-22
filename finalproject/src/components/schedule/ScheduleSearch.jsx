import { useOutletContext } from "react-router-dom";
import "./ScheduleSearch.css";
import { FaSearchLocation } from "react-icons/fa";

export default function ScheduleSearch() {
    const {
        searchData,
        addMarkerForSearch,
        setSearchKeyword,
        searchList,
        addTempMarker
    } = useOutletContext();

    const pointColor = "#86C9BB";

    return (
        <div className="search-container p-2">
            {/* 검색창 영역 */}
            <div className="item-group d-flex mb-4 shadow-sm" style={{ borderRadius: '12px' }}>
                <input 
                    className="form-control border-0" 
                    placeholder="어디로 떠나고 싶으신가요?" 
                    value={searchData.query}
                    onChange={(e) => setSearchKeyword({ query: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addMarkerForSearch()} // 엔터키 지원
                />
                <button className="input-group-text border-0" onClick={addMarkerForSearch}>
                    <FaSearchLocation size={20} />
                </button>
            </div>

            {/* 검색 결과 리스트 출력 영역 */}
            <div className="search-results">
                {searchList?.length > 0 ? (
                    searchList.map((list, index) => {
                        const customLatLng = {
                            getLat: () => parseFloat(list.y),
                            getLng: () => parseFloat(list.x)
                        };
                        return (
                            <div 
                                className="result-item-card shadow-sm" 
                                key={index} 
                                onClick={() => addTempMarker(customLatLng)}
                            >
                                <div className="category-badge">{list.categoryGroupName || '장소'}</div>
                                <p className="place-name">{list.placeName}</p>
                                <p className="text-truncate">
                                    <small className="fw-bold">주소: </small>{list.roadAddressName || list.addressName}
                                </p>
                                {list.phone && (
                                    <p className="small text-muted mb-0">📞 {list.phone}</p>
                                )}
                                {list.placeUrl && (
                                    <a 
                                        href={list.placeUrl} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-decoration-none mt-2 d-inline-block"
                                        style={{ color: pointColor, fontSize: '0.75rem' }}
                                        onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 방지
                                    >
                                        상세보기 링크 ↗
                                    </a>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-5 text-muted">
                        <p className="mb-0 small">검색 결과가 없습니다.</p>
                    </div>
                )} 
            </div>
        </div>
    );
}