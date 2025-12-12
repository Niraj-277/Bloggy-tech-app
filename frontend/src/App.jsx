import { BrowserRouter,Routes,Route } from "react-router-dom";
import Homepage from "./components/Homepage/Homepage";
import Login from "./components/Users/Login";
export default function App(){
  
  
  return (<BrowserRouter>
  <Routes>
    <Route path="/" element={<Homepage/>}/>
    <Route path="/login" element={<Login/>}/>
  
  </Routes>
  </BrowserRouter>)
}
