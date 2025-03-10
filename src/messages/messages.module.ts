import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesResolver } from './messages.resolver';
import { DatabaseModule } from 'src/common/database/database.module';
import MessageSchema, { Message } from './entities/message.entity';
import { MessageRepository } from './messages.repository';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [MessagesResolver, MessagesService, MessageRepository],
  imports: [
    DatabaseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => ChatModule),
  ],
})
export class MessagesModule {}
