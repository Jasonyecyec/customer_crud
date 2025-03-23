<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ElasticsearchService;
use App\Models\Customer;

class CustomerController extends Controller
{

    protected $elasticsearch;

    public function __construct(ElasticsearchService $elasticsearch)
    {
        $this->elasticsearch = $elasticsearch;
    }


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has('search')) {
            \Log::info("message");
            $results = $this->elasticsearch->searchCustomers($request->input('search'));
            return response()->json([
                'success' => true,
                'message' => 'Search results retrieved successfully.',
                'data' => $results
            ]);
        }

        $customers = Customer::all();
        return response()->json([
            'success' => true,
            'message' => 'Customers retrieved successfully.',
            'data' => $customers
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email:dns,rfc|unique:customers,email|max:255',
                'contact_number' => 'nullable|string|max:20'
            ]);

             // Create the customer
            $customer = Customer::create($validated);
        
            // Index the customer in Elasticsearch
            $this->elasticsearch->indexCustomer($customer);
        
            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully.',
                'data' => $customer
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Check if the error is due to a duplicate email
            if ($e->validator->errors()->has('email')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer with this email already exists.',
                    'data' => null
                ], 409); 
            }
    
            // Return other validation errors if any
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $e->validator->errors()
            ], 422);
        }
    
       
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Customer retrieved successfully.',
            'data' => $customer
        ], 200);
    }

    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try{
            $customer = Customer::findOrFail($id);

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found.'
                ], 404);
            }

            $validated = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email:dns,rfc|max:255|unique:customers,email,' . $id,
                'contact_number' => 'nullable|string|max:20',
            ]);
    
          
            $customer->update($validated);
            $this->elasticsearch->updateCustomer($customer);
            $customer = Customer::find($id);
       
            return response()->json([
                'success' => true,
                'message' => 'Customer updated  successfully.',
                'data' => $customer
            ], 200);
        }catch (\Illuminate\Validation\ValidationException $e) {
            // Check if the error is due to a duplicate email
            if ($e->validator->errors()->has('email')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer with this email already exists.',
                    'data' => null
                ], 409); 
            }
    
            // Return other validation errors if any
            return response()->json([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => $e->validator->errors()
            ], 422);
        }
       
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found.'
            ], 404);
        }

        $customer->delete();
        $this->elasticsearch->deleteCustomer($id);
        
        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully.'
        ], 200); 
    }
}
