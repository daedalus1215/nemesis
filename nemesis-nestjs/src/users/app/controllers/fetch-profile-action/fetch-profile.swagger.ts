import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FetchProfileResponseDto } from './fetch-profile.response.dto';

export const FetchProfileSwagger = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get user profile' }),
    ApiResponse({
      status: 200,
      description: 'User profile retrieved successfully',
      type: FetchProfileResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
};
