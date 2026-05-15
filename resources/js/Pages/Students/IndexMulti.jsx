import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function StudentsIndex({
    students,
    tracks,
    filters,
    months,
    previousStartMonth,
    nextStartMonth,
}) {
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [editingTrackId, setEditingTrackId] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        father_name: '',
        phone: '',
        track_ids: [],
        subscription_date: new Date().toISOString().slice(0, 10),
    });

    const trackForm = useForm({ name: '', monthly_fee: '' });
    const editTrackForm = useForm({ name: '', monthly_fee: '' });
    const editForm = useForm({
        name: '',
        father_name: '',
        phone: '',
        track_ids: [],
        subscription_date: '',
    });

    const filterForm = useForm({
        search: filters.search ?? '',
        track_id: filters.track_id ? String(filters.track_id) : '',
    });

    const toggleTrackSelection = (trackId) => {
        setData(
            'track_ids',
            data.track_ids.includes(trackId)
                ? data.track_ids.filter((id) => id !== trackId)
                : [...data.track_ids, trackId],
        );
    };

    const toggleEditTrackSelection = (trackId) => {
        editForm.setData(
            'track_ids',
            editForm.data.track_ids.includes(trackId)
                ? editForm.data.track_ids.filter((id) => id !== trackId)
                : [...editForm.data.track_ids, trackId],
        );
    };

    const submitStudent = (event) => {
        event.preventDefault();
        post(route('students.store'), {
            preserveScroll: true,
            onSuccess: () => reset('name', 'father_name', 'phone', 'track_ids'),
        });
    };

    const submitTrack = (event) => {
        event.preventDefault();
        trackForm.post(route('tracks.store'), {
            preserveScroll: true,
            onSuccess: () => trackForm.reset(),
        });
    };

    const startEditTrack = (track) => {
        setEditingTrackId(track.id);
        editTrackForm.setData({
            name: track.name,
            monthly_fee: String(track.monthly_fee ?? ''),
        });
    };

    const cancelEditTrack = () => {
        setEditingTrackId(null);
        editTrackForm.reset();
        editTrackForm.clearErrors();
    };

    const submitEditTrack = (event) => {
        event.preventDefault();
        if (!editingTrackId) return;

        editTrackForm.put(route('tracks.update', editingTrackId), {
            preserveScroll: true,
            onSuccess: () => cancelEditTrack(),
        });
    };

    const deleteTrack = (trackId) => {
        if (!window.confirm('هل أنتِ متأكدة من حذف التراك؟')) return;

        router.delete(route('tracks.destroy', trackId), {
            preserveScroll: true,
        });
    };

    const startEditStudent = (student) => {
        setEditingStudentId(student.id);
        editForm.setData({
            name: student.name,
            father_name: student.father_name,
            phone: student.phone,
            track_ids: student.tracks.map((track) => track.track_id),
            subscription_date: student.subscription_date,
        });
    };

    const cancelEditStudent = () => {
        setEditingStudentId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEditStudent = (event) => {
        event.preventDefault();
        if (!editingStudentId) return;

        editForm.put(route('students.update', editingStudentId), {
            preserveScroll: true,
            onSuccess: () => cancelEditStudent(),
        });
    };

    const deleteStudent = (studentId) => {
        if (!window.confirm('هل أنتِ متأكدة من حذف الطالب؟')) return;
        router.delete(route('students.destroy', studentId), { preserveScroll: true });
    };

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(
            route('students.index'),
            {
                search: filterForm.data.search || undefined,
                track_id: filterForm.data.track_id || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const changeMonthsRange = (startMonth) => {
        router.get(
            route('students.index'),
            {
                start_month: startMonth,
                search: filters.search || undefined,
                track_id: filters.track_id || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const toggleTrackPayment = (studentTrackId, month, checked) => {
        router.put(
            route('student-tracks.payments.toggle', studentTrackId),
            { month, paid: checked },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['students'],
            },
        );
    };

    const paymentStatus = (paidAmount, monthlyFee) => {
        if (!paidAmount || paidAmount <= 0) return 'غير مدفوع';
        if (paidAmount >= monthlyFee) return 'مدفوع كامل';
        return 'مدفوع جزئي';
    };

    return (
        <>
            <Head title="نظام إدارة الطلاب" />
            <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                                    <ApplicationLogo className="h-full w-full rounded-full object-cover" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب والتراكات</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={route('dashboard')} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                                    العودة للوحة التحليلات
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

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">إضافة طالب جديد</h2>
                            <form onSubmit={submitStudent} className="grid gap-3">
                                <input type="text" className="rounded-md border-gray-300" placeholder="اسم الطالب" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                <input type="text" className="rounded-md border-gray-300" placeholder="ولي الأمر" value={data.father_name} onChange={(e) => setData('father_name', e.target.value)} />
                                <input type="text" className="rounded-md border-gray-300" placeholder="رقم التليفون" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                <input type="date" className="rounded-md border-gray-300" value={data.subscription_date} onChange={(e) => setData('subscription_date', e.target.value)} />
                                <div className="grid gap-2 rounded-md border border-gray-200 p-3 md:grid-cols-2">
                                    {tracks.map((track) => (
                                        <label key={track.id} className="flex items-center gap-2 text-sm text-gray-700">
                                            <input type="checkbox" checked={data.track_ids.includes(track.id)} onChange={() => toggleTrackSelection(track.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span>{track.name} - {track.monthly_fee}</span>
                                        </label>
                                    ))}
                                </div>
                                <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">حفظ الطالب</button>
                            </form>
                            {Object.keys(errors).length > 0 && <div className="mt-3 text-sm text-red-600">يرجى استكمال البيانات.</div>}
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">إضافة تراك جديد</h2>
                            <form onSubmit={submitTrack} className="flex gap-3">
                                <input type="text" className="w-full rounded-md border-gray-300" placeholder="اسم التراك" value={trackForm.data.name} onChange={(e) => trackForm.setData('name', e.target.value)} />
                                <input type="number" min="0" step="0.01" className="w-40 rounded-md border-gray-300" placeholder="قيمة التراك" value={trackForm.data.monthly_fee} onChange={(e) => trackForm.setData('monthly_fee', e.target.value)} />
                                <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">إضافة</button>
                            </form>

                            {editingTrackId && (
                                <form onSubmit={submitEditTrack} className="mt-4 grid gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                                    <p className="text-sm font-semibold text-indigo-900">تعديل التراك</p>
                                    <input
                                        type="text"
                                        className="rounded-md border-gray-300"
                                        placeholder="اسم التراك"
                                        value={editTrackForm.data.name}
                                        onChange={(e) => editTrackForm.setData('name', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="rounded-md border-gray-300"
                                        placeholder="قيمة التراك"
                                        value={editTrackForm.data.monthly_fee}
                                        onChange={(e) => editTrackForm.setData('monthly_fee', e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
                                            حفظ
                                        </button>
                                        <button type="button" onClick={cancelEditTrack} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="mt-5">
                                <h3 className="mb-2 text-sm font-semibold text-gray-800">التراكات الحالية</h3>
                                <div className="space-y-2">
                                    {tracks.map((track) => (
                                        <div key={track.id} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                                            <div className="text-sm text-gray-700">
                                                {track.name} - {track.monthly_fee}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditTrack(track)}
                                                    className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTrack(track.id)}
                                                    className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        {editingStudentId && (
                            <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                                <h3 className="mb-3 text-base font-semibold text-indigo-900">تعديل بيانات الطالب</h3>
                                <form onSubmit={submitEditStudent} className="grid gap-3 md:grid-cols-2">
                                    <input type="text" className="rounded-md border-gray-300" placeholder="اسم الطالب" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                                    <input type="text" className="rounded-md border-gray-300" placeholder="ولي الأمر" value={editForm.data.father_name} onChange={(e) => editForm.setData('father_name', e.target.value)} />
                                    <input type="text" className="rounded-md border-gray-300" placeholder="رقم التليفون" value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)} />
                                    <input type="date" className="rounded-md border-gray-300" value={editForm.data.subscription_date} onChange={(e) => editForm.setData('subscription_date', e.target.value)} />
                                    <div className="md:col-span-2 grid gap-2 rounded-md border border-gray-200 p-3 md:grid-cols-2">
                                        {tracks.map((track) => (
                                            <label key={track.id} className="flex items-center gap-2 text-sm text-gray-700">
                                                <input type="checkbox" checked={editForm.data.track_ids.includes(track.id)} onChange={() => toggleEditTrackSelection(track.id)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                <span>{track.name} - {track.monthly_fee}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="col-span-full flex gap-2">
                                        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">حفظ التعديل</button>
                                        <button type="button" onClick={cancelEditStudent} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">إلغاء</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="mb-4 grid gap-3 md:grid-cols-4">
                            <input type="text" className="rounded-md border-gray-300" placeholder="بحث باسم الطالب" value={filterForm.data.search} onChange={(e) => filterForm.setData('search', e.target.value)} />
                            <select className="rounded-md border-gray-300" value={filterForm.data.track_id} onChange={(e) => filterForm.setData('track_id', e.target.value)}>
                                <option value="">كل التراكات</option>
                                {tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
                            </select>
                            <button onClick={applyFilters} className="rounded-md bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800">تطبيق الفلتر</button>
                            <Link href={route('students.export', { search: filters.search || undefined, track_id: filters.track_id || undefined })} className="rounded-md bg-amber-600 px-4 py-2 text-center font-medium text-white hover:bg-amber-700">تصدير Excel</Link>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">سداد كل تراك بشكل منفصل</h2>
                            <div className="flex items-center gap-2">
                                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => changeMonthsRange(previousStartMonth)}>6 شهور سابقة</button>
                                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => changeMonthsRange(nextStartMonth)}>6 شهور قادمة</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">اسم الطالب</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">ولي الأمر</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">رقم التليفون</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">التراكات</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">تاريخ الاشتراك</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">إجراءات</th>
                                        {months.map((month) => <th key={month.key} className="px-3 py-2 text-center text-xs font-semibold text-gray-600">{month.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.name}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.father_name}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.phone}</td>
                                            <td className="px-3 py-2 text-sm text-gray-800">{student.tracks.map((track) => `${track.track_name} (${track.monthly_fee})`).join(' | ')}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-800">{student.subscription_date}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-center text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => startEditStudent(student)} className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700">تعديل</button>
                                                    <button type="button" onClick={() => deleteStudent(student.id)} className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700">حذف</button>
                                                </div>
                                            </td>
                                            {months.map((month) => (
                                                <td key={`${student.id}-${month.key}`} className="px-3 py-2 align-top">
                                                    <div className="space-y-2">
                                                        {student.tracks.map((track) => {
                                                            const paidAmount = Number(track.payments?.[month.key] ?? 0);
                                                            const status = paymentStatus(paidAmount, Number(track.monthly_fee));
                                                            const checked = paidAmount >= Number(track.monthly_fee);
                                                            return (
                                                                <div key={`${track.id}-${month.key}`} className="rounded-md border border-gray-200 p-2">
                                                                    <div className="mb-1 text-xs font-semibold text-gray-700">{track.track_name}</div>
                                                                    <label className="mb-1 flex items-center gap-2 text-xs text-gray-700">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={(e) => toggleTrackPayment(track.id, month.key, e.target.checked)}
                                                                            className="h-4 w-4 accent-indigo-600"
                                                                        />
                                                                        <span>تم الدفع بالكامل</span>
                                                                    </label>
                                                                    <div className="text-[11px] text-gray-600">{status} - المطلوب {track.monthly_fee}</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            ))}
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
