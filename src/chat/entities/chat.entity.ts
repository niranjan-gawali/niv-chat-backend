import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractEntity } from 'src/common/database/abstract.schema';

@Schema({ timestamps: true })
export class Chat extends AbstractEntity {
  @Prop({ type: Boolean, default: false })
  isGroupChat: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  users: Types.ObjectId[];

  @Prop({ type: String, default: null })
  groupName: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  groupAdmin?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  updatedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
