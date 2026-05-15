import { Head, Link, router, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function EmployeeStudents({
    track,
    students,
    months,
    filters,
    previousStartMonth,
    nextStartMonth,
}) {
    const filterForm = useForm({
        search: filters.search ?? '',
    });

    const studentForm = useForm({
        name: '',
        father_name: '',
        phone: '',
        subscription_date: new Date().toISOString().slice(0, 10),
    });

    const submitStudent = (event) => {
        event.preventDefault();
        studentForm.post(route('employee.students.store'), {
            preserveScroll: true,
            onSuccess: () => studentForm.reset('name', 'father_name', 'phone'),
        });
    };

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(
            route('employee.students.index'),
            {
                search: filterForm.data.search || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const changeMonthsRange = (startMonth) => {
        router.get(
            route('employee.students.index'),
            {
                start_month: startMonth,
                search: filters.search || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const toggleSubscription = (studentTrackId, month, paid) => {
        router.put(
            route('employee.student-tracks.payments.toggle', studentTrackId),
            { month, paid },
            { preserveScroll: true, preserveState: true, only: ['students'] },
        );
    };

    return (
        <>
            <Head title={`طلاب ${track.name}`} />

            <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                                    <ApplicationLogo className="h-full w-full rounded-full object-cover" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">متابعة طلاب {track.name}</h1>
                                    <p className="text-sm text-gray-600">متابعة الاشتراكات — بدون عرض مبالغ مالية</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('employee.dashboard')}
                                    className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                                >
                                    لوحة المتابعة
                                </Link>
                                <Link
                                    href={route('profile.edit')}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    حسابي
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                                >
                                    تسجيل الخروج
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">إضافة طالب جديد — {track.name}</h2>
                        <form onSubmit={submitStudent} className="mb-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <input
                                type="text"
                                className="rounded-md border-gray-300"
                                placeholder="اسم الطالب"
                                value={studentForm.data.name}
                                onChange={(e) => studentForm.setData('name', e.target.value)}
                            />
                            <input
                                type="text"
                                className="rounded-md border-gray-300"
                                placeholder="ولي الأمر"
                                value={studentForm.data.father_name}
                                onChange={(e) => studentForm.setData('father_name', e.target.value)}
                            />
                            <input
                                type="text"
                                className="rounded-md border-gray-300"
                                placeholder="رقم التليفون"
                                value={studentForm.data.phone}
                                onChange={(e) => studentForm.setData('phone', e.target.value)}
                            />
                            <input
                                type="date"
                                className="rounded-md border-gray-300"
                                value={studentForm.data.subscription_date}
                                onChange={(e) => studentForm.setData('subscription_date', e.target.value)}
                            />
                            <div className="md:col-span-2 lg:col-span-4">
                                <p className="mb-2 text-sm text-gray-600">
                                    سيُضاف الطالب تلقائيًا لمادة: <strong>{track.name}</strong>
                                </p>
                                <button
                                    type="submit"
                                    disabled={studentForm.processing}
                                    className="rounded-md bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                                >
                                    حفظ الطالب
                                </button>
                            </div>
                        </form>
                        {Object.keys(studentForm.errors).length > 0 && (
                            <p className="mb-6 text-sm text-red-600">يرجى استكمال بيانات الطالب.</p>
                        )}

                        <form onSubmit={applyFilters} className="mb-6 flex flex-wrap gap-3">
                            <input
                                type="text"
                                className="min-w-[200px] flex-1 rounded-md border-gray-300"
                                placeholder="بحث باسم الطالب"
                                value={filterForm.data.search}
                                onChange={(e) => filterForm.setData('search', e.target.value)}
                            />
                            <button
                                type="submit"
                                className="rounded-md bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800"
                            >
                                تطبيق
                            </button>
                        </form>

                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">حالة الاشتراك الشهري</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => changeMonthsRange(previousStartMonth)}
                                >
                                    6 شهور سابقة
                                </button>
                                <button
                                    type="button"
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => changeMonthsRange(nextStartMonth)}
                                >
                                    6 شهور قادمة
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">اسم الطالب</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">ولي الأمر</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">التليفون</th>
                                        {months.map((month) => (
                                            <th key={month.key} className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                                                {month.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.name}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.father_name}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.phone}</td>
                                            {months.map((month) => {
                                                const paid = Boolean(student.subscriptions?.[month.key]);
                                                return (
                                                    <td key={`${student.id}-${month.key}`} className="px-3 py-2 text-center">
                                                        <label className="inline-flex flex-col items-center gap-1 text-xs">
                                                            <input
                                                                type="checkbox"
                                                                checked={paid}
                                                                onChange={(e) =>
                                                                    toggleSubscription(
                                                                        student.student_track_id,
                                                                        month.key,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                                className="h-4 w-4 accent-teal-600"
                                                            />
                                                            <span className={paid ? 'text-emerald-700' : 'text-rose-600'}>
                                                                {paid ? 'مدفوع' : 'غير مدفوع'}
                                                            </span>
                                                        </label>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
