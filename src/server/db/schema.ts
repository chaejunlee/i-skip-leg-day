import { relations, sql } from "drizzle-orm";
import {
  bigint,
  datetime,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `i-skip-leg-day_${name}`);

export const days = mysqlTable("day", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  date: datetime("date").default(sql`CURRENT_TIMESTAMP`),
  userId: varchar("userId", { length: 255 }),
  splitId: bigint("splitId", { mode: "number" }),
});

export const daysRelations = relations(days, ({ one, many }) => ({
  user: one(users, { fields: [days.userId], references: [users.id] }),
  weights: many(weights),
  workouts: many(workouts),
  cardios: many(cardios),
  splits: one(splits, { fields: [days.splitId], references: [splits.id] }),
}));

export const weights = mysqlTable("weight", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  date: datetime("date").default(sql`CURRENT_TIMESTAMP`),
  time: datetime("time").default(sql`CURRENT_TIMESTAMP`),
  weight: bigint("weight", { mode: "number" }).notNull(),
});

export const weightsRelations = relations(weights, ({ one }) => ({
  day: one(days, { fields: [weights.date], references: [days.date] }),
}));

export const cardioWorkout = mysqlTable("cardioWorkout", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const cardioWorkoutRelations = relations(cardioWorkout, ({ many }) => ({
  cardios: many(cardios),
}));

export const cardios = mysqlTable("cardio", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  dateId: datetime("dateId").default(sql`CURRENT_TIMESTAMP`),
  distance: bigint("distance", { mode: "number" }).notNull(),
  time: bigint("time", { mode: "number" }).notNull(),
  workoutId: bigint("workoutId", { mode: "number" }),
});

export const cardiosWorkoutRelations = relations(cardios, ({ one }) => ({
  workout: one(cardioWorkout, {
    fields: [cardios.workoutId],
    references: [cardioWorkout.id],
  }),
}));

export const cardioRelations = relations(cardios, ({ one }) => ({
  day: one(days, { fields: [cardios.dateId], references: [days.date] }),
}));

export const workouts = mysqlTable("workout", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  dateId: bigint("dateId", { mode: "number" }),
  exerciseId: bigint("exerciseId", { mode: "number" }),
  weight: bigint("weight", { mode: "number" }).notNull(),
  rpe: bigint("rpe", { mode: "number" }).notNull(),
  description: varchar("description", { length: 255 }),
});

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  day: one(days, { fields: [workouts.dateId], references: [days.id] }),
  exercise: one(exercises, {
    fields: [workouts.exerciseId],
    references: [exercises.id],
  }),
  sets: many(sets),
}));

export const sets = mysqlTable("set", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  workoutId: bigint("workoutId", { mode: "number" }),
  reps: bigint("reps", { mode: "number" }).notNull(),
  weights: bigint("weights", { mode: "number" }).notNull(),
});

export const setsRelations = relations(sets, ({ one }) => ({
  workout: one(workouts, {
    fields: [sets.workoutId],
    references: [workouts.id],
  }),
}));

export const exercises = mysqlTable("exercise", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  bodyId: bigint("bodyId", { mode: "number" }),
  name: varchar("name", { length: 255 }).notNull(),
  splitId: bigint("splitId", { mode: "number" }),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  body: one(bodies, { fields: [exercises.bodyId], references: [bodies.id] }),
  workouts: many(workouts),
  splits: one(splits, { fields: [exercises.splitId], references: [splits.id] }),
}));

export const bodies = mysqlTable("body", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const bodiesRelations = relations(bodies, ({ many }) => ({
  exercises: many(exercises),
  train: many(trains),
}));

export const trains = mysqlTable("train", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  splitId: bigint("splitId", { mode: "number" }),
  bodyId: bigint("bodyId", { mode: "number" }),
});

export const trainsRelations = relations(trains, ({ one }) => ({
  split: one(splits, { fields: [trains.splitId], references: [splits.id] }),
  body: one(bodies, { fields: [trains.bodyId], references: [bodies.id] }),
}));

export const splits = mysqlTable("split", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  programId: bigint("programId", { mode: "number" }),
});

export const splitsRelations = relations(splits, ({ one, many }) => ({
  program: one(programs, {
    fields: [splits.programId],
    references: [programs.id],
  }),
  trains: many(trains),
  days: many(days),
}));

export const programs = mysqlTable("program", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  day: bigint("day", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const programsRelations = relations(programs, ({ many }) => ({
  splits: many(splits),
}));

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  days: many(days),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
