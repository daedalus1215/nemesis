import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const FetchUserAccountsSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get user accounts',
      description: 'Retrieves all accounts owned by the authenticated user.',
      tags: ['Account'],
    }),
    ApiResponse({
      status: 200,
      description: 'User accounts retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          accounts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 123 },
                name: { type: 'string', example: 'My Savings Account' },
                accountType: { type: 'string', example: 'ASSET' },
                isDefault: { type: 'boolean', example: false },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-15T10:30:00Z',
                },
              },
            },
          },
          success: { type: 'boolean', example: true },
        },
      },
      examples: {
        'Success Response': {
          summary: 'User accounts retrieved',
          value: {
            accounts: [
              {
                id: 123,
                name: 'My Savings Account',
                accountType: 'ASSET',
                isDefault: false,
                createdAt: '2024-01-15T10:30:00Z',
              },
              {
                id: 124,
                name: 'My Checking Account',
                accountType: 'ASSET',
                isDefault: true,
                createdAt: '2024-01-10T09:15:00Z',
              },
            ],
            success: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing authentication token',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
  );
};
