import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUsernameRequestDto {
  @ApiProperty({
    description: 'The new username',
    example: 'janedoe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  newUsername: string;

  @ApiProperty({
    description: 'The current password',
    example: 'password123',
  })
  @IsString()
  currentPassword: string;
}
