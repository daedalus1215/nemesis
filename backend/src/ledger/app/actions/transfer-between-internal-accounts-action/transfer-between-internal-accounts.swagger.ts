import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const TransferBetweenInternalAccountsSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Transfer between internal accounts',
      description:
        'Transfers money between two accounts owned by the authenticated user.',
      tags: ['Account'],
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          fromAccountId: {
            type: 'number',
            description: 'ID of the source account',
            example: 123,
          },
          toAccountId: {
            type: 'number',
            description: 'ID of the destination account',
            example: 124,
          },
          amount: {
            type: 'number',
            description: 'Amount to transfer',
            example: 100.5,
          },
          description: {
            type: 'string',
            description: 'Optional description for the transfer',
            example: 'Transfer to savings',
          },
        },
        required: ['fromAccountId', 'toAccountId', 'amount'],
      },
      examples: {
        'Internal Transfer': {
          summary: 'Transfer between your accounts',
          description: 'Transfers money from one of your accounts to another',
          value: {
            fromAccountId: 123,
            toAccountId: 124,
            amount: 100.5,
            description: 'Transfer to savings',
          },
        },
        'Transfer without description': {
          summary: 'Transfer without description',
          description: 'Simple internal transfer without optional description',
          value: {
            fromAccountId: 123,
            toAccountId: 124,
            amount: 50.0,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Transfer completed successfully',
      schema: {
        type: 'object',
        properties: {
          transactionId: { type: 'number', example: 123 },
          fromAccountId: { type: 'number', example: 123 },
          toAccountId: { type: 'number', example: 124 },
          amount: { type: 'number', example: 100.5 },
          description: { type: 'string', example: 'Transfer to savings' },
          success: { type: 'boolean', example: true },
        },
      },
      examples: {
        'Success Response': {
          summary: 'Transfer completed',
          value: {
            transactionId: 123,
            fromAccountId: 123,
            toAccountId: 124,
            amount: 100.5,
            description: 'Transfer to savings',
            success: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid transfer data',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'array',
            items: { type: 'string' },
            example: [
              'fromAccountId must be a positive number',
              'toAccountId must be a positive number',
              'amount must be a positive number',
            ],
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
          message: {
            type: 'string',
            example: 'Access denied to one or both accounts',
          },
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
          message: {
            type: 'string',
            example: 'One or both accounts not found',
          },
        },
      },
    }),
    ApiResponse({
      status: 422,
      description:
        'Unprocessable Entity - Insufficient funds or invalid transfer',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 422 },
          message: {
            type: 'string',
            example: 'Insufficient funds for transfer',
          },
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
