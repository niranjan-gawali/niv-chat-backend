import { Field, ObjectType, Int } from '@nestjs/graphql';
import { CreateMessageOutput } from 'src/messages';
import { UserOutput } from 'src/users';

@ObjectType()
export class ChatOutputData {
  @Field()
  _id: string;

  @Field()
  isGroupChat?: boolean;

  @Field(() => [UserOutput], { nullable: true })
  users: UserOutput[];

  @Field({ nullable: true })
  groupName?: string;

  @Field({ nullable: true })
  groupAdmin?: string;

  @Field(() => CreateMessageOutput, { nullable: true })
  lastMessage?: CreateMessageOutput;
}

@ObjectType()
export class ChatOutput {
  @Field(() => [ChatOutputData])
  chats: ChatOutputData[];

  @Field(() => Int)
  totalChatCount: number;
}
