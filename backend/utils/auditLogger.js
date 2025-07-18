const AuditLog = require('../models/AuditLog');

/**
 * Logs an audit event.
 * @param {Object} params
 * @param {string} params.action - Action type (e.g., CREATE_TRANSACTION)
 * @param {string} params.entity - Entity type (e.g., TransactionLine)
 * @param {string|ObjectId} params.entityId - Entity ID
 * @param {Object} params.details - Additional details
 * @param {string|ObjectId} [params.userId] - User performing the action
 * @param {ClientSession} [params.session] - Mongoose session (optional)
 */
async function logAudit({ action, entity, entityId, details, userId, session }) {
  const log = new AuditLog({
    action,
    entity,
    entityId,
    details,
    userId,
    timestamp: new Date()
  });
  await log.save({ session });
}

module.exports = { logAudit };
