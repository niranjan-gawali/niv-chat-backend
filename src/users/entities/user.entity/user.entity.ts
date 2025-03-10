import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractEntity } from 'src/common/database/abstract.schema';

@Schema({ timestamps: true })
export class User extends AbstractEntity {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ unique: true })
  username: string;

  @Prop()
  password: string;

  @Prop({ type: String, default: null })
  profilePicture?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
