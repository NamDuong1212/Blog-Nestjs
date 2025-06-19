import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { username, bio, birthday } = updateUserDto;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (birthday) user.birthday = birthday;

    await this.userRepository.save(user);
    return user;
  }

  async updateProfileAvatar(userId: string, avatarUrl: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }
}
