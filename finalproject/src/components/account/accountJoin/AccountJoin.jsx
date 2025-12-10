import { useState } from "react";
import { useNavigate } from "react-router-dom"
import AccountJoinStep1 from "./AccountJoinStep1";
import AccountJoinStep2 from "./AccountJoinStep2";

export default function AccountJoin(){

    return (
       <>
        <AccountJoinStep1/>
        <AccountJoinStep2/>
       </>

    )
}