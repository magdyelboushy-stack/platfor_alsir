<?php

namespace App\Utils;

/**
 * Rate Limiter
 * Prevents Brute Force attacks
 */
class RateLimiter {
    private $storage;
    
    public function __construct() {
        // Using temporary files for simplicity. Redis or DB is recommended for production.
        $this->storage = sys_get_temp_dir() . '/rate_limiter/';
        
        if (!is_dir($this->storage)) {
            mkdir($this->storage, 0755, true);
        }
    }
    
    /**
     * Check request rate
     * 
     * @param string $action Operation type (login, register, etc.)
     * @param string $identifier Identifier (IP, user ID, etc.)
     * @param int $maxAttempts Maximum attempts allowed
     * @param int $decaySeconds Time window in seconds
     * @return bool
     */
    public function check($action, $identifier, $maxAttempts = 5, $decaySeconds = 60) {
        $key = $this->getKey($action, $identifier);
        $attempts = $this->getAttempts($key);
        
        // Cleanup old attempts
        $attempts = array_filter($attempts, function($timestamp) use ($decaySeconds) {
            return (time() - $timestamp) < $decaySeconds;
        });
        
        if (count($attempts) >= $maxAttempts) {
            return false;
        }
        
        // Add new attempt
        $attempts[] = time();
        $this->saveAttempts($key, $attempts);
        
        return true;
    }
    
    /**
     * Reset attempts
     */
    public function reset($action, $identifier) {
        $key = $this->getKey($action, $identifier);
        $file = $this->storage . $key;
        
        if (file_exists($file)) {
            unlink($file);
        }
    }
    
    /**
     * Get remaining attempts
     */
    public function remaining($action, $identifier, $maxAttempts = 5, $decaySeconds = 60) {
        $key = $this->getKey($action, $identifier);
        $attempts = $this->getAttempts($key);
        
        $attempts = array_filter($attempts, function($timestamp) use ($decaySeconds) {
            return (time() - $timestamp) < $decaySeconds;
        });
        
        return max(0, $maxAttempts - count($attempts));
    }
    
    protected function getKey($action, $identifier) {
        return hash('sha256', $action . '|' . $identifier);
    }
    
    protected function getAttempts($key) {
        $file = $this->storage . $key;
        
        if (!file_exists($file)) {
            return [];
        }
        
        $data = file_get_contents($file);
        return json_decode($data, true) ?? [];
    }
    
    protected function saveAttempts($key, $attempts) {
        $file = $this->storage . $key;
        file_put_contents($file, json_encode($attempts));
    }
}
