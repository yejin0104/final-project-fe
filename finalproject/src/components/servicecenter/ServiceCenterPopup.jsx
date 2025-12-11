

export default function ServiceCenterPopup({ isOpen, onClose, onChatConnect }) {

    if (!isOpen) { 
        return null;
    }
    
    return (

        <> 
            <div className="card position-fixed"
                style={{ bottom: "130px", right: "20px", width: "320px", borderRadius: "20px"}}>
                <div className="card-header d-flex" style={{ borderBottom: "none" }}>
                    <h4 className="mb-0 text-center flex-grow-1 fw-bold" style={{color: 'black', fontSize:'20px'}}>무엇을 도와드릴까요?</h4>
                    <button type="button" className="btn-close" onClick={onClose} />
                </div>

                <div className="card-body p-3">
                    <button className="btn btn-outline-dark w-100 mb-3 fw-semibold text-start">
                        <span>💬 채팅으로 문의하기 (AI 챗봇)</span>
                    </button>

                    {/* <button className="btn btn-outline-dark w-100 fw-semibold text-start">
                        <span>🎧 상담사 연결하기</span>
                    </button> */}

                    <button className="btn btn-outline-dark w-100 fw-semibold text-start" onClick={onChatConnect}>
                        <span>🎧 상담사 연결하기</span>
                    </button>
                    
                </div>
            </div>
        </>
    )
}