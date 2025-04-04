import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { CreateChatInput } from './dto/create-chat.input/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input/update-chat.input';
import { ChatOutput } from './dto/chat.output/chat.output';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/interfaces/token-payload.interface';
import { ChatInput } from './dto/chat.output/chat.input';

@Resolver()
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}
  @Mutation(() => ChatOutput)
  @UseGuards(GqlAuthGuard)
  createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.chatService.create(createChatInput, user._id);
  }

  @Mutation(() => ChatOutput)
  @UseGuards(GqlAuthGuard)
  updateChat(
    @Args('updateChatInput') updateChatInput: UpdateChatInput,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.chatService.update(
      updateChatInput._id,
      updateChatInput,
      user._id,
    );
  }

  // NOTE: Right now building pagination with offset but in future will need to convert it into cursor
  @Query(() => ChatOutput, { name: 'findChats' })
  @UseGuards(GqlAuthGuard)
  findChats(
    @CurrentUser() user: TokenPayload,
    @Args('chatInput', { type: () => ChatInput, nullable: true })
    chatInput?: ChatInput,
  ) {
    const pageNo = chatInput?.pageNo ?? 1;
    return this.chatService.findAll(user._id, pageNo);
  }

  @Query(() => ChatOutput)
  @UseGuards(GqlAuthGuard)
  findOne(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.chatService.findOne(id, user._id);
  }

  @Mutation(() => ChatOutput)
  @UseGuards(GqlAuthGuard)
  removeChat(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.chatService.remove(id, user._id);
  }
}
