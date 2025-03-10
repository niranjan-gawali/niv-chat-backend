import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MessageType } from '../dto/message-type.dto';
import { AbstractEntity } from 'src/common/database/abstract.schema';

@Schema({ timestamps: true })
export class Message extends AbstractEntity {
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({
    type: String,
    enum: MessageType,
    required: true,
    default: MessageType.TEXT,
  })
  message: MessageType;
}

const MessageSchema = SchemaFactory.createForClass(Message);
export default MessageSchema;
