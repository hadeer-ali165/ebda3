import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 px-4 py-10">
            <div className="mb-5">
                <Link href={route('login')}>
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white p-1.5 shadow-md">
                        <ApplicationLogo className="h-full w-full rounded-full object-cover fill-current text-gray-500" />
                    </div>
                </Link>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-white/60 bg-white/95 px-6 py-6 shadow-xl backdrop-blur sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
