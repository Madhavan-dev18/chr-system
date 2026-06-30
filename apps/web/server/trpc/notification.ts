import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from './_base';
import { TRPCError } from '@trpc/server';

export const notificationRouter = createTRPCRouter({
  
  // List unread notifications
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const where = { 
        userId: ctx.session.user.id,
        ...(input.unreadOnly ? { isRead: false } : {})
      };

      return ctx.db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      return ctx.db.notification.updateMany({
        where: { userId: ctx.session.user.id, isRead: false },
        data: { isRead: true },
      });
    }),

  // Mark single as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findUnique({
        where: { id: input.id }
      });

      if (!notification || notification.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });
    }),
});

