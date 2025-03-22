<?php

namespace App\Services;

use Elastic\Elasticsearch\ClientBuilder;

class ElasticsearchService
{
    protected $client;
    protected $index = 'customers';

    public function __construct()
    {
        $this->client = ClientBuilder::create()
            // ->setHosts(config('elasticsearch.hosts'))
            ->setHosts(['http://searcher:9200'])
            ->build();
    }

    public function indexCustomer($customer)
    {
        $params = [
            'index' => $this->index,
            'id' => $customer->id,
            'body' => [
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'contact_number' => $customer->contact_number ?? null,
            ],
        ];
        return $this->client->index($params);
    }

    public function updateCustomer($customer)
    {
        $params = [
            'index' => $this->index,
            'id' => $customer->id,
            'body' => [
                'doc' => [
                    'first_name' => $customer->first_name,
                    'last_name' => $customer->last_name,
                    'email' => $customer->$email,
                    'contact_number' => $customer->contact_number ?? null,
                ],
            ],
        ];
        return $this->client->update($params);
    }

    public function deleteCustomer($id)
    {
        $params = [
            'index' => $this->index,
            'id' => $id,
        ];
        return $this->client->delete($params);
    }
    public function searchCustomers($query)
    {
        $params = [
            'index' => $this->index,
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
        try {
            $response = $this->client->search($params);
            \Log::info('Elasticsearch search response:', [$response]);
            return array_map(fn($hit) => $hit['_source'], $response['hits']['hits']);
        } catch (\Exception $e) {
            \Log::error('Elasticsearch search failed:', ['error' => $e->getMessage()]);
            return [];
        }
    }
}