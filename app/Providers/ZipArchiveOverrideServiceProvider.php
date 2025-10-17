<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ZipArchiveOverrideServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register()
    {
        // Override ZipArchive class if it doesn't exist
        if (!class_exists('ZipArchive')) {
            // Create a dummy ZipArchive class to prevent errors
            eval('
                class ZipArchive {
                    const CREATE = 1;
                    const OVERWRITE = 8;
                    
                    public function open($filename, $flags = 0) {
                        return false;
                    }
                    
                    public function close() {
                        return false;
                    }
                    
                    public function getFromName($name) {
                        return false;
                    }
                    
                    public function addFromString($name, $content) {
                        return false;
                    }
                    
                    public function extractTo($destination, $entries = null) {
                        return false;
                    }
                }
            ');
        }
    }

    /**
     * Bootstrap services.
     */
    public function boot()
    {
        //
    }
}