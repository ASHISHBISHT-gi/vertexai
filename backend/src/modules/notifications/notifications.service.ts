import { pool, type Db } from "../../db/pool";
import { notFound } from "../../utils/errors";

export interface NotificationInput {
  type: string;
  title: string;
  body?: string;
  link?: string;
}

/**
 * Creates an in-app notification for each user. Every part of the app that wants to tell someone something
 * calls this one function, so when email is added (Week 4b) it changes in exactly one place.
 */
export async function notify(db: Db, userIds: string[], n: NotificationInput) {
  if (userIds.length === 0) return;
  await db.query(
    "INSERT INTO notifications (user_id, type, title, body, link) SELECT unnest($1::uuid[]), $2, $3, $4, $5",
    [userIds, n.type, n.title.slice(0, 150), n.body ?? null, n.link ?? null],
  );
}

export async function listNotifications(userId: string, opts: { unreadOnly: boolean; page: number; limit: number }) {
  const where = "user_id = $1" + (opts.unreadOnly ? " AND NOT is_read" : "");
  const [rows, total, unread] = await Promise.all([
    pool.query(
      `SELECT id, type, title, body, link, is_read, created_at FROM notifications WHERE ${where}
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, opts.limit, (opts.page - 1) * opts.limit],
    ),
    pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM notifications WHERE ${where}`, [userId]),
    unreadCount(userId),
  ]);
  const count = total.rows[0]!.n;
  return { data: rows.rows, unread, pagination: { page: opts.page, limit: opts.limit, total: count, totalPages: Math.max(1, Math.ceil(count / opts.limit)) } };
}

export async function unreadCount(userId: string): Promise<number> {
  const { rows } = await pool.query<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id = $1 AND NOT is_read", [userId]);
  return rows[0]!.n;
}

export async function markRead(id: string, userId: string) {
  // user_id in the WHERE: you can only ever touch your own notifications.
  const { rows } = await pool.query("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id, is_read", [id, userId]);
  if (!rows[0]) throw notFound("Notification");
  return rows[0];
}

export async function markAllRead(userId: string) {
  const { rowCount } = await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1 AND NOT is_read", [userId]);
  return { updated: rowCount ?? 0 };
}
