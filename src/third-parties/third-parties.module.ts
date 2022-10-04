import { Module } from '@nestjs/common'
import { FirebaseService } from './firebase.services'

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class ThirdPartiesModule {}
