import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

function StatCard({ title, value, color }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

export default function EmployeeDashboard({ track, stats }) {
    return (
        <>
            <Head title="لوحة الموظف" />

            <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="rounded-2xl bg-gradient-to-l from-teal-600 to-cyan-600 p-6 text-white shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/20 p-1 shadow-sm">
                                    <ApplicationLogo className="h-full w-full rounded-full object-cover" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">لوحة متابعة — {track.name}</h1>
                                    <p className="mt-1 text-sm text-teal-100">
                                        متابعة اشتراكات طلاب المادة لشهر {stats.month_key}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('employee.students.index')}
                                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                                >
                                    متابعة الطلاب
                                </Link>
                                <Link
                                    href={route('profile.edit')}
                                    className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-white"
                                >
                                    حسابي
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                                >
                                    تسجيل الخروج
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard title="طلاب المادة" value={stats.total_students} color="text-indigo-700" />
                        <StatCard title="مشتركون هذا الشهر" value={stats.paid_subscriptions} color="text-emerald-700" />
                        <StatCard title="غير مشتركين هذا الشهر" value={stats.unpaid_subscriptions} color="text-rose-700" />
                    </div>

                    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
                        لا يمكنك رؤية الحسابات المالية أو تغيير اللوجو — فقط طلاب مادتك وحالة الاشتراك.
                    </div>
                </div>
            </div>
        </>
    );
}
