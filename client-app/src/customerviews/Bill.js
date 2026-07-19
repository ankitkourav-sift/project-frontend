import React,{useState,useEffect,useCallback} from "react";
import axios from "axios";
import logo from "../logo.svg";
import {toast,ToastContainer} from "react-toastify";
import "./Bill.css";

function Bill({
  data,
  onBack,
  onPaymentSuccess,
  onUpdateCart,
  onRemoveItem,
  onRequireLogin
})

{
  const [customer, setCustomer] = useState({name:"", address:"", contact:""});
  const [date,setDate]= useState("");
  const [items,setItems] = useState([]);
  const [quantities,setQuantites]=useState({});
  const [isPaymentDone,setIsPaymentDone] = useState(false);
  const [billId,setBillId] =useState("");
  const [isProcessing,setIsProcessing]=useState(false);
  const [deliveryType, setDeliveryType] = useState("Standard");
 const [addresses, setAddresses] = useState([]);
const [selectedAddress, setSelectedAddress] = useState(null);
const [showAddressList, setShowAddressList] = useState(false);
const [showAddAddress, setShowAddAddress] = useState(false);

const [newAddress, setNewAddress] = useState({
  fullName: "",
  mobile: "",
  house: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
});



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

   if (data.cid) {

  // Customer Details
  axios
    .get(
      `https://project-backend-nka5.vercel.app/customer/getcustomerdetails/${data.cid}`
    )
    .then((res) => {
      const body = res.data || {};

      setCustomer({
        name: body.CustomerName || "",
        address: body.CAddress || "",
        contact: body.CContact || "",
      });
    })
    .catch(() => {
      setCustomer({
        name: "",
        address: "",
        contact: "",
      });
    });

  // Customer Saved Addresses
  axios
    .get(
      `https://project-backend-nka5.vercel.app/address/${data.cid}`
    )
    .then((res) => {

  const addressList = res.data.addresses || [];

  setAddresses(addressList);

  const defaultAddress = addressList.find(
    (item) => item.isDefault
  );

  if (defaultAddress) {
    setSelectedAddress(defaultAddress);
  }

})
    .catch((err) => {
      console.log(err);
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


   const amountInPaisa = Math.round(finalAmount * 100);


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
    billid: String(saveBillId),

    customerName: customer.name,
    mobile: customer.contact,

    address: {
      house: selectedAddress?.house || "",
      area: selectedAddress?.area || "",
      landmark: selectedAddress?.landmark || "",
      city: selectedAddress?.city || "",
      state: selectedAddress?.state || "",
      pincode: selectedAddress?.pincode || "",
    },

    deliveryType,
    paymentMethod: "Online",

    amount: finalAmount,
    deliveryCharge,

    items: items.map((it) => ({
      pid: it.pid,
      pname: it.pname,
      qty: quantities[it.pid] || 1,
      price: it.oprice,
    })),
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

const gst = 0;

const deliveryCharge =
deliveryType === "Express"
? 80
: 0;

const finalAmount =
totalAmount +
gst +
deliveryCharge;

  return (
  <div className="div">
    <div className="bill-card">

      {/* Header */}
      <div className="header">
        <h2>Checkout</h2>
        <button onClick={onBack}>Back</button>
      </div>

      {/* Customer Details */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <h3>Delivery Address</h3>

        <p><b>Customer :</b> {customer.name}</p>

        <p><b>Mobile :</b> {customer.contact}</p>

        <p><b>Address :</b> {customer.address}</p>

        <p><b>Date :</b> {date}</p>
      </div>

      {/* Product List */}

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
          {items.length ? (
            items.map((item) => {
              const qty = quantities[item.pid] || 1;
              const subtotal = item.oprice * qty;

              return (
                <tr key={item.pid}>
                  <td>{item.pid}</td>

                  <td>{item.pname}</td>

                  <td>
                    <button onClick={() => decreaseQty(item.pid)}>-</button>

                    {" "}
                    {qty}
                    {" "}

                    <button onClick={() => increaseQty(item.pid)}>+</button>
                  </td>

                  <td>₹{item.oprice}</td>

                  <td>₹{subtotal}</td>

                  <td>
                    <button
                      onClick={() => removeItemHandler(item.pid)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6">
                No Items Found
              </td>
            </tr>
          )}
        </tbody>
      </table>


      <hr />

      <hr />

<h3>Delivery Address</h3>

{selectedAddress ? (
  <div
    style={{
      border: "1px solid #ddd",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "20px",
    }}
  >
    <h4>{selectedAddress.fullName}</h4>

    <p>{selectedAddress.mobile}</p>

    <p>
      {selectedAddress.house}, {selectedAddress.area}
    </p>

    <p>{selectedAddress.landmark}</p>

    <p>
      {selectedAddress.city}, {selectedAddress.state}
    </p>

    <p>{selectedAddress.pincode}</p>

    <button
      onClick={() => setShowAddressList(true)}
    >
      Change Address
    </button>
  </div>
) : (
  <div>
    <p>No Address Selected</p>

    <button
      onClick={() => setShowAddressList(true)}
    >
      Select Address
    </button>
  </div>
)}

{showAddressList && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,.5)",
      zIndex: 999,
    }}
  >
    <div
      style={{
        width: "500px",
        margin: "60px auto",
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <h2>Select Address</h2>

{Array.isArray(addresses) ? (
  addresses.map((item) => (
    <div
      key={item._id}
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
        cursor: "pointer",
      }}
      onClick={() => {
        setSelectedAddress(item);
        setShowAddressList(false);
      }}
    >
      <h4>{item.fullName}</h4>

      <p>{item.mobile}</p>

      <p>
        {item.house}, {item.area}
      </p>

      <p>{item.landmark}</p>

      <p>
        {item.city}, {item.state}
      </p>

      <p>{item.pincode}</p>
    </div>
  ))
) : (
  <p>No addresses found.</p>
)}
      <button
  onClick={() => {
    setShowAddAddress(true);
    setShowAddressList(false);
  }}
  style={{
    marginRight: "10px",
    padding: "10px 15px",
  }}
>
  + Add New Address
</button>

      <button onClick={() => setShowAddressList(false)}>
        Close
      </button>
    </div>
  </div>
)}
{showAddAddress && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,.5)",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        width: "500px",
        margin: "40px auto",
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h2>Add New Address</h2>

      <input
        placeholder="Full Name"
        value={newAddress.fullName}
        onChange={(e) =>
          setNewAddress({
            ...newAddress,
            fullName: e.target.value,
          })
        }
      />

      <br /><br />

      <input
        placeholder="Mobile"
        value={newAddress.mobile}
        onChange={(e) =>
          setNewAddress({
            ...newAddress,
            mobile: e.target.value,
          })
        }
      />

      <br /><br />

      <input
        placeholder="House No."
        value={newAddress.house}
        onChange={(e) =>
          setNewAddress({
            ...newAddress,
            house: e.target.value,
          })
        }
      />

      <br /><br />
      <input
placeholder="City"
value={newAddress.city}
onChange={(e)=>
setNewAddress({
...newAddress,
city:e.target.value
})
}
/>

<br/><br/>

<input
placeholder="State"
value={newAddress.state}
onChange={(e)=>
setNewAddress({
...newAddress,
state:e.target.value
})
}
/>

<br/><br/>

<input
placeholder="Pincode"
value={newAddress.pincode}
onChange={(e)=>
setNewAddress({
...newAddress,
pincode:e.target.value
})
}
/><br></br>

      <input
        placeholder="Area"
        value={newAddress.area}
        onChange={(e) =>
          setNewAddress({
            ...newAddress,
            area: e.target.value,
          })
        }
      />
      

      <br /><br />
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  }}
>
  <button
    onClick={async () => {
      try {
        const res = await axios.post(
          `https://project-backend-nka5.vercel.app/address/add`,
          {
            cid: data.cid,
            ...newAddress,
          }
        );

   const savedAddress = res.data.address;

setAddresses((prev) => [...prev, savedAddress]);

setSelectedAddress(savedAddress);

        setShowAddAddress(false);

        setNewAddress({
          fullName: "",
          mobile: "",
          house: "",
          area: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
        });

        alert("Address Saved Successfully");
      } catch (err) {
        console.log(err);
        alert("Failed to save address");
      }
    }}
  >
    Save Address
  </button>

  <button onClick={() => setShowAddAddress(false)}>
    Close
  </button>
</div>
    </div>
  </div>
)}

<hr />

<div className="delivery-section">
  <h3>Delivery Type</h3>

  <label>
    <input
      type="radio"
      value="Standard"
      checked={deliveryType === "Standard"}
      onChange={(e) => setDeliveryType(e.target.value)}
    /><p>Delivery in 5-7 Business Days</p>
    Standard Delivery (FREE)
  </label>

  <label>
    <input
      type="radio"
      value="Express"
      checked={deliveryType === "Express"}
      onChange={(e) => setDeliveryType(e.target.value)}
    /><p>Delivery in 1-2 Business Days</p>
    Express Delivery (+₹80)
  </label>
</div>

      {/* Payment */}

    <div className="payment-section">
  <h3>Payment Method</h3>

  <label>
    <input
      type="radio"
      checked
      readOnly
    />
    Online Payment
  </label>

  <label>
    <input
      type="radio"
      disabled
    />
    Cash On Delivery
  


          <span style={{ color: "red" }}>
            {" "}
            (Currently Not Available)
          </span>
        </label>
      </div>

      {/* Price Details */}

      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          marginTop: "20px",
          borderRadius: "8px",
        }}
      >
        <h3>Price Details</h3>

        <p>
          Items Total :
          <b> ₹{totalAmount}</b>
        </p>

       <p>
Delivery Charges :
<b>
₹{deliveryCharge}
</b>

{deliveryCharge === 0 && (
<span style={{color:"green"}}>
 FREE
</span>
)}

</p>

        <p>
          GST (Included) :
          <b> ₹{gst}</b>
        </p>

        <hr />

        <h2>
          Total Payable : ₹{finalAmount}
        </h2>
      </div>

      {/* Pay Button */}

      <button
        onClick={displayRazorpay}
        disabled={isProcessing}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        {isProcessing
          ? "Processing..."
          : "Proceed To Pay"}
      </button>

    </div>

    <ToastContainer />
  </div>
); }
export default Bill;