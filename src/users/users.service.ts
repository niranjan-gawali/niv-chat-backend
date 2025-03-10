import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserInput } from './dto/create-user.input/create-user.input';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/update-user.input/update-user.input';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserInput: CreateUserInput) {
    try {
      return await this.userRepository.create({
        ...createUserInput,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: await this.hashPassword(createUserInput.password),
      });
    } catch (err) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (err?.message?.includes('E11000')) {
        throw new UnprocessableEntityException('Email already exists!!');
      }
      throw err;
    }
  }

  private hashPassword(password: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return bcrypt.hash(password, 10);
  }

  async validateUser(username: string, password: string) {
    const user = await this.userRepository.findOne({ username });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect Credentials !!!');
    }
    return user;
  }

  // Udate user

  async updateUser(_id: string, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updateUserInput.password = await this.hashPassword(
        updateUserInput.password,
      );
    }

    return await this.userRepository.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...updateUserInput,
        },
      },
    );
  }
}
