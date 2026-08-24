import mongoose from 'mongoose'
import { config } from './config.js'

export async function connectDatabase() {
  await mongoose.connect(config.mongoUri)
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}
