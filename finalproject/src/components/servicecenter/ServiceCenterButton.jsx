
export default function ServiceCenterButton({ onButtonClick }) {


    const handleClick = () => {
        console.log('고객센터 버튼');
        onButtonClick();
    };

    return (

        // <div className="row mt-4">
        //     <div className="col">
        //         <button className="fixed-bottom end-0 mb-3 me-3 z-3 btn btn-primary rounded-pill shadow p-3 right"
        //             onClick={handleClick} style={{ width: '7.5%', height:'11%'}} role="button">
        //             <spen>고객센터</spen>
        //             <span className="ms-2">💬</span> 
        //         </button>
        //     </div>
        // </div> 
        <div style={{position: 'fixed', bottom: '20px', right: '20px', display: 'flex', 
            flexDirection: 'column', alignItems: 'center', zIndex: 9999}}>
            <button
                className="btn btn-dark rounded-pill p-3 z-3"
                onClick={handleClick}
                style={{width: '70px', height: '70px', display: 'flex', justifyContent: 'center',alignItems: 'center'}}
                >
                {/* 🎧📢📣☎📞📌 */}
                <span style={{fontSize: '30px'}}>☎</span>
            </button>
                <span style={{ fontSize: '11px', marginTop: '4px' }}>고객센터</span>
        </div>
    );
}