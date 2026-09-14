import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, CalendarDays, Check, ChevronLeft, Coffee, Clock3, Instagram,
  LockKeyhole, Mail, MapPin, Menu, Minus, Phone, Plus, Sparkles, Star,
  User, Users, Utensils, X
} from "lucide-react";
import "./styles.css";

const seats = [
  { id: 1, label: "A1", type: "Window", x: 12, y: 16 },
  { id: 2, label: "A2", type: "Window", x: 30, y: 16 },
  { id: 3, label: "A3", type: "Window", x: 48, y: 16 },
  { id: 4, label: "A4", type: "Window", x: 66, y: 16 },
  { id: 5, label: "B1", type: "Couple", x: 12, y: 42 },
  { id: 6, label: "B2", type: "Couple", x: 30, y: 42 },
  { id: 7, label: "B3", type: "Couple", x: 48, y: 42 },
  { id: 8, label: "B4", type: "Couple", x: 66, y: 42 },
  { id: 9, label: "C1", type: "Sofa", x: 12, y: 68 },
  { id: 10, label: "C2", type: "Sofa", x: 30, y: 68 },
  { id: 11, label: "C3", type: "Sofa", x: 48, y: 68 },
  { id: 12, label: "C4", type: "Sofa", x: 66, y: 68 },
];

const initialTaken = [2, 7, 10];

function App() {
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("emberUser") || "null"));
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem("emberBookings") || "[]"));
  const [taken, setTaken] = useState(initialTaken);
  const [selected, setSelected] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [time, setTime] = useState("18:30");
  const [guests, setGuests] = useState(2);
  const [toast, setToast] = useState("");

  useEffect(() => localStorage.setItem("emberBookings", JSON.stringify(bookings)), [bookings]);
  useEffect(() => localStorage.setItem("emberUser", JSON.stringify(user)), [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const goBook = () => {
    if (!user) {
      setAuthMode("login");
      setPage("auth");
      showToast("Please sign in to reserve a seat.");
      return;
    }
    setPage("booking");
  };

  const toggleSeat = (id) => {
    if (taken.includes(id)) return;
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const confirmBooking = () => {
    if (!selected.length) return showToast("Choose at least one available seat.");
    const booking = {
      id: "EB-" + Math.random().toString(36).slice(2,8).toUpperCase(),
      date, time, guests, seats: selected.map(id => seats.find(s => s.id === id).label),
      name: user?.name || "Guest"
    };
    setBookings(b => [booking, ...b]);
    setTaken(t => [...t, ...selected]);
    setSelected([]);
    setPage("success");
  };

  const cancelBooking = (id) => {
    const b = bookings.find(x => x.id === id);
    if (b) setTaken(t => t.filter(id => !b.seats.map(s => seats.find(x => x.label === s)?.id).includes(id)));
    setBookings(b => b.filter(x => x.id !== id));
    showToast("Booking cancelled.");
  };

  return (
    <div className="app">
      <Header page={page} setPage={setPage} user={user} setUser={setUser} setAuthMode={setAuthMode} />
      {page === "home" && <Home goBook={goBook} setPage={setPage} />}
      {page === "booking" && (
        <Booking
          date={date} setDate={setDate} time={time} setTime={setTime}
          guests={guests} setGuests={setGuests} selected={selected}
          toggleSeat={toggleSeat} taken={taken} confirmBooking={confirmBooking}
          setPage={setPage}
        />
      )}
      {page === "auth" && (
        <Auth mode={authMode} setMode={setAuthMode} setUser={setUser} setPage={setPage} showToast={showToast} />
      )}
      {page === "mybookings" && <MyBookings bookings={bookings} cancelBooking={cancelBooking} setPage={setPage} />}
      {page === "success" && <Success bookings={bookings} setPage={setPage} />}
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Header({page, setPage, user, setUser, setAuthMode}) {
  const [open, setOpen] = useState(false);
  const nav = (p) => { setPage(p); setOpen(false); window.scrollTo({top:0, behavior:"smooth"}); };
  return (
    <header className="header">
      <div className="nav-wrap">
        <button className="brand" onClick={() => nav("home")}><span className="brand-mark"><Coffee size={18}/></span> ember<span>&</span>bean</button>
        <nav className={open ? "nav open" : "nav"}>
          <button onClick={() => nav("home")} className={page==="home" ? "active":""}>Home</button>
          <a href="#menu" onClick={() => nav("home")}>Menu</a>
          <button onClick={() => nav("booking")} className={page==="booking" ? "active":""}>Reserve</button>
          {user && <button onClick={() => nav("mybookings")}>My bookings</button>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <button className="user-chip" onClick={() => {setUser(null); nav("home")}}><User size={16}/>{user.name}<span className="logout">Log out</span></button>
          ) : <button className="outline-btn" onClick={() => {setAuthMode("login"); nav("auth")}}>Sign in</button>}
          <button className="primary-btn small" onClick={() => nav("booking")}>Book a seat <ArrowRight size={16}/></button>
        </div>
        <button className="hamburger" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      </div>
    </header>
  );
}

function Home({goBook, setPage}) {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15}/> Slow mornings. Good coffee.</div>
        <h1>Your favorite corner<br/><em>is waiting.</em></h1>
        <p>A warm neighborhood café for deep conversations, quiet work, and coffee worth slowing down for. Pick your seat before you arrive.</p>
        <div className="hero-actions"><button className="primary-btn" onClick={goBook}>Reserve your seat <ArrowRight size={18}/></button><button className="text-btn" onClick={() => document.getElementById("menu")?.scrollIntoView({behavior:"smooth"})}>Explore the menu <ArrowRight size={17}/></button></div>
        <div className="hero-proof"><div className="avatars"><span>AK</span><span>RM</span><span>VS</span><span>+</span></div><div><div className="stars">★★★★★ <b>4.9</b></div><small>Loved by 2,000+ coffee people</small></div></div>
      </div>
      <div className="hero-visual">
        <div className="photo-card"><div className="photo-overlay"><span>Today at Ember & Bean</span><b>Freshly brewed. Always.</b></div></div>
        <div className="floating-card"><div className="live-dot"></div><div><strong>Seats available</strong><small>12 cozy spots open</small></div><ArrowRight size={18}/></div>
      </div>
    </section>

    <section className="strip">
      <div><Clock3/><span><b>Open daily</b><small>7:00 AM — 10:00 PM</small></span></div>
      <div><MapPin/><span><b>Old Town, Bhopal</b><small>Easy parking nearby</small></span></div>
      <div><WifiIcon/><span><b>Work friendly</b><small>Fast Wi-Fi + power outlets</small></span></div>
      <div><Utensils/><span><b>All-day bites</b><small>Fresh from our kitchen</small></span></div>
    </section>

    <section className="section" id="menu">
      <div className="section-head"><div><span className="eyebrow">The good stuff</span><h2>Made for lingering.</h2></div><button className="text-btn" onClick={goBook}>Reserve a spot <ArrowRight size={16}/></button></div>
      <div className="cards">
        <MenuCard title="Velvet Latte" desc="Double espresso, silky steamed milk, vanilla bean." price="₹220" icon="☕"/>
        <MenuCard title="Brown Butter Toast" desc="Sourdough, cultured butter, honey, sea salt." price="₹280" icon="🍞"/>
        <MenuCard title="Berry Cloud" desc="Greek yogurt, seasonal berries, granola, maple." price="₹260" icon="🫐"/>
      </div>
    </section>

    <section className="booking-banner">
      <div><span className="eyebrow">Your table, your time</span><h2>Don't leave your seat to chance.</h2><p>Choose your date, time, and favorite corner. We'll have it ready when you arrive.</p></div>
      <button className="primary-btn light" onClick={goBook}>Book a seat <ArrowRight size={18}/></button>
    </section>
  </>;
}

function MenuCard({title,desc,price,icon}) {
  return <article className="menu-card"><div className="food-icon">{icon}</div><div><h3>{title}</h3><p>{desc}</p></div><strong>{price}</strong></article>
}
function WifiIcon(){return <span className="wifi-icon">⌁</span>}

function Booking({date,setDate,time,setTime,guests,setGuests,selected,toggleSeat,taken,confirmBooking,setPage}) {
  return <main className="booking-page">
    <div className="booking-top"><button className="back-btn" onClick={() => setPage("home")}><ChevronLeft/> Back</button><div><span className="eyebrow">Seat reservation</span><h1>Find your favorite seat.</h1><p>Choose a time, then tap any available seat on the floor plan.</p></div></div>
    <div className="booking-layout">
      <aside className="booking-controls">
        <label><CalendarDays/> Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
        <label><Clock3/> Time<select value={time} onChange={e=>setTime(e.target.value)}>{["08:00","09:30","11:00","12:30","14:00","16:00","18:30","20:00"].map(t=><option key={t}>{t}</option>)}</select></label>
        <div className="guest-control"><span><Users/> Guests</span><div><button onClick={()=>setGuests(Math.max(1,guests-1))}><Minus/></button><b>{guests}</b><button onClick={()=>setGuests(Math.min(8,guests+1))}><Plus/></button></div></div>
        <div className="legend"><span><i className="available"></i> Available</span><span><i className="chosen"></i> Selected</span><span><i className="occupied"></i> Occupied</span></div>
        <div className="selection-summary"><small>Your selection</small><strong>{selected.length ? selected.join(", ") : "No seats selected"}</strong><span>{selected.length} seat{selected.length!==1?"s":""} · {guests} guest{guests!==1?"s":""}</span></div>
        <button className="primary-btn full" onClick={confirmBooking} disabled={!selected.length}>Confirm reservation <ArrowRight/></button>
      </aside>
      <section className="floor-wrap">
        <div className="floor-header"><div><b>Ground floor</b><small>Window side is at the top</small></div><span>Live availability</span></div>
        <div className="floor">
          <div className="window-line">WINDOWS · NATURAL LIGHT</div>
          <div className="counter">ORDER COUNTER <Coffee size={16}/></div>
          <div className="plant p1">🌿</div><div className="plant p2">🌿</div>
          {seats.map(s => <button key={s.id} disabled={taken.includes(s.id)} onClick={()=>toggleSeat(s.id)} className={"seat " + (taken.includes(s.id) ? "occupied":"") + (selected.includes(s.id) ? " selected":"")} style={{left:`${s.x}%`,top:`${s.y}%`}}><span>{s.label}</span><small>{s.type}</small></button>)}
          <div className="bar">BAR</div>
          <div className="door">ENTRANCE</div>
        </div>
      </section>
    </div>
  </main>
}

function Auth({mode,setMode,setUser,setPage,showToast}) {
  const [form,setForm] = useState({name:"",email:"",password:""});
  const submit = e => {
    e.preventDefault();
    if (!form.email || !form.password || (mode==="signup" && !form.name)) return;
    const name = form.name || form.email.split("@")[0];
    setUser({name,email:form.email});
    showToast(mode==="login" ? "Welcome back!" : "Account created successfully.");
    setPage("booking");
  };
  return <main className="auth-page"><div className="auth-visual"><div className="auth-quote"><Coffee size={28}/><h2>Good coffee,<br/><em>good company.</em></h2><p>Make yourself at home. Your next favorite ritual starts here.</p></div></div>
    <div className="auth-card"><button className="back-btn" onClick={()=>setPage("home")}><ChevronLeft/> Home</button><div className="auth-inner"><span className="eyebrow">{mode==="login"?"Welcome back":"Come on in"}</span><h1>{mode==="login"?"Sign in to Ember & Bean":"Create your account"}</h1><p>{mode==="login"?"Reserve your seat and manage your visits.":"Join us and make every café visit a little easier."}</p>
    <form onSubmit={submit}>
      {mode==="signup" && <label><User/> Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}
      <label><Mail/> Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
      <label><LockKeyhole/> Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/></label>
      <button className="primary-btn full">{mode==="login"?"Sign in":"Create account"} <ArrowRight/></button>
    </form>
    <div className="switch-auth">{mode==="login"?"New here?":"Already have an account?"}<button onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Create an account":"Sign in"}</button></div>
    <small className="demo-note">Frontend demo: account data is kept only in this browser using localStorage.</small>
    </div></div></main>
}

function MyBookings({bookings,cancelBooking,setPage}) {
  return <main className="simple-page"><span className="eyebrow">Your visits</span><h1>My bookings</h1><p>Everything you've reserved at Ember & Bean.</p>
    {!bookings.length ? <div className="empty"><CalendarDays size={40}/><h3>No bookings yet</h3><p>Pick a seat and make your next visit count.</p><button className="primary-btn" onClick={()=>setPage("booking")}>Reserve a seat <ArrowRight/></button></div> :
    <div className="booking-list">{bookings.map(b=><div className="booking-item" key={b.id}><div className="booking-date"><b>{new Date(b.date+"T00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</b><small>{b.date.slice(0,4)}</small></div><div><h3>{b.time} · {b.seats.join(", ")}</h3><p>{b.guests} guests · {b.id}</p></div><button className="cancel-btn" onClick={()=>cancelBooking(b.id)}>Cancel</button></div>)}</div>}
  </main>
}

function Success({bookings,setPage}) {
  const b=bookings[0];
  return <main className="success-page"><div className="success-mark"><Check/></div><span className="eyebrow">Reservation confirmed</span><h1>Your seat is saved.</h1><p>We'll be ready for you. Show this confirmation when you arrive.</p>{b&&<div className="ticket"><div><small>BOOKING</small><b>{b.id}</b></div><div><small>DATE & TIME</small><b>{b.date} · {b.time}</b></div><div><small>SEATS</small><b>{b.seats.join(", ")}</b></div><div><small>GUESTS</small><b>{b.guests}</b></div></div>}<div><button className="primary-btn" onClick={()=>setPage("mybookings")}>View my bookings <ArrowRight/></button><button className="text-btn" onClick={()=>setPage("home")}>Back to home</button></div></main>
}

function Footer(){return <footer><div className="footer-brand"><button className="brand"><span className="brand-mark"><Coffee size={17}/></span> ember<span>&</span>bean</button><p>Good coffee, warm corners,<br/>and nowhere else to be.</p></div><div><b>Visit</b><p>12 Old Town Lane<br/>Bhopal, MP 462001</p></div><div><b>Hours</b><p>Mon–Sun<br/>7:00 AM — 10:00 PM</p></div><div><b>Say hello</b><p>hello@emberandbean.cafe<br/>+91 98765 43210</p></div><div className="social"><Instagram/><Star/></div><small className="copyright">© 2026 Ember & Bean. Frontend demo.</small></footer>}

createRoot(document.getElementById("root")).render(<App />);