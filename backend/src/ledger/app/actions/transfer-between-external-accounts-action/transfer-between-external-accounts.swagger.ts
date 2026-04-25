import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const TransferBetweenExternalAccountsSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Transfer between users default accounts',
      description:
        "Transfers money from the authenticated user's default account to another user's default account.",
      tags: ['Account'],
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          toUserId: {
            type: 'number',
            description: 'ID of the user to transfer money to',
            example: 789,
          },
          amount: {
            type: 'number',
            description: 'Amount to transfer',
            example: 100.5,
          },
          description: {
            type: 'string',
            description: 'Optional description for the transfer',
            example: 'Payment for services',
          },
        },
        required: ['toUserId', 'amount'],
      },
      examples: {
        'Basic Transfer': {
          summary: 'Transfer money to another user',
          description:
            "Transfers money from your default account to another user's default account",
          value: {
            toUserId: 789,
            amount: 100.5,
            description: 'Payment for services',
          },
        },
        'Transfer without description': {
          summary: 'Transfer without description',
          description: 'Simple transfer without optional description',
          value: {
            toUserId: 789,
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
          toAccountId: { type: 'number', example: 456 },
          amount: { type: 'number', example: 100.5 },
          description: { type: 'string', example: 'Payment for services' },
          success: { type: 'boolean', example: true },
        },
      },
      examples: {
        'Success Response': {
          summary: 'Transfer completed',
          value: {
            transactionId: 123,
            fromAccountId: 123,
            toAccountId: 456,
            amount: 100.5,
            description: 'Payment for services',
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
              'toUserId must be a positive number',
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
      status: 404,
      description: 'Not Found - User or account not found',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: 'User or default account not found',
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
