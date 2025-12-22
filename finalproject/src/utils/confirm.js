import Swal from 'sweetalert2';

/**
 * 예쁜 확인 창을 띄우는 공용 함수
 * @param {Object} options - SweetAlert2 옵션
 * @returns {Promise} - Swal 결과 (isConfirmed: true/false)
 */
export const confirm = (options) => {
    const defaultOptions = {
        title: '확인',
        text: '진행하시겠습니까?',
        icon: 'question',
        showCancelButton: true, // [핵심] 취소 버튼 활성화
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        confirmButtonColor: '#4e9f86', // 기본 민트색
        cancelButtonColor: '#868e96',  // 기본 회색
        reverseButtons: true, // 취소 버튼을 왼쪽에 배치 (실수 방지)
        focusCancel: true,    // 취소 버튼에 포커스 (엔터 누르면 취소됨 - 안전장치)
        customClass: {
            popup: 'rounded-4 shadow-lg', // 팝업 둥글게
            confirmButton: 'px-4 py-2 fw-bold',
            cancelButton: 'px-4 py-2'
        }
    };

    // 기본 옵션과 사용자 옵션을 합침
    const finalOptions = { ...defaultOptions, ...options };

    return Swal.fire(finalOptions);
};