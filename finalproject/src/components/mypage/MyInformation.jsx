import { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { User, Mail, Phone, Calendar, Smile, Lock } from "lucide-react";
import MyInfoEditModal from "./MyInfoEditModal";

// Minty 테마 색상
const MINT_COLOR = "#78C2AD";

export default function MyInfo() {
    // setMyInfo는 상위(Outlet)에서 전달해줘야 함 (화면 갱신용)
    const { myInfo, setMyInfo } = useOutletContext(); 

    // 모달 설정 State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: "",       // nickname, password, phone, birth, gender, email
        label: "",      // 모달 타이틀용 라벨
        value: ""       // 기존 값
    });

    // 1. 모달 열기 핸들러
    const openEditModal = useCallback((type, label, value) => {
        setModalConfig({
            isOpen: true,
            type: type,
            label: label,
            value: value || ""
        });
    }, []);

    // 2. 모달 닫기 핸들러
    const closeModal = useCallback(() => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    // 3. 수정 성공 시 화면 갱신 핸들러 (모달에서 호출)
    const handleUpdateSuccess = useCallback((updatedField) => {
        // updatedField 예시: { accountNickname: "새닉네임" }
        if (setMyInfo) {
            setMyInfo(prev => ({ ...prev, ...updatedField }));
        }
        closeModal();
    }, [closeModal, setMyInfo]);

    // UI Row 컴포넌트
    const InfoRow = ({ icon: Icon, label, value, type, readOnly = false, isLast = false }) => {
        return (
            <div className={`row align-items-center py-3 mx-0 ${!isLast ? "border-bottom" : ""}`} style={{ borderColor: "#f0f0f0", minHeight: "70px" }}>
                <div className="col-3 col-md-2 d-flex align-items-center ps-2 ps-md-4">
                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3 flex-shrink-0"
                        style={{ width: "32px", height: "32px", backgroundColor: "#effbf8", color: MINT_COLOR }}>
                        <Icon size={18} />
                    </div>
                    <span className="fw-bold text-secondary small text-uppercase">{label}</span>
                </div>
                <div className="col-6 col-md-8">
                    <div className="fw-bold text-dark ps-2" style={{ fontSize: "1rem" }}>
                        {/* 비밀번호는 숨김 처리 */}
                        {type === 'password' ? "********" : (value || <span className="text-muted small">-</span>)}
                    </div>
                </div>
                <div className="col-3 col-md-2 text-end pe-2 pe-md-4">
                    {!readOnly && (
                        <button
                            className="btn btn-sm fw-bold px-3"
                            style={{ backgroundColor: "#f1f3f5", color: "#495057", border: "none", borderRadius: "8px" }}
                            onClick={() => openEditModal(type, label, value)}
                        >
                            수정
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (!myInfo) return <div>로딩중...</div>;

    return (
        <div className="animate-fade-in">
            <h4 className="fw-bold mb-4" style={{ color: "#333" }}>내 정보 관리</h4>

            <div className="bg-white border rounded-4 shadow-sm">
                {/* 아이디는 수정 불가(readOnly) */}
                <InfoRow icon={User} label="아이디" value={myInfo.accountId} readOnly />
                
                {/* 수정 가능한 항목들 */}
                <InfoRow icon={Lock} label="비밀번호" value="" type="password" />
                <InfoRow icon={Smile} label="닉네임" value={myInfo.accountNickname} type="nickname" />
                <InfoRow icon={Mail} label="이메일" value={myInfo.accountEmail} type="email" />
                <InfoRow icon={Phone} label="연락처" value={myInfo.accountContact} type="phone" />
                <InfoRow icon={Calendar} label="생년월일" value={myInfo.accountBirth} type="birth" />
                <InfoRow icon={User} label="성별" value={myInfo.accountGender} type="gender" isLast />
            </div>

            {/* 통합 수정 모달 */}
            {modalConfig.isOpen && (
                <MyInfoEditModal
                    isOpen={modalConfig.isOpen}
                    onClose={closeModal}
                    type={modalConfig.type}
                    label={modalConfig.label}
                    currentValue={modalConfig.value}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}