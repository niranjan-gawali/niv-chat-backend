/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Subscription,
} from '@nestjs/graphql';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { CreateMessageInput } from './dto/create-message/create-message.input';
import { GetMessageInput } from './dto/get-message/get-message.input';
import { GetMessageOutput } from './dto/get-message/get-message.output';
import { UpdateMessageInput } from './dto/update-message/update-message.input';
import { RemoveMessageOutput } from './dto/remove-message/remove-message.output';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/interfaces/token-payload.interface';
import { MessageCreatedArgs } from './dto/create-message/message-created-args';
// import { UpdateMessageInput } from './dto/update-message.input';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private readonly messagesService: MessagesService) {}

  @Mutation(() => GetMessageOutput)
  @UseGuards(GqlAuthGuard)
  createMessage(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.messagesService.create(createMessageInput, user._id);
  }

  @Query(() => [GetMessageOutput])
  @UseGuards(GqlAuthGuard)
  getMessages(
    @Args('getMessageInput') getMessageInput: GetMessageInput,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.messagesService.findAll(getMessageInput, user._id);
  }

  @Query(() => GetMessageOutput)
  @UseGuards(GqlAuthGuard)
  getMessage(
    @Args('_id', { type: () => String }) _id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.messagesService.findOne(_id, user._id);
  }

  @Mutation(() => GetMessageOutput)
  @UseGuards(GqlAuthGuard)
  updateMessage(
    @Args('updateMessageInput') updateMessageInput: UpdateMessageInput,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.messagesService.update(
      updateMessageInput._id,
      updateMessageInput,
      user._id,
    );
  }

  @Mutation(() => RemoveMessageOutput)
  @UseGuards(GqlAuthGuard)
  removeMessage(
    @Args('_id', { type: () => ID }) _id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.messagesService.remove(_id, user._id);
  }

  @Subscription(() => GetMessageOutput, {
    filter: (payload, variables: MessageCreatedArgs, context) => {
      const userId = context.req.user._id;
      const newCreateMessage = payload?.messageCreated;

      return (
        userId !== newCreateMessage.senderId.toString() &&
        variables.chatIds.includes(newCreateMessage.chatId.toString())
      );
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  messageCreated(@Args() _messageCreatedArgs: MessageCreatedArgs) {
    return this.messagesService.messageCreated();
  }
}
