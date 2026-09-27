import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordRequestDto {
  @ApiProperty({
    description: 'The current password',
    example: 'password123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'The new password',
    example: 'newpassword456',
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'newpassword456',
  })
  @IsString()
  confirmPassword: string;
}
