import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsernameResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'The new username',
    example: 'janedoe',
  })
  username: string;
}
