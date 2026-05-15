import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function EmployeesIndex({ employees, tracks }) {
    const [editingId, setEditingId] = useState(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        track_id: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        track_id: '',
    });

    const startEdit = (employee) => {
        setEditingId(employee.id);
        editForm.setData({
            name: employee.name,
            email: employee.email,
            password: '',
            track_id: String(employee.track_id),
        });
        editForm.clearErrors();
    };

    const cancelEdit = () => {
        setEditingId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitCreate = (event) => {
        event.preventDefault();
        createForm.post(route('employees.store'), {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editingId) return;

        editForm.put(route('employees.update', editingId), {
            preserveScroll: true,
            onSuccess: () => cancelEdit(),
        });
    };

    const deleteEmployee = (employeeId) => {
        if (!window.confirm('هل أنتِ متأكدة من حذف هذا الموظف؟')) return;

        router.delete(route('employees.destroy', employeeId), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="إدارة الموظفين" />

            <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                                    <ApplicationLogo className="h-full w-full rounded-full object-cover" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        أضيفي موظفًا واربطيه بمادة محددة — يرى الحضور والاشتراكات فقط بدون مبالغ مالية.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={route('dashboard')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                                    لوحة التحكم
                                </Link>
                                <Link href={route('logout')} method="post" as="button" className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                                    تسجيل الخروج
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">إضافة موظف جديد</h2>
                        <form onSubmit={submitCreate} className="grid gap-3 md:grid-cols-2">
                            <input type="text" className="rounded-md border-gray-300" placeholder="اسم الموظف" value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} />
                            <input type="email" className="rounded-md border-gray-300" placeholder="البريد الإلكتروني" value={createForm.data.email} onChange={(e) => createForm.setData('email', e.target.value)} />
                            <input type="password" className="rounded-md border-gray-300" placeholder="كلمة المرور" value={createForm.data.password} onChange={(e) => createForm.setData('password', e.target.value)} />
                            <select className="rounded-md border-gray-300" value={createForm.data.track_id} onChange={(e) => createForm.setData('track_id', e.target.value)}>
                                <option value="">اختر المادة / التراك</option>
                                {tracks.map((track) => (
                                    <option key={track.id} value={track.id}>{track.name}</option>
                                ))}
                            </select>
                            <div className="md:col-span-2">
                                <button type="submit" disabled={createForm.processing} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                                    حفظ الموظف
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">الموظفون الحاليون</h2>
                        {editingId && (
                            <form onSubmit={submitEdit} className="mb-6 grid gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 md:grid-cols-2">
                                <p className="md:col-span-2 text-sm font-semibold text-indigo-900">تعديل موظف</p>
                                <input type="text" className="rounded-md border-gray-300" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                                <input type="email" className="rounded-md border-gray-300" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} />
                                <input type="password" className="rounded-md border-gray-300" placeholder="كلمة مرور جديدة (اختياري)" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)} />
                                <select className="rounded-md border-gray-300" value={editForm.data.track_id} onChange={(e) => editForm.setData('track_id', e.target.value)}>
                                    {tracks.map((track) => (
                                        <option key={track.id} value={track.id}>{track.name}</option>
                                    ))}
                                </select>
                                <div className="md:col-span-2 flex gap-2">
                                    <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">حفظ</button>
                                    <button type="button" onClick={cancelEdit} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">إلغاء</button>
                                </div>
                            </form>
                        )}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">الاسم</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">البريد</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">المادة</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {employees.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-500">لا يوجد موظفون بعد.</td>
                                        </tr>
                                    )}
                                    {employees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td className="px-3 py-2 text-sm text-gray-800">{employee.name}</td>
                                            <td className="px-3 py-2 text-sm text-gray-800">{employee.email}</td>
                                            <td className="px-3 py-2 text-sm text-gray-800">{employee.track_name}</td>
                                            <td className="px-3 py-2 text-center text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => startEdit(employee)} className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700">تعديل</button>
                                                    <button type="button" onClick={() => deleteEmployee(employee.id)} className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700">حذف</button>
                                                </div>
                                            </td>
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
