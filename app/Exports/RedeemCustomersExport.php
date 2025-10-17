<?php

namespace App\Exports;

use App\Models\RedeemCustomer;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class RedeemCustomersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithEvents
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
        $this->query = RedeemCustomer::with(['user', 'reward']);
        
        // Apply status filter based on verified_at column
        if (isset($this->filters['status']) && $this->filters['status'] !== null && $this->filters['status'] !== '') {
            if ($this->filters['status'] == '0') {
                // Not Verified - verified_at is NULL
                $this->query->whereNull('verified_at');
            } elseif ($this->filters['status'] == '1') {
                // Verified - verified_at is NOT NULL
                $this->query->whereNotNull('verified_at');
            }
        }
        
        // Apply delivery status filter
        if (isset($this->filters['deliveryStatus']) && $this->filters['deliveryStatus'] !== null && $this->filters['deliveryStatus'] !== '') {
            $this->query->where('delivery_status', $this->filters['deliveryStatus']);
        }
        
        // Apply date range filters
        if (isset($this->filters['dateFrom']) && $this->filters['dateFrom'] && $this->filters['dateFrom'] !== '') {
            $this->query->whereDate('created_at', '>=', $this->filters['dateFrom']);
        }
        
        if (isset($this->filters['dateTo']) && $this->filters['dateTo'] && $this->filters['dateTo'] !== '') {
            $this->query->whereDate('created_at', '<=', $this->filters['dateTo']);
        }
        
        // Apply sorting
        $sortBy = $this->filters['sort_by'] ?? 'created_at';
        $sortOrder = $this->filters['sort_order'] ?? 'desc';
        $this->query->orderBy($sortBy, $sortOrder);
    }
    
    /**
     * @return Collection
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
            'Customer Name',
            'Customer Email', 
            'Customer Mobile',
            'Country Code',
            'Current Points Balance',
            'Reward Name',
            'Points Redeemed',
            'Verification Status',
            'Delivery Status',
            'Verified At',
            'Redeemed At',
            'Last Updated'
        ];
    }
    
    /**
     * Map data for each row
     */
    public function map($redemption): array
    {
        return [
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
                $worksheet->getStyle("K2:K{$highestRow}")->getNumberFormat()
                    ->setFormatCode('yyyy-mm-dd hh:mm:ss');
                $worksheet->getStyle("L2:L{$highestRow}")->getNumberFormat()
                    ->setFormatCode('yyyy-mm-dd hh:mm:ss');
                $worksheet->getStyle("M2:M{$highestRow}")->getNumberFormat()
                    ->setFormatCode('yyyy-mm-dd hh:mm:ss');
            },
        ];
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
}