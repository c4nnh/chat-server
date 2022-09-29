import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { WebsocketAdapter } from './gateway/gateway.adapter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors()
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  const adapter = new WebsocketAdapter(app)
  app.useWebSocketAdapter(adapter)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('Open API of chat app')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = parseInt(process.env.PORT || '5000')
  await app.listen(port, () => console.log(`Server is running on port ${port}`))
}
bootstrap()
