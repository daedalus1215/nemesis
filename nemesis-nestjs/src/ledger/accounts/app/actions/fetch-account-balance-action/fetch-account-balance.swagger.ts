import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const FetchAccountBalanceSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get account balance',
      description:
        'Retrieves the current balance for a specific account owned by the authenticated user.',
      tags: ['Account'],
    }),
    ApiParam({
      name: 'accountId',
      type: 'number',
      description: 'The ID of the account to get balance for',
      example: 123,
    }),
    ApiResponse({
      status: 200,
      description: 'Account balance retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          accountId: { type: 'number', example: 123 },
          balance: { type: 'number', example: 1500.75 },
          success: { type: 'boolean', example: true },
        },
      },
      examples: {
        'Success Response': {
          summary: 'Account balance retrieved',
          value: {
            accountId: 123,
            balance: 1500.75,
            success: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid account ID',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'string',
            example: 'Validation failed (numeric string is expected)',
          },
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
