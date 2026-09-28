import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdatePasswordRequestDto } from './update-password.request.dto';

export const UpdatePasswordSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: "Update the signed-in user's password" }),
    ApiBody({ type: UpdatePasswordRequestDto }),
    ApiResponse({ status: 200, description: 'Password updated successfully' }),
    ApiResponse({
      status: 400,
      description: 'Invalid input or current password is incorrect',
    }),
  );
};
