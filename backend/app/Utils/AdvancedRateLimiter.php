<?php

namespace App\Utils;

/**
 * Advanced Rate Limiter
 * Improves Rate Limiting with User awareness
 */
class AdvancedRateLimiter extends RateLimiter {
    
    /**
     * Advanced check including IP and User
     */
    public function checkAdvanced($action, $ip, $userId = null, $maxAttempts = 5, $decaySeconds = 60) {
        // IP Check
        if (!$this->check($action . '_ip', $ip, $maxAttempts, $decaySeconds)) {
            \App\Middleware\RequestLogger::logSuspicious(
                "Rate limit exceeded for IP",
                ['action' => $action, 'ip' => $ip]
            );
            
            // Auto-block IP after 10x limit attempts (calculated by checking current attempts count)
            // Just simplifying logic here: if filtered check fails, it's failed.
            // Check abuse (if excessive spamming)
            $attempts = count($this->getAttempts($this->getKey($action . '_ip', $ip)));
            if ($attempts >= ($maxAttempts * 2)) {
                \App\Middleware\IPBlocker::block($ip, "Rate limit abuse", 3600);
            }
            
            return false;
        }
        
        // User Check (if logged in)
        if ($userId) {
            if (!$this->check($action . '_user', $userId, $maxAttempts, $decaySeconds)) {
                \App\Middleware\RequestLogger::logSuspicious(
                    "Rate limit exceeded for user",
                    ['action' => $action, 'user_id' => $userId]
                );
                return false;
            }
        }
        
        return true;
    }
    
    // Helper to access private parent method if needed, but since we inherit check(), we use public API.
    // We duplicate getKey/getAttempts logic if we needed specific access, but public methods suffice.
}
