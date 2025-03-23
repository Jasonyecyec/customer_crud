<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Models\Customer;
use App\Services\ElasticsearchService;
use Tests\TestCase;
use Mockery;

class CustomerControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    /**
     * Test listing all customers wihout search
     */
    public function testIndexReturnsAllCustomers()
    {
        // Arrange
        Customer::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@gmail.com',
            'contact_number' => '1234567890'
        ]);

        Customer::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@gmail.com',
            'contact_number' => '12345123123'
        ]);

        //Act
        $response = $this->getJson('/api/customers');

        //Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customers retrieved successfully.',
                'data' => [
                    [
                        'first_name' => 'John',
                        'last_name' => 'Doe',
                        'email' => 'john.doe@example.com',
                        'contact_number' => '1234567890',
                    ],
                    [
                        'first_name' => 'Jane',
                        'last_name' => 'Smith',
                        'email' => 'jane.smith@example.com',
                        'contact_number' => '9876543210',
                    ],
                ],
            ]);
    }

    /**
     * Test searching customers using Elasticsearch
    */
    public function testIndexWithSearchReturnsResults()
    {
        // Arrange
        $this->mock(ElasticsearchSevice::class, function($mock){
            $mock->shouldReceive('searchCustomers')
                ->with('jas')
                ->once()
                ->andReturn([
                    [
                        'first_name' => 'Jason',
                        'last_name' => 'Yecyec',
                        'email' => 'jasonyecyec@gmail.com',
                        'contact_number' => '09216732715',
                    ],
                ]);
        });

        // Act
        $response = $this->getJson('api/customers?search=jas');

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Search results retrieved successfully.',
                'data' => [
                    [
                        'first_name' => 'Jason',
                        'last_name' => 'Yecyec',
                        'email' => 'jasonyecyec@gmail.com',
                        'contact_number' => '09216732715',
                    ],
                ],
            ]);
    }

    /**
     * Test creating a new customer successfully.
     */
    public function testStoreCreatesCustomerSuccessfully(){
        // Arrange
        $this->mock(ElasticsearchService::class, function($mock){
            $mock->shouldReceive('indexCustomer')
                ->once()
                ->andReturn(['result'=>'created']);
        });

        // Act
        $response = $this->postJson('/api/customers', [
            'first_name' => 'Alice',
            'last_name' => 'Johnson',
            'email' => 'alice.johnson@example.com',
            'contact_number' => '5555555555',
        ]);

        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Customer created successfully.',
                'data' => [
                    'first_name' => 'Alice',
                    'last_name' => 'Johnson',
                    'email' => 'alice.johnson@example.com',
                    'contact_number' => '5555555555',
                ],
            ]);

        $this->assertDatabaseHas('customers', [
            'first_name' => 'Alice',
            'email' => 'alice.johnson@example.com',
        ]);
    }

    /**
     * Test store fails with duplicate email.
     */
    public function testStoreFailsWithDuplicateEmail()
    {
        // Arrange
        Customer::factory()->create([
            'first_name' => 'Bob',
            'last_name' => 'Smith',
            'email' => 'bob.smith@example.com',
            'contact_number' => '1112223333',
        ]);

        // Act
        $response = $this->postJson('/api/customers', [
            'first_name' => 'Charlie',
            'last_name' => 'Brown',
            'email' => 'bob.smith@example.com',
            'contact_number' => '7778889999',
        ]);

        // Assert
        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'Customer with this email already exists.',
                'data' => null,
            ]);
    }

    /**
     * Test store fails with invalid data.
     */
    public function testStoreFailsWithInvalidData()
    {
        // Act
        $response = $this->postJson('/api/customers', [
            'first_name' => '',
            'last_name' => 'Brown',
            'email' => 'invalid-email',
            'contact_number' => '7778889999',
        ]);

        // Assert
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation error.',
                'errors' => [
                    'first_name' => ['The first name field is required.'],
                    'email' => ['The email field must be a valid email address.'],
                ],
            ]);
    }

    /**
     * Test retrieving a specific customer.
     */
    public function testShowReturnsCustomer()
    {
        // Arrange
        $customer = Customer::factory()->create([
            'first_name' => 'David',
            'last_name' => 'Wilson',
            'email' => 'david.wilson@example.com',
            'contact_number' => '2223334444',
        ]);

        // Act
        $response = $this->getJson("/api/customers/{$customer->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customer retrieved successfully.',
                'data' => [
                    'id' => $customer->id,
                    'first_name' => 'David',
                    'last_name' => 'Wilson',
                    'email' => 'david.wilson@example.com',
                    'contact_number' => '2223334444',
                ],
            ]);
    }

    /**
     * Test show fails for non-existent customer.
     */
    public function testShowFailsForNonExistentCustomer()
    {
        // Act
        $response = $this->getJson('/api/customers/999');

        // Assert
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Customer not found.',
            ]);
    }

    /**
     * Test updating a customer successfully.
     */
    public function testUpdateModifiesCustomerSuccessfully()
    {
        // Arrange
        $customer = Customer::factory()->create([
            'first_name' => 'Eve',
            'last_name' => 'Davis',
            'email' => 'eve.davis@example.com',
            'contact_number' => '6667778888',
        ]);

        // Mock ElasticsearchService::updateCustomer
        $this->mock(ElasticsearchService::class, function ($mock) use ($customer) {
            $mock->shouldReceive('updateCustomer')
                ->once()
                ->with(Mockery::on(function ($arg) use ($customer) {
                    return $arg->id === $customer->id;
                }))
                ->andReturn(['result' => 'updated']);
        });

        // Act
        $response = $this->putJson("/api/customers/{$customer->id}", [
            'first_name' => 'Eve',
            'last_name' => 'Davis',
            'email' => 'eve.davis@newemail.com',
            'contact_number' => '9998887776',
        ]);

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customer updated  successfully.',
                'data' => [
                    'first_name' => 'Eve',
                    'last_name' => 'Davis',
                    'email' => 'eve.davis@newemail.com',
                    'contact_number' => '9998887776',
                ],
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'email' => 'eve.davis@newemail.com',
        ]);
    }

    /**
     * Test update fails with duplicate email.
     */
    public function testUpdateFailsWithDuplicateEmail()
    {
        // Arrange
        $customer1 = Customer::factory()->create([
            'first_name' => 'Frank',
            'last_name' => 'Miller',
            'email' => 'frank.miller@example.com',
            'contact_number' => '3334445555',
        ]);
        $customer2 = Customer::factory()->create([
            'first_name' => 'Grace',
            'last_name' => 'Lee',
            'email' => 'grace.lee@example.com',
            'contact_number' => '6665554443',
        ]);

        // Act
        $response = $this->putJson("/api/customers/{$customer1->id}", [
            'first_name' => 'Frank',
            'last_name' => 'Miller',
            'email' => 'grace.lee@example.com',
            'contact_number' => '3334445555',
        ]);

        // Assert: Check for validation error
        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'Customer with this email already exists.',
                'data' => null,
            ]);
    }

    /**
     * Test update fails for non-existent customer.
     */
    public function testUpdateFailsForNonExistentCustomer()
    {
        // Act
        $response = $this->putJson('/api/customers/999', [
            'first_name' => 'Henry',
            'last_name' => 'Clark',
            'email' => 'henry.clark@example.com',
            'contact_number' => '1112223333',
        ]);

        // Assert
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Customer not found.',
            ]);
    }

    /**
     * Test deleting a customer successfully.
     */
    public function testDestroyDeletesCustomerSuccessfully()
    {
        // Arrange
        $customer = Customer::factory()->create([
            'first_name' => 'Henry',
            'last_name' => 'Clark',
            'email' => 'henry.clark@example.com',
            'contact_number' => '1112223333',
        ]);

        // Mock ElasticsearchService::deleteCustomer
        $this->mock(ElasticsearchService::class, function ($mock) use ($customer) {
            $mock->shouldReceive('deleteCustomer')
                ->once()
                ->with($customer->id)
                ->andReturn(['result' => 'deleted']);
        });

        // Act:
        $response = $this->deleteJson("/api/customers/{$customer->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customer deleted successfully.',
            ]);

        $this->assertDatabaseMissing('customers', [
            'id' => $customer->id,
        ]);
    }

    /**
     * Test destroy fails for non-existent customer.
     */
    public function testDestroyFailsForNonExistentCustomer()
    {
        // Act: Try to delete a non-existent customer
        $response = $this->deleteJson('/api/customers/999');

        // Assert: Check for not found response
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Customer not found.',
            ]);
    }

}
