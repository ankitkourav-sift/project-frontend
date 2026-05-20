import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";

import "./CustomerMgt.css";

function CustomerMgt() {
  const REACT_APP_BASE_API_URL =
    process.env.REACT_APP_BASE_API_URL;

  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [openProfile, setOpenProfile] = useState(false);

  const [formData, setFormData] = useState({});

  const [previewImage, setPreviewImage] = useState(null);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    cid: null,
    currentStatus: "",
  });

  const [loading, setLoading] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchCustomers();
    fetchStates();
  }, []);

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${REACT_APP_BASE_API_URL}/customer/getcustomerlist`
      );

      setCustomerList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH STATES =================
  const fetchStates = async () => {
    try {
      const res = await axios.get(
        `${REACT_APP_BASE_API_URL}/state/show`
      );

      setStates(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH CITY =================
  const fetchCitiesByState = async (stid) => {
    try {
      const res = await axios.get(
        `${REACT_APP_BASE_API_URL}/city/showcitybystate/${stid}`
      );

      setCities(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= VIEW PROFILE =================
  const handleViewProfile = async (cid) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${REACT_APP_BASE_API_URL}/customer/getcustomerdetails/${cid}`
      );

      setSelectedCustomer(res.data);

      setFormData(res.data);

      // IMAGE URL
      setPreviewImage(
        res.data.CPicName
          ? `${REACT_APP_BASE_API_URL}/customer/getimage/${res.data.CPicName}`
          : null
      );

      // FETCH CITY
      if (res.data.StId) {
        fetchCitiesByState(res.data.StId);
      }

      setOpenProfile(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // STATE CHANGE
    if (name === "StId") {
      setFormData((prev) => ({
        ...prev,
        CtId: "",
      }));

      fetchCitiesByState(value);
    }
  };

  // ================= HANDLE FILE =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      CPicFile: file,
    }));

    // PREVIEW
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // ================= SAVE PROFILE =================
  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const data = new FormData();

      data.append(
        "CustomerName",
        formData.CustomerName || ""
      );

      data.append(
        "CAddress",
        formData.CAddress || ""
      );

      data.append(
        "CContact",
        formData.CContact || ""
      );

      data.append(
        "CEmail",
        formData.CEmail || ""
      );

      data.append(
        "CUserId",
        formData.CUserId || ""
      );

      data.append(
        "StId",
        formData.StId || ""
      );

      data.append(
        "CtId",
        formData.CtId || ""
      );

      // IMAGE
      if (formData.CPicFile) {
        data.append("file", formData.CPicFile);
      }

      // UPDATE API
      await axios.put(
        `${REACT_APP_BASE_API_URL}/customer/update/${selectedCustomer.Cid}`,
        data
      );

      alert("Profile updated successfully");

      setOpenProfile(false);

      fetchCustomers();
    } catch (error) {
      console.log(error);

      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS CLICK =================
  const handleToggleStatusClick = (
    cid,
    currentStatus
  ) => {
    setConfirmDialog({
      open: true,
      cid,
      currentStatus,
    });
  };

  // ================= CONFIRM STATUS =================
  const handleConfirmToggle = async () => {
    try {
      const { cid, currentStatus } =
        confirmDialog;

      const newStatus =
        currentStatus === "Active"
          ? "Inactive"
          : "Active";

      await axios.put(
        `${REACT_APP_BASE_API_URL}/customer/customermanage/${cid}/${newStatus}`
      );

      // UPDATE UI
      setCustomerList((prev) =>
        prev.map((c) =>
          c.Cid === cid
            ? { ...c, Status: newStatus }
            : c
        )
      );

      setConfirmDialog({
        open: false,
        cid: null,
        currentStatus: "",
      });
    } catch (err) {
      console.log(err);

      alert("Status update failed");
    }
  };

  return (
    <Box className="customer-page">
      <Typography
        variant="h4"
        gutterBottom
        className="customer-title"
      >
        Customer Management
      </Typography>

      {/* LOADING */}
      {loading && (
        <Box className="loading-overlay">
          <CircularProgress size={60} />
        </Box>
      )}

      {/* TABLE */}
      <TableContainer
        component={Paper}
        className="customer-table-container"
      >
        <Table>
          <TableHead className="customer-table-head">
            <TableRow>
              <TableCell className="table-head-text">
                Customer Id
              </TableCell>

              <TableCell className="table-head-text">
                Name
              </TableCell>

              <TableCell className="table-head-text">
                Email
              </TableCell>

              <TableCell className="table-head-text">
                Status
              </TableCell>

              <TableCell className="table-head-text">
                Profile
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {customerList.map((cust) => (
              <TableRow
                key={cust.Cid}
                className="customer-row"
              >
                <TableCell>{cust.Cid}</TableCell>

                <TableCell className="customer-name">
                  {cust.CustomerName}
                </TableCell>

                <TableCell>
                  {cust.CEmail}
                </TableCell>

                <TableCell>
                  <Button
                    variant={
                      cust.Status === "Active"
                        ? "contained"
                        : "outlined"
                    }
                    color={
                      cust.Status === "Active"
                        ? "success"
                        : "error"
                    }
                    onClick={() =>
                      handleToggleStatusClick(
                        cust.Cid,
                        cust.Status
                      )
                    }
                    className="status-btn"
                  >
                    {cust.Status}
                  </Button>
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    className="view-btn"
                    onClick={() =>
                      handleViewProfile(cust.Cid)
                    }
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PROFILE MODAL */}
      <Dialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="profile-title">
          Customer Profile
        </DialogTitle>

        <DialogContent className="profile-content">
          {/* NAME */}
          <TextField
            label="Customer Name"
            name="CustomerName"
            value={formData.CustomerName || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          {/* EMAIL */}
          <TextField
            label="Email"
            name="CEmail"
            value={formData.CEmail || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          {/* CONTACT */}
          <TextField
            label="Contact"
            name="CContact"
            value={formData.CContact || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          {/* ADDRESS */}
          <TextField
            label="Address"
            name="CAddress"
            value={formData.CAddress || ""}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />

          {/* USER ID */}
          <TextField
            label="User ID"
            name="CUserId"
            value={formData.CUserId || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          {/* STATE */}
          <FormControl fullWidth margin="normal">
            <InputLabel>State</InputLabel>

            <Select
              name="StId"
              value={formData.StId || ""}
              onChange={handleChange}
              label="State"
            >
              {states.map((st) => (
                <MenuItem
                  key={st.stid}
                  value={st.stid}
                >
                  {st.stname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* CITY */}
          <FormControl fullWidth margin="normal">
            <InputLabel>City</InputLabel>

            <Select
              name="CtId"
              value={formData.CtId || ""}
              onChange={handleChange}
              label="City"
            >
              {cities.map((ct) => (
                <MenuItem
                  key={ct.ctid}
                  value={ct.ctid}
                >
                  {ct.ctname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* IMAGE */}
          <Box className="profile-image-box">
            {previewImage && (
              <Avatar
                src={previewImage}
                className="profile-avatar"
              />
            )}

            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
            />
          </Box>
        </DialogContent>

        <DialogActions className="profile-actions">
          <Button
            onClick={() => setOpenProfile(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveProfile}
            variant="contained"
            className="save-btn"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* STATUS CONFIRM DIALOG */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            cid: null,
            currentStatus: "",
          })
        }
      >
        <DialogTitle>
          Confirm Status Change
        </DialogTitle>

        <DialogContent>
          Are you sure you want to change status?
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({
                open: false,
                cid: null,
                currentStatus: "",
              })
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmToggle}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomerMgt;