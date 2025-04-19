import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message/create-message.input';
// import { UpdateMessageInput } from './dto/update-message.input';
import { MessageRepository } from './messages.repository';
import { Types } from 'mongoose';
import { GetMessageInput } from './dto/get-message/get-message.input';
import { GetMessageOutput } from './dto/get-message/get-message.output';
import { UpdateMessageInput } from './dto/update-message/update-message.input';
import { ChatService } from 'src/chat/chat.service';
import {
  MESSAGE_CREATED,
  PAGE_LIMIT,
  PUB_SUB,
} from 'src/common/constants/common-constants';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatService: ChatService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  async create(createMessageInput: CreateMessageInput, userId: string) {
    const { chatId, content } = createMessageInput;
    const chatObj = await this.chatService.findOne(chatId, userId);

    if (!chatObj) {
      throw new NotFoundException('Chat with mentioned Id does not exists !');
    }

    const isUserInChat = chatObj.users.some((user) =>
      new Types.ObjectId(user._id).equals(new Types.ObjectId(userId)),
    );

    if (!isUserInChat) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    const message: any = {
      chatId: new Types.ObjectId(chatId),
      senderId: new Types.ObjectId(userId),
      content,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const newMessage = await this.messageRepository.create(message);

    await this.chatService.updateLastMessage(
      new Types.ObjectId(chatId),
      newMessage._id,
    );

    const completeMessage = await this.findOne(
      newMessage._id.toString(),
      userId,
    );

    // if (completeMessage && completeMessage.senderUser?.isLoggedInUser) {
    //   completeMessage.senderUser.isLoggedInUser =
    //     completeMessage?.senderUser?._id.toString() === userId ? true : false;

    //   await this.pubsub.publish(MESSAGE_CREATED, {
    //     messageCreated: completeMessage,
    //   });
    // }

    await this.pubsub.publish(MESSAGE_CREATED, {
      messageCreated: completeMessage,
    });

    return completeMessage;
  }

  async findAll(
    getMessageInput: GetMessageInput,
    userId: string,
  ): Promise<GetMessageOutput[]> {
    console.log(getMessageInput);

    let primaryMatch: Record<string, any> = {
      chatId: new Types.ObjectId(getMessageInput.chatId),
    };

    if (getMessageInput.cursor) {
      const singleMessageData: GetMessageOutput | null = await this.findOne(
        getMessageInput.cursor,
        userId,
      );

      if (singleMessageData && singleMessageData.createdAt) {
        primaryMatch = {
          ...primaryMatch,
          createdAt: { $lt: singleMessageData.createdAt },
        };
      }
    }

    const lookup = {
      from: 'users',
      localField: 'senderId',
      foreignField: '_id',
      as: 'senderUser',
    };

    const unwind = { path: '$senderUser', preserveNullAndEmptyArrays: true };

    const chatLookup = {
      from: 'chats',
      localField: 'chatId',
      foreignField: '_id',
      as: 'chatData',
    };

    const chatUnwind = { path: '$chatData', preserveNullAndEmptyArrays: true };

    // const match = {
    //   chatId: new Types.ObjectId(getMessageInput.chatId),
    // };

    const matchChatUser = {
      'chatData.users': { $in: [new Types.ObjectId(userId)] },
    };

    return await this.messageRepository.model.aggregate([
      { $match: primaryMatch },
      { $lookup: lookup },
      { $unwind: unwind },
      { $lookup: chatLookup },
      { $unwind: chatUnwind },
      { $match: matchChatUser },
      {
        $addFields: {
          'senderUser.isLoggedInUser': {
            $eq: ['$senderId', new Types.ObjectId(userId)],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: PAGE_LIMIT },
    ]);
  }

  async findOne(_id: string, userId: string): Promise<GetMessageOutput | null> {
    const lookup = {
      from: 'users',
      localField: 'senderId',
      foreignField: '_id',
      as: 'senderUser',
    };

    const unwind = { path: '$senderUser', preserveNullAndEmptyArrays: true };

    const chatLookup = {
      from: 'chats',
      localField: 'chatId',
      foreignField: '_id',
      as: 'chatData',
    };

    const chatUnwind = { path: '$chatData', preserveNullAndEmptyArrays: true };

    const match = {
      _id: new Types.ObjectId(_id),
    };

    const matchChatUser = {
      'chatData.users': { $in: [new Types.ObjectId(userId)] },
    };

    const result = await this.messageRepository.model.aggregate([
      { $match: match },
      { $lookup: lookup },
      { $unwind: unwind },
      { $lookup: chatLookup },
      { $unwind: chatUnwind },
      { $match: matchChatUser },
      {
        $addFields: {
          'senderUser.isLoggedInUser': {
            $eq: ['$senderId', new Types.ObjectId(userId)],
          },
        },
      },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.length > 0 ? result[0] : null;
  }

  async update(
    _id: string,
    updateMessageInput: UpdateMessageInput,
    userId: string,
  ) {
    return await this.messageRepository.findOneAndUpdate(
      { _id, senderId: new Types.ObjectId(userId) },
      { $set: { ...updateMessageInput } },
    );
  }

  async remove(_id: string, userId: string) {
    const deletedMessage = await this.messageRepository.findOneAndDelete({
      _id,
      senderId: new Types.ObjectId(userId),
    });

    if (!deletedMessage) {
      throw new NotFoundException('Message not found');
    }

    const newLastMessage = await this.messageRepository.model.findOne(
      { chatId: deletedMessage.chatId, _id: { $ne: deletedMessage._id } },
      null,
      { sort: { createdAt: -1 } },
    );

    if (newLastMessage) {
      await this.chatService.updateLastMessage(
        new Types.ObjectId(newLastMessage.chatId),
        new Types.ObjectId(newLastMessage._id),
      );
    } else {
      await this.chatService.updateLastMessage(
        new Types.ObjectId(deletedMessage.chatId),
        null,
      );
    }

    return deletedMessage;
  }

  // Subscription for the pubsub
  messageCreated() {
    return this.pubsub.asyncIterableIterator(MESSAGE_CREATED);
  }
}
