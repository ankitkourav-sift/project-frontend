import React, { useEffect, useState } from "react";
import axios from "axios";
//import "./ProductCatgMgt.css";

function ProductCatgMgt() {

    const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

    const [pcatgid, setPCatgId] = useState("");
    const [pcatgname, setPCatgName] = useState("");
    const [pcatgList, setPCatgtList] = useState([]);
    const [isEditmode, setIsEditMode] = useState(false);

    useEffect(() => {
        fetchCategoryList();
    }, []);

    const fetchCategoryList = () => {
        axios.get(`${REACT_APP_BASE_API_URL}/productcatg/showproductcatg`)
            .then((res) => {
                setPCatgtList(res.data);

                if (!isEditmode) {
                    setPCatgId(res.data.length + 1);
                }
            })
            .catch((err) => alert(err));
    };

    const handleSaveButton = () => {

        if (!pcatgname.trim()) {
            alert("Category name cannot be empty");
            return;
        }

        axios.post(`${REACT_APP_BASE_API_URL}/productcatg/addproductcatg/${pcatgid}/${pcatgname}`)
            .then((res) => {
                alert(res.data);
                setPCatgName("");
                setIsEditMode(false);
                fetchCategoryList();
            })
            .catch((err) => alert(err));
    };

    const handleUpdateButton = () => {

        if (!pcatgname.trim()) {
            alert("Category name cannot be empty");
            return;
        }

        axios.put(`${REACT_APP_BASE_API_URL}/productcatg/updateproductcatg/${pcatgid}/${pcatgname}`)
            .then((res) => {
                alert(res.data);
                setPCatgName("");
                setIsEditMode(false);
                fetchCategoryList();
            })
            .catch((err) => alert(err));
    };
    const handleNew = () => {
  setPCatgName("");
  setIsEditMode(false);
  setPCatgId(pcatgList.length + 1);
};

    const handleEdit = (item) => {
        setPCatgId(item.pcatgid);
        setPCatgName(item.pcatgname);
        setIsEditMode(true);
    };

    const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
        return;
    }

    axios.delete(
        `${REACT_APP_BASE_API_URL}/productcatg/deleteproductcatg/${id}`
    )
    .then((res) => {
        alert(res.data);
        fetchCategoryList();
    })
    .catch((err) => alert(err));
};

   return (
  <div style={{ textAlign: "center", padding: "20px" }}>
    <h2 style={{ color: "#0d6efd", marginBottom: "20px" }}>
      Product Category Form
    </h2>

    <table
      style={{
        margin: "0 auto",
        borderCollapse: "collapse",
        minWidth: "400px",
      }}
    >
      <tbody>
        <tr>
          <td
            style={{
              padding: "10px",
              fontWeight: "bold",
            }}
          >
            Product Id :
          </td>

          <td style={{ padding: "10px" }}>{pcatgid}</td>
        </tr>

        <tr>
          <td
            style={{
              padding: "10px",
              fontWeight: "bold",
            }}
          >
            Category Name :
          </td>

          <td style={{ padding: "10px" }}>
            <input
              type="text"
              value={pcatgname}
              className="form-control"
              placeholder="Enter Category Name"
              onChange={(e) => setPCatgName(e.target.value)}
            />
          </td>
        </tr>

        <tr>
          <td style={{ padding: "10px" }}>
            {isEditmode ? (
              <button
                className="btn btn-warning"
                style={{ width: "100px" }}
                onClick={handleUpdateButton}
              >
                Update
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: "100px" }}
                onClick={handleSaveButton}
              >
                Save
              </button>
            )}
          </td>

          <td style={{ padding: "10px" }}>
            <button
              className="btn btn-success me-2"
              style={{ width: "100px", marginRight: "10px" }}
              onClick={handleNew}
            >
              New
            </button>

            
          </td>
        </tr>
      </tbody>
    </table>

    <h3
      style={{
        color: "#0d6efd",
        background: "#f1f3f5",
        padding: "10px",
        marginTop: "40px",
        borderRadius: "10px",
      }}
    >
      Product Category List
    </h3>

    <table
      border="1"
      style={{
        margin: "20px auto",
        width: "70%",
        textAlign: "center",
        borderCollapse: "collapse",
      }}
    >
      <thead style={{ background: "#0d6efd", color: "white" }}>
        <tr>
          <th style={{ padding: "10px" }}>Id</th>
          <th style={{ padding: "10px" }}>Category Name</th>
          <th style={{ padding: "10px" }}>Action</th>
        </tr>
      </thead>

      <tbody>
        {pcatgList.length > 0 ? (
          pcatgList.map((item) => (
            <tr key={item.pcatgid}>
              <td style={{ padding: "10px" }}>
                {item.pcatgid}
              </td>

              <td style={{ padding: "10px" }}>
                {item.pcatgname}
              </td>

              <td style={{ padding: "10px" }}>
                <button
                  className="btn btn-warning"
                  style={{ marginRight: "10px" }}
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleDelete(item.pcatgid)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" style={{ padding: "20px" }}>
              No Categories Found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
); }
export default ProductCatgMgt;