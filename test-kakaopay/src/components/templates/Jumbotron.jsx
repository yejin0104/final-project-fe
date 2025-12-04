//props는 외부에서 전달되는 값의 모음 (구조분해 할당도 가능)
//export default function Jumbotron(props) { //props.subject , props.detail로 사용
export default function Jumbotron({subject = "제목", detail = ""}) {

    //render
    return (<>
        {/* 점보트론 */}
        <div className="row mt-4">
            <div className="col">
                <div className="p-4 bg-dark text-light rounded">
                    <h1>{subject}</h1>
                    <div>{detail}</div>
                </div>
            </div>
        </div>
    </>)
}