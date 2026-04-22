import { User } from 'src/users/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { FetchUserResponseDto } from './fetch-user.response.dto';

@Injectable()
export class FetchUserResponder {
  public apply(entities: User[]): FetchUserResponseDto[] {
    console.log(entities);
    return entities.map((entity) => ({
      username: entity.username,
      id: entity.id,
    }));
  }
}
