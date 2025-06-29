import React,{useState,useEffect} from 'react';
import ProductCard from './ProductCard';
import data from '../all_product.json';

function Home(props) {
  const {setisloading}=props;
  const [cart, setcart] = useState([]);
  useEffect(() => {
  const token = localStorage.getItem("token");
    
    if (token) {
      setisloading(true);
      const fetchUser = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/auth/getuser", {
            method: "GET", 
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch user");
          }

          const data = await res.json();
          setcart(data.cart);
          // console.log(data)
        } catch (err) {
          console.error(err);
          setcart(null);
        }

      };
      setisloading(false);

      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);


  useEffect(() => {
    // console.log(cart)
    setisloading(true);
    const token = localStorage.getItem("token");
    const updatecart = async () => {
      if (cart.length === 0) return;
        try {
          const res = await fetch("http://localhost:5000/api/auth/updatecart", {
            method: "PUT", 
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
            },
            body: JSON.stringify({ cart }),

          });

          if (!res.ok) {
            throw new Error("Failed to fetch user");
          }

          const data = await res.json();
          console.log(data.success);
        } catch (err) {
          console.error(err);
        }
      };
    setisloading(false);
      updatecart();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);
  
  return (
   <div className="grid-container">
      {data
      .filter(product => product["Main Category"] === "Electronics")
      .map(product => (
        <ProductCard key={product["Product Id"]} setcart={setcart} product={product} isAuthenticated={props.isAuthenticated} />
      ))}
    </div>
  );
}

export default Home;
