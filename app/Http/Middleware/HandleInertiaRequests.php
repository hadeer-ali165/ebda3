<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $logoPath = AppSetting::query()->where('key', 'branding_logo_path')->value('value');
        $logoUrl = null;

        if ($logoPath) {
            $fullPath = storage_path('app/public/'.$logoPath);
            $version = file_exists($fullPath) ? (string) filemtime($fullPath) : (string) time();
            $logoUrl = asset('storage/'.$logoPath).'?v='.$version;
        }

        $user = $request->user();
        if ($user) {
            $user->loadMissing('track');
        }

        $isAdmin = (bool) ($user?->isAdmin());

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_admin' => $isAdmin,
                    'is_employee' => $user->isEmployee(),
                    'track_id' => $user->track_id,
                    'track_name' => $user->track?->name,
                ] : null,
            ],
            'branding' => [
                'logo_url' => $logoUrl,
                'can_manage' => $isAdmin,
            ],
            'permissions' => [
                'can_view_financials' => $isAdmin,
                'can_manage_branding' => $isAdmin,
                'can_manage_students' => $isAdmin,
                'can_manage_employees' => $isAdmin,
            ],
        ];
    }
}
