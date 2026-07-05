import React, { useState, useEffect } from "react";
import axios from "axios";

function VenderMgt(){
    const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;
    
    const[venderlist,setVenderList]=useState([]);
    const[selectedVender,setSelectedVender]=useState(null);
    const[showModal,setShowModal]=useState(false);
    const[editForm,setEditForm]=useState({
        VenderName:"",
        VAddress:"",
        VContact:"",
        VEmail:"",
        VPicName:null,
        previewImage:""
    });

    useEffect(()=>{
        fetchVenders();
    },[]);

  const fetchVenders = async () => {
    try {
        const res = await axios.get(
            `${REACT_APP_BASE_API_URL}/vender/getvendercount`
        );

        setVenderList(res.data);

    } catch (err) {
        console.log(err);
        alert("Unable to load vendors");
    }
};

    // ✅ FIX: previewImage direct Cloudinary URL use karega
    const openEditModal=(vender)=>{
        setSelectedVender(vender);
        setEditForm({
            VenderName:vender.VenderName,
            VAddress:vender.VAddress,
            VContact:vender.VContact,
            VEmail:vender.VEmail,
            VPicName:null,
            previewImage: vender.VPicName || ""   // ✅ FIX
        });
        setShowModal(true);
    };

    const handleEditChange=(e)=>{
        const{name,value,files}=e.target;

        if(files){
            setEditForm({
                ...editForm,
                VPicName: files[0],
                previewImage:URL.createObjectURL(files[0])
            });
        }else{
            setEditForm({...editForm,[name]:value});
        }
    };

    const checkEmailDuplicate=async()=>{
        const existing=venderlist.find(
            v=>v.VEmail===editForm.VEmail && v.VUserId !== selectedVender.VUserId
        );
        return !!existing;
    };

    const handleEditSave = async () => {

    if (await checkEmailDuplicate()) {
        alert("This email is already used by another vendor");
        return;
    }

    const formData = new FormData();

    formData.append("VenderName", editForm.VenderName);
    formData.append("VAddress", editForm.VAddress);
    formData.append("VContact", editForm.VContact);
    formData.append("VEmail", editForm.VEmail);

    if (editForm.VPicName) {
        formData.append("file", editForm.VPicName);
    }

    try {

        const res = await axios.put(
            `${REACT_APP_BASE_API_URL}/vender/update/${selectedVender.VUserId}`,
            formData
        );

        alert(res.data.message);

        setShowModal(false);

        fetchVenders();

    } catch (err) {

        console.log(err);

        if (err.response) {
            alert(err.response.data);
        } else {
            alert("Server Error");
        }

    }

};

  const toggleStatus = async (vid, status) => {

    try {

        const newStatus =
            status.toLowerCase() === "active"
                ? "Inactive"
                : "Active";

        console.log("Vid =", vid);
        console.log("Old Status =", status);
        console.log("New Status =", newStatus);

        const res = await axios.put(
            `${REACT_APP_BASE_API_URL}/vender/vendermanage/${vid}/${newStatus}`
        );

        alert(res.data);

        fetchVenders();

    } catch (err) {

        console.log(err);

        if (err.response) {
            alert(err.response.data);
        } else {
            alert("Server Error");
        }

    }

};

   return(
    <div>
        <center>
            <h4>Vendor List</h4>
            <table border={1}>
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>VId</th>
                        <th>Vendor Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Action</th>
                        <th>Edit</th>
                    </tr>
                </thead>

                <tbody>
                    {venderlist.map(item=>(
                        <tr key={item.Vid}>
                            <td>
                                {/* ✅ FIX: direct Cloudinary URL */}
                                {item.VPicName && (
                                <img 
                                  src={item.VPicName}
                                  alt="vendor" 
                                  width="50"
                                />
                                )}
                            </td>

                            <td>{item.Vid}</td>
                            <td>{item.VenderName}</td>
                            <td>{item.VEmail}</td>
                            <td>{item.Status}</td>

                            <td>
                               <button
    onClick={() => toggleStatus(item.Vid, item.Status)}
>
    {item.Status === "Active" ? "Inactive" : "Active"}
</button>
                            </td>

                            <td>
                               <button onClick={()=>openEditModal(item)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </center>

        {showModal && (
            <div style={{
                position:"fixed", top:0, left:0, width:"100%", height:"100%",
                backgroundColor:"rgba(0,0,0,0.5)", display:"flex",
                justifyContent:"center", alignItems:"center"
            }}>
                <div style={{
                    backgroundColor:"#fff", padding:"20px", borderRadius:"8px",
                    minWidth:"300px"
                }}>

                  <h3>Edit Vendor</h3>

                  <input type="text" name="VenderName"
                  value={editForm.VenderName}
                  onChange={handleEditChange} placeholder="Vendor Name"/><br/>

                  <input type="text" name="VAddress"
                  value={editForm.VAddress}
                  onChange={handleEditChange} placeholder="Address"/><br/>

                  <input type="text" name="VContact"
                  value={editForm.VContact}
                  onChange={handleEditChange} placeholder="Contact"/><br/>

                  <input type="email" name="VEmail"
                  value={editForm.VEmail}
                  onChange={handleEditChange} placeholder="Email"/><br/>

                  {/* ✅ FIX: preview direct */}
                  {editForm.previewImage && (
                    <div style={{margin:"10px 0"}}>
                        <img src={editForm.previewImage} alt="Preview" width="100"/>
                    </div>
                  )}

                  <input type="file" name="VPicName" onChange={handleEditChange}/><br/>
                  <br/>

                  <button onClick={handleEditSave}>Save</button>
                  <button onClick={()=> setShowModal(false)}>Cancel</button>

                </div>
            </div>
        )}

    </div>
   );
}

export default VenderMgt;