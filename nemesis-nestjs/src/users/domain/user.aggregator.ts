import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/users/infrastructure/user.repository';
import { User } from './entities/user.entity';

type UserInfo = {
  id: number;
  username: string;
};

@Injectable()
export class UserAggregator {
  constructor(private readonly repository: UserRepository) {}

  async getUsersByIds(userIds: number[]): Promise<UserInfo[]> {
    if (userIds.length === 0) return [];

    try {
      const users = await this.repository.findByIds(userIds);
      return users.map((user) => ({
        id: user.id,
        username: user.username,
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.repository.findByUsernameWithPassword(username);
  }
}
