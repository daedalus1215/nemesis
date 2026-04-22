import { Injectable } from '@nestjs/common';
import { User } from 'src/users/domain/entities/user.entity';
import { RegisterUserResponseDto } from './dtos/register-user-response.dto';

@Injectable()
export class RegisterUserResponder {
  public apply(entity: User): RegisterUserResponseDto {
    return {
      ...entity,
      id: entity.id.toString(),
    };
  }
}
