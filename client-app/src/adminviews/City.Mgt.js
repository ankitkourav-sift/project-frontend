import React, { useEffect, useState } from "react";
import axios from "axios";
import "./City.Mgt.css";

function CityMgt() {

    const REACT_APP_BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

    const [ctid, setCtId] = useState("");
    const [ctname, setCtName] = useState("");
    const [stid, setStId] = useState("");
    const [status, setStatus] = useState("");
    const [ctlist, setCtList] = useState([]);
    const [stlist, setStList] = useState([]);

    // input handlers
    const handleCtIdText = (evt) => {
        setCtId(evt.target.value);
    };

    const handleCtNameText = (evt) => {
        setCtName(evt.target.value);
    };

    const handleStIdSelect = (evt) => {
        setStId(parseInt(evt.target.value));
    };

    const handleStatusText = (evt) => {
        setStatus(evt.target.value);
    };

    // load states
    useEffect(() => {

        axios.get(`${REACT_APP_BASE_API_URL}/state/show`)
            .then((res) => {
                setStList(res.data);
            })
            .catch((err) => {
                alert(err);
            });

    }, []);

    // load cities
    useEffect(() => {

        axios.get(`${REACT_APP_BASE_API_URL}/city/getall`)
            .then((res) => {
                setCtList(res.data);
            })
            .catch((err) => {
                alert(err);
            });

    }, []);

    // new button
    const handleAddNewButton = () => {

        axios.get(`${REACT_APP_BASE_API_URL}/city/getall`)
            .then((res) => {
                setCtId(res.data.length + 1);
                setStatus(1);
            })
            .catch((err) => {
                alert(err);
            });

    };

    // save
    const handleSaveButton = () => {

        if (!ctid || !ctname || !stid || !status || stid === "0") {
            alert("Please fill all fields");
            return;
        }

        axios.get(`${REACT_APP_BASE_API_URL}/city/searchbyname/${ctname}`)
            .then((res) => {

                if (res.data && res.data.ctname !== undefined) {
                    alert("City name already exists");
                }
                else {

                    const obj = {
                        ctid: ctid,
                        ctname: ctname,
                        stid: stid,
                        status: status
                    };

                    axios.post(`${REACT_APP_BASE_API_URL}/city/save`, obj)
                        .then((res) => {
                            alert(res.data);
                            setCtId("");
                            setCtName("");
                            setStId("");
                            setStatus("");
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

    // show cities
    const handleShowButton = () => {

        axios.get(`${REACT_APP_BASE_API_URL}/city/getall`)
            .then((res) => {
                setCtList(res.data);
            })
            .catch((err) => {
                alert(err);
            });

    };

    // search
    const handleSearchButton = () => {

        if (ctid) {

            axios.get(`${REACT_APP_BASE_API_URL}/city/search/${ctid}`)
                .then((res) => {

                    if (res.data) {
                        setCtId(res.data.ctid);
                        setCtName(res.data.ctname);
                        setStId(res.data.stid);
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

        else if (ctname) {

            axios.get(`${REACT_APP_BASE_API_URL}/city/searchbyname/${ctname}`)
                .then((res) => {

                    if (res.data) {
                        setCtId(res.data.ctid);
                        setCtName(res.data.ctname);
                        setStId(res.data.stid);
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

    // update
    const handleUpdateButton = () => {

        if (!ctid || !ctname || !stid || !status) {
            alert("Please fill all fields");
            return;
        }

        const obj = {
            ctid: ctid,
            ctname: ctname,
            stid: stid,
            status: status
        };

        axios.put(`${REACT_APP_BASE_API_URL}/city/update`, obj)
            .then((res) => {
                alert(res.data);
                setCtId("");
                setCtName("");
                setStId("");
                setStatus("");
            })
            .catch((err) => {
                alert(err);
            });

    };

    // delete
    const handleDeleteButton = () => {

        if (ctid) {

            axios.delete(`${REACT_APP_BASE_API_URL}/city/delete/${ctid}`)
                .then((res) => {
                    alert(res.data);
                })
                .catch((err) => {
                    alert(err);
                });

        }
        else {
            alert("Fill city id to delete");
        }

    };

    return (

        <div>
            <center>

                <h3>City Management</h3>

                <div className="myDiv">

                    <table>
                        <tbody>

                            <tr>
                                <td>City Id</td>
                                <td>
                                    <input
                                        type="number"
                                        onChange={handleCtIdText}
                                        value={ctid}
                                        className="form-control"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td>City Name</td>
                                <td>
                                    <input
                                        type="text"
                                        onChange={handleCtNameText}
                                        value={ctname}
                                        className="form-control"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td>State Name</td>
                                <td>

                                    <select
                                        onChange={handleStIdSelect}
                                        value={stid}
                                        className="form-control"
                                    >

                                        <option value="">Select State</option>

                                        {
                                            stlist.map((item, index) => (
                                                <option key={`${item.stid}-${index}`} value={item.stid}>
                                                    {item.stname}
                                                </option>
                                            ))
                                        }

                                    </select>

                                </td>
                            </tr>

                            <tr>
                                <td>Status</td>
                                <td>
                                    <input
                                        type="number"
                                        onChange={handleStatusText}
                                        value={status}
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

                                <td>
                                    <button onClick={handleShowButton} className="btn btn-primary">Show</button>
                                </td>

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

                            <tr>
                                <th>City Id</th>
                                <th>City Name</th>
                                <th>State Name</th>
                                <th>Status</th>
                            </tr>

                        </thead>

                        <tbody>

                            {
                                ctlist.map((item, index) => {

                                    const state = stlist.find(st => st.stid === item.stid);

                                    return (

                                        <tr
                                            key={`${item.ctid}-${index}`}
                                            style={{ backgroundColor: "white", color: "black" }}
                                        >

                                            <td>{item.ctid}</td>

                                            <td>{item.ctname}</td>

                                            <td>{state ? state.stname : ""}</td>

                                            <td>
                                                {item.status === 1 ? "Enabled" : "Disabled"}
                                            </td>

                                        </tr>

                                    );

                                })
                            }

                        </tbody>

                    </table>

                </div>

            </center>
        </div>

    );

}

export default CityMgt;