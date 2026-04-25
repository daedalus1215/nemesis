import { ApiProperty } from '@nestjs/swagger';

export class FetchProfileResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '1',
  })
  id: number;

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
    maxLength: 20,
  })
  username: string;
}
