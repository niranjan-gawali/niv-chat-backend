import { Field, ObjectType } from '@nestjs/graphql';
import { CreateMessageOutput } from 'src/messages/dto/create-message/create-message.output';
import { UserOutput } from 'src/users/dto/user.output/user.output';

@ObjectType()
export class ChatOutput {
  @Field()
  _id: string;

  @Field()
  isGroupChat?: boolean;

  @Field(() => [UserOutput], { nullable: true })
  users?: UserOutput[];

  @Field({ nullable: true })
  groupName?: string;

  @Field({ nullable: true })
  groupAdmin?: string;

  @Field(() => CreateMessageOutput, { nullable: true })
  lastMessage?: CreateMessageOutput;
}
