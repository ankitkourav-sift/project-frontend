import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ShowBills.css";

function ShowBills() {
  const [custlist, setCustList] = useState([]);
  const [billdetailslist, setBillDetailsList] = useState([]);
  const [plist, setPList] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loadingPDF, setLoadingPDF] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 3;

  useEffect(() => {
    axios.get("http://localhost:9292/customer/getcustomerlist")
      .then((res) => setCustList(res.data));

    axios.get("http://localhost:9292/product/showproduct")
      .then((res) => setPList(res.data))
      .catch((err) => alert(err));
  }, []);

  const handleCustomerSelect = (evt) => {
    const cid = evt.target.value;
    setSelectedCustomer(cid);

    axios.get(`http://localhost:9292/bill/billshowbillids/${cid}`)
      .then((res) => {
        const bills = res.data;
        const mergedBills = [];
        let totalSum = 0;

        bills.forEach((bitem) => {
          const productData = plist.find((p) => p.pid === bitem.pid);

          if (productData) {
            const product = {
              pname: productData.pname,
              price: parseFloat(productData.oprice),
              qty: bitem.Qty || bitem.qty || 1,
              subtotal: parseFloat(productData.oprice) * (bitem.Qty || bitem.qty || 1),

              // 🔥 FIX: Cloudinary image
              pic: productData.ppicname,
            };

            let existingBill = mergedBills.find(
              (bill) => bill.billid === bitem.billid
            );

            if (!existingBill) {
              existingBill = {
                billid: bitem.billid,
                cid: bitem.cid,
                billdate: bitem.billdate,
                products: [],
                total: 0,
              };
              mergedBills.push(existingBill);
            }

            existingBill.products.push(product);
            existingBill.total += product.subtotal;
            totalSum += product.subtotal;
          }
        });

        setBillDetailsList(mergedBills);
        setGrandTotal(totalSum);
        setCurrentPage(1);
      })
      .catch((err) => alert(err));
  };

  // Pagination
  const indexofLast = currentPage * billsPerPage;
  const indexofFirst = indexofLast - billsPerPage;
  const currentBills = billdetailslist.slice(indexofFirst, indexofLast);
  const totalPages = Math.ceil(billdetailslist.length / billsPerPage);

  // PDF image helper
  const getBase64Image = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      return null;
    }
  };

  // PDF
  const downloadPDF = async () => {
    setLoadingPDF(true);
    const doc = new jsPDF();

    try {
      doc.text("Customer Bills Report", 14, 15);

      let yPos = 25;

      for (const bill of billdetailslist) {
        doc.text(`Bill ID: ${bill.billid} | Date: ${bill.billdate}`, 14, yPos);
        yPos += 8;

        const rows = [];
        const imageMap = {};

        for (let i = 0; i < bill.products.length; i++) {
          const prod = bill.products[i];

          const imgUrl = prod.pic;
          const base64Img = await getBase64Image(imgUrl);

          if (base64Img) imageMap[i] = base64Img;

          rows.push([
            "",
            prod.pname,
            prod.qty,
            prod.price.toFixed(2),
            prod.subtotal.toFixed(2),
          ]);
        }

        autoTable(doc, {
          head: [["Image", "Product", "Qty", "Price", "Subtotal"]],
          body: rows,
          startY: yPos,
          theme: "grid",

          didDrawCell: (data) => {
            if (
              data.section === "body" &&
              data.column.index === 0 &&
              imageMap[data.row.index]
            ) {
              doc.addImage(
                imageMap[data.row.index],
                "JPEG",
                data.cell.x + 2,
                data.cell.y + 2,
                10,
                10
              );
            }
          },
        });

        yPos = doc.lastAutoTable.finalY + 10;

        doc.text(`Total: ₹${bill.total.toFixed(2)}`, 14, yPos);
        yPos += 10;
      }

      doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 14, yPos + 10);
      doc.save("CustomerBills.pdf");

    } catch (err) {
      alert("PDF Error");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div>
      <center>
        <h2>Bill List (Admin View)</h2>

        <select onChange={handleCustomerSelect}>
          <option value="">--Select Customer--</option>
          {custlist.map((item) => (
            <option key={item.Cid} value={item.Cid}>
              {item.CustomerName} ({item.Cid})
            </option>
          ))}
        </select>

        {billdetailslist.length > 0 ? (
          <>
            <table border={1} cellPadding={6}>
              <thead>
                <tr>
                  <th>Bill</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                  <th>Image</th>
                </tr>
              </thead>

              <tbody>
                {currentBills.map((bill) => (
                  <React.Fragment key={`${bill.billid}-${bill.cid}`}>

                    {bill.products.map((prod, idx) => (
                      <tr key={`${bill.billid}-${idx}`}>

                        <td>{idx === 0 ? bill.billid : ""}</td>
                        <td>{idx === 0 ? bill.cid : ""}</td>
                        <td>{idx === 0 ? bill.billdate : ""}</td>

                        <td>{prod.pname}</td>
                        <td>{prod.qty}</td>
                        <td>₹{prod.price.toFixed(2)}</td>
                        <td>₹{prod.subtotal.toFixed(2)}</td>

                        {/* 🔥 FINAL IMAGE FIX */}
                        <td>
                          <img
                            src={prod.pic}
                            alt={prod.pname}
                            style={{
                              width: "70px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                            onError={(e) =>
                              (e.target.src =
                                "https://via.placeholder.com/80")
                            }
                          />
                        </td>

                      </tr>
                    ))}

                    <tr>
                      <td colSpan="6"></td>
                      <td>
                        <b>Total: ₹{bill.total.toFixed(2)}</b>
                      </td>
                      <td></td>
                    </tr>

                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <button onClick={downloadPDF}>
              {loadingPDF ? "Generating..." : "Download PDF"}
            </button>
          </>
        ) : (
          <p>No bills found</p>
        )}

      </center>
    </div>
  );
}

export default ShowBills;