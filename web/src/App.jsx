import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const passengerTrips = [
  { id: 't1', bus: 'TN Express', from: 'Chennai', to: 'Madurai', time: '18:30', status: 'Live tracking' },
  { id: 't2', bus: 'Kovai Star', from: 'Chennai', to: 'Coimbatore', time: '19:00', status: 'On time' },
];

const driverTrips = [
  { id: 'd1', route: 'Chennai → Madurai', status: 'Trip started', eta: '1h 40m left' },
  { id: 'd2', route: 'Chennai → Coimbatore', status: 'Waiting at depot', eta: 'Boarding 18:50' },
];

const adminStats = [
  { label: 'Active buses', value: '24' },
  { label: 'Passengers today', value: '1,280' },
  { label: 'Revenue', value: '₹4.8L' },
  { label: 'Delayed trips', value: '02' },
];

function App() {
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedRole, setSelectedRole] = useState('passenger');

  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then((res) => res.json())
      .then((data) => setRoutes(data));

    fetch(`${API_URL}/trips`)
      .then((res) => res.json())
      .then((data) => setTrips(data));

    fetch(`${API_URL}/dashboard/admin`)
      .then((res) => res.json())
      .then((data) => setSummary(data));
  }, []);

  const renderPassengerView = () => (
    <div className="panel-grid">
      <div className="panel large-panel">
        <h3>Search intercity routes</h3>
        <div className="search-box">
          <input value="Chennai" readOnly />
          <span>→</span>
          <input value="Madurai" readOnly />
        </div>
        <div className="route-list">
          {routes.map((route) => (
            <div className="route-card" key={route.id}>
              <div>
                <h4>{route.from} → {route.to}</h4>
                <p>{route.busName} · {route.type}</p>
                <small>{route.departure}</small>
              </div>
              <div className="route-meta">
                <strong>₹{route.price}</strong>
                <span>{route.seatsAvailable} seats left</span>
                <button>Book ticket</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>My trips</h3>
        {passengerTrips.map((trip) => (
          <div className="mini-card" key={trip.id}>
            <strong>{trip.bus}</strong>
            <p>{trip.from} → {trip.to}</p>
            <small>{trip.time}</small>
            <span className="badge">{trip.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDriverView = () => (
    <div className="panel-grid">
      <div className="panel large-panel">
        <h3>Assigned routes</h3>
        {driverTrips.map((trip) => (
          <div className="mini-card" key={trip.id}>
            <strong>{trip.route}</strong>
            <p>{trip.status}</p>
            <small>{trip.eta}</small>
            <button>Update status</button>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>Live GPS status</h3>
        {trips.map((trip) => (
          <div className="mini-card" key={trip.id}>
            <strong>Trip {trip.id}</strong>
            <p>Status: {trip.status}</p>
            <small>{trip.speedKmh} km/h</small>
            <span className="badge live">Live</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="panel-grid">
      <div className="stats-grid">
        {adminStats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="panel large-panel">
        <h3>Fleet overview</h3>
        {summary && (
          <div className="summary-box">
            <p>Total routes: <strong>{summary.totalRoutes}</strong></p>
            <p>Active trips: <strong>{summary.activeTrips}</strong></p>
            <p>Bookings today: <strong>{summary.bookingsToday}</strong></p>
            <p>Revenue: <strong>₹{summary.revenue}</strong></p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Tamil Nadu intercity mobility</p>
          <h1>BusTrack</h1>
        </div>
        <div className="role-switcher">
          {['passenger', 'driver', 'admin'].map((role) => (
            <button
              key={role}
              className={selectedRole === role ? 'active' : ''}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </header>

      <main className="content">
        {selectedRole === 'passenger' && renderPassengerView()}
        {selectedRole === 'driver' && renderDriverView()}
        {selectedRole === 'admin' && renderAdminView()}
      </main>
    </div>
  );
}

export default App;
