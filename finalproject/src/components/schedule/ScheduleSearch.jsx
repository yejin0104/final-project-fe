import { FaSearchLocation } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";




export default function ScheduleSearch() {

    const {
        searchData,
        addMarkerForSearch,
        setSearchKeyword,
        searchList,
        addTempMarker
    } = useOutletContext();

    return (<>

        <div className="search-container">
            {/* 검색창을 아예 자식 컴포넌트 내부로 이동 */}
            <div className="col-12 mb-3 d-flex item-group">
                <input 
                    className="form-control" 
                    placeholder="추가할 장소 검색" 
                    value={searchData.query}
                    onChange={(e) => setSearchKeyword({ query: e.target.value })}
                />
                <button className="fs-3 input-group-text" onClick={addMarkerForSearch}><FaSearchLocation /></button>
            </div>

            {/* 검색 결과 리스트 출력 영역 */}
            <div className="search-results">
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
        </div>

    </>)
}