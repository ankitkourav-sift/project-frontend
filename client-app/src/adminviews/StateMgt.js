import React, { useEffect, useState } from "react";
import axios from "axios";
import "../index.css";

function StateMgt() {

    const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

    const [stid, setStId] = useState("");
    const [stname, setStName] = useState("");
    const [status, setStatus] = useState("");
    const [stlist, setStList] = useState([]);

    const loadStates = () => {
    axios
        .get(`${REACT_APP_BASE_API_URL}/state/getall`)
        .then((res) => {
            setStList(res.data);
        })
        .catch((err) => {
            alert(err);
        });
};

    const handleStIdText = (evt) => {
        setStId(evt.target.value);
    };

    const handleStNameText = (evt) => {
        setStName(evt.target.value);
    };

    const handleStatusText = (evt) => {
        setStatus(evt.target.value);
    };

    // load states at startup
   useEffect(() => {
    loadStates();
}, []);

    // New button
    const handleAddNewButton = () => {

        axios.get(`${REACT_APP_BASE_API_URL}/state/getall`)
            .then((res) => {
                setStId(res.data.length + 1);
                setStatus(1);
            })
            .catch((err) => {
                alert(err);
            });

    };

    // Save
    const handleSaveButton = () => {

        if (!stid || !stname || !status) {
            alert("Please fill all fields");
            return;
        }

        axios.get(`${REACT_APP_BASE_API_URL}/state/searchbyname/${stname}`)
            .then((res) => {

                if (res.data && res.data.stname !== undefined) {
                    alert("State name already exists");
                }
                else {

                    const obj = {
                        stid: stid,
                        stname: stname,
                        status: status
                    };

                    axios.post(`${REACT_APP_BASE_API_URL}/state/save`, obj)
                        .then((res) => {
                            alert(res.data);
                           alert(res.data);

                        alert(res.data);

setStId("");
setStName("");
setStatus("");

loadStates();
                        })
                        .catch((err) => {
                            alert(err);
                        });

                }

            })
            .catch((err) => {
                alert(err);
            });

    };

    // Show
    // const handleShowButton = () => {

    //     axios.get(`${REACT_APP_BASE_API_URL}/state/getall`)
    //         .then((res) => {
    //             setStList(res.data);
    //             loadStates();
    //         })
    //         .catch((err) => {
    //             alert(err);
    //         });

    // };

    // Search
    const handleSearchButton = () => {

        if (stid) {

            axios.get(`${REACT_APP_BASE_API_URL}/state/search/${stid}`)
                .then((res) => {

                    if (res.data) {
                        setStId(res.data.stid);
                        setStName(res.data.stname);
                        setStatus(res.data.status);
                    }
                    else {
                        alert("Data not found");
                    }

                })
                .catch((err) => {
                    alert(err);
                });

        }

        else if (stname) {

            axios.get(`${REACT_APP_BASE_API_URL}/state/searchbyname/${stname}`)
                .then((res) => {

                    if (res.data) {
                        setStId(res.data.stid);
                        setStName(res.data.stname);
                        setStatus(res.data.status);
                    }
                    else {
                        alert("Data not found");
                    }

                })
                .catch((err) => {
                    alert(err);
                });

        }

    };

    // Update
    const handleUpdateButton = () => {

        if (!stid || !stname || !status) {
            alert("Please fill all fields");
            return;
        }

        const obj = {
            stid: stid,
            stname: stname,
            status: status
        };

        axios.put(`${REACT_APP_BASE_API_URL}/state/update`, obj)
            .then((res) => {
                alert(res.data);
                setStId("");
                setStName("");
                setStatus("");
                loadStates();
            })
            .catch((err) => {
                alert(err);
            });

    };

    // Delete
    const handleDeleteButton = () => {

        if (stid) {

            axios.delete(`${REACT_APP_BASE_API_URL}/state/delete/${stid}`)
                .then((res) => {
                    alert(res.data);
                    loadStates();
                })
                .catch((err) => {
                    alert(err);
                });

        }
        else {
            alert("Fill state id to delete");
        }

    };

    return (

        <div>
            <center>

                <h3>State Management</h3>

                <div className="myDiv">

                    <table>
                        <tbody>

                            <tr>
                                <td>State Id</td>
                                <td>
                                    <input
                                        type="number"
                                        value={stid}
                                        onChange={handleStIdText}
                                        className="form-control"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td>State Name</td>
                                <td>
                                    <input
                                        type="text"
                                        value={stname}
                                        onChange={handleStNameText}
                                        className="form-control"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td>Status</td>
                                <td>
                                    <input
                                        type="number"
                                        value={status}
                                        onChange={handleStatusText}
                                        className="form-control"
                                    />
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <br />

                    <table>
                        <tbody>

                            <tr>

                                <td>
                                    <button onClick={handleAddNewButton} className="btn btn-primary">New</button>
                                </td>

                                <td>
                                    <button onClick={handleSaveButton} className="btn btn-primary">Save</button>
                                </td>

                                {/* <td>
                                    <button onClick={handleShowButton} className="btn btn-primary">Show</button>
                                </td> */}

                                <td>
                                    <button onClick={handleSearchButton} className="btn btn-primary">Search</button>
                                </td>

                                <td>
                                    <button onClick={handleUpdateButton} className="btn btn-primary">Update</button>
                                </td>

                                <td>
                                    <button onClick={handleDeleteButton} className="btn btn-primary">Delete</button>
                                </td>

                            </tr>

                        </tbody>
                    </table>

                </div>

                <br />

                <div className="myDiv2">

                    <table border="1">

                        <thead>

                            <tr style={{ backgroundColor: "Highlight", color: "white" }}>
                                <th>State Id</th>
                                <th>State Name</th>
                                <th>Status</th>
                            </tr>

                        </thead>

                        <tbody>

                            {
                                stlist.map((item) => (

                                    <tr key={item.stid} style={{ backgroundColor: "white", color: "black" }}>

                                        <td>{item.stid}</td>
                                        <td>{item.stname}</td>
                                        <td>{item.status === 1 ? "Enabled" : "Disabled"}</td>

                                    </tr>

                                ))
                            }

                        </tbody>

                    </table>

                </div>

            </center>
        </div>

    );

}

export default StateMgt;