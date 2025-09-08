import { prisma } from "@/lib/prisma"

export interface AuditLogData {
  userId: string
  action: string
  entityType: string
  entityId?: string
  oldValues?: string
  newValues?: string
  ipAddress?: string
  userAgent?: string
}

// Helper functions for common audit actions
export const auditActions = {
  // User actions
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",

  // Post actions
  POST_CREATED: "POST_CREATED",
  POST_UPDATED: "POST_UPDATED",
  POST_DELETED: "POST_DELETED",
  POST_SUBMITTED: "POST_SUBMITTED",
  POST_APPROVED: "POST_APPROVED",
  POST_REJECTED: "POST_REJECTED",
  POST_SCHEDULED: "POST_SCHEDULED",
  POST_PUBLISHED: "POST_PUBLISHED",

  // Client actions
  CLIENT_CREATED: "CLIENT_CREATED",
  CLIENT_UPDATED: "CLIENT_UPDATED",
  CLIENT_DELETED: "CLIENT_DELETED",

  // Project actions
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_UPDATED: "PROJECT_UPDATED",
  PROJECT_DELETED: "PROJECT_DELETED",

  // Comment actions
  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_UPDATED: "COMMENT_UPDATED",
  COMMENT_DELETED: "COMMENT_DELETED",
}

export const entityTypes = {
  USER: "USER",
  POST: "POST",
  CLIENT: "CLIENT",
  PROJECT: "PROJECT",
  COMMENT: "COMMENT",
  ASSET: "ASSET",
  SYSTEM: "SYSTEM", // Added SYSTEM entity type
}

export async function logAuditAction(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action as any, // Cast to match Prisma enum
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function logAudit(data: {
  action: string
  userId: string
  details: string
  metadata?: any
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action as any,
        entityType: "SYSTEM", // Default entity type
        entityId: data.metadata?.projectId || data.metadata?.postId || data.metadata?.clientId,
        oldValues: data.metadata ? JSON.stringify(data.metadata) : undefined,
        newValues: data.details,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function createAuditLog(data: AuditLogData) {
  return logAuditAction(data)
}
