import { relations, sql } from "drizzle-orm";
import {
  bigint,
  date,
  index,
  integer,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { pgTableCreator } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `i-skip-leg-day_${name}`);

export const days = createTable("day", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
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

export const weights = createTable("weight", {
  id: serial("id").primaryKey(),
  date: date("date").default(sql`CURRENT_TIMESTAMP`),
  time: date("time").default(sql`CURRENT_TIMESTAMP`),
  weight: bigint("weight", { mode: "number" }).notNull(),
});

export const weightsRelations = relations(weights, ({ one }) => ({
  day: one(days, { fields: [weights.date], references: [days.date] }),
}));

export const cardioWorkout = createTable("cardioWorkout", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const cardioWorkoutRelations = relations(cardioWorkout, ({ many }) => ({
  cardios: many(cardios),
}));

export const cardios = createTable("cardio", {
  id: serial("id").primaryKey(),
  dateId: date("dateId").default(sql`CURRENT_TIMESTAMP`),
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

export const workouts = createTable("workout", {
  id: serial("id").primaryKey(),
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

export const sets = createTable("set", {
  id: serial("id").primaryKey(),
  workoutId: bigint("workoutId", { mode: "number" }).notNull(),
  reps: bigint("reps", { mode: "number" }).notNull(),
  weights: bigint("weights", { mode: "number" }).notNull(),
  metric: text("metric", { enum: ["lb", "kg"] })
    .default("lb")
    .notNull(),
});

export const setsRelations = relations(sets, ({ one }) => ({
  workout: one(workouts, {
    fields: [sets.workoutId],
    references: [workouts.id],
  }),
}));

export const exercises = createTable("exercise", {
  id: serial("id").primaryKey(),
  bodyId: bigint("bodyId", { mode: "number" }),
  name: varchar("name", { length: 255 }).notNull(),
  splitId: bigint("splitId", { mode: "number" }),
});

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  body: one(bodies, { fields: [exercises.bodyId], references: [bodies.id] }),
  workouts: many(workouts),
  splits: one(splits, { fields: [exercises.splitId], references: [splits.id] }),
}));

export const bodies = createTable("body", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const bodiesRelations = relations(bodies, ({ many }) => ({
  exercises: many(exercises),
}));

export const splits = createTable("split", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  programId: bigint("programId", { mode: "number" }),
});

export const splitsRelations = relations(splits, ({ one, many }) => ({
  program: one(programs, {
    fields: [splits.programId],
    references: [programs.id],
  }),
  days: many(days),
}));

export const programs = createTable("program", {
  id: serial("id").primaryKey(),
  day: bigint("day", { mode: "number" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const programsRelations = relations(programs, ({ many }) => ({
  splits: many(splits),
}));

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
