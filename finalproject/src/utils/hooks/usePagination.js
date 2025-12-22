import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/*
    [커스텀 훅] 데이터 더보기 기능 (프론트엔드 페이징 버전)
    - url: 데이터를 요청할 주소
    - limit: 한 번에 보여줄 개수 (기본값 6개)
*/
export const usePagination = (url, limit = 6) => {
    
    // 전체 데이터 (DB에서 가져온 원본)
    const [fullList, setFullList] = useState([]);
    
    // 화면에 보여줄 데이터 (잘라낸 것)
    const [list, setList] = useState([]);
    
    // 현재 페이지 번호
    const [page, setPage] = useState(1);
    
    // 더 보여줄 데이터가 있는지 여부
    const [hasMore, setHasMore] = useState(true);

    // 1. 최초 데이터 로드 (한 번만 실행)
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        try {
            const resp = await axios.get(url);
            // 백엔드에서 배열을 바로 준다고 가정 (ScheduleListResponseVO[])
            const allData = resp.data;
            
            setFullList(allData);
            
            // 첫 페이지 분량만큼 자르기
            setList(allData.slice(0, limit));
            setHasMore(allData.length > limit);
        } catch (err) {
            console.error("데이터 로드 실패", err);
        }
    }, [url, limit]);

    // 2. 페이지가 변경될 때마다 보여줄 데이터 추가
    useEffect(() => {
        if (page === 1) return; // 첫 로딩은 위에서 처리함

        const nextEnd = page * limit;
        setList(fullList.slice(0, nextEnd)); // 0부터 현재 페이지까지 잘라서 보여줌
        
        // 남은 데이터가 있는지 확인
        setHasMore(fullList.length > nextEnd);
    }, [page, fullList, limit]);

    // 더보기 버튼 클릭 시 호출할 함수
    const nextPage = () => {
        setPage((prevPage) => prevPage + 1);
    };

    return { list, hasMore, nextPage };
};