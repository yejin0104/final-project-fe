import Swal from "sweetalert2";

export async function confirm({title="제목", text="내용", icon="아이콘", 
    confirmColor="확인_색깔", cancelColor="취소_색깔", confirmText="확인_텍스트", cancelText="취소_텍스트"}) {
    return await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: cancelColor,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        allowOutsideClick: false,
    });
}