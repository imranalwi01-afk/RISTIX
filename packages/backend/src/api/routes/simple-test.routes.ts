import { Router } from 'express';

const router = Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from simple test route' });
});

export default router;
