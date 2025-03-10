# Niv Chat Backend

A real-time chat backend built with [NestJS](https://nestjs.com/), [GraphQL](https://graphql.org/), and [MongoDB](https://www.mongodb.com/) (using Mongoose). It supports one-to-one and group chats, JWT authentication, message management, and efficient pagination.

## Features

- **Real-Time Chat:** One-to-one & group chat functionality.
- **GraphQL API:** Code-first approach with queries and mutations.
- **Authentication:** Secure endpoints using JWT and Passport.
- **Message Handling:** Create, update, and delete messages with last message tracking.
- **Pagination:** Efficient pagination for chats and messages.
- **Modular Architecture:** Organized into Users, Chats, and Messages modules.

## Tech Stack

- **Backend:** NestJS
- **API:** GraphQL
- **Database:** MongoDB with Mongoose
- **Auth:** Passport.js with JWT
- **Language:** TypeScript

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/niv-chat-backend.git
   cd niv-chat-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   or with pnpm:

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file in the project root:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/nivchat
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Run the application:**
   ```bash
   npm run start:dev
   ```

## Usage

- **GraphQL Playground:**  
  Open your browser at [http://localhost:3000/graphql](http://localhost:3000/graphql) to test queries and mutations.

- **Example Query:**
  ```graphql
  query {
    findChats(chatInput: { pageNo: 1 }) {
      edges {
        node {
          _id
          isGroupChat
          groupName
          lastMessage {
            _id
            content
          }
          users {
            _id
            firstName
            lastName
            email
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ```

## Project Structure

```
niv-chat-backend/
├── src/
│   ├── auth/                # Authentication (JWT, strategies, filters)
│   ├── chat/                # Chat module (entities, DTOs, resolvers, services, repository)
│   ├── messages/            # Messages module (entities, DTOs, resolvers, services, repository)
│   ├── users/               # Users module (entities, DTOs, resolvers, services)
│   └── common/              # Common utilities and database modules
└── .env
```

## Contributing

1. Fork the repository.
2. Create a branch for your feature or bug fix.
3. Write tests.
4. Submit a pull request.

## License

MIT License

## Contact

For questions or support, please open an issue or contact [gawaliniranjan@gmail.com](mailto:gawaliniranjan@gmail.com).
