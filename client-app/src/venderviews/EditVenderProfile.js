
    import React,{useState,useEffect} from "react";
    import axios from "axios";
    import "./EditVender.css";

    function EditVenderProfile({vender,onClose,onUpdate})
    {
         const [formData,setFormData]=useState(vender);
         const [newImage,setNewImage] = useState(null);
         const [previewImage,setPreviewImge]=useState(null);
         const [vendorList,setVendorList]=useState([]);

         useEffect(() =>{
            setFormData(vender);
            fetchVendorList();
         },[vender]);

         const fetchVendorList = async () =>{
            try{
                const res = await axios.get("https://project-backend-nka5.vercel.app/vender/getvendercount");
                setVendorList(res.data);
            } catch(err)
            {
                console.error("ERROR FETCHING VENDER LIST:",err);
            }
         };

           const handleChange = (e) => {
             setFormData({...formData,[e.target.name]: e.target.value});
           };

           const handleFileChange = (e) =>{
             const file = e.target.files[0];
             setNewImage(file);

             if(file)
             {
                setPreviewImge(URL.createObjectURL(file));
             }
           };

           const checkEmailDuplicate = () =>{
            return vendorList.some(
                (v)=> v.Email === formData.VEmail && v.VUserId !== formData.VUserId
            );
           };

             const handleSubmit = async()=>{
                 if(checkEmailDuplicate())
                 {
                    alert("THIS EMAIL IS ALREADY USED BY ANOTHER VENDOR!");
                    return;
                 }
                 try
                 {
                    const form = new FormData();
                form.append("VenderName",formData.VenderName);
                form.append("VAddress", formData.VAddress);
                form.append("VContact",formData.VContact);
                form.append("VEmail", formData.VEmail);


                if(newImage)
                {
                    form.append("file",newImage)
                }
                const res = await axios.put(`https://project-backend-nka5.vercel.app/vender/update/${formData.VUserId}`,form,
                    // {
                    //     headers:{"Content-Type": "multipart/form-data"}
                    // }
                );

                    alert(res.data.message);

                    onUpdate({... formData,...res.data.updateData});
                    onClose();
                 }
                   catch(err)
                   {
                    console.log(err);
                    alert("ERROR UPDATING PROFILE");
                   }
             };

             return (
  <div className="evp-container">
    <h3 className="evp-heading">Edit Vender Profile</h3>

    <input 
      type="text"
      name="VenderName"
      value={formData.VenderName || ""}
      onChange={handleChange}
      placeholder="Vender Name"
      className="evp-input"
    />

    <input 
      type="text"
      name="VAddress"
      value={formData.VAddress || ""}
      onChange={handleChange}
      placeholder="Address"
      className="evp-input"
    />

    <input 
      type="text"
      name="VContact"
      value={formData.VContact || ""}
      onChange={handleChange}
      placeholder="Contact"
      className="evp-input"
    />

    <input 
      type="email"
      name="VEmail"
      value={formData.VEmail || ""}   
      onChange={handleChange}
      placeholder="Email"
      className="evp-input"
    />

    <div className="evp-image-section">
      <p className="evp-label">Current Image : {formData.VPicName}</p>
      {formData.VPicName && (
        <img 
          src={formData.VPicName} 
          alt="Vender" 
          className="evp-current-image" 
        />
      )}

      {previewImage && (
        <div className="evp-preview-section">
          <p className="evp-label">New Image Preview:</p>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="evp-preview-image"
          />
        </div>
      )}

      <input type="file" onChange={handleFileChange} className="evp-file-input" />
    </div>

    <div className="evp-btn-group">
      <button onClick={handleSubmit} className="evp-btn evp-btn-save">Save</button>
      <button onClick={onClose} className="evp-btn evp-btn-cancel">Cancel</button>
    </div>
  </div>
);
    }
    export default EditVenderProfile;



          //    return(

          //       <div style={{margin:20}}>
          //           <h3>Edit Vender Profile</h3>
          //           <input 
          //            type="text"
          //            name="VenderName"
          //            value={formData.VenderName || ""}
          //            onChange={handleChange}
          //            placeholder="Vender Name"
          //           ></input>
          //           <br/>

          //           <input 
          //            type="text"
          //            name="VAddress"
          //            value={formData.VAddress || ""}
          //            onChange={handleChange}
          //            placeholder="Address"
          //           ></input>
          //           <br/>


          //           <input 
          //            type="text"
          //            name="VContact"
          //            value={formData.VContact || ""}
          //            onChange={handleChange}
          //            placeholder="Contact"
          //           ></input>
          //           <br/>


          //           <input 
          //            type="email"
          //            name="VEmail"
          //            value={formData.VEmail || ""}   
          //            onChange={handleChange}
          //            placeholder="Email"
          //           ></input>
          //           <br/>

          //             <p>Current Image : {formData.VPicName}</p>
          //             {formData.VPicName  && (
          //               <img src={`http://localhost:9876/vender/getimage/${formData.VPicName}`} alt="Vender" width={100} height={100} style={{borderRadius: "50%"}}></img>
          //              )}
          //              <br/>

          //              {previewImage && (
          //                 <>
          //                 <p>New Image preview:</p>
          //                 <img src={previewImage} alt="Preview" width={80} height={80} style={{borderRadius:"50%"}}></img>
          //               </>
          //              )}

          //              <br/>

          //              <input type="file" onChange={handleFileChange}></input>
          //                <br/>

          //                <button onClick={handleSubmit}>Save</button>
          //                <button onClick={onClose}>Cancel</button>
          //              </div>
          //    )
          // } export default EditVenderProfile;