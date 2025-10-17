<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $userRoleId = $request->user()->role_id;
        
        // Convert role names to role IDs
        $allowedRoleIds = array_map(function($role) {
            return $role === 'admin' ? 1 : ($role === 'customer' ? 2 : 0);
        }, $roles);
        
        if (!in_array($userRoleId, $allowedRoleIds)) {
            return response()->json(['message' => 'Access denied'], 403);
        }
        
        return $next($request);
    }
}
