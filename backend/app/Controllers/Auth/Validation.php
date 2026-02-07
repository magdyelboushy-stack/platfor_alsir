<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Utils\Validator;

class Validation extends BaseController {
    
    public function check() {
        $data = $this->getInput();
        $csrfToken = $data['csrf_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null);
        if (!\App\Utils\CSRF::validate($csrfToken)) {
            $this->json(['error' => 'Invalid CSRF token'], 403);
        }

        $allowedFields = [
            'name', 'email', 'phone',
            'birth_date', 'gender', 'grade_level', 'education_stage',
            'guardian_name', 'parent_phone', 'governorate', 'city',
            'password', 'confirm_password'
        ];

        $fieldsToValidate = array_intersect_key($data, array_flip($allowedFields));
        
        $validator = new Validator();
        $rules = [];

        // Dynamic Rules based on fields present
        if (isset($fieldsToValidate['name'])) {
            $rules['name'] = 'required|min:3|max:50|unique:users,name';
        }
        if (isset($fieldsToValidate['email'])) {
            $rules['email'] = 'required|email|unique:users,email';
        }
        if (isset($fieldsToValidate['phone'])) {
            $rules['phone'] = 'required|egyptian_phone|unique:users,phone';
        }
        if (isset($fieldsToValidate['governorate'])) {
            $rules['governorate'] = 'required|min:2';
        }
        if (isset($fieldsToValidate['city'])) {
            $rules['city'] = 'required|min:2';
        }
        if (isset($fieldsToValidate['birth_date'])) {
            $rules['birth_date'] = 'required|date';
        }
        if (isset($fieldsToValidate['gender'])) {
            $rules['gender'] = 'required|in:male,female';
        }
        if (isset($fieldsToValidate['grade_level'])) {
            $rules['grade_level'] = 'required|in:1,2,3,4,5,6,7,8,9,10,11,12';
        }
        if (isset($fieldsToValidate['education_stage'])) {
            $rules['education_stage'] = 'required|in:primary,prep,secondary';
        }
        if (isset($fieldsToValidate['guardian_name'])) {
            $rules['guardian_name'] = 'required|min:3';
        }
        if (isset($fieldsToValidate['parent_phone'])) {
            $rules['parent_phone'] = 'required|egyptian_phone|different:phone';
        }
        if (isset($fieldsToValidate['password'])) {
            $rules['password'] = 'required|password_strength';
        }

        // Validate
        if (!$validator->validate($fieldsToValidate, $rules)) {
            $this->json(['error' => 'Validation failed', 'errors' => $validator->getErrors()], 422);
        }

        $this->json(['message' => 'Valid', 'status' => true]);
    }
}
