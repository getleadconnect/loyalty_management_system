<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RedeemCustomer;
use App\Models\RewardRedemption;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RedeemCustomerController extends Controller
{
    /**
     * Get all redeemed customers - simplified version
     */
    public function index(Request $request)
    {
        try {
            // Start with query builder
            $query = RedeemCustomer::with(['user', 'reward']);
            
            // Apply status filter based on verified_at column
            $status = $request->input('status');
            if ($status !== null && $status !== '') {
                if ($status == '0') {
                    // Not Verified - verified_at is NULL
                    $query->whereNull('verified_at');
                } elseif ($status == '1') {
                    // Verified - verified_at is NOT NULL
                    $query->whereNotNull('verified_at');
                }
            }
            
            // Apply delivery status filter
            $deliveryStatus = $request->input('deliveryStatus');
            if ($deliveryStatus !== null && $deliveryStatus !== '') {
                $query->where('delivery_status', $deliveryStatus);
            }
            
            // Apply date range filters
            $dateFrom = $request->input('dateFrom');
            $dateTo = $request->input('dateTo');
            if ($dateFrom && $dateFrom !== '') {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo && $dateTo !== '') {
                $query->whereDate('created_at', '<=', $dateTo);
            }
            
            // Apply sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // Get filtered records
            $redeemedCustomers = $query->get();
        
        // Transform the data for display
        $transformedData = $redeemedCustomers->map(function ($redemption) {
            return [
                'id' => $redemption->id,
                'customer_name' => $redemption->user ? $redemption->user->name : 'N/A',
                'customer_email' => $redemption->user ? $redemption->user->email : 'N/A',
                'customer_mobile' => $redemption->user ? $redemption->user->mobile : 'N/A',
                'rewards_name' => $redemption->rewards_name,
                'redeem_points' => $redemption->redeem_points,
                'redeem_status' => $redemption->redeem_status,
                'redeem_status_text' => $redemption->verified_at ? 'Verified' : 'Not Verified',
                'delivery_status' => $redemption->delivery_status,
                'delivery_status_text' => $this->getDeliveryStatusText($redemption->delivery_status),
                'verified_at' => $redemption->verified_at ? $redemption->verified_at->format('M d, Y H:i') : null,
                'redeemed_at' => $redemption->created_at->format('M d, Y H:i'),
                'created_at' => $redemption->created_at,
                'updated_at' => $redemption->updated_at
            ];
        });

            // Return all records
            return response()->json([
                'data' => $transformedData,
                'total' => $transformedData->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'total' => 0,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for redeemed customers
     */
    public function stats()
    {
        $stats = [
            'total_redemptions' => RedeemCustomer::count(),
            'pending_redemptions' => RedeemCustomer::whereNull('verified_at')->count(),
            'verified_redemptions' => RedeemCustomer::whereNotNull('verified_at')->count(),
            'delivered_redemptions' => RedeemCustomer::where('delivery_status', 1)->count(),
            'total_points_redeemed' => RedeemCustomer::sum('redeem_points'),
            'redemptions_today' => RedeemCustomer::whereDate('created_at', today())->count(),
            'redemptions_this_month' => RedeemCustomer::whereMonth('created_at', date('m'))
                                                      ->whereYear('created_at', date('Y'))
                                                      ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get single redeemed customer details
     */
    public function show($id)
    {
        $redemption = RedeemCustomer::with(['user', 'reward'])->findOrFail($id);

        return response()->json([
            'id' => $redemption->id,
            'user' => $redemption->user ? [
                'id' => $redemption->user->id,
                'name' => $redemption->user->name,
                'email' => $redemption->user->email,
                'mobile' => $redemption->user->mobile,
                'points_balance' => $redemption->user->points_balance
            ] : null,
            'reward' => $redemption->reward ? [
                'id' => $redemption->reward->id,
                'name' => $redemption->reward->name,
                'description' => $redemption->reward->description,
                'points_required' => $redemption->reward->points_required
            ] : null,
            'rewards_name' => $redemption->rewards_name,
            'redeem_points' => $redemption->redeem_points,
            'redeem_status' => $redemption->redeem_status,
            'redeem_status_text' => $this->getRedeemStatusText($redemption->redeem_status),
            'delivery_status' => $redemption->delivery_status,
            'delivery_status_text' => $this->getDeliveryStatusText($redemption->delivery_status),
            'verified_at' => $redemption->verified_at,
            'created_at' => $redemption->created_at,
            'updated_at' => $redemption->updated_at
        ]);
    }

    /**
     * Update redemption status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'redeem_status' => 'sometimes|required|in:0,1,2',
            'delivery_status' => 'sometimes|required|in:0,1,2',
            'verified_at' => 'sometimes|required|boolean',
        ]);

        DB::beginTransaction();
        try {
            $redemption = RedeemCustomer::findOrFail($id);

            // Find corresponding reward_redemptions record using reward_redemption_id
            $rewardRedemption = null;
            if ($redemption->reward_redemption_id) {
                $rewardRedemption = RewardRedemption::find($redemption->reward_redemption_id);
            }

            // Handle verified_at update
            if ($request->has('verified_at') && $request->verified_at === true) {
                $redemption->verified_at = now();
                $redemption->redeem_status = 1; // Also set redeem_status to 1 (verified)
                
                // Update reward_redemptions table status to verified
                if ($rewardRedemption) {
                    $rewardRedemption->status = 'verified';
                    $rewardRedemption->save();
                }
            }

            // Handle redeem_status update (legacy support)
            if ($request->has('redeem_status')) {
                $redemption->redeem_status = $request->redeem_status;
                if ($request->redeem_status == 1 && !$redemption->verified_at) {
                    $redemption->verified_at = now();
                    
                    // Update reward_redemptions table status to verified
                    if ($rewardRedemption) {
                        $rewardRedemption->status = 'verified';
                        $rewardRedemption->save();
                    }
                }
            }

            // Handle delivery_status update
            if ($request->has('delivery_status')) {
                $redemption->delivery_status = $request->delivery_status;
                
                // If marked as delivered, update reward_redemptions table
                if ($request->delivery_status == 1 && $rewardRedemption) {
                    $cur_date=now();
                    $rewardRedemption->delivered_at = $cur_date;
                    $rewardRedemption->notes = "Product delivered at ".$cur_date;
                    //$rewardRedemption->status = 'delivered';
                    $rewardRedemption->save();
                }
            }

            $redemption->save();
            
            DB::commit();

            return response()->json([
                'message' => 'Redemption status updated successfully',
                'redemption' => $redemption
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to update redemption status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete redemption record
     */
    public function destroy($id)
    {
        $redemption = RedeemCustomer::findOrFail($id);
        $redemption->delete();

        return response()->json([
            'message' => 'Redemption record deleted successfully'
        ]);
    }

    /**
     * Bulk update redemption status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:redeem_customers,id',
            'redeem_status' => 'sometimes|required|in:0,1,2',
            'delivery_status' => 'sometimes|required|in:0,1,2',
        ]);

        DB::beginTransaction();
        try {
            $redemptions = RedeemCustomer::whereIn('id', $request->ids)->get();
            
            foreach ($redemptions as $redemption) {
                // Find corresponding reward_redemptions record using reward_redemption_id
                $rewardRedemption = null;
                if ($redemption->reward_redemption_id) {
                    $rewardRedemption = RewardRedemption::find($redemption->reward_redemption_id);
                }

                if ($request->has('redeem_status')) {
                    $redemption->redeem_status = $request->redeem_status;
                    if ($request->redeem_status == 1) {
                        $redemption->verified_at = now();
                        
                        // Update reward_redemptions table status to verified
                        if ($rewardRedemption) {
                            $rewardRedemption->status = 'verified';
                            $rewardRedemption->save();
                        }
                    }
                    else
                    {
                        $redemption->verified_at = null;
                        
                        // Update reward_redemptions table status to verified
                        if ($rewardRedemption) {
                            $rewardRedemption->status = 'pending';
                            $rewardRedemption->save();
                        }
                    }

                }

                if ($request->has('delivery_status')) {
                    $redemption->delivery_status = $request->delivery_status;
                    
                    // If marked as delivered, update reward_redemptions table
                    if ($request->delivery_status == 1 && $rewardRedemption) {
                        $cur_date=now();
                        $rewardRedemption->delivered_at = $cur_date;
                        $rewardRedemption->notes = "Product deliverd at ".$cur_date;
                        $rewardRedemption->save();
                    }
                    else
                    {
                        $rewardRedemption->delivered_at = null;
                        $rewardRedemption->notes = null;
                        $rewardRedemption->save();
                    }
                }

                $redemption->save();
            }
            
            DB::commit();

            return response()->json([
                'message' => 'Bulk update completed successfully',
                'updated' => count($request->ids)
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to update redemption status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get redeem status text
     */
    private function getRedeemStatusText($status)
    {
        switch ($status) {
            case 0:
                return 'Pending';
            case 1:
                return 'Verified';
            case 2:
                return 'Rejected';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get delivery status text
     */
    private function getDeliveryStatusText($status)
    {
        switch ($status) {
            case 0:
                return 'Not Delivered';
            case 1:
                return 'Delivered';
            case 2:
                return 'In Transit';
            default:
                return 'Unknown';
        }
    }

    /**
     * Export redeemed customers to CSV or Excel format
     */
    public function export(Request $request)
    {
        try {
            // Get format from request (csv or xlsx)
            $format = strtolower(trim($request->get('format', 'csv')));
            
            // Validate format and ensure clean format
            if (!in_array($format, ['csv', 'xlsx'])) {
                $format = 'csv';
            }
            // Remove any extra characters from format
            $format = preg_replace('/[^a-z]/', '', $format);
            
            // Start with query builder
            $query = RedeemCustomer::with(['user', 'reward']);
            
            // Apply status filter based on verified_at column
            $status = $request->input('status');
            if ($status !== null && $status !== '') {
                if ($status == '0') {
                    // Not Verified - verified_at is NULL
                    $query->whereNull('verified_at');
                } elseif ($status == '1') {
                    // Verified - verified_at is NOT NULL
                    $query->whereNotNull('verified_at');
                }
            }
            
            // Apply delivery status filter
            $deliveryStatus = $request->input('deliveryStatus');
            if ($deliveryStatus !== null && $deliveryStatus !== '') {
                $query->where('delivery_status', $deliveryStatus);
            }
            
            // Apply date range filters
            $dateFrom = $request->input('dateFrom');
            $dateTo = $request->input('dateTo');
            if ($dateFrom && $dateFrom !== '') {
                $query->whereDate('created_at', '>=', $dateFrom);
            }
            if ($dateTo && $dateTo !== '') {
                $query->whereDate('created_at', '<=', $dateTo);
            }
            
            // Apply sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // Get filtered records
            $redeemedCustomers = $query->get();
            
            // Generate filename with timestamp (clean format)
            $filename = 'redeemed-customers-' . date('Y-m-d-H-i-s') . '.' . $format;
            
            if ($format === 'xlsx') {
                return $this->exportToExcel($redeemedCustomers, $filename);
            } else {
                return $this->exportToCSV($redeemedCustomers, $filename);
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
    private function exportToCSV($redeemedCustomers, $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=' . $filename,
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($redeemedCustomers) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Add headers
            fputcsv($file, [
                'ID',
                'Customer Name',
                'Customer Email',
                'Customer Mobile',
                'Country Code',
                'Current Points',
                'Reward Name',
                'Points Redeemed',
                'Verification Status',
                'Delivery Status',
                'Verified At',
                'Redeemed At',
                'Last Updated'
            ]);
            
            // Add data rows
            foreach ($redeemedCustomers as $redemption) {
                fputcsv($file, [
                    $redemption->id,
                    $redemption->user ? $redemption->user->name : 'N/A',
                    $redemption->user ? $redemption->user->email : 'N/A',
                    $redemption->user ? $redemption->user->mobile : 'N/A',
                    $redemption->user ? $redemption->user->country_code : 'N/A',
                    $redemption->user ? $redemption->user->points_balance : 0,
                    $redemption->rewards_name,
                    $redemption->redeem_points,
                    $redemption->verified_at ? 'Verified' : 'Not Verified',
                    $this->getDeliveryStatusText($redemption->delivery_status),
                    $redemption->verified_at ? $redemption->verified_at->format('Y-m-d H:i:s') : '',
                    $redemption->created_at->format('Y-m-d H:i:s'),
                    $redemption->updated_at->format('Y-m-d H:i:s')
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to Excel XLSX format
     */
    private function exportToExcel($redeemedCustomers, $filename)
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
        
        $xml .= '<Worksheet ss:Name="Redeemed Customers">';
        $xml .= '<Table>';
        
        // Add header row
        $xml .= '<Row>';
        $headers = ['ID', 'Customer Name', 'Customer Email', 'Customer Mobile', 'Country Code', 'Current Points', 'Reward Name', 'Points Redeemed', 'Verification Status', 'Delivery Status', 'Verified At', 'Redeemed At', 'Last Updated'];
        foreach ($headers as $header) {
            $xml .= '<Cell ss:StyleID="Header"><Data ss:Type="String">' . htmlspecialchars($header) . '</Data></Cell>';
        }
        $xml .= '</Row>';
        
        // Add data rows
        foreach ($redeemedCustomers as $redemption) {
            $xml .= '<Row>';
            $data = [
                $redemption->id,
                $redemption->user ? $redemption->user->name : 'N/A',
                $redemption->user ? $redemption->user->email : 'N/A',
                $redemption->user ? $redemption->user->mobile : 'N/A',
                $redemption->user ? $redemption->user->country_code : 'N/A',
                $redemption->user ? $redemption->user->points_balance : 0,
                $redemption->rewards_name,
                $redemption->redeem_points,
                $redemption->verified_at ? 'Verified' : 'Not Verified',
                $this->getDeliveryStatusText($redemption->delivery_status),
                $redemption->verified_at ? $redemption->verified_at->format('Y-m-d H:i:s') : '',
                $redemption->created_at->format('Y-m-d H:i:s'),
                $redemption->updated_at->format('Y-m-d H:i:s')
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