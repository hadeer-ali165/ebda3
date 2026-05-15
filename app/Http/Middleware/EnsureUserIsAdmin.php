<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'غير مصرح لك بدخول النظام.');
        }

        if ($user->isEmployee()) {
            return redirect()->route('employee.dashboard');
        }

        if (! $user->is_admin) {
            abort(403, 'غير مصرح لك بدخول النظام.');
        }

        return $next($request);
    }
}
