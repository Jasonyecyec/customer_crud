<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\ElasticsearchService;
use Elastic\Elasticsearch\Client;
use Mockery;

class ElasticsearchServiceTest extends TestCase
{
    protected $client;
    protected $service;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }


    /**
     * Test indexing a customer in Elasticsearch.
     */
    public function testIndexCustomerIndexesDataCorrectly()
    {
        // Arrange
        $customer = (object) [
            'id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'contact_number' => '1234567890',
        ];

        $expectedParams = [
            'index' => 'customers',
            'id' => $customer->id,
            'body' => [
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'contact_number' => $customer->contact_number,
            ],
        ];

        $this->client->shouldReceive('index')
            ->once()
            ->with($expectedParams)
            ->andReturn(['result' => 'created']);

        // Act
        $result = $this->service->indexCustomer($customer);

        // Assert
        $this->assertEquals(['result' => 'created'], $result);
    }


    /**
     * Test updating a customer in Elasticsearch.
     */
    public function testUpdateCustomerUpdatesDataCorrectly()
    {
        // Arrange
        $customer = (object) [
            'id' => 1,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@newemail.com',
            'contact_number' => '9876543210',
        ];

        $expectedParams = [
            'index' => 'customers',
            'id' => $customer->id,
            'body' => [
                'doc' => [
                    'first_name' => $customer->first_name,
                    'last_name' => $customer->last_name,
                    'email' => $customer->email,
                    'contact_number' => $customer->contact_number,
                ],
            ],
        ];

        $this->client->shouldReceive('update')
            ->once()
            ->with($expectedParams)
            ->andReturn(['result' => 'updated']);

        // Act
        $result = $this->service->updateCustomer($customer);

        // Assert
        $this->assertEquals(['result' => 'updated'], $result);
    }

    /**
     * Test deleting a customer from Elasticsearch.
     */
    public function testDeleteCustomerDeletesDataCorrectly()
    {
        // Arrange
        $id = 1;

        $expectedParams = [
            'index' => 'customers',
            'id' => $id,
        ];

        $this->client->shouldReceive('delete')
            ->once()
            ->with($expectedParams)
            ->andReturn(['result' => 'deleted']);

        // Act
        $result = $this->service->deleteCustomer($id);

        // Assert
        $this->assertEquals(['result' => 'deleted'], $result);
    }


    /**
     * Test searching customers returns results.
     */
    public function testSearchCustomersReturnsResults()
    {
        // Arrange
        $query = 'jas';
        $expectedParams = [
            'index' => 'customers',
            'body' => [
                'query' => [
                    'bool' => [
                        'should' => [
                            [
                                'multi_match' => [
                                    'query' => $query,
                                    'fields' => ['first_name', 'last_name', 'email'],
                                    'fuzziness' => 'AUTO',
                                    'prefix_length' => 1,
                                ],
                            ],
                            [
                                'wildcard' => [
                                    'first_name' => [
                                        'value' => "*$query*",
                                        'case_insensitive' => true,
                                    ],
                                ],
                            ],
                        ],
                        'minimum_should_match' => 1,
                    ],
                ],
            ],
        ];

        $mockResponse = [
            'hits' => [
                'hits' => [
                    [
                        '_source' => [
                            'first_name' => 'Jason',
                            'last_name' => 'Yecyec',
                            'email' => 'jasonyecyec@gmail.com',
                            'contact_number' => '09216732715',
                        ],
                    ],
                ],
            ],
        ];

        $this->client->shouldReceive('search')
            ->once()
            ->with($expectedParams)
            ->andReturn($mockResponse);

        // Act
        $result = $this->service->searchCustomers($query);

        // Assert
        $this->assertEquals([
            [
                'first_name' => 'Jason',
                'last_name' => 'Yecyec',
                'email' => 'jasonyecyec@gmail.com',
                'contact_number' => '09216732715',
            ],
        ], $result);
    }

    /**
     * Test search handles exceptions gracefully.
     */
    public function testSearchCustomersHandlesException()
    {
        // Arrange
        $query = 'jas';
        $this->client->shouldReceive('search')
            ->once()
            ->andThrow(new \Exception('Elasticsearch error'));

        // Act
        $result = $this->service->searchCustomers($query);

        // Assert
        $this->assertEquals([], $result);
    }
}
