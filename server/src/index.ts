import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  loginInputSchema,
  createUserInputSchema,
  updateUserInputSchema,
  deleteUserInputSchema,
  createEquipmentInputSchema,
  updateEquipmentInputSchema,
  deleteEquipmentInputSchema,
  fileUploadInputSchema
} from './schema';

// Import handlers
import { login, logout, validateToken } from './handlers/auth';
import { createUser, updateUser, deleteUser, getAllUsers, getUserById } from './handlers/user_management';
import { createEquipment, updateEquipment, deleteEquipment, getAllEquipment, getEquipmentById } from './handlers/medical_equipment';
import { getDashboardStats } from './handlers/dashboard';
import { uploadImage, deleteImage, validateImageFile } from './handlers/file_upload';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication endpoints
  auth: router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => login(input)),
    
    logout: publicProcedure
      .mutation(() => logout()),
    
    validateToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => validateToken(input.token))
  }),

  // User management endpoints (Admin only)
  users: router({
    create: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => createUser(input)),
    
    update: publicProcedure
      .input(updateUserInputSchema)
      .mutation(({ input }) => updateUser(input)),
    
    delete: publicProcedure
      .input(deleteUserInputSchema)
      .mutation(({ input }) => deleteUser(input)),
    
    getAll: publicProcedure
      .query(() => getAllUsers()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserById(input.id))
  }),

  // Medical equipment endpoints
  equipment: router({
    create: publicProcedure
      .input(createEquipmentInputSchema)
      .mutation(({ input }) => createEquipment(input)),
    
    update: publicProcedure
      .input(updateEquipmentInputSchema)
      .mutation(({ input }) => updateEquipment(input)),
    
    delete: publicProcedure
      .input(deleteEquipmentInputSchema)
      .mutation(({ input }) => deleteEquipment(input)),
    
    getAll: publicProcedure
      .query(() => getAllEquipment()),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getEquipmentById(input.id))
  }),

  // Dashboard endpoints
  dashboard: router({
    getStats: publicProcedure
      .query(() => getDashboardStats())
  }),

  // File upload endpoints
  files: router({
    uploadImage: publicProcedure
      .input(fileUploadInputSchema)
      .mutation(({ input }) => uploadImage(input)),
    
    deleteImage: publicProcedure
      .input(z.object({ imageUrl: z.string() }))
      .mutation(({ input }) => deleteImage(input.imageUrl)),
    
    validateImage: publicProcedure
      .input(fileUploadInputSchema)
      .query(({ input }) => validateImageFile(input))
  })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();