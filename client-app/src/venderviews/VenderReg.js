import React,{useState,useEffect} from "react";
import axios from "axios";
import {FaEye,FaEyeSlash} from "react-icons/fa";
import "./venderReg.css";

function VenderReg(){

const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

const[vuserid,setVUserId]=useState("");
const[vuserpass,setVUserPass]=useState("");
const[vrepass,setVRePass]=useState("");
const[showPass,setShowPass]=useState(false);
const[showRePass,setShowRePass]=useState(false);
const[venderName,setVenderName]=useState("");
const[vaddress,setVAddress]=useState("");
const[vcontact,setVContact]=useState("");
const[vemail,setVEmail]=useState("");
const[vpicname,setVPicName]=useState("");
const[vid,setVId]=useState(0);
const[image,setImage]=useState(null);
const[status,setStatus]=useState("");
const[errors,setErrors]=useState({});
const[venderList,setVenderList]=useState([]);

useEffect(()=>{
fetchVenderList();
},[]);

const fetchVenderList = async () => {
try{
const res = await axios.get(`${REACT_APP_BASE_API_URL}/vender/getvendercount`);
setVenderList(res.data);
setVId(res.data.length+1);
}catch(error){
alert(error);
}
};

const validateForm=()=>{
let temp ={};
let valid = true;

if(!vuserid || vuserid.length<4){
temp.vuserid="User Id must be at least 4 characters long";
valid=false;
}else if(venderList.some(v => v.VUserId === vuserid)){
temp.vuserid="User Id already exists";
valid=false;
}

if(!vuserpass||vuserpass.length<6){
temp.vuserpass="Password must be at least 6 characters long";
valid=false;
}

if(vrepass!==vuserpass){
temp.vrepass="Passwords do not match";
valid=false;
}

if(!venderName.match(/^[A-Za-z]+$/)){
temp.venderName="Vender Name must contain only letters";
valid=false;
}

if (!vaddress){
temp.vaddress="Address is required";
valid=false;
}

if(!/^\d{10}$/.test(vcontact)){
temp.vcontact="Contact must be a 10-digit number";
valid=false;
}

if(!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(vemail)){
temp.vemail="Invalid email format";
valid=false;
}

if(!image || !image.data){
temp.vpicname="Profile picture is required";
valid=false;
}

setErrors(temp);
return valid;
};

const handleRegisterButton = async () => {

if(validateForm()){

try{

const formData = new FormData();

formData.append("VUserId", vuserid);
formData.append("VUserPass", vuserpass);
formData.append("VenderName", venderName);
formData.append("VAddress", vaddress);
formData.append("VContact", vcontact);
formData.append("VEmail", vemail);
formData.append("Vid", vid);
formData.append("Status", "inactive");

if(image){
formData.append("file", image.data);
}

await axios.post(
`${REACT_APP_BASE_API_URL}/vender/register`,
formData,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
);

setStatus("Registration successful");
alert("Registration successful");

setVUserId("");
setVUserPass("");
setVRePass("");
setVenderName("");
setVAddress("");
setVContact("");
setVEmail("");
setImage(null);

fetchVenderList();

}catch(err){

console.error(err);
alert("Registration failed");

}

}

};

const handleFileChange=(evt)=>{
const img={
preview:URL.createObjectURL(evt.target.files[0]),
data:evt.target.files[0],
};
setImage(img);
};

return(
<div className="venderreg-container">

<div className="venderreg-form">

<h2>Vender Registration</h2>

<p className="form-group">{status}</p>

<label>Vender Id</label>
<input
type="text"
value={vuserid}
onChange={(evt)=>setVUserId(evt.target.value)}
/>
<span className="error">{errors.vuserid}</span>


<div className="form-group password-field">

<label>Enter Password</label>

<div className="input-with-icon">

<input
type={showPass ? "text":"password"}
value={vuserpass}
onChange={(e)=>setVUserPass(e.target.value)}
/>

<span
className="eye-icon"
onClick={()=>setShowPass(!showPass)}
style={{cursor:"pointer"}}
>
{showPass?<FaEyeSlash/>:<FaEye/>}
</span>

</div>

<span className="error">{errors.vuserpass}</span>

</div>


<div className="form-group password-field">

<label>Re-Enter Password</label>

<div className="input-with-icon">

<input
type={showRePass ? "text":"password"}
value={vrepass}
onChange={(e)=>setVRePass(e.target.value)}
/>

<span
className="eye-icon"
onClick={()=>setShowRePass(!showRePass)}
style={{cursor:"pointer"}}
>
{showRePass?<FaEyeSlash/>:<FaEye/>}
</span>

</div>

<span className="error">{errors.vrepass}</span>

</div>


<div className="form-group">
<label>Vender Name</label>
<input
type="text"
value={venderName}
onChange={(evt)=>setVenderName(evt.target.value)}
/>
<span className="error">{errors.venderName}</span>
</div>


<div className="form-group">
<label>Address</label>
<input
type="text"
value={vaddress}
onChange={(evt)=>setVAddress(evt.target.value)}
/>
<span className="error">{errors.vaddress}</span>
</div>


<div className="form-group">
<label>Contact</label>
<input
type="text"
value={vcontact}
onChange={(evt)=>setVContact(evt.target.value)}
/>
<span className="error">{errors.vcontact}</span>
</div>


<div className="form-group">
<label>Email</label>
<input
type="email"
value={vemail}
onChange={(evt)=>setVEmail(evt.target.value)}
/>
<span className="error">{errors.vemail}</span>
</div>


<div className="form-group">

<label>Upload Photo</label>

<input type="file" onChange={handleFileChange}/>

{image && image.preview && (
<img src={image.preview} alt="Preview" className="image-preview"/>
)}

<span className="error">{errors.vpicname}</span>

</div>


<div className="form-group">
<button onClick={handleRegisterButton}>Register</button>
</div>

</div>

</div>
);

}

export default VenderReg;