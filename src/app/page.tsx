"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Bell, CalendarDays, Check, ChevronDown, Clock3, CreditCard, Download, Filter, HeartPulse, LayoutDashboard, Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles, WalletCards, X } from "lucide-react";
import { Booking, bookingStatusMeta, calculateRevenue, getAvailableSlots, initialBookings, paymentStatusMeta, services } from "@/lib/domain";

type View = "dashboard" | "book" | "appointments" | "services" | "reports";

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "book", label: "Book appointment", icon: CalendarDays },
  { id: "appointments", label: "Appointments", icon: Clock3 },
  { id: "services", label: "Our services", icon: Sparkles },
  { id: "reports", label: "Reports & revenue", icon: WalletCards },
];

function StatusBadge({ status }: { status: Booking["status"] }) {
  const meta = bookingStatusMeta[status];
  return <span className={`status-badge ${meta.className}`}><span className="status-dot" />{meta.label}</span>;
}

function PaymentBadge({ status }: { status: Booking["paymentStatus"] }) {
  const meta = paymentStatusMeta[status];
  return <span className={`payment-badge ${meta.className}`}>{meta.label}</span>;
}

function Avatar({ initials, tone = "lavender" }: { initials: string; tone?: string }) {
  return <span className={`avatar avatar-${tone}`}>{initials}</span>;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedService, setSelectedService] = useState("cleaning");
  const [selectedDate, setSelectedDate] = useState("Tomorrow, Aug 29");
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [toast, setToast] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const revenue = calculateRevenue(bookings);
  const filteredBookings = useMemo(() => bookings.filter((booking) => booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) || booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase())), [bookings, searchQuery]);
  const displayName = view === "dashboard" ? "Good morning, Alex" : navItems.find((item) => item.id === view)?.label ?? "Executive Dental";

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  function createBooking() {
    const service = services.find((item) => item.id === selectedService)!;
    const newBooking: Booking = { id: `b${Date.now()}`, reference: `ED-2408-${Math.floor(100 + Math.random() * 899)}`, customer: "Alex Morgan", customerEmail: "alex@example.com", serviceId: selectedService, serviceName: service.name, staff: "To be assigned", date: selectedDate.replace("Tomorrow, ", ""), time: selectedTime, durationMinutes: service.durationMinutes, status: "PENDING", paymentStatus: "UNPAID", amount: service.price };
    setBookings((current) => [newBooking, ...current]);
    setView("appointments");
    notify("Your booking request is in — pending staff approval.");
  }

  function confirmBooking(id: string) {
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: "CONFIRMED" } : booking));
    notify("Booking approved and customer notified.");
  }

  function markPaid(id: string) {
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, paymentStatus: "PAID" } : booking));
    notify("Payment status recorded as paid.");
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><HeartPulse size={20} strokeWidth={2.5} /></div><div><div className="brand-name">executive<span>.</span></div><div className="brand-sub">DENTAL STUDIO</div></div></div>
        <div className="clinic-switcher"><div className="clinic-avatar">ED</div><div><strong>Executive Dental</strong><small>Clinic workspace</small></div><ChevronDown size={15} /></div>
        <p className="nav-heading">WORKSPACE</p>
        <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => { setView(id); setMobileNav(false); }}><Icon size={18} /><span>{label}</span>{id === "appointments" && <span className="nav-count">3</span>}</button>)}</nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-help"><div className="help-icon"><MessageCircle size={17} /></div><div><strong>Need a hand?</strong><small>Our concierge is here</small></div><ArrowRight size={15} /></div>
        <button className="nav-item"><Settings2 size={18} /><span>Settings</span></button>
        <div className="profile-row"><Avatar initials="AM" tone="mint" /><div><strong>Alex Morgan</strong><small>Patient account</small></div><MoreHorizontal size={17} /></div>
      </aside>

      <section className="content-area">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav((open) => !open)}><Menu size={21} /></button><div className="breadcrumb">Executive Dental <span>/</span> <b>{displayName}</b></div><div className="top-actions"><button className="icon-button"><Bell size={19} /><span className="notification-dot" /></button><div className="top-avatar"><Avatar initials="AM" tone="mint" /></div></div></header>
        <div className="page-content">
          {view === "dashboard" && <Dashboard bookings={bookings} revenue={revenue} onBook={() => setView("book")} onViewAppointments={() => setView("appointments")} />}
          {view === "book" && <BookingFlow selectedService={selectedService} setSelectedService={setSelectedService} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedTime={selectedTime} setSelectedTime={setSelectedTime} onSubmit={createBooking} />}
          {view === "appointments" && <Appointments bookings={filteredBookings} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onConfirm={confirmBooking} onPaid={markPaid} onBook={() => setView("book")} />}
          {view === "services" && <Services showAll={showAllServices} setShowAll={setShowAllServices} onBook={(id) => { setSelectedService(id); setView("book"); }} />}
          {view === "reports" && <Reports bookings={bookings} revenue={revenue} />}
        </div>
      </section>
      {toast && <div className="toast"><div className="toast-check"><Check size={15} /></div>{toast}<button onClick={() => setToast("")}><X size={15} /></button></div>}
    </main>
  );
}

function Dashboard({ bookings, revenue, onBook, onViewAppointments }: { bookings: Booking[]; revenue: number; onBook: () => void; onViewAppointments: () => void }) {
  const pending = bookings.filter((booking) => booking.status === "PENDING").length;
  return <>
    <div className="welcome-row"><div><p className="eyebrow">Thursday, August 28, 2024</p><h1>Good morning, Alex <span>✦</span></h1><p className="subtext">Your care, thoughtfully scheduled.</p></div><button className="primary-button" onClick={onBook}><Plus size={17} /> Book an appointment</button></div>
    <div className="hero-card"><div className="hero-copy"><div className="eyebrow light">YOUR NEXT VISIT</div><h2>Signature teeth cleaning</h2><div className="hero-details"><span><CalendarDays size={15} /> Tomorrow, Aug 29</span><span><Clock3 size={15} /> 10:30 AM · 60 min</span></div><div className="hero-staff"><Avatar initials="MP" tone="peach" /><span>with <b>Dr. Maya Patel</b></span></div><button className="ghost-button" onClick={onViewAppointments}>View appointment <ArrowRight size={15} /></button></div><div className="hero-art"><div className="sun-disc" /><div className="art-sparkle sparkle-1">✦</div><div className="art-sparkle sparkle-2">✧</div><div className="tooth-illustration">✦</div></div></div>
    <div className="section-heading"><div><h2>At a glance</h2><p>A simple view of your clinic today.</p></div><button className="text-button" onClick={onViewAppointments}>View all activity <ArrowRight size={14} /></button></div>
    <div className="metrics-grid"><Metric icon={<CalendarDays size={19} />} label="Today’s appointments" value="8" trend="+2" accent="blue" /><Metric icon={<Clock3 size={19} />} label="Pending approval" value={String(pending)} trend="Needs attention" accent="amber" /><Metric icon={<Check size={19} />} label="Completed this week" value="32" trend="+12%" accent="green" /><Metric icon={<CreditCard size={19} />} label="Collected revenue" value={`$${revenue.toLocaleString()}`} trend="This month" accent="violet" /></div>
    <div className="clinic-info-strip panel"><div className="clinic-info-item"><div className="info-symbol">⌖</div><div><span>VISIT THE CLINIC</span><strong>Titan Complex Chaka Rd</strong><small>Nairobi, Kenya · <a href="https://maps.app.goo.gl/LtDK34EXWBWP2LP88?g_st=ac" target="_blank" rel="noreferrer">Get directions <ArrowRight size={12} /></a></small></div></div><div className="clinic-info-item"><div className="info-symbol mint">☎</div><div><span>CALL THE CLINIC</span><strong><a href="tel:+254728632498">+254 728 632498</a></strong><small>Our team is happy to help with your visit</small></div></div><div className="clinic-info-item"><div className="info-symbol amber">★</div><div><span>PATIENT RATING</span><strong>4.6 <small className="rating-stars">★★★★★</small></strong><small>Based on 7 Google reviews</small></div></div><div className="clinic-hours"><span>OPENING HOURS</span><strong>Today · 8:00 AM – 5:00 PM</strong><small>Mon–Fri 8:00 AM–5:00 PM · Sat 9:00 AM–1:00 PM · Sun closed</small></div></div>
    <div className="dashboard-grid"><div className="panel upcoming-panel"><div className="panel-heading"><div><h3>Upcoming appointments</h3><p>Next appointments across your clinic</p></div><button className="icon-button small"><MoreHorizontal size={18} /></button></div>{bookings.slice(0, 3).map((booking) => <BookingRow key={booking.id} booking={booking} />)}<button className="panel-footer-button" onClick={onViewAppointments}>See all appointments <ArrowRight size={15} /></button></div><div className="panel chart-panel"><div className="panel-heading"><div><h3>Appointment volume</h3><p>Last 7 days</p></div><button className="select-button">This week <ChevronDown size={14} /></button></div><div className="chart-wrap"><div className="chart-labels"><span>10</span><span>5</span><span>0</span></div><svg viewBox="0 0 400 155" className="line-chart" role="img" aria-label="Appointments trending upward"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a9d8ff" stopOpacity=".48" /><stop offset="100%" stopColor="#a9d8ff" stopOpacity=".02" /></linearGradient></defs><path d="M0 115 C25 105, 35 90, 63 98 S100 120, 125 92 S158 74, 188 89 S215 98, 242 65 S285 75, 309 51 S345 44, 400 28 L400 155 L0 155Z" fill="url(#fill)" /><path d="M0 115 C25 105, 35 90, 63 98 S100 120, 125 92 S158 74, 188 89 S215 98, 242 65 S285 75, 309 51 S345 44, 400 28" fill="none" stroke="#368fe0" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div></div>
  </>;
}

function Metric({ icon, label, value, trend, accent }: { icon: React.ReactNode; label: string; value: string; trend: string; accent: string }) { return <div className="metric-card"><div className={`metric-icon metric-${accent}`}>{icon}</div><div><p>{label}</p><strong>{value}</strong><span className={trend.startsWith("+") ? "trend-up" : "trend-muted"}>{trend}</span></div></div>; }

function BookingRow({ booking }: { booking: Booking }) { return <div className="booking-row"><div className="date-chip"><strong>{booking.date === "Today" ? "28" : booking.date === "Tomorrow" ? "29" : "26"}</strong><small>{booking.date === "Today" ? "AUG" : "AUG"}</small></div><div className="booking-info"><strong>{booking.serviceName}</strong><span>{booking.time} · {booking.customer}</span></div><StatusBadge status={booking.status} /><Avatar initials={booking.customer.split(" ").map((word) => word[0]).join("")} tone="sky" /></div>; }

function BookingFlow({ selectedService, setSelectedService, selectedDate, setSelectedDate, selectedTime, setSelectedTime, onSubmit }: { selectedService: string; setSelectedService: (id: string) => void; selectedDate: string; setSelectedDate: (date: string) => void; selectedTime: string; setSelectedTime: (time: string) => void; onSubmit: () => void }) {
  const service = services.find((item) => item.id === selectedService)!; const slots = getAvailableSlots(selectedDate, selectedService);
  return <div className="flow-page"><div className="flow-head"><div><p className="eyebrow">NEW APPOINTMENT</p><h1>Make time for your smile.</h1><p className="subtext">Choose a service and a time that works for you.</p></div><div className="step-indicator"><span className="step-active">1</span><i /><span>2</span><i /><span>3</span></div></div><div className="booking-layout"><div className="form-panel"><div className="form-section"><div className="section-number">01</div><div className="form-section-body"><h3>Select a service</h3><p>What can we help you with today?</p><div className="service-options">{services.map((item) => <button key={item.id} className={`service-option ${selectedService === item.id ? "selected" : ""}`} onClick={() => setSelectedService(item.id)}><span className={`option-icon ${item.tone}`}>{item.icon}</span><span><strong>{item.name}</strong><small>{item.durationMinutes} min · ${item.price}</small></span>{selectedService === item.id && <Check size={17} className="option-check" />}</button>)}</div></div></div><div className="form-section"><div className="section-number">02</div><div className="form-section-body"><h3>Choose a date</h3><p>All times shown in your local timezone.</p><div className="date-options">{["Today, Aug 28", "Tomorrow, Aug 29", "Fri, Aug 30"].map((date) => <button key={date} className={selectedDate === date ? "selected" : ""} onClick={() => setSelectedDate(date)}><small>{date.split(",")[0]}</small><strong>{date.match(/\d+/)?.[0]}</strong></button>)}</div></div></div><div className="form-section"><div className="section-number">03</div><div className="form-section-body"><h3>Choose a time</h3><p>Available times for {service.durationMinutes} minute appointment.</p><div className="time-options">{slots.map((time) => <button key={time} className={selectedTime === time ? "selected" : ""} onClick={() => setSelectedTime(time)}>{time}</button>)}</div></div></div><div className="form-section notes-section"><div className="section-number">04</div><div className="form-section-body"><h3>Anything we should know?</h3><p>Optional notes for your care team.</p><textarea placeholder="Share any preferences or questions..." /></div></div></div><aside className="booking-summary"><p className="eyebrow">YOUR APPOINTMENT</p><div className="summary-icon">{service.icon}</div><h2>{service.name}</h2><p>{service.description}</p><div className="summary-line"><span><CalendarDays size={15} /> {selectedDate.replace(", ", " · ")}</span><span><Clock3 size={15} /> {selectedTime}</span></div><div className="summary-total"><span>Estimated total</span><strong>${service.price}</strong></div><button className="primary-button full" onClick={onSubmit}>Request appointment <ArrowRight size={16} /></button><small className="summary-note"><ShieldCheck size={14} /> No payment is taken today</small></aside></div></div>;
}

function Appointments({ bookings, searchQuery, setSearchQuery, onConfirm, onPaid, onBook }: { bookings: Booking[]; searchQuery: string; setSearchQuery: (value: string) => void; onConfirm: (id: string) => void; onPaid: (id: string) => void; onBook: () => void }) { return <div className="list-page"><div className="page-heading"><div><p className="eyebrow">CLINIC OPERATIONS</p><h1>Appointments</h1><p className="subtext">Manage your upcoming visits and booking requests.</p></div><button className="primary-button" onClick={onBook}><Plus size={17} /> New appointment</button></div><div className="filter-bar"><div className="search-box"><Search size={17} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search patients or services" /></div><button className="filter-button"><Filter size={16} /> Filters <span>2</span></button><button className="filter-button">All dates <ChevronDown size={15} /></button></div><div className="appointment-table panel"><div className="table-header"><span>APPOINTMENT</span><span>PATIENT</span><span>DATE & TIME</span><span>STATUS</span><span>PAYMENT</span><span>ACTION</span></div>{bookings.map((booking) => <div className="table-row" key={booking.id}><div className="table-service"><span className="mini-service-icon">{services.find((item) => item.id === booking.serviceId)?.icon}</span><div><strong>{booking.serviceName}</strong><small>{booking.reference}</small></div></div><div className="patient-cell"><Avatar initials={booking.customer.split(" ").map((word) => word[0]).join("")} tone="sky" /><span><strong>{booking.customer}</strong><small>{booking.customerEmail}</small></span></div><div><strong>{booking.date}</strong><small>{booking.time} · {booking.durationMinutes} min</small></div><div><StatusBadge status={booking.status} /></div><div><PaymentBadge status={booking.paymentStatus} /></div><div className="row-actions">{booking.status === "PENDING" && <button className="tiny-action approve" onClick={() => onConfirm(booking.id)}><Check size={14} /> Approve</button>}{booking.paymentStatus === "UNPAID" && <button className="tiny-action paid" onClick={() => onPaid(booking.id)}>Mark paid</button>}<button className="icon-button small"><MoreHorizontal size={17} /></button></div></div>)}</div></div>; }

function Services({ showAll, setShowAll, onBook }: { showAll: boolean; setShowAll: (value: boolean) => void; onBook: (id: string) => void }) { const visible = showAll ? services : services.slice(0, 3); return <div className="list-page"><div className="page-heading"><div><p className="eyebrow">PERSONALIZED CARE</p><h1>Our services</h1><p className="subtext">Thoughtful dentistry, tailored to your needs.</p></div><button className="text-button"><Download size={15} /> Download price guide</button></div><div className="service-grid">{visible.map((service) => <div className="service-card panel" key={service.id}><div className={`service-card-art ${service.tone}`}><span>{service.icon}</span><div className="art-ring" /></div><div className="service-card-body"><div className="service-meta"><span>{service.durationMinutes} min</span><span>${service.price}</span></div><h3>{service.name}</h3><p>{service.description}</p><button className="outline-button" onClick={() => onBook(service.id)}>Book this service <ArrowRight size={15} /></button></div></div>)}</div><button className="load-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer services" : "View all services"} <ChevronDown size={15} className={showAll ? "rotate-up" : ""} /></button></div>; }

