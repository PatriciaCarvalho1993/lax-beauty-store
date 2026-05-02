import { useState, useEffect } from "react";
import emailjs from "emailjs-com";

const BRAND = {
  name: "LAX BEAUTY",
  email: "laxbeauty@email.com",
  mbway: "912 345 678",
  paypalEmail: "email@paypal.com"
};

const products = [
  { id: 1, name: "Radiance Cream", price: 29.99, image: "https://via.placeholder.com/300" },
  { id: 2, name: "Glow Serum", price: 34.99, image: "https://via.placeholder.com/300" },
  { id: 3, name: "Lipstick Velvet", price: 18.5, image: "https://via.placeholder.com/300" }
];

const shippingOptions = [
  { id: "standard", name: "CTT Standard", price: 3.5 },
  { id: "express", name: "CTT Express", price: 8 }
];

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState(shippingOptions[0]);
  const [form, setForm] = useState({ name: "", address: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const addToCart = (p) => {
    const exists = cart.find(i => i.id === p.id);
    if (exists) {
      setCart(cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const updateQty = (id, val) => {
    setCart(cart.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + val) } : i));
  };

  const removeItem = (id) => setCart(cart.filter(i => i.id !== id));

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal + shipping.price;

  const isValid =
    form.name.trim() &&
    form.address.trim() &&
    form.email.includes("@");

  const canBuy = cart.length > 0 && isValid && !loading;

  const sendOrder = async () => {
    if (!canBuy) {
      setError("Preenche todos os campos e adiciona produtos.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const orderId = "LAX-" + Date.now();

      const items = cart.map(i => `${i.name} x${i.qty}`).join(" | ");

      const emailHTML = `
        <div style="font-family:Arial;background:#111;color:#fff;padding:20px">
          <h2 style="color:#d4af37">💄 ${BRAND.name}</h2>
          <p><b>Order:</b> ${orderId}</p>

          <h3>Cliente</h3>
          <p>${form.name}</p>
          <p>${form.email}</p>
          <p>${form.address}</p>

          <h3>Produtos</h3>
          <p>${items}</p>

          <h3>Envio</h3>
          <p>${shipping.name} - €${shipping.price}</p>

          <h2>Total: €${total.toFixed(2)}</h2>

          <p>MB WAY: ${BRAND.mbway}</p>
        </div>
      `;

      await emailjs.send(
        "SERVICE_ID",
        "TEMPLATE_ID",
        { message_html: emailHTML },
        "PUBLIC_KEY"
      );

      setDone(true);
      setCart([]);

    } catch (err) {
      setError("Erro ao enviar pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <h1>✔ Encomenda Confirmada</h1>
        <p>Receberás email em breve.</p>
        <button onClick={() => { setDone(false); setPage("home"); }}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Arial" }}>

      {/* NAV */}
      <div style={{ display: "flex", gap: 10, padding: 20 }}>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("shop")}>Shop</button>
        <button onClick={() => setPage("cart")}>
          Cart ({cart.reduce((a,c)=>a+c.qty,0)})
        </button>
      </div>

      {/* HOME */}
      {page === "home" && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h1>{BRAND.name}</h1>
          <p>Luxury Beauty Store</p>
        </div>
      )}

      {/* SHOP */}
      {page === "shop" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, padding: 20 }}>
          {products.map(p => (
            <div key={p.id}>
              <img src={p.image} width="100%" />
              <h3>{p.name}</h3>
              <p>€{p.price}</p>
              <button onClick={() => addToCart(p)}>Add</button>
            </div>
          ))}
        </div>
      )}

      {/* CART */}
      {page === "cart" && (
        <div style={{ padding: 20 }}>

          {cart.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{i.name}</span>

              <div>
                <button onClick={() => updateQty(i.id, -1)}>-</button>
                <span>{i.qty}</span>
                <button onClick={() => updateQty(i.id, 1)}>+</button>
              </div>

              <button onClick={() => removeItem(i.id)}>x</button>
            </div>
          ))}

          <h3>Total: €{total.toFixed(2)}</h3>

          <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})} />
          <input placeholder="Address" onChange={e=>setForm({...form,address:e.target.value})} />
          <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})} />

          <select onChange={e=>setShipping(shippingOptions.find(s=>s.id===e.target.value))}>
            {shippingOptions.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button disabled={!canBuy} onClick={sendOrder}>
            {loading ? "A processar..." : "Confirmar Compra"}
          </button>

        </div>
      )}

    </div>
  );
}