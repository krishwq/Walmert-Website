import React, { useState, useEffect } from "react";
import data from "../all_product.json";
import CartProduct from "./CartProduct";

function Cart({ setisloading }) {
  const [userdata, setUserdata] = useState(null);
  const [cart, setcart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setisloading(false);            // 👈 nothing to fetch, stop spinner
      return;
    }
    setisloading(true);
    fetchUser(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || cart.length === 0) return;

    const updatecart = async () => {
      try {
        setisloading(true);
        const res = await fetch("http://localhost:5000/api/auth/updatecart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authtoken: token,
          },
          body: JSON.stringify({ cart }),
        });
        if (!res.ok) throw new Error("Failed to update cart");

        await fetchUser(token);       // already toggles spinner off
      } catch (err) {
        console.error(err);
        setisloading(false);          // 👈 ensure spinner stops on error
      }
    };

    updatecart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  // ---------------- helpers ----------------
  const fetchUser = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/getuser", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setUserdata(data);
      setcart((prev) => {
        const identical = JSON.stringify(prev) === JSON.stringify(data.cart);
        return identical ? prev : data.cart;
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      setUserdata(null);
    } finally {
      setisloading(false);            // 👈 ALWAYS stop spinner
    }
  };

  // ---------------- render ----------------
  if (!userdata?.cart || userdata.cart.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  const cartIds = userdata.cart.map((id) => id.toString());

  return (
    <div className="grid-container">
      {data
        .filter((p) => cartIds.includes(p["Product Id"].toString()))
        .map((p) => (
          <CartProduct key={p["Product Id"]} product={p} setcart={setcart} />
        ))}
    </div>
  );
}

export default Cart;
