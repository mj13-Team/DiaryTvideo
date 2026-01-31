import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ErrorCodeFilter } from "./common/filters/error-code.filter";

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === "production";
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ["warn", "error"]
      : ["log", "error", "warn", "debug", "verbose"],
  });
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  app.useGlobalFilters(new ErrorCodeFilter());
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
