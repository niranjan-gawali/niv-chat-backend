import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input/create-chat.input';
// import { UpdateChatInput } from './dto/update-chat.input/update-chat.input';
import { ChatRepository } from './chat.repository';
import { Types } from 'mongoose';
import { UpdateChatInput } from './dto/update-chat.input/update-chat.input';
// import { Chat } from './entities/chat.entity';
import { ChatOutput, ChatOutputData } from './dto/chat.output/chat.output';
import { PAGE_LIMIT } from 'src/common/constants/common-constants';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}
  async create(createChatInput: CreateChatInput, userId: string) {
    try {
      const { users, groupAdmin, ...rest } = createChatInput;

      const userObjectIds = users.map((id) => new Types.ObjectId(id));

      const chatData: any = {
        users: userObjectIds,
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

  async findAll(userId: string, pageNo: number = 1): Promise<ChatOutput> {
    const skip = (pageNo - 1) * PAGE_LIMIT;

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

    const match = { users: { $in: [new Types.ObjectId(userId)] } };

    const result = await this.chatRepository.model.aggregate([
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
      { $skip: skip },
      { $limit: PAGE_LIMIT },
    ]);

    const totalChatCount = await this.chatRepository.model.countDocuments();

    return { chats: result as ChatOutputData[], totalChatCount };
  }

  async findOne(id: string, userId: string): Promise<ChatOutputData | null> {
    const lookup = {
      from: 'users',
      localField: 'users',
      foreignField: '_id',
      as: 'users',
    };

    const match = {
      _id: new Types.ObjectId(id),
      users: { $in: [new Types.ObjectId(userId)] },
    };

    const result = await this.chatRepository.model.aggregate([
      { $match: match },
      { $lookup: lookup },
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
}
