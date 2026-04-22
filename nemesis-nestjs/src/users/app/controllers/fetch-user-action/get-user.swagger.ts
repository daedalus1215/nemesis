import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FetchUserResponseDto } from './fetch-user.response.dto';

export const GetUsersSwagger = () => {
  return applyDecorators(
    ApiTags('users'),
    ApiOperation({ summary: 'Get list of all users' }),
    ApiResponse({
      status: 200,
      description: 'List of users retrieved successfully',
      type: [FetchUserResponseDto],
    }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
};
