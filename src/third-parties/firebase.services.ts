import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import admin from 'firebase-admin'

@Injectable()
export class FirebaseService {
  private app: admin.app.App

  constructor(private readonly configService: ConfigService) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      }),
    })
  }
}
