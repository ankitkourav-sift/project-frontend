import React,{useState,useEffect,useRef} from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {Bar} from "react-chartjs-2";
import "./VenderSales.css";
import {
    Chart as Chartjs,BarElement,CategoryScale,LinearScale,Tooltip,Legend
} from "chart.js";
import autoTable from "jspdf-autotable";

Chartjs.register(BarElement,CategoryScale,LinearScale,Tooltip,Legend);

function VenderSales({vender})
{
 const [sales,setSales] = useState([]);
 const [salesSearch,setSalesSearch] = useState("");
 const [fromDate,setFromDate] = useState("");
 const [toDate,setToDate] = useState("");
 const [salesPage,setSalesPage] = useState(1)
 const [salesPerPage] = useState(10);
 const [grandTotal,setGrandTotal] = useState(0);
 const [productTotals,setProductTotals] = useState({});
 const [selectedProduct,setSelectedProduct] = useState(null);
 const [popupVisible,setPopupVisible] = useState(false);
 const [totalProductSold,setTotalProductSold] = useState(0);
 const chartRef = useRef(null);

 useEffect(() => {
     if(!vender?.Vid) return;

     axios.get(`http://localhost:9292/sales/vender/${vender.Vid}`)
     .then(res => setSales(res.data || []))
     .catch(err => console.log(err));

 },[vender.Vid]);

 const filteredSales = sales.filter((s) => {
     const productName = s.productDetails?.pname?.toLowerCase() || "";
     const billIdStr = s.billid? s.billid.toString() : "";
     const searchLower = salesSearch.toLowerCase();

     const matchSearch = productName.includes(searchLower) || billIdStr.includes(searchLower);
     const saleDate = new Date(s.date);

     const matchDate = (!fromDate || saleDate >= new Date(fromDate)) && (!toDate || saleDate <= new Date(toDate));
     return matchSearch && matchDate;
 });

 const totalPages = Math.ceil(filteredSales.length / salesPerPage);
 const startIndex = (salesPage -  1)* salesPerPage;
 const currentSales = filteredSales.slice(startIndex,startIndex + salesPerPage);

 useEffect(() => {
     const totalRevenue = filteredSales.reduce((sum,s) => sum + (s.totalPrice || 0), 0);
     setGrandTotal(totalRevenue);

     const summary = {};
     let totalQty =0;

     filteredSales.forEach((s) => {
         const pname = s.productDetails?.pname || "unknown";
         if(!summary[pname]) summary[pname] = {qty:0, revenue:0};

         summary[pname].qty += s.quantity;
         summary[pname].revenue += s.totalPrice;
         totalQty += s.quantity;
     });

     setProductTotals(summary);
     setTotalProductSold(totalQty);
 },[filteredSales]);

 const productNames = Object.keys(productTotals);
 const colors = productNames.map((_,i) => `hsl(${(i * 45) % 360}, 70% , 55%)`);

 const chartData = {
     labels : productNames,
     datasets : [
         {
             label: "Revenue (₹)",
             data:Object.values(productTotals).map((p) => p.revenue),
             backgroundColor: colors,
         },
     ],
 };

 const exportPDF = () => {
     const doc = new jsPDF();

     autoTable(doc,{
         head:[["Bill ID","Date","Product","Qty","Price","Offer Price","Total"]],
         body:filteredSales.map((s) => [
             s.billid,
             new Date(s.date).toLocaleDateString(),
             s.productDetails?.pname || "Unknown",
             s.quantity,
             s.productDetails?.pprice || "-",
             s.productDetails?.oprice || "-",
             s.totalPrice,
         ]),
     });

     doc.save("Sales_Report.pdf");
 };

 return (
     <div className="Vender-Sales-page">

         <h2>Vender Sales</h2>

         <button onClick={exportPDF} className="venderbtn">
             Export PDF
         </button>

         <div className="venderfilters">
             <input
               type="text"
               placeholder="Search by bill/product"
               value={salesSearch}
               onChange={(e)=>{
                   setSalesSearch(e.target.value);
                   setSalesPage(1);
               }}
             />

             <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
             <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} />

             <button onClick={()=>{
                 setFromDate("");
                 setToDate("");
             }}>
               Reset
             </button>
         </div>

         {/* TABLE */}
         <table className="vendersaless">
             <thead>
                 <tr>
                     <th>Bill</th>
                     <th>Product</th>
                     <th>Qty</th>
                     <th>Total</th>
                 </tr>
             </thead>

             <tbody>
                 {currentSales.length === 0 ? (
                     <tr>
                         <td colSpan="4">No Data</td>
                     </tr>
                 ) : (
                     currentSales.map((s)=>{

                         const p = s.product || s.productDetails || {};

                         return (
                             <tr key={s._id}>
                                 <td>{s.billid}</td>
                                 <td>{p.pname || "Unknown"}</td>
                                 <td>{s.quantity}</td>
                                 <td>{s.totalPrice}</td>
                             </tr>
                         );
                     })
                 )}
             </tbody>
         </table>

         {/* PAGINATION */}
         {totalPages > 1 && (
             <div className="venderpaggination">
                 {Array.from({length:totalPages},(_,i)=>(
                     <button key={i} onClick={()=>setSalesPage(i+1)}>
                         {i+1}
                     </button>
                 ))}
             </div>
         )}

         <h3>Total Sold: {totalProductSold}</h3>
         <h3>Revenue: ₹{grandTotal}</h3>

         {productNames.length > 0 && (
             <Bar ref={chartRef} data={chartData} />
         )}

     </div>
 );
}

export default VenderSales;