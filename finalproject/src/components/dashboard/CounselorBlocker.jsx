import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { loginLevelState } from "../../utils/jotai";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function CounselorBlocker() {

    const navigate = useNavigate();
    const location = useLocation();
    const userLevel = useAtomValue(loginLevelState);

    useEffect(() => {
        const counselor = (userLevel === '상담사');
        const dashboard = location.pathname.startsWith('/counselor/dashboard');

        if(counselor && !dashboard) {

            toast.warn(
                ` 상담사 계정은 대시보드 외 페이지에 접근할 수 없습니다.`, 
                {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    style: {
                        width: "450px",
                        minWidth: "400px",
                        whiteSpace: "nowrap",
                        backgroundColor: "#fc0b37ff",
                    },
                    bodyStyle: {
                        margin: "0 10px",
                        padding: "0 10px",
                    }
                }
            );
            navigate('/counselor/dashboard');
        }
    }, [location.pathname, userLevel, navigate]);

    return (
        <></>
    )
}