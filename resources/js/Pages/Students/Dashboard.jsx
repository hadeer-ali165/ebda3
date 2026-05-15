import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Dashboard({
    stats,
    trackAnalytics,
    recentStudents,
    dailyRevenue,
    trackRevenue,
}) {
    const { branding } = usePage().props;
    const brandingForm = useForm({
        logo: null,
    });
    const paymentRate =
        stats.total_students > 0
            ? Math.round((stats.paid_students_this_month / stats.total_students) * 100)
            : 0;
    const collectionRate =
        stats.expected_revenue_this_month > 0
            ? Math.round(
                  (stats.total_revenue_this_month / stats.expected_revenue_this_month) * 100,
              )
            : 0;
    const maxDailyRevenue = Math.max(1, ...dailyRevenue.map((item) => item.amount));
    const maxTrackRevenue = Math.max(1, ...trackRevenue.map((item) => item.revenue));
    const formatMoney = (amount) =>
        Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });

    const submitBranding = (event) => {
        event.preventDefault();
        brandingForm.post(route('settings.branding.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => brandingForm.reset('logo'),
        });
    };

    return (
        <>
            <Head title="لوحة التحكم" />

            <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-2xl bg-gradient-to-l from-indigo-600 to-violet-600 p-6 text-white shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/20 p-1 shadow-sm">
                                    <ApplicationLogo className="h-full w-full rounded-full object-cover" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">لوحة تحليلات الطلاب</h1>
                                    <p className="mt-1 text-sm text-indigo-100">
                                        ملخص سريع لحالة الإضافة والدفع والتراكات لشهر {stats.month_key}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('employees.index')}
                                    className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-white"
                                >
                                    إدارة الموظفين
                                </Link>
                                <Link
                                    href={route('students.index')}
                                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                                >
                                    إدارة الطلاب
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

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="إجمالي الطلاب" value={stats.total_students} color="text-indigo-700" />
                        <StatCard title="الطلاب الذين دفعوا هذا الشهر" value={stats.paid_students_this_month} color="text-emerald-700" />
                        <StatCard title="الطلاب غير المسددين هذا الشهر" value={stats.unpaid_students_this_month} color="text-rose-700" />
                        <StatCard title="عدد التراكات" value={stats.total_tracks} color="text-amber-700" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard
                            title="المكسب الفعلي هذا الشهر"
                            value={`${formatMoney(stats.total_revenue_this_month)} جنيه`}
                            color="text-emerald-700"
                        />
                        <StatCard
                            title="المبلغ المتوقع هذا الشهر"
                            value={`${formatMoney(stats.expected_revenue_this_month)} جنيه`}
                            color="text-indigo-700"
                        />
                        <StatCard
                            title="نسبة التحصيل المالي"
                            value={`${collectionRate}%`}
                            color="text-violet-700"
                        />
                    </div>

                    {branding?.can_manage && (
                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">إعدادات اللوجو</h2>
                        <div className="grid gap-4 lg:grid-cols-2">
                            <form onSubmit={submitBranding} className="space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        brandingForm.setData('logo', e.target.files?.[0] || null)
                                    }
                                    className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={brandingForm.processing}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    حفظ اللوجو
                                </button>
                                {brandingForm.errors.logo && (
                                    <p className="text-sm text-red-600">{brandingForm.errors.logo}</p>
                                )}
                            </form>

                            <div className="rounded-lg border border-dashed border-gray-300 p-4">
                                <p className="mb-2 text-sm text-gray-500">المعاينة الحالية</p>
                                {branding?.logo_url ? (
                                    <img
                                        src={branding.logo_url}
                                        alt="Current logo"
                                        className="h-20 w-20 object-contain"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-500">لا يوجد لوجو مرفوع بعد.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">توزيع الطلاب على التراكات</h2>
                            <div className="space-y-3">
                                {trackAnalytics.map((track) => {
                                    const ratio =
                                        stats.total_students > 0
                                            ? Math.round((track.students_count / stats.total_students) * 100)
                                            : 0;

                                    return (
                                        <div key={track.id}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">{track.name}</span>
                                                <span className="text-gray-500">
                                                    {track.students_count} طالب ({ratio}%)
                                                </span>
                                            </div>
                                            <div className="h-2.5 rounded-full bg-gray-200">
                                                <div
                                                    className="h-2.5 rounded-full bg-indigo-600"
                                                    style={{ width: `${ratio}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {trackAnalytics.length === 0 && (
                                    <p className="text-sm text-gray-500">لا توجد تراكات مضافة حتى الآن.</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">ملخص الشهر الحالي</h2>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="rounded-lg bg-slate-50 p-3">
                                    طلاب تمت إضافتهم هذا الشهر: <strong>{stats.new_students_this_month}</strong>
                                </li>
                                <li className="rounded-lg bg-slate-50 p-3">
                                    نسبة التحصيل الشهرية: <strong>{paymentRate}%</strong>
                                </li>
                                <li className="rounded-lg bg-slate-50 p-3">
                                    شهر التقرير: <strong>{stats.month_key}</strong>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">المكسب اليومي خلال الشهر</h2>
                            <div className="flex h-56 items-end gap-1 overflow-x-auto rounded-lg bg-slate-50 p-3">
                                {dailyRevenue.map((point) => (
                                    <div key={point.day} className="flex min-w-[18px] flex-col items-center justify-end gap-1">
                                        <div
                                            title={`${point.day}: ${formatMoney(point.amount)} جنيه`}
                                            className="w-4 rounded-t bg-emerald-500"
                                            style={{
                                                height: `${Math.max(
                                                    4,
                                                    (point.amount / maxDailyRevenue) * 160,
                                                )}px`,
                                            }}
                                        />
                                        <span className="text-[10px] text-gray-500">{point.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">المكسب حسب التراك</h2>
                            <div className="space-y-3">
                                {trackRevenue.map((track) => (
                                    <div key={track.id}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{track.name}</span>
                                            <span className="text-gray-500">
                                                {formatMoney(track.revenue)} جنيه
                                            </span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-gray-200">
                                            <div
                                                className="h-2.5 rounded-full bg-violet-600"
                                                style={{
                                                    width: `${Math.max(
                                                        3,
                                                        (track.revenue / maxTrackRevenue) * 100,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {trackRevenue.length === 0 && (
                                    <p className="text-sm text-gray-500">لا توجد إيرادات حتى الآن.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">أحدث الطلاب المضافين</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">الاسم</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">التراك</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">تاريخ الإضافة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recentStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.name}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.track_name}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {recentStudents.length === 0 && (
                                <p className="py-4 text-center text-sm text-gray-500">لا يوجد طلاب مضافين بعد.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
}
