import { Module, UnauthorizedException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { join } from 'path';
// import { cwd } from 'process';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { ChatModule } from './chat/chat.module';
import { MessagesModule } from './messages/messages.module';
import { AuthService } from './auth/auth.service';
import { PubSubModule } from './common/pubsub/pubsub.module';

const graphqlConfigFactory = (
  authService: AuthService,
): ApolloDriverConfig => ({
  driver: ApolloDriver,
  autoSchemaFile: true,
  subscriptions: {
    'graphql-ws': {
      onConnect: (context: any) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (!context.extra?.request) {
            throw new UnauthorizedException('No request object in context.');
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          const user = authService.verifyWs(context.extra.request);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          context.user = user;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          throw new UnauthorizedException('Invalid WebSocket authentication.');
        }
      },
    },
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [AuthService],
      useFactory: graphqlConfigFactory,
    }),
    AuthModule,
    DatabaseModule,
    UsersModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      },
    }),
    ChatModule,
    MessagesModule,
    PubSubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
