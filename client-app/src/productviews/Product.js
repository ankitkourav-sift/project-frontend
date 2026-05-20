import React, { useEffect, useState } from "react";
import axios from "axios";
import "./product.css";

function Product({ data }) {
  const venderid = data;

  const [pid, setPId] = useState("");
  const [pname, setPName] = useState("");
  const [pprice, setPPrice] = useState("");
  const [oprice, setOPrice] = useState("");
  const [ppicname, setPPicName] = useState("");
  const [pcatgid, setPCatgId] = useState("");
  const [image, setImage] = useState({ preview: "", data: null });

  const [plist, setPList] = useState([]);
  const [pcatglist, setPCatgList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const API = "http://localhost:9292";

  // ================= FETCH CATEGORY =================
  useEffect(() => {
    getNewPid();
    axios
      .get(`${API}/productcatg/showproductcatg`)
      .then(res => setPCatgList(res.data))
      .catch(err => console.log(err));
  }, []);

  // ================= FETCH PRODUCTS =================
  const fetchProducts = () => {
    if (!venderid) return;

    axios
      .get(`${API}/product/showproductbyvender/${venderid}`)
      .then(res => {
        const activeProducts = res.data.filter(p => p.status === "Active");
        setPList(activeProducts);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchProducts();
  }, [venderid]);

  // ================= GET NEW PID =================
  const getNewPid = () => {
    axios
      .get(`${API}/product/getmaxpid`)
      .then(res => setPId(res.data.length + 1))
      .catch(err => console.log(err));
  };

  // ================= HANDLE FILE CHANGE =================
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImage({
        preview: URL.createObjectURL(file),
        data: file
      });
      setPPicName(file.name);
    }
  };

  // ================= SAVE / UPDATE PRODUCT =================
// ================= SAVE / UPDATE PRODUCT =================
const handleSaveButton = async () => {

  if (!pname || !pprice || !oprice || !pcatgid) {
    alert("Fill all fields!");
    return;
  }

  try {

    const formData = new FormData();

    formData.append("pname", pname);
    formData.append("pprice", pprice);
    formData.append("oprice", oprice);
    formData.append("pcatgid", pcatgid);
    formData.append("vid", venderid);
    formData.append("status", "Active");

    // image
    if (image.data) {
      formData.append("file", image.data);
    }

    // ================= UPDATE =================
    if (isEditing) {

      await axios.put(
        `${API}/product/updateproduct/${pid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Product updated!");

    } else {

      // ================= SAVE =================
      await axios.post(
        `${API}/product/saveproductimage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Product added!");
    }

    fetchProducts();
    handleNewButton();

  } catch (err) {

    console.log("FULL ERROR:", err);

    if (err.response) {
      console.log("BACKEND ERROR:", err.response.data);
      alert(err.response.data.error || "Server Error");
    } else {
      alert("Network Error");
    }
  }
};
  // ================= RESET FORM =================
  const handleNewButton = () => {
    getNewPid();
    setPName("");
    setPPrice("");
    setOPrice("");
    setPPicName("");
    setPCatgId("");
    setImage({ preview: "", data: null });
    setIsEditing(false);
  };

  // ================= EDIT PRODUCT =================
  const handleEdit = item => {
    setPId(item.pid);
    setPName(item.pname);
    setPPrice(item.pprice);
    setOPrice(item.oprice);
    setPPicName(item.ppicname);
    setPCatgId(item.pcatgid);

    setImage({
      preview: item.ppicname, // full URL from MongoDB / Cloudinary
      data: null,
    });

    setIsEditing(true);
  };

  // ================= DELETE PRODUCT =================
  const handleDelete = pid => {

  if (!window.confirm("Delete product?")) return;

  axios
    .put(`${API}/product/updateproductstatus/${pid}/Inactive`)
    .then(() => {

      alert("Product deleted!");
      fetchProducts();

    })
    .catch(error => {

      console.log("FULL ERROR:", error);

      console.log("STATUS:", error.response?.status);

      console.log("DATA:", error.response?.data);

      console.log("MESSAGE:", error.response?.data?.error);

    });
};

  return (
    <div className="product-page">
      <h2 className="product-title">Manage Products</h2>

      {/* FORM */}
      <div className="product-form">
        <input
          className="product-input"
          placeholder="Name"
          value={pname}
          onChange={e => setPName(e.target.value)}
        />
        <input
          className="product-input"
          type="number"
          placeholder="Price"
          value={pprice}
          onChange={e => setPPrice(e.target.value)}
        />
        <input
          className="product-input"
          type="number"
          placeholder="Offer Price"
          value={oprice}
          onChange={e => setOPrice(e.target.value)}
        />
        <select
          className="product-select"
          value={pcatgid}
          onChange={e => setPCatgId(e.target.value)}
        >
          <option value="">Select Category</option>
          {pcatglist.map(c => (
            <option key={c._id} value={c.pcatgid}>
              {c.pcatgname}
            </option>
          ))}
        </select>

        <input className="product-file" type="file" onChange={handleFileChange} />

        {image.preview && (
          <img
            className="product-img-preview"
            src={image.preview}
            width="100"
            alt={pname}
          />
        )}

        <br />

        <div className="product-buttons">
          <button onClick={handleNewButton}>New</button>
          <button onClick={handleSaveButton}>{isEditing ? "Update" : "Save"}</button>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <h3 className="product-subtitle">Product List</h3>
      <table className="product-table">
        <thead>
          <tr>
            <th>PID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Offer</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {plist.map(item => (
            <tr key={item._id}>
              <td>{item.pid}</td>
              <td>{item.pname}</td>
              <td>{item.pprice}</td>
              <td>{item.oprice}</td>
              <td>
                {item.ppicname && (
                  <img src={item.ppicname} width="50" alt={item.pname} />
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.pid)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Product;