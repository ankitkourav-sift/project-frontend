import React,{useState,useEffect,useCallback} from "react";
import axios from "axios";
import logo from "../logo.svg";
import {toast,ToastContainer} from "react-toastify";

function Bill ({data,onBack, onPaymentSuccess,onUpdateCart,onRemoveItem})
{
  const [customer, setCustomer] = useState({name:"", address:"", contact:""});
  const [date,setDate]= useState("");
  const [items,setItems] = useState([]);
  const [quantities,setQuantites]=useState({});
  const [isPaymentDone,setIsPaymentDone] = useState(false);
  const [billId,setBillId] =useState("");
  const [isProcessing,setIsProcessing]=useState(false);



  const getCurrentDate = () => {
    const d =new Date();
    return `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
  };

  useEffect(() =>{
    if(!data){
      setItems([]);
      setQuantites({});
      return;
    }

    setDate(getCurrentDate());

    const sel = data.selitems ?? data.items ?? [];
    setItems(sel);

    const qtyObj = {};
    sel.forEach((it)=> {
      qtyObj[it.pid] = data.quantities?.[it.pid] ?? it.qty ?? 1;
    });

    setQuantites(qtyObj);

    if(data.cid){
      axios.get(`https://project-backend-nka5.vercel.app/customer/getcustomerdetails/${data.cid}`)
      .then((res) => {
        const body = res.data || {};
        setCustomer({
          name:body.CustomerName || "",
          address: body.CAddress || "",
          contact : body.CContact || "",
        });
      }).catch(() => {
        setCustomer({name:"",address:"",contact:""});
      });
    }
  },[data]);

  const totalAmount = items.reduce(
    (acc, item) => acc + (item.oprice || 0) * (quantities[item.pid] || 1),
    0
  );

  const increaseQty = (pid) => {
    setQuantites((prev) => {
      const newQty = (prev[pid] || 1) + 1;
      onUpdateCart?.(pid,newQty);
      return {...prev,[pid]:newQty};
    });
  };

  const decreaseQty = (pid) => {
    setQuantites((prev) => {
      const newQty = Math.max((prev[pid] || 1) - 1,1);
      onUpdateCart?.(pid,newQty);
      return {...prev,[pid]:newQty};
    });
  };

  const removeItemHandler = (pid) => {
    setItems((prev) => prev.filter((it) => it.pid !== pid));
    setQuantites((prev) => {
      const q={...prev};
      delete q[pid];
      return q;
    });
    onRemoveItem?.(pid);
  };

  // ================= SAVE BILL =================
  const saveBill = useCallback(async () => {
    if(!items.length) return null;

    const nextId = Date.now();   // simple unique id
    setBillId(nextId);

    const today = getCurrentDate();

    for (const item of items){
      try {
        const qty = quantities[item.pid] || 1;

        await axios.post ("https://project-backend-nka5.vercel.app/bill/billsave", {
          billid : nextId,
          billdate: today,
          cid: data.cid,
          pid : item.pid,
          qty,
        });

        await axios.post("https://project-backend-nka5.vercel.app/sales/add",{
          venderId : item.vid ?? null,
          productId : item.pid,
          quantity : qty,
          totalPrice :(item.oprice || 0) * qty,
          billid:nextId,
          date: today,
        });

      } catch(err){
        console.log("Item failed:", item.pid, err.response?.data);
      }
    }

    return nextId;
  },[items,quantities,data?.cid]);

  // ================= PAYMENT =================
  const displayRazorpay = async () => {

  if (isPaymentDone) {
    alert("Payment already done!");
    return;
  }

  if (isProcessing) return;

  if (!items.length) {
    alert("No items in bill");
    return;
  }

  setIsProcessing(true);

  let saveBillId = null;

  try {
    saveBillId = await saveBill();
  } catch (err) {
    alert("Failed to save bill");
    setIsProcessing(false);
    return;
  }

  try {

    // Load Razorpay script
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    const amountInPaisa = Math.round(totalAmount * 100);

    const orderRes = await axios.post(
      "https://project-backend-nka5.vercel.app/payment/orders",
      { amount: amountInPaisa }
    );

    const { id: order_id, amount, currency } = orderRes.data;

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: "Universal Informatics",
      description: "Order Payment",
      image: logo,
      order_id,

      handler: async function (response) {
        try {

          // 🔥 FIXED ROUTE HERE (IMPORTANT)
          await axios.post(
            "https://project-backend-nka5.vercel.app/order/payment-success",
            {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              cid: data.cid,
              amount: amount / 100,
              billid: saveBillId,
              items: items.map(it => ({
                pid: it.pid,
                pname: it.pname,
                qty: quantities[it.pid] || 1,
                price: it.oprice
              }))
            }
          );

          setIsPaymentDone(true);
          toast.success("Payment Successful");
          onPaymentSuccess?.();

        } catch (error) {
          toast.error("Payment done but saving failed");
          console.log(error);
        } finally {
          setIsProcessing(false);
        }
      },

      prefill: {
        name: customer.name || "Customer",
        contact: customer.contact || "9999999999",
      },

      theme: { color: "#61dafb" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
    alert("Payment error");
    setIsProcessing(false);
  }
};

  return (
    <div className="div">
      <div className="bill-card">

        <div className="header">
          <h3>Bill / Checkout</h3>
          <button onClick={onBack}>Back</button>
        </div>

        <p>Customer: {customer.name}</p>
        <p>Date: {date}</p>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.length ? items.map((item)=>{
              const qty = quantities[item.pid] || 1;
              const subtotal = item.oprice * qty;

              return(
                <tr key={item.pid}>
                  <td>{item.pid}</td>
                  <td>{item.pname}</td>

                  <td>
                    <button onClick={()=>decreaseQty(item.pid)}>-</button>
                    {qty}
                    <button onClick={()=>increaseQty(item.pid)}>+</button>
                  </td>

                  <td>{item.oprice}</td>
                  <td>{subtotal}</td>

                  <td>
                    <button onClick={()=>removeItemHandler(item.pid)}>Remove</button>
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan="6">No items</td></tr>
            )}
          </tbody>
        </table>

        <h3>Total: {totalAmount}</h3>

        <button onClick={displayRazorpay} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>

      </div>

      <ToastContainer />
    </div>
  );
}

export default Bill;