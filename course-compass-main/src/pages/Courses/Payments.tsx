import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Loader2, ArrowRight, ReceiptText, BadgeCheck, Clock3, Wallet } from "lucide-react";
import { courseApi } from "@/api/course.api";
import { platformApi } from "@/api/platform.api";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

type PaymentRecord = {
  id: string;
  amount: number;
  currency?: string;
  status: string;
  providerRef?: string;
  createdAt: string;
  course?: {
    id: string;
    title: string;
    price?: number;
    category?: string;
    thumbnail?: string;
  };
};

type Enrollment = {
  courseId: string;
  enrolledAt: string;
  progress: number;
  status: string;
  course: {
    id: string;
    title: string;
    price?: number;
    category?: string;
  };
};

const statusClass = (status: string) => {
  if (status === "paid" || status === "completed") return "bg-emerald-500/10 text-emerald-500";
  if (status === "pending" || status === "processing") return "bg-amber-500/10 text-amber-500";
  if (status === "failed" || status === "refunded") return "bg-rose-500/10 text-rose-500";
  return "bg-primary/10 text-primary";
};

export default function Payments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      platformApi.payments(),
      courseApi.getMyEnrollments(),
    ])
      .then(([paymentsRes, enrollmentsRes]) => {
        if (!active) return;

        const paymentRows = paymentsRes.status === "fulfilled" ? (paymentsRes.value.data?.data || []) : [];
        const enrollmentRows = enrollmentsRes.status === "fulfilled" ? (enrollmentsRes.value.data?.data || []) : [];

        setPayments(paymentRows);
        setEnrollments(enrollmentRows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const paidCount = payments.filter((payment) => payment.status === "paid").length;
    const paidTotal = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const activeEnrollments = enrollments.filter((enrollment) => enrollment.progress < 100 && enrollment.status !== "completed").length;
    const completedEnrollments = enrollments.filter((enrollment) => enrollment.progress >= 100 || enrollment.status === "completed").length;

    return [
      { label: "Payments", value: payments.length, icon: CreditCard },
      { label: "Paid total", value: paidTotal ? `${payments[0]?.currency || "INR"} ${paidTotal.toLocaleString()}` : "INR 0", icon: Wallet },
      { label: "Active learning", value: activeEnrollments, icon: Clock3 },
      { label: "Completed", value: completedEnrollments, icon: BadgeCheck },
      { label: "Paid orders", value: paidCount, icon: ReceiptText },
    ];
  }, [enrollments, payments]);

  if (loading) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-shell container py-8 lg:py-10">
      <PageHeader
        icon={CreditCard}
        label="Billing"
        title="Payment & Enrollment History"
        description="Review verified payment records, enrollment activity, and course access status."
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-card rounded-[1.75rem] p-5">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </section>

      {payments.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={CreditCard}
            title="No payment records yet"
            description="Verified payment transactions will appear here when they are created by the platform."
            actionLabel="Browse courses"
            actionTo="/courses"
          />

          {enrollments.length > 0 && (
            <div className="surface-card rounded-[2rem] overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold">Enrollment history</h2>
                <p className="text-sm text-muted-foreground">These are your current and completed course enrollments.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Course</th>
                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Amount</th>
                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Progress</th>
                      <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.courseId} className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{enrollment.course?.title || "Course"}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.course?.category || "General"}</p>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {enrollment.course?.price && enrollment.course.price > 0 ? `$${enrollment.course.price.toFixed(2)}` : "Free"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(enrollment.status)}`}>
                            {enrollment.status === "completed" ? "Completed" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-20 rounded-full bg-muted/60">
                              <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${enrollment.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{enrollment.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/courses/${enrollment.courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
                            Open course <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="surface-card rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Course</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Transaction</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Receipt</th>
                  <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Course</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{payment.course?.title || "Course payment"}</p>
                      <p className="text-xs text-muted-foreground">{payment.course?.category || "Billing record"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">
                        {payment.currency || "INR"} {Number(payment.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(payment.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {payment.providerRef ? (
                        <span className="font-mono text-xs">{payment.providerRef}</span>
                      ) : (
                        "Receipt unavailable"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payment.course?.id ? (
                        <Link to={`/courses/${payment.course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
                          Open course <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">No course attached</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
