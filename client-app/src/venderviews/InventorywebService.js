import axios from "axios";
import "./InventoryWb.css";

const BASE_URL = "https://project-backend-nka5.vercel.app";

const ProductAPI = {

  // ✅ PRODUCTS BY VENDOR
  productsByVendor: async (vid) => {
    const res = await axios.get(`${BASE_URL}/product/showproductbyvender/${vid}`);
    return res.data;
  },

  // ✅ INVENTORY BY PRODUCT
  inventoryByProduct: async (pid) => {
    const res = await axios.get(`${BASE_URL}/inventory/inventorybyproduct/${pid}`);
    return res.data;
  },

  // ❌ CREATE INVENTORY (remove - not in backend)
  createInventory: async () => {
    throw new Error("Not implemented in backend");
  },

  // ✅ UPDATE STOCK
  updateStock: async (pid, vid, data) => {
    const res = await axios.patch(
      `${BASE_URL}/inventory/stock/${pid}/vendor/${vid}?mode=${data.mode}`,
      data.mode === "set"
        ? { stock: data.value }
        : { delta: data.value }
    );
    return res.data;
  },

  // SAME AS update
  manageStock: async (pid, vid, data) => {
    return ProductAPI.updateStock(pid, vid, data);
  }

};

export default ProductAPI;