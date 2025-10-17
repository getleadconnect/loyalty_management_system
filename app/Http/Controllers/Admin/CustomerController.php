<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Get all customers with pagination
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $dateFrom = $request->get('date_from', '');
        $dateTo = $request->get('date_to', '');

        $query = User::where('role_id', 2); // role_id=2 for customers

        // Apply search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        // Apply date filters
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        $customers = $query->paginate($perPage);

        // Transform the data to match frontend expectations
        $customers->getCollection()->transform(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'mobile' => $customer->mobile, // Use mobile field from users table
                'country_code' => $customer->country_code,
                'points_balance' => $customer->points_balance ?? 0,
                'status' => $customer->status ?? 'active',
                'member_since' => $customer->created_at ? $customer->created_at->format('M d, Y') : 'N/A',
                'last_active' => $customer->updated_at ? $customer->updated_at->diffForHumans() : 'Never',
                'created_at' => $customer->created_at,
                'updated_at' => $customer->updated_at
            ];
        });

        return response()->json($customers);
    }

    /**
     * Store a new customer
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'mobile' => 'nullable|string|max:255',
            'country_code' => 'nullable|string|max:10',
            'points_balance' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $customer = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'mobile' => $request->mobile,
            'country_code' => $request->country_code,
            'points_balance' => $request->points_balance ?? 0,
            'role_id' => 2, // Customer role
            'status' => 'active'
        ]);

        return response()->json([
            'message' => 'Customer created successfully',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'mobile' => $customer->mobile,
                'country_code' => $customer->country_code,
                'points_balance' => $customer->points_balance,
                'status' => $customer->status
            ]
        ], 201);
    }

    /**
     * Get a single customer by ID
     */
    public function show($id)
    {
        $customer = User::where('role_id', 2)->findOrFail($id);
        
        // Get customer statistics
        $stats = [
            'total_purchases' => DB::table('purchases')->where('user_id', $id)->count(),
            'total_redemptions' => DB::table('redemptions')->where('user_id', $id)->count(),
            'total_points' => $customer->points_balance ?? 0,
            'points_earned_this_month' => DB::table('points_transactions')
                ->where('user_id', $id)
                ->where('type', 'earned')
                ->whereMonth('created_at', now()->month)
                ->sum('points'),
            'points_redeemed_this_month' => DB::table('points_transactions')
                ->where('user_id', $id)
                ->where('type', 'redeemed')
                ->whereMonth('created_at', now()->month)
                ->sum('points'),
        ];

        return response()->json([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'mobile' => $customer->mobile,
                'country_code' => $customer->country_code,
                'points_balance' => $customer->points_balance ?? 0,
                'status' => $customer->status ?? 'active',
                'member_since' => $customer->created_at ? $customer->created_at->format('M d, Y') : 'N/A',
                'created_at' => $customer->created_at,
                'updated_at' => $customer->updated_at
            ],
            'stats' => $stats
        ]);
    }

    /**
     * Update customer information
     */
    public function update(Request $request, $id)
    {
        $customer = User::where('role_id', 2)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'mobile' => 'sometimes|nullable|string|max:255',
            'country_code' => 'sometimes|nullable|integer',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Map phone to mobile if provided
        $updateData = $request->only(['name', 'email', 'mobile', 'country_code', 'status']);
        if ($request->has('phone') && !$request->has('mobile')) {
            $updateData['mobile'] = $request->phone;
        }
        
        $customer->update($updateData);

        return response()->json([
            'message' => 'Customer updated successfully',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'mobile' => $customer->mobile,
                'country_code' => $customer->country_code,
                'points_balance' => $customer->points_balance ?? 0,
                'status' => $customer->status ?? 'active'
            ]
        ]);
    }

    /**
     * Delete a customer
     */
    public function destroy($id)
    {
        $customer = User::where('role_id', 2)->findOrFail($id);
        
        // Soft delete to preserve data integrity
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully'
        ]);
    }

    /**
     * Adjust customer points
     */
    public function adjustPoints(Request $request, $id)
    {
        $customer = User::where('role_id', 2)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'amount' => 'required|integer|min:1',
            'type' => 'required|in:add,deduct',
            'reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $amount = $request->type === 'add' ? abs($request->amount) : -abs($request->amount);
        
        // Update points balance
        $customer->points_balance = ($customer->points_balance ?? 0) + $amount;
        
        if ($customer->points_balance < 0) {
            $customer->points_balance = 0;
        }
        
        $customer->save();

        // Create points history record
        DB::table('points_transactions')->insert([
            'user_id' => $customer->id,
            'type' => $request->type === 'add' ? 'earned' : 'redeemed',
            'points' => abs($request->amount),
            'balance_after' => $customer->points_balance,
            'description' => $request->reason,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Points adjusted successfully',
            'new_balance' => $customer->points_balance
        ]);
    }

    /**
     * Send message to customer
     */
    public function sendMessage(Request $request, $id)
    {
        $customer = User::where('role_id', 2)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'channel' => 'required|in:email,sms,whatsapp',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Store message in communications table
        DB::table('communications')->insert([
            'user_id' => $customer->id,
            'type' => 'individual',
            'channel' => $request->channel,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'sent',
            'sent_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // TODO: Implement actual message sending based on channel
        // For now, we'll just store the message

        return response()->json([
            'message' => 'Message sent successfully to ' . $customer->name
        ]);
    }

    /**
     * Get customer statistics for dashboard
     */
    public function stats()
    {
        $stats = [
            'total_customers' => User::where('role_id', 2)->count(),
            'active_customers' => User::where('role_id', 2)
                ->where('status', 'active')
                ->count(),
            'new_this_month' => User::where('role_id', 2)
                ->whereMonth('created_at', now()->month)
                ->count(),
            'total_points_in_circulation' => User::where('role_id', 2)
                ->sum('points_balance'),
        ];

        return response()->json($stats);
    }

    /**
     * Search customers
     */
    public function search(Request $request)
    {
        $query = $request->get('query', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $customers = User::where('role_id', 2)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('mobile', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'mobile' => $customer->mobile,
                    'country_code' => $customer->country_code,
                    'points_balance' => $customer->points_balance ?? 0
                ];
            });

        return response()->json($customers);
    }

    /**
     * Export customers to CSV or Excel format
     */
    public function export(Request $request)
    {
        try {
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $dateFrom = $request->get('date_from', '');
            $dateTo = $request->get('date_to', '');
            $status = $request->get('status', '');
            $format = strtolower(trim($request->get('format', 'csv')));

            // Validate format and ensure clean format
            if (!in_array($format, ['csv', 'xlsx'])) {
                $format = 'csv';
            }
            // Remove any extra characters from format
            $format = preg_replace('/[^a-z]/', '', $format);

            $query = User::where('role_id', 2); // role_id=2 for customers

            // Apply search
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('mobile', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($status) {
                $query->where('status', $status);
            }

            // Apply date filters
            if ($dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            // Apply sorting
            $query->orderBy($sortBy, $sortOrder);

            // Get all customers (no pagination for export)
            $customers = $query->get();

            // Generate filename with timestamp (clean format)
            $filename = 'customers-' . date('Y-m-d-H-i-s') . '.' . $format;

            if ($format === 'xlsx') {
                return $this->exportToExcel($customers, $filename);
            } else {
                return $this->exportToCSV($customers, $filename);
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to export data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export to CSV format
     */
    private function exportToCSV($customers, $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=' . $filename,
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($customers) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Add headers
            fputcsv($file, [
                'ID',
                'Name',
                'Email',
                'Mobile',
                'Country Code',
                'Points Balance',
                'Status',
                'Total Purchases',
                'Total Redemptions',
                'Member Since',
                'Last Active',
                'Created At',
                'Updated At'
            ]);
            
            // Add data rows
            foreach ($customers as $customer) {
                $totalPurchases = DB::table('purchases')->where('user_id', $customer->id)->count();
                $totalRedemptions = DB::table('reward_redemptions')->where('user_id', $customer->id)->count();
                
                fputcsv($file, [
                    $customer->id,
                    $customer->name,
                    $customer->email,
                    $customer->mobile ?? '',
                    $customer->country_code ?? '',
                    $customer->points_balance ?? 0,
                    $customer->status ?? 'active',
                    $totalPurchases,
                    $totalRedemptions,
                    $customer->created_at ? $customer->created_at->format('Y-m-d') : '',
                    $customer->updated_at ? $customer->updated_at->format('Y-m-d H:i:s') : '',
                    $customer->created_at ? $customer->created_at->format('Y-m-d H:i:s') : '',
                    $customer->updated_at ? $customer->updated_at->format('Y-m-d H:i:s') : ''
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to Excel XLSX format
     */
    private function exportToExcel($customers, $filename)
    {
        // Create Excel-compatible XML
        $xml = '<?xml version="1.0"?>';
        $xml .= '<?mso-application progid="Excel.Sheet"?>';
        $xml .= '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"';
        $xml .= ' xmlns:o="urn:schemas-microsoft-com:office:office"';
        $xml .= ' xmlns:x="urn:schemas-microsoft-com:office:excel"';
        $xml .= ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"';
        $xml .= ' xmlns:html="http://www.w3.org/TR/REC-html40">';
        
        // Add styles
        $xml .= '<Styles>';
        $xml .= '<Style ss:ID="Header">';
        $xml .= '<Font ss:FontName="Arial" ss:Size="11" ss:Bold="1"/>';
        $xml .= '<Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>';
        $xml .= '</Style>';
        $xml .= '</Styles>';
        
        $xml .= '<Worksheet ss:Name="Customers">';
        $xml .= '<Table>';
        
        // Add header row
        $xml .= '<Row>';
        $headers = ['ID', 'Name', 'Email', 'Mobile', 'Country Code', 'Points Balance', 'Status', 'Total Purchases', 'Total Redemptions', 'Member Since', 'Last Active', 'Created At', 'Updated At'];
        foreach ($headers as $header) {
            $xml .= '<Cell ss:StyleID="Header"><Data ss:Type="String">' . htmlspecialchars($header) . '</Data></Cell>';
        }
        $xml .= '</Row>';
        
        // Add data rows
        foreach ($customers as $customer) {
            $totalPurchases = DB::table('purchases')->where('user_id', $customer->id)->count();
            $totalRedemptions = DB::table('reward_redemptions')->where('user_id', $customer->id)->count();
            
            $xml .= '<Row>';
            $data = [
                $customer->id,
                $customer->name,
                $customer->email,
                $customer->mobile ?? '',
                $customer->country_code ?? '',
                $customer->points_balance ?? 0,
                $customer->status ?? 'active',
                $totalPurchases,
                $totalRedemptions,
                $customer->created_at ? $customer->created_at->format('Y-m-d') : '',
                $customer->updated_at ? $customer->updated_at->format('Y-m-d H:i:s') : '',
                $customer->created_at ? $customer->created_at->format('Y-m-d H:i:s') : '',
                $customer->updated_at ? $customer->updated_at->format('Y-m-d H:i:s') : ''
            ];
            
            foreach ($data as $cell) {
                if (is_numeric($cell)) {
                    $xml .= '<Cell><Data ss:Type="Number">' . $cell . '</Data></Cell>';
                } else {
                    $xml .= '<Cell><Data ss:Type="String">' . htmlspecialchars($cell ?? '') . '</Data></Cell>';
                }
            }
            $xml .= '</Row>';
        }
        
        $xml .= '</Table>';
        $xml .= '</Worksheet>';
        $xml .= '</Workbook>';

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename=' . $filename,
            'Cache-Control' => 'max-age=0',
            'Pragma' => 'public'
        ];

        return response($xml, 200, $headers);
    }
}