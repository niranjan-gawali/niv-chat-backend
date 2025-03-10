import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserOutput } from './dto/user.output/user.output';
import { CreateUserInput } from './dto/create-user.input/create-user.input';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/update-user.input/update-user.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/interfaces/token-payload.interface';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './../auth/guards/gql-auth.guard';
import { UserBasicOutput } from './dto/user-basic-output/user-basic-output';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => UserOutput)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput);
  }

  @Mutation(() => UserOutput)
  @UseGuards(GqlAuthGuard)
  updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.usersService.updateUser(user._id, updateUserInput);
  }

  @Query(() => UserBasicOutput)
  @UseGuards(GqlAuthGuard)
  getMyInformation(@CurrentUser() user: TokenPayload) {
    return user;
  }
}
