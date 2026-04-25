import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterUserRequestDto } from './dtos/register-user.request.dto';
import { RegisterUserResponseDto } from './dtos/register-user-response.dto';

export const RegisterUserSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: RegisterUserRequestDto }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
      type: RegisterUserResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Invalid input' }),
  );
};
