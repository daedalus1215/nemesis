import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAccountRequestDto } from './create-account.request.dto';

export const CreateAccountSwagger = () => {
  return applyDecorators(
    ApiTags('Account'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create an account',
      description:
        'Creates a new account for the authenticated user. The account can be of different types (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE) with ASSET being the default type.',
      tags: ['Account'],
    }),
    ApiBody({
      type: CreateAccountRequestDto,
      description: 'Account creation details',
      examples: {
        'Basic Asset Account': {
          summary: 'Create a basic asset account',
          description: 'Creates a new asset account with a custom name',
          value: {
            name: 'My Savings Account',
            accountType: 'ASSET',
          },
        },
        'Liability Account': {
          summary: 'Create a liability account',
          description: 'Creates a new liability account',
          value: {
            name: 'Credit Card Debt',
            accountType: 'LIABILITY',
          },
        },
        'Default Type': {
          summary: 'Create account with default type',
          description:
            'Creates an account without specifying type (defaults to ASSET)',
          value: {
            name: 'Emergency Fund',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Account created successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 123 },
          name: { type: 'string', example: 'My Savings Account' },
          accountType: { type: 'string', example: 'ASSET' },
          isDefault: { type: 'boolean', example: false },
          success: { type: 'boolean', example: true },
        },
      },
      examples: {
        'Success Response': {
          summary: 'Account created successfully',
          value: {
            id: 123,
            name: 'My Savings Account',
            accountType: 'ASSET',
            isDefault: false,
            success: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'array',
            items: { type: 'string' },
            example: [
              'name should not be empty',
              'name must be shorter than or equal to 50 characters',
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
