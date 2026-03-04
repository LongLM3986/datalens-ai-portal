import express from 'express';
import { query } from '../db/index.js';
import { processChat }     from '../services/claude.js';
import { processGroqChat } from '../services/groq.js';
import { authMiddleware }  from '../middleware/auth.js';
const router = express.Router();
router.use(authMiddleware);
router.post('/', async (req, res) => {
  const { sessionId, message, aiProvider='claude' } = req.body;
  const user = req.user;
  if (!sessionId || !message?.trim()) return res.status(400).json({ error: 'Thiếu sessionId hoặc message.' });
  const sessCheck = await query('SELECT id FROM chat_sessions WHERE id=$1 AND user_id=$2', [sessionId, user.id]);
  if (!sessCheck.rows[0]) return res.status(403).json({ error: 'Session không hợp lệ.' });
  let allowedTables = null;
  if (user.role !== 'admin') {
    const permResult = await query('SELECT table_name FROM user_table_permissions WHERE user_id=$1 AND can_query=TRUE', [user.id]);
    allowedTables = permResult.rows.map(r => r.table_name);
  }
  res.setHeader('Content-Type','text/event-stream');
  res.setHeader('Cache-Control','no-cache');
  res.setHeader('Connection','keep-alive');
  res.setHeader('X-Accel-Buffering','no');
  res.flushHeaders();
  const send = (data) => { if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`); };
  try {
    await query('INSERT INTO chat_messages (session_id,role,content) VALUES ($1,$2,$3)', [sessionId,'user',message.trim()]);
    const history = await query('SELECT role,content FROM chat_messages WHERE session_id=$1 ORDER BY created_at', [sessionId]);
    let fullResponse = '';
    const handler = (event) => { send(event); if (event.type==='text') fullResponse+=event.text; };
    if (aiProvider==='groq') { await processGroqChat(history.rows, handler, allowedTables); }
    else { await processChat(history.rows, handler, allowedTables); }
    if (fullResponse.trim()) {
      await query('INSERT INTO chat_messages (session_id,role,content,metadata) VALUES ($1,$2,$3,$4)', [sessionId,'assistant',fullResponse,JSON.stringify({ai_provider:aiProvider})]);
      const cnt = await query('SELECT COUNT(*) cnt FROM chat_messages WHERE session_id=$1', [sessionId]);
      if (Number(cnt.rows[0].cnt) <= 2) {
        const title = message.trim().slice(0,60)+(message.length>60?'...':'');
        await query('UPDATE chat_sessions SET title=$1 WHERE id=$2', [title,sessionId]);
        send({ type:'title_updated', title });
      } else { await query('UPDATE chat_sessions SET updated_at=NOW() WHERE id=$1', [sessionId]); }
    }
    send({ type:'done' });
  } catch(err) { console.error('Chat error:',err); send({ type:'error', error:err.message }); }
  finally { res.end(); }
});
export default router;
