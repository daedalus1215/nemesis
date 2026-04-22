import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const FetchAccountPaymentHistorySwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get account transaction history',
      description:
        'Retrieves the payment/transaction history for a specific account owned by the authenticated user with pagination support.',
      tags: ['Account'],
    }),
    ApiParam({
      name: 'accountId',
      type: 'number',
      description: 'The ID of the account to get payment history for',
      example: 123,
    }),
    ApiQuery({
      name: 'limit',
      type: 'number',
      description: 'Maximum number of transactions to return',
      required: false,
      example: 50,
    }),
    ApiQuery({
      name: 'offset',
      type: 'number',
      description: 'Number of transactions to skip for pagination',
      required: false,
      example: 0,
    }),
    ApiResponse({
      status: 200,
      description: 'Account payment history retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of transaction objects',
          },
          currentBalance: { type: 'number', example: 1500.75 },
          accountInfo: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 123 },
              name: { type: 'string', example: 'My Savings Account' },
              accountType: { type: 'string', example: 'ASSET' },
            },
          },
          success: { type: 'boolean', example: true },
        },
      },
      examples: {
        'Success Response': {
          summary: 'Payment history retrieved',
          value: {
            transactions: [
              {
                id: 'txn_123',
                amount: 100.5,
                description: 'Transfer from checking',
                createdAt: '2024-01-15T10:30:00Z',
              },
            ],
            currentBalance: 1500.75,
            accountInfo: {
              id: 123,
              name: 'My Savings Account',
              accountType: 'ASSET',
            },
            success: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid parameters',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
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
      status: 403,
      description: 'Forbidden - Account does not belong to user',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Access denied to this account' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Account does not exist',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Account not found' },
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
