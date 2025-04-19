import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { ChatRepository } from './chat.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { Chat, ChatSchema } from './entities/chat.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
    UsersModule,
  ],
  providers: [ChatResolver, ChatService, ChatRepository],
  exports: [ChatService],
})
export class ChatModule {}
