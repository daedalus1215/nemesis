import 'dotenv/config';
import { DataSource } from 'typeorm';

// Used by the TypeORM CLI (migration:generate / migration:run), NOT by the running app —
// Nest builds its own connection in app.module.ts. Both must describe the same database
// or generated migrations will not match what the app actually talks to.
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['src/typeorm/migrations/*.ts'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
