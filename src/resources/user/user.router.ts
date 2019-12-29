import { Router } from 'express'

import { me, updateMe } from './user.controllers'

const router: Router = Router()

router.get('/', me)

router.put('/', updateMe)

export default router