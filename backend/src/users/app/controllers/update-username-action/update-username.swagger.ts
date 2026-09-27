import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateUsernameRequestDto } from './update-username.request.dto';
import { UpdateUsernameResponseDto } from './update-username.response.dto';

export const UpdateUsernameSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: "Update the signed-in user's username" }),
    ApiBody({ type: UpdateUsernameRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Username updated successfully',
      type: UpdateUsernameResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input or current password is incorrect',
    }),
    ApiResponse({ status: 409, description: 'Username already exists' }),
  );
};
