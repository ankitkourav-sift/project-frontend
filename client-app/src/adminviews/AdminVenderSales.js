import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminVenderSales.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminVenderSales() {
  const [sales, setSales] = useState([]);
  const [salesSearch, setSalesSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [salesPage, setSalesPage] = useState(1);
  const [salesPerPage] = useState(10);
  const [grandTotal, setGrandTotal] = useState(0);
  const [productTotals, setProductTotals] = useState({});
  const [totalProductSold, setTotalProductSold] = useState(0);

  const [venderlist, setVenderList] = useState([]);
  const [selectedVender, setSelectedVender] = useState("");
  const [loadingSales, setLoadingSales] = useState(false);

  const chartRef = useRef(null);

  // ================= FETCH VENDERS =================
  useEffect(() => {
    axios
      .get("https://project-backend-nka5.vercel.app/vender/getvendercount")
      .then((res) => setVenderList(res.data || []))
      .catch(() => setVenderList([]));
  }, []);

  // ================= FETCH SALES =================
  const fetchSales = async (vid) => {
    if (!vid) return;

    setLoadingSales(true);

    try {
      const res = await axios.get(
        `https://project-backend-nka5.vercel.app/sales/vender/${vid}`
      );

      // ✅ FIX: backend array direct + object fallback
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.sales || [];

      setSales(data);
      setSalesPage(1);
    } catch (err) {
      console.log(err);
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchSales(selectedVender);
  }, [selectedVender]);

  // ================= FILTER =================
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const name = s.productDetails?.pname || "";
      const bill = String(s.billid || "");

      const search = salesSearch.toLowerCase();

      const match =
        name.toLowerCase().includes(search) ||
        bill.includes(search);

      return match;
    });
  }, [sales, salesSearch]);

  // ================= SUMMARY =================
  useEffect(() => {
    let total = 0;
    let qty = 0;
    const summary = {};

    filteredSales.forEach((s) => {
      const pname = s.productDetails?.pname || "Unknown";

      if (!summary[pname]) {
        summary[pname] = {
          qty: 0,
          revenue: 0,
          sample: s.productDetails,
        };
      }

      summary[pname].qty += Number(s.quantity) || 0;
      summary[pname].revenue += Number(s.totalPrice) || 0;

      total += Number(s.totalPrice) || 0;
      qty += Number(s.quantity) || 0;
    });

    setProductTotals(summary);
    setGrandTotal(total);
    setTotalProductSold(qty);
  }, [filteredSales]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredSales.length / salesPerPage) || 1;

  const currentSales = filteredSales.slice(
    (salesPage - 1) * salesPerPage,
    salesPage * salesPerPage
  );

  // ================= PDF =================
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Vendor Sales Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Bill", "Product", "Qty", "Total"]],
      body: filteredSales.map((s) => [
        s.billid,
        s.productDetails?.pname,
        s.quantity,
        s.totalPrice,
      ]),
    });

    doc.text(
      `Grand Total: ₹${grandTotal}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("vendor_sales.pdf");
  };

  // ================= CHART =================
  const chartData = {
    labels: Object.keys(productTotals),
    datasets: [
      {
        label: "Revenue",
        data: Object.values(productTotals).map((p) => p.revenue),
      },
    ],
  };

  return (
    <div className="vendor-sales-page">
      <h3>Vendor Sales Report</h3>

      {/* VENDOR SELECT */}
      <select onChange={(e) => setSelectedVender(e.target.value)}>
        <option value="">Select Vendor</option>
        {venderlist.map((v) => (
          <option key={v.Vid} value={v.Vid}>
            {v.VenderName}
          </option>
        ))}
      </select>

      <button onClick={exportPDF}>Export PDF</button>

      <input
        placeholder="Search"
        value={salesSearch}
        onChange={(e) => setSalesSearch(e.target.value)}
      />

      {/* TABLE */}
      {loadingSales ? (
        <p>Loading...</p>
      ) : (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>Bill</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Image</th>
            </tr>
          </thead>

          <tbody>
            {currentSales.map((s, i) => (
              <tr key={i}>
                <td>{s.billid}</td>

                <td>{s.productDetails?.pname}</td>

                <td>{s.quantity}</td>

                <td>{s.totalPrice}</td>

                {/* ✅ FIXED IMAGE */}
                <td>
                  <img
                    src={s.productDetails?.ppicname}
                    alt="product"
                    height="40"
                    width="40"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/40")
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PAGINATION */}
      <div style={{ marginTop: 10 }}>
        <button
          disabled={salesPage === 1}
          onClick={() => setSalesPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          {salesPage} / {totalPages}
        </span>

        <button
          disabled={salesPage === totalPages}
          onClick={() => setSalesPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* SUMMARY */}
      <h4>Total Qty: {totalProductSold}</h4>
      <h4>Grand Total: ₹{grandTotal}</h4>

      <Bar data={chartData} />
    </div>
  );
}