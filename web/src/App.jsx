import { useEffect, useMemo, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const cities = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur', 'Kanyakumari'];
const sampleRoutes = [
  { id: 'r1', from: 'Chennai', to: 'Madurai', distanceKm: 463, durationMinutes: 540, price: 780, seatsAvailable: 18, departure: '18:30', busName: 'TN Express', type: 'AC Sleeper', rating: '4.8' },
  { id: 'r2', from: 'Chennai', to: 'Coimbatore', distanceKm: 512, durationMinutes: 550, price: 820, seatsAvailable: 12, departure: '19:00', busName: 'Kovai Star', type: 'Semi Sleeper', rating: '4.7' },
  { id: 'r3', from: 'Chennai', to: 'Salem', distanceKm: 343, durationMinutes: 360, price: 590, seatsAvailable: 9, departure: '20:15', busName: 'Salem Silverline', type: 'AC Sleeper', rating: '4.6' },
  { id: 'r4', from: 'Chennai', to: 'Tiruchirappalli', distanceKm: 332, durationMinutes: 345, price: 620, seatsAvailable: 14, departure: '21:00', busName: 'Delta Travels', type: 'Volvo AC', rating: '4.9' },
  { id: 'r5', from: 'Madurai', to: 'Coimbatore', distanceKm: 215, durationMinutes: 270, price: 480, seatsAvailable: 11, departure: '20:30', busName: 'Kongu Connect', type: 'AC Sleeper', rating: '4.6' },
  { id: 'r6', from: 'Coimbatore', to: 'Chennai', distanceKm: 512, durationMinutes: 555, price: 850, seatsAvailable: 7, departure: '19:45', busName: 'Western Ghats', type: 'Volvo AC', rating: '4.9' },
  { id: 'r7', from: 'Chennai', to: 'Tirunelveli', distanceKm: 623, durationMinutes: 660, price: 990, seatsAvailable: 16, departure: '18:00', busName: 'Nellai Night Rider', type: 'AC Sleeper', rating: '4.7' },
  { id: 'r8', from: 'Vellore', to: 'Chennai', distanceKm: 140, durationMinutes: 165, price: 350, seatsAvailable: 20, departure: '17:30', busName: 'Palar Express', type: 'AC Seater', rating: '4.5' },
  { id: 'r9', from: 'Chennai', to: 'Erode', distanceKm: 400, durationMinutes: 450, price: 710, seatsAvailable: 13, departure: '20:45', busName: 'Cauvery Travels', type: 'Semi Sleeper', rating: '4.6' },
  { id: 'r10', from: 'Thanjavur', to: 'Chennai', distanceKm: 320, durationMinutes: 360, price: 650, seatsAvailable: 10, departure: '21:15', busName: 'Chola Roadways', type: 'AC Sleeper', rating: '4.8' },
];
const seededBookings = [
  { id: 'BT-240618', bus: 'TN Express', from: 'Chennai', to: 'Madurai', date: 'Today', seats: ['U1', 'U2'], amount: 1640, status: 'Confirmed' },
];
const seatRows = [1, 2, 3, 4, 5, 6];
const formatTime = (time) => {
  const timePart = String(time || '00:00').split('T').at(-1).slice(0, 5);
  const [hour, minute] = timePart.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`;
};
const durationLabel = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

function App() {
  const [routes, setRoutes] = useState(sampleRoutes);
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedRole, setSelectedRole] = useState('passenger');
  const [showTrips, setShowTrips] = useState(false);
  const [origin, setOrigin] = useState('Chennai');
  const [destination, setDestination] = useState('Madurai');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().slice(0, 10));
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [activeRoute, setActiveRoute] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('search');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [passenger, setPassenger] = useState({ name: '', phone: '', email: '' });
  const [booking, setBooking] = useState(null);
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bustrack-bookings')) || seededBookings; }
    catch { return seededBookings; }
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const load = async (path, setter) => {
      try {
        const response = await fetch(`${API_URL}${path}`);
        if (!response.ok) return;
        const data = await response.json();
        setter(data);
      } catch {
        // Demo data keeps the app useful while the free API host is waking up.
      }
    };
    load('/routes', (data) => {
      if (Array.isArray(data) && data.length) {
        setRoutes(sampleRoutes.map((fallback) => data.find((route) => route.id === fallback.id) || fallback));
      }
    });
    load('/trips', setTrips);
    load('/dashboard/admin', setSummary);
  }, []);

  useEffect(() => {
    localStorage.setItem('bustrack-bookings', JSON.stringify(bookings));
  }, [bookings]);

  const matchingRoutes = useMemo(() => {
    const matches = routes.filter((route) => route.from === origin && route.to === destination);
    const sorted = [...matches];
    if (sortBy === 'price') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'departure') sorted.sort((a, b) => a.departure.localeCompare(b.departure));
    return sorted;
  }, [destination, origin, routes, sortBy]);

  const fare = activeRoute ? selectedSeats.length * activeRoute.price : 0;
  const serviceFee = selectedSeats.length ? 35 : 0;
  const total = fare + serviceFee;

  function searchRoutes(event) {
    event.preventDefault();
    if (origin === destination) {
      setNotice('Choose two different cities to find buses.');
      return;
    }
    setNotice('');
    setSearched(true);
  }

  function beginBooking(route) {
    setActiveRoute(route);
    setSelectedSeats([]);
    setCheckoutStep('seats');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleSeat(seat) {
    setSelectedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat]);
  }

  function confirmPayment(event) {
    event.preventDefault();
    if (!passenger.name.trim() || !/^[0-9+\s-]{8,15}$/.test(passenger.phone)) {
      setNotice('Enter your name and a valid phone number to continue.');
      return;
    }
    const confirmed = {
      id: `BT-${Date.now().toString().slice(-6)}`,
      bus: activeRoute.busName,
      from: activeRoute.from,
      to: activeRoute.to,
      date: travelDate,
      seats: selectedSeats,
      amount: total,
      status: 'Confirmed',
      passenger: passenger.name,
    };
    setBooking(confirmed);
    setBookings((current) => [confirmed, ...current]);
    setCheckoutStep('success');
    setNotice('');
  }

  function returnToSearch() {
    setCheckoutStep('search');
    setActiveRoute(null);
    setSelectedSeats([]);
    setShowTrips(false);
  }

  function renderSearchPage() {
    return <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" />YOUR NEXT JOURNEY, MADE EASY</div>
          <h1>Good trips start<br />with <em>BusTrack.</em></h1>
          <p>Thoughtful travel across Tamil Nadu. Find your ride, pick your seat, and go.</p>
          <div className="hero-note"><span>✦</span> 24/7 journey support <span className="note-divider" /> Easy mobile tickets</div>
        </div>
        <div className="hero-art" aria-label="Illustration of a bus on a Tamil Nadu road">
          <div className="sun-disc" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="road"><span className="road-dashes" /></div>
          <div className="art-palms"><i /><i /><i /></div>
          <div className="illustrated-bus"><div className="bus-window"><i /><i /><i /></div><div className="bus-front-window" /><div className="bus-light" /><div className="wheel wheel-one" /><div className="wheel wheel-two" /><span>BUS TRACK</span></div>
          <div className="art-location"><span>●</span> TAMIL NADU</div>
        </div>
        <div className="hero-stats"><div><strong>10+</strong><span>city connections</span></div><b /><div><strong>Easy</strong><span>seat selection</span></div><b /><div><strong>Live</strong><span>trip updates</span></div></div>
      </section>

      <form className="search-panel" onSubmit={searchRoutes}>
        <div className="search-panel-heading"><div><span className="section-kicker">PLAN YOUR RIDE</span><h2>Where are you headed?</h2></div><span className="search-aside">A better journey is one search away.</span></div>
        <div className="search-fields">
          <label><span>FROM</span><select value={origin} onChange={(event) => setOrigin(event.target.value)}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
          <button type="button" className="swap-button" aria-label="Swap cities" onClick={() => { setOrigin(destination); setDestination(origin); }}>⇄</button>
          <label><span>TO</span><select value={destination} onChange={(event) => setDestination(event.target.value)}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
          <label><span>JOURNEY DATE</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={travelDate} onChange={(event) => setTravelDate(event.target.value)} /></label>
          <button className="primary-button search-button" type="submit"><span>Find buses</span><span aria-hidden="true">↗</span></button>
        </div>
        {notice && checkoutStep === 'search' && <p className="inline-notice">{notice}</p>}
      </form>

      <section className="routes-section" id="routes">
        <div className="section-heading"><div><span className="section-kicker">MADE FOR THE ROAD</span><h2>{searched ? `${origin} to ${destination}` : 'Popular journeys'}</h2><p>{searched ? `Buses running on ${travelDate}` : 'A few routes our travellers love.'}</p></div><label className="sort-control">Sort by <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="recommended">Recommended</option><option value="price">Lowest price</option><option value="departure">Departure</option></select></label></div>
        <div className="route-list">
          {(searched ? matchingRoutes : routes.slice(0, 6)).map((route, index) => <article className="route-card" key={route.id} style={{ animationDelay: `${index * 65}ms` }}>
            <div className="route-operator"><div className="operator-mark">{route.busName.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><div><strong>{route.busName}</strong><span>{route.type}</span><small>★ {route.rating || '4.7'} <i>·</i> {route.distanceKm} km</small></div></div>
            <div className="route-timeline"><div><strong>{formatTime(route.departure)}</strong><span>{route.from}</span></div><div className="route-duration"><span>{durationLabel(route.durationMinutes)}</span><i /><small>{route.distanceKm} km</small></div><div><strong>{formatTime(route.departure)}</strong><span>{route.to}</span></div></div>
            <div className="route-price"><span>from</span><strong>₹{route.price.toLocaleString('en-IN')}</strong><small>{route.seatsAvailable} seats left</small></div>
            <button className="outline-button" onClick={() => beginBooking(route)}>Choose seats <span>→</span></button>
          </article>)}
          {searched && matchingRoutes.length === 0 && <div className="empty-results"><span>↗</span><h3>No direct buses found yet</h3><p>Try a popular route or change your cities.</p><button className="outline-button" onClick={() => { setOrigin('Chennai'); setDestination('Madurai'); setSearched(false); }}>Explore popular routes</button></div>}
        </div>
      </section>
      <section className="bottom-note"><div className="bottom-note-icon">✳</div><div><strong>Travel with a little more peace of mind.</strong><p>See your trip details, keep your ticket close, and enjoy the ride.</p></div><span>BUILT FOR TAMIL NADU <b>↗</b></span></section>
    </>;
  }

  function renderSeatPage() {
    const unavailableSeats = ['U4', 'U9', 'L3', 'L8'];
    const renderDeck = (deck, label) => <div className="seat-deck"><span className="deck-label">{label}</span><div className="seat-rows">{seatRows.map((row) => <div className="seat-row" key={`${deck}${row}`}><button type="button" className={`seat ${unavailableSeats.includes(`${deck}${row}`) ? 'occupied' : ''} ${selectedSeats.includes(`${deck}${row}`) ? 'selected' : ''}`} disabled={unavailableSeats.includes(`${deck}${row}`)} onClick={() => toggleSeat(`${deck}${row}`)} title={`Seat ${deck}${row}`}>{deck}{row}</button><span className="aisle" />{[row + 6].map((seatNum) => <button type="button" key={`${deck}${seatNum}`} className={`seat ${unavailableSeats.includes(`${deck}${seatNum}`) ? 'occupied' : ''} ${selectedSeats.includes(`${deck}${seatNum}`) ? 'selected' : ''}`} disabled={unavailableSeats.includes(`${deck}${seatNum}`)} onClick={() => toggleSeat(`${deck}${seatNum}`)} title={`Seat ${deck}${seatNum}`}>{deck}{seatNum}</button>)}</div>)}</div></div>;
    return <section className="checkout-page">
      <button className="back-link" onClick={returnToSearch}>← Back to buses</button>
      <div className="checkout-heading"><div><span className="section-kicker">YOUR JOURNEY</span><h1>Pick your <em>seat.</em></h1><p>Choose your spot and we’ll take it from here.</p></div><div className="step-track"><span className="step-current">1 <small>Seats</small></span><i /><span>2 <small>Details</small></span><i /><span>3 <small>Payment</small></span></div></div>
      <div className="checkout-grid"><div className="seat-panel"><div className="seat-panel-top"><div><span className="section-kicker">{activeRoute.busName.toUpperCase()}</span><h2>{activeRoute.from} <span>→</span> {activeRoute.to}</h2><p>{formatTime(activeRoute.departure)} · {durationLabel(activeRoute.durationMinutes)} · {travelDate}</p></div><span className="bus-type-tag">{activeRoute.type}</span></div><div className="bus-cabin"><div className="driver-cabin"><span>DRIVER</span><span className="steering">◉</span></div>{renderDeck('U', 'UPPER DECK')}<div className="deck-separator" /><div className="lower-deck-label">LOWER DECK</div>{renderDeck('L', 'LOWER')}</div><div className="seat-legend"><span><i className="legend-available" /> Available</span><span><i className="legend-selected" /> Selected</span><span><i className="legend-occupied" /> Taken</span></div></div>
        <aside className="fare-panel"><span className="section-kicker">FARE SUMMARY</span><h2>Your seat, your journey.</h2><div className="fare-route"><strong>{formatTime(activeRoute.departure)}</strong><span>{activeRoute.from} <i>→</i> {activeRoute.to}</span></div><div className="fare-line"><span>Seats selected</span><strong>{selectedSeats.length ? selectedSeats.join(', ') : 'None yet'}</strong></div><div className="fare-line"><span>Seat fare × {selectedSeats.length}</span><strong>₹{fare.toLocaleString('en-IN')}</strong></div><div className="fare-line"><span>Convenience fee</span><strong>₹{serviceFee}</strong></div><div className="fare-total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><button className="primary-button full-button" disabled={!selectedSeats.length} onClick={() => { setCheckoutStep('details'); setNotice(''); }}>Continue to details <span>→</span></button><p className="secure-note">⌑ Secure checkout · Demo booking</p></aside>
      </div>
    </section>;
  }

  function renderDetailsPage() {
    return <section className="checkout-page"><button className="back-link" onClick={() => setCheckoutStep('seats')}>← Back to seat selection</button><div className="checkout-heading"><div><span className="section-kicker">PASSENGER DETAILS</span><h1>Almost <em>there.</em></h1><p>Who’s coming along for the ride?</p></div><div className="step-track"><span className="step-done">✓ <small>Seats</small></span><i /><span className="step-current">2 <small>Details</small></span><i /><span>3 <small>Payment</small></span></div></div><div className="checkout-grid"><form className="details-panel" onSubmit={(event) => { event.preventDefault(); if (!passenger.name.trim() || !/^[0-9+\s-]{8,15}$/.test(passenger.phone)) { setNotice('Enter your name and a valid phone number to continue.'); return; } setNotice(''); setCheckoutStep('payment'); }}><span className="section-kicker">TICKET CONTACT</span><h2>Tell us who’s travelling.</h2><label>Full name<input required autoComplete="name" placeholder="Name on the ticket" value={passenger.name} onChange={(event) => setPassenger({ ...passenger, name: event.target.value })} /></label><label>Mobile number<input required inputMode="tel" autoComplete="tel" placeholder="Your 10-digit number" value={passenger.phone} onChange={(event) => setPassenger({ ...passenger, phone: event.target.value })} /></label><label>Email address <span className="optional">OPTIONAL</span><input type="email" autoComplete="email" placeholder="For your booking confirmation" value={passenger.email} onChange={(event) => setPassenger({ ...passenger, email: event.target.value })} /></label>{notice && <p className="inline-notice">{notice}</p>}<button className="primary-button full-button">Continue to payment <span>→</span></button></form><aside className="fare-panel summary-panel"><span className="section-kicker">TRIP SUMMARY</span><h2>{activeRoute.from} <span>→</span> {activeRoute.to}</h2><div className="summary-bus"><div className="operator-mark">{activeRoute.busName.slice(0, 2).toUpperCase()}</div><div><strong>{activeRoute.busName}</strong><span>{activeRoute.type}</span></div></div><div className="fare-line"><span>Journey date</span><strong>{travelDate}</strong></div><div className="fare-line"><span>Departure</span><strong>{formatTime(activeRoute.departure)}</strong></div><div className="fare-line"><span>Selected seats</span><strong>{selectedSeats.join(', ')}</strong></div><div className="fare-total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div></aside></div></section>;
  }

  function renderPaymentPage() {
    return <section className="checkout-page"><button className="back-link" onClick={() => setCheckoutStep('details')}>← Back to passenger details</button><div className="checkout-heading"><div><span className="section-kicker">PAYMENT</span><h1>One last <em>step.</em></h1><p>Choose a payment option for your demo booking.</p></div><div className="step-track"><span className="step-done">✓ <small>Seats</small></span><i /><span className="step-done">✓ <small>Details</small></span><i /><span className="step-current">3 <small>Payment</small></span></div></div><div className="checkout-grid"><div className="details-panel"><span className="section-kicker">PAYMENT METHOD</span><h2>How would you like to pay?</h2><div className="payment-options">{['UPI', 'Card', 'Net banking'].map((method) => <button type="button" key={method} className={`payment-option ${paymentMethod === method ? 'chosen' : ''}`} onClick={() => setPaymentMethod(method)}><span className="payment-symbol">{method === 'UPI' ? '⌁' : method === 'Card' ? '▤' : '⌂'}</span><strong>{method}</strong><span>{paymentMethod === method ? '✓' : ''}</span></button>)}</div><div className="demo-payment-note"><span>i</span><p><strong>Demo checkout</strong><br />No money is charged. This prototype confirms a sample booking locally.</p></div><button className="primary-button full-button" onClick={confirmPayment}>Confirm demo booking · ₹{total.toLocaleString('en-IN')} <span>→</span></button><p className="secure-note">By continuing, you agree to the sample booking terms.</p>{notice && <p className="inline-notice">{notice}</p>}</div><aside className="fare-panel summary-panel"><span className="section-kicker">PAYMENT SUMMARY</span><h2>{activeRoute.from} <span>→</span> {activeRoute.to}</h2><div className="summary-bus"><div className="operator-mark">{activeRoute.busName.slice(0, 2).toUpperCase()}</div><div><strong>{activeRoute.busName}</strong><span>{activeRoute.type}</span></div></div><div className="fare-line"><span>Passenger</span><strong>{passenger.name || '—'}</strong></div><div className="fare-line"><span>Seats</span><strong>{selectedSeats.join(', ')}</strong></div><div className="fare-line"><span>Payment method</span><strong>{paymentMethod}</strong></div><div className="fare-total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div></aside></div></section>;
  }

  function renderSuccessPage() {
    return <section className="success-page"><div className="success-confetti"><span>✦</span><span>✳</span><span>✧</span></div><div className="success-check">✓</div><span className="section-kicker">ALL ABOARD</span><h1>Your trip is <em>booked.</em></h1><p className="success-intro">Your demo ticket is ready, {booking?.passenger}. Have a lovely journey.</p><article className="ticket-card"><div className="ticket-head"><div><span>BUS TRACK · E-TICKET</span><strong>{booking?.id}</strong></div><div className="ticket-stamp">DEMO<br />TICKET</div></div><div className="ticket-cities"><div><span>FROM</span><strong>{booking?.from}</strong><small>{activeRoute && formatTime(activeRoute.departure)}</small></div><div className="ticket-road">━━━━●━━━━</div><div><span>TO</span><strong>{booking?.to}</strong><small>{durationLabel(activeRoute.durationMinutes)} journey</small></div></div><div className="ticket-details"><div><span>TRAVELLER</span><strong>{booking?.passenger}</strong></div><div><span>SEATS</span><strong>{booking?.seats.join(', ')}</strong></div><div><span>DATE</span><strong>{booking?.date}</strong></div><div><span>PAID VIA</span><strong>{paymentMethod} · Demo</strong></div></div></article><div className="success-actions"><button className="primary-button" onClick={returnToSearch}>Explore more journeys <span>→</span></button><button className="text-button" onClick={() => { setSelectedRole('passenger'); setCheckoutStep('search'); setActiveRoute(null); setShowTrips(true); }}>View my trips</button></div><p className="demo-footnote">This is a sample booking for your project demo. No payment was taken.</p></section>;
  }

  function renderPassengerView() {
    if (showTrips) return <section className="dashboard-page my-trips-page"><button className="back-link" onClick={() => setShowTrips(false)}>← Back to journeys</button><div className="dashboard-heading"><div><span className="section-kicker">YOUR BUS TRACK TICKETS</span><h1>Journeys to <em>remember.</em></h1><p>Your demo bookings saved on this device.</p></div><button className="primary-button" onClick={() => setShowTrips(false)}>Find another bus <span>→</span></button></div><div className="my-trips-list">{bookings.map((item) => <article className="my-trip-card" key={item.id}><div className="my-trip-mark">{item.bus.slice(0, 2).toUpperCase()}</div><div className="my-trip-main"><div className="my-trip-top"><strong>{item.from} <i>→</i> {item.to}</strong><span className="status-label status-running">{item.status}</span></div><p>{item.bus} · {item.date}</p><small>Seat {item.seats.join(', ')} · Ticket {item.id}</small></div><div className="my-trip-amount"><span>BOOKING TOTAL</span><strong>₹{item.amount.toLocaleString('en-IN')}</strong></div></article>)}{bookings.length === 0 && <div className="empty-results"><span>✳</span><h3>Your next journey starts here</h3><p>Search routes and book a seat to see it here.</p><button className="outline-button" onClick={() => setShowTrips(false)}>Explore buses</button></div>}</div><p className="demo-footnote">Demo tickets are saved only in this browser on this device.</p></section>;
    if (checkoutStep === 'seats' && activeRoute) return renderSeatPage();
    if (checkoutStep === 'details' && activeRoute) return renderDetailsPage();
    if (checkoutStep === 'payment' && activeRoute) return renderPaymentPage();
    if (checkoutStep === 'success' && booking) return renderSuccessPage();
    return renderSearchPage();
  }

  function renderDriverView() {
    return <section className="dashboard-page"><div className="dashboard-heading"><div><span className="section-kicker">DRIVER SPACE</span><h1>Good evening, <em>Arun.</em></h1><p>Your next run, at a glance.</p></div><span className="driver-status"><i /> ON DUTY</span></div><div className="driver-layout"><div className="driver-main"><article className="driver-trip-card"><div className="trip-card-head"><span className="section-kicker">TODAY · ASSIGNED TRIP</span><span className="live-pill"><i /> GPS SIMULATION</span></div><h2>Chennai <span>→</span> Madurai</h2><p>TN Express · TN 38 AB 2468</p><div className="driver-route-line"><div><strong>18:30</strong><span>Chennai</span></div><i /><div><strong>03:30</strong><span>Madurai</span></div></div><div className="driver-trip-meta"><span>460 km <b>·</b> 9h journey</span><span>18 passengers</span></div><button className="primary-button" onClick={() => setNotice(notice === 'Trip status updated to in transit.' ? 'Trip status updated to completed.' : 'Trip status updated to in transit.')}>{notice.includes('in transit') ? 'Complete trip' : 'Start trip'} <span>→</span></button>{notice && <p className="inline-notice">{notice}</p>}</article><div className="driver-section-head"><h2>Trip checklist</h2><span>3 steps</span></div>{['Vehicle inspection completed', 'Passenger boarding & seat check', 'Start GPS trip simulation'].map((item, index) => <div className="checklist-item" key={item}><span className={index === 0 ? 'checked' : ''}>{index === 0 ? '✓' : index + 1}</span><strong>{item}</strong><small>{index === 0 ? 'DONE' : 'PENDING'}</small></div>)}</div><aside className="driver-side"><div className="panel-heading"><div className="operator-mark">GPS</div><div><strong>Live location</strong><span>Trip t1 · simulated data</span></div></div><div className="mini-map"><div className="map-river" /><div className="map-road-line" /><span className="map-start">CHENNAI</span><span className="map-end">MADURAI</span><span className="map-bus-pin">▰</span></div><div className="gps-readings"><div><span>SPEED</span><strong>{trips[0]?.speedKmh || 64} <small>km/h</small></strong></div><div><span>GPS STATUS</span><strong className="gps-on"><i /> Connected</strong></div><div><span>LOCATION</span><strong>{trips[0]?.currentLat || '13.08'}, {trips[0]?.currentLng || '80.27'}</strong></div></div><button className="outline-button full-button" onClick={() => setNotice('Location refreshed from demo trip feed.')}>Refresh location ↻</button></aside></div></section>;
  }

  function renderAdminView() {
    const stats = [
      { label: 'ACTIVE TRIPS', value: summary?.activeTrips ?? 1, trend: 'Fleet on the move' },
      { label: 'ROUTES TODAY', value: summary?.totalRoutes ?? routes.length, trend: 'Across Tamil Nadu' },
      { label: 'DEMO BOOKINGS', value: bookings.length, trend: 'On this device' },
      { label: 'DEMO REVENUE', value: `₹${bookings.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}`, trend: 'Sample data only' },
    ];
    return <section className="dashboard-page"><div className="dashboard-heading"><div><span className="section-kicker">OPERATIONS OVERVIEW</span><h1>Fleet at a <em>glance.</em></h1><p>Welcome back. Here’s what’s happening today.</p></div><button className="outline-button" onClick={() => { setSearched(false); setSelectedRole('passenger'); }}>＋ Add a route</button></div><div className="admin-stats">{stats.map((stat) => <article className="admin-stat" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>↗ {stat.trend}</small></article>)}</div><div className="admin-layout"><section className="admin-routes"><div className="admin-table-heading"><div><h2>Today’s routes</h2><p>Scheduled services across the network</p></div><span>{routes.length} services</span></div>{routes.slice(0, 7).map((route, index) => <article className="admin-route-row" key={route.id}><span className="route-number">0{index + 1}</span><div className="admin-route-name"><strong>{route.from} <i>→</i> {route.to}</strong><span>{route.busName} · {route.type}</span></div><span className="admin-route-time">{formatTime(route.departure)}</span><span className={`status-label ${index === 0 ? 'status-running' : 'status-scheduled'}`}>{index === 0 ? 'In transit' : 'Scheduled'}</span><span className="admin-fare">₹{route.price}</span></article>)}</section><aside className="admin-side"><span className="section-kicker">FLEET ACTIVITY</span><h2>On the road</h2><div className="activity-map"><div className="activity-route" /><span className="activity-dot dot-one" /><span className="activity-dot dot-two" /><span className="activity-dot dot-three" /><span className="activity-bus">▰</span><small>COIMBATORE</small><b>MADURAI</b></div><div className="fleet-activity"><span className="fleet-indicator" /><div><strong>TN Express</strong><small>Chennai → Madurai</small></div><span>64 km/h</span></div><div className="fleet-activity"><span className="fleet-indicator scheduled" /><div><strong>Kovai Star</strong><small>Chennai → Coimbatore</small></div><span>Boarding</span></div><p className="admin-data-note">Prototype view · demo data</p></aside></div></section>;
  }

  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => { setSelectedRole('passenger'); returnToSearch(); }} aria-label="BusTrack home"><span className="brand-mark"><span>↗</span></span><span>bus<span className="brand-accent">track</span><small>GO FURTHER, TOGETHER</small></span></button><nav className="main-nav"><button className={selectedRole === 'passenger' ? 'nav-active' : ''} onClick={() => { setSelectedRole('passenger'); returnToSearch(); }}>Find a bus</button><button onClick={() => { setSelectedRole('passenger'); setShowTrips(false); setCheckoutStep('search'); document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' }); }}>Popular routes</button><button onClick={() => { setSelectedRole('passenger'); setCheckoutStep('search'); setActiveRoute(null); setShowTrips(true); setNotice(''); }}>My trips <span className="trip-count">{bookings.length}</span></button></nav><div className="top-actions"><div className="role-menu"><span>DEMO VIEW</span><select aria-label="Choose app view" value={selectedRole} onChange={(event) => { setSelectedRole(event.target.value); setShowTrips(false); setNotice(''); }}><option value="passenger">Passenger</option><option value="driver">Driver</option><option value="admin">Admin</option></select></div><button className="profile-button" title="Demo profile">H</button></div></header>
    {notice && selectedRole === 'passenger' && checkoutStep === 'search' && <div className="global-notice"><span>{notice}</span><button onClick={() => setNotice('')}>×</button></div>}
    <main className="content" key={`${selectedRole}-${checkoutStep}`}>{selectedRole === 'passenger' ? renderPassengerView() : selectedRole === 'driver' ? renderDriverView() : renderAdminView()}</main>
    <footer className="app-footer"><span>© 2026 BusTrack</span><span>Made for journeys across Tamil Nadu <b>✳</b></span><span>DEMO EXPERIENCE</span></footer>
  </div>;
}

export default App;
