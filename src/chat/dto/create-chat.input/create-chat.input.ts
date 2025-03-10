import { InputType, Field } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsString,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

@InputType()
export class CreateChatInput {
  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  isGroupChat: boolean;

  @Field(() => [String], { nullable: false })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  users: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  groupName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  groupAdmin?: string;
}
