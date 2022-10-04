import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import admin from 'firebase-admin'

@Injectable()
export class FirebaseService {
  private app: admin.app.App

  constructor(private readonly configService: ConfigService) {
    const bucketName = this.configService.get('FIREBASE_BUCKET_NAME')
    // this.app = admin.initializeApp({
    //   credential: admin.credential.cert({
    //     projectId: this.configService.get('FIREBASE_PROJECT_ID'),
    //     privateKey: this.configService
    //       .get('FIREBASE_PRIVATE_KEY')
    //       .replace(/\\n/g, '\n'),
    //     clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
    //   }),
    //   storageBucket: bucketName,
    // })
    // this.app
    //   .storage()
    //   .bucket(bucketName)
    //   .setCorsConfiguration([
    //     {
    //       origin: ['*'],
    //     },
    //   ])

    // if (!bukcet) {
    // }

    //   this.app
    //     .storage()
    //     .bucket(bucketName)
    //     .file('abcd')
    //     .getSignedUrl({
    //       version: 'v4',
    //       action: 'write',
    //       expires: new Date().getTime() + 1000 * 60 * 60, // 2 minutes
    //       contentType: 'image/jpeg',
    //     })
    //     .then(value => console.log(value))
    // }
  }
}
