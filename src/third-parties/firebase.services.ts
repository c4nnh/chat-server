import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import admin from 'firebase-admin'
import { UploadImageDto } from '../images/dto/upload-image.dto'
import { CreateSignedUrlResponse } from '../images/response/create-signed-url.response'
import { v4 as uuid4 } from 'uuid'

@Injectable()
export class FirebaseService {
  private app: admin.app.App

  constructor(private readonly configService: ConfigService) {
    const bucketName = this.configService.get('FIREBASE_BUCKET_NAME')
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      }),
      storageBucket: bucketName,
    })

    this.app
      .storage()
      .bucket(bucketName)
      .setCorsConfiguration([
        {
          origin: ['*'],
          method: ['*'],
          maxAgeSeconds: 3600,
          responseHeader: ['Content-Type', 'Access-Control-Allow-Origin'],
        },
      ])
      .then(() => {
        this.app.storage().bucket(bucketName).makePublic()
      })
  }

  async createSignedUrl(dto: UploadImageDto): Promise<CreateSignedUrlResponse> {
    const bucketName = this.configService.get('FIREBASE_BUCKET_NAME')
    const { fileName, fileType } = dto

    // const id = `${fileName}_${uuid4()}`
    const id = fileName

    const res = await this.app
      .storage()
      .bucket(bucketName)
      .file(id)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: new Date().getTime() + 1000 * 60 * 1, // 2 minutes
        contentType: fileType,
      })

    if (!res.length) {
      throw new InternalServerErrorException(
        'Can not get signed url now. Please try again later'
      )
    }

    const url = await this.app.storage().bucket().file(id).publicUrl()

    return {
      uploadUrl: res[0],
      publicUrl: url,
    }
  }
}
