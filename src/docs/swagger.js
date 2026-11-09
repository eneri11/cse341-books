
const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'CSE 341 Books API',
        version: '1.0.0',
        description:
            'REST API for managing books and authors using Express and MongoDB.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server'
        },
        {
            url: 'https://cse341-books-ks1x.onrender.com',
            description: 'Deployed Render server'
        }
    ],
    tags: [
        {
            name: 'Books',
            description: 'Operations for managing books'
        },
        {
            name: 'Authors',
            description: 'Operations for managing authors'
        }
    ],
    paths: {
        '/books': {
            get: {
                tags: ['Books'],
                summary: 'Get all books',
                responses: {
                    200: {
                        description: 'List of books retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Book'
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            post: {
                tags: ['Books'],
                summary: 'Create a book',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/NewBook'
                            },
                            example: {
                                id: 'b4',
                                authorId: 'a1',
                                title: 'A New Beginning',
                                publicationDate: '2024-06-15'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Book created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Book'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/books/{id}': {
            parameters: [
                {
                    $ref: '#/components/parameters/ResourceId'
                }
            ],
            get: {
                tags: ['Books'],
                summary: 'Get a book by ID',
                responses: {
                    200: {
                        description: 'Book retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Book'
                                }
                            }
                        }
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            put: {
                tags: ['Books'],
                summary: 'Update a book by ID',
                description:
                    'The book ID comes from the URL. Do not include id in the request body.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpdateBook'
                            },
                            example: {
                                authorId: 'a1',
                                title: 'An Updated Beginning',
                                publicationDate: '2025-02-10'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Updated book returned successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Book'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            delete: {
                tags: ['Books'],
                summary: 'Delete a book by ID',
                responses: {
                    204: {
                        description: 'Book deleted successfully; no response body'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/authors': {
            get: {
                tags: ['Authors'],
                summary: 'Get all authors',
                responses: {
                    200: {
                        description: 'List of authors retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Author'
                                    }
                                }
                            }
                        }
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            post: {
                tags: ['Authors'],
                summary: 'Create an author',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/NewAuthor'
                            },
                            example: {
                                id: 'a4',
                                name: 'Jordan Lee',
                                birthYear: 1988
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Author created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Author'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/authors/{id}': {
            parameters: [
                {
                    $ref: '#/components/parameters/ResourceId'
                }
            ],
            get: {
                tags: ['Authors'],
                summary: 'Get an author by ID',
                responses: {
                    200: {
                        description: 'Author retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Author'
                                }
                            }
                        }
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            put: {
                tags: ['Authors'],
                summary: 'Update an author by ID',
                description:
                    'The author ID comes from the URL. Do not include id in the request body.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpdateAuthor'
                            },
                            example: {
                                name: 'Jordan Lee',
                                birthYear: 1989
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Updated author returned successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Author'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/BadRequest'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            delete: {
                tags: ['Authors'],
                summary: 'Delete an author by ID',
                responses: {
                    204: {
                        description: 'Author deleted successfully; no response body'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    409: {
                        description: 'Author cannot be deleted while referenced by books',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error'
                                }
                            }
                        }
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        }
    },
    components: {
        parameters: {
            ResourceId: {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Custom resource ID, such as b1 or a1',
                schema: {
                    type: 'string',
                    minLength: 1
                }
            }
        },
        schemas: {
            Book: {
                type: 'object',
                required: ['id', 'authorId', 'title', 'publicationDate'],
                properties: {
                    id: {
                        type: 'string',
                        example: 'b1'
                    },
                    authorId: {
                        type: 'string',
                        example: 'a1'
                    },
                    title: {
                        type: 'string',
                        example: 'Patterns of Light'
                    },
                    publicationDate: {
                        type: 'string',
                        format: 'date',
                        example: '2021-08-17'
                    }
                }
            },
            NewBook: {
                type: 'object',
                required: ['id', 'authorId', 'title', 'publicationDate'],
                additionalProperties: false,
                properties: {
                    id: {
                        type: 'string',
                        minLength: 1,
                        example: 'b4'
                    },
                    authorId: {
                        type: 'string',
                        minLength: 1,
                        example: 'a1'
                    },
                    title: {
                        type: 'string',
                        minLength: 1,
                        example: 'A New Beginning'
                    },
                    publicationDate: {
                        type: 'string',
                        format: 'date',
                        example: '2024-06-15'
                    }
                }
            },
            UpdateBook: {
                type: 'object',
                required: ['authorId', 'title', 'publicationDate'],
                additionalProperties: false,
                properties: {
                    authorId: {
                        type: 'string',
                        minLength: 1,
                        example: 'a1'
                    },
                    title: {
                        type: 'string',
                        minLength: 1,
                        example: 'An Updated Beginning'
                    },
                    publicationDate: {
                        type: 'string',
                        format: 'date',
                        example: '2025-02-10'
                    }
                }
            },
            Author: {
                type: 'object',
                required: ['id', 'name', 'birthYear'],
                properties: {
                    id: {
                        type: 'string',
                        example: 'a1'
                    },
                    name: {
                        type: 'string',
                        example: 'Maya Rivera'
                    },
                    birthYear: {
                        type: 'integer',
                        example: 1985
                    }
                }
            },
            NewAuthor: {
                type: 'object',
                required: ['id', 'name', 'birthYear'],
                additionalProperties: false,
                properties: {
                    id: {
                        type: 'string',
                        minLength: 1,
                        example: 'a4'
                    },
                    name: {
                        type: 'string',
                        minLength: 1,
                        example: 'Jordan Lee'
                    },
                    birthYear: {
                        type: 'integer',
                        example: 1988
                    }
                }
            },
            UpdateAuthor: {
                type: 'object',
                required: ['name', 'birthYear'],
                additionalProperties: false,
                properties: {
                    name: {
                        type: 'string',
                        minLength: 1,
                        example: 'Jordan Lee'
                    },
                    birthYear: {
                        type: 'integer',
                        example: 1989
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Resource not found'
                    }
                }
            }
        },
        responses: {
            BadRequest: {
                description: 'Invalid request, duplicate ID, or missing referenced author',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            NotFound: {
                description: 'Requested resource not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            ServerError: {
                description: 'Unexpected server error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            }
        }
    }
};

export default swaggerSpec;
