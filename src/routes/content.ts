import { Router } from 'express'
import { requireAuth } from '../middleware.js'
import { SiteContent } from '../models.js'

export const contentRouter = Router()
contentRouter.get('/', async (_request, response) => {
  const content = await SiteContent.findOne({ key: 'main' }).lean()
  if (!content) return response.status(404).json({ message: 'Site content not found' })
  response.json(content)
})
contentRouter.patch('/', requireAuth('admin'), async (request, response) => {
  const allowed = ['announcement', 'heroTitle', 'heroSubtitle', 'heroEyebrow', 'primaryCta', 'secondaryCta', 'storyTitle', 'storyText', 'stats', 'showcaseImages', 'blocks']
  const update = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)))
  const content = await SiteContent.findOneAndUpdate({ key: 'main' }, { $set: update }, { new: true, upsert: true, runValidators: true })
  response.json(content)
})
