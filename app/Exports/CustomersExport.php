<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Facades\DB;

class CustomersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithEvents
{
    protected $filters;
    protected $query;
    
    public function __construct($filters = [])
    {
        $this->filters = $filters;
        $this->buildQuery();
    }
    
    /**
     * Build query based on filters
     */
    protected function buildQuery()
    {
        $this->query = User::where('role_id', 2); // role_id=2 for customers
        
        // Apply search filter
        if (isset($this->filters['search']) && $this->filters['search']) {
            $search = $this->filters['search'];
            $this->query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }
        
        // Apply status filter
        if (isset($this->filters['status']) && $this->filters['status']) {
            $this->query->where('status', $this->filters['status']);
        }
        
        // Apply date range filters
        if (isset($this->filters['date_from']) && $this->filters['date_from']) {
            $this->query->whereDate('created_at', '>=', $this->filters['date_from']);
        }
        
        if (isset($this->filters['date_to']) && $this->filters['date_to']) {
            $this->query->whereDate('created_at', '<=', $this->filters['date_to']);
        }
        
        // Apply sorting
        $sortBy = $this->filters['sort_by'] ?? 'created_at';
        $sortOrder = $this->filters['sort_order'] ?? 'desc';
        $this->query->orderBy($sortBy, $sortOrder);
    }
    
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->query->get();
    }
    
    /**
     * Define the headings for Excel
     */
    public function headings(): array
    {
        return [
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
        ];
    }
    
    /**
     * Map data for each row
     */
    public function map($customer): array
    {
        // Get customer statistics
        $totalPurchases = DB::table('purchases')->where('user_id', $customer->id)->count();
        $totalRedemptions = DB::table('reward_redemptions')->where('user_id', $customer->id)->count();
        
        return [
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
    }
    
    /**
     * Style the Excel sheet
     */
    public function styles(Worksheet $sheet)
    {
        // Style the header row
        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2F75B5'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ]);
        
        // Add borders to all cells
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        
        $sheet->getStyle("A1:{$highestColumn}{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => 'DDDDDD'],
                ],
            ],
        ]);
        
        return [];
    }
    
    /**
     * Register events for additional formatting
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $worksheet = $event->sheet->getDelegate();
                
                // Freeze the first row (headers)
                $worksheet->freezePane('A2');
                
                // Set row height for header
                $worksheet->getRowDimension(1)->setRowHeight(25);
                
                // Add autofilter to headers
                $highestColumn = $worksheet->getHighestColumn();
                $worksheet->setAutoFilter("A1:{$highestColumn}1");
                
                // Format date columns
                $highestRow = $worksheet->getHighestRow();
                if ($highestRow > 1) {
                    $worksheet->getStyle("J2:J{$highestRow}")->getNumberFormat()
                        ->setFormatCode('yyyy-mm-dd');
                    $worksheet->getStyle("K2:K{$highestRow}")->getNumberFormat()
                        ->setFormatCode('yyyy-mm-dd hh:mm:ss');
                    $worksheet->getStyle("L2:L{$highestRow}")->getNumberFormat()
                        ->setFormatCode('yyyy-mm-dd hh:mm:ss');
                    $worksheet->getStyle("M2:M{$highestRow}")->getNumberFormat()
                        ->setFormatCode('yyyy-mm-dd hh:mm:ss');
                }
            },
        ];
    }
}