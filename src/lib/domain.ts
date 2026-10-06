export type Role = "CUSTOMER" | "STAFF" | "ADMIN";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type PaymentStatus = "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "REFUNDED" | "WAIVED";

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  icon: string;
  tone: string;
  isActive: boolean;
};

export type Booking = {
  id: string;
  reference: string;
  customer: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  staff: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  notes?: string;
};

export const services: Service[] = [
  { id: "consultation", name: "New patient consultation", description: "A calm, comprehensive first visit with a personalized care plan.", durationMinutes: 45, price: 85, icon: "✦", tone: "from-sky-100 to-blue-50", isActive: true },
  { id: "cleaning", name: "Signature teeth cleaning", description: "A thorough clean and polish for a healthier, brighter smile.", durationMinutes: 60, price: 120, icon: "✧", tone: "from-teal-100 to-emerald-50", isActive: true },
  { id: "whitening", name: "Executive whitening", description: "Professional whitening designed for a visibly brighter smile.", durationMinutes: 75, price: 260, icon: "◈", tone: "from-amber-100 to-orange-50", isActive: true },
  { id: "filling", name: "Tooth-colored filling", description: "Modern, discreet restorative care to protect and preserve your tooth.", durationMinutes: 90, price: 215, icon: "◇", tone: "from-violet-100 to-fuchsia-50", isActive: true },
];

export const initialBookings: Booking[] = [
  { id: "b1", reference: "ED-2408-019", customer: "Olivia Martin", customerEmail: "olivia@example.com", serviceId: "cleaning", serviceName: "Signature teeth cleaning", staff: "Dr. Maya Patel", date: "Today", time: "09:30 AM", durationMinutes: 60, status: "CONFIRMED", paymentStatus: "PAID", amount: 120 },
  { id: "b2", reference: "ED-2408-020", customer: "Ethan Williams", customerEmail: "ethan@example.com", serviceId: "consultation", serviceName: "New patient consultation", staff: "Dr. Marcus Lee", date: "Today", time: "11:00 AM", durationMinutes: 45, status: "PENDING", paymentStatus: "UNPAID", amount: 85 },
  { id: "b3", reference: "ED-2408-021", customer: "Sophia Chen", customerEmail: "sophia@example.com", serviceId: "whitening", serviceName: "Executive whitening", staff: "Dr. Maya Patel", date: "Tomorrow", time: "02:00 PM", durationMinutes: 75, status: "CONFIRMED", paymentStatus: "PENDING_VERIFICATION", amount: 260 },
  { id: "b4", reference: "ED-2408-022", customer: "James Wilson", customerEmail: "james@example.com", serviceId: "filling", serviceName: "Tooth-colored filling", staff: "Dr. Marcus Lee", date: "Aug 26, 2024", time: "03:30 PM", durationMinutes: 90, status: "COMPLETED", paymentStatus: "PAID", amount: 215 },
  { id: "b5", reference: "ED-2408-023", customer: "Ava Thompson", customerEmail: "ava@example.com", serviceId: "cleaning", serviceName: "Signature teeth cleaning", staff: "Dr. Maya Patel", date: "Aug 27, 2024", time: "10:00 AM", durationMinutes: 60, status: "CANCELLED", paymentStatus: "REFUNDED", amount: 120 },
];

export const timeSlots = ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM"];

export const bookingStatusMeta: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending approval", className: "status-pending" },
  CONFIRMED: { label: "Confirmed", className: "status-confirmed" },
  CANCELLED: { label: "Cancelled", className: "status-cancelled" },
  COMPLETED: { label: "Completed", className: "status-completed" },
  NO_SHOW: { label: "No-show", className: "status-cancelled" },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: { label: "Unpaid", className: "payment-unpaid" },
  PENDING_VERIFICATION: { label: "Pending verification", className: "payment-pending" },
  PAID: { label: "Paid", className: "payment-paid" },
  REFUNDED: { label: "Refunded", className: "payment-refunded" },
  WAIVED: { label: "Waived", className: "payment-waived" },
};

export function calculateRevenue(bookings: Booking[]) {
  return bookings.filter((booking) => booking.paymentStatus === "PAID").reduce((total, booking) => total + booking.amount, 0);
}

export function hasOverlap(existingStart: number, existingEnd: number, requestedStart: number, requestedEnd: number) {
  return existingStart < requestedEnd && existingEnd > requestedStart;
}

export function getAvailableSlots(date: string, serviceId: string, bookedTimes: string[] = []) {
  const service = services.find((item) => item.id === serviceId);
  if (!service || date === "2024-08-25") return [];
  return timeSlots.filter((slot) => !bookedTimes.includes(slot));
}
