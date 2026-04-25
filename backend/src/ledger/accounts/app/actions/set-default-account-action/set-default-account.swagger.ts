import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const SetDefaultAccountSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Set default account',
      description:
        'Sets a specific account as the default account for the authenticated user.',
      tags: ['Account'],
    }),
    ApiParam({
      name: 'accountId',
      type: 'number',
      description: 'The ID of the account to set as default',
      example: 123,
    }),
    ApiResponse({
      status: 200,
      description: 'Default account updated successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Default account updated successfully',
          },
        },
      },
      examples: {
        'Success Response': {
          summary: 'Default account set',
          value: {
            success: true,
            message: 'Default account updated successfully',
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
