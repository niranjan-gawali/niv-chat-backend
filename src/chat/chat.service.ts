import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input/create-chat.input';
// import { UpdateChatInput } from './dto/update-chat.input/update-chat.input';
import { ChatRepository } from './chat.repository';
import { Types } from 'mongoose';
import { UpdateChatInput } from './dto/update-chat.input/update-chat.input';
// import { Chat } from './entities/chat.entity';
import { ChatOutput } from './dto/chat.output/chat.output';
import { PAGE_LIMIT } from 'src/common/constants/common-constants';
import { ChatInput } from './dto/chat.output/chat.input';
import { UserRepository } from 'src/users';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async create(createChatInput: CreateChatInput, userId: string) {
    try {
      const { users, groupAdmin, isGroupChat, ...rest } = createChatInput;

      const userObjectIds = users.map((id) => new Types.ObjectId(id));

      if (!isGroupChat && userObjectIds.length > 1) {
        return new BadRequestException(
          'Please pass only single userId for user to user communication !!!',
        );
      }

      if (users.includes(userId)) {
        return new BadRequestException(
          'No need to pass the looged in users id !!!',
        );
      }

      if (!isGroupChat) {
        const existingChat = await this.chatRepository.model.findOne({
          isGroupChat: false,
          users: { $in: [new Types.ObjectId(userObjectIds[0])] },
        });

        if (existingChat) {
          return new BadRequestException(
            `You already have a chat with this user.`,
          );
        }
      }

      const chatData: any = {
        users: [...userObjectIds, new Types.ObjectId(userId)],
        createdBy: userId,
        updatedBy: userId,
        ...rest,
      };

      if (groupAdmin) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        chatData.groupAdmin = new Types.ObjectId(groupAdmin);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return await this.chatRepository.create(chatData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(_id: string, updateChatInput: UpdateChatInput, userId: string) {
    return await this.chatRepository.findOneAndUpdate(
      { _id, createdBy: new Types.ObjectId(userId) },
      {
        $set: { ...updateChatInput },
      },
    );
  }

  async findAll(userId: string, chatInput: ChatInput): Promise<ChatOutput[]> {
    let match: Record<string, any> = {
      users: { $in: [new Types.ObjectId(userId)] },
    };

    if (chatInput.cursor) {
      const chatData: ChatOutput | null = await this.findOne(
        chatInput.cursor,
        userId,
      );

      // if (chatData && chatData.createdAt) {
      //   match = { ...match, createdAt: { $lt: chatData.createdAt } };
      // }
      if (chatData?.createdAt) {
        match.createdAt = { $lt: chatData.createdAt };
      }
    }

    // If searchParam exists, find matched users and add to match
    if (chatInput.searchParam) {
      const matchedUsers = await this.userRepository.find({
        $and: [
          {
            $or: [
              {
                firstName: {
                  $regex: `^${chatInput.searchParam}`,
                  $options: 'i',
                },
              },
              {
                lastName: {
                  $regex: `^${chatInput.searchParam}`,
                  $options: 'i',
                },
              },
            ],
          },
          { _id: { $ne: new Types.ObjectId(userId) } },
        ],
      });

      const matchedUserIds = matchedUsers.map((u) => u._id);
      if (!matchedUserIds.length) return [];

      match = {
        $and: [
          { users: { $in: [new Types.ObjectId(userId)] } },
          { users: { $in: matchedUserIds } },
        ],
      };
    } else {
      match = { users: { $in: [new Types.ObjectId(userId)] } };
    }

    const lookupUser = {
      from: 'users',
      localField: 'users',
      foreignField: '_id',
      as: 'users',
    };

    const lookupLastMessage = {
      from: 'messages',
      localField: 'lastMessage',
      foreignField: '_id',
      as: 'lastMessage',
    };

    const unwindLastMessage = {
      path: '$lastMessage',
      preserveNullAndEmptyArrays: true,
    };

    return await this.chatRepository.model.aggregate([
      { $match: match },
      {
        $lookup: lookupUser,
      },
      { $lookup: lookupLastMessage },
      {
        $unwind: unwindLastMessage,
      },
      {
        $addFields: {
          users: {
            $map: {
              input: '$users',
              as: 'user',
              in: {
                $mergeObjects: [
                  '$$user',
                  {
                    isLoggedInUser: {
                      $eq: ['$$user._id', new Types.ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: PAGE_LIMIT },
    ]);
  }

  async findOne(id: string, userId: string): Promise<ChatOutput | null> {
    const lookup = {
      from: 'users',
      localField: 'users',
      foreignField: '_id',
      as: 'users',
    };

    const lookupLastMessage = {
      from: 'messages',
      localField: 'lastMessage',
      foreignField: '_id',
      as: 'lastMessage',
    };

    const unwindLastMessage = {
      path: '$lastMessage',
      preserveNullAndEmptyArrays: true,
    };

    const match = {
      _id: new Types.ObjectId(id),
      users: { $in: [new Types.ObjectId(userId)] },
    };

    const result = await this.chatRepository.model.aggregate([
      { $match: match },
      { $lookup: lookup },
      { $lookup: lookupLastMessage },
      {
        $unwind: unwindLastMessage,
      },
    ]);

    if (result.length === 0) {
      throw new NotFoundException('Chat not found or you don’t have access');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.length > 0 ? result[0] : null;
  }

  async remove(_id: string, userId: string) {
    return await this.chatRepository.findOneAndDelete({
      _id,
      createdBy: new Types.ObjectId(userId),
    });
  }

  // Update last message
  async updateLastMessage(
    chatId: Types.ObjectId,
    messageId: Types.ObjectId | null,
  ) {
    const updatedChat = await this.chatRepository.findOneAndUpdate(
      { _id: chatId },
      {
        $set: {
          lastMessage: messageId == null ? null : new Types.ObjectId(messageId),
        },
      },
    );

    if (!updatedChat) {
      throw new NotFoundException('Chat not found');
    }

    return updatedChat;
  }

  // Search users
  async searchChats(
    userId: string,
    searchParam: string,
  ): Promise<ChatOutput[]> {
    const matchedUsers = await this.userRepository.find({
      $and: [
        {
          $or: [
            { firstName: { $regex: `^${searchParam}`, $options: 'i' } },
            { lastName: { $regex: `^${searchParam}`, $options: 'i' } },
          ],
        },
        { _id: { $ne: new Types.ObjectId(userId) } },
      ],
    });

    const matchedUserIds = matchedUsers.map((u) => u._id);

    if (!matchedUserIds.length) {
      return [];
    }

    return await this.chatRepository.model.aggregate([
      { $match: { users: { $in: matchedUserIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'lastMessage',
          foreignField: '_id',
          as: 'lastMessage',
        },
      },
      {
        $unwind: {
          path: '$lastMessage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          users: {
            $map: {
              input: '$users',
              as: 'user',
              in: {
                $mergeObjects: [
                  '$$user',
                  {
                    isLoggedInUser: {
                      $eq: ['$$user._id', new Types.ObjectId(userId)],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: PAGE_LIMIT },
    ]);
  }
}
