import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const FetchUserBalanceSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get user balance',
      description:
        'Retrieves the total balance across all accounts owned by the authenticated user.',
      tags: ['Account'],
    }),
    ApiResponse({
      status: 200,
      description: 'User total balance retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          totalBalance: { type: 'number', example: 2500.75 },
          userId: { type: 'number', example: 456 },
          success: { type: 'boolean', example: true },
        },
      },
      examples: {
        'Success Response': {
          summary: 'User total balance retrieved',
          value: {
            totalBalance: 2500.75,
            userId: 456,
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