function Reports({ bookings, revenue }: { bookings: Booking[]; revenue: number }) { return <div className="list-page"><div className="page-heading"><div><p className="eyebrow">ADMIN VIEW</p><h1>Reports & revenue</h1><p className="subtext">A clear picture of clinic performance and collected payments.</p></div><button className="filter-button">Aug 1 – Aug 31, 2024 <ChevronDown size={15} /></button></div><div className="report-metrics"><div className="report-card"><span>Collected revenue</span><strong>${revenue.toLocaleString()}</strong><small className="trend-up">+18.4% vs last month</small></div><div className="report-card"><span>Paid appointments</span><strong>{bookings.filter((b) => b.paymentStatus === "PAID").length}</strong><small>of {bookings.length} total bookings</small></div><div className="report-card"><span>Average booking value</span><strong>$146</strong><small className="trend-up">+6.2% vs last month</small></div></div><div className="panel report-chart"><div className="panel-heading"><div><h3>Revenue over time</h3><p>Collected payments by day</p></div><div className="legend"><span className="legend-dot" /> Collected</div></div><div className="big-chart"><div className="chart-labels"><span>$1k</span><span>$500</span><span>$0</span></div><svg viewBox="0 0 800 220" preserveAspectRatio="none"><defs><linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60c4b0" stopOpacity=".42" /><stop offset="100%" stopColor="#60c4b0" stopOpacity=".02" /></linearGradient></defs><path d="M0 180 C70 165, 80 135, 145 150 S210 185, 260 112 S330 145, 380 85 S445 115, 500 92 S570 45, 620 75 S700 55, 800 20 L800 220 L0 220Z" fill="url(#reportFill)" /><path d="M0 180 C70 165, 80 135, 145 150 S210 185, 260 112 S330 145, 380 85 S445 115, 500 92 S570 45, 620 75 S700 55, 800 20" fill="none" stroke="#3aaf9e" strokeWidth="4" strokeLinecap="round" /></svg><div className="chart-days"><span>Aug 1</span><span>Aug 8</span><span>Aug 15</span><span>Aug 22</span><span>Aug 31</span></div></div></div></div>; }
