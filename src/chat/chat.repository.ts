import { AbstractRepository } from 'src/common/database/abstract.repository';
import { Chat } from './entities/chat.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatRepository extends AbstractRepository<Chat> {
  protected readonly logger = new Logger(ChatRepository.name);

  constructor(@InjectModel(Chat.name) chatModel: Model<Chat>) {
    super(chatModel);
  }
}
