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

    const handleEdit = (item) => {
        setPCatgId(item.pcatgid);
        setPCatgName(item.pcatgname);
        setIsEditMode(true);
    };

    return (

        <div style={{ textAlign: "center", padding: "20px" }}>

            <h2 style={{ color: "blue" }}>Product Category Form</h2>

            <table style={{ margin: "0 auto" }}>
                <tbody>

                    <tr>
                        <td>Product Id:</td>
                        <td>{pcatgid}</td>
                    </tr>

                    <tr>
                        <td>Category Name:</td>
                        <td>
                            <input
                                type="text"
                                value={pcatgname}
                                className="form-control"
                                onChange={(e) => setPCatgName(e.target.value)}
                            />
                        </td>
                    </tr>

                    <tr>

                        <td>
                            {isEditmode ? (
                                <button
                                    style={{ width: "100px" }}
                                    className="btn btn-primary"
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

                        <td>
                            <button
                                className="btn btn-primary"
                                style={{ width: "100px" }}
                                onClick={fetchCategoryList}
                            >
                                Show
                            </button>
                        </td>

                    </tr>

                </tbody>
            </table>

            <h3 style={{ color: "blue", backgroundColor: "lightgray", marginTop: "30px" }}>
                Product Category List
            </h3>

            <table border="1" style={{ margin: "0 auto", width: "70%", textAlign: "left" }}>

                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Category Name</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {pcatgList.map((item) => (
                        <tr key={item.pcatgid}>
                            <td>{item.pcatgid}</td>
                            <td>{item.pcatgname}</td>
                            <td>
                                <button onClick={() => handleEdit(item)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>

        </div>
    );
}

export default ProductCatgMgt;