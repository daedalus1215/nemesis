import { Injectable } from '@nestjs/common';
import { User } from 'src/users/domain/entities/user.entity';
import { FetchProfileResponseDto } from './fetch-profile.response.dto';

@Injectable()
export class FetchProfileResponder {
  public toDto(entity: User): FetchProfileResponseDto {
    console.log(entity);
    return {
      username: entity.username,
      id: entity.id,
    };
  }
}
