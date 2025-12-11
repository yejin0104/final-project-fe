import Swal from "sweetalert2";

export async function alert({title="제목", text="내용", icon="아이콘", 
    confirmColor="확인_색깔", confirmText="확인_텍스트"}) {
    return await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: false,
        confirmButtonColor: confirmColor,
        confirmButtonText: confirmText,
        allowOutsideClick: false,
    });
}