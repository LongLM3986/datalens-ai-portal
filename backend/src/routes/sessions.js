import express from 'express';
import { query } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();
router.use(authMiddleware);
router.get('/', async (req, res) => {
  try {
    const r = await query('SELECT id,title,created_at,updated_at FROM chat_sessions WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 100', [req.user.id]);
    res.json(r.rows);
  } catch(e){ res.status(500).json({error:e.message}); }
});
router.post('/', async (req, res) => {
  try {
    const r = await query("INSERT INTO chat_sessions (title,user_id) VALUES ('Cuộc hội thoại mới',$1) RETURNING *", [req.user.id]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({error:e.message}); }
});
router.get('/:id/messages', async (req, res) => {
  try {
    const sess = await query('SELECT id FROM chat_sessions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!sess.rows[0]) return res.status(403).json({error:'Không có quyền.'});
    const r = await query('SELECT id,session_id,role,content,metadata,created_at FROM chat_messages WHERE session_id=$1 ORDER BY created_at', [req.params.id]);
    res.json(r.rows);
  } catch(e){ res.status(500).json({error:e.message}); }
});
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM chat_sessions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({success:true});
  } catch(e){ res.status(500).json({error:e.message}); }
});
export default router;
