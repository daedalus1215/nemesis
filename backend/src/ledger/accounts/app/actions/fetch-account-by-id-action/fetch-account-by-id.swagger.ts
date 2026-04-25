import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const FetchAccountByIdSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get user account by id',
      description:
        'Retrieves detailed information about a specific account owned by the authenticated user.',
      tags: ['Account'],
    }),
    ApiParam({
      name: 'accountId',
      type: 'number',
      description: 'The ID of the account to retrieve',
      example: 123,
    }),
    ApiResponse({
      status: 200,
      description: 'Account details retrieved successfully',
      schema: {
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
      examples: {
        'Success Response': {
          summary: 'Account details retrieved',
          value: {
            id: 123,
            name: 'My Savings Account',
            accountType: 'ASSET',
            isDefault: false,
            createdAt: '2024-01-15T10:30:00Z',
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
