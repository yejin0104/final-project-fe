import { use, useCallback, useEffect, useState } from "react"


export const useImage = (initialImage = null) => {

    // state
    const [file, setFile] = useState(null);//객체 상태로 보냄
    const [preview, setPreview] = useState(initialImage);

    // effect
    // 1. 메모리 누수 방지(Cleanup)
    useEffect(() => {
        return () => {
            // 기존 미리보기 URL이 blob 형태라면 메모리 해제
            if (preview && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
                console.log("메모리 해제(Revoke) 완료:", preview);
            }
        };
    }, [preview]);

    // callback
    const handleFile = useCallback((e) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);

            // 미리보기 URL
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
        }
        else {
            setFile(null);
            setPreview(initialImage);
        }
    }, [initialImage]);
    return { file, preview, handleFile, setPreview };
}

/* ================================================================================
[ 프로필 사진 미리보기용 Hook 사용법 ]
================================================================================

1. 상태 관리에서 Hook 호출 (기본 이미지 설정)
   const { file, preview, handleFile } = useImage("/images/default-profile.jpg");

2. JSX (UI 연결)
   - 이미지 태그: <img src={preview} ... />
   - 파일 입력창: <input type="file" onChange={handleFile} ... />

3. sendData (데이터 전송 시 로직)

   const sendData = async () => {
       const formData = new FormData();

       // 1. 텍스트 데이터 모두 담기
       formData.append("accountId", account.accountId);
       formData.append("accountPw", account.accountPw);
       formData.append("accountNickname", account.accountNickname);
       formData.append("accountContact", account.accountContact);
       formData.append("accountEmail", account.accountEmail);
       formData.append("accountGender", account.accountGender);
       formData.append("accountBirth", account.accountBirth);

       // 2. 파일 데이터 담기 (파일이 존재할 때만 추가)
       if (file) {
           formData.append("attach", file); // 백엔드의 @RequestParam 이름과 일치해야 함
       }
       
       // 3. Axios 전송 (FormData는 JSON이 아니므로 객체 그대로 전송)
       try {
           await axios.post("http://localhost:8080/account/join", formData);
           // 성공 처리...
       } catch(e) {
           // 에러 처리...
       }
   }
*/