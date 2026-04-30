import { publicProcedure, router } from "../_core/trpc";

// Auth is now handled entirely by Supabase on the client side.
// The server only needs me (from context) and logout (clear cookie).
export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    // Clear the Supabase access token cookie if set
    ctx.res.clearCookie("sb-access-token", { path: "/" });
    return { success: true } as const;
  }),
});
