import './App.css'
import {BrowserRouter} from "react-router-dom"
import Content from "./components/Content";

export default function App() {
  //const navigate = useNavigate();//사용 불가(Router 외부라서)



  return (
    <>
      <BrowserRouter>       
          <div className="container-fluid my-5  pt-5">
            <Content/>
          </div>
      </BrowserRouter>
    </>
  )
}