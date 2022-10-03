import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { WebsocketAdapter } from './gateway/gateway.adapter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: '*',
  })
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  const adapter = new WebsocketAdapter(app, configService)

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

  // app.use((_, __, next) => {
  //   setTimeout(() => next(), 1000)
  // })

  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('Open API of chat app')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = parseInt(configService.get('PORT') || '5000')
  console.log(port)

  await app.listen(port, () => console.log(`Server is running on port ${port}`))
}
bootstrap()
