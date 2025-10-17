<?php

namespace App\Overrides;

/**
 * Override for PHPSpreadsheet File class to remove ZipArchive dependency
 */
class PhpSpreadsheetFile
{
    /**
     * Override the fileExists method to avoid ZipArchive usage
     */
    public static function fileExists($filename)
    {
        // Skip ZIP file checks that require ZipArchive
        if (strtolower(substr($filename, 0, 6)) == 'zip://') {
            return false;
        }
        
        return file_exists($filename);
    }
    
    /**
     * Override assertFile to avoid ZipArchive usage
     */
    public static function assertFile($filename, $zipMember = null)
    {
        if ($zipMember !== null) {
            // Skip ZIP member checks
            return;
        }
        
        if (!is_file($filename)) {
            throw new \Exception('File "' . $filename . '" does not exist');
        }
    }
}