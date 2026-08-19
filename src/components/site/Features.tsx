import { Wallet, GraduationCap, ScanLine, MessagesSquare, ClipboardCheck, Users2 } from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Fees, on your own account",
    body: "Parents pay by card, bank transfer or USSD through Paystack  settled straight into your school's own account, with a live ledger and printable receipts.",
  },
  {
    icon: GraduationCap,
    title: "Academics & CBT",
    body: "Results, report cards, broadsheets and computer-based testing, with grading formulas your school controls.",
  },
  {
    icon: ScanLine,
    title: "Gatepass & attendance",
    body: "QR-code visitor check-in, pickup authorisation, and daily attendance  all logged automatically.",
  },
  {
    icon: MessagesSquare,
    title: "Parent communication",
    body: "Announcements, direct messages, and push notifications reach parents the moment something needs their attention.",
  },
  {
    icon: ClipboardCheck,
    title: "Staff & payroll",
    body: "Leave requests, appraisals, payslips and payroll runs, handled without a spreadsheet in sight.",
  },
  {
    icon: Users2,
    title: "Role-based access",
    body: "Directors, teachers, accounting, and parents each see exactly what's relevant to them  nothing more.",
  },
];

export default function Features() {
  return (
    <section id="platform" className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-xl">
        <span className="text-xs uppercase tracking-wider text-[var(--text-faint)]">Platform</span>
        <h2 className="font-display mt-2 text-3xl font-semibold">Everything a school runs on, in one place</h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="surface-card p-6">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-[10px]"
              style={{ background: "var(--gradient-brand-soft)" }}
            >
              <f.icon size={17} />
            </span>
            <h3 className="mt-4 text-sm font-medium">{f.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-dim)]">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
