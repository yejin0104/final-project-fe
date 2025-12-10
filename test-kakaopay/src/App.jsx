import './App.css'
import {BrowserRouter} from "react-router-dom"
import Content from "./components/Content";
import { Bounce, ToastContainer } from "react-toastify";

export default function App() {
  //const navigate = useNavigate();//사용 불가(Router 외부라서)



  return (
    <>
      <BrowserRouter>       
          <div className="container-fluid my-5 pt-5">
            <Content/>
          </div>
      </BrowserRouter>

      
      {/* 토스트 메세지 컨테이너 */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  )
}