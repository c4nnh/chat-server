import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { initializeApp, credential, app } from 'firebase-admin'

@Injectable()
export class FirebaseService {
  private app: app.App

  constructor(private readonly configService: ConfigService) {
    this.app = initializeApp({
      credential: credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      }),
    })
  }
}
