--
-- PostgreSQL database dump
--

\restrict UOHq2uoQfcLmREg1QU37uqDeVvadUyA8TB39YjR3QRq2fkUQWz43MZ6GsPea7yX

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS "sessions_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "reservations_planningId_fkey";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "reservations_memberId_fkey";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "reservations_debitedPackId_fkey";
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS "reservations_createdByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public.qrcodes DROP CONSTRAINT IF EXISTS "qrcodes_createdByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public.qrcodes DROP CONSTRAINT IF EXISTS "qrcodes_assignedMemberId_fkey";
ALTER TABLE IF EXISTS ONLY public.qrcodes DROP CONSTRAINT IF EXISTS "qrcodes_assignedCoachId_fkey";
ALTER TABLE IF EXISTS ONLY public.planning DROP CONSTRAINT IF EXISTS "planning_draftSourceId_fkey";
ALTER TABLE IF EXISTS ONLY public.planning DROP CONSTRAINT IF EXISTS "planning_coachId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_promotion_packs DROP CONSTRAINT IF EXISTS "pack_promotion_packs_promotionId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_promotion_packs DROP CONSTRAINT IF EXISTS "pack_promotion_packs_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_payments DROP CONSTRAINT IF EXISTS "pack_payments_recordedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_payments DROP CONSTRAINT IF EXISTS "pack_payments_promotionId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_payments DROP CONSTRAINT IF EXISTS "pack_payments_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_payments DROP CONSTRAINT IF EXISTS "pack_payments_memberId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_features DROP CONSTRAINT IF EXISTS "pack_features_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.pack_course_quotas DROP CONSTRAINT IF EXISTS "pack_course_quotas_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "members_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "members_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.member_pending_packs DROP CONSTRAINT IF EXISTS "member_pending_packs_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.member_pending_packs DROP CONSTRAINT IF EXISTS "member_pending_packs_memberId_fkey";
ALTER TABLE IF EXISTS ONLY public.member_pack_enrollments DROP CONSTRAINT IF EXISTS "member_pack_enrollments_packPaymentId_fkey";
ALTER TABLE IF EXISTS ONLY public.member_pack_enrollments DROP CONSTRAINT IF EXISTS "member_pack_enrollments_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.member_pack_enrollments DROP CONSTRAINT IF EXISTS "member_pack_enrollments_memberId_fkey";
ALTER TABLE IF EXISTS ONLY public.member_pack_balances DROP CONSTRAINT IF EXISTS "member_pack_balances_packId_fkey";
ALTER TABLE IF EXISTS ONLY public.member_pack_balances DROP CONSTRAINT IF EXISTS "member_pack_balances_memberId_fkey";
ALTER TABLE IF EXISTS ONLY public.coaches DROP CONSTRAINT IF EXISTS "coaches_userId_fkey";
ALTER TABLE IF EXISTS ONLY public.checkins DROP CONSTRAINT IF EXISTS "checkins_reservationId_fkey";
ALTER TABLE IF EXISTS ONLY public.checkins DROP CONSTRAINT IF EXISTS "checkins_qrCodeId_fkey";
ALTER TABLE IF EXISTS ONLY public.checkins DROP CONSTRAINT IF EXISTS "checkins_memberId_fkey";
ALTER TABLE IF EXISTS ONLY public.cash_expenses DROP CONSTRAINT IF EXISTS "cash_expenses_recordedByUserId_fkey";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "attendance_reservationId_fkey";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "attendance_planningId_fkey";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "attendance_memberId_fkey";
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public."studio_planning_period_archive_periodStartDate_periodEndDat_idx";
DROP INDEX IF EXISTS public."studio_planning_period_archive_periodStartDate_key";
DROP INDEX IF EXISTS public."sessions_sessionToken_key";
DROP INDEX IF EXISTS public."reservations_planningId_sessionDate_idx";
DROP INDEX IF EXISTS public."reservations_memberId_sessionDate_idx";
DROP INDEX IF EXISTS public."reservations_memberId_planningId_sessionDate_key";
DROP INDEX IF EXISTS public."reservations_debitedPackId_idx";
DROP INDEX IF EXISTS public."reservations_createdByUserId_idx";
DROP INDEX IF EXISTS public.qrcodes_status_idx;
DROP INDEX IF EXISTS public."qrcodes_publicId_key";
DROP INDEX IF EXISTS public."qrcodes_publicId_idx";
DROP INDEX IF EXISTS public."qrcodes_createdByUserId_idx";
DROP INDEX IF EXISTS public."qrcodes_assignedMemberId_idx";
DROP INDEX IF EXISTS public."qrcodes_assignedCoachId_idx";
DROP INDEX IF EXISTS public."planning_isDraft_idx";
DROP INDEX IF EXISTS public."planning_draftSourceId_key";
DROP INDEX IF EXISTS public."planning_draftSourceId_idx";
DROP INDEX IF EXISTS public."planning_dayOfWeek_startTime_idx";
DROP INDEX IF EXISTS public."planning_dayOfWeek_idx";
DROP INDEX IF EXISTS public."planning_courseSlug_idx";
DROP INDEX IF EXISTS public."planning_coachId_idx";
DROP INDEX IF EXISTS public.packs_name_key;
DROP INDEX IF EXISTS public."pack_promotions_startsAt_endsAt_idx";
DROP INDEX IF EXISTS public."pack_promotions_isActive_idx";
DROP INDEX IF EXISTS public."pack_promotion_packs_packId_idx";
DROP INDEX IF EXISTS public."pack_payments_paidAt_idx";
DROP INDEX IF EXISTS public."pack_payments_packId_paidAt_idx";
DROP INDEX IF EXISTS public."pack_payments_memberId_paidAt_idx";
DROP INDEX IF EXISTS public."pack_features_packId_sortOrder_idx";
DROP INDEX IF EXISTS public."pack_features_packId_idx";
DROP INDEX IF EXISTS public."pack_course_quotas_packId_idx";
DROP INDEX IF EXISTS public."pack_course_quotas_packId_courseSlug_key";
DROP INDEX IF EXISTS public."pack_course_quotas_courseSlug_idx";
DROP INDEX IF EXISTS public."members_userId_key";
DROP INDEX IF EXISTS public."members_packId_idx";
DROP INDEX IF EXISTS public."member_pending_packs_memberId_position_idx";
DROP INDEX IF EXISTS public."member_pack_enrollments_packPaymentId_key";
DROP INDEX IF EXISTS public."member_pack_enrollments_memberId_purchasedAt_idx";
DROP INDEX IF EXISTS public."member_pack_enrollments_memberId_packId_idx";
DROP INDEX IF EXISTS public."member_pack_balances_packId_idx";
DROP INDEX IF EXISTS public."member_pack_balances_memberId_packId_courseSlug_key";
DROP INDEX IF EXISTS public."member_pack_balances_memberId_idx";
DROP INDEX IF EXISTS public."coaches_userId_key";
DROP INDEX IF EXISTS public."coaches_lastName_firstName_idx";
DROP INDEX IF EXISTS public.coaches_email_key;
DROP INDEX IF EXISTS public."checkins_scannedAt_idx";
DROP INDEX IF EXISTS public."checkins_reservationId_key";
DROP INDEX IF EXISTS public."checkins_qrCodeId_idx";
DROP INDEX IF EXISTS public."checkins_memberId_idx";
DROP INDEX IF EXISTS public."cash_expenses_expenseDate_idx";
DROP INDEX IF EXISTS public."attendance_reservationId_key";
DROP INDEX IF EXISTS public."attendance_planningId_sessionDate_idx";
DROP INDEX IF EXISTS public."attendance_memberId_sessionDate_idx";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.studio_planning_period DROP CONSTRAINT IF EXISTS studio_planning_period_pkey;
ALTER TABLE IF EXISTS ONLY public.studio_planning_period_archive DROP CONSTRAINT IF EXISTS studio_planning_period_archive_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_pkey;
ALTER TABLE IF EXISTS ONLY public.qrcodes DROP CONSTRAINT IF EXISTS qrcodes_pkey;
ALTER TABLE IF EXISTS ONLY public.planning DROP CONSTRAINT IF EXISTS planning_pkey;
ALTER TABLE IF EXISTS ONLY public.packs DROP CONSTRAINT IF EXISTS packs_pkey;
ALTER TABLE IF EXISTS ONLY public.pack_promotions DROP CONSTRAINT IF EXISTS pack_promotions_pkey;
ALTER TABLE IF EXISTS ONLY public.pack_promotion_packs DROP CONSTRAINT IF EXISTS pack_promotion_packs_pkey;
ALTER TABLE IF EXISTS ONLY public.pack_payments DROP CONSTRAINT IF EXISTS pack_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.pack_features DROP CONSTRAINT IF EXISTS pack_features_pkey;
ALTER TABLE IF EXISTS ONLY public.pack_course_quotas DROP CONSTRAINT IF EXISTS pack_course_quotas_pkey;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_pkey;
ALTER TABLE IF EXISTS ONLY public.member_pending_packs DROP CONSTRAINT IF EXISTS member_pending_packs_pkey;
ALTER TABLE IF EXISTS ONLY public.member_pack_enrollments DROP CONSTRAINT IF EXISTS member_pack_enrollments_pkey;
ALTER TABLE IF EXISTS ONLY public.member_pack_balances DROP CONSTRAINT IF EXISTS member_pack_balances_pkey;
ALTER TABLE IF EXISTS ONLY public.coaches DROP CONSTRAINT IF EXISTS coaches_pkey;
ALTER TABLE IF EXISTS ONLY public.checkins DROP CONSTRAINT IF EXISTS checkins_pkey;
ALTER TABLE IF EXISTS ONLY public.cash_expenses DROP CONSTRAINT IF EXISTS cash_expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS attendance_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.studio_planning_period_archive;
DROP TABLE IF EXISTS public.studio_planning_period;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.qrcodes;
DROP TABLE IF EXISTS public.planning;
DROP TABLE IF EXISTS public.packs;
DROP TABLE IF EXISTS public.pack_promotions;
DROP TABLE IF EXISTS public.pack_promotion_packs;
DROP TABLE IF EXISTS public.pack_payments;
DROP TABLE IF EXISTS public.pack_features;
DROP TABLE IF EXISTS public.pack_course_quotas;
DROP TABLE IF EXISTS public.members;
DROP TABLE IF EXISTS public.member_pending_packs;
DROP TABLE IF EXISTS public.member_pack_enrollments;
DROP TABLE IF EXISTS public.member_pack_balances;
DROP TABLE IF EXISTS public.coaches;
DROP TABLE IF EXISTS public.checkins;
DROP TABLE IF EXISTS public.cash_expenses;
DROP TABLE IF EXISTS public.attendance;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."ReservationStatus";
DROP TYPE IF EXISTS public."ReservationSource";
DROP TYPE IF EXISTS public."QrCodeStatus";
DROP TYPE IF EXISTS public."PlanningLevel";
DROP TYPE IF EXISTS public."PersonalDiscountType";
DROP TYPE IF EXISTS public."PackPaymentSource";
DROP TYPE IF EXISTS public."PackPaymentMethod";
DROP TYPE IF EXISTS public."PackPaymentKind";
DROP TYPE IF EXISTS public."PackDiscountType";
DROP TYPE IF EXISTS public."MemberPackEnrollmentStatus";
DROP TYPE IF EXISTS public."MemberEnrollmentStatus";
DROP TYPE IF EXISTS public."DraftPublicationPhase";
DROP TYPE IF EXISTS public."DayOfWeek";
DROP TYPE IF EXISTS public."CoachPayrollMode";
DROP TYPE IF EXISTS public."CashExpenseKind";
DROP TYPE IF EXISTS public."BookingWindow";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BookingWindow; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingWindow" AS ENUM (
    'WEEKLY',
    'FIFTEEN_DAYS',
    'ONE_MONTH'
);


ALTER TYPE public."BookingWindow" OWNER TO postgres;

--
-- Name: CashExpenseKind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CashExpenseKind" AS ENUM (
    'FIXED',
    'VARIABLE'
);


ALTER TYPE public."CashExpenseKind" OWNER TO postgres;

--
-- Name: CoachPayrollMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CoachPayrollMode" AS ENUM (
    'PER_SESSION',
    'PER_MONTH'
);


ALTER TYPE public."CoachPayrollMode" OWNER TO postgres;

--
-- Name: DayOfWeek; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DayOfWeek" AS ENUM (
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
    'SUN'
);


ALTER TYPE public."DayOfWeek" OWNER TO postgres;

--
-- Name: DraftPublicationPhase; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DraftPublicationPhase" AS ENUM (
    'SCHEDULED',
    'PARTIAL'
);


ALTER TYPE public."DraftPublicationPhase" OWNER TO postgres;

--
-- Name: MemberEnrollmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MemberEnrollmentStatus" AS ENUM (
    'ACTIVE',
    'DEPOSIT_PENDING'
);


ALTER TYPE public."MemberEnrollmentStatus" OWNER TO postgres;

--
-- Name: MemberPackEnrollmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MemberPackEnrollmentStatus" AS ENUM (
    'PENDING_START',
    'ACTIVE',
    'EXPIRED',
    'REPLACED'
);


ALTER TYPE public."MemberPackEnrollmentStatus" OWNER TO postgres;

--
-- Name: PackDiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PackDiscountType" AS ENUM (
    'PERCENT'
);


ALTER TYPE public."PackDiscountType" OWNER TO postgres;

--
-- Name: PackPaymentKind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PackPaymentKind" AS ENUM (
    'FULL',
    'DEPOSIT',
    'BALANCE'
);


ALTER TYPE public."PackPaymentKind" OWNER TO postgres;

--
-- Name: PackPaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PackPaymentMethod" AS ENUM (
    'CASH',
    'CHECK',
    'TPE'
);


ALTER TYPE public."PackPaymentMethod" OWNER TO postgres;

--
-- Name: PackPaymentSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PackPaymentSource" AS ENUM (
    'AUTO',
    'MANUAL'
);


ALTER TYPE public."PackPaymentSource" OWNER TO postgres;

--
-- Name: PersonalDiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PersonalDiscountType" AS ENUM (
    'PERCENT',
    'AMOUNT'
);


ALTER TYPE public."PersonalDiscountType" OWNER TO postgres;

--
-- Name: PlanningLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlanningLevel" AS ENUM (
    'ALL_LEVELS',
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public."PlanningLevel" OWNER TO postgres;

--
-- Name: QrCodeStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QrCodeStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."QrCodeStatus" OWNER TO postgres;

--
-- Name: ReservationSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReservationSource" AS ENUM (
    'MEMBER',
    'ADMIN'
);


ALTER TYPE public."ReservationSource" OWNER TO postgres;

--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'BOOKED',
    'WAITLIST',
    'CANCELLED',
    'ATTENDED'
);


ALTER TYPE public."ReservationStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'SUPER_ADMIN',
    'MEMBRE',
    'COACH'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id text NOT NULL,
    "reservationId" text NOT NULL,
    "memberId" text NOT NULL,
    "planningId" text NOT NULL,
    "sessionDate" date NOT NULL,
    "markedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "markedBy" text DEFAULT 'STAFF_KEY'::text NOT NULL
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: cash_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash_expenses (
    id text NOT NULL,
    kind public."CashExpenseKind" NOT NULL,
    label text NOT NULL,
    "amountDinars" integer NOT NULL,
    "expenseDate" date NOT NULL,
    note text,
    "recordedByUserId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cash_expenses OWNER TO postgres;

--
-- Name: checkins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkins (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "qrCodeId" text NOT NULL,
    "reservationId" text,
    "scannedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    method text NOT NULL
);


ALTER TABLE public.checkins OWNER TO postgres;

--
-- Name: coaches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coaches (
    id text NOT NULL,
    "imageUrl" text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    description text,
    email text,
    phone text,
    "sessionCostDinars" integer,
    "monthlySalaryDinars" integer,
    "payrollMode" public."CoachPayrollMode" DEFAULT 'PER_SESSION'::public."CoachPayrollMode" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text
);


ALTER TABLE public.coaches OWNER TO postgres;

--
-- Name: member_pack_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_pack_balances (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "packId" text NOT NULL,
    "courseSlug" text,
    remaining integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.member_pack_balances OWNER TO postgres;

--
-- Name: member_pack_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_pack_enrollments (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "packId" text NOT NULL,
    "packPaymentId" text,
    "purchasedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "packStartedAt" timestamp(3) without time zone,
    "packExpiresAt" timestamp(3) without time zone,
    status public."MemberPackEnrollmentStatus" DEFAULT 'PENDING_START'::public."MemberPackEnrollmentStatus" NOT NULL,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.member_pack_enrollments OWNER TO postgres;

--
-- Name: member_pending_packs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_pending_packs (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "packId" text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.member_pending_packs OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id text NOT NULL,
    "userId" text,
    "firstName" text,
    "lastName" text,
    phone text,
    "birthDate" timestamp(3) without time zone,
    "packId" text,
    "packStartedAt" timestamp(3) without time zone,
    "personalDiscountType" public."PersonalDiscountType",
    "personalDiscountValue" integer,
    "personalDiscountReason" text,
    "enrollmentStatus" public."MemberEnrollmentStatus" DEFAULT 'ACTIVE'::public."MemberEnrollmentStatus" NOT NULL,
    "expectedPackAmountDinars" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    note text
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: pack_course_quotas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pack_course_quotas (
    id text NOT NULL,
    "packId" text NOT NULL,
    "courseSlug" text NOT NULL,
    "sessionCount" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pack_course_quotas OWNER TO postgres;

--
-- Name: pack_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pack_features (
    id text NOT NULL,
    "packId" text NOT NULL,
    label text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pack_features OWNER TO postgres;

--
-- Name: pack_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pack_payments (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "packId" text NOT NULL,
    "amountDinars" integer NOT NULL,
    "listPriceDinars" integer,
    "packSaleTotalDinars" integer,
    "personalDiscountType" public."PersonalDiscountType",
    "personalDiscountValue" integer,
    "personalDiscountDinars" integer DEFAULT 0 NOT NULL,
    "paidAt" date NOT NULL,
    source public."PackPaymentSource" NOT NULL,
    "paymentKind" public."PackPaymentKind" DEFAULT 'FULL'::public."PackPaymentKind" NOT NULL,
    "paymentMethod" public."PackPaymentMethod",
    "promotionId" text,
    note text,
    "recordedByUserId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pack_payments OWNER TO postgres;

--
-- Name: pack_promotion_packs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pack_promotion_packs (
    "promotionId" text NOT NULL,
    "packId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pack_promotion_packs OWNER TO postgres;

--
-- Name: pack_promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pack_promotions (
    id text NOT NULL,
    label text,
    "appliesToAll" boolean DEFAULT false NOT NULL,
    "discountType" public."PackDiscountType" DEFAULT 'PERCENT'::public."PackDiscountType" NOT NULL,
    "discountValue" integer NOT NULL,
    "startsAt" date NOT NULL,
    "endsAt" date NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pack_promotions OWNER TO postgres;

--
-- Name: packs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packs (
    id text NOT NULL,
    category text,
    name text NOT NULL,
    description text,
    "sessionCount" integer,
    "priceCents" integer,
    "durationDays" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.packs OWNER TO postgres;

--
-- Name: planning; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planning (
    id text NOT NULL,
    "courseSlug" text NOT NULL,
    "coachId" text,
    "dayOfWeek" public."DayOfWeek" NOT NULL,
    "anchorSessionYmd" date,
    level public."PlanningLevel",
    "bookingWindow" public."BookingWindow" DEFAULT 'WEEKLY'::public."BookingWindow" NOT NULL,
    "startTime" text DEFAULT '00:00'::text NOT NULL,
    "endTime" text DEFAULT '00:00'::text NOT NULL,
    "durationMinutes" integer NOT NULL,
    capacity integer NOT NULL,
    "waitlistCapacity" integer,
    "isDraft" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "draftSourceId" text
);


ALTER TABLE public.planning OWNER TO postgres;

--
-- Name: qrcodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qrcodes (
    id text NOT NULL,
    "publicId" text NOT NULL,
    "qrKey" text DEFAULT ''::text NOT NULL,
    name text NOT NULL,
    status public."QrCodeStatus" DEFAULT 'DRAFT'::public."QrCodeStatus" NOT NULL,
    "assignedMemberId" text,
    "createdByUserId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "assignedCoachId" text
);


ALTER TABLE public.qrcodes OWNER TO postgres;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id text NOT NULL,
    "memberId" text NOT NULL,
    "planningId" text NOT NULL,
    "sessionDate" date NOT NULL,
    status public."ReservationStatus" DEFAULT 'BOOKED'::public."ReservationStatus" NOT NULL,
    source public."ReservationSource",
    "createdByUserId" text,
    "packRefundedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "debitedPackId" text
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: studio_planning_period; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.studio_planning_period (
    id text DEFAULT 'singleton'::text NOT NULL,
    "bookingWindow" public."BookingWindow" DEFAULT 'WEEKLY'::public."BookingWindow" NOT NULL,
    "periodStartDate" date NOT NULL,
    "draftPeriodStartDate" date,
    "draftBookingWindow" public."BookingWindow",
    "draftPublishAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "draftPublicationPhase" public."DraftPublicationPhase",
    "draftSundayPublishAt" timestamp(3) without time zone,
    "lateCancellationRuleEnabled" boolean DEFAULT true NOT NULL,
    "memberReservationOpenTime" text DEFAULT '08:00'::text NOT NULL,
    "memberReservationCloseTime" text DEFAULT '22:00'::text NOT NULL
);


ALTER TABLE public.studio_planning_period OWNER TO postgres;

--
-- Name: studio_planning_period_archive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.studio_planning_period_archive (
    id text NOT NULL,
    "bookingWindow" public."BookingWindow" NOT NULL,
    "periodStartDate" date NOT NULL,
    "periodEndDate" date NOT NULL,
    "archivedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.studio_planning_period_archive OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    image text,
    password text,
    role public."UserRole" DEFAULT 'MEMBRE'::public."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b5baf7cb-1ce7-4ca7-9f88-933515ec5d54	721a43a64ff23d0fd851397fd68ebf1578de59b8600f46c653d104a439375e29	2026-06-17 18:20:18.438583+00	20260428062814_init_auth		\N	2026-06-17 18:20:18.438583+00	0
278cee66-7e09-4455-84e9-824ec822ab23	6d7c8c435c75f5ea9a835c79fe48eb7927ca4998c5af459f00d65c666699713a	2026-06-17 18:20:20.601509+00	20260428063751_simplify_auth_tables		\N	2026-06-17 18:20:20.601509+00	0
6132b229-7040-4f12-af84-3269b2f74bca	60ff2d14c42c5e715036eb74459f5fe7a78d50f5e82188485d231261f7658cc8	2026-06-17 18:20:22.684947+00	20260428064714_add_database_sessions		\N	2026-06-17 18:20:22.684947+00	0
3132f595-9811-4923-a2ad-a07dedb00340	d57f973208b33464024ac9f29b29d3613260ca2c6896e05004afa43ecdc1a829	2026-06-17 18:20:24.797992+00	20260504141000_add_booking_window_to_planning		\N	2026-06-17 18:20:24.797992+00	0
2715b9d0-e528-4e6a-ab72-74191a2e6381	0f628a9f925a26ee3c32b4d34d4e1e0162e9a46b268c0cf2b09ca896890d7dc4	2026-06-17 18:20:26.974011+00	20260505120000_checkin_unique_reservation		\N	2026-06-17 18:20:26.974011+00	0
290aca30-a703-4afd-b403-d8b2c6497623	bd1e0e1760602816f453cb2d2c73d15fd60ab11b6bb161e873e7235a4168dc5e	2026-06-17 18:20:29.004133+00	20260514120000_pack_duration_int_to_text		\N	2026-06-17 18:20:29.004133+00	0
dae38fbf-abfb-4ec6-b3de-2fd819cd2677	586b14ca481737c9bfda508c7f46ef1cdf4cf5a3e8a58b2c2101a92efbc70984	2026-06-17 18:20:31.001397+00	20260516120000_planning_level_nullable		\N	2026-06-17 18:20:31.001397+00	0
a3d4cae1-6387-417c-9240-10a73721e0d5	d0cdb3dd3ed3636be93eb3a7f5f2b71b76562ba1af893d1add21e8915a9d62f0	2026-06-17 18:20:33.130655+00	20260517120000_pack_promotions		\N	2026-06-17 18:20:33.130655+00	0
baa4049c-5beb-4f30-8467-2b5fa8f96010	02bff1c7ccfa4483eab60f8c348da5d0f4955018e97d4e1574cda732cc26ec59	2026-06-17 18:20:35.238534+00	20260518120000_pack_promotion_multi_pack		\N	2026-06-17 18:20:35.238534+00	0
1632ca5e-aa05-4ae1-b407-3b7abb2d44d4	b3cc5e8fbf62002c5eb6a4b5b8d15e6cf9027f55a11bdcf23360d1859b6c6c06	2026-06-17 18:20:37.408296+00	20260519120000_pack_payments		\N	2026-06-17 18:20:37.408296+00	0
b6948d19-c822-4ab8-897d-aca8f545a472	833b92f122c8afc21b1be7d6b5deb5c2fdddef0c012783b63ca1badf24c4bb89	2026-06-17 18:20:39.513609+00	20260520120000_cash_expenses		\N	2026-06-17 18:20:39.513609+00	0
ffb31e07-6dbb-4759-87d0-9f2c1a3581b0	556b0062d02dbae1e5963a161c0ce507995583e5a2fe2863b01ae69d8f341aeb	2026-06-17 18:20:41.63523+00	20260521120000_coach_session_cost		\N	2026-06-17 18:20:41.63523+00	0
05ec07e8-8ad4-426d-be64-ec1378399efa	b32cbe5f9cd407e9f7d8034286c582ead8c59e51c3e70045944daa4443c5a0ca	2026-06-17 18:20:43.771842+00	20260522120000_studio_planning_period		\N	2026-06-17 18:20:43.771842+00	0
55d229ee-84f2-4db1-8972-6497c95961dc	5e2563c5e58a577ff1e1c1f1e44e0256c2ffc5f4ccc9f218e074be563d43818f	2026-06-17 18:20:45.937757+00	20260523120000_coach_payroll_mode		\N	2026-06-17 18:20:45.937757+00	0
a83b861d-d92a-4233-8774-1bfb8b55cc59	f2e402bf1898e68c0c46707fe80640e566960ebbb6acb44c8ab0367ad2962844	2026-06-17 18:20:48.130326+00	20260524120000_user_role_super_admin		\N	2026-06-17 18:20:48.130326+00	0
b4db55f6-5dd7-4fc9-b052-0ddbca53216c	f929eae4e6b2b4c86c4f87fe91383e0e1b3fb2254c118c29b169aad5e706956b	2026-06-17 18:20:50.191097+00	20260528140000_pack_payment_personal_discount		\N	2026-06-17 18:20:50.191097+00	0
945a036d-26c8-48e5-872b-5af353c39dbd	1023526c40e8477b507cd48917fcdc216d9ead6019f9075b287ad57dee0ab5d2	2026-06-17 18:20:52.355754+00	20260528143000_member_personal_discount_defaults		\N	2026-06-17 18:20:52.355754+00	0
0dd8dbc9-60b1-4a78-b212-49ddf9a141b3	d435eb7f8b73927f94d7198827a127776b515768de1be4a7b86b5767903c92f6	2026-06-17 18:20:54.563627+00	20260528165000_reservation_source_tracking		\N	2026-06-17 18:20:54.563627+00	0
c0bea8d8-b78f-4afa-ba3c-df82b2fc3d6c	fc3cc8239d2189e9cdefd4cd9fc89b8e1819f60da1ddbf9e2495b486113ec9a8	2026-06-17 18:20:56.627395+00	20260528170000_reservation_created_by_user		\N	2026-06-17 18:20:56.627395+00	0
79b23cee-877d-4b00-9acd-84707a98e558	34b193813e44cdaddc996645d0e8c9391e40bbd47dc47b3289158491bb8b3ddd	2026-06-17 18:20:58.744042+00	20260530120000_member_pending_packs		\N	2026-06-17 18:20:58.744042+00	0
a3772a80-a607-42a8-b958-1a14d8d9cd5a	8c1156c916f4d7c4349629458730dd8173ccdf83f07f3087bb8c5d9a57a957c5	2026-06-17 18:21:00.778409+00	20260531120000_member_deposit_enrollment		\N	2026-06-17 18:21:00.778409+00	0
57bd7436-b48d-4785-b69e-545c0db710dd	6cf84bb6ee3e8431b47d8a33d46e2e21e85b3ab15a061a1fce1622dbe74180cf	2026-06-17 18:21:02.932209+00	20260531143000_pack_payment_sale_total		\N	2026-06-17 18:21:02.932209+00	0
5fa4d803-7aff-466e-8b98-d2449ba20bc8	a4c8266671263f146cb727f4f632a02140c37641245f047a92640a2ff04d2604	2026-06-17 18:21:05.074246+00	20260531150000_pack_payment_method		\N	2026-06-17 18:21:05.074246+00	0
f20290d8-db3e-49bf-b541-f09fa6055453	2de80f9261a9fac9e2d11a3bebf07c1780406c77c90004bbb55a63df5e8a2f8d	2026-06-17 18:21:07.097696+00	20260531153000_pack_payment_method_nullable		\N	2026-06-17 18:21:07.097696+00	0
d40afed7-215b-42ba-bc82-d68fe5fe3df4	4315f535704370b45548f594a17bc2c4d512b988319b8b338a4c8d95115aced8	2026-06-17 18:21:09.168957+00	20260601120000_planning_anchor_session_date		\N	2026-06-17 18:21:09.168957+00	0
fbee4ba4-0c34-451e-b7d5-bf1cc3a5527f	a1f20120b311804eddc341f9123afe3ab58d630a215b7bdc51ff2eff10fc7e9a	2026-06-17 18:21:11.170131+00	20260601140000_planning_draft_period		\N	2026-06-17 18:21:11.170131+00	0
51bf9b80-c6a4-43f1-a49c-19d2218f0839	cefa7dd0109de4dc9973959786c2849b97e81c2a21b590ebb4f0bcdc57f2dde2	2026-06-17 18:21:13.176705+00	20260602120000_planning_period_archive		\N	2026-06-17 18:21:13.176705+00	0
c27df275-2bb6-43f2-b90c-b6d3224a19fa	b6a62a22015d93c727fe41229655a31e5e6276b96e22ab629dc0b5d4f025a290	2026-06-17 18:21:15.310224+00	20260611120000_staggered_draft_publish		\N	2026-06-17 18:21:15.310224+00	0
91131f68-6467-4603-ac61-b05f0b7a3b48	ccb3a4b2b4ecbcf96e2944b01030ac762e613394da64ed6acd29181aad0d8639	2026-06-17 18:21:17.36418+00	20260614120000_late_cancellation_rule		\N	2026-06-17 18:21:17.36418+00	0
1feccea0-0847-4501-a383-b861554b5e3f	20eb5aabef327d2d368b4569167365d066e9b954f08303c1a0c940b253e5da4a	2026-06-23 17:58:53.720062+00	20260622160000_member_reservation_hours	\N	\N	2026-06-23 17:58:53.71418+00	1
ff37128f-5249-4e85-ae71-3e1604d50ee3	263f1e3058ca29fb7b4ffd8c6007e708f89cdbc9dd040f6ce5b1813c0a9e323e	2026-06-23 17:58:53.738594+00	20260622180000_coach_space_auth	\N	\N	2026-06-23 17:58:53.720803+00	1
047a21c7-e3a5-4bfd-b4c7-1c3abc3aeb5a	5618b139d6ecac3cb36b19fc0c4c8373c3e0cc4885654cd8600661378b46b2d3	2026-06-30 11:04:19.470303+00	20260624140000_planning_draft_source	\N	\N	2026-06-30 11:04:19.365544+00	1
3d8c4024-3595-4757-8375-15d3340eb920	3437c22e802d6af7bc7ab405dbb726f54dfaa03ea20dbcee8c829a3040457796	2026-06-26 14:11:19.796338+00	20260624120000_reservation_debited_pack	\N	\N	2026-06-26 14:11:19.780341+00	1
13f3c525-3aa6-4281-9533-94e2ab76e94a	f3e1df5c56c6a8f34ba706ecc9e812d1c999928bb2e04a4d76f1ad6109266df4	2026-06-30 11:04:19.504884+00	20260624180000_member_note	\N	\N	2026-06-30 11:04:19.497176+00	1
66744c7f-d7f0-4f51-b4d0-d01f3a396fbb	535d8d13ff1dd5b6547e4cdaa28a1ff99405fcb2152e0b229e416d4c61551711	2026-06-30 11:04:19.496384+00	20260624160000_member_pack_enrollments	\N	\N	2026-06-30 11:04:19.471282+00	1
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, "reservationId", "memberId", "planningId", "sessionDate", "markedAt", "markedBy") FROM stdin;
cmqmjzsi4000uod01ba1g89ms	cmqmjzsi1000sod01muneei82	cmpux8mfw00i4p401v4t85sji	cmq9ez4dc0005wmyslxmkno99	2026-05-18	2026-06-20 16:09:49.325	ADMIN_HISTORICAL
cmqmk06ks0012od01koefvfzp	cmqmk06kr0010od01uhvkzixt	cmpb23ldo00c7p401ut25a8kv	cmq9ez4dc0005wmyslxmkno99	2026-05-18	2026-06-20 16:10:07.565	ADMIN_HISTORICAL
cmqmk0j72001aod01xhvb9pnc	cmqmk0j700018od01yb5f4k9z	cmp5e2po6007el401m0wr4bxe	cmq9ez4dc0005wmyslxmkno99	2026-05-18	2026-06-20 16:10:23.918	ADMIN_HISTORICAL
cmqmk2pb9001iod011qc67u2r	cmqmk2pb7001god01m6cjo4n8	cmp6tmko3004rp4010ev8s38b	cmq9f01ao0007wmys8as5zcu2	2026-05-18	2026-06-20 16:12:05.157	ADMIN_HISTORICAL
cmqmk31sn001qod019k9xqapq	cmqmk31sl001ood01i14x0lrc	cmp6mh9mn0033p401xa6v43p7	cmq9f01ao0007wmys8as5zcu2	2026-05-18	2026-06-20 16:12:21.335	ADMIN_HISTORICAL
cmqmk8d05001yod01n4larh6f	cmqmk8d03001wod01rspm7plz	cmp6n9pyb0047p401exgskztu	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	2026-06-20 16:16:29.142	ADMIN_HISTORICAL
cmqmk8peh0026od01vszpdj2t	cmqmk8peg0024od0119mtpjqq	cmp9pbn9j00b7p401wd3w8sn0	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	2026-06-20 16:16:45.209	ADMIN_HISTORICAL
cmqmk8zyw002eod01uvcpbs5e	cmqmk8zyu002cod0125uyz6g4	cmp9p95jj00b2p401dqlrtohp	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	2026-06-20 16:16:58.904	ADMIN_HISTORICAL
cmqmk9d59002mod01i1iby1g7	cmqmk9d58002kod01ku5l7s1c	cmpbet54q00cpp4015io1o59b	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	2026-06-20 16:17:15.982	ADMIN_HISTORICAL
cmqmkbsc3002uod01ph32f9e1	cmqmkbsc1002sod01n2rysj8l	cmpb26l0900ccp4014tau0gjw	cmq9fdxrr000hwmys6dp512ve	2026-05-19	2026-06-20 16:19:08.979	ADMIN_HISTORICAL
cmqmkc0r00032od01h1fjcksx	cmqmkc0qz0030od01z3a3kxfu	cmp5dd5sd0074l401pv3drst8	cmq9fdxrr000hwmys6dp512ve	2026-05-19	2026-06-20 16:19:19.885	ADMIN_HISTORICAL
cmqmkcecq003aod01m38fu90j	cmqmkcecp0038od01kb57st2w	cmp6ndov4004cp4011gucmmzn	cmq9fdxrr000hwmys6dp512ve	2026-05-19	2026-06-20 16:19:37.514	ADMIN_HISTORICAL
cmqmkcml6003iod01kmuzm75o	cmqmkcml5003god015auoc20f	cmp5r6eqa001kp401z95m2mtr	cmq9fdxrr000hwmys6dp512ve	2026-05-19	2026-06-20 16:19:48.187	ADMIN_HISTORICAL
cmqmke8r3003qod01uzfytrsm	cmqmke8r1003ood01e2a1mopd	cmp5i45nq000ap401mr5kujgq	cmq9feru8000jwmysq1vizy87	2026-05-19	2026-06-20 16:21:03.567	ADMIN_HISTORICAL
cmqmkef10003yod01ogey5yxc	cmqmkef0y003wod01fsw8lrev	cmp5lkgat000fp4013f720b0o	cmq9feru8000jwmysq1vizy87	2026-05-19	2026-06-20 16:21:11.7	ADMIN_HISTORICAL
cmqmkf8m40046od017pi52v8w	cmqmkf8m30044od01gmisq8pp	cmp5r29es001fp401vky62ly4	cmq9fhaem000nwmys8jdowqm2	2026-05-19	2026-06-20 16:21:50.045	ADMIN_HISTORICAL
cmqqki0sa0022p901yb090zzv	cmqqki0s80020p901ukj415ms	cmqp0fvcq00e0od01115zmkft	cmq9fi14k000pwmysgpf3tejt	2026-05-19	2026-06-23 11:35:04.57	ADMIN_HISTORICAL
cmqqkib0s002ap9016gwkblyd	cmqqkib0r0028p9011zr9if10	cmqpbic6z0010lk01lg3znp3o	cmq9fi14k000pwmysgpf3tejt	2026-05-19	2026-06-23 11:35:17.836	ADMIN_HISTORICAL
cmqqkioqf002ip9018lyuh566	cmqqkioqd002gp9011jwtfomu	cmqpbg2wz000tlk01pnlcrmdj	cmq9fi14k000pwmysgpf3tejt	2026-05-19	2026-06-23 11:35:35.607	ADMIN_HISTORICAL
cmqqkk2lw002mp901xig6qbv2	cmqqkk2lu002kp90155lv05dn	cmp6n9pyb0047p401exgskztu	cmq9fjtnr000rwmyskcdppnns	2026-05-20	2026-06-23 11:36:40.244	ADMIN_HISTORICAL
cmqqkkize002up901r82c4z2g	cmqqkkizd002sp901ojw5n6o9	cmp71pbmj005ip401rxsl0n27	cmq9fjtnr000rwmyskcdppnns	2026-05-20	2026-06-23 11:37:01.467	ADMIN_HISTORICAL
cmqqkl4400032p901vlph7qkk	cmqqkl43y0030p901uxh6esgh	cmpmhc40500h9p40180sb0edr	cmq9fmidc000xwmys98o2xwh0	2026-05-21	2026-06-23 11:37:28.849	ADMIN_HISTORICAL
cmqqklu04003ap901sh01p2l8	cmqqklu020038p9011m23kl4u	cmp6n0r9g003sp401svwhqzjy	cmq9fpbtv0013wmysev1zh32u	2026-05-21	2026-06-23 11:38:02.404	ADMIN_HISTORICAL
cmqqkm239003ip901iwsonxfl	cmqqkm238003gp901kmtib96x	cmpazudle00byp401oz4zx3e1	cmq9fpbtv0013wmysev1zh32u	2026-05-21	2026-06-23 11:38:12.885	ADMIN_HISTORICAL
cmqqkmkrv003qp901mlos994u	cmqqkmkrt003op901is1z0ziq	cmp6n445r003xp4019r22o12e	cmq9fpbtv0013wmysev1zh32u	2026-05-21	2026-06-23 11:38:37.099	ADMIN_HISTORICAL
cmqqkmzwl003up90119j5hnz2	cmqqkmzwk003sp901ju7nfxb6	cmpbet54q00cpp4015io1o59b	cmq9fpbtv0013wmysev1zh32u	2026-05-21	2026-06-23 11:38:56.709	ADMIN_HISTORICAL
cmqqknhfv0042p901zku45pm9	cmqqknhfu0040p901hu29f5sf	cmp580zx2006el401ov0q9nd9	cmq9fpbtv0013wmysev1zh32u	2026-05-21	2026-06-23 11:39:19.435	ADMIN_HISTORICAL
cmqqknyhn0046p9011qjes9dd	cmqqknyhl0044p901ud22upom	cmp9pbn9j00b7p401wd3w8sn0	cmq9fqhqt0015wmys5qnjmndg	2026-05-21	2026-06-23 11:39:41.531	ADMIN_HISTORICAL
cmqqko5oi004ap9012blgi0hh	cmqqko5oh0048p901r5akmo3l	cmp9p95jj00b2p401dqlrtohp	cmq9fqhqt0015wmys5qnjmndg	2026-05-21	2026-06-23 11:39:50.851	ADMIN_HISTORICAL
cmqqkocq4004ip9010tpa7xyt	cmqqkocq2004gp9010oenb3a6	cmp6n6c330042p401572wyy97	cmq9fqhqt0015wmys5qnjmndg	2026-05-21	2026-06-23 11:39:59.98	ADMIN_HISTORICAL
cmqqkpdb1004qp901ifr4zgk6	cmqqkpday004op901cfhpvicu	cmp80zids006np4015qmgm2k4	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	2026-06-23 11:40:47.389	ADMIN_HISTORICAL
cmqqkpjpl004yp901ft5g6rlt	cmqqkpjpj004wp901fowvtfzq	cmph5kmv300f7p401b8x8jouu	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	2026-06-23 11:40:55.689	ADMIN_HISTORICAL
cmqqkpp640056p90134lv1xu9	cmqqkpp630054p901hzjgfgs3	cmp8b0p5m0078p401ko5fipst	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	2026-06-23 11:41:02.765	ADMIN_HISTORICAL
cmqqkpv0p005ep901lnknu4b2	cmqqkpv0n005cp901h14qw07y	cmpfpx1dd00ekp4015zb7hrup	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	2026-06-23 11:41:10.345	ADMIN_HISTORICAL
cmqqks1t5005qp9014vlwb838	cmqqks1t4005op9015cobn6cz	cmp5dd5sd0074l401pv3drst8	cmq9fst630019wmysziben0p0	2026-05-22	2026-06-23 11:42:52.458	ADMIN_HISTORICAL
cmqqks6zs005up901i3v78caa	cmqqks6zr005sp901lvxvd5z6	cmpazudle00byp401oz4zx3e1	cmq9fst630019wmysziben0p0	2026-05-22	2026-06-23 11:42:59.177	ADMIN_HISTORICAL
cmqqksowq005yp9017lncd4k3	cmqqksowp005wp901yuq0d2ao	cmpb26l0900ccp4014tau0gjw	cmq9ftmkh001bwmys4oo2c448	2026-05-22	2026-06-23 11:43:22.395	ADMIN_HISTORICAL
cmqqksx9z0062p901y7oy41h1	cmqqksx9y0060p9013xut4crv	cmpb23ldo00c7p401ut25a8kv	cmq9ftmkh001bwmys4oo2c448	2026-05-22	2026-06-23 11:43:33.24	ADMIN_HISTORICAL
cmqqkt2ly0066p901v2uvwbkq	cmqqkt2lx0064p901mrw8k0tx	cmpux8mfw00i4p401v4t85sji	cmq9ftmkh001bwmys4oo2c448	2026-05-22	2026-06-23 11:43:40.15	ADMIN_HISTORICAL
cmqqktfnm006ep901q6dxk2e5	cmqqktfnl006cp901b24moc8n	cmp9l6t2c00acp4018v82zolp	cmq9ftmkh001bwmys4oo2c448	2026-05-22	2026-06-23 11:43:57.058	ADMIN_HISTORICAL
cmqqktrj5006ip9017odft1gh	cmqqktrj4006gp9015i0mfevq	cmp5e2po6007el401m0wr4bxe	cmq9ftmkh001bwmys4oo2c448	2026-05-22	2026-06-23 11:44:12.45	ADMIN_HISTORICAL
cmqqkug8p006mp901yigz5ieb	cmqqkug8o006kp901bwd081j8	cmp5i45nq000ap401mr5kujgq	cmq9fuddw001dwmysbkd747zi	2026-05-22	2026-06-23 11:44:44.474	ADMIN_HISTORICAL
cmqqkulx4006qp901ien35qzc	cmqqkulx3006op901fu8rzurb	cmp6tmko3004rp4010ev8s38b	cmq9fuddw001dwmysbkd747zi	2026-05-22	2026-06-23 11:44:51.833	ADMIN_HISTORICAL
cmqqkuwbq006yp901ilop5jds	cmqqkuwbp006wp901ct76htxf	cmp5doqck0079l4013c3pypy1	cmq9fuddw001dwmysbkd747zi	2026-05-22	2026-06-23 11:45:05.318	ADMIN_HISTORICAL
cmqqkv30l0072p901j2l8er5h	cmqqkv30k0070p901xv13ugf4	cmp5lkgat000fp4013f720b0o	cmq9fuddw001dwmysbkd747zi	2026-05-22	2026-06-23 11:45:13.99	ADMIN_HISTORICAL
cmqqkva7t0076p901fulceqg7	cmqqkva7r0074p9017chfof1e	cmp6n9pyb0047p401exgskztu	cmq9fuddw001dwmysbkd747zi	2026-05-22	2026-06-23 11:45:23.321	ADMIN_HISTORICAL
cmqqkwen9007ep901okox3r6j	cmqqkwen7007cp901ne8lt423	cmp6mxgtj003np401n6d3md2o	cmq9hn28k001nwmyss37n6104	2026-05-23	2026-06-23 11:46:15.717	ADMIN_HISTORICAL
cmqqkwlry007ip901arnfea44	cmqqkwlrw007gp901a78ypc7a	cmp6n445r003xp4019r22o12e	cmq9hn28k001nwmyss37n6104	2026-05-23	2026-06-23 11:46:24.958	ADMIN_HISTORICAL
cmqqkws5v007qp9018h4006o8	cmqqkws5u007op901nm3qpbxm	cmp9oxt9w00avp401sfiouy8l	cmq9hn28k001nwmyss37n6104	2026-05-23	2026-06-23 11:46:33.236	ADMIN_HISTORICAL
cmqqkx13v007yp9012ufv2xui	cmqqkx13u007wp9012jbdc558	cmpi6ban400fip401ppm9o7wy	cmq9hn28k001nwmyss37n6104	2026-05-23	2026-06-23 11:46:44.828	ADMIN_HISTORICAL
cmqqkx9mv0086p901hyj1w2sr	cmqqkx9mu0084p901ltaq8qts	cmp5d9vn5006zl401fo5j5q04	cmq9hn28k001nwmyss37n6104	2026-05-23	2026-06-23 11:46:55.88	ADMIN_HISTORICAL
cmqqkxuw9008ep901lu05p964	cmqqkxuw8008cp901ti7kw062	cmp9jyb2l009tp4012t706wff	cmq9hnsku001pwmysnt64r7ka	2026-05-24	2026-06-23 11:47:23.434	ADMIN_HISTORICAL
cmqqky39s008ip901snn63dlo	cmqqky39r008gp901qih5lufb	cmp6mh9mn0033p401xa6v43p7	cmq9hnsku001pwmysnt64r7ka	2026-05-24	2026-06-23 11:47:34.288	ADMIN_HISTORICAL
cmqqkyawu008mp90187pf44is	cmqqkyawt008kp901wiz0vr2j	cmpfpx1dd00ekp4015zb7hrup	cmq9hnsku001pwmysnt64r7ka	2026-05-24	2026-06-23 11:47:44.19	ADMIN_HISTORICAL
cmqql01fn008qp9015lcbh4u3	cmqql01fm008op901ihcx79x0	cmpb26l0900ccp4014tau0gjw	cmq9hw6eo001vwmysignfhne8	2026-05-25	2026-06-23 11:49:05.22	ADMIN_HISTORICAL
cmqql06uj008up901cvliiklw	cmqql06uh008sp90195gk56j4	cmpazudle00byp401oz4zx3e1	cmq9hw6eo001vwmysignfhne8	2026-05-25	2026-06-23 11:49:12.235	ADMIN_HISTORICAL
cmqql0dav008yp9016viyxsuq	cmqql0dau008wp901ccqy624m	cmp5d9vn5006zl401fo5j5q04	cmq9hw6eo001vwmysignfhne8	2026-05-25	2026-06-23 11:49:20.6	ADMIN_HISTORICAL
cmqql0qr40092p901s81sl193	cmqql0qr30090p901m38lxv8o	cmp5e2po6007el401m0wr4bxe	cmq9hxe76001xwmys8qvf2i93	2026-05-25	2026-06-23 11:49:38.033	ADMIN_HISTORICAL
cmqql0yry0096p9016f6z1r6o	cmqql0yry0094p901eadhrl6m	cmp8b0p5m0078p401ko5fipst	cmq9hxe76001xwmys8qvf2i93	2026-05-25	2026-06-23 11:49:48.431	ADMIN_HISTORICAL
cmqql15br009ep901yv8iixxj	cmqql15bp009cp901xidxk0q5	cmpfdk63200ebp401atbgmxt9	cmq9hxe76001xwmys8qvf2i93	2026-05-25	2026-06-23 11:49:56.919	ADMIN_HISTORICAL
cmqql1j0x009ip9015qmcdurx	cmqql1j0w009gp901olj2xv5d	cmp5i45nq000ap401mr5kujgq	cmq9hxw15001zwmys6frymznx	2026-05-25	2026-06-23 11:50:14.673	ADMIN_HISTORICAL
cmqql1nxs009mp901km2k4xrz	cmqql1nxr009kp901xqoyk566	cmp6tmko3004rp4010ev8s38b	cmq9hxw15001zwmys6frymznx	2026-05-25	2026-06-23 11:50:21.041	ADMIN_HISTORICAL
cmqql2uc3009qp90170w097ok	cmqql2uc1009op901ewuog0s6	cmp9oxt9w00avp401sfiouy8l	cmq9hyuad0021wmysl0edzaim	2026-05-25	2026-06-23 11:51:15.987	ADMIN_HISTORICAL
cmqql3037009up901n9uw1dqd	cmqql3035009sp901psm7qdhu	cmp6mh9mn0033p401xa6v43p7	cmq9hyuad0021wmysl0edzaim	2026-05-25	2026-06-23 11:51:23.444	ADMIN_HISTORICAL
cmqql3osl00a2p901iq9rjm4o	cmqql3osj00a0p9019g74qwb1	cmp9u530f00bip401o3641wtg	cmq9i2ci70027wmysscy2bu9b	2026-05-25	2026-06-23 11:51:55.461	ADMIN_HISTORICAL
cmqql4tem00a6p90133pzofat	cmqql4tel00a4p901ui5291bp	cmp6ndov4004cp4011gucmmzn	cmq9i4xt5002dwmys5v7vckxt	2026-05-26	2026-06-23 11:52:48.095	ADMIN_HISTORICAL
cmqql52ih00aap901eotm6nje	cmqql52ig00a8p9014ivffazh	cmp5r6eqa001kp401z95m2mtr	cmq9i4xt5002dwmys5v7vckxt	2026-05-26	2026-06-23 11:52:59.897	ADMIN_HISTORICAL
cmqql5p6z00aep901nkw9gxtd	cmqql5p6y00acp90164hymte7	cmpmhc40500h9p40180sb0edr	cmq9i5qul002fwmysbtfm6z6i	2026-05-26	2026-06-23 11:53:29.292	ADMIN_HISTORICAL
cmqqngpth00akp9019vwc7yu8	cmqqngpte00aip901849ccpew	cmpi6ban400fip401ppm9o7wy	cmq9i6cxz002hwmys1mk0mjj2	2026-05-26	2026-06-23 12:58:02.549	ADMIN_HISTORICAL
cmqqnh6t700aop9014ml5u6m2	cmqqnh6t600amp901nphernyl	cmph5kmv300f7p401b8x8jouu	cmq9i6cxz002hwmys1mk0mjj2	2026-05-26	2026-06-23 12:58:24.571	ADMIN_HISTORICAL
cmqqoepd600ayp9019m4rcw8v	cmqqoepd400awp901rp12wnwj	cmpdskdbb00e0p401bi55y2g7	cmq9ia9md002pwmysdj3fumo1	2026-05-29	2026-06-23 13:24:28.266	ADMIN_HISTORICAL
cmqqof5ih00b2p901413a5nyo	cmqqof5ig00b0p90155z4xkwq	cmpb26l0900ccp4014tau0gjw	cmq9iaxpq002rwmys4kf15rcc	2026-05-29	2026-06-23 13:24:49.193	ADMIN_HISTORICAL
cmqqofdho00b6p901kkf514ys	cmqqofdhn00b4p90146v4q3kf	cmp9l6t2c00acp4018v82zolp	cmq9iaxpq002rwmys4kf15rcc	2026-05-29	2026-06-23 13:24:59.532	ADMIN_HISTORICAL
cmqqofju500bap901gyy0uhno	cmqqofju400b8p901o3gajfdv	cmp5d9vn5006zl401fo5j5q04	cmq9iaxpq002rwmys4kf15rcc	2026-05-29	2026-06-23 13:25:07.757	ADMIN_HISTORICAL
cmqqog1ic00bep901j3tpo6kr	cmqqog1ib00bcp901m81v6s29	cmp5i45nq000ap401mr5kujgq	cmq9ibl4o002twmyst523zaud	2026-05-29	2026-06-23 13:25:30.66	ADMIN_HISTORICAL
cmqqog67000bip901bohrmjbd	cmqqog66z00bgp901r219biyi	cmp6tmko3004rp4010ev8s38b	cmq9ibl4o002twmyst523zaud	2026-05-29	2026-06-23 13:25:36.733	ADMIN_HISTORICAL
cmqqogbzu00bmp901rm4mmuhd	cmqqogbzt00bkp901454q8uk2	cmp5e2po6007el401m0wr4bxe	cmq9ibl4o002twmyst523zaud	2026-05-29	2026-06-23 13:25:44.251	ADMIN_HISTORICAL
cmqqoh0ps00bup901n9ys4jte	cmqqoh0pr00bsp9017voblubf	cmqp3lgcp00f1od0111da04jy	cmq9ibl4o002twmyst523zaud	2026-05-29	2026-06-23 13:26:16.289	ADMIN_HISTORICAL
cmqqohats00byp901rxwk8ill	cmqqohatr00bwp901ibp5r94o	cmp6mxgtj003np401n6d3md2o	cmq9ibl4o002twmyst523zaud	2026-05-29	2026-06-23 13:26:29.392	ADMIN_HISTORICAL
cmqqoifkg00c2p901enhj0kpz	cmqqoifkf00c0p90109uj013p	cmpi6ban400fip401ppm9o7wy	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	2026-06-23 13:27:22.193	ADMIN_HISTORICAL
cmqqoipl800c6p901k6atxitp	cmqqoipl600c4p901pk241w7u	cmp5r29es001fp401vky62ly4	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	2026-06-23 13:27:35.18	ADMIN_HISTORICAL
cmqqoizmm00cep901rlppwuhd	cmqqoizml00ccp901tg4ghj3m	cmp5qutpd0015p401e0b83fu9	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	2026-06-23 13:27:48.19	ADMIN_HISTORICAL
cmqqoj51f00cmp901icuyq01w	cmqqoj51d00ckp901lnnf9tor	cmp5qzr8e001ap401fa4uuzw4	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	2026-06-23 13:27:55.203	ADMIN_HISTORICAL
cmqqojcwh00cqp901ok0zq2rn	cmqqojcwg00cop901q5fjbodz	cmp580zx2006el401ov0q9nd9	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	2026-06-23 13:28:05.393	ADMIN_HISTORICAL
cmqqok06y00cup901yfja5vhf	cmqqok06x00csp901h21gm1zk	cmp6mxgtj003np401n6d3md2o	cmq9j79fe0035wmysqce965s4	2026-05-30	2026-06-23 13:28:35.578	ADMIN_HISTORICAL
cmqqok86000cyp901hsa5fehn	cmqqok85z00cwp901osznmcql	cmpdskdbb00e0p401bi55y2g7	cmq9j79fe0035wmysqce965s4	2026-05-30	2026-06-23 13:28:45.912	ADMIN_HISTORICAL
cmqqol0oc00d2p901cbnzkgm3	cmqqol0o900d0p901uqa85ws2	cmp9jyb2l009tp4012t706wff	cmq9j9gnv003bwmyscpctgab4	2026-05-31	2026-06-23 13:29:22.86	ADMIN_HISTORICAL
cmqqol6g800d6p901hvr7n7xn	cmqqol6g600d4p901h19ff8oz	cmpazudle00byp401oz4zx3e1	cmq9j9gnv003bwmyscpctgab4	2026-05-31	2026-06-23 13:29:30.344	ADMIN_HISTORICAL
cmqqoldzc00dep90110cxihyd	cmqqoldzb00dcp901mopw7hb6	cmp6mujhf003ip4019yxl5iri	cmq9j9gnv003bwmyscpctgab4	2026-05-31	2026-06-23 13:29:40.105	ADMIN_HISTORICAL
cmqqop1ob00dip901e4ip7onc	cmqqop1o900dgp901g9wq3p1g	cmp5e2po6007el401m0wr4bxe	cmqmmrdfi004cod01wk7dyyjk	2026-06-01	2026-06-23 13:32:30.779	ADMIN_HISTORICAL
cmqqop7jx00dmp901ozt40wtc	cmqqop7jw00dkp901mya6xj0i	cmpb23ldo00c7p401ut25a8kv	cmqmmrdfi004cod01wk7dyyjk	2026-06-01	2026-06-23 13:32:38.397	ADMIN_HISTORICAL
cmqqp4wlt00dqp901n58yv7kb	cmqqp4wlr00dop901o2eetl6t	cmpfdk63200ebp401atbgmxt9	cmqmmrdfi004cod01wk7dyyjk	2026-06-01	2026-06-23 13:44:50.705	ADMIN_HISTORICAL
cmqqq6mb300dwp901wj39xkxe	cmqqq6mb000dup9013oujxi0u	cmp6n9pyb0047p401exgskztu	cmqmmuas1004iod016m86gd1i	2026-06-01	2026-06-23 14:14:10.287	ADMIN_HISTORICAL
cmqqq6rmb00e4p901awxijfc8	cmqqq6rma00e2p901oi3ikrxb	cmpuxpn4l00iop40156zk6rje	cmqmmuas1004iod016m86gd1i	2026-06-01	2026-06-23 14:14:17.172	ADMIN_HISTORICAL
cmqqq6xip00e8p901hi3wrrxd	cmqqq6xio00e6p901zay6sj1w	cmp6n445r003xp4019r22o12e	cmqmmuas1004iod016m86gd1i	2026-06-01	2026-06-23 14:14:24.817	ADMIN_HISTORICAL
cmqqq72yz00egp901yazjbykc	cmqqq72yy00eep901i1nih6cl	cmps12dpz00hvp401tesxyqev	cmqmmuas1004iod016m86gd1i	2026-06-01	2026-06-23 14:14:31.883	ADMIN_HISTORICAL
cmqqq7g4u00eop901wfjsumoo	cmqqq7g4s00emp901sacb5cxm	cmpvehn3c00j7p401p14lsb1d	cmqmmuas1004iod016m86gd1i	2026-06-01	2026-06-23 14:14:48.942	ADMIN_HISTORICAL
cmqqq863o00esp901t5tilukq	cmqqq863n00eqp901zegjsu2e	cmp5qutpd0015p401e0b83fu9	cmqmmv5en004kod01jyor4o8b	2026-06-01	2026-06-23 14:15:22.597	ADMIN_HISTORICAL
cmqqq8a6f00ewp901ykki8yh7	cmqqq8a6e00eup901qkrtmfnj	cmp5qzr8e001ap401fa4uuzw4	cmqmmv5en004kod01jyor4o8b	2026-06-01	2026-06-23 14:15:27.88	ADMIN_HISTORICAL
cmqqq9g4g00f4p901pw9qz1go	cmqqq9g4f00f2p901xfcttecc	cmpuxlbuw00ijp4016pmesm29	cmqmmwbi5004mod01dit09gof	2026-06-01	2026-06-23 14:16:22.24	ADMIN_HISTORICAL
cmqqqa52o00f8p901ts57fk54	cmqqqa52n00f6p901ajwqpeki	cmpbet54q00cpp4015io1o59b	cmqmmwbi5004mod01dit09gof	2026-06-01	2026-06-23 14:16:54.577	ADMIN_HISTORICAL
cmqqqab6w00fcp9018mbw57nx	cmqqqab6v00fap901hnzmtq2u	cmp5dd5sd0074l401pv3drst8	cmqmmwbi5004mod01dit09gof	2026-06-01	2026-06-23 14:17:02.505	ADMIN_HISTORICAL
cmqqqbdi800fgp901yqm0mrpt	cmqqqbdi500fep901gxv0i0rz	cmp5d9vn5006zl401fo5j5q04	cmqmmyw79004qod01za4ph9hp	2026-06-02	2026-06-23 14:17:52.16	ADMIN_HISTORICAL
cmqqqbkh200fkp90140wqh42m	cmqqqbkh100fip901j1i3p0fn	cmp5doqck0079l4013c3pypy1	cmqmmyw79004qod01za4ph9hp	2026-06-02	2026-06-23 14:18:01.191	ADMIN_HISTORICAL
cmqqqc60d00fop901n71tuija	cmqqqc60c00fmp9016rzfu2b3	cmp5i45nq000ap401mr5kujgq	cmqmmzzd2004sod01fkr7uorn	2026-06-02	2026-06-23 14:18:29.102	ADMIN_HISTORICAL
cmqqqcbrw00fsp901ifrnzxea	cmqqqcbru00fqp90191ujtbq1	cmp6n9pyb0047p401exgskztu	cmqmmzzd2004sod01fkr7uorn	2026-06-02	2026-06-23 14:18:36.572	ADMIN_HISTORICAL
cmqqqchxm00fwp9011pwd5cz2	cmqqqchxk00fup901tygqz9qn	cmpb26l0900ccp4014tau0gjw	cmqmmzzd2004sod01fkr7uorn	2026-06-02	2026-06-23 14:18:44.554	ADMIN_HISTORICAL
cmqqqcnu800g0p9013efpchsu	cmqqqcnu700fyp90164enld6m	cmp5lkgat000fp4013f720b0o	cmqmmzzd2004sod01fkr7uorn	2026-06-02	2026-06-23 14:18:52.209	ADMIN_HISTORICAL
cmqqqdm9t00g4p901od7avlsx	cmqqqdm9r00g2p901jpyin2l8	cmpi6ban400fip401ppm9o7wy	cmqmn2o9p004wod01inqdydva	2026-06-02	2026-06-23 14:19:36.833	ADMIN_HISTORICAL
cmqqqeefg00gcp90151bytw82	cmqqqeefd00gap901c2304d8i	cmpxt9h9d00jnp401acy1ppf1	cmqmn3pa5004yod018829iesj	2026-06-02	2026-06-23 14:20:13.324	ADMIN_HISTORICAL
cmqqqeit100gkp901r4db3jq2	cmqqqeit000gip901chv2joze	cmpuxgfvo00iep401kuin241v	cmqmn3pa5004yod018829iesj	2026-06-02	2026-06-23 14:20:18.998	ADMIN_HISTORICAL
cmqqqeps800gsp9016jna92qk	cmqqqeps700gqp9015e6z2wi6	cmpxtbvan00jsp401dbkqvo9n	cmqmn3pa5004yod018829iesj	2026-06-02	2026-06-23 14:20:28.04	ADMIN_HISTORICAL
cmqqqfaru00h0p901oh9q4inj	cmqqqfars00gyp901xca1f2qf	cmpxtdnho00jxp401mtude4xv	cmqmn5o330050od01720i3gaj	2026-06-02	2026-06-23 14:20:55.242	ADMIN_HISTORICAL
cmqqqfna100h8p901k7xq328t	cmqqqfn9z00h6p901zz23fxet	cmpxtfc9z00k2p401mfev8i51	cmqmn5o330050od01720i3gaj	2026-06-02	2026-06-23 14:21:11.449	ADMIN_HISTORICAL
cmqqqgci800hgp901kjg1c5nj	cmqqqgci600hep901x3rzameq	cmpxths4t00k7p401ms2nx4f0	cmqmn5o330050od01720i3gaj	2026-06-02	2026-06-23 14:21:44.144	ADMIN_HISTORICAL
cmqqqgqmy00hop901cvly0qon	cmqqqgqmx00hmp9018dumv97k	cmp6vndph004yp401vluusox7	cmqmn5o330050od01720i3gaj	2026-06-02	2026-06-23 14:22:02.459	ADMIN_HISTORICAL
cmqqqgwsb00hwp901l61r40z6	cmqqqgwsb00hup901kqnrf0bb	cmp6maci6002tp40119cnxlu3	cmqmn5o330050od01720i3gaj	2026-06-02	2026-06-23 14:22:10.428	ADMIN_HISTORICAL
cmqqqhsrw00i0p901m1d6fouh	cmqqqhsrt00hyp9013a38t6zx	cmpazudle00byp401oz4zx3e1	cmqmn7q3a0054od011mu7pqvg	2026-06-03	2026-06-23 14:22:51.884	ADMIN_HISTORICAL
cmqqqhxmo00i4p901k4w6owrt	cmqqqhxmn00i2p901mshbid65	cmp5dd5sd0074l401pv3drst8	cmqmn7q3a0054od011mu7pqvg	2026-06-03	2026-06-23 14:22:58.177	ADMIN_HISTORICAL
cmqqqji8v00i8p901ikkdstjm	cmqqqji8t00i6p901utqh8wwf	cmp9jyb2l009tp4012t706wff	cmqmn8nci0056od01iw2kvnrk	2026-06-03	2026-06-23 14:24:11.551	ADMIN_HISTORICAL
cmqqqjov600icp901bwxo386w	cmqqqjov400iap9018x0fo095	cmp5lkgat000fp4013f720b0o	cmqmn8nci0056od01iw2kvnrk	2026-06-03	2026-06-23 14:24:20.13	ADMIN_HISTORICAL
cmqqqjva200igp901qcm2spt9	cmqqqjva100iep901uxhy5tka	cmp5doqck0079l4013c3pypy1	cmqmn8nci0056od01iw2kvnrk	2026-06-03	2026-06-23 14:24:28.443	ADMIN_HISTORICAL
cmqqqk43600iop9014zm5pw5b	cmqqqk43400imp901b3w7zu6h	cmpv004tl00iyp4017n7rkxr5	cmqmn8nci0056od01iw2kvnrk	2026-06-03	2026-06-23 14:24:39.858	ADMIN_HISTORICAL
cmqqqkax900isp901a5hce18t	cmqqqkax800iqp90157l5n44h	cmpfdk63200ebp401atbgmxt9	cmqmn8nci0056od01iw2kvnrk	2026-06-03	2026-06-23 14:24:48.718	ADMIN_HISTORICAL
cmqqql3pa00j0p90101zn2c8b	cmqqql3p900iyp901ranezqg5	cmqp1r6nz00eeod015izfwb4m	cmqmn9bs60058od01t8j8c4fd	2026-06-03	2026-06-23 14:25:26.015	ADMIN_HISTORICAL
cmqqqm4ws00j8p901uez32yid	cmqqqm4wr00j6p90153x8xh4c	cmp9muoo600alp401b1jj91hv	cmqmncddo005eod01qngiqdlr	2026-06-03	2026-06-23 14:26:14.236	ADMIN_HISTORICAL
cmqqqmb8x00jgp901347c7eeb	cmqqqmb8x00jep901w3bh85j2	cmp9n16yg00aqp401yfgd8zit	cmqmncddo005eod01qngiqdlr	2026-06-03	2026-06-23 14:26:22.45	ADMIN_HISTORICAL
cmqqqmidw00jkp901ttf6df7i	cmqqqmidv00jip901bq862gbl	cmp9u530f00bip401o3641wtg	cmqmncddo005eod01qngiqdlr	2026-06-03	2026-06-23 14:26:31.701	ADMIN_HISTORICAL
cmqqqmq6q00jop90198noij5e	cmqqqmq6p00jmp901pb81m4gc	cmp6tmko3004rp4010ev8s38b	cmqmncddo005eod01qngiqdlr	2026-06-03	2026-06-23 14:26:41.811	ADMIN_HISTORICAL
cmqqqn3xo00jsp901fcn2dnol	cmqqqn3xm00jqp901rt1i2qcm	cmp6n445r003xp4019r22o12e	cmqmnd6y7005god01sutpmk1r	2026-06-03	2026-06-23 14:26:59.628	ADMIN_HISTORICAL
cmqqqnbro00jwp9011qp70u94	cmqqqnbrn00jup9016ae0k7j7	cmpxtdnho00jxp401mtude4xv	cmqmnd6y7005god01sutpmk1r	2026-06-03	2026-06-23 14:27:09.78	ADMIN_HISTORICAL
cmqqqnita00k0p901kss8e8sg	cmqqqnit900jyp901gzv4pwgg	cmp6mxgtj003np401n6d3md2o	cmqmnd6y7005god01sutpmk1r	2026-06-03	2026-06-23 14:27:18.911	ADMIN_HISTORICAL
cmqqqnppu00k8p901enmg999a	cmqqqnppt00k6p901621slxy1	cmpqvd4pp00hkp401fok0cwt8	cmqmnd6y7005god01sutpmk1r	2026-06-03	2026-06-23 14:27:27.858	ADMIN_HISTORICAL
cmqqqp73i00kcp901kn4mgmlg	cmqqqp73g00kap901i0w1mg53	cmp5r29es001fp401vky62ly4	cmqmni52q005mod01aovlvd87	2026-06-04	2026-06-23 14:28:37.039	ADMIN_HISTORICAL
cmqqqpe4n00kgp9016jij91b1	cmqqqpe4m00kep901eg9e9y7s	cmph5kmv300f7p401b8x8jouu	cmqmni52q005mod01aovlvd87	2026-06-04	2026-06-23 14:28:46.151	ADMIN_HISTORICAL
cmqqqpr4z00kop901nb5bbqga	cmqqqpr4y00kmp901nkwhrx60	cmpzp6len00kwp4012mdrq8ka	cmqmni52q005mod01aovlvd87	2026-06-04	2026-06-23 14:29:03.012	ADMIN_HISTORICAL
cmqqqqahm00ksp901r8riwsfu	cmqqqqahl00kqp901tgyd9fee	cmpmhc40500h9p40180sb0edr	cmqmno8b1005uod016mioa44o	2026-06-04	2026-06-23 14:29:28.091	ADMIN_HISTORICAL
cmqqqqgd000kwp9010oikl034	cmqqqqgcz00kup901r00b3vcv	cmp5dd5sd0074l401pv3drst8	cmqmno8b1005uod016mioa44o	2026-06-04	2026-06-23 14:29:35.701	ADMIN_HISTORICAL
cmqqqqlxt00l0p901ek8gd1u9	cmqqqqlxs00kyp901v2rqj66i	cmp580zx2006el401ov0q9nd9	cmqmno8b1005uod016mioa44o	2026-06-04	2026-06-23 14:29:42.929	ADMIN_HISTORICAL
cmqqqr3r500l4p9013w815v0w	cmqqqr3r400l2p901t4pr27xt	cmpbet54q00cpp4015io1o59b	cmqmnmijf005qod0197z3mscd	2026-06-04	2026-06-23 14:30:06.017	ADMIN_HISTORICAL
cmqqqr8ds00l8p9014ll8hsrt	cmqqqr8dr00l6p901nyy7elf1	cmpazudle00byp401oz4zx3e1	cmqmnmijf005qod0197z3mscd	2026-06-04	2026-06-23 14:30:12.017	ADMIN_HISTORICAL
cmqqqrdeb00lcp901q5feo0hp	cmqqqrdea00lap901ouvpdk21	cmp6n0r9g003sp401svwhqzjy	cmqmnmijf005qod0197z3mscd	2026-06-04	2026-06-23 14:30:18.516	ADMIN_HISTORICAL
cmqqqribl00lgp901ou4udgja	cmqqqribk00lep901qrp01cvy	cmpb26l0900ccp4014tau0gjw	cmqmnmijf005qod0197z3mscd	2026-06-04	2026-06-23 14:30:24.897	ADMIN_HISTORICAL
cmqqqrzyu00lop901ozimacdf	cmqqqrzyt00lmp90149egvh5d	cmpya6nur00kgp401et6xel9m	cmqmnmijf005qod0197z3mscd	2026-06-04	2026-06-23 14:30:47.767	ADMIN_HISTORICAL
cmqqqs4uw00lwp901y6tq2tvg	cmqqqs4uv00lup901gswmum33	cmpuxyh5x00itp401pqas19s7	cmqmnmijf005qod0197z3mscd	2026-06-04	2026-06-23 14:30:54.105	ADMIN_HISTORICAL
cmqqqsfny00m0p90188pb7ic2	cmqqqsfnw00lyp901v0zym6i2	cmp80zids006np4015qmgm2k4	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	2026-06-23 14:31:08.11	ADMIN_HISTORICAL
cmqqqskx200m4p901cnxf9eoe	cmqqqskx100m2p901y3izuu0r	cmp9p95jj00b2p401dqlrtohp	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	2026-06-23 14:31:14.919	ADMIN_HISTORICAL
cmqqqsq6800m8p901l080fpph	cmqqqsq6700m6p901ltb9c5ga	cmp9pbn9j00b7p401wd3w8sn0	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	2026-06-23 14:31:21.729	ADMIN_HISTORICAL
cmqqqswbu00mgp901po5vm4d0	cmqqqswbt00mep901p7koqcdl	cmpwo5qcf00jgp401y23i6i2r	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	2026-06-23 14:31:29.707	ADMIN_HISTORICAL
cmqqqu1dx00mkp90105nmxgbc	cmqqqu1dw00mip901tcs2zmd2	cmp6mujhf003ip4019yxl5iri	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	2026-06-23 14:32:22.918	ADMIN_HISTORICAL
cmqqqua5a00mop901jstmouri	cmqqqua5900mmp901cfwl5yn7	cmpuxlbuw00ijp4016pmesm29	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	2026-06-23 14:32:34.27	ADMIN_HISTORICAL
cmqqqv4na00msp901wzgcyu0n	cmqqqv4n900mqp901yx2ci4m9	cmp5i45nq000ap401mr5kujgq	cmqmnf4hi005kod01psi4hj70	2026-06-04	2026-06-23 14:33:13.798	ADMIN_HISTORICAL
cmqqqv8rv00mwp901jl4sclb0	cmqqqv8ru00mup901c050w7dw	cmp6n9pyb0047p401exgskztu	cmqmnf4hi005kod01psi4hj70	2026-06-04	2026-06-23 14:33:19.147	ADMIN_HISTORICAL
cmqqqviji00n4p901bkyr404l	cmqqqvijg00n2p901ayllci2d	cmpuxbc7900i9p401d4rkyuom	cmqmnf4hi005kod01psi4hj70	2026-06-04	2026-06-23 14:33:31.806	ADMIN_HISTORICAL
cmqqqvz4m00n8p901t58o0so1	cmqqqvz4l00n6p901gyu6wquv	cmp6n445r003xp4019r22o12e	cmqmnwpek005yod01zw9o3vbd	2026-06-05	2026-06-23 14:33:53.302	ADMIN_HISTORICAL
cmqqqw5cr00ncp901bw21wdf6	cmqqqw5cq00nap901o3ga2mq6	cmp5e2po6007el401m0wr4bxe	cmqmnwpek005yod01zw9o3vbd	2026-06-05	2026-06-23 14:34:01.372	ADMIN_HISTORICAL
cmqqqwhis00ngp901kalxedcu	cmqqqwhiq00nep901ffgkm8ey	cmpb23ldo00c7p401ut25a8kv	cmqmnwpek005yod01zw9o3vbd	2026-06-05	2026-06-23 14:34:17.14	ADMIN_HISTORICAL
cmqqqwphn00nkp901qnc7lqzd	cmqqqwphm00nip9010xvxcgxc	cmp9l6t2c00acp4018v82zolp	cmqmnwpek005yod01zw9o3vbd	2026-06-05	2026-06-23 14:34:27.467	ADMIN_HISTORICAL
cmqqqxp3a00nop901893c0siy	cmqqqxp3900nmp901kmmaypg6	cmp6mxgtj003np401n6d3md2o	cmqmo52dh006cod01oba3r6ut	2026-06-06	2026-06-23 14:35:13.607	ADMIN_HISTORICAL
cmqqqxxoq00nwp901nguthhsj	cmqqqxxop00nup901xbww8sll	cmqp2at3e00elod01ib880iqc	cmqmo52dh006cod01oba3r6ut	2026-06-06	2026-06-23 14:35:24.747	ADMIN_HISTORICAL
cmqqqy30v00o4p90111pqz1ck	cmqqqy30t00o2p901vagk5h41	cmqp3jmsv00euod010vtuk1qt	cmqmo52dh006cod01oba3r6ut	2026-06-06	2026-06-23 14:35:31.664	ADMIN_HISTORICAL
cmqqqy8h400ocp90147xws7w1	cmqqqy8h200oap901setnuesj	cmp6mqu0z003dp401zgzrluwq	cmqmo52dh006cod01oba3r6ut	2026-06-06	2026-06-23 14:35:38.728	ADMIN_HISTORICAL
cmqqqyg3j00okp90140v7ztxd	cmqqqyg3i00oip9014pcgpls7	cmp6mkxvt0038p401gsyxjp1p	cmqmo52dh006cod01oba3r6ut	2026-06-06	2026-06-23 14:35:48.607	ADMIN_HISTORICAL
cmqqr016x00oop901z5m1zmle	cmqqr016v00omp90118e3c9hf	cmpuxbc7900i9p401d4rkyuom	cmqmoac2k006kod0192t4qygc	2026-06-07	2026-06-23 14:37:02.601	ADMIN_HISTORICAL
cmqqr08x500osp9014xd7czfl	cmqqr08x400oqp901ytj50pjj	cmpazudle00byp401oz4zx3e1	cmqmoac2k006kod0192t4qygc	2026-06-07	2026-06-23 14:37:12.618	ADMIN_HISTORICAL
cmqqr0ma100owp901gx78id49	cmqqr0ma000oup901lmw8u1er	cmp6mujhf003ip4019yxl5iri	cmqmoac2k006kod0192t4qygc	2026-06-07	2026-06-23 14:37:29.929	ADMIN_HISTORICAL
cmqqr0qsh00p0p901vmzd3t46	cmqqr0qsg00oyp901kd2plges	cmpxtbvan00jsp401dbkqvo9n	cmqmoac2k006kod0192t4qygc	2026-06-07	2026-06-23 14:37:35.778	ADMIN_HISTORICAL
cmqqr1dlx00p8p901j9nxv31q	cmqqr1dlw00p6p9013dh19o6c	cmpzh61qy00kpp401u52chqfx	cmqmoac2k006kod0192t4qygc	2026-06-07	2026-06-23 14:38:05.35	ADMIN_HISTORICAL
cmqqr1t8u00pcp901n2cq5pjq	cmqqr1t8t00pap90156y5u1y6	cmpazudle00byp401oz4zx3e1	cmqmobepy006mod019kuoczcx	2026-06-07	2026-06-23 14:38:25.615	ADMIN_HISTORICAL
cmqqr1yxe00pgp901py3b4re2	cmqqr1yxc00pep9015jjtrdzr	cmp5d9vn5006zl401fo5j5q04	cmqmobepy006mod019kuoczcx	2026-06-07	2026-06-23 14:38:32.979	ADMIN_HISTORICAL
cmqqr2esw00pop901lt7jnfa3	cmqqr2esv00pmp901ivj1kr80	cmq254vcp00lap401whu604y8	cmqmobepy006mod019kuoczcx	2026-06-07	2026-06-23 14:38:53.553	ADMIN_HISTORICAL
cmqqr3z8n00psp901f8goqnjh	cmqqr3z8m00pqp901f8qs6f34	cmps12dpz00hvp401tesxyqev	cmqmnzo9x0064od011mll6zta	2026-06-05	2026-06-23 14:40:06.696	ADMIN_HISTORICAL
cmqqr497f00q0p901p3xrl2t5	cmqqr497d00pyp901q4ujapeo	cmqqihcm6000np901ub12rzon	cmqmnzo9x0064od011mll6zta	2026-06-05	2026-06-23 14:40:19.611	ADMIN_HISTORICAL
cmqqr4kns00q4p9013hai9eet	cmqqr4knr00q2p901xe3one0a	cmpi6ban400fip401ppm9o7wy	cmqmnzo9x0064od011mll6zta	2026-06-05	2026-06-23 14:40:34.457	ADMIN_HISTORICAL
cmqqr512400q8p901vo7qyhi2	cmqqr512300q6p901rqlnp7mp	cmpbet54q00cpp4015io1o59b	cmqmo0fc30066od01mjr23wg7	2026-06-05	2026-06-23 14:40:55.709	ADMIN_HISTORICAL
cmqqr56kr00qgp901su6q4ea3	cmqqr56kq00qep901pnx1j7ok	cmq251ruu00l5p4010gsntqmg	cmqmo0fc30066od01mjr23wg7	2026-06-05	2026-06-23 14:41:02.86	ADMIN_HISTORICAL
cmqqr64ov00qkp901z40vqwv8	cmqqr64ou00qip901xmx1639u	cmp80zids006np4015qmgm2k4	cmqmo1m700068od011oqh3hck	2026-06-05	2026-06-23 14:41:47.071	ADMIN_HISTORICAL
cmqqr69jk00qop901u5obow30	cmqqr69ji00qmp9010lda4cdb	cmpuxgfvo00iep401kuin241v	cmqmo1m700068od011oqh3hck	2026-06-05	2026-06-23 14:41:53.36	ADMIN_HISTORICAL
cmqqr6etp00qsp901ne1weq5d	cmqqr6eto00qqp9018hg7bqu5	cmpxtdnho00jxp401mtude4xv	cmqmo1m700068od011oqh3hck	2026-06-05	2026-06-23 14:42:00.206	ADMIN_HISTORICAL
cmqqr6lfa00qwp90189x488yl	cmqqr6lf800qup9013qp37jza	cmpxtfc9z00k2p401mfev8i51	cmqmo1m700068od011oqh3hck	2026-06-05	2026-06-23 14:42:08.758	ADMIN_HISTORICAL
cmqqr6xmi00r0p901gc19paxa	cmqqr6xmh00qyp901onj7b8a6	cmpxths4t00k7p401ms2nx4f0	cmqmo1m700068od011oqh3hck	2026-06-05	2026-06-23 14:42:24.57	ADMIN_HISTORICAL
cmqqr78tv00r4p9015snmphw9	cmqqr78tu00r2p901pfplglos	cmpuxlbuw00ijp4016pmesm29	cmqmo1m700068od011oqh3hck	2026-06-05	2026-06-23 14:42:39.092	ADMIN_HISTORICAL
cmqqrevki00r8p901n3kejl5q	cmqqrevkg00r6p901qew1ldbm	cmpb23ldo00c7p401ut25a8kv	cmqmondm4006sod0109qo59ei	2026-06-08	2026-06-23 14:48:35.155	ADMIN_HISTORICAL
cmqqrh8n200rcp901f0sa3zh9	cmqqrh8n000rap901pi9kt7og	cmpxt9h9d00jnp401acy1ppf1	cmqmosf9h0070od01qwkb5wc7	2026-06-08	2026-06-23 14:50:25.407	ADMIN_HISTORICAL
cmqqrhf8y00rgp901yl5ihv1k	cmqqrhf8w00rep90126uudx0l	cmq251ruu00l5p4010gsntqmg	cmqmosf9h0070od01qwkb5wc7	2026-06-08	2026-06-23 14:50:33.97	ADMIN_HISTORICAL
cmqqrhk3u00rop901rriggn0f	cmqqrhk3t00rmp901bu9p3ugm	cmqqifegn000gp901x4b3a61j	cmqmosf9h0070od01qwkb5wc7	2026-06-08	2026-06-23 14:50:40.267	ADMIN_HISTORICAL
cmqqrhqy200rsp901s90wwybr	cmqqrhqy100rqp901zalex7e0	cmpb26l0900ccp4014tau0gjw	cmqmosf9h0070od01qwkb5wc7	2026-06-08	2026-06-23 14:50:49.131	ADMIN_HISTORICAL
cmqqrhwx300rwp901laltdgpi	cmqqrhwx100rup901lwfs90du	cmp6mh9mn0033p401xa6v43p7	cmqmosf9h0070od01qwkb5wc7	2026-06-08	2026-06-23 14:50:56.871	ADMIN_HISTORICAL
cmqqrivd500s0p9012cb4ps9v	cmqqrivd300ryp9017h8z6zwo	cmpzh61qy00kpp401u52chqfx	cmqmoudyk0074od01t3pj66aj	2026-06-08	2026-06-23 14:51:41.513	ADMIN_HISTORICAL
cmqqrj28u00s4p9013ntqzhq8	cmqqrj28t00s2p901g5ant3a2	cmpuxlbuw00ijp4016pmesm29	cmqmoudyk0074od01t3pj66aj	2026-06-08	2026-06-23 14:51:50.43	ADMIN_HISTORICAL
cmqqrk32n00s8p901k9gyayl3	cmqqrk32m00s6p901lat532wd	cmpzp6len00kwp4012mdrq8ka	cmqmoudyk0074od01t3pj66aj	2026-06-08	2026-06-23 14:52:38.159	ADMIN_HISTORICAL
cmqqrkbq300scp9016msgkx25	cmqqrkbq100sap901q6pwe007	cmp5dd5sd0074l401pv3drst8	cmqmoudyk0074od01t3pj66aj	2026-06-08	2026-06-23 14:52:49.371	ADMIN_HISTORICAL
cmqqsky8a00sgp9011vgcx0yn	cmqqsky8800sep901xmgunzwz	cmp5doqck0079l4013c3pypy1	cmqmoxols0078od01nvys4y9d	2026-06-09	2026-06-23 15:21:18.155	ADMIN_HISTORICAL
cmqqsl94600skp90127gqpmmp	cmqqsl94400sip901cr0qt5yb	cmp5i45nq000ap401mr5kujgq	cmqmp1x8c007aod01vcuo3eko	2026-06-09	2026-06-23 15:21:32.262	ADMIN_HISTORICAL
cmqqslof100ssp901bx3xpwbk	cmqqslof000sqp901m8r49w0x	cmp5d9vn5006zl401fo5j5q04	cmqmp1x8c007aod01vcuo3eko	2026-06-09	2026-06-23 15:21:52.093	ADMIN_HISTORICAL
cmqqslx2i00t0p901mwhh2xp0	cmqqslx2h00syp901btdvhkw9	cmqp3ozqi0004s001fm3nxvgn	cmqmp1x8c007aod01vcuo3eko	2026-06-09	2026-06-23 15:22:03.306	ADMIN_HISTORICAL
cmqqsny8400t4p9016xhpv97z	cmqqsny8300t2p901arenat3v	cmph5kmv300f7p401b8x8jouu	cmqmp3is2007eod018u8jm7ww	2026-06-09	2026-06-23 15:23:38.117	ADMIN_HISTORICAL
cmqqsobm200t8p901p9bip36c	cmqqsobm100t6p901fs2yxdfj	cmpazudle00byp401oz4zx3e1	cmqmp47tr007god01eupe7omx	2026-06-09	2026-06-23 15:23:55.466	ADMIN_HISTORICAL
cmqqsoj6y00tcp901tpeyzz1m	cmqqsoj6x00tap901kw7xwxso	cmpi6ban400fip401ppm9o7wy	cmqmp47tr007god01eupe7omx	2026-06-09	2026-06-23 15:24:05.291	ADMIN_HISTORICAL
cmqqsoztc00tgp901xtguwl6n	cmqqsoztb00tep901jkh9lgyf	cmps12dpz00hvp401tesxyqev	cmqmp4wt4007iod010albebt6	2026-06-09	2026-06-23 15:24:26.832	ADMIN_HISTORICAL
cmqqsp5xf00tkp901el5p9k8f	cmqqsp5xe00tip901cbzsm4e1	cmp6n445r003xp4019r22o12e	cmqmp4wt4007iod010albebt6	2026-06-09	2026-06-23 15:24:34.756	ADMIN_HISTORICAL
cmqqspo8w00top901c47np06h	cmqqspo8u00tmp901ktw2o43n	cmp580zx2006el401ov0q9nd9	cmqmp5pjr007kod012ybjey7m	2026-06-09	2026-06-23 15:24:58.496	ADMIN_HISTORICAL
cmqqspxro00tsp90131tjczux	cmqqspxrn00tqp901u3x8ih6n	cmpxtfc9z00k2p401mfev8i51	cmqmp6na5007mod01u6ifuqgr	2026-06-09	2026-06-23 15:25:10.837	ADMIN_HISTORICAL
cmqqsq6gb00twp901rczhxfxl	cmqqsq6g800tup901w3xxgxef	cmpxths4t00k7p401ms2nx4f0	cmqmp6na5007mod01u6ifuqgr	2026-06-09	2026-06-23 15:25:22.092	ADMIN_HISTORICAL
cmqqsqck200u4p901dlqn5pxf	cmqqsqck100u2p901rhig7xzl	cmp88f7g90073p401w4uw4pqs	cmqmp6na5007mod01u6ifuqgr	2026-06-09	2026-06-23 15:25:30.003	ADMIN_HISTORICAL
cmqqssfzv00u8p9016wlgcdax	cmqqssfzt00u6p901bl8p0yax	cmpb26l0900ccp4014tau0gjw	cmqmp8vmo007qod01gzpgw27r	2026-06-10	2026-06-23 15:27:07.771	ADMIN_HISTORICAL
cmqqsssgu00ucp901ejrq7l8m	cmqqsssgs00uap9014s0dihjl	cmpv004tl00iyp4017n7rkxr5	cmqmp9mwu007sod019twll170	2026-06-10	2026-06-23 15:27:23.934	ADMIN_HISTORICAL
cmqqsu7d900ukp901d7otlcos	cmqqsu7d700uip901o0155w8d	cmqp3qkb7000bs001u04q0vsn	cmqmp9mwu007sod019twll170	2026-06-10	2026-06-23 15:28:29.901	ADMIN_HISTORICAL
cmqqsvwst00uop901xor7xnji	cmqqsvwss00ump90146bmrws5	cmp6n6c330042p401572wyy97	cmqmpc0r4007yod01gj81ghpg	2026-06-10	2026-06-23 15:29:49.518	ADMIN_HISTORICAL
cmqqsw3bs00usp901p65caw37	cmqqsw3bs00uqp901izry6nxk	cmq251ruu00l5p4010gsntqmg	cmqmpc0r4007yod01gj81ghpg	2026-06-10	2026-06-23 15:29:57.977	ADMIN_HISTORICAL
cmqqswmbr00uwp901lww63flj	cmqqswmbo00uup901iiutl0en	cmpuxyh5x00itp401pqas19s7	cmqmpc0r4007yod01gj81ghpg	2026-06-10	2026-06-23 15:30:22.6	ADMIN_HISTORICAL
cmqqswyud00v4p901pdk7amh8	cmqqswyuc00v2p901sugbp2n6	cmqf2b3xg0001wmtsjmoqct8a	cmqmpc0r4007yod01gj81ghpg	2026-06-10	2026-06-23 15:30:38.821	ADMIN_HISTORICAL
cmqqsxi9p00v8p901sy9iumwj	cmqqsxi9o00v6p901shrt4ii7	cmp5dd5sd0074l401pv3drst8	cmqmpcw1m0080od01sxv5w13u	2026-06-10	2026-06-23 15:31:03.998	ADMIN_HISTORICAL
cmqqsxnu200vcp901q22n3a45	cmqqsxnu100vap901z5wut16h	cmpfpx1dd00ekp4015zb7hrup	cmqmpcw1m0080od01sxv5w13u	2026-06-10	2026-06-23 15:31:11.211	ADMIN_HISTORICAL
cmqqsxtgf00vkp901lwpwrlwk	cmqqsxtge00vip901skai0epw	cmqpbn2ri001elk01umecmq7c	cmqmpcw1m0080od01sxv5w13u	2026-06-10	2026-06-23 15:31:18.496	ADMIN_HISTORICAL
cmqqsy3uy00vsp901m117kvtc	cmqqsy3ux00vqp9016z87jy68	cmqpbli4t0017lk01pgc2c00k	cmqmpcw1m0080od01sxv5w13u	2026-06-10	2026-06-23 15:31:31.979	ADMIN_HISTORICAL
cmqqsywre00vwp901nz1g09e7	cmqqsywrd00vup901aedjf8oz	cmpqvd4pp00hkp401fok0cwt8	cmqmpdkr30082od019fokwjfc	2026-06-10	2026-06-23 15:32:09.435	ADMIN_HISTORICAL
cmqqsz1qy00w0p901hykh0ybp	cmqqsz1qx00vyp901p9kwjidw	cmp88f7g90073p401w4uw4pqs	cmqmpdkr30082od019fokwjfc	2026-06-10	2026-06-23 15:32:15.898	ADMIN_HISTORICAL
cmqqszb2a00w4p901xlxselga	cmqqszb2900w2p901zli921ua	cmp6mujhf003ip4019yxl5iri	cmqmpdkr30082od019fokwjfc	2026-06-10	2026-06-23 15:32:27.971	ADMIN_HISTORICAL
cmqqszrzb00w8p9013b3nzk3s	cmqqszrza00w6p901n3lc36k4	cmpxtdnho00jxp401mtude4xv	cmqmpdkr30082od019fokwjfc	2026-06-10	2026-06-23 15:32:49.896	ADMIN_HISTORICAL
cmqqt01d300wcp901hwtljyah	cmqqt01d200wap901yn2txsxv	cmpxtfc9z00k2p401mfev8i51	cmqmpdkr30082od019fokwjfc	2026-06-10	2026-06-23 15:33:02.055	ADMIN_HISTORICAL
cmqqt2bgm00wgp901lujijnnv	cmqqt2bgk00wep901aag8cdqh	cmpmhc40500h9p40180sb0edr	cmqmpfeie0086od01jt90wal1	2026-06-11	2026-06-23 15:34:48.455	ADMIN_HISTORICAL
cmqqt2gsv00wkp901b5fjwm8x	cmqqt2gsu00wip901k1wcd14i	cmpfdk63200ebp401atbgmxt9	cmqmpfeie0086od01jt90wal1	2026-06-11	2026-06-23 15:34:55.376	ADMIN_HISTORICAL
cmqqt2n6r00wop9017mfueve5	cmqqt2n6p00wmp901vnl0f5z0	cmp5doqck0079l4013c3pypy1	cmqmpfeie0086od01jt90wal1	2026-06-11	2026-06-23 15:35:03.651	ADMIN_HISTORICAL
cmqqt2w8a00wsp9015nsw97n5	cmqqt2w8800wqp901ib6e45fn	cmp6mh9mn0033p401xa6v43p7	cmqmpfeie0086od01jt90wal1	2026-06-11	2026-06-23 15:35:15.37	ADMIN_HISTORICAL
cmqqt3t6y00wwp9014mgbqt4t	cmqqt3t6x00wup901yoy0giqy	cmpazudle00byp401oz4zx3e1	cmqmpgex10088od01rb6gvhrn	2026-06-11	2026-06-23 15:35:58.09	ADMIN_HISTORICAL
cmqqt40fl00x4p9011mpts39u	cmqqt40fj00x2p901kc8oty7k	cmp87ym20006yp401590xadl0	cmqmpgex10088od01rb6gvhrn	2026-06-11	2026-06-23 15:36:07.473	ADMIN_HISTORICAL
cmqqt45u100x8p901wpchximb	cmqqt45u000x6p901yyqrvr0y	cmpxt9h9d00jnp401acy1ppf1	cmqmpgex10088od01rb6gvhrn	2026-06-11	2026-06-23 15:36:14.473	ADMIN_HISTORICAL
cmqqt4aqo00xcp901okrpbd82	cmqqt4aqn00xap901eob0zzmt	cmp5d9vn5006zl401fo5j5q04	cmqmpgex10088od01rb6gvhrn	2026-06-11	2026-06-23 15:36:20.833	ADMIN_HISTORICAL
cmqqt4lxo00xgp9016w4133t2	cmqqt4lxm00xep901oxta6g5s	cmpya6nur00kgp401et6xel9m	cmqmpgex10088od01rb6gvhrn	2026-06-11	2026-06-23 15:36:35.34	ADMIN_HISTORICAL
cmqqt5boc00xkp901pmly79rh	cmqqt5boa00xip9014ca7kj9g	cmp80zids006np4015qmgm2k4	cmqmph13j008aod01zri8pyzo	2026-06-11	2026-06-23 15:37:08.7	ADMIN_HISTORICAL
cmqqt5fn600xop901dl0qznhf	cmqqt5fn500xmp901ww7uqjr9	cmpwo5qcf00jgp401y23i6i2r	cmqmph13j008aod01zri8pyzo	2026-06-11	2026-06-23 15:37:13.843	ADMIN_HISTORICAL
cmqqt5rvn00xsp9010vcv8a9i	cmqqt5rvm00xqp9010rzdlmos	cmpuxlbuw00ijp4016pmesm29	cmqmph13j008aod01zri8pyzo	2026-06-11	2026-06-23 15:37:29.7	ADMIN_HISTORICAL
cmqqt5zz400xwp901d7twiift	cmqqt5zz200xup9012ha9erl8	cmp9p95jj00b2p401dqlrtohp	cmqmph13j008aod01zri8pyzo	2026-06-11	2026-06-23 15:37:40.192	ADMIN_HISTORICAL
cmqqt65rj00y0p90194d8hw3w	cmqqt65ri00xyp901l50ja5bp	cmp9pbn9j00b7p401wd3w8sn0	cmqmph13j008aod01zri8pyzo	2026-06-11	2026-06-23 15:37:47.695	ADMIN_HISTORICAL
cmqqt6btt00y4p901zfe9ip6l	cmqqt6btr00y2p901hiabkuwh	cmp6n0r9g003sp401svwhqzjy	cmqmph13j008aod01zri8pyzo	2026-06-11	2026-06-23 15:37:55.553	ADMIN_HISTORICAL
cmqqt7f4a00y8p901ahhvafoy	cmqqt7f4800y6p901pyqk1rgl	cmp6mxgtj003np401n6d3md2o	cmqmpiici008eod01s39f479e	2026-06-11	2026-06-23 15:38:46.475	ADMIN_HISTORICAL
cmqqt7o9700ycp901kh2wfcgy	cmqqt7o9600yap901pq1eehu9	cmpi6ban400fip401ppm9o7wy	cmqmpiici008eod01s39f479e	2026-06-11	2026-06-23 15:38:58.316	ADMIN_HISTORICAL
cmqqt8pzy00ygp90187aqagmm	cmqqt8pzx00yep9012ihz13n2	cmp9l6t2c00acp4018v82zolp	cmqmpoa23008kod01azh8l5gg	2026-06-12	2026-06-23 15:39:47.231	ADMIN_HISTORICAL
cmqqt8v0p00ykp901ajonx5e8	cmqqt8v0o00yip901ax37e3fg	cmpv004tl00iyp4017n7rkxr5	cmqmpoa23008kod01azh8l5gg	2026-06-12	2026-06-23 15:39:53.738	ADMIN_HISTORICAL
cmqqt90rc00yop901j3nqr29t	cmqqt90ra00ymp901f6cz4d5d	cmpxtbvan00jsp401dbkqvo9n	cmqmpoa23008kod01azh8l5gg	2026-06-12	2026-06-23 15:40:01.176	ADMIN_HISTORICAL
cmqqt9p0400ysp901szvjdlvt	cmqqt9p0300yqp901p76twic0	cmqf2b3xg0001wmtsjmoqct8a	cmqmqcqhh008ood01g6nrviry	2026-06-12	2026-06-23 15:40:32.596	ADMIN_HISTORICAL
cmqqta3sj00ywp9013t99gvxh	cmqqta3sh00yup9017dox0n1z	cmps12dpz00hvp401tesxyqev	cmqmqlnvv008qod01djrodw4c	2026-06-12	2026-06-23 15:40:51.764	ADMIN_HISTORICAL
cmqqtasz300z0p901mr8huecy	cmqqtasz200yyp901o4qvvz8i	cmp5r29es001fp401vky62ly4	cmqmwt2kn0090od0147oyjp5o	2026-06-12	2026-06-23 15:41:24.399	ADMIN_HISTORICAL
cmqqtazgp00z4p901gwg6bgjp	cmqqtazgo00z2p9013vrg0ip7	cmp6n445r003xp4019r22o12e	cmqmwt2kn0090od0147oyjp5o	2026-06-12	2026-06-23 15:41:32.809	ADMIN_HISTORICAL
cmqqtb5pw00z8p901e1aglhjk	cmqqtb5pv00z6p9014dcr6h8v	cmp6n9pyb0047p401exgskztu	cmqmwt2kn0090od0147oyjp5o	2026-06-12	2026-06-23 15:41:40.916	ADMIN_HISTORICAL
cmqqtbork00zcp901792htm8i	cmqqtbori00zap9012fj8il8q	cmpxtfc9z00k2p401mfev8i51	cmqmwu6kh0092od01h39znw53	2026-06-12	2026-06-23 15:42:05.6	ADMIN_HISTORICAL
cmqqtbvoo00zgp901sxf7k8ia	cmqqtbvon00zep901yk6mvk3r	cmpxths4t00k7p401ms2nx4f0	cmqmwu6kh0092od01h39znw53	2026-06-12	2026-06-23 15:42:14.569	ADMIN_HISTORICAL
cmqqtc35500zkp901hcsrc133	cmqqtc35400zip9015m0nlv9d	cmp5dd5sd0074l401pv3drst8	cmqmwu6kh0092od01h39znw53	2026-06-12	2026-06-23 15:42:24.234	ADMIN_HISTORICAL
cmqqtfiqq00zop901lredcjve	cmqqtfiqo00zmp90122a3xvhe	cmpuxbc7900i9p401d4rkyuom	cmqmwxsdz0096od01664tgt8r	2026-06-13	2026-06-23 15:45:04.419	ADMIN_HISTORICAL
cmqqtfoqx00zsp901jtoo9lw3	cmqqtfoqw00zqp901x4fck698	cmpv004tl00iyp4017n7rkxr5	cmqmwxsdz0096od01664tgt8r	2026-06-13	2026-06-23 15:45:12.201	ADMIN_HISTORICAL
cmqqtfw940100p9014d555hat	cmqqtfw9200zyp901s1vxcpw3	cmqqija83000up901vbrlsocv	cmqmwxsdz0096od01664tgt8r	2026-06-13	2026-06-23 15:45:21.928	ADMIN_HISTORICAL
cmqqthjgd0104p9018j4ew6wv	cmqqthjga0102p901c2jrkzer	cmp71pbmj005ip401rxsl0n27	cmqmwz5f30098od01306pltsx	2026-06-13	2026-06-23 15:46:38.653	ADMIN_HISTORICAL
cmqqthov00108p901s2p03zql	cmqqthouy0106p901jkf26k5r	cmp6mxgtj003np401n6d3md2o	cmqmwz5f30098od01306pltsx	2026-06-13	2026-06-23 15:46:45.66	ADMIN_HISTORICAL
cmqqthx7i010cp9017zxj9y43	cmqqthx7h010ap901hn7v1ohb	cmpuxpn4l00iop40156zk6rje	cmqmwz5f30098od01306pltsx	2026-06-13	2026-06-23 15:46:56.479	ADMIN_HISTORICAL
cmqqtihp4010gp901y0wskoig	cmqqtihp3010ep901l3usulga	cmpuxbc7900i9p401d4rkyuom	cmqmx228g009eod01n48ln87x	2026-06-14	2026-06-23 15:47:23.032	ADMIN_HISTORICAL
cmqqtiod3010kp901e1r6lbb2	cmqqtiod2010ip9011o1swlnz	cmpazudle00byp401oz4zx3e1	cmqmx228g009eod01n48ln87x	2026-06-14	2026-06-23 15:47:31.672	ADMIN_HISTORICAL
cmqqtiyo2010op901brq90cdk	cmqqtiyo1010mp901phscy38b	cmp9jyb2l009tp4012t706wff	cmqmx228g009eod01n48ln87x	2026-06-14	2026-06-23 15:47:45.027	ADMIN_HISTORICAL
cmqqtj8i3010sp901zu3s3skx	cmqqtj8i2010qp9014bnpwpgs	cmp6mujhf003ip4019yxl5iri	cmqmx228g009eod01n48ln87x	2026-06-14	2026-06-23 15:47:57.772	ADMIN_HISTORICAL
cmqqtjgg9010wp901k7dl4aez	cmqqtjgg8010up901ybu1gbc7	cmpzh61qy00kpp401u52chqfx	cmqmx228g009eod01n48ln87x	2026-06-14	2026-06-23 15:48:08.073	ADMIN_HISTORICAL
cmqqtjv4t0114p901xdj1agi8	cmqqtjv4r0112p901d44zjh87	cmqf2b43f0011wmts29fvfire	cmqmx228g009eod01n48ln87x	2026-06-14	2026-06-23 15:48:27.101	ADMIN_HISTORICAL
cmqqtl10r011cp901cud5aloz	cmqqtl10p011ap901lheh78ug	cmqf2b3z80007wmtsodeuow25	cmqmx2sa5009god01c20hdflw	2026-06-14	2026-06-23 15:49:21.387	ADMIN_HISTORICAL
cmqqubv8v011gp901p5s1t8f7	cmqqubv8t011ep901u4i7dpen	cmp5d9vn5006zl401fo5j5q04	cmqmx2sa5009god01c20hdflw	2026-06-14	2026-06-23 16:10:13.616	ADMIN_HISTORICAL
cmqqudfqb011op901mjig4epb	cmqqudfq9011mp9017xarzci2	cmqqio1g50018p9018hz9fq36	cmqmwxsdz0096od01664tgt8r	2026-06-13	2026-06-23 16:11:26.819	ADMIN_HISTORICAL
cmqqudpn2011wp901jie8bure	cmqqudpn0011up901b8nmtsj8	cmqqipr55001fp9010qryqpgy	cmqmwxsdz0096od01664tgt8r	2026-06-13	2026-06-23 16:11:39.662	ADMIN_HISTORICAL
cmqryce0m001xo701xaleclgs	cmqryce0k001vo701zuegryka	cmp5d9vn5006zl401fo5j5q04	cmqmxdlzq009mod01att4rvhp	2026-06-15	2026-06-24 10:50:22.582	ADMIN_HISTORICAL:NEW
cmqryd8mb0021o7013h84vksb	cmqryd8m7001zo701x03rf1t5	cmpazudle00byp401oz4zx3e1	cmqmxi7fj009qod0105qunl7e	2026-06-15	2026-06-24 10:51:02.243	ADMIN_HISTORICAL:NEW
cmqrydkl80025o7017zh75jo7	cmqrydkl70023o701vwa30b7k	cmq251ruu00l5p4010gsntqmg	cmqmxk8jg009sod018axk63jt	2026-06-15	2026-06-24 10:51:17.756	ADMIN_HISTORICAL:NEW
cmqrydsqx002do701x0o2qait	cmqrydsqv002bo70138tuug52	cmqf2b42m000vwmtsnd6eu11l	cmqmxk8jg009sod018axk63jt	2026-06-15	2026-06-24 10:51:28.329	ADMIN_HISTORICAL:NEW
cmqrye89h002lo701qfcvmoef	cmqrye89g002jo701sumsb280	cmqnjvfwv00clod01smhvf5v7	cmqmxk8jg009sod018axk63jt	2026-06-15	2026-06-24 10:51:48.437	ADMIN_HISTORICAL:NEW
cmqryekpa002to701025l9eqa	cmqryekp9002ro701gdh325hq	cmqnjmmn900ceod01dz6unzwp	cmqmxk8jg009sod018axk63jt	2026-06-15	2026-06-24 10:52:04.558	ADMIN_HISTORICAL:NEW
cmqryf1wm002xo701u0gt3hcy	cmqryf1wl002vo701jluqrtbj	cmph5kmv300f7p401b8x8jouu	cmqmxl62u009uod014m0gpyi8	2026-06-15	2026-06-24 10:52:26.855	ADMIN_HISTORICAL:NEW
cmqryf8z60031o701x5y5sap0	cmqryf8z5002zo701etl1wxio	cmpi6ban400fip401ppm9o7wy	cmqmxl62u009uod014m0gpyi8	2026-06-15	2026-06-24 10:52:36.019	ADMIN_HISTORICAL:NEW
cmqryfd3c0035o701xs4q139i	cmqryfd3b0033o701shfilkqz	cmp5dd5sd0074l401pv3drst8	cmqmxl62u009uod014m0gpyi8	2026-06-15	2026-06-24 10:52:41.352	ADMIN_HISTORICAL:NEW
cmqryfzey0039o701nier4ph1	cmqryfzex0037o701elq2lu0n	cmpwo5qcf00jgp401y23i6i2r	cmqmxuy8t00a0od019zvvur0b	2026-06-16	2026-06-24 10:53:10.282	ADMIN_HISTORICAL:NEW
cmqryg3lo003do701v736pt5x	cmqryg3ln003bo701stnz2mgl	cmp9pbn9j00b7p401wd3w8sn0	cmqmxuy8t00a0od019zvvur0b	2026-06-16	2026-06-24 10:53:15.709	ADMIN_HISTORICAL:NEW
cmqrygbv1003ho7016yri9q8t	cmqrygbv0003fo7017zo8hjlr	cmpb23ldo00c7p401ut25a8kv	cmqmxuy8t00a0od019zvvur0b	2026-06-16	2026-06-24 10:53:26.414	ADMIN_HISTORICAL:NEW
cmqryggj3003lo701bz8kjllo	cmqryggj2003jo701vdbocn29	cmpxtbvan00jsp401dbkqvo9n	cmqmxuy8t00a0od019zvvur0b	2026-06-16	2026-06-24 10:53:32.464	ADMIN_HISTORICAL:NEW
cmqrygn1m003to7018qiiy3fo	cmqrygn1l003ro701tvv0h5ew	cmqqifegn000gp901x4b3a61j	cmqmxuy8t00a0od019zvvur0b	2026-06-16	2026-06-24 10:53:40.907	ADMIN_HISTORICAL:NEW
cmqryh20k003xo701kfoac64m	cmqryh20j003vo701ycb73rzu	cmp6n0r9g003sp401svwhqzjy	cmqmxvpig00a2od01xxi462id	2026-06-16	2026-06-24 10:54:00.309	ADMIN_HISTORICAL:NEW
cmqryhlua0041o7014lrug4bv	cmqryhlu8003zo701xt46ro1y	cmqf2b3z80007wmtsodeuow25	cmqmy4eww00a4od013ljxe6pg	2026-06-16	2026-06-24 10:54:26.002	ADMIN_HISTORICAL:NEW
cmqryhruv0045o701fff0zvls	cmqryhrut0043o701w53u26ou	cmp6mxgtj003np401n6d3md2o	cmqmy4eww00a4od013ljxe6pg	2026-06-16	2026-06-24 10:54:33.799	ADMIN_HISTORICAL:NEW
cmqryibva0049o701jc1mmd2h	cmqryibv90047o701gymtfdyq	cmpazudle00byp401oz4zx3e1	cmqmycf3z00a6od011azj1g9o	2026-06-16	2026-06-24 10:54:59.735	ADMIN_HISTORICAL:NEW
cmqryik6t004do701g8lrb94j	cmqryik6s004bo701b4zpssm8	cmpuxpn4l00iop40156zk6rje	cmqmycf3z00a6od011azj1g9o	2026-06-16	2026-06-24 10:55:10.517	ADMIN_HISTORICAL:NEW
cmqryisaq004ho701cc3u9m3q	cmqryisap004fo701jjp8anlx	cmp6vndph004yp401vluusox7	cmqmycf3z00a6od011azj1g9o	2026-06-16	2026-06-24 10:55:21.026	ADMIN_HISTORICAL:NEW
cmqryj68w004lo7016rf55kr0	cmqryj68u004jo701g3l2vfdu	cmp6maci6002tp40119cnxlu3	cmqmycf3z00a6od011azj1g9o	2026-06-16	2026-06-24 10:55:39.104	ADMIN_HISTORICAL:NEW
cmqryjtpb004po7014205errj	cmqryjtp9004no7018pufkiwx	cmpxtdnho00jxp401mtude4xv	cmqmykgkd00aaod01jghobkg1	2026-06-16	2026-06-24 10:56:09.503	ADMIN_HISTORICAL:NEW
cmqryk1jw004to7017004j4no	cmqryk1jv004ro70164ummnd3	cmp88f7g90073p401w4uw4pqs	cmqmykgkd00aaod01jghobkg1	2026-06-16	2026-06-24 10:56:19.677	ADMIN_HISTORICAL:NEW
cmqryk7mm004xo701xoel4s77	cmqryk7ml004vo7015frvbuv7	cmpuxgfvo00iep401kuin241v	cmqmykgkd00aaod01jghobkg1	2026-06-16	2026-06-24 10:56:27.55	ADMIN_HISTORICAL:NEW
cmqrym7vt0051o701xduj64w8	cmqrym7vs004zo7010ve8daeu	cmpv004tl00iyp4017n7rkxr5	cmqmypic400agod01jctx3ywi	2026-06-17	2026-06-24 10:58:01.194	ADMIN_HISTORICAL:NEW
cmqrymml30059o701r0f439s1	cmqrymml10057o701ukpk77af	cmqnjhe4500c7od01xunmmhyz	cmqmypic400agod01jctx3ywi	2026-06-17	2026-06-24 10:58:20.247	ADMIN_HISTORICAL:NEW
cmqrymz8e005ho701da1moyq6	cmqrymz8d005fo701nhzdxz3h	cmqp3rvft000is001ahcjqwvz	cmqmypic400agod01jctx3ywi	2026-06-17	2026-06-24 10:58:36.638	ADMIN_HISTORICAL:NEW
cmqryn5me005lo701o76d88nz	cmqryn5md005jo7014ra7xvor	cmpfdk63200ebp401atbgmxt9	cmqmypic400agod01jctx3ywi	2026-06-17	2026-06-24 10:58:44.918	ADMIN_HISTORICAL:NEW
cmqrynzk2005po701yqa73m56	cmqrynzk0005no701yotv06un	cmqf2b3xg0001wmtsjmoqct8a	cmqmz3ev800amod01hq79sqrj	2026-06-17	2026-06-24 10:59:23.714	ADMIN_HISTORICAL:NEW
cmqryo876005to701rt4trgw6	cmqryo875005ro701ounxvnhx	cmp6mh9mn0033p401xa6v43p7	cmqmz3ev800amod01hq79sqrj	2026-06-17	2026-06-24 10:59:34.914	ADMIN_HISTORICAL:NEW
cmqryoffk005xo701nti1shk4	cmqryoffj005vo701hcqlmt0k	cmps12dpz00hvp401tesxyqev	cmqmz3ev800amod01hq79sqrj	2026-06-17	2026-06-24 10:59:44.288	ADMIN_HISTORICAL:NEW
cmqryou650061o701gmhwhc9p	cmqryou63005zo701xv7ope7z	cmp9muoo600alp401b1jj91hv	cmqmz44v900aood01b4oxxshe	2026-06-17	2026-06-24 11:00:03.389	ADMIN_HISTORICAL:NEW
cmqryp0v10065o701ubnum4we	cmqryp0v00063o70167vbdx74	cmp9n16yg00aqp401yfgd8zit	cmqmz44v900aood01b4oxxshe	2026-06-17	2026-06-24 11:00:12.062	ADMIN_HISTORICAL:NEW
cmqryphsa0069o701o1zyov2m	cmqryphs90067o701fzot9z06	cmpxtdnho00jxp401mtude4xv	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	2026-06-24 11:00:33.994	ADMIN_HISTORICAL:NEW
cmqrypmi7006do701h4j39m7n	cmqrypmi6006bo70191gr8a6j	cmpzh61qy00kpp401u52chqfx	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	2026-06-24 11:00:40.112	ADMIN_HISTORICAL:NEW
cmqrypv62006ho701g1ndpkk4	cmqrypv61006fo70125er5w1k	cmp88f7g90073p401w4uw4pqs	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	2026-06-24 11:00:51.338	ADMIN_HISTORICAL:NEW
cmqryq43v006lo701bi8bj0pl	cmqryq43t006jo701hk03xdlz	cmp6n6c330042p401572wyy97	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	2026-06-24 11:01:02.923	ADMIN_HISTORICAL:NEW
cmqryqeep006po701iq9o156d	cmqryqeen006no7016qz8lf7i	cmpxtfc9z00k2p401mfev8i51	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	2026-06-24 11:01:16.273	ADMIN_HISTORICAL:NEW
cmqryqjr2006to701diqej5o0	cmqryqjr1006ro701hnui6xdv	cmpxths4t00k7p401ms2nx4f0	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	2026-06-24 11:01:23.198	ADMIN_HISTORICAL:NEW
cmqryrafg006xo701e8eq7dc5	cmqryrafe006vo701jujbm832	cmp5i45nq000ap401mr5kujgq	cmqmz5o1b00asod01dfkbqw75	2026-06-18	2026-06-24 11:01:57.772	ADMIN_HISTORICAL:NEW
cmqryrhvf0075o701fixxwg2o	cmqryrhvd0073o701mmin4pwu	cmqp4mhgd0009lk015rytzui9	cmqmz5o1b00asod01dfkbqw75	2026-06-18	2026-06-24 11:02:07.419	ADMIN_HISTORICAL:NEW
cmqryrx0s0079o7015uiw6xqc	cmqryrx0q0077o7017p5fuu2m	cmp6mujhf003ip4019yxl5iri	cmqmz6p9a00auod01r4beqiab	2026-06-18	2026-06-24 11:02:27.053	ADMIN_HISTORICAL:NEW
cmqrys5gb007do701dmd92lg2	cmqrys5ga007bo701inm0nz1g	cmpmhc40500h9p40180sb0edr	cmqmz6p9a00auod01r4beqiab	2026-06-18	2026-06-24 11:02:37.979	ADMIN_HISTORICAL:NEW
cmqrysf9e007ho701xj57xef0	cmqrysf9d007fo701pruielqj	cmp6n9pyb0047p401exgskztu	cmqmz6p9a00auod01r4beqiab	2026-06-18	2026-06-24 11:02:50.691	ADMIN_HISTORICAL:NEW
cmqrysoqy007po70122vi7xu7	cmqrysoqw007no701g46hdmn4	cmqp4nucc000glk01of7k32cs	cmqmz6p9a00auod01r4beqiab	2026-06-18	2026-06-24 11:03:02.986	ADMIN_HISTORICAL:NEW
cmqrysy28007to7014ntwa8h3	cmqrysy27007ro70126ii3k2g	cmp6mh9mn0033p401xa6v43p7	cmqmz6p9a00auod01r4beqiab	2026-06-18	2026-06-24 11:03:15.056	ADMIN_HISTORICAL:NEW
cmqryu684007xo701g69o65no	cmqryu682007vo701dhgk3xpf	cmp87ym20006yp401590xadl0	cmqmz8uab00ayod011jdohk6l	2026-06-18	2026-06-24 11:04:12.292	ADMIN_HISTORICAL:NEW
cmqryuckb0081o701j1wuqwt3	cmqryucka007zo701ymwwgst9	cmpya6nur00kgp401et6xel9m	cmqmz8uab00ayod011jdohk6l	2026-06-18	2026-06-24 11:04:20.508	ADMIN_HISTORICAL:NEW
cmqryujn30085o70170908384	cmqryujn20083o701yp9e7g10	cmp6n0r9g003sp401svwhqzjy	cmqmz8uab00ayod011jdohk6l	2026-06-18	2026-06-24 11:04:29.679	ADMIN_HISTORICAL:NEW
cmqryuqhe0089o7012qityzkz	cmqryuqhd0087o701p7vbey5x	cmp5dd5sd0074l401pv3drst8	cmqmz8uab00ayod011jdohk6l	2026-06-18	2026-06-24 11:04:38.546	ADMIN_HISTORICAL:NEW
cmqryuy1r008do701lw1ji83z	cmqryuy1q008bo701m04sagls	cmpuxyh5x00itp401pqas19s7	cmqmz8uab00ayod011jdohk6l	2026-06-18	2026-06-24 11:04:48.351	ADMIN_HISTORICAL:NEW
cmqrywtzf008lo701o0btvypr	cmqrywtzd008jo701xvy3rndk	cmpxtdnho00jxp401mtude4xv	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	2026-06-24 11:06:16.395	ADMIN_HISTORICAL:NEW
cmqryxa25008po701f2wiubbv	cmqryxa24008no701pxyjs3n1	cmp80zids006np4015qmgm2k4	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	2026-06-24 11:06:37.23	ADMIN_HISTORICAL:NEW
cmqryxilr008to701wlbj1nht	cmqryxilp008ro701hhgo0z2z	cmp9p95jj00b2p401dqlrtohp	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	2026-06-24 11:06:48.303	ADMIN_HISTORICAL:NEW
cmqrzeq4a0099o701byvhprts	cmqrzeq480097o701tv5ulbr8	cmp9pbn9j00b7p401wd3w8sn0	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	2026-06-24 11:20:11.194	ADMIN_HISTORICAL:NEW
cmqrziujb009ho701i0irmm8y	cmqrziuj9009fo701ohrzfbok	cmpuxlbuw00ijp4016pmesm29	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	2026-06-24 11:23:23.544	ADMIN_HISTORICAL:NEW
cmqrzk9rn009lo701t9zkz35a	cmqrzk9rm009jo701odxcc5br	cmqqifegn000gp901x4b3a61j	cmqmzau0000b4od01md10weud	2026-06-18	2026-06-24 11:24:29.939	ADMIN_HISTORICAL:NEW
cmqrzkg8r009po7016wtkyzeq	cmqrzkg8p009no701al8muhrh	cmqf2b3z80007wmtsodeuow25	cmqmzau0000b4od01md10weud	2026-06-18	2026-06-24 11:24:38.331	ADMIN_HISTORICAL:NEW
cmqs1sszi009xo701ulh6px3z	cmqs1sszg009vo7012shjpkga	cmp9l6t2c00acp4018v82zolp	cmqmzdtxg00baod01igps5ws1	2026-06-19	2026-06-24 12:27:07.326	ADMIN_HISTORICAL:NEW
cmqs1szfr00a1o70199jgzdci	cmqs1szfq009zo701of2avxuy	cmp5i45nq000ap401mr5kujgq	cmqmzdtxg00baod01igps5ws1	2026-06-19	2026-06-24 12:27:15.688	ADMIN_HISTORICAL:NEW
cmqs1t58b00a5o701q3pj0s24	cmqs1t58900a3o7014jhxrzh6	cmpv004tl00iyp4017n7rkxr5	cmqmzdtxg00baod01igps5ws1	2026-06-19	2026-06-24 12:27:23.196	ADMIN_HISTORICAL:NEW
cmqs1tj8x00ado701pv4siv8e	cmqs1tj8w00abo701f2uyv2za	cmqnlovfk00czod0169336zw1	cmqmzegjv00bcod01rtb2irwa	2026-06-19	2026-06-24 12:27:41.362	ADMIN_HISTORICAL:NEW
cmqs1u63300aho701cw5knll5	cmqs1u63100afo7016jjgp7es	cmqf2b3z80007wmtsodeuow25	cmqmzg1d400bgod013njn246u	2026-06-19	2026-06-24 12:28:10.959	ADMIN_HISTORICAL:NEW
cmqs1ujjj00alo701fpnqnl4v	cmqs1ujjh00ajo701ep6duado	cmq251ruu00l5p4010gsntqmg	cmqmzgokp00biod01cswpv9rp	2026-06-19	2026-06-24 12:28:28.399	ADMIN_HISTORICAL:NEW
cmqs1upai00apo7017jgehrku	cmqs1upag00ano701a3eyjcfo	cmqf2b42m000vwmtsnd6eu11l	cmqmzgokp00biod01cswpv9rp	2026-06-19	2026-06-24 12:28:35.851	ADMIN_HISTORICAL:NEW
cmqs1w5sf00ato7010kdbn037	cmqs1w5se00aro70167krqfdh	cmp5r29es001fp401vky62ly4	cmqmzhmz400bkod01vmahn0qn	2026-06-19	2026-06-24 12:29:43.887	ADMIN_HISTORICAL:NEW
cmqs1wapg00axo701cfu8bhjj	cmqs1wape00avo701v3pojwcx	cmpxtfc9z00k2p401mfev8i51	cmqmzhmz400bkod01vmahn0qn	2026-06-19	2026-06-24 12:29:50.26	ADMIN_HISTORICAL:NEW
cmqs1wh7900b1o701shhhdkja	cmqs1wh7800azo7012slmtuki	cmpxths4t00k7p401ms2nx4f0	cmqmzhmz400bkod01vmahn0qn	2026-06-19	2026-06-24 12:29:58.678	ADMIN_HISTORICAL:NEW
cmqs1wnor00b9o701ir4kz6dl	cmqs1wnop00b7o701xykc47rh	cmqqija83000up901vbrlsocv	cmqmzhmz400bkod01vmahn0qn	2026-06-19	2026-06-24 12:30:07.084	ADMIN_HISTORICAL:NEW
cmqs1wu2k00bho701kjrafxsv	cmqs1wu2j00bfo701ydn6nawd	cmqqipr55001fp9010qryqpgy	cmqmzhmz400bkod01vmahn0qn	2026-06-19	2026-06-24 12:30:15.357	ADMIN_HISTORICAL:NEW
cmqs1wye200bpo701yt13co1w	cmqs1wye100bno701eg7lnup9	cmqqio1g50018p9018hz9fq36	cmqmzhmz400bkod01vmahn0qn	2026-06-19	2026-06-24 12:30:20.955	ADMIN_HISTORICAL:NEW
cmqs1xc7v00bxo701cbgo45nn	cmqs1xc7u00bvo7019vqpd27q	cmqf2b41m000pwmtsgzlybd2p	cmqmzijl200bmod01hlllzqkz	2026-06-19	2026-06-24 12:30:38.876	ADMIN_HISTORICAL:NEW
cmqs1xhv500c5o701u5h8jgjf	cmqs1xhv400c3o701dw20cirk	cmqf2b405000dwmtsddcf7agj	cmqmzijl200bmod01hlllzqkz	2026-06-19	2026-06-24 12:30:46.193	ADMIN_HISTORICAL:NEW
cmqs1xmr300cdo701tpzg64q2	cmqs1xmr100cbo701blnw850l	cmqf2b40z000jwmtsglaha6m4	cmqmzijl200bmod01hlllzqkz	2026-06-19	2026-06-24 12:30:52.527	ADMIN_HISTORICAL:NEW
cmqs1xs8m00cho701zpe97pgk	cmqs1xs8l00cfo701dxsi3k88	cmpuxgfvo00iep401kuin241v	cmqmzijl200bmod01hlllzqkz	2026-06-19	2026-06-24 12:30:59.639	ADMIN_HISTORICAL:NEW
cmqs1y6sx00cpo701didcvsd2	cmqs1y6sw00cno701v424nfro	cmqnlllpk00csod01wkefk1ot	cmqmzijl200bmod01hlllzqkz	2026-06-19	2026-06-24 12:31:18.513	ADMIN_HISTORICAL:NEW
cmqs1yl3m00cxo701kwp7gzpz	cmqs1yl3k00cvo7010panfs65	cmqno5z2j00dlod0156ophlux	cmqmzijl200bmod01hlllzqkz	2026-06-19	2026-06-24 12:31:37.042	ADMIN_HISTORICAL:NEW
cmqs1zs9w00d5o701mzqr96lm	cmqs1zs9v00d3o7010xl892nm	cmqno2ywp00dfod01x3mtrdjg	cmqmzgokp00biod01cswpv9rp	2026-06-19	2026-06-24 12:32:32.997	ADMIN_HISTORICAL:NEW
cmqs20m7a00d9o701p42dhvug	cmqs20m7900d7o701hy3aeyap	cmqf2b43f0011wmts29fvfire	cmqmzl6d400bqod01swrx5394	2026-06-20	2026-06-24 12:33:11.783	ADMIN_HISTORICAL:NEW
cmqs20s7d00dho7013s28e58c	cmqs20s7c00dfo701awmlsk95	cmqp4ky050002lk01gx0v2tv9	cmqmzl6d400bqod01swrx5394	2026-06-20	2026-06-24 12:33:19.562	ADMIN_HISTORICAL:NEW
cmqs211lh00dlo701hut3iteg	cmqs211lf00djo7018owd9a7w	cmqno2ywp00dfod01x3mtrdjg	cmqmzl6d400bqod01swrx5394	2026-06-20	2026-06-24 12:33:31.734	ADMIN_HISTORICAL:NEW
cmqs21dxg00dpo7017ddw369y	cmqs21dxe00dno7017vo983id	cmp71pbmj005ip401rxsl0n27	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	2026-06-24 12:33:47.716	ADMIN_HISTORICAL:NEW
cmqs21mgi00dto701l7iksora	cmqs21mgh00dro701evbjf6yy	cmpv004tl00iyp4017n7rkxr5	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	2026-06-24 12:33:58.77	ADMIN_HISTORICAL:NEW
cmqs224s100dxo7011r5epbpe	cmqs224s000dvo70163exj0vw	cmp6n9pyb0047p401exgskztu	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	2026-06-24 12:34:22.514	ADMIN_HISTORICAL:NEW
cmqs22upf00e5o701tvd7b3po	cmqs22upe00e3o701pxe2zpyq	cmqqihcm6000np901ub12rzon	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	2026-06-24 12:34:56.115	ADMIN_HISTORICAL:NEW
cmqs24sa100eho701l15vece5	cmqs24s9z00efo701aui4pv9o	cmqp4nucc000glk01of7k32cs	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	2026-06-24 12:36:26.281	ADMIN_HISTORICAL:NEW
cmqs27j3w00eto701ckx3o21f	cmqs27j3u00ero701f2na455o	cmqqimbo30011p9015ihys621	cmqmznnmc00bwod01td8cigev	2026-06-21	2026-06-24 12:38:34.365	ADMIN_HISTORICAL:NEW
cmqs27pzt00f1o701k092k6hp	cmqs27pzs00ezo701rkimmwba	cmqpbt84l001zlk01r9quitpi	cmqmznnmc00bwod01td8cigev	2026-06-21	2026-06-24 12:38:43.29	ADMIN_HISTORICAL:NEW
cmqs27w4p00f9o701wuprpbbw	cmqs27w4n00f7o701yepcwp9i	cmqpbrpkn001slk01gekkfisb	cmqmznnmc00bwod01td8cigev	2026-06-21	2026-06-24 12:38:51.242	ADMIN_HISTORICAL:NEW
cmqs283kw00fho701zcj34vcr	cmqs283ku00ffo7018q1q1tbg	cmqpbpjdd001llk01e8vm535o	cmqmznnmc00bwod01td8cigev	2026-06-21	2026-06-24 12:39:00.896	ADMIN_HISTORICAL:NEW
cmqs28iyj00flo701rsilnhby	cmqs28iyi00fjo701w78osthh	cmp9jyb2l009tp4012t706wff	cmqmzoes500byod01924zdeoy	2026-06-21	2026-06-24 12:39:20.827	ADMIN_HISTORICAL:NEW
cmqs28t7600fpo701j44y1eyl	cmqs28t7400fno701bnhr5c4j	cmp6mujhf003ip4019yxl5iri	cmqmzoes500byod01924zdeoy	2026-06-21	2026-06-24 12:39:34.098	ADMIN_HISTORICAL:NEW
cmqs291gp00fto701hrlurcni	cmqs291go00fro701ibxl4nhn	cmqno2ywp00dfod01x3mtrdjg	cmqmzoes500byod01924zdeoy	2026-06-21	2026-06-24 12:39:44.809	ADMIN_HISTORICAL:NEW
cmqs29bx600fxo701qpnbvjk1	cmqs29bx500fvo701c3jx2p2q	cmpmhc40500h9p40180sb0edr	cmqmzp2t900c0od01v65bexcf	2026-06-21	2026-06-24 12:39:58.362	ADMIN_HISTORICAL:NEW
cmqs29i7700g5o7017hnjcfnj	cmqs29i7600g3o701c4ts2dbm	cmqp4nucc000glk01of7k32cs	cmqmzp2t900c0od01v65bexcf	2026-06-21	2026-06-24 12:40:06.499	ADMIN_HISTORICAL:NEW
cmqtanben00i1o701xabgfd80	cmqtanbel00hzo701txcoi9s1	cmqp3jmsv00euod010vtuk1qt	cmqmoudyk0074od01t3pj66aj	2026-06-08	2026-06-25 09:22:33.983	ADMIN_HISTORICAL:NEW
cmqtay77k00i9o701xmkaz5wi	cmqtay77h00i7o701elqznprh	cmqqifegn000gp901x4b3a61j	cmqmp9mwu007sod019twll170	2026-06-10	2026-06-25 09:31:01.761	ADMIN_HISTORICAL:NEW
cmqtb24j700ido701nv0y1od0	cmqtb24j500ibo701mgmpkjon	cmqqifegn000gp901x4b3a61j	cmqmpiici008eod01s39f479e	2026-06-11	2026-06-25 09:34:04.915	ADMIN_HISTORICAL:NEW
cmqzc9adr006fmg01d8cb73ac	cmqzc9ado006dmg01m2o0ugah	cmqz4ky2t003fmg011oeykh0h	cmqmp6na5007mod01u6ifuqgr	2026-06-09	2026-06-29 14:54:15.759	ADMIN_HISTORICAL:NEW
cmqzc9wgf006jmg01fv1q5a60	cmqzc9wge006hmg01qm5hiqfe	cmqz4ky2t003fmg011oeykh0h	cmqmpdkr30082od019fokwjfc	2026-06-10	2026-06-29 14:54:44.368	ADMIN_HISTORICAL:NEW
cmqzch2ex0076mg01m45suujh	cmqzch2ew0074mg01nk5fwu0l	cmqzcgki3006umg01b9522uso	cmqmykgkd00aaod01jghobkg1	2026-06-16	2026-06-29 15:00:18.682	ADMIN_HISTORICAL:NEW
cmqzcjdku007mmg01yq9uos8g	cmqzcjdkr007kmg0192wlv8m0	cmqzcgki3006umg01b9522uso	cmqmzcf9u00b8od01vzue4yz8	2026-06-19	2026-06-29 15:02:06.462	ADMIN_HISTORICAL:NEW
cmqzclt7j0082mg017nnia59c	cmqzclt7h0080mg012b8235d7	cmqzcgki3006umg01b9522uso	cmqrxgc0c000no701kc35xp16	2026-06-23	2026-06-29 15:04:00.031	ADMIN_HISTORICAL:NEW
cmqzco1ch008emg01foz2roh1	cmqzco1cf008cmg019mzebv88	cmqzcgki3006umg01b9522uso	cmqsaa65h00gpo701ax7nflqq	2026-06-26	2026-06-29 15:05:43.889	ADMIN_HISTORICAL:NEW
cmqzd3wms008mmg01uuc58f0r	cmqzd3wmp008kmg01bw3vky82	cmqz4i19x0038mg01irua66ou	cmqmoudyk0074od01t3pj66aj	2026-06-08	2026-06-29 15:18:04.276	ADMIN_HISTORICAL:NEW
cmqzd4a0z008qmg01y5jv2adj	cmqzd4a0x008omg01yzjpj3vi	cmqz4i19x0038mg01irua66ou	cmqmp9mwu007sod019twll170	2026-06-10	2026-06-29 15:18:21.635	ADMIN_HISTORICAL:NEW
cmr1u4l4l001xmm01lshf61rx	cmr1u4l4h001vmm01dkqyr3tl	cmpv004tl00iyp4017n7rkxr5	cmqrxhe6s000po701g621fkx5	2026-06-23	2026-07-01 08:50:01.845	ADMIN_HISTORICAL:NEW
cmr1u4ph50021mm016g6w7r9n	cmr1u4ph4001zmm01dasvy1xk	cmpxtbvan00jsp401dbkqvo9n	cmqrxhe6s000po701g621fkx5	2026-06-23	2026-07-01 08:50:07.482	ADMIN_HISTORICAL:NEW
cmr1u4vn60025mm014o3zwfdm	cmr1u4vn40023mm01ugcefd08	cmpux8mfw00i4p401v4t85sji	cmqrxhe6s000po701g621fkx5	2026-06-23	2026-07-01 08:50:15.474	ADMIN_HISTORICAL:NEW
cmr1u5lj90029mm01rlfdz4c9	cmr1u5lj70027mm01am55g7v0	cmpb26l0900ccp4014tau0gjw	cmqrxi4cv000ro701utq80ofw	2026-06-23	2026-07-01 08:50:49.029	ADMIN_HISTORICAL:NEW
cmr1u5rna002dmm012sn2uwzo	cmr1u5rn9002bmm01cgzqhtt4	cmp5i45nq000ap401mr5kujgq	cmqrxi4cv000ro701utq80ofw	2026-06-23	2026-07-01 08:50:56.951	ADMIN_HISTORICAL:NEW
cmr1u5zpj002hmm01f0jb6qt8	cmr1u5zpi002fmm013l88kigf	cmp6mh9mn0033p401xa6v43p7	cmqrxi4cv000ro701utq80ofw	2026-06-23	2026-07-01 08:51:07.399	ADMIN_HISTORICAL:NEW
cmr1u6xc4002lmm01ko9rh9wk	cmr1u6xc2002jmm016ubvc0tx	cmpv004tl00iyp4017n7rkxr5	cmqrxo7gt0015o701xvbt9ait	2026-06-24	2026-07-01 08:51:50.981	ADMIN_HISTORICAL:NEW
cmr1u71b7002pmm01lqfvoq7c	cmr1u71b6002nmm01d7719v2n	cmp5e2po6007el401m0wr4bxe	cmqrxo7gt0015o701xvbt9ait	2026-06-24	2026-07-01 08:51:56.132	ADMIN_HISTORICAL:NEW
cmr1u78wm002tmm01bi7mlt36	cmr1u78wl002rmm01t2lz5i3j	cmpux8mfw00i4p401v4t85sji	cmqrxo7gt0015o701xvbt9ait	2026-06-24	2026-07-01 08:52:05.975	ADMIN_HISTORICAL:NEW
cmr1u81zl002xmm01horwxdv3	cmr1u81zj002vmm01etblvqnx	cmqf2b3xg0001wmtsjmoqct8a	cmqrxot9c0017o701irtjaq4u	2026-06-24	2026-07-01 08:52:43.665	ADMIN_HISTORICAL:NEW
cmr1u89nb0031mm01vhljsipa	cmr1u89na002zmm01rj4dy0eq	cmqnlovfk00czod0169336zw1	cmqrxot9c0017o701irtjaq4u	2026-06-24	2026-07-01 08:52:53.591	ADMIN_HISTORICAL:NEW
cmr1u8pja0035mm01idh3wa55	cmr1u8pj90033mm018blid634	cmpb23ldo00c7p401ut25a8kv	cmqrxtu2w001ho701fpgerfv3	2026-06-25	2026-07-01 08:53:14.183	ADMIN_HISTORICAL:NEW
cmr1u90ko0039mm011ng3t9ev	cmr1u90km0037mm01cnt54lci	cmp6mh9mn0033p401xa6v43p7	cmqrxucwc001jo701m5ngk3ac	2026-06-25	2026-07-01 08:53:28.488	ADMIN_HISTORICAL:NEW
cmr1u96bu003dmm013t03ptrn	cmr1u96bs003bmm01m8nxn41u	cmp6n9pyb0047p401exgskztu	cmqrxucwc001jo701m5ngk3ac	2026-06-25	2026-07-01 08:53:35.946	ADMIN_HISTORICAL:NEW
cmr1uanjc003hmm012df1dpnj	cmr1uanjb003fmm01r9hkh4dg	cmp9l6t2c00acp4018v82zolp	cmqsabfkk00gto70136g7cl5i	2026-06-26	2026-07-01 08:54:44.904	ADMIN_HISTORICAL:NEW
cmr1uavb1003lmm01hlmqkjsb	cmr1uavb0003jmm01hufw09oo	cmp5i45nq000ap401mr5kujgq	cmqsabfkk00gto70136g7cl5i	2026-06-26	2026-07-01 08:54:54.974	ADMIN_HISTORICAL:NEW
cmr1ub01l003pmm01tjw9fhit	cmr1ub01j003nmm01unpc4uyh	cmp5e2po6007el401m0wr4bxe	cmqsabfkk00gto70136g7cl5i	2026-06-26	2026-07-01 08:55:01.113	ADMIN_HISTORICAL:NEW
cmr1ubirz003tmm01vmfdcxd5	cmr1ubiry003rmm01jhrcb3sl	cmp5dd5sd0074l401pv3drst8	cmqsah4mr00h7o701gjmxu85s	2026-06-27	2026-07-01 08:55:25.392	ADMIN_HISTORICAL:NEW
cmr1uc4k6003xmm018kjwh5ms	cmr1uc4k5003vmm01blt5uk2i	cmqnlllpk00csod01wkefk1ot	cmqsahxx500h9o701yzkspmas	2026-06-27	2026-07-01 08:55:53.623	ADMIN_HISTORICAL:NEW
cmr1uc8ng0041mm01xn92myux	cmr1uc8ne003zmm01o8qbuocn	cmqnnz1kg00d8od0103g8czza	cmqsahxx500h9o701yzkspmas	2026-06-27	2026-07-01 08:55:58.924	ADMIN_HISTORICAL:NEW
cmr1ucev80045mm01bz4nie3c	cmr1ucev60043mm01grdnm2x7	cmqnlovfk00czod0169336zw1	cmqsahxx500h9o701yzkspmas	2026-06-27	2026-07-01 08:56:06.98	ADMIN_HISTORICAL:NEW
cmr1ucpoh0049mm01owh4tlio	cmr1ucpog0047mm01yfcylgpi	cmqw8khue001lmg01a483drty	cmqsahxx500h9o701yzkspmas	2026-06-27	2026-07-01 08:56:20.994	ADMIN_HISTORICAL:NEW
cmr1ucu6o004dmm0142ghf46r	cmr1ucu6m004bmm01m7vnrxq7	cmqw8m90j001smg01dxisiguv	cmqsahxx500h9o701yzkspmas	2026-06-27	2026-07-01 08:56:26.833	ADMIN_HISTORICAL:NEW
cmr1ud1ki004hmm01xh820hzt	cmr1ud1kg004fmm01kqukefqc	cmpuxbc7900i9p401d4rkyuom	cmqsahxx500h9o701yzkspmas	2026-06-27	2026-07-01 08:56:36.402	ADMIN_HISTORICAL:NEW
cmr1udgma004lmm016l6fqnq3	cmr1udgm8004jmm014yzzcwg2	cmp71pbmj005ip401rxsl0n27	cmqsaie5800hbo7015ot7sic6	2026-06-27	2026-07-01 08:56:55.906	ADMIN_HISTORICAL:NEW
cmr1udl8e004pmm01w46iq0le	cmr1udl8d004nmm01oyqb3cy0	cmpux8mfw00i4p401v4t85sji	cmqsaie5800hbo7015ot7sic6	2026-06-27	2026-07-01 08:57:01.886	ADMIN_HISTORICAL:NEW
cmr1udp4p004tmm012c635ef9	cmr1udp4o004rmm01en8gt8dj	cmpv004tl00iyp4017n7rkxr5	cmqsaie5800hbo7015ot7sic6	2026-06-27	2026-07-01 08:57:06.938	ADMIN_HISTORICAL:NEW
cmr1udw99004xmm011780jft3	cmr1udw98004vmm01v7zbfa08	cmqw8njse001zmg010hmpycb7	cmqsaie5800hbo7015ot7sic6	2026-06-27	2026-07-01 08:57:16.174	ADMIN_HISTORICAL:NEW
cmr1ue24v0051mm01thyv19el	cmr1ue24t004zmm010pmzy1x0	cmqqihcm6000np901ub12rzon	cmqsaie5800hbo7015ot7sic6	2026-06-27	2026-07-01 08:57:23.791	ADMIN_HISTORICAL:NEW
cmr1uesdy0055mm0182rsudfm	cmr1uesdw0053mm01bgszbs6p	cmqqija83000up901vbrlsocv	cmqsajtqe00hfo701nymfh9ne	2026-06-28	2026-07-01 08:57:57.814	ADMIN_HISTORICAL:NEW
cmr1uezr00059mm0195bhbqwp	cmr1uezqz0057mm014gucr1t7	cmqpbt84l001zlk01r9quitpi	cmqsajtqe00hfo701nymfh9ne	2026-06-28	2026-07-01 08:58:07.357	ADMIN_HISTORICAL:NEW
cmr1uf64m005dmm01nhtzt0mi	cmr1uf64l005bmm01jru0zmen	cmqpbrpkn001slk01gekkfisb	cmqsajtqe00hfo701nymfh9ne	2026-06-28	2026-07-01 08:58:15.622	ADMIN_HISTORICAL:NEW
cmr1ufcny005hmm01wmyogjde	cmr1ufcnw005fmm01ner04zfc	cmqf2b41m000pwmtsgzlybd2p	cmqsajtqe00hfo701nymfh9ne	2026-06-28	2026-07-01 08:58:24.094	ADMIN_HISTORICAL:NEW
cmr1ufi6l005lmm01zkz3u35n	cmr1ufi6k005jmm01tsn33zhz	cmqf2b405000dwmtsddcf7agj	cmqsajtqe00hfo701nymfh9ne	2026-06-28	2026-07-01 08:58:31.245	ADMIN_HISTORICAL:NEW
cmr1ufrgn005pmm016d0lnr1b	cmr1ufrgm005nmm01lvgyn4ro	cmpuxbc7900i9p401d4rkyuom	cmqsajtqe00hfo701nymfh9ne	2026-06-28	2026-07-01 08:58:43.271	ADMIN_HISTORICAL:NEW
cmr1ug7fd005tmm01o000ebyw	cmr1ug7fc005rmm010qxsm5w3	cmpazudle00byp401oz4zx3e1	cmqsakcej00hho701m260shkz	2026-06-28	2026-07-01 08:59:03.961	ADMIN_HISTORICAL:NEW
cmr1ugc8l005xmm01sfoj6sy7	cmr1ugc8k005vmm01rp1lhjag	cmp6mujhf003ip4019yxl5iri	cmqsakcej00hho701m260shkz	2026-06-28	2026-07-01 08:59:10.198	ADMIN_HISTORICAL:NEW
cmr1ugglc0061mm01wi8ddprg	cmr1ugglb005zmm01uy1xee50	cmpzh61qy00kpp401u52chqfx	cmqsakcej00hho701m260shkz	2026-06-28	2026-07-01 08:59:15.841	ADMIN_HISTORICAL:NEW
cmr1ugmsp0065mm01563hdn1i	cmr1ugmsn0063mm012it0vi34	cmp9jyb2l009tp4012t706wff	cmqsakcej00hho701m260shkz	2026-06-28	2026-07-01 08:59:23.881	ADMIN_HISTORICAL:NEW
cmr1uh3070069mm01pkl9u4fi	cmr1uh3060067mm01g5nxwkxt	cmpxt9h9d00jnp401acy1ppf1	cmqsakcej00hho701m260shkz	2026-06-28	2026-07-01 08:59:44.888	ADMIN_HISTORICAL:NEW
cmr1uh9c0006dmm01lmlu10xu	cmr1uh9bz006bmm01ahsdxjuc	cmpfpx1dd00ekp4015zb7hrup	cmqsakcej00hho701m260shkz	2026-06-28	2026-07-01 08:59:53.089	ADMIN_HISTORICAL:NEW
cmr1vl2bm006tmm01wp57cr8f	cmr1vl2bk006rmm0133xb9aw4	cmp6n9pyb0047p401exgskztu	cmqrxddf7000fo701d3aeyir7	2026-06-22	2026-07-01 09:30:50.243	ADMIN_HISTORICAL:NEW
cmr1vlf8c006xmm01141uo074	cmr1vlf8b006vmm01qq5qsljz	cmph5kmv300f7p401b8x8jouu	cmqrxdzon000ho7018k4luggq	2026-06-22	2026-07-01 09:31:06.972	ADMIN_HISTORICAL:NEW
cmr1wijqi0071mm0125z21yml	cmr1wijqg006zmm017tsir76m	cmp6tmko3004rp4010ev8s38b	cmqrxdzon000ho7018k4luggq	2026-06-22	2026-07-01 09:56:52.459	ADMIN_HISTORICAL:NEW
cmr1wiobc0075mm01isw7y5ul	cmr1wioba0073mm01k9jxdtum	cmps12dpz00hvp401tesxyqev	cmqrxdzon000ho7018k4luggq	2026-06-22	2026-07-01 09:56:58.392	ADMIN_HISTORICAL:NEW
cmr1wj8810079mm01nc5v9ih7	cmr1wj87z0077mm01tzo38ktb	cmqf2b42m000vwmtsnd6eu11l	cmqrxenj9000jo7011cgedrh3	2026-06-22	2026-07-01 09:57:24.193	ADMIN_HISTORICAL:NEW
cmr1wjdfc007dmm013sufbiis	cmr1wjdfb007bmm01zr3t6e7c	cmqnjhe4500c7od01xunmmhyz	cmqrxenj9000jo7011cgedrh3	2026-06-22	2026-07-01 09:57:30.936	ADMIN_HISTORICAL:NEW
cmr1wl2qv007hmm01qk1rrcvr	cmr1wl2qt007fmm01xeyaj7s6	cmqqjfnwv001mp901zr9d550e	cmqrxenj9000jo7011cgedrh3	2026-06-22	2026-07-01 09:58:50.408	ADMIN_HISTORICAL:NEW
cmraeob0w00ihmm01maut4h9x	cmraeob0s00ifmm017r1jvp11	cmqur46xc00jno701ceuxfoxy	cmq9j8ubs0039wmys9cl9xj0d	2026-05-31	2026-07-07 08:47:23.6	ADMIN_HISTORICAL:NEW
cmraepb7b00ilmm013ltov40s	cmraepb7a00ijmm019wku4sr9	cmqur46xc00jno701ceuxfoxy	cmql7shbg0007od01lgx42aq6	2026-06-01	2026-07-07 08:48:10.487	ADMIN_HISTORICAL:NEW
cmraeqdrb00ipmm01gpv5v0mz	cmraeqdr900inmm01nboqxurh	cmqur46xc00jno701ceuxfoxy	cmqmo3hvf006aod01dsqm3c30	2026-06-05	2026-07-07 08:49:00.455	ADMIN_HISTORICAL:NEW
cmraer0i600itmm01tzj45ous	cmraer0i400irmm01x4dre225	cmqur46xc00jno701ceuxfoxy	cmqmoml4o006qod012vafqtdv	2026-06-08	2026-07-07 08:49:29.934	ADMIN_HISTORICAL:NEW
cmraex3xp00ixmm01ktuqkxko	cmraex3xm00ivmm01c3dh5ksc	cmqur46xc00jno701ceuxfoxy	cmqmpa8yy007uod01krhkw3tw	2026-06-10	2026-07-07 08:54:14.317	ADMIN_HISTORICAL:NEW
cmraexf5100j1mm01rby03v1b	cmraexf5000izmm01jh2bz9cu	cmqur46xc00jno701ceuxfoxy	cmqmpphwc008mod01h8ekff6d	2026-06-12	2026-07-07 08:54:28.838	ADMIN_HISTORICAL:NEW
cmraexy3s00j5mm01a7ozph2n	cmraexy3r00j3mm01xpxgfey7	cmqur46xc00jno701ceuxfoxy	cmqmxe9mb009ood0176v8gtu3	2026-06-15	2026-07-07 08:54:53.416	ADMIN_HISTORICAL:NEW
cmraeya1200j9mm019oh98d8y	cmraeya1100j7mm01hjthobw4	cmqur46xc00jno701ceuxfoxy	cmqmz1k0j00aiod01v1frcbrr	2026-06-17	2026-07-07 08:55:08.871	ADMIN_HISTORICAL:NEW
cmraezoit00jdmm01k02f1r8f	cmraezoir00jbmm012qox93rl	cmqur46xc00jno701ceuxfoxy	cmqmzf89h00beod01p8u2mqil	2026-06-19	2026-07-07 08:56:14.309	ADMIN_HISTORICAL:NEW
cmraf0f0b00jhmm01jid2s3t4	cmraf0f0a00jfmm01ch09x2r8	cmqur46xc00jno701ceuxfoxy	cmqrxbqrp000do701tzoiewue	2026-06-22	2026-07-07 08:56:48.635	ADMIN_HISTORICAL:NEW
cmrafc6a000jvmm01sahxmr9p	cmrafc69y00jtmm011m2xjimo	cmr0e8q3k009bmg01p00ba0nx	cmqzawpbl003vmg017wfvylhl	2026-06-29	2026-07-07 09:05:57.192	ADMIN_HISTORICAL:NEW
cmrdesp8g004jmn01czo66nox	cmrdesp8d004hmn01b4dfqcma	cmr3dno9x008vmm01yn5zbnx3	cmqrxenj9000jo7011cgedrh3	2026-06-22	2026-07-09 11:14:07.169	ADMIN_HISTORICAL:NEW
cmrdets4n004nmn01781wg60x	cmrdets4l004lmn01zkbmmdz9	cmp6mxgtj003np401n6d3md2o	cmqrxit6a000to701bqvtuyq7	2026-06-23	2026-07-09 11:14:57.575	ADMIN_HISTORICAL:NEW
cmrdeu3za004rmn01966eq8d4	cmrdeu3z8004pmn01atjuux2v	cmqnnz1kg00d8od0103g8czza	cmqrxjpuq000vo701sd9wab7y	2026-06-23	2026-07-09 11:15:12.934	ADMIN_HISTORICAL:NEW
cmrdeu9cm004vmn010x635fo9	cmrdeu9cl004tmn01utza4jer	cmqnjvfwv00clod01smhvf5v7	cmqrxjpuq000vo701sd9wab7y	2026-06-23	2026-07-09 11:15:19.895	ADMIN_HISTORICAL:NEW
cmrdeumjl004zmn01zfh0ht5p	cmrdeumjj004xmn018jd7lmae	cmqnjmmn900ceod01dz6unzwp	cmqrxjpuq000vo701sd9wab7y	2026-06-23	2026-07-09 11:15:36.993	ADMIN_HISTORICAL:NEW
cmrdeyp8k0053mn01834uuhfb	cmrdeyp8h0051mn016j9okb8e	cmp6vndph004yp401vluusox7	cmqrxkdg5000xo701l23j4vxw	2026-06-23	2026-07-09 11:18:47.108	ADMIN_HISTORICAL:NEW
cmrdeyzz20057mn016vbfxz77	cmrdeyzz00055mn013pess7v0	cmp6maci6002tp40119cnxlu3	cmqrxkdg5000xo701l23j4vxw	2026-06-23	2026-07-09 11:19:01.022	ADMIN_HISTORICAL:NEW
cmrdf0xcc005bmn01hx9iq0h8	cmrdf0xcb0059mn017xk7t8e0	cmpxtfc9z00k2p401mfev8i51	cmqrxkzog000zo7018edaiz42	2026-06-23	2026-07-09 11:20:30.925	ADMIN_HISTORICAL:NEW
cmrdf1b91005fmn01cevxb1ym	cmrdf1b8z005dmn01j0002hib	cmpxths4t00k7p401ms2nx4f0	cmqrxkzog000zo7018edaiz42	2026-06-23	2026-07-09 11:20:48.949	ADMIN_HISTORICAL:NEW
cmrdf1ta3005jmn01k4in8exq	cmrdf1ta0005hmn01qjl6db2m	cmqno5z2j00dlod0156ophlux	cmqrxkzog000zo7018edaiz42	2026-06-23	2026-07-09 11:21:12.315	ADMIN_HISTORICAL:NEW
cmrdf2kv0005nmn01vxetggge	cmrdf2kux005lmn015kd1gg7s	cmp88f7g90073p401w4uw4pqs	cmqrxkzog000zo7018edaiz42	2026-06-23	2026-07-09 11:21:48.06	ADMIN_HISTORICAL:NEW
cmrdf3q9f005rmn01h1i1xs8y	cmrdf3q9d005pmn015bwcflg5	cmqpbpjdd001llk01e8vm535o	cmqrxqib6001bo701148h63ce	2026-06-24	2026-07-09 11:22:41.715	ADMIN_HISTORICAL:NEW
cmrdf4059005vmn01czozr6b3	cmrdf4058005tmn01tibkj6iv	cmqpbrpkn001slk01gekkfisb	cmqrxqib6001bo701148h63ce	2026-06-24	2026-07-09 11:22:54.526	ADMIN_HISTORICAL:NEW
cmrdf4493005zmn01t9gex5ow	cmrdf4491005xmn01njvqeksu	cmqpbt84l001zlk01r9quitpi	cmqrxqib6001bo701148h63ce	2026-06-24	2026-07-09 11:22:59.847	ADMIN_HISTORICAL:NEW
cmrdf4a8z0063mn01ojyqh16t	cmrdf4a8x0061mn01m2hyk4s6	cmp6n9pyb0047p401exgskztu	cmqrxqib6001bo701148h63ce	2026-06-24	2026-07-09 11:23:07.619	ADMIN_HISTORICAL:NEW
cmrdf4kap0067mn0160vajp87	cmrdf4kan0065mn01rzmzvu8h	cmpuxyh5x00itp401pqas19s7	cmqrxqib6001bo701148h63ce	2026-06-24	2026-07-09 11:23:20.641	ADMIN_HISTORICAL:NEW
cmrdf53w4006bmn010esnpwoy	cmrdf53w30069mn01s7124fsv	cmqnjvfwv00clod01smhvf5v7	cmqrxr3ki001do701db3c865w	2026-06-24	2026-07-09 11:23:46.036	ADMIN_HISTORICAL:NEW
cmrdf5djf006fmn010843qikb	cmrdf5dje006dmn01l3rh0ewb	cmqnjmmn900ceod01dz6unzwp	cmqrxr3ki001do701db3c865w	2026-06-24	2026-07-09 11:23:58.539	ADMIN_HISTORICAL:NEW
cmrdf6zzn006jmn01uayfe9a4	cmrdf6zzm006hmn019473xi6o	cmqw8ilsb001emg0158v8etes	cmqrxr3ki001do701db3c865w	2026-06-24	2026-07-09 11:25:14.292	ADMIN_HISTORICAL:NEW
cmrdf77c8006nmn012cqfqxj6	cmrdf77c6006lmn018jturbg5	cmqw8ha3o0017mg010cohkf7t	cmqrxr3ki001do701db3c865w	2026-06-24	2026-07-09 11:25:23.816	ADMIN_HISTORICAL:NEW
cmrdf7kj5006rmn01cadih6ni	cmrdf7kj4006pmn01b8ilrst0	cmpxtdnho00jxp401mtude4xv	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	2026-07-09 11:25:40.914	ADMIN_HISTORICAL:NEW
cmrdf7t59006vmn010lf9hynr	cmrdf7t57006tmn0111vi40iw	cmqz4ky2t003fmg011oeykh0h	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	2026-07-09 11:25:52.078	ADMIN_HISTORICAL:NEW
cmrdf8foa006zmn01cwirwofn	cmrdf8fo8006xmn0167tjpn29	cmpqvd4pp00hkp401fok0cwt8	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	2026-07-09 11:26:21.275	ADMIN_HISTORICAL:NEW
cmrdf8p4o0073mn01tal0y982	cmrdf8p4n0071mn01tc3iwzc1	cmp88f7g90073p401w4uw4pqs	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	2026-07-09 11:26:33.529	ADMIN_HISTORICAL:NEW
cmrdf92nq0077mn01aimsy70e	cmrdf92no0075mn01yqukxocs	cmpxt9h9d00jnp401acy1ppf1	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	2026-07-09 11:26:51.062	ADMIN_HISTORICAL:NEW
cmrdf9z60007bmn01kqrgm4wl	cmrdf9z5y0079mn01n5qwxk7a	cmps12dpz00hvp401tesxyqev	cmqrxvfno001lo7017g5c5k6u	2026-06-25	2026-07-09 11:27:33.192	ADMIN_HISTORICAL:NEW
cmrdfaifp007fmn017dk052m7	cmrdfaifo007dmn01bvq3132l	cmpazudle00byp401oz4zx3e1	cmqrxw40y001no701f545v9bq	2026-06-25	2026-07-09 11:27:58.165	ADMIN_HISTORICAL:NEW
cmrdfamzz007jmn01nu2wwhg6	cmrdfamzx007hmn01hib53k1c	cmpb26l0900ccp4014tau0gjw	cmqrxw40y001no701f545v9bq	2026-06-25	2026-07-09 11:28:04.079	ADMIN_HISTORICAL:NEW
cmrdfat0a007nmn01o5pd519b	cmrdfat09007lmn01vxbmzjbc	cmp87ym20006yp401590xadl0	cmqrxw40y001no701f545v9bq	2026-06-25	2026-07-09 11:28:11.866	ADMIN_HISTORICAL:NEW
cmrdfazkh007rmn01hcyxl23m	cmrdfazkg007pmn014atg7jf8	cmp6n0r9g003sp401svwhqzjy	cmqrxw40y001no701f545v9bq	2026-06-25	2026-07-09 11:28:20.37	ADMIN_HISTORICAL:NEW
cmrdfbay0007vmn0158ae15kp	cmrdfbaxz007tmn012hbrv25e	cmpya6nur00kgp401et6xel9m	cmqrxw40y001no701f545v9bq	2026-06-25	2026-07-09 11:28:35.113	ADMIN_HISTORICAL:NEW
cmrdfd83f0081mn01hlreqz37	cmrdfd83d007zmn01dw06ysok	cmp80zids006np4015qmgm2k4	cmrdfci8z007xmn0106ezpk45	2026-06-25	2026-07-09 11:30:04.731	ADMIN_HISTORICAL:NEW
cmrdfdcxg0085mn01z4s5umn7	cmrdfdcxf0083mn01q7nflpkt	cmp9p95jj00b2p401dqlrtohp	cmrdfci8z007xmn0106ezpk45	2026-06-25	2026-07-09 11:30:10.996	ADMIN_HISTORICAL:NEW
cmrdfdil70089mn01tn8ez3iv	cmrdfdil50087mn010eg89vom	cmp9pbn9j00b7p401wd3w8sn0	cmrdfci8z007xmn0106ezpk45	2026-06-25	2026-07-09 11:30:18.332	ADMIN_HISTORICAL:NEW
cmrdfdoik008dmn01szvwme11	cmrdfdoij008bmn01w2zc04kp	cmpwo5qcf00jgp401y23i6i2r	cmrdfci8z007xmn0106ezpk45	2026-06-25	2026-07-09 11:30:26.013	ADMIN_HISTORICAL:NEW
cmrdfdu7i008hmn01nqm80y2w	cmrdfdu7h008fmn01bg62kmvj	cmpuxlbuw00ijp4016pmesm29	cmrdfci8z007xmn0106ezpk45	2026-06-25	2026-07-09 11:30:33.391	ADMIN_HISTORICAL:NEW
cmrdff6n5008lmn0131oqfp4x	cmrdff6n3008jmn0197vmmde2	cmp5dd5sd0074l401pv3drst8	cmqv0naxk000dmg01pk0odf1y	2026-06-25	2026-07-09 11:31:36.161	ADMIN_HISTORICAL:NEW
cmrdffc93008pmn01bigjv4uc	cmrdffc91008nmn01aingetay	cmp6mxgtj003np401n6d3md2o	cmqv0naxk000dmg01pk0odf1y	2026-06-25	2026-07-09 11:31:43.431	ADMIN_HISTORICAL:NEW
cmrdffid0008tmn01p3rhh0td	cmrdfficz008rmn01vodkk4bf	cmqf2b3z80007wmtsodeuow25	cmqv0naxk000dmg01pk0odf1y	2026-06-25	2026-07-09 11:31:51.348	ADMIN_HISTORICAL:NEW
cmrdfg0i1008xmn01obpfp5hl	cmrdfg0i0008vmn01o35icwnw	cmph5kmv300f7p401b8x8jouu	cmqsaebh500h1o7013z9alk6c	2026-06-26	2026-07-09 11:32:14.857	ADMIN_HISTORICAL:NEW
cmrdfh7fb0091mn01dqzfwz47	cmrdfh7fa008zmn017dh6nyx4	cmqqifegn000gp901x4b3a61j	cmqsaebh500h1o7013z9alk6c	2026-06-26	2026-07-09 11:33:10.488	ADMIN_HISTORICAL:NEW
cmrdfk0kp0095mn01n714s4mg	cmrdfk0km0093mn01zkjnbbol	cmpxths4t00k7p401ms2nx4f0	cmqsafbyg00h3o701hho6wtxz	2026-06-26	2026-07-09 11:35:21.578	ADMIN_HISTORICAL:NEW
cmrdfl9lt0099mn011uanrnfg	cmrdfl9ls0097mn0156in0w5d	cmqqimbo30011p9015ihys621	cmqsafbyg00h3o701hho6wtxz	2026-06-26	2026-07-09 11:36:19.938	ADMIN_HISTORICAL:NEW
cmrdflx4u009dmn01eus21f44	cmrdflx4t009bmn01yzc0qh85	cmqno5z2j00dlod0156ophlux	cmqsag6pq00h5o7014men1p68	2026-06-26	2026-07-09 11:36:50.43	ADMIN_HISTORICAL:NEW
cmrdfm3ki009hmn01bhwfeuo6	cmrdfm3kg009fmn01hymyh0ed	cmpqvd4pp00hkp401fok0cwt8	cmqsag6pq00h5o7014men1p68	2026-06-26	2026-07-09 11:36:58.77	ADMIN_HISTORICAL:NEW
cmrdfnky4009lmn01qe00l7zm	cmrdfnky3009jmn01h6dwanu3	cmqf2b40z000jwmtsglaha6m4	cmqsag6pq00h5o7014men1p68	2026-06-26	2026-07-09 11:38:07.949	ADMIN_HISTORICAL:NEW
cmrdfnxon009pmn01acbyqmyi	cmrdfnxol009nmn01gs3tyq5n	cmqf2b41m000pwmtsgzlybd2p	cmqsag6pq00h5o7014men1p68	2026-06-26	2026-07-09 11:38:24.455	ADMIN_HISTORICAL:NEW
cmrdfwko8009xmn01xjvq7vir	cmrdfwko6009vmn01ybm0nxdq	cmqnnz1kg00d8od0103g8czza	cmqzavffl003rmg01jh06614o	2026-06-29	2026-07-09 11:45:07.496	ADMIN_HISTORICAL:NEW
cmrdfx0va00a1mn01dis8ib97	cmrdfx0v9009zmn013jkf7jsa	cmqz4i19x0038mg01irua66ou	cmqzavv4x003tmg01emqe1sxn	2026-06-29	2026-07-09 11:45:28.487	ADMIN_HISTORICAL:NEW
cmrdfy6x000a5mn01dz74re04	cmrdfy6wy00a3mn01s6gvrmp1	cmqqimbo30011p9015ihys621	cmqzaxoid003zmg01n5umqrul	2026-06-29	2026-07-09 11:46:22.98	ADMIN_HISTORICAL:NEW
cmrdfyc7j00a9mn01e1l0sot8	cmrdfyc7h00a7mn011hn8gvzp	cmps12dpz00hvp401tesxyqev	cmqzaxoid003zmg01n5umqrul	2026-06-29	2026-07-09 11:46:29.839	ADMIN_HISTORICAL:NEW
cmrdfz0x600admn01y3oz64fz	cmrdfz0x500abmn01b9drjck4	cmqw8ec6p0010mg01ce7hdn33	cmqzaybih0041mg01964d2791	2026-06-29	2026-07-09 11:47:01.866	ADMIN_HISTORICAL:NEW
cmrdfzsi800ahmn01n016cmdx	cmrdfzsi500afmn01wmx2fwwi	cmqzcgki3006umg01b9522uso	cmqzb4q3d0045mg013g2z9beb	2026-06-30	2026-07-09 11:47:37.616	ADMIN_HISTORICAL:NEW
cmrdg0yyj00almn01btd237i3	cmrdg0yyh00ajmn01qumpv84e	cmqno5z2j00dlod0156ophlux	cmqzb5nyr0047mg01plloupsf	2026-06-30	2026-07-09 11:48:32.636	ADMIN_HISTORICAL:NEW
cmrdg17gl00apmn01v03rpgxu	cmrdg17gk00anmn01016y7ywm	cmqnlovfk00czod0169336zw1	cmqzb5nyr0047mg01plloupsf	2026-06-30	2026-07-09 11:48:43.653	ADMIN_HISTORICAL:NEW
cmrdg1eqi00atmn0124a3vxx9	cmrdg1eqh00armn01fqlce0uc	cmp6me3mt002yp401esc9ykn5	cmqzb5nyr0047mg01plloupsf	2026-06-30	2026-07-09 11:48:53.082	ADMIN_HISTORICAL:NEW
cmrdg1ko300axmn016hpfuicr	cmrdg1ko200avmn011fv28kgw	cmqpbpjdd001llk01e8vm535o	cmqzb5nyr0047mg01plloupsf	2026-06-30	2026-07-09 11:49:00.772	ADMIN_HISTORICAL:NEW
cmrdg1ugh00b1mn019697pb4e	cmrdg1ugg00azmn01f3dxxvc7	cmqpbt84l001zlk01r9quitpi	cmqzb5nyr0047mg01plloupsf	2026-06-30	2026-07-09 11:49:13.458	ADMIN_HISTORICAL:NEW
cmrdg2a7j00b5mn01swunip6s	cmrdg2a7h00b3mn01ia4j7a27	cmpazudle00byp401oz4zx3e1	cmqzb68lc0049mg01yfgjbky0	2026-06-30	2026-07-09 11:49:33.871	ADMIN_HISTORICAL:NEW
cmrdg2g1900b9mn01chkvz6ie	cmrdg2g1800b7mn0196d89898	cmp5i45nq000ap401mr5kujgq	cmqzb68lc0049mg01yfgjbky0	2026-06-30	2026-07-09 11:49:41.421	ADMIN_HISTORICAL:NEW
cmrdg2mie00bdmn01qruons9l	cmrdg2mid00bbmn01qhd26aj7	cmpb26l0900ccp4014tau0gjw	cmqzb68lc0049mg01yfgjbky0	2026-06-30	2026-07-09 11:49:49.815	ADMIN_HISTORICAL:NEW
cmrdg3ci400bhmn01smcdndt6	cmrdg3ci300bfmn01xsiqeba3	cmqw8ilsb001emg0158v8etes	cmqzb7ybi004bmg010yvyjm53	2026-06-30	2026-07-09 11:50:23.501	ADMIN_HISTORICAL:NEW
cmrdg3hk400blmn01fz3x3xph	cmrdg3hk300bjmn01rqwj1eyd	cmqw8ha3o0017mg010cohkf7t	cmqzb7ybi004bmg010yvyjm53	2026-06-30	2026-07-09 11:50:30.052	ADMIN_HISTORICAL:NEW
cmrdg3o9u00bpmn01t59dpg3w	cmrdg3o9s00bnmn01k4f0qhi2	cmpuxlbuw00ijp4016pmesm29	cmqzb7ybi004bmg010yvyjm53	2026-06-30	2026-07-09 11:50:38.754	ADMIN_HISTORICAL:NEW
cmrdg4lmd00btmn012m0g5egb	cmrdg4lmb00brmn01cwa2bqjw	cmpuxbc7900i9p401d4rkyuom	cmqzb8v2z004dmg01zbaatlac	2026-06-30	2026-07-09 11:51:21.973	ADMIN_HISTORICAL:NEW
cmrdg54lu00c1mn01fp1m4po0	cmrdg54lt00bzmn0154y0fkxu	cmr1tvvf8001fmm01nvgjy6v9	cmqzb8v2z004dmg01zbaatlac	2026-06-30	2026-07-09 11:51:46.578	ADMIN_HISTORICAL:NEW
cmrdg5a6b00c5mn01d6ik140s	cmrdg5a6a00c3mn01opmz2zf9	cmqf2b3xg0001wmtsjmoqct8a	cmqzb8v2z004dmg01zbaatlac	2026-06-30	2026-07-09 11:51:53.795	ADMIN_HISTORICAL:NEW
cmrdg5r6900c9mn01jud24bch	cmrdg5r6800c7mn01s6byo1cz	cmp5dd5sd0074l401pv3drst8	cmqzb9g51004fmg014z0v1i91	2026-06-30	2026-07-09 11:52:15.826	ADMIN_HISTORICAL:NEW
cmrdg5ww100cdmn01bw5bh55n	cmrdg5wvz00cbmn01h85w5zdb	cmp88f7g90073p401w4uw4pqs	cmqzb9g51004fmg014z0v1i91	2026-06-30	2026-07-09 11:52:23.234	ADMIN_HISTORICAL:NEW
cmrdg9gv400chmn01tsq0dr03	cmrdg9gv100cfmn01rnkk3ew3	cmpqvd4pp00hkp401fok0cwt8	cmqzba3hr004hmg01l9mur8kl	2026-06-30	2026-07-09 11:55:09.088	ADMIN_HISTORICAL:NEW
cmrdg9m5k00clmn0179psvxoe	cmrdg9m5j00cjmn01xyna3c96	cmqz4ky2t003fmg011oeykh0h	cmqzba3hr004hmg01l9mur8kl	2026-06-30	2026-07-09 11:55:15.945	ADMIN_HISTORICAL:NEW
cmrdga4rb00cpmn01zcme035x	cmrdga4ra00cnmn01hxgo6lzb	cmqw8ilsb001emg0158v8etes	cmqzbbxfq004lmg01ab9yig6w	2026-07-01	2026-07-09 11:55:40.056	ADMIN_HISTORICAL:NEW
cmrdgaaiu00ctmn01dndynm64	cmrdgaais00crmn01wuc8t1us	cmqw8ha3o0017mg010cohkf7t	cmqzbbxfq004lmg01ab9yig6w	2026-07-01	2026-07-09 11:55:47.526	ADMIN_HISTORICAL:NEW
cmrdgaqgs00cxmn01srv0npjg	cmrdgaqgr00cvmn01k77cco0b	cmpv004tl00iyp4017n7rkxr5	cmqzbgr3k004nmg01j97fznwu	2026-07-01	2026-07-09 11:56:08.189	ADMIN_HISTORICAL:NEW
cmrdgavfl00d1mn014n57lwjl	cmrdgavfk00czmn01kbfx2d7j	cmp6n0r9g003sp401svwhqzjy	cmqzbgr3k004nmg01j97fznwu	2026-07-01	2026-07-09 11:56:14.626	ADMIN_HISTORICAL:NEW
cmrdgcnlo00d5mn01untg36pl	cmrdgcnln00d3mn01xlid3dee	cmr3dc13z008mmm01r1xcp8qr	cmqzbmdo40053mg01fabbc3zu	2026-07-02	2026-07-09 11:57:37.788	ADMIN_HISTORICAL:NEW
cmrdgctjr00d9mn01o94hu1y6	cmrdgctjq00d7mn01asv4f3w3	cmqpbpjdd001llk01e8vm535o	cmqzbmdo40053mg01fabbc3zu	2026-07-02	2026-07-09 11:57:45.495	ADMIN_HISTORICAL:NEW
cmrdge5q300ddmn01apc2gwzx	cmrdge5q100dbmn01t34k3lv5	cmp9l6t2c00acp4018v82zolp	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	2026-07-09 11:58:47.932	ADMIN_HISTORICAL:NEW
cmrdgeb6e00dhmn0152cqawug	cmrdgeb6d00dfmn0151y7nwe4	cmqnlovfk00czod0169336zw1	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	2026-07-09 11:58:54.999	ADMIN_HISTORICAL:NEW
cmrdgej8m00dlmn01c9ahduok	cmrdgej8k00djmn01yyl2rywv	cmpv004tl00iyp4017n7rkxr5	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	2026-07-09 11:59:05.446	ADMIN_HISTORICAL:NEW
cmrdgese800dpmn01phg89v45	cmrdgese600dnmn01yth5e2o8	cmqno5z2j00dlod0156ophlux	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	2026-07-09 11:59:17.312	ADMIN_HISTORICAL:NEW
cmrdgeznq00dtmn01137hz04k	cmrdgeznp00drmn01odkspjxj	cmr3dc13z008mmm01r1xcp8qr	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	2026-07-09 11:59:26.726	ADMIN_HISTORICAL:NEW
cmrdgf54000dxmn01rg0clbro	cmrdgf53z00dvmn01bchza0ob	cmpb26l0900ccp4014tau0gjw	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	2026-07-09 11:59:33.793	ADMIN_HISTORICAL:NEW
cmrdgfqcq00e1mn01t47qb3w6	cmrdgfqcp00dzmn01tjs9lwpw	cmp5e2po6007el401m0wr4bxe	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	2026-07-09 12:00:01.322	ADMIN_HISTORICAL:NEW
cmrdgfwdo00e5mn01xcf9ud24	cmrdgfwdm00e3mn01zupbgysc	cmp6me3mt002yp401esc9ykn5	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	2026-07-09 12:00:09.132	ADMIN_HISTORICAL:NEW
cmrdggodh00e9mn01xk90sj55	cmrdggodf00e7mn01lr9dkvxs	cmp5d9vn5006zl401fo5j5q04	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	2026-07-09 12:00:45.413	ADMIN_HISTORICAL:NEW
cmrdgrhtv00edmn01f9s41rwi	cmrdgrhtr00ebmn01pij2x2je	cmqqimbo30011p9015ihys621	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	2026-07-09 12:09:10.147	ADMIN_HISTORICAL:NEW
cmrdgrouf00ehmn01ncblzk4g	cmrdgroud00efmn01s9b5n9ga	cmr1tvvf8001fmm01nvgjy6v9	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	2026-07-09 12:09:19.24	ADMIN_HISTORICAL:NEW
cmrdgs5z900elmn010ftbqkkg	cmrdgs5z700ejmn016o47qedh	cmp88f7g90073p401w4uw4pqs	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	2026-07-09 12:09:41.445	ADMIN_HISTORICAL:NEW
cmrdgsl1p00epmn01h3m7wmwz	cmrdgsl1o00enmn01poozho9g	cmqw8ec6p0010mg01ce7hdn33	cmqzbjt8e004vmg013phelgz0	2026-07-01	2026-07-09 12:10:00.973	ADMIN_HISTORICAL:NEW
cmrdgt15b00etmn01r2z0rg5e	cmrdgt15a00ermn012mbwdzn8	cmqnjvfwv00clod01smhvf5v7	cmqzbjt8e004vmg013phelgz0	2026-07-01	2026-07-09 12:10:21.84	ADMIN_HISTORICAL:NEW
cmrdgt6ho00exmn016umykued	cmrdgt6hn00evmn01ojcrd9wu	cmqnjmmn900ceod01dz6unzwp	cmqzbjt8e004vmg013phelgz0	2026-07-01	2026-07-09 12:10:28.765	ADMIN_HISTORICAL:NEW
cmrdgtceu00f1mn0184x3cbai	cmrdgtcet00ezmn019l175k9p	cmqnjhe4500c7od01xunmmhyz	cmqzbjt8e004vmg013phelgz0	2026-07-01	2026-07-09 12:10:36.438	ADMIN_HISTORICAL:NEW
cmrdgu3sx00f5mn015otf7g9v	cmrdgu3sv00f3mn01l9bjqd0o	cmr3dno9x008vmm01yn5zbnx3	cmqzbjt8e004vmg013phelgz0	2026-07-01	2026-07-09 12:11:11.937	ADMIN_HISTORICAL:NEW
cmrdgzrht00ffmn01ot4e1xra	cmrdgzrhq00fdmn01u4s8qnxk	cmqpbrpkn001slk01gekkfisb	cmqzbknbz004xmg01m9lpevgu	2026-07-01	2026-07-09 12:15:35.922	ADMIN_HISTORICAL:NEW
cmrdh000e00fjmn01b1u7w6s6	cmrdh000c00fhmn01wjsol8lm	cmqpbt84l001zlk01r9quitpi	cmqzbknbz004xmg01m9lpevgu	2026-07-01	2026-07-09 12:15:46.958	ADMIN_HISTORICAL:NEW
cmrdh07ck00fnmn01uagk8frs	cmrdh07cj00flmn01wbll8lij	cmp6mxgtj003np401n6d3md2o	cmqzbknbz004xmg01m9lpevgu	2026-07-01	2026-07-09 12:15:56.469	ADMIN_HISTORICAL:NEW
cmrdh0dvw00frmn01tg9ewapf	cmrdh0dvu00fpmn01ww3nimu1	cmr3dc13z008mmm01r1xcp8qr	cmqzbknbz004xmg01m9lpevgu	2026-07-01	2026-07-09 12:16:04.94	ADMIN_HISTORICAL:NEW
cmrdh1qah00fzmn01ubs32x9l	cmrdh1qaf00fxmn01r574yca6	cmpqvd4pp00hkp401fok0cwt8	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	2026-07-09 12:17:07.673	ADMIN_HISTORICAL:NEW
cmrdh1ufv00g3mn01709kjivx	cmrdh1ufu00g1mn01mp1x0uth	cmp5qutpd0015p401e0b83fu9	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	2026-07-09 12:17:13.051	ADMIN_HISTORICAL:NEW
cmrdh1yf000g7mn01i1fcl05m	cmrdh1yey00g5mn0165slga9n	cmp5qzr8e001ap401fa4uuzw4	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	2026-07-09 12:17:18.204	ADMIN_HISTORICAL:NEW
cmrdh24ft00gbmn01oyofl0ho	cmrdh24fs00g9mn011j5lmro5	cmp9n16yg00aqp401yfgd8zit	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	2026-07-09 12:17:26.009	ADMIN_HISTORICAL:NEW
cmrdh2vpi00gfmn015lb6pf1n	cmrdh2vph00gdmn01cgiv13vi	cmp9muoo600alp401b1jj91hv	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	2026-07-09 12:18:01.351	ADMIN_HISTORICAL:NEW
cmrdh9ksl00gjmn013o4f7obn	cmrdh9ksj00ghmn01h6dwbazq	cmqf2b40z000jwmtsglaha6m4	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	2026-07-09 12:23:13.797	ADMIN_HISTORICAL:NEW
cmrdh9p7400gnmn01b7gv2qso	cmrdh9p7300glmn018paljnei	cmps12dpz00hvp401tesxyqev	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	2026-07-09 12:23:19.504	ADMIN_HISTORICAL:NEW
cmrdh9tkh00grmn01qdyljz9b	cmrdh9tkg00gpmn01rmqfgpzx	cmqz4ky2t003fmg011oeykh0h	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	2026-07-09 12:23:25.17	ADMIN_HISTORICAL:NEW
cmrdh9ys700gvmn01iu3zstz5	cmrdh9ys500gtmn01vkqusg82	cmr66x4vm00aumm01n1n9q5b4	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	2026-07-09 12:23:31.927	ADMIN_HISTORICAL:NEW
cmrdhaf0z00gzmn01h2cx74j0	cmrdhaf0y00gxmn01cq264r72	cmpazudle00byp401oz4zx3e1	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	2026-07-09 12:23:52.98	ADMIN_HISTORICAL:NEW
cmrdhali400h3mn01givtdved	cmrdhali300h1mn01xz5mav1c	cmpya6nur00kgp401et6xel9m	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	2026-07-09 12:24:01.373	ADMIN_HISTORICAL:NEW
cmrdhbgk200h7mn01rxg8flxy	cmrdhbgk000h5mn01zl11e5v2	cmqnjhe4500c7od01xunmmhyz	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	2026-07-09 12:24:41.618	ADMIN_HISTORICAL:NEW
cmrdhbn9300hbmn01sjy3p3eh	cmrdhbn9100h9mn01v2ztqfd7	cmp87ym20006yp401590xadl0	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	2026-07-09 12:24:50.295	ADMIN_HISTORICAL:NEW
cmrdhialx00hfmn01t0twtmbe	cmrdhialv00hdmn01zuaa47fj	cmp80zids006np4015qmgm2k4	cmqzbp13s005bmg01hey1nfx7	2026-07-02	2026-07-09 12:30:00.502	ADMIN_HISTORICAL:NEW
cmrdhiiib00hjmn01og8b1bpd	cmrdhiiia00hhmn01x6oh2uu7	cmpwo5qcf00jgp401y23i6i2r	cmqzbp13s005bmg01hey1nfx7	2026-07-02	2026-07-09 12:30:10.74	ADMIN_HISTORICAL:NEW
cmrdhimlk00hnmn01udmzsimk	cmrdhimli00hlmn013mhgg520	cmp9pbn9j00b7p401wd3w8sn0	cmqzbp13s005bmg01hey1nfx7	2026-07-02	2026-07-09 12:30:16.04	ADMIN_HISTORICAL:NEW
cmrdhiuj800hrmn01kyniv5et	cmrdhiuj700hpmn015w9a0nil	cmp9p95jj00b2p401dqlrtohp	cmqzbp13s005bmg01hey1nfx7	2026-07-02	2026-07-09 12:30:26.324	ADMIN_HISTORICAL:NEW
cmrdhj1yv00hvmn01pfkfvspi	cmrdhj1yt00htmn01vcvqhd3e	cmpuxbc7900i9p401d4rkyuom	cmqzbp13s005bmg01hey1nfx7	2026-07-02	2026-07-09 12:30:35.96	ADMIN_HISTORICAL:NEW
cmrdhj6r300hzmn01qktvk0sg	cmrdhj6r200hxmn01ruzcrfyg	cmpuxlbuw00ijp4016pmesm29	cmqzbp13s005bmg01hey1nfx7	2026-07-02	2026-07-09 12:30:42.16	ADMIN_HISTORICAL:NEW
cmrdhjjn000i3mn01opy6hrf1	cmrdhjjmz00i1mn01sht2o364	cmpmhc40500h9p40180sb0edr	cmqzbpi8v005dmg01abdadn4r	2026-07-02	2026-07-09 12:30:58.861	ADMIN_HISTORICAL:NEW
cmrdhjqm300i7mn01omf1tmg7	cmrdhjqm200i5mn01kyvn5utc	cmp6mxgtj003np401n6d3md2o	cmqzbpi8v005dmg01abdadn4r	2026-07-02	2026-07-09 12:31:07.899	ADMIN_HISTORICAL:NEW
cmrdhllgt00idmn01vnv7m88b	cmrdhllgq00ibmn01110shzb0	cmqw8ilsb001emg0158v8etes	cmqzbsw1n005nmg01p1ci3ppa	2026-07-03	2026-07-09 12:32:34.541	ADMIN_HISTORICAL:NEW
cmrdhlq0600ihmn01ggo1u5z7	cmrdhlq0400ifmn01p6nhm1gs	cmqw8ha3o0017mg010cohkf7t	cmqzbsw1n005nmg01p1ci3ppa	2026-07-03	2026-07-09 12:32:40.422	ADMIN_HISTORICAL:NEW
cmrdhm2jv00ilmn01yat3vupy	cmrdhm2jt00ijmn01wdal33e4	cmp6vndph004yp401vluusox7	cmqzbtc06005pmg01s13z6jmi	2026-07-03	2026-07-09 12:32:56.683	ADMIN_HISTORICAL:NEW
cmrdhm8gs00ipmn01c6z0kz5i	cmrdhm8gq00inmn018xtstzxb	cmp6maci6002tp40119cnxlu3	cmqzbtc06005pmg01s13z6jmi	2026-07-03	2026-07-09 12:33:04.348	ADMIN_HISTORICAL:NEW
cmrdhnypw00itmn01cyitmuti	cmrdhnypv00irmn011hkdbv0q	cmpuxyh5x00itp401pqas19s7	cmqzbttac005rmg01g4u63y8s	2026-07-03	2026-07-09 12:34:25.029	ADMIN_HISTORICAL:NEW
cmrdhpj9000ixmn01uj9cljso	cmrdhpj8z00ivmn01ppelwl3y	cmr66x4vm00aumm01n1n9q5b4	cmqzbvm2w005xmg01sausgthh	2026-07-04	2026-07-09 12:35:38.292	ADMIN_HISTORICAL:NEW
cmrdhppgs00j1mn018c0ssb1p	cmrdhppgr00izmn01lgrjcc2s	cmr54gw0r009omm01n0aos5l6	cmqzbvm2w005xmg01sausgthh	2026-07-04	2026-07-09 12:35:46.349	ADMIN_HISTORICAL:NEW
cmrdhqcwq00j5mn01kfv6415b	cmrdhqcwo00j3mn01emlff9pg	cmr3dc13z008mmm01r1xcp8qr	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	2026-07-09 12:36:16.73	ADMIN_HISTORICAL:NEW
cmrdhqryv00j9mn01hzozjjy2	cmrdhqrys00j7mn0193pj1061	cmqpbpjdd001llk01e8vm535o	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	2026-07-09 12:36:36.248	ADMIN_HISTORICAL:NEW
cmrdhr2wu00jdmn01j21rxjvd	cmrdhr2wt00jbmn01k899q38g	cmr6940rg00bemm01s11l95mw	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	2026-07-09 12:36:50.43	ADMIN_HISTORICAL:NEW
cmrdhsd9500jhmn01s124zqx6	cmrdhsd9300jfmn0154zbixhg	cmp5d9vn5006zl401fo5j5q04	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	2026-07-09 12:37:50.489	ADMIN_HISTORICAL:NEW
cmrdht97a00jlmn01hq62qetp	cmrdht97800jjmn01lblxs76i	cmpuxbc7900i9p401d4rkyuom	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	2026-07-09 12:38:31.894	ADMIN_HISTORICAL:NEW
cmrdhtokj00jpmn01hmmlaktt	cmrdhtokh00jnmn015vyw6zye	cmr91dvvk00ddmm01yvoi91dd	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	2026-07-09 12:38:51.812	ADMIN_HISTORICAL:NEW
cmrdhttyv00jtmn0195vqc8me	cmrdhttyu00jrmn0185e67s3t	cmqf2b405000dwmtsddcf7agj	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	2026-07-09 12:38:58.808	ADMIN_HISTORICAL:NEW
cmrdhtypd00jxmn0103n4juzn	cmrdhtypc00jvmn01gmv6vqk6	cmp6me3mt002yp401esc9ykn5	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	2026-07-09 12:39:04.946	ADMIN_HISTORICAL:NEW
cmrdhu49900k1mn01lwhallvu	cmrdhu49700jzmn018mklvs6a	cmpdskdbb00e0p401bi55y2g7	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	2026-07-09 12:39:12.141	ADMIN_HISTORICAL:NEW
cmrdhugpa00k5mn01macgrapa	cmrdhugp900k3mn01ovoz5li6	cmpazudle00byp401oz4zx3e1	cmqzbxamw0063mg01z3g0846i	2026-07-05	2026-07-09 12:39:28.271	ADMIN_HISTORICAL:NEW
cmrdhv7pi00k9mn01uofavr5k	cmrdhv7ph00k7mn01f0r4an12	cmp9jyb2l009tp4012t706wff	cmqzbxamw0063mg01z3g0846i	2026-07-05	2026-07-09 12:40:03.27	ADMIN_HISTORICAL:NEW
cmrdhvkl700kdmn01v7jbnf61	cmrdhvkl500kbmn01nt86f9jf	cmpazudle00byp401oz4zx3e1	cmqzbxre80065mg01ewd495p6	2026-07-05	2026-07-09 12:40:19.963	ADMIN_HISTORICAL:NEW
cmrdhvoiz00khmn01sst8hvnx	cmrdhvoix00kfmn01tofkcekb	cmr91oeqe00dvmm012s7it3wq	cmqzbxre80065mg01ewd495p6	2026-07-05	2026-07-09 12:40:25.068	ADMIN_HISTORICAL:NEW
cmriyvcov00oimn012zd3ir0y	cmriyvcos00ogmn01c08kyrqe	cmr92ygsq00e4mm01t2ww4seu	cmr0lf2qk000apn01mmcs724c	2026-07-06	2026-07-13 08:34:54.08	ADMIN_HISTORICAL:NEW
cmriyvigs00ommn01aq9zgubz	cmriyvigq00okmn016dk8prhm	cmr91fzq700dmmm01t48rlkdj	cmr0lf2qk000apn01mmcs724c	2026-07-06	2026-07-13 08:35:01.564	ADMIN_HISTORICAL:NEW
cmriywtbh00owmn01p8mh9246	cmriywtbf00oumn01l1jrpmic	cmr91oeqe00dvmm012s7it3wq	cmr0lf2qt000bpn01sduu8iy3	2026-07-06	2026-07-13 08:36:02.286	ADMIN_HISTORICAL:NEW
cmrj4meey00p2mn01f7689vt7	cmrj4meew00p0mn011do1kw24	cmpuxbc7900i9p401d4rkyuom	cmr0lf2r6000epn01b01vkwpm	2026-07-06	2026-07-13 11:15:54.107	ADMIN_HISTORICAL:NEW
cmrj4mkqj00p6mn014bnltv96	cmrj4mkqh00p4mn01pch2oyns	cmpuxpn4l00iop40156zk6rje	cmr0lf2r6000epn01b01vkwpm	2026-07-06	2026-07-13 11:16:02.299	ADMIN_HISTORICAL:NEW
cmrj4n05w00pamn0196ta0i0o	cmrj4n05u00p8mn01mjv0hud9	cmqqimbo30011p9015ihys621	cmr0lf2r6000epn01b01vkwpm	2026-07-06	2026-07-13 11:16:22.292	ADMIN_HISTORICAL:NEW
cmrj4n5wu00pemn01b1yqlzhc	cmrj4n5wr00pcmn01rnun7tvn	cmps12dpz00hvp401tesxyqev	cmr0lf2r6000epn01b01vkwpm	2026-07-06	2026-07-13 11:16:29.742	ADMIN_HISTORICAL:NEW
cmrj4o3bj00pimn01nhexhbso	cmrj4o3bi00pgmn0197dmjt17	cmqnlllpk00csod01wkefk1ot	cmr0lf2r8000fpn013mz6ywd2	2026-07-06	2026-07-13 11:17:13.04	ADMIN_HISTORICAL:NEW
cmrjbf0o20007qd013xzuyiwq	cmrjbf0nz0005qd01ngakmpc9	cmqrwntpy0016sc0146g80wvq	cmqrxjpuq000vo701sd9wab7y	2026-06-23	2026-07-13 14:26:07.01	ADMIN_HISTORICAL:NEW
cmrkjwgw8001alq0163yma1i5	cmrkjwgw50018lq0185etz99w	cmqno2ywp00dfod01x3mtrdjg	cmqrxkdg5000xo701l23j4vxw	2026-06-23	2026-07-14 11:11:24.296	ADMIN_HISTORICAL:NEW
cmrkjwt7e001elq010r5oea0w	cmrkjwt7d001clq01vklm336n	cmpuxgfvo00iep401kuin241v	cmqrxkdg5000xo701l23j4vxw	2026-06-23	2026-07-14 11:11:40.251	ADMIN_HISTORICAL:NEW
cmrkjx183001ilq01yhsl3g20	cmrkjx182001glq015zx2jh9m	cmpzh61qy00kpp401u52chqfx	cmqrxkzog000zo7018edaiz42	2026-06-23	2026-07-14 11:11:50.644	ADMIN_HISTORICAL:NEW
cmrkjxids001mlq01mefe0sh6	cmrkjxidr001klq01h0sx5pdf	cmqrwntpy0016sc0146g80wvq	cmqrxr3ki001do701db3c865w	2026-06-24	2026-07-14 11:12:12.881	ADMIN_HISTORICAL:NEW
cmrkjy11b001qlq01fil5za1k	cmrkjy11a001olq01u58qcnhq	cmpzh61qy00kpp401u52chqfx	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	2026-07-14 11:12:37.056	ADMIN_HISTORICAL:NEW
cmrkjycyu001ulq01bxjmbdhf	cmrkjycyt001slq01vz9bcv20	cmp6mujhf003ip4019yxl5iri	cmrdfci8z007xmn0106ezpk45	2026-06-25	2026-07-14 11:12:52.519	ADMIN_HISTORICAL:NEW
cmrkjzn07001ylq01mylnwis8	cmrkjzn05001wlq01xvb5963l	cmpuxgfvo00iep401kuin241v	cmqsafbyg00h3o701hho6wtxz	2026-06-26	2026-07-14 11:13:52.184	ADMIN_HISTORICAL:NEW
cmrkjzsxs0022lq01083iz28j	cmrkjzsxr0020lq01390auvh9	cmqno2ywp00dfod01x3mtrdjg	cmqsafbyg00h3o701hho6wtxz	2026-06-26	2026-07-14 11:13:59.872	ADMIN_HISTORICAL:NEW
cmrkk1grq0026lq01kp9m9nxa	cmrkk1grp0024lq0168pt9ya2	cmqf2b42m000vwmtsnd6eu11l	cmqsag6pq00h5o7014men1p68	2026-06-26	2026-07-14 11:15:17.415	ADMIN_HISTORICAL:NEW
cmrkk398n002alq0130kzaeed	cmrkk398m0028lq01sas485ay	cmpuxgfvo00iep401kuin241v	cmqzba3hr004hmg01l9mur8kl	2026-06-30	2026-07-14 11:16:40.967	ADMIN_HISTORICAL:NEW
cmrkk4xfq002elq01bi2ijypl	cmrkk4xfp002clq01isafqktc	cmqf2b42m000vwmtsnd6eu11l	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	2026-07-14 11:17:58.983	ADMIN_HISTORICAL:NEW
cmrkk51h6002ilq010vujd3q1	cmrkk51h4002glq01a316rdyu	cmqrwntpy0016sc0146g80wvq	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	2026-07-14 11:18:04.218	ADMIN_HISTORICAL:NEW
cmrkk5uho002mlq01m3oco76i	cmrkk5uhm002klq01l6ikn1kv	cmp6mujhf003ip4019yxl5iri	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	2026-07-14 11:18:41.821	ADMIN_HISTORICAL:NEW
cmrkk7yek002qlq01q5lq8lys	cmrkk7yej002olq01izrxxl0e	cmpuxgfvo00iep401kuin241v	cmqzbu918005tmg01vn3qffxk	2026-07-03	2026-07-14 11:20:20.204	ADMIN_HISTORICAL:NEW
cmrkk87it002ulq01t807qtph	cmrkk87is002slq01cmlqayu0	cmqf2b42m000vwmtsnd6eu11l	cmqzbu918005tmg01vn3qffxk	2026-07-03	2026-07-14 11:20:32.022	ADMIN_HISTORICAL:NEW
cmrkkdpnv0034lq01d26a08it	cmrkkdpnt0032lq01ammyxbvz	cmqw8njse001zmg010hmpycb7	cmqzbokag0059mg01kwlb280h	2026-07-02	2026-07-14 11:24:48.811	ADMIN_HISTORICAL:NEW
cmrkkgioy003glq011v6ebvr8	cmrkkgiow003elq01b6xx1crv	cmqw8khue001lmg01a483drty	cmqzbokag0059mg01kwlb280h	2026-07-02	2026-07-14 11:26:59.747	ADMIN_HISTORICAL:NEW
cmrkkh5z8003klq0103rfvsp3	cmrkkh5z7003ilq01fbpo39vh	cmqw8njse001zmg010hmpycb7	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	2026-07-14 11:27:29.925	ADMIN_HISTORICAL:NEW
cmrkkjbe8003olq01lnwwb53k	cmrkkjbe6003mlq01jvcjdm97	cmp6mujhf003ip4019yxl5iri	cmqzbxamw0063mg01z3g0846i	2026-07-05	2026-07-14 11:29:10.256	ADMIN_HISTORICAL:NEW
cmrkkr0ng003ylq01g6l4afrn	cmrkkr0nd003wlq01hc9nh213	cmqp4ky050002lk01gx0v2tv9	cmqsag6pq00h5o7014men1p68	2026-06-26	2026-07-14 11:35:09.58	ADMIN_HISTORICAL:NEW
cmrkkx62p0048lq01gwuny5p5	cmrkkx62l0046lq01cjuii88a	cmqp4ky050002lk01gx0v2tv9	cmqzbhbhv004pmg010mnvuaem	2026-07-01	2026-07-14 11:39:56.545	ADMIN_HISTORICAL:NEW
cmrkl2y2m004ilq01r4hcr0q8	cmrkl2y2k004glq012wet6ct9	cmqp4ky050002lk01gx0v2tv9	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	2026-07-14 11:44:26.111	ADMIN_HISTORICAL:NEW
cmrklxm7e004ulq01hv3z5i6c	cmrklxm7a004slq01tin0a4ik	cmqp4ky050002lk01gx0v2tv9	cmr0lf2s6000rpn013e5f88dk	2026-07-08	2026-07-14 12:08:17.066	ADMIN_HISTORICAL:NEW
cmrklzzj20054lq01zpsc3609	cmrklzzj10052lq01sspq3luq	cmqp4ky050002lk01gx0v2tv9	cmr0lf2uy001fpn011bm0do45	2026-07-12	2026-07-14 12:10:07.647	ADMIN_HISTORICAL:NEW
cmrkt1oo0005ulq01icaei9d7	cmrkt1ony005slq01lruokqlz	cmpxtdnho00jxp401mtude4xv	cmqsafbyg00h3o701hho6wtxz	2026-06-26	2026-07-14 15:27:24.192	ADMIN_HISTORICAL:NEW
cmrkt2k9g005ylq019tkpe9jb	cmrkt2k9f005wlq013x6vj5b9	cmpxtfc9z00k2p401mfev8i51	cmqsafbyg00h3o701hho6wtxz	2026-06-26	2026-07-14 15:28:05.14	ADMIN_HISTORICAL:NEW
cmrkt42ek0062lq01pd0v97uv	cmrkt42ei0060lq01vpo2t604	cmpxtfc9z00k2p401mfev8i51	cmqzba3hr004hmg01l9mur8kl	2026-06-30	2026-07-14 15:29:15.308	ADMIN_HISTORICAL:NEW
cmrkt4a7c0066lq01fmvxjk1a	cmrkt4a7a0064lq01n792rnup	cmpxtdnho00jxp401mtude4xv	cmqzba3hr004hmg01l9mur8kl	2026-06-30	2026-07-14 15:29:25.416	ADMIN_HISTORICAL:NEW
cmrkt5a7h006alq01z0qaj50u	cmrkt5a7g0068lq01rgkgewg1	cmpxtdnho00jxp401mtude4xv	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	2026-07-14 15:30:12.077	ADMIN_HISTORICAL:NEW
cmrkt61cf006elq01l9iez4yp	cmrkt61ce006clq0199bttfc6	cmpxtfc9z00k2p401mfev8i51	cmqzbu918005tmg01vn3qffxk	2026-07-03	2026-07-14 15:30:47.248	ADMIN_HISTORICAL:NEW
cmrkt6885006ilq01fxj4c5ob	cmrkt6883006glq0192l52vdm	cmpxtdnho00jxp401mtude4xv	cmqzbu918005tmg01vn3qffxk	2026-07-03	2026-07-14 15:30:56.165	ADMIN_HISTORICAL:NEW
cmrkt77hm006mlq01og9oy6zb	cmrkt77hk006klq012wkqm1ta	cmpuxyh5x00itp401pqas19s7	cmqzbu918005tmg01vn3qffxk	2026-07-03	2026-07-14 15:31:41.866	ADMIN_HISTORICAL:NEW
cmrlvjf97007tlq0111bgjyz6	cmrlvjf95007rlq01waptod7a	cmraefj5300hzmm01gbupayou	cmr0lf2r8000fpn013mz6ywd2	2026-07-06	2026-07-15 09:24:57.212	ADMIN_HISTORICAL:NEW
cmrlvpxoi007xlq01u3aikt8g	cmrlvpxog007vlq01jhotpayg	cmqnlovfk00czod0169336zw1	cmr0lf2rh000ipn01hpostdo9	2026-07-07	2026-07-15 09:30:01.027	ADMIN_HISTORICAL:NEW
cmrlvq37g0081lq0105my6p38	cmrlvq37f007zlq01a7fg55mk	cmp6me3mt002yp401esc9ykn5	cmr0lf2rh000ipn01hpostdo9	2026-07-07	2026-07-15 09:30:08.189	ADMIN_HISTORICAL:NEW
cmrlvqgnd0085lq0125zmodhf	cmrlvqgnc0083lq01335qvttu	cmpazudle00byp401oz4zx3e1	cmr0lf2rj000jpn01fw1phoju	2026-07-07	2026-07-15 09:30:25.61	ADMIN_HISTORICAL:NEW
cmrlvqm3g0089lq019wmotrcv	cmrlvqm3e0087lq01b434aaq4	cmp6mh9mn0033p401xa6v43p7	cmr0lf2rj000jpn01fw1phoju	2026-07-07	2026-07-15 09:30:32.668	ADMIN_HISTORICAL:NEW
cmrlvqqrb008dlq01yitld6wf	cmrlvqqra008blq013sx484b7	cmpb26l0900ccp4014tau0gjw	cmr0lf2rj000jpn01fw1phoju	2026-07-07	2026-07-15 09:30:38.712	ADMIN_HISTORICAL:NEW
cmrlwqx7l008nlq0131pq0g90	cmrlwqx7j008llq017lj0plpj	cmqur9js700juo7015s7s7fwr	cmq9fs5iz0017wmysf6r5tuse	2026-05-22	2026-07-15 09:58:46.689	ADMIN_HISTORICAL:NEW
cmrlwrf5s008rlq01ukgbhzs4	cmrlwrf5q008plq010jhwfnhf	cmqur9js700juo7015s7s7fwr	cmq9hum75001twmyslo2e0ghs	2026-05-25	2026-07-15 09:59:09.952	ADMIN_HISTORICAL:NEW
cmrlwrrjt008vlq01vidzk4kz	cmrlwrrjs008tlq01nh6akue6	cmqur9js700juo7015s7s7fwr	cmq9i9bc8002nwmys7rr8hoqf	2026-05-29	2026-07-15 09:59:26.01	ADMIN_HISTORICAL:NEW
cmrlws63p008zlq019azfoqr7	cmrlws63n008xlq01zpn1fne1	cmqur9js700juo7015s7s7fwr	cmq9ja2de003dwmys3gepgv50	2026-05-31	2026-07-15 09:59:44.869	ADMIN_HISTORICAL:NEW
cmrlwsl120093lq010h0z31q5	cmrlwsl110091lq01cuoauuqz	cmqur9js700juo7015s7s7fwr	cmqmn70we0052od01arz8py2d	2026-06-03	2026-07-15 10:00:04.214	ADMIN_HISTORICAL:NEW
cmrlwt2z30097lq01o1x748hw	cmrlwt2z20095lq0188w3irwh	cmqur9js700juo7015s7s7fwr	cmqmx0whp009cod01f6okjpuy	2026-06-14	2026-07-15 10:00:27.472	ADMIN_HISTORICAL:NEW
cmrlwtioc009blq01bbcpr8b9	cmrlwtiob0099lq01dnz1ia87	cmqur9js700juo7015s7s7fwr	cmqmynapp00aeod01gdldjelr	2026-06-17	2026-07-15 10:00:47.82	ADMIN_HISTORICAL:NEW
cmrlwtveq009flq016oz792sl	cmrlwtveo009dlq01fqy9l4jg	cmqur9js700juo7015s7s7fwr	cmqmzmzi400buod01gtmsi0f1	2026-06-21	2026-07-15 10:01:04.322	ADMIN_HISTORICAL:NEW
cmrlwvqcd009jlq01qhcv280c	cmrlwvqcc009hlq01y07c2tml	cmqur9js700juo7015s7s7fwr	cmqrxm7ii0011o701b63kg6sz	2026-06-24	2026-07-15 10:02:31.069	ADMIN_HISTORICAL:NEW
cmrlwx9bc009nlq01hm9nvjrt	cmrlwx9b9009llq010cd0zrs0	cmqur9js700juo7015s7s7fwr	cmqzau8ts003nmg01dlzbhcwv	2026-06-29	2026-07-15 10:03:42.313	ADMIN_HISTORICAL:NEW
cmrlyfw19009rlq01t75bgehh	cmrlyfw16009plq01zkqbjany	cmr0e8q3k009bmg01p00ba0nx	cmr0lf2r2000dpn01uv7pvl3x	2026-07-06	2026-07-15 10:46:11.181	ADMIN_HISTORICAL:NEW
cmrlygdyt009vlq01cbng0urd	cmrlygdys009tlq01weylhxnh	cmr0e8q3k009bmg01p00ba0nx	cmr0lf2sz000zpn01vcdbfn1k	2026-07-09	2026-07-15 10:46:34.421	ADMIN_HISTORICAL:NEW
cmrlygvd5009zlq01vxshn502	cmrlygvd4009xlq01b0sfygsn	cmr638xlv00admm01cm77sv03	cmrajji4200kkmm01h02ao1fi	2026-07-07	2026-07-15 10:46:56.97	ADMIN_HISTORICAL:NEW
cmrlyh30t00a3lq01c30wvbk2	cmrlyh30s00a1lq01fm777d4a	cmr638xlv00admm01cm77sv03	cmrajn85l00kqmm01m555nlj3	2026-07-09	2026-07-15 10:47:06.894	ADMIN_HISTORICAL:NEW
cmrlymsqk00a9lq01224m9fpi	cmrlymsqh00a7lq01ozm0dcjl	cmr638xlv00admm01cm77sv03	cmrlymi6u00a5lq01y2ze2m1j	2026-07-04	2026-07-15 10:51:33.5	ADMIN_HISTORICAL:NEW
cmrm4175o00aflq01tqowxrqf	cmrm4175m00adlq01cllk668d	cmrbukuwd0004mn016lbgagog	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	2026-07-15 13:22:43.453	ADMIN_HISTORICAL:NEW
cmrm41dg900ajlq01nx49rvqr	cmrm41dg800ahlq01e0j85od8	cmrbumgk4000dmn01h99tqe11	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	2026-07-15 13:22:51.61	ADMIN_HISTORICAL:NEW
cmrm41kww00anlq010rydn5gn	cmrm41kwt00allq01wt7v0e59	cmqnnz1kg00d8od0103g8czza	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	2026-07-15 13:23:01.281	ADMIN_HISTORICAL:NEW
cmrm41qwl00arlq01w5xfqbdn	cmrm41qwk00aplq019y2ix3d8	cmr1tvvf8001fmm01nvgjy6v9	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	2026-07-15 13:23:09.045	ADMIN_HISTORICAL:NEW
cmrm42hi900avlq01260mjh36	cmrm42hi700atlq01v3x9te40	cmph5kmv300f7p401b8x8jouu	cmr0lf2rs000mpn01i367mfch	2026-07-07	2026-07-15 13:23:43.521	ADMIN_HISTORICAL:NEW
cmrm42p3p00azlq01040cntvt	cmrm42p3n00axlq01wfg2yune	cmqf2b42m000vwmtsnd6eu11l	cmr0lf2rs000mpn01i367mfch	2026-07-07	2026-07-15 13:23:53.365	ADMIN_HISTORICAL:NEW
cmrm430hn00b3lq01nsq75rbq	cmrm430hl00b1lq01rl8rxlc2	cmqnjvfwv00clod01smhvf5v7	cmr0lf2rs000mpn01i367mfch	2026-07-07	2026-07-15 13:24:08.123	ADMIN_HISTORICAL:NEW
cmrm4342800b7lq0177dr9hq5	cmrm4342600b5lq01764miarc	cmqrwntpy0016sc0146g80wvq	cmr0lf2rs000mpn01i367mfch	2026-07-07	2026-07-15 13:24:12.753	ADMIN_HISTORICAL:NEW
cmrm43bhf00bblq0187rd39dd	cmrm43bhe00b9lq01xr3om7d0	cmqnjmmn900ceod01dz6unzwp	cmr0lf2rs000mpn01i367mfch	2026-07-07	2026-07-15 13:24:22.372	ADMIN_HISTORICAL:NEW
cmrm43k9800bflq01c7tegw00	cmrm43k9600bdlq011tov6e98	cmp6n445r003xp4019r22o12e	cmr0lf2rs000mpn01i367mfch	2026-07-07	2026-07-15 13:24:33.74	ADMIN_HISTORICAL:NEW
cmrm440b800bjlq01svpa4fmw	cmrm440b600bhlq0194u6bcw6	cmqno2ywp00dfod01x3mtrdjg	cmr0lf2ru000npn01m8kg1lra	2026-07-07	2026-07-15 13:24:54.548	ADMIN_HISTORICAL:NEW
cmrm446mb00bnlq01w00wdrp4	cmrm446ma00bllq01a0cbj4d3	cmp88f7g90073p401w4uw4pqs	cmr0lf2ru000npn01m8kg1lra	2026-07-07	2026-07-15 13:25:02.723	ADMIN_HISTORICAL:NEW
cmrm44ftx00brlq01pm3n0si6	cmrm44ftw00bplq01es19ozuh	cmqqija83000up901vbrlsocv	cmr0lf2ru000npn01m8kg1lra	2026-07-07	2026-07-15 13:25:14.662	ADMIN_HISTORICAL:NEW
cmrm44l3f00bvlq01x72ttqaf	cmrm44l3e00btlq01us6wzmdr	cmqqipr55001fp9010qryqpgy	cmr0lf2ru000npn01m8kg1lra	2026-07-07	2026-07-15 13:25:21.483	ADMIN_HISTORICAL:NEW
cmrm44pq100bzlq01hmbnnb35	cmrm44pq000bxlq01b1g4hthq	cmqqio1g50018p9018hz9fq36	cmr0lf2ru000npn01m8kg1lra	2026-07-07	2026-07-15 13:25:27.481	ADMIN_HISTORICAL:NEW
cmrm46ga700c3lq01ouuzq97h	cmrm46ga600c1lq01jpujdew4	cmpazudle00byp401oz4zx3e1	cmr0lf2s0000ppn01yy85vtr2	2026-07-08	2026-07-15 13:26:48.559	ADMIN_HISTORICAL:NEW
cmrm46olr00c7lq014rouusww	cmrm46olp00c5lq01upm2ryrn	cmqf2b3xg0001wmtsjmoqct8a	cmr0lf2s0000ppn01yy85vtr2	2026-07-08	2026-07-15 13:26:59.343	ADMIN_HISTORICAL:NEW
cmrm46t0w00cblq01k8it2xvm	cmrm46t0v00c9lq01383l9d8y	cmrbunzzo000mmn01dkqpill6	cmr0lf2s0000ppn01yy85vtr2	2026-07-08	2026-07-15 13:27:05.072	ADMIN_HISTORICAL:NEW
cmrm47bkp00cflq01g86uvl5w	cmrm47bko00cdlq01c0kysy0i	cmp9jyb2l009tp4012t706wff	cmr0lf2s3000qpn013kdvbhh8	2026-07-08	2026-07-15 13:27:29.114	ADMIN_HISTORICAL:NEW
cmrm47rug00cjlq011oyinrza	cmrm47ruf00chlq01482d96w0	cmp5e2po6007el401m0wr4bxe	cmr0lf2s6000rpn013e5f88dk	2026-07-08	2026-07-15 13:27:50.201	ADMIN_HISTORICAL:NEW
cmrm488gp00cnlq01b8xaw4cb	cmrm488gn00cllq01ugedjvib	cmrdadhtm001wmn01ebkmguat	cmr0lf2s6000rpn013e5f88dk	2026-07-08	2026-07-15 13:28:11.738	ADMIN_HISTORICAL:NEW
cmrm49xwo00cxlq0178g3csbx	cmrm49xwm00cvlq01y2l37rwc	cmr91oeqe00dvmm012s7it3wq	cmr0lf2s6000rpn013e5f88dk	2026-07-08	2026-07-15 13:29:31.368	ADMIN_HISTORICAL:NEW
cmrm4an9m00d1lq01sixrybxm	cmrm4an9k00czlq018q3tswzn	cmph5kmv300f7p401b8x8jouu	cmr0lf2sw000ypn01loydepqu	2026-07-09	2026-07-15 13:30:04.234	ADMIN_HISTORICAL:NEW
cmrm4as9n00d5lq01e25zxn8t	cmrm4as9l00d3lq017040r45z	cmpmhc40500h9p40180sb0edr	cmr0lf2sw000ypn01loydepqu	2026-07-09	2026-07-15 13:30:10.715	ADMIN_HISTORICAL:NEW
cmrm4aztj00d9lq01tnqu8ouz	cmrm4azti00d7lq01xdkdfdkm	cmp6mh9mn0033p401xa6v43p7	cmr0lf2sw000ypn01loydepqu	2026-07-09	2026-07-15 13:30:20.504	ADMIN_HISTORICAL:NEW
cmrm4bkew00ddlq01e8kl2shf	cmrm4bkev00dblq014gg52a44	cmrf1sef700lbmn01oewtlk1z	cmr0lf2tk0016pn01axfzptwh	2026-07-10	2026-07-15 13:30:47.193	ADMIN_HISTORICAL:NEW
cmrm4bpdq00dhlq018zfrs0nu	cmrm4bpdp00dflq01x35l019z	cmpfpx1dd00ekp4015zb7hrup	cmr0lf2tk0016pn01axfzptwh	2026-07-10	2026-07-15 13:30:53.631	ADMIN_HISTORICAL:NEW
cmrm4cf0w00dplq01vffmx7gd	cmrm4cf0v00dnlq018dfg5op1	cmp5e2po6007el401m0wr4bxe	cmr0lf2tn0017pn01ho4c6bvd	2026-07-10	2026-07-15 13:31:26.865	ADMIN_HISTORICAL:NEW
cmrm4czu800dtlq01wbkr96m4	cmrm4czu700drlq01b9rp88ai	cmqf2b43f0011wmts29fvfire	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	2026-07-15 13:31:53.841	ADMIN_HISTORICAL:NEW
cmrm4dmqu00dxlq01f0hnul53	cmrm4dmqt00dvlq01oh7tq1zs	cmqnnz1kg00d8od0103g8czza	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	2026-07-15 13:32:23.526	ADMIN_HISTORICAL:NEW
cmrm4dsee00e1lq01yupme379	cmrm4dsed00dzlq01c73h4pfi	cmr54gw0r009omm01n0aos5l6	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	2026-07-15 13:32:30.855	ADMIN_HISTORICAL:NEW
cmrm4fijy00e5lq01wk7y2qzi	cmrm4fijv00e3lq01pdq6mpz9	cmqnlovfk00czod0169336zw1	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	2026-07-15 13:33:51.407	ADMIN_HISTORICAL:NEW
cmrm4fu0400e9lq01xady412o	cmrm4fu0300e7lq01wyyiic7j	cmpazudle00byp401oz4zx3e1	cmr0lf2uc001epn0189o0lfr4	2026-07-11	2026-07-15 13:34:06.245	ADMIN_HISTORICAL:NEW
cmrm4fye500edlq01e13lua9k	cmrm4fye400eblq015blr5nj4	cmp5d9vn5006zl401fo5j5q04	cmr0lf2uc001epn0189o0lfr4	2026-07-11	2026-07-15 13:34:11.934	ADMIN_HISTORICAL:NEW
cmrm4g2jp00ehlq013thjnbhv	cmrm4g2jo00eflq017kqariob	cmqw8njse001zmg010hmpycb7	cmr0lf2uc001epn0189o0lfr4	2026-07-11	2026-07-15 13:34:17.318	ADMIN_HISTORICAL:NEW
cmrm4gigy00ellq01rk7tic7b	cmrm4gigx00ejlq01rbum2gxi	cmr91dvvk00ddmm01yvoi91dd	cmr0lf2uy001fpn011bm0do45	2026-07-12	2026-07-15 13:34:37.954	ADMIN_HISTORICAL:NEW
cmrm4gs0e00eplq01kp1rrad0	cmrm4gs0d00enlq01wk8p8rwd	cmqf2b405000dwmtsddcf7agj	cmr0lf2uy001fpn011bm0do45	2026-07-12	2026-07-15 13:34:50.319	ADMIN_HISTORICAL:NEW
cmrm4h1eg00etlq0176du2afn	cmrm4h1ef00erlq01xujd7nsv	cmrf1usfb00lkmn01msecwoo3	cmr0lf2uy001fpn011bm0do45	2026-07-12	2026-07-15 13:35:02.488	ADMIN_HISTORICAL:NEW
cmrm4hdam00exlq01k7d5ij6n	cmrm4hdak00evlq0138c6ov9z	cmpazudle00byp401oz4zx3e1	cmr0lf2v3001gpn01e0p9m4hg	2026-07-12	2026-07-15 13:35:17.902	ADMIN_HISTORICAL:NEW
cmrm4hgxh00f1lq01ubbuh10h	cmrm4hgxg00ezlq01rqb7fbsy	cmp6mujhf003ip4019yxl5iri	cmr0lf2v3001gpn01e0p9m4hg	2026-07-12	2026-07-15 13:35:22.614	ADMIN_HISTORICAL:NEW
cmrm4hryy00f5lq01xncjhuiz	cmrm4hryw00f3lq01o5vt7doj	cmpuxbc7900i9p401d4rkyuom	cmr0lf2v3001gpn01e0p9m4hg	2026-07-12	2026-07-15 13:35:36.922	ADMIN_HISTORICAL:NEW
cmrm4i4fr00f9lq010m8kt9sg	cmrm4i4fq00f7lq01vzbzktrn	cmpazudle00byp401oz4zx3e1	cmr0lf2vc001hpn014r2sv0r9	2026-07-12	2026-07-15 13:35:53.079	ADMIN_HISTORICAL:NEW
cmrm4il8f00fdlq01bmj63wiz	cmrm4il8d00fblq01qyedwzk3	cmrdrcgat00kumn0112odkalw	cmr0lf2vc001hpn014r2sv0r9	2026-07-12	2026-07-15 13:36:14.847	ADMIN_HISTORICAL:NEW
cmrm4ir2700fhlq016rn9bk1i	cmrm4ir2600fflq01ul00j9t5	cmrbure45000vmn014ppcw3bv	cmr0lf2vc001hpn014r2sv0r9	2026-07-12	2026-07-15 13:36:22.4	ADMIN_HISTORICAL:NEW
cmrm4knvy00fllq011lh0vdg0	cmrm4knvx00fjlq01wtompf65	cmqw8ec6p0010mg01ce7hdn33	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	2026-07-15 13:37:51.598	ADMIN_HISTORICAL:NEW
cmrm54lk800fplq01g6ifoz8i	cmrm54lk500fnlq010sawyh06	cmr1tvvf8001fmm01nvgjy6v9	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	2026-07-15 13:53:21.705	ADMIN_HISTORICAL:NEW
cmrm54pl700ftlq01d39hgx6e	cmrm54pl600frlq011nx266to	cmr3dno9x008vmm01yn5zbnx3	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	2026-07-15 13:53:26.924	ADMIN_HISTORICAL:NEW
cmrm54v5k00fxlq0174lmcquw	cmrm54v5i00fvlq01hkq1mcsp	cmr6940rg00bemm01s11l95mw	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	2026-07-15 13:53:34.136	ADMIN_HISTORICAL:NEW
cmrm5506400g1lq011a7m50qu	cmrm5506200fzlq01nzq5v527	cmrdaicj5002nmn01fbw9scjq	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	2026-07-15 13:53:40.636	ADMIN_HISTORICAL:NEW
cmrm55d7f00g5lq015iqeefum	cmrm55d7d00g3lq01alqtxd9f	cmrdagpsz002emn01k4cuyqwh	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	2026-07-15 13:53:57.531	ADMIN_HISTORICAL:NEW
cmrm55sc200g9lq01038s3cgr	cmrm55sc000g7lq01qpil5c6n	cmp6mxgtj003np401n6d3md2o	cmr0lf2sg000vpn013xbcr6q5	2026-07-08	2026-07-15 13:54:17.138	ADMIN_HISTORICAL:NEW
cmrm55z8u00gdlq01uw1qlat2	cmrm55z8t00gblq01vbjf3yex	cmqno5z2j00dlod0156ophlux	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	2026-07-15 13:54:26.095	ADMIN_HISTORICAL:NEW
cmrm5646i00ghlq0156faftvu	cmrm5646h00gflq01vd3nmt74	cmpuxgfvo00iep401kuin241v	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	2026-07-15 13:54:32.49	ADMIN_HISTORICAL:NEW
cmrm56b8700gllq01o07yyofr	cmrm56b8600gjlq012o4no8b2	cmpxtdnho00jxp401mtude4xv	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	2026-07-15 13:54:41.624	ADMIN_HISTORICAL:NEW
cmrm56gcc00gplq01f1h4yhat	cmrm56gcb00gnlq01vtohk2xx	cmpqvd4pp00hkp401fok0cwt8	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	2026-07-15 13:54:48.253	ADMIN_HISTORICAL:NEW
cmrm57dp900gtlq01csv7o59r	cmrm57dp800grlq01m8ucpsae	cmqnjhe4500c7od01xunmmhyz	cmr0lf2t30010pn01bwtey846	2026-07-09	2026-07-15 13:55:31.486	ADMIN_HISTORICAL:NEW
cmrm57i8000gxlq0121emq8qo	cmrm57i7y00gvlq01dr9b48wx	cmp5d9vn5006zl401fo5j5q04	cmr0lf2t30010pn01bwtey846	2026-07-09	2026-07-15 13:55:37.344	ADMIN_HISTORICAL:NEW
cmrm57mo000h1lq01u1l629t3	cmrm57mnz00gzlq013q2waw8c	cmqqifegn000gp901x4b3a61j	cmr0lf2t30010pn01bwtey846	2026-07-09	2026-07-15 13:55:43.105	ADMIN_HISTORICAL:NEW
cmrm590a800h5lq01qxawx5te	cmrm590a700h3lq01rllr7ng4	cmpya6nur00kgp401et6xel9m	cmr0lf2t30010pn01bwtey846	2026-07-09	2026-07-15 13:56:47.409	ADMIN_HISTORICAL:NEW
cmrm594gu00h9lq01diika6nm	cmrm594gt00h7lq01d7wdg8x5	cmp87ym20006yp401590xadl0	cmr0lf2t30010pn01bwtey846	2026-07-09	2026-07-15 13:56:52.831	ADMIN_HISTORICAL:NEW
cmrm59kj800hdlq01u160fsc1	cmrm59kj700hblq01estwv366	cmrdrcgat00kumn0112odkalw	cmr0lf2t70011pn017e89jceq	2026-07-09	2026-07-15 13:57:13.653	ADMIN_HISTORICAL:NEW
cmrm59orb00hhlq01stsxu2fv	cmrm59or900hflq01iqva600r	cmr91dvvk00ddmm01yvoi91dd	cmr0lf2t70011pn017e89jceq	2026-07-09	2026-07-15 13:57:19.128	ADMIN_HISTORICAL:NEW
cmrm59ym000hllq01vtd0r2f7	cmrm59ylz00hjlq01u51zn0ev	cmpi6ban400fip401ppm9o7wy	cmr0lf2t70011pn017e89jceq	2026-07-09	2026-07-15 13:57:31.896	ADMIN_HISTORICAL:NEW
cmrm5abxs00hplq01o9g3gf1a	cmrm5abxr00hnlq01d17i109m	cmp80zids006np4015qmgm2k4	cmr0lf2t90012pn01klwvko87	2026-07-09	2026-07-15 13:57:49.168	ADMIN_HISTORICAL:NEW
cmrm5ahub00htlq01gq2t3q1g	cmrm5ahua00hrlq01mkd4r0mq	cmpuxlbuw00ijp4016pmesm29	cmr0lf2t90012pn01klwvko87	2026-07-09	2026-07-15 13:57:56.82	ADMIN_HISTORICAL:NEW
cmrm5amni00hxlq01k2gm0dt9	cmrm5amng00hvlq018omyjltg	cmp6mujhf003ip4019yxl5iri	cmr0lf2t90012pn01klwvko87	2026-07-09	2026-07-15 13:58:03.055	ADMIN_HISTORICAL:NEW
cmrm5atud00i1lq01ovakmh4w	cmrm5atub00hzlq01lm95exum	cmp9pbn9j00b7p401wd3w8sn0	cmr0lf2t90012pn01klwvko87	2026-07-09	2026-07-15 13:58:12.373	ADMIN_HISTORICAL:NEW
cmrm5b0ba00i5lq01rkfeepzk	cmrm5b0b900i3lq015zr4fyn5	cmp9p95jj00b2p401dqlrtohp	cmr0lf2t90012pn01klwvko87	2026-07-09	2026-07-15 13:58:20.759	ADMIN_HISTORICAL:NEW
cmrm5b6r800i9lq019cajwp2w	cmrm5b6r600i7lq015kk4sasp	cmpwo5qcf00jgp401y23i6i2r	cmr0lf2t90012pn01klwvko87	2026-07-09	2026-07-15 13:58:29.108	ADMIN_HISTORICAL:NEW
cmrm5bzb700idlq01b6tsaguf	cmrm5bzb500iblq01ujhd6lsr	cmp5qutpd0015p401e0b83fu9	cmrajtzh400kumm01ohn7wbor	2026-07-09	2026-07-15 13:59:06.116	ADMIN_HISTORICAL:NEW
cmrm5c2de00ihlq01u1gqg605	cmrm5c2dd00iflq01dvefz7ii	cmp5qzr8e001ap401fa4uuzw4	cmrajtzh400kumm01ohn7wbor	2026-07-09	2026-07-15 13:59:10.083	ADMIN_HISTORICAL:NEW
cmrm5cqq800illq01twt6d407	cmrm5cqq700ijlq01c98s4t7z	cmqf2b3z80007wmtsodeuow25	cmr0lf2tr0018pn01qs0gu3me	2026-07-10	2026-07-15 13:59:41.649	ADMIN_HISTORICAL:NEW
cmrm5cur900iplq0190zs0mhf	cmrm5cur800inlq015bf4rc3d	cmrdadhtm001wmn01ebkmguat	cmr0lf2tr0018pn01qs0gu3me	2026-07-10	2026-07-15 13:59:46.87	ADMIN_HISTORICAL:NEW
cmrm5d4r400itlq01zh6fylom	cmrm5d4r200irlq01dq1zpfdq	cmqf2b42m000vwmtsnd6eu11l	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	2026-07-15 13:59:59.824	ADMIN_HISTORICAL:NEW
cmrm5d97b00ixlq011turmziv	cmrm5d97a00ivlq01yr577y13	cmpuxyh5x00itp401pqas19s7	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	2026-07-15 14:00:05.592	ADMIN_HISTORICAL:NEW
cmrm5dffy00j1lq01vftz2v4n	cmrm5dffx00izlq01lnb7zlku	cmqqihcm6000np901ub12rzon	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	2026-07-15 14:00:13.678	ADMIN_HISTORICAL:NEW
cmrm5djyc00j5lq01wcdahyqg	cmrm5djyb00j3lq01uaf9oz7g	cmp6vndph004yp401vluusox7	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	2026-07-15 14:00:19.524	ADMIN_HISTORICAL:NEW
cmrm5dso900j9lq01wkps6efl	cmrm5dso700j7lq01j5pfh7az	cmp6maci6002tp40119cnxlu3	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	2026-07-15 14:00:30.825	ADMIN_HISTORICAL:NEW
cmrm5jsp700jdlq015mmjaouf	cmrm5jsp400jblq01rmerka9u	cmqnjvfwv00clod01smhvf5v7	cmr0lf2tx001apn01dj916ttz	2026-07-10	2026-07-15 14:05:10.795	ADMIN_HISTORICAL:NEW
cmrm5k03d00jhlq01dmqusku6	cmrm5k03b00jflq015emxkaq9	cmqnjmmn900ceod01dz6unzwp	cmr0lf2tx001apn01dj916ttz	2026-07-10	2026-07-15 14:05:20.377	ADMIN_HISTORICAL:NEW
cmrm5k3k400jllq01quyoelu5	cmrm5k3k300jjlq01hvi5wz5n	cmqrwntpy0016sc0146g80wvq	cmr0lf2tx001apn01dj916ttz	2026-07-10	2026-07-15 14:05:24.868	ADMIN_HISTORICAL:NEW
cmrm5k9v900jplq01qjcays66	cmrm5k9v700jnlq01jg4dh4eu	cmqno2ywp00dfod01x3mtrdjg	cmr0lf2tx001apn01dj916ttz	2026-07-10	2026-07-15 14:05:33.045	ADMIN_HISTORICAL:NEW
cmrm5ke8r00jtlq015797da8n	cmrm5ke8q00jrlq012fsjxf4l	cmr3dc13z008mmm01r1xcp8qr	cmr0lf2tx001apn01dj916ttz	2026-07-10	2026-07-15 14:05:38.715	ADMIN_HISTORICAL:NEW
cmrm5l02n00jxlq01iwa8nged	cmrm5l02l00jvlq012bxa0lff	cmr54gw0r009omm01n0aos5l6	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	2026-07-15 14:06:07.007	ADMIN_HISTORICAL:NEW
cmrm5l4pn00k1lq01laiwsdhi	cmrm5l4pl00jzlq017py7mmtf	cmqw8ec6p0010mg01ce7hdn33	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	2026-07-15 14:06:13.019	ADMIN_HISTORICAL:NEW
cmrm5l9qz00k5lq01qxd5ltps	cmrm5l9qy00k3lq01c8kjsh4z	cmrbunzzo000mmn01dkqpill6	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	2026-07-15 14:06:19.548	ADMIN_HISTORICAL:NEW
cmrm5lf2800k9lq01qgqvpss3	cmrm5lf2600k7lq012vo5wpsq	cmrbure45000vmn014ppcw3bv	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	2026-07-15 14:06:26.432	ADMIN_HISTORICAL:NEW
cmrm5lkyd00kdlq013152jd1v	cmrm5lkyc00kblq01zwi22vwq	cmraefj5300hzmm01gbupayou	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	2026-07-15 14:06:34.07	ADMIN_HISTORICAL:NEW
cmrm5lqpl00khlq01yd8nfgqt	cmrm5lqpk00kflq01gkxbmwcb	cmrfb3yin00m7mn01e62jdrb9	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	2026-07-15 14:06:41.53	ADMIN_HISTORICAL:NEW
cmrnmq8em00l6lq01ume1g4p0	cmrnmq8ek00l4lq01h9goze2u	cmpazudle00byp401oz4zx3e1	cmr0lf2t30010pn01bwtey846	2026-07-09	2026-07-16 14:53:50.735	ADMIN_HISTORICAL:NEW
cmrub5zke00oelq012pbb18si	cmrub5zkc00oclq01g9b6gyst	cmpazudle00byp401oz4zx3e1	cmr908w0l00cfmm01va8fjdr1	2026-07-13	2026-07-21 07:04:33.614	ADMIN_HISTORICAL:NEW
cmrub66lg00oilq01omup35gm	cmrub66le00oglq01p47cc4wa	cmp5d9vn5006zl401fo5j5q04	cmr908w0l00cfmm01va8fjdr1	2026-07-13	2026-07-21 07:04:42.725	ADMIN_HISTORICAL:NEW
cmrub9apv00omlq012cmadect	cmrub9apu00oklq01lffoc6gm	cmrdak4v0002wmn01j2my021k	cmr908w0q00chmm01rfd4xxra	2026-07-13	2026-07-21 07:07:08.036	ADMIN_HISTORICAL:NEW
cmrubvedb00oqlq0103jh6ibi	cmrubved800oolq01y4v3a7l5	cmrdalmpn0035mn01esii22rz	cmr908w0q00chmm01rfd4xxra	2026-07-13	2026-07-21 07:24:19.199	ADMIN_HISTORICAL:NEW
cmrubvywm00oulq01npj28cl3	cmrubvywl00oslq01rdksetr5	cmr0e8q3k009bmg01p00ba0nx	cmr908w0t00cimm01dqefnx05	2026-07-13	2026-07-21 07:24:45.814	ADMIN_HISTORICAL:NEW
cmrubx86g00oylq01wfx12mha	cmrubx86f00owlq017d927pzi	cmqno2ywp00dfod01x3mtrdjg	cmr908w0v00cjmm01zqnivmco	2026-07-13	2026-07-21 07:25:44.489	ADMIN_HISTORICAL:NEW
cmrubxfgi00p2lq01njkx7ypw	cmrubxfgg00p0lq01okyh2qvh	cmqf2b3xg0001wmtsjmoqct8a	cmr908w0v00cjmm01zqnivmco	2026-07-13	2026-07-21 07:25:53.922	ADMIN_HISTORICAL:NEW
cmrubxmn400p6lq0185wsl8u5	cmrubxmn200p4lq01pn1uxgwa	cmps12dpz00hvp401tesxyqev	cmr908w0v00cjmm01zqnivmco	2026-07-13	2026-07-21 07:26:03.232	ADMIN_HISTORICAL:NEW
cmruby7qe00palq0104e9cnmr	cmruby7qc00p8lq01wekt0dd2	cmrbunzzo000mmn01dkqpill6	cmr908w0y00ckmm011t7a402x	2026-07-13	2026-07-21 07:26:30.566	ADMIN_HISTORICAL:NEW
cmruc59lt00pelq014k31c4xt	cmruc59lq00pclq01iowkyn28	cmpazudle00byp401oz4zx3e1	cmr908w1500cnmm011dy7ckbg	2026-07-14	2026-07-21 07:31:59.585	ADMIN_HISTORICAL:NEW
cmruc62u700pilq01at01o0oj	cmruc62u600pglq01fxp2mgt6	cmp8b0p5m0078p401ko5fipst	cmr908w1a00cpmm01ih7e2u1j	2026-07-14	2026-07-21 07:32:37.472	ADMIN_HISTORICAL:NEW
cmruc6ch400pmlq019gd9dvd9	cmruc6ch300pklq01pul5kimo	cmqqifegn000gp901x4b3a61j	cmr908w1a00cpmm01ih7e2u1j	2026-07-14	2026-07-21 07:32:49.961	ADMIN_HISTORICAL:NEW
cmruc7vt900pqlq011rgtwm5k	cmruc7vt700polq0122imxwt4	cmqnnz1kg00d8od0103g8czza	cmr908w1d00cqmm015uw0f0fs	2026-07-14	2026-07-21 07:34:01.677	ADMIN_HISTORICAL:NEW
cmruc8dne00pulq017blkcud3	cmruc8dnc00pslq01l0pwc5me	cmqf2b42m000vwmtsnd6eu11l	cmr908w1g00crmm01psu6zflu	2026-07-14	2026-07-21 07:34:24.794	ADMIN_HISTORICAL:NEW
cmruc8j0800pylq01oderv09a	cmruc8j0700pwlq01nzxel0xq	cmpfpx1dd00ekp4015zb7hrup	cmr908w1g00crmm01psu6zflu	2026-07-14	2026-07-21 07:34:31.736	ADMIN_HISTORICAL:NEW
cmruc92xw00q2lq01wqckt6w1	cmruc92xv00q0lq018tzz0rz1	cmpuxgfvo00iep401kuin241v	cmr908w1j00csmm01mge40q7b	2026-07-14	2026-07-21 07:34:57.572	ADMIN_HISTORICAL:NEW
cmruc993m00q6lq010uuwhe0z	cmruc993l00q4lq0104b4jfun	cmqw8ec6p0010mg01ce7hdn33	cmr908w1j00csmm01mge40q7b	2026-07-14	2026-07-21 07:35:05.554	ADMIN_HISTORICAL:NEW
cmruc9llb00qalq01s2919qz2	cmruc9ll900q8lq01bmrgxceq	cmqnjvfwv00clod01smhvf5v7	cmr908w1j00csmm01mge40q7b	2026-07-14	2026-07-21 07:35:21.744	ADMIN_HISTORICAL:NEW
cmruc9vrf00qelq01zu1gct35	cmruc9vre00qclq010rz2doom	cmqnjmmn900ceod01dz6unzwp	cmr908w1j00csmm01mge40q7b	2026-07-14	2026-07-21 07:35:34.924	ADMIN_HISTORICAL:NEW
cmruca8nn00qilq01lzpqry7u	cmruca8nl00qglq01558595ne	cmqrwntpy0016sc0146g80wvq	cmr908w1j00csmm01mge40q7b	2026-07-14	2026-07-21 07:35:51.635	ADMIN_HISTORICAL:NEW
cmrucagpv00qmlq01vsnjoy68	cmrucagpu00qklq014bxh3302	cmqnlllpk00csod01wkefk1ot	cmr908w1j00csmm01mge40q7b	2026-07-14	2026-07-21 07:36:02.083	ADMIN_HISTORICAL:NEW
cmrucb9jg00qqlq019u06yxgq	cmrucb9jf00qolq010gf7iklm	cmp5qutpd0015p401e0b83fu9	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	2026-07-21 07:36:39.437	ADMIN_HISTORICAL:NEW
cmrucbdku00qulq01ex6q8tnr	cmrucbdkt00qslq01fpvbf7ch	cmp5qzr8e001ap401fa4uuzw4	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	2026-07-21 07:36:44.671	ADMIN_HISTORICAL:NEW
cmrucck9c00qylq013v8noyar	cmrucck9b00qwlq01palu0vj1	cmrbwaec5001dmn01can4i9wf	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	2026-07-21 07:37:39.984	ADMIN_HISTORICAL:NEW
cmruccsan00r2lq01cjh1gtqf	cmruccsam00r0lq01a154279i	cmrbw6y2c0014mn01a6ii4tiu	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	2026-07-21 07:37:50.4	ADMIN_HISTORICAL:NEW
cmrucesx600r6lq01u8quf056	cmrucesx500r4lq01mvt245co	cmpazudle00byp401oz4zx3e1	cmr908w1o00cumm014gw9e9a3	2026-07-15	2026-07-21 07:39:24.522	ADMIN_HISTORICAL:NEW
cmrucf0ns00ralq01ive9bz9a	cmrucf0nr00r8lq014raoyqpb	cmp8b0p5m0078p401ko5fipst	cmr908w1o00cumm014gw9e9a3	2026-07-15	2026-07-21 07:39:34.552	ADMIN_HISTORICAL:NEW
cmrucgcj800relq01d8lm5ho0	cmrucgcj600rclq01l8970ikt	cmqf2b41m000pwmtsgzlybd2p	cmr908w2100czmm01ysvy2ut0	2026-07-15	2026-07-21 07:40:36.597	ADMIN_HISTORICAL:NEW
cmruch33a00rilq01e20tlryk	cmruch33900rglq01ptotb06r	cmqf2b40z000jwmtsglaha6m4	cmr908w2100czmm01ysvy2ut0	2026-07-15	2026-07-21 07:41:11.014	ADMIN_HISTORICAL:NEW
cmruchgfx00rmlq012getkoyq	cmruchgfw00rklq01s0b41tc2	cmrbunzzo000mmn01dkqpill6	cmr908w2100czmm01ysvy2ut0	2026-07-15	2026-07-21 07:41:28.318	ADMIN_HISTORICAL:NEW
cmrucht0500rqlq01p7kntbcp	cmrucht0400rolq019trcdu3v	cmrkjma2h0010lq01o3ge2qc3	cmr908w2100czmm01ysvy2ut0	2026-07-15	2026-07-21 07:41:44.597	ADMIN_HISTORICAL:NEW
cmruci2qr00rulq01nj5hu756	cmruci2qp00rslq01fryju912	cmph5kmv300f7p401b8x8jouu	cmr908w2100czmm01ysvy2ut0	2026-07-15	2026-07-21 07:41:57.219	ADMIN_HISTORICAL:NEW
cmrucirue00rylq012ft8bpyp	cmrucirud00rwlq01kdjvbyi3	cmqw8ec6p0010mg01ce7hdn33	cmr908w2400d0mm01op9pxsuj	2026-07-15	2026-07-21 07:42:29.751	ADMIN_HISTORICAL:NEW
cmrucizop00s2lq01ganl2siw	cmrucizoo00s0lq01bu43hyvg	cmp6mxgtj003np401n6d3md2o	cmr908w2400d0mm01op9pxsuj	2026-07-15	2026-07-21 07:42:39.913	ADMIN_HISTORICAL:NEW
cmrucp11200s6lq01jjau8dbm	cmrucp10z00s4lq016afaq1h3	cmr0e8q3k009bmg01p00ba0nx	cmr908vy500btmm011t64awvd	2026-07-16	2026-07-21 07:47:21.591	ADMIN_HISTORICAL:NEW
cmrucr13f00salq01u3dydm1d	cmrucr13d00s8lq01t1i7bnr2	cmpb26l0900ccp4014tau0gjw	cmr908vy900bumm01pqov4lss	2026-07-16	2026-07-21 07:48:54.987	ADMIN_HISTORICAL:NEW
cmrucr7qh00selq01avdbx8pe	cmrucr7qf00sclq018ja8nh6j	cmpazudle00byp401oz4zx3e1	cmr908vy900bumm01pqov4lss	2026-07-16	2026-07-21 07:49:03.593	ADMIN_HISTORICAL:NEW
cmrucreab00silq01yt9yc56b	cmrucrea900sglq0161uxvmgr	cmp5d9vn5006zl401fo5j5q04	cmr908vy900bumm01pqov4lss	2026-07-16	2026-07-21 07:49:12.083	ADMIN_HISTORICAL:NEW
cmrucrk2200smlq01f1sol0pj	cmrucrk2000sklq019jqlodms	cmpya6nur00kgp401et6xel9m	cmr908vy900bumm01pqov4lss	2026-07-16	2026-07-21 07:49:19.562	ADMIN_HISTORICAL:NEW
cmrucrsze00sqlq01x90qydif	cmrucrszd00solq01ld1nrz16	cmqnjhe4500c7od01xunmmhyz	cmr908vy900bumm01pqov4lss	2026-07-16	2026-07-21 07:49:31.131	ADMIN_HISTORICAL:NEW
cmrucryin00sulq01phwtjos1	cmrucryil00sslq01yarm9yuz	cmrnrrjxa00lblq014meynmha	cmr908vy900bumm01pqov4lss	2026-07-16	2026-07-21 07:49:38.303	ADMIN_HISTORICAL:NEW
cmrucsn8s00sylq01oqvmzkgp	cmrucsn8r00swlq010ygb710e	cmrbunzzo000mmn01dkqpill6	cmr908vyc00bvmm0116gg4fvm	2026-07-16	2026-07-21 07:50:10.349	ADMIN_HISTORICAL:NEW
cmruct89l00t2lq01er8pin90	cmruct89j00t0lq01w55z36ks	cmrbure45000vmn014ppcw3bv	cmr908vyc00bvmm0116gg4fvm	2026-07-16	2026-07-21 07:50:37.594	ADMIN_HISTORICAL:NEW
cmructls900t6lq01ixenq4ps	cmructls800t4lq01gob7s0me	cmqf2b3z80007wmtsodeuow25	cmr908vyc00bvmm0116gg4fvm	2026-07-16	2026-07-21 07:50:55.114	ADMIN_HISTORICAL:NEW
cmructsz800talq013t9ge2hh	cmructsz700t8lq01r6tpi6zy	cmp6mxgtj003np401n6d3md2o	cmr908vyc00bvmm0116gg4fvm	2026-07-16	2026-07-21 07:51:04.437	ADMIN_HISTORICAL:NEW
cmrucu1ie00telq01ti37s3d2	cmrucu1id00tclq019mqj0ql6	cmr91dvvk00ddmm01yvoi91dd	cmr908vyc00bvmm0116gg4fvm	2026-07-16	2026-07-21 07:51:15.494	ADMIN_HISTORICAL:NEW
cmrucupog00tilq0150cd8arb	cmrucupof00tglq012mwso46p	cmp9p95jj00b2p401dqlrtohp	cmr908vyh00bwmm01ujirtt96	2026-07-16	2026-07-21 07:51:46.817	ADMIN_HISTORICAL:NEW
cmrucuw2l00tmlq0152lo3c01	cmrucuw2k00tklq01sv7dlwfc	cmp9pbn9j00b7p401wd3w8sn0	cmr908vyh00bwmm01ujirtt96	2026-07-16	2026-07-21 07:51:55.101	ADMIN_HISTORICAL:NEW
cmrucv4uc00tqlq01jujfjk7k	cmrucv4ub00tolq01uerzprbt	cmpwo5qcf00jgp401y23i6i2r	cmr908vyh00bwmm01ujirtt96	2026-07-16	2026-07-21 07:52:06.468	ADMIN_HISTORICAL:NEW
cmrucvbeo00tulq01qt0ktno5	cmrucvben00tslq01gyezb7j2	cmp6mujhf003ip4019yxl5iri	cmr908vyh00bwmm01ujirtt96	2026-07-16	2026-07-21 07:52:14.976	ADMIN_HISTORICAL:NEW
cmrucvhys00tylq01qhse2k0r	cmrucvhyp00twlq01hdakh8k9	cmr3dno9x008vmm01yn5zbnx3	cmr908vyh00bwmm01ujirtt96	2026-07-16	2026-07-21 07:52:23.476	ADMIN_HISTORICAL:NEW
cmrucvt0u00u2lq01k77tdc18	cmrucvt0t00u0lq01wzt7gvgr	cmpuxlbuw00ijp4016pmesm29	cmr908vyh00bwmm01ujirtt96	2026-07-16	2026-07-21 07:52:37.806	ADMIN_HISTORICAL:NEW
cmrucytd000u6lq0131lieqvw	cmrucytcz00u4lq01oehk61fy	cmp9l6t2c00acp4018v82zolp	cmr908vz200c0mm01wyn8lpeo	2026-07-17	2026-07-21 07:54:58.212	ADMIN_HISTORICAL:NEW
cmrucyzfp00ualq01rw6b3g1u	cmrucyzfn00u8lq01nurkekoh	cmqnlovfk00czod0169336zw1	cmr908vz200c0mm01wyn8lpeo	2026-07-17	2026-07-21 07:55:06.085	ADMIN_HISTORICAL:NEW
cmrud1q4j00uelq011ffae8oc	cmrud1q4h00uclq01pi7wdfmf	cmrdadhtm001wmn01ebkmguat	cmr908vz600c1mm01l0z41ey8	2026-07-17	2026-07-21 07:57:13.987	ADMIN_HISTORICAL:NEW
cmrud5kv900uqlq01k4xtqiag	cmrud5kv700uolq01imuvx2aw	cmrdalmpn0035mn01esii22rz	cmr908vz900c2mm01mn2vtqqd	2026-07-17	2026-07-21 08:00:13.797	ADMIN_HISTORICAL:NEW
cmrud5s2x00uulq01oztg563k	cmrud5s2w00uslq01936vavc4	cmrdak4v0002wmn01j2my021k	cmr908vz900c2mm01mn2vtqqd	2026-07-17	2026-07-21 08:00:23.145	ADMIN_HISTORICAL:NEW
cmrud659l00uylq0155axzz67	cmrud659k00uwlq012eizp176	cmqnjvfwv00clod01smhvf5v7	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	2026-07-21 08:00:40.233	ADMIN_HISTORICAL:NEW
cmrud6nez00v2lq015lf4yzz4	cmrud6nex00v0lq0157tmngo6	cmqnjmmn900ceod01dz6unzwp	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	2026-07-21 08:01:03.755	ADMIN_HISTORICAL:NEW
cmrud6wgc00v6lq0130kfdoyh	cmrud6wgb00v4lq012y3evjl5	cmqrwntpy0016sc0146g80wvq	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	2026-07-21 08:01:15.469	ADMIN_HISTORICAL:NEW
cmrud72ra00valq014mlxf48r	cmrud72r900v8lq01k5gj3rt8	cmr1tvvf8001fmm01nvgjy6v9	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	2026-07-21 08:01:23.639	ADMIN_HISTORICAL:NEW
cmrud7aci00velq01vtxyekt7	cmrud7ach00vclq01tr8so9wo	cmqqihcm6000np901ub12rzon	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	2026-07-21 08:01:33.475	ADMIN_HISTORICAL:NEW
cmrud7yr100vilq01ctjbf863	cmrud7yqz00vglq01lu1k8ln2	cmr66zk2400b3mm01nzav5tty	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	2026-07-21 08:02:05.101	ADMIN_HISTORICAL:NEW
cmrudxmwc00vmlq01fvcrh617	cmrudxmwb00vklq01yrklsjgx	cmqf2b42m000vwmtsnd6eu11l	cmr908vze00c4mm01ubuybd8c	2026-07-17	2026-07-21 08:22:02.797	ADMIN_HISTORICAL:NEW
cmrudxrgt00vqlq014w649z7b	cmrudxrgr00volq01i8c2syvz	cmqno2ywp00dfod01x3mtrdjg	cmr908vze00c4mm01ubuybd8c	2026-07-17	2026-07-21 08:22:08.717	ADMIN_HISTORICAL:NEW
cmrudxvfy00vulq01632v39un	cmrudxvfx00vslq01tst3454b	cmpuxgfvo00iep401kuin241v	cmr908vze00c4mm01ubuybd8c	2026-07-17	2026-07-21 08:22:13.871	ADMIN_HISTORICAL:NEW
cmrudy6wx00vylq01cedbmjgi	cmrudy6wv00vwlq01wnzxusni	cmqw8ec6p0010mg01ce7hdn33	cmr908vze00c4mm01ubuybd8c	2026-07-17	2026-07-21 08:22:28.737	ADMIN_HISTORICAL:NEW
cmrudz3wh00w2lq019ylafwf3	cmrudz3wf00w0lq01vm6swi64	cmp6maci6002tp40119cnxlu3	cmr908vze00c4mm01ubuybd8c	2026-07-17	2026-07-21 08:23:11.489	ADMIN_HISTORICAL:NEW
cmrudzvz200w6lq01tnzi6to8	cmrudzvz100w4lq012up5a4v9	cmrdrcgat00kumn0112odkalw	cmr908vzh00c5mm01jirbu4v2	2026-07-17	2026-07-21 08:23:47.871	ADMIN_HISTORICAL:NEW
cmrue021400walq01npryfrac	cmrue021300w8lq01rsuwbxdd	cmqqija83000up901vbrlsocv	cmr908vzh00c5mm01jirbu4v2	2026-07-17	2026-07-21 08:23:55.721	ADMIN_HISTORICAL:NEW
cmrue0alp00welq013o8ikexq	cmrue0aln00wclq0100oolldu	cmqqipr55001fp9010qryqpgy	cmr908vzh00c5mm01jirbu4v2	2026-07-17	2026-07-21 08:24:06.829	ADMIN_HISTORICAL:NEW
cmrue0hrf00wilq01rmrkmkd3	cmrue0hre00wglq01cr906ee4	cmqqio1g50018p9018hz9fq36	cmr908vzh00c5mm01jirbu4v2	2026-07-17	2026-07-21 08:24:16.108	ADMIN_HISTORICAL:NEW
cmrue0p1300wmlq01qej4gyle	cmrue0p1200wklq01orn1kt3u	cmp5qzr8e001ap401fa4uuzw4	cmr908vzh00c5mm01jirbu4v2	2026-07-17	2026-07-21 08:24:25.528	ADMIN_HISTORICAL:NEW
cmrue0sny00wqlq01dr9dehi3	cmrue0snx00wolq0191hhao70	cmp5qutpd0015p401e0b83fu9	cmr908vzh00c5mm01jirbu4v2	2026-07-17	2026-07-21 08:24:30.239	ADMIN_HISTORICAL:NEW
cmrue1rjd00wulq0106d7no8w	cmrue1rjb00wslq01vmv8mcte	cmqnlllpk00csod01wkefk1ot	cmr908vzv00c8mm01xqo4398r	2026-07-18	2026-07-21 08:25:15.433	ADMIN_HISTORICAL:NEW
cmrue1wrh00wylq01xnnw5ivj	cmrue1wrg00wwlq01uhjdsauw	cmp71pbmj005ip401rxsl0n27	cmr908vzv00c8mm01xqo4398r	2026-07-18	2026-07-21 08:25:22.206	ADMIN_HISTORICAL:NEW
cmrue22nz00x2lq011jqryrmr	cmrue22ny00x0lq010wm20uss	cmp5d9vn5006zl401fo5j5q04	cmr908vzv00c8mm01xqo4398r	2026-07-18	2026-07-21 08:25:29.856	ADMIN_HISTORICAL:NEW
cmrue2y1200x6lq01agz7frmw	cmrue2y0z00x4lq01mkqu8wma	cmrf1sef700lbmn01oewtlk1z	cmr908vzv00c8mm01xqo4398r	2026-07-18	2026-07-21 08:26:10.502	ADMIN_HISTORICAL:NEW
cmrue4k0u00xalq01st7se90l	cmrue4k0s00x8lq01t1dv6736	cmqf2b41m000pwmtsgzlybd2p	cmr908w0000c9mm01mtivvn2w	2026-07-19	2026-07-21 08:27:25.663	ADMIN_HISTORICAL:NEW
cmrue4x7q00xelq01x98ip6uq	cmrue4x7p00xclq01038xxae8	cmqf2b40z000jwmtsglaha6m4	cmr908w0000c9mm01mtivvn2w	2026-07-19	2026-07-21 08:27:42.759	ADMIN_HISTORICAL:NEW
cmrue5xsy00xilq013b1hzdty	cmrue5xsw00xglq01r82i8z0c	cmrri21yv00m2lq01gugwiiyq	cmr908w0000c9mm01mtivvn2w	2026-07-19	2026-07-21 08:28:30.178	ADMIN_HISTORICAL:NEW
cmrue66js00xmlq0156ccwy08	cmrue66jr00xklq01u7tzjb0f	cmr91dvvk00ddmm01yvoi91dd	cmr908w0000c9mm01mtivvn2w	2026-07-19	2026-07-21 08:28:41.512	ADMIN_HISTORICAL:NEW
cmrue6yxs00xqlq01j4or9q0e	cmrue6yxq00xolq01iusw3sqf	cmp6mujhf003ip4019yxl5iri	cmr908w0500camm01ugf8l6df	2026-07-19	2026-07-21 08:29:18.304	ADMIN_HISTORICAL:NEW
cmrue745100xulq01fk5zauyj	cmrue745000xslq0146haxa0e	cmpazudle00byp401oz4zx3e1	cmr908w0500camm01ugf8l6df	2026-07-19	2026-07-21 08:29:25.046	ADMIN_HISTORICAL:NEW
cmrue7mjv00xylq01asqguvcz	cmrue7mjt00xwlq01afy35l40	cmrdadhtm001wmn01ebkmguat	cmr908w0a00cbmm01mcln1o2j	2026-07-19	2026-07-21 08:29:48.907	ADMIN_HISTORICAL:NEW
cmrue7ruj00y2lq019dps8fp4	cmrue7rui00y0lq01w0c25023	cmpazudle00byp401oz4zx3e1	cmr908w0a00cbmm01mcln1o2j	2026-07-19	2026-07-21 08:29:55.772	ADMIN_HISTORICAL:NEW
cmrue8omt00y6lq013rkn2330	cmrue8oms00y4lq01stx4jgqy	cmqf2b3xg0001wmtsjmoqct8a	cmr908w0a00cbmm01mcln1o2j	2026-07-19	2026-07-21 08:30:38.262	ADMIN_HISTORICAL:NEW
cmruedzm400yclq012vus7cvl	cmruedzm200yalq013x03donj	cmpi6ban400fip401ppm9o7wy	cmruedfem00y8lq01ymu9agj8	2026-07-16	2026-07-21 08:34:45.773	ADMIN_HISTORICAL:NEW
cmruf2ivo00yrlq01larodji8	cmruf2ivm00yplq01tyalwcfn	cmpuxbc7900i9p401d4rkyuom	cmr908w2400d0mm01op9pxsuj	2026-07-15	2026-07-21 08:53:50.484	ADMIN_HISTORICAL:NEW
cmruf3kir00yvlq014rnbtov7	cmruf3kip00ytlq01tgyhahki	cmpuxbc7900i9p401d4rkyuom	cmr908vze00c4mm01ubuybd8c	2026-07-17	2026-07-21 08:54:39.267	ADMIN_HISTORICAL:NEW
cmruf748900yzlq01fec1v3k9	cmruf748700yxlq01dgxbxn32	cmp6ywfdb0055p401dvfsqap4	cmr908vz600c1mm01l0z41ey8	2026-07-17	2026-07-21 08:57:24.777	ADMIN_HISTORICAL:NEW
cmrum9xnp00zhlq01fq1d0zg4	cmrum9xnn00zflq01ykzn3h0c	cmqur46xc00jno701ceuxfoxy	cmqrxn8zz0013o701zzhu0cgw	2026-06-24	2026-07-21 12:15:33.542	ADMIN_HISTORICAL:NEW
cmrumbjfv00zllq01lgn4g7sr	cmrumbjfu00zjlq01odwu9ozy	cmqur46xc00jno701ceuxfoxy	cmqsacn6b00gxo70150y9si1o	2026-06-26	2026-07-21 12:16:48.427	ADMIN_HISTORICAL:NEW
cmrumc8g100zplq017fk2verv	cmrumc8g000znlq017kpznywd	cmqur46xc00jno701ceuxfoxy	cmqzaux6n003pmg01nyaurvwj	2026-06-29	2026-07-21 12:17:20.834	ADMIN_HISTORICAL:NEW
cmrumddqg00ztlq01bq8kqktw	cmrumddqe00zrlq017nh12cly	cmqur46xc00jno701ceuxfoxy	cmqzbb1ri004jmg016sdmj53b	2026-07-01	2026-07-21 12:18:14.345	ADMIN_HISTORICAL:NEW
cmrume00q00zxlq01oa9lin3q	cmrume00p00zvlq018e5wr418	cmqur46xc00jno701ceuxfoxy	cmqzbqwev005hmg01ijekhjxx	2026-07-03	2026-07-21 12:18:43.227	ADMIN_HISTORICAL:NEW
cmruv1omh0009o90182kzyjya	cmruv1ome0007o9013omse7fm	cmrdak4v0002wmn01j2my021k	cmrix5g6e00o2mn018y4e1pf0	2026-07-20	2026-07-21 16:21:05.129	ADMIN_HISTORICAL:NEW
cmruv1zef000do90185c3ib9s	cmruv1zee000bo9018qb5npzs	cmrdalmpn0035mn01esii22rz	cmrix5g6e00o2mn018y4e1pf0	2026-07-20	2026-07-21 16:21:19.096	ADMIN_HISTORICAL:NEW
cmruv2jn0000ho901aemchdqc	cmruv2jmx000fo901ecwsyncu	cmr0e8q3k009bmg01p00ba0nx	cmrix5g6g00o3mn01hdoi98nv	2026-07-20	2026-07-21 16:21:45.324	ADMIN_HISTORICAL:NEW
cmrwdhqxg000kn301m4utb5mc	cmrwdhqxd000in301fearthmh	cmqur46xc00jno701ceuxfoxy	cmrix5g5700nqmn0194rr3fv0	2026-07-21	2026-07-22 17:45:13.877	ADMIN_HISTORICAL:NEW
cmrxi7s0y002gn3017kad177q	cmrxi7s0v002en301g5m6213f	cmqw8ec6p0010mg01ce7hdn33	cmrix5g5100nomn010vza0qy5	2026-07-20	2026-07-23 12:45:12.995	ADMIN_HISTORICAL:NEW
cmrxi8cep002kn3019xltcqw4	cmrxi8cen002in301xmnwebg7	cmps12dpz00hvp401tesxyqev	cmrix5g5100nomn010vza0qy5	2026-07-20	2026-07-23 12:45:39.409	ADMIN_HISTORICAL:NEW
cmrxi94xl002on3015mdoxb2y	cmrxi94xj002mn301ur2t9srx	cmraefj5300hzmm01gbupayou	cmrix5g5400npmn01vxhayl3g	2026-07-20	2026-07-23 12:46:16.377	ADMIN_HISTORICAL:NEW
cmrxi9ibk002sn301tl1faqxa	cmrxi9ibj002qn3012bgk339a	cmr54gw0r009omm01n0aos5l6	cmrix5g5400npmn01vxhayl3g	2026-07-20	2026-07-23 12:46:33.728	ADMIN_HISTORICAL:NEW
cmrxia45c002wn301icwf9s05	cmrxia45b002un3015xi2frei	cmruxkruh000ro901qcd982u7	cmrix5g5400npmn01vxhayl3g	2026-07-20	2026-07-23 12:47:02.017	ADMIN_HISTORICAL:NEW
cmrxiac7p0030n301oinoe5gj	cmrxiac7o002yn301iabora0k	cmruxoqq5000zo901ix6vukw5	cmrix5g5400npmn01vxhayl3g	2026-07-20	2026-07-23 12:47:12.47	ADMIN_HISTORICAL:NEW
cmrxie5ij0034n301sih1kkud	cmrxie5ih0032n301lqsbj5fi	cmpb26l0900ccp4014tau0gjw	cmrix5g5f00nsmn01ngqh0zx6	2026-07-21	2026-07-23 12:50:10.412	ADMIN_HISTORICAL:NEW
cmrxiehaz0038n301drux6kb7	cmrxiehay0036n301pi2opv8k	cmp6me3mt002yp401esc9ykn5	cmrix5g5f00nsmn01ngqh0zx6	2026-07-21	2026-07-23 12:50:25.692	ADMIN_HISTORICAL:NEW
cmrxig8qq003an301yr7impdm	cmrumu1i30101lq01ba6acw1q	cmqnnz1kg00d8od0103g8czza	cmrix5g5p00nvmn013lr7rusv	2026-07-21	2026-07-23 12:51:47.906	ADMIN_HISTORICAL:BOOKED
cmrxik69z003hn30166csf5c7	cmrxik69w003fn301sy7yg2fg	cmp5d9vn5006zl401fo5j5q04	cmrxijj23003cn301zy341lim	2026-07-21	2026-07-23 12:54:51.335	ADMIN_HISTORICAL:NEW
cmrxil2dh003ln301g8bol81v	cmrxil2dg003jn3016ssp5nn2	cmqno2ywp00dfod01x3mtrdjg	cmrix5g5s00nwmn014zjhvdkz	2026-07-21	2026-07-23 12:55:32.934	ADMIN_HISTORICAL:NEW
cmrximl0d003pn301dy97oal5	cmrximl0c003nn301d5ea00qr	cmqnjmmn900ceod01dz6unzwp	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	2026-07-23 12:56:43.742	ADMIN_HISTORICAL:NEW
cmrximxt9003tn301mm2rn0d5	cmrximxt7003rn301pcco13z1	cmqrwntpy0016sc0146g80wvq	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	2026-07-23 12:57:00.333	ADMIN_HISTORICAL:NEW
cmrxin69x003xn301vfteutfk	cmrxin69v003vn301b3nsmzb1	cmqqipr55001fp9010qryqpgy	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	2026-07-23 12:57:11.301	ADMIN_HISTORICAL:NEW
cmrxinfwb0041n301v7cu1vk8	cmrxinfwa003zn301170c58ho	cmqqio1g50018p9018hz9fq36	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	2026-07-23 12:57:23.771	ADMIN_HISTORICAL:NEW
cmrxinmoz0045n301caxd5d7e	cmrxinmox0043n301elo7c4b4	cmqqija83000up901vbrlsocv	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	2026-07-23 12:57:32.58	ADMIN_HISTORICAL:NEW
cmrxipw710049n301pzt7d7dp	cmrxipw700047n301bq9ec353	cmrbwaec5001dmn01can4i9wf	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	2026-07-23 12:59:18.205	ADMIN_HISTORICAL:NEW
cmrxiq208004dn30104ltcnk3	cmrxiq206004bn301xwc06q8d	cmrbw6y2c0014mn01a6ii4tiu	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	2026-07-23 12:59:25.736	ADMIN_HISTORICAL:NEW
cmrxiqa3u004hn301wzgp1jmr	cmrxiqa3s004fn3016tgj0984	cmp6ywfdb0055p401dvfsqap4	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	2026-07-23 12:59:36.234	ADMIN_HISTORICAL:NEW
cmrxiqic0004ln301nom7ykkf	cmrxiqiby004jn3013eu2nnnp	cmrwe3svz000mn3011way6tzi	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	2026-07-23 12:59:46.896	ADMIN_HISTORICAL:NEW
cmrxisq42004qn301arsrqi3d	cmrxisq40004on3011n470mdn	cmqur46xc00jno701ceuxfoxy	cmrix5g6j00o4mn01cwwkhd5f	2026-07-22	2026-07-23 13:01:30.29	ADMIN_HISTORICAL:NEW
cmrxitc20004un301kin18ea1	cmrxitc1z004sn301cf124nxn	cmrwed60g000un301vg8ksj6i	cmrix5g6300nzmn016so9a0e3	2026-07-22	2026-07-23 13:01:58.729	ADMIN_HISTORICAL:NEW
cmrxiuq5c004yn301cc29j02t	cmrxiuq5a004wn301lcviiez3	cmps12dpz00hvp401tesxyqev	cmrix5g2200mzmn01zn08uvd2	2026-07-22	2026-07-23 13:03:03.649	ADMIN_HISTORICAL:NEW
cmrxiv04a0052n301921mrz4x	cmrxiv0490050n301mlk8sllx	cmqf2b3xg0001wmtsjmoqct8a	cmrix5g2200mzmn01zn08uvd2	2026-07-22	2026-07-23 13:03:16.571	ADMIN_HISTORICAL:NEW
cmrxivp1y0056n301gb0t01wn	cmrxivp1w0054n30179p3xeyc	cmqw8ec6p0010mg01ce7hdn33	cmrix5g2f00n1mn0185zxtut4	2026-07-22	2026-07-23 13:03:48.886	ADMIN_HISTORICAL:NEW
cmrxivvlo005an301osqr4uwj	cmrxivvln0058n301zpp9p4p1	cmpuxgfvo00iep401kuin241v	cmrix5g2f00n1mn0185zxtut4	2026-07-22	2026-07-23 13:03:57.373	ADMIN_HISTORICAL:NEW
cmrxmsnb0005in301ka2nh867	cmrxmsnay005gn301fi9tshj1	cmruxoqq5000zo901ix6vukw5	cmr908w2700d1mm018fjay3hf	2026-07-15	2026-07-23 14:53:25.117	ADMIN_HISTORICAL:NEW
cmrxmtc6y005mn301jrd4etxr	cmrxmtc6w005kn301g2gwwylj	cmruxkruh000ro901qcd982u7	cmr908w2700d1mm018fjay3hf	2026-07-15	2026-07-23 14:53:57.37	ADMIN_HISTORICAL:NEW
cmrxmxrnk005qn301nmr6x0f4	cmrxmxrni005on301nay6rldx	cmrnml84b00kwlq01sw6qm4zc	cmrajn85w00krmm01ek4beq4i	2026-07-16	2026-07-23 14:57:24.033	ADMIN_HISTORICAL:NEW
cmrxnqvfs0060n301z9flg8zc	cmrxnqvfq005yn301e5z06tkf	cmqp4ky050002lk01gx0v2tv9	cmr908vz600c1mm01l0z41ey8	2026-07-17	2026-07-23 15:20:01.96	ADMIN_HISTORICAL:NEW
cmrxnusu3006an301ac0mkg88	cmrxnusu10068n301ndr7zbdk	cmqp4ky050002lk01gx0v2tv9	cmr908w0000c9mm01mtivvn2w	2026-07-19	2026-07-23 15:23:05.212	ADMIN_HISTORICAL:NEW
cms3gprj300aen301duz23uve	cms3gprj000acn301z6ra42b9	cmp5i45nq000ap401mr5kujgq	cmrix5g2n00n4mn013270gc7s	2026-07-23	2026-07-27 16:49:49.983	ADMIN_HISTORICAL:NEW
cms3gpww700ain301fr25kyvn	cms3gpww600agn301kufd41z7	cmp6mh9mn0033p401xa6v43p7	cmrix5g2n00n4mn013270gc7s	2026-07-23	2026-07-27 16:49:56.936	ADMIN_HISTORICAL:NEW
cms3gw7wk00aqn301xtyc6i2h	cms3gw7wi00aon30198yg50rn	cmp5d9vn5006zl401fo5j5q04	cmrix5g2q00n5mn01trk8ai08	2026-07-23	2026-07-27 16:54:51.14	ADMIN_HISTORICAL:NEW
cms3gwvik00ayn301ao7vkgbx	cms3gwvij00awn30108epnb93	cmpb26l0900ccp4014tau0gjw	cmrix5g2q00n5mn01trk8ai08	2026-07-23	2026-07-27 16:55:21.741	ADMIN_HISTORICAL:NEW
cms3gxnez00b2n301s4h6gp2l	cms3gxnew00b0n3018o2ngp9j	cmrnrrjxa00lblq014meynmha	cmrix5g2q00n5mn01trk8ai08	2026-07-23	2026-07-27 16:55:57.899	ADMIN_HISTORICAL:NEW
cms3gxyk200b6n3017y7688ve	cms3gxyk100b4n301gfnnw44w	cmp87ym20006yp401590xadl0	cmrix5g2q00n5mn01trk8ai08	2026-07-23	2026-07-27 16:56:12.338	ADMIN_HISTORICAL:NEW
cms3gycxf00ban301ks0qv6qv	cms3gycxe00b8n301ibfbpuda	cmpya6nur00kgp401et6xel9m	cmrix5g2q00n5mn01trk8ai08	2026-07-23	2026-07-27 16:56:30.963	ADMIN_HISTORICAL:NEW
cms3h1d5k00bgn301337mjxks	cms3h1d5h00ben3011u2ks15q	cmp6mxgtj003np401n6d3md2o	cms3h0x0a00bcn301sbprbh9i	2026-07-23	2026-07-27 16:58:51.224	ADMIN_HISTORICAL:NEW
cms3h30o500bkn3013lrz5ks5	cms3h30o400bin301skskq22f	cmr91dvvk00ddmm01yvoi91dd	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	2026-07-27 17:00:08.358	ADMIN_HISTORICAL:NEW
cms3h3mhv00bon301eqq7ljub	cms3h3mhu00bmn301ow9ua4se	cmqf2b3z80007wmtsodeuow25	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	2026-07-27 17:00:36.644	ADMIN_HISTORICAL:NEW
cms3h5b8200bsn3019bp57tcx	cms3h5b8100bqn3017evyxv05	cmrbure45000vmn014ppcw3bv	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	2026-07-27 17:01:55.347	ADMIN_HISTORICAL:NEW
cms3h5fec00bwn301kjqc9ewy	cms3h5fea00bun301so7rmkqz	cmrbunzzo000mmn01dkqpill6	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	2026-07-27 17:02:00.756	ADMIN_HISTORICAL:NEW
cms3h6id700c0n301wme8iipk	cms3h6id500byn3012ulyzc1l	cmpwo5qcf00jgp401y23i6i2r	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	2026-07-27 17:02:51.259	ADMIN_HISTORICAL:NEW
cms3h6xzs00c4n301rt49fk51	cms3h6xzr00c2n301ykvkvcc9	cmp80zids006np4015qmgm2k4	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	2026-07-27 17:03:11.513	ADMIN_HISTORICAL:NEW
cms3hai9400c8n3017mkoastw	cms3hai9100c6n301jja2fexb	cmqnjhe4500c7od01xunmmhyz	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	2026-07-27 17:05:57.737	ADMIN_HISTORICAL:NEW
cms3harhk00ccn3017l3kilbh	cms3harhj00can301asanwn90	cmr3dno9x008vmm01yn5zbnx3	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	2026-07-27 17:06:09.705	ADMIN_HISTORICAL:NEW
cms3hepb600cgn301i6opm8dm	cms3hepb500cen30140xz3vsw	cmp5i45nq000ap401mr5kujgq	cmrix5g3500namn01d6q34xfu	2026-07-24	2026-07-27 17:09:13.507	ADMIN_HISTORICAL:NEW
cms3hhnam00con301shuhbq1p	cms3hhnak00cmn3015ux4veoq	cmrdadhtm001wmn01ebkmguat	cmrix5g3700nbmn01utknxxky	2026-07-24	2026-07-27 17:11:30.862	ADMIN_HISTORICAL:NEW
cms3hm88n00cun3017fr8263i	cms3hm88l00csn301v28w6au7	cmrwed60g000un301vg8ksj6i	cmrix5g3700nbmn01utknxxky	2026-07-24	2026-07-27 17:15:04.632	ADMIN_HISTORICAL:NEW
cms3hoydc00cyn301lkq7bf36	cms3hoyda00cwn3016m3y9r19	cmqw8ilsb001emg0158v8etes	cmrix5g3a00ncmn018gebhfc1	2026-07-24	2026-07-27 17:17:11.809	ADMIN_HISTORICAL:NEW
cms3hp62400d2n301m6i3rml6	cms3hp62200d0n3011s340jmv	cmqw8ha3o0017mg010cohkf7t	cmrix5g3a00ncmn018gebhfc1	2026-07-24	2026-07-27 17:17:21.772	ADMIN_HISTORICAL:NEW
cms3hpime00d6n301n1p49si4	cms3hpimd00d4n3012qrak10j	cmrdak4v0002wmn01j2my021k	cmrix5g3a00ncmn018gebhfc1	2026-07-24	2026-07-27 17:17:38.055	ADMIN_HISTORICAL:NEW
cms3hprzy00dan301su88av5n	cms3hprzw00d8n301j7s9rbja	cmrdalmpn0035mn01esii22rz	cmrix5g3a00ncmn018gebhfc1	2026-07-24	2026-07-27 17:17:50.206	ADMIN_HISTORICAL:NEW
cms3hqixl00den301v59taw0d	cms3hqixk00dcn301diqi8cgc	cmpuxyh5x00itp401pqas19s7	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	2026-07-27 17:18:25.114	ADMIN_HISTORICAL:NEW
cms3hqrgt00din301tbrbbwal	cms3hqrgs00dgn301fo0hq9vt	cms35x3i0009kn301kd28orpb	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	2026-07-27 17:18:36.174	ADMIN_HISTORICAL:NEW
cms3hrp4w00dmn301tncvfjgb	cms3hrp4v00dkn301xzrp7o7e	cms362k9k009sn3012zp10a99	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	2026-07-27 17:19:19.808	ADMIN_HISTORICAL:NEW
cms3hs2o000dqn301xku97nvz	cms3hs2ny00don301mbpy2s62	cms35lfky009cn301i7ou31cd	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	2026-07-27 17:19:37.344	ADMIN_HISTORICAL:NEW
cms3hspq400dun301t980lc95	cms3hspq300dsn3013lkyimya	cmp6maci6002tp40119cnxlu3	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	2026-07-27 17:20:07.228	ADMIN_HISTORICAL:NEW
cms3hvf2500dyn301ff0kefic	cms3hvf2300dwn301cwvar8gp	cmp5qzr8e001ap401fa4uuzw4	cmrix5g3l00nemn01nkgvmio8	2026-07-24	2026-07-27 17:22:13.373	ADMIN_HISTORICAL:NEW
cms3hvlmu00e2n301fohxktbd	cms3hvlmt00e0n3011m27mgjq	cmp5qutpd0015p401e0b83fu9	cmrix5g3l00nemn01nkgvmio8	2026-07-24	2026-07-27 17:22:21.894	ADMIN_HISTORICAL:NEW
cms3hwgdg00e6n301rfq5ibac	cms3hwgde00e4n301k2dw88rh	cmqw8ec6p0010mg01ce7hdn33	cmrix5g3l00nemn01nkgvmio8	2026-07-24	2026-07-27 17:23:01.732	ADMIN_HISTORICAL:NEW
cms3hwrf500ean301zhgw5v7e	cms3hwrf400e8n301ml8c5wm0	cmqno2ywp00dfod01x3mtrdjg	cmrix5g3l00nemn01nkgvmio8	2026-07-24	2026-07-27 17:23:16.05	ADMIN_HISTORICAL:NEW
cms3hx0wm00een301v2goeh08	cms3hx0wk00ecn301f9ycm50g	cmrwe3svz000mn3011way6tzi	cmrix5g3l00nemn01nkgvmio8	2026-07-24	2026-07-27 17:23:28.342	ADMIN_HISTORICAL:NEW
cms3hx7dt00ein301tq2yexmi	cms3hx7ds00egn301pkn2wcn0	cmp6ywfdb0055p401dvfsqap4	cmrix5g3l00nemn01nkgvmio8	2026-07-24	2026-07-27 17:23:36.737	ADMIN_HISTORICAL:NEW
cms3hz6z500eqn301136svkgs	cms3hz6z300eon3019ggk3p77	cmqf2b43f0011wmts29fvfire	cmrix5g3q00nfmn015smlq1xu	2026-07-24	2026-07-27 17:25:09.521	ADMIN_HISTORICAL:NEW
cms3hzt9000eun301adcy97pt	cms3hzt8z00esn301p4w6fyws	cmruxkruh000ro901qcd982u7	cmrix5g3q00nfmn015smlq1xu	2026-07-24	2026-07-27 17:25:38.389	ADMIN_HISTORICAL:NEW
cms3i013u00eyn301lm9gx87d	cms3i013t00ewn301pym3r87d	cmruxoqq5000zo901ix6vukw5	cmrix5g3q00nfmn015smlq1xu	2026-07-24	2026-07-27 17:25:48.571	ADMIN_HISTORICAL:NEW
cms3i0au500f2n30149kr2rsz	cms3i0au300f0n3014p2vjsxz	cmrbure45000vmn014ppcw3bv	cmrix5g3q00nfmn015smlq1xu	2026-07-24	2026-07-27 17:26:01.181	ADMIN_HISTORICAL:NEW
cms3i0jqy00f6n3012o8kqxo5	cms3i0jqw00f4n301nc5avn24	cmrbunzzo000mmn01dkqpill6	cmrix5g3q00nfmn015smlq1xu	2026-07-24	2026-07-27 17:26:12.73	ADMIN_HISTORICAL:NEW
cms3i7ti900fan301n0wed9bw	cms3i7ti600f8n3015cm6rqsu	cmp5d9vn5006zl401fo5j5q04	cmrix5g4300nimn01y497k43n	2026-07-25	2026-07-27 17:31:51.97	ADMIN_HISTORICAL:NEW
cms3i8dn700fen3014vovfzo0	cms3i8dn600fcn3010np7wyo5	cmp6mujhf003ip4019yxl5iri	cmrix5g4300nimn01y497k43n	2026-07-25	2026-07-27 17:32:18.068	ADMIN_HISTORICAL:NEW
cms3i8x8z00fin301peeeyqzl	cms3i8x8y00fgn301htb3tzx4	cmr91dvvk00ddmm01yvoi91dd	cmrix5g4700njmn01bwfs64se	2026-07-26	2026-07-27 17:32:43.475	ADMIN_HISTORICAL:NEW
cms3idbfx00fqn301mbo70y3z	cms3idbfv00fon301ndtvknxd	cmrwed60g000un301vg8ksj6i	cmrix5g4700njmn01bwfs64se	2026-07-26	2026-07-27 17:36:08.493	ADMIN_HISTORICAL:NEW
cms3idmf200fun3012jojcoy1	cms3idmf000fsn301frk42amg	cmp87ym20006yp401590xadl0	cmrix5g4700njmn01bwfs64se	2026-07-26	2026-07-27 17:36:22.718	ADMIN_HISTORICAL:NEW
cms3idswf00fyn301nmzp5pqw	cms3idswd00fwn301lc36n61i	cmrdrcgat00kumn0112odkalw	cmrix5g4700njmn01bwfs64se	2026-07-26	2026-07-27 17:36:31.119	ADMIN_HISTORICAL:NEW
cms3ih98700g2n3014by9yu2z	cms3ih98600g0n301t8w4gnn3	cmp6mujhf003ip4019yxl5iri	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	2026-07-27 17:39:12.248	ADMIN_HISTORICAL:NEW
cms3ihkty00g6n301lwyrp902	cms3ihktx00g4n3010ym3wzl3	cmpuxbc7900i9p401d4rkyuom	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	2026-07-27 17:39:27.287	ADMIN_HISTORICAL:NEW
cms3ijvw000gan301855ef02b	cms3ijvvx00g8n301u4rmdlgz	cms365esm00a0n3016r7lmgxk	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	2026-07-27 17:41:14.928	ADMIN_HISTORICAL:NEW
cms3ik2oe00gen3010sadjhq5	cms3ik2oc00gcn3018ylqe5gp	cmpfpx1dd00ekp4015zb7hrup	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	2026-07-27 17:41:23.726	ADMIN_HISTORICAL:NEW
cms3ikzme00gin3016x0bpr1q	cms3ikzmc00ggn30144eccz7j	cmp5d9vn5006zl401fo5j5q04	cmrix5g4i00nlmn01csonnu9x	2026-07-26	2026-07-27 17:42:06.422	ADMIN_HISTORICAL:NEW
cms3lf4tg00i0n301rd7h2c89	cms3lf4td00hyn301e66d05xc	cmrf1usfb00lkmn01msecwoo3	cmrix5g3700nbmn01utknxxky	2026-07-24	2026-07-27 19:01:32.069	ADMIN_HISTORICAL:NEW
cms4nhk4v00iwn301o4zu9mrj	cms4nhk4t00iun301ct87cutu	cmqw8ilsb001emg0158v8etes	cmrt646pm00mqlq01cvviopma	2026-07-27	2026-07-28 12:47:10.64	ADMIN_HISTORICAL:NEW
cms4nhxth00j0n3019u9iglky	cms4nhxtf00iyn301aqkbphjg	cmqw8ha3o0017mg010cohkf7t	cmrt646pm00mqlq01cvviopma	2026-07-27	2026-07-28 12:47:28.373	ADMIN_HISTORICAL:NEW
cms4ni7oa00j4n301z7je6mqb	cms4ni7o800j2n3017ubz3mbu	cmp5d9vn5006zl401fo5j5q04	cmrt646pm00mqlq01cvviopma	2026-07-27	2026-07-28 12:47:41.146	ADMIN_HISTORICAL:NEW
cms4nindt00j8n301hggiq4m5	cms4nindr00j6n3011uolii51	cmrdadhtm001wmn01ebkmguat	cmrt646pm00mqlq01cvviopma	2026-07-27	2026-07-28 12:48:01.505	ADMIN_HISTORICAL:NEW
cms4nk8v300jcn301rjkyqqtl	cms4nk8v200jan301y1bjghxp	cmqqifegn000gp901x4b3a61j	cmrt646u000nplq01at0yofsd	2026-07-27	2026-07-28 12:49:15.999	ADMIN_HISTORICAL:NEW
cms4nklr400jgn301r937qx2y	cms4nklr100jen301o6rctant	cms3kn6uo00h2n301qm5snmp2	cmrt646u000nplq01at0yofsd	2026-07-27	2026-07-28 12:49:32.705	ADMIN_HISTORICAL:NEW
cms4nkybg00jkn3010f05ov19	cms4nkybe00jin301wish1ahg	cms3kr38500han30115yyomyb	cmrt646u000nplq01at0yofsd	2026-07-27	2026-07-28 12:49:48.988	ADMIN_HISTORICAL:NEW
cms4nm25200jon3018zogm4o5	cms4nm25000jmn301wo03xqi3	cmqw8ec6p0010mg01ce7hdn33	cmrt646sn00nclq01tp2531mh	2026-07-27	2026-07-28 12:50:40.598	ADMIN_HISTORICAL:NEW
cms4nme8p00jsn301u02a97d5	cms4nme8o00jqn3019gh7jubo	cmqqihcm6000np901ub12rzon	cmrt646sn00nclq01tp2531mh	2026-07-27	2026-07-28 12:50:56.282	ADMIN_HISTORICAL:NEW
cms4nn23300jwn3017r5e0718	cms4nn23200jun301drm7lugo	cmr66zk2400b3mm01nzav5tty	cmrt646sn00nclq01tp2531mh	2026-07-27	2026-07-28 12:51:27.183	ADMIN_HISTORICAL:NEW
cms4nnfk200k0n301kekwcw0i	cms4nnfk000jyn301q69yxrhf	cmr1tvvf8001fmm01nvgjy6v9	cmrt646sn00nclq01tp2531mh	2026-07-27	2026-07-28 12:51:44.642	ADMIN_HISTORICAL:NEW
cms4nnw2c00k4n301r067fb5g	cms4nnw2b00k2n301xpgyu73s	cmps12dpz00hvp401tesxyqev	cmrt646sn00nclq01tp2531mh	2026-07-27	2026-07-28 12:52:06.036	ADMIN_HISTORICAL:NEW
cms4nxgsm00kcn301zqjxtfft	cms4nxgsk00kan3015yk1z9w2	cmr54gw0r009omm01n0aos5l6	cmrt646sq00ndlq016h4ggo4t	2026-07-27	2026-07-28 12:59:32.807	ADMIN_HISTORICAL:NEW
cms4nxxhw00kgn301kmxfnh3j	cms4nxxhv00ken30151hsao7o	cmp5qutpd0015p401e0b83fu9	cmrt646sq00ndlq016h4ggo4t	2026-07-27	2026-07-28 12:59:54.452	ADMIN_HISTORICAL:NEW
cms4nycf200kkn3019b088ig8	cms4nycf100kin301ih95kak6	cmp5qzr8e001ap401fa4uuzw4	cmrt646sq00ndlq016h4ggo4t	2026-07-27	2026-07-28 13:00:13.79	ADMIN_HISTORICAL:NEW
cms4o84w000kqn301x8h6w0a2	cms4o84vy00kon301c7tre37d	cmr6940rg00bemm01s11l95mw	cmrt646sq00ndlq016h4ggo4t	2026-07-27	2026-07-28 13:07:50.592	ADMIN_HISTORICAL:NEW
cms4o8rz300kun301rkf6j4ro	cms4o8rz200ksn3015ksye36z	cmp5dd5sd0074l401pv3drst8	cmrt646sq00ndlq016h4ggo4t	2026-07-27	2026-07-28 13:08:20.511	ADMIN_HISTORICAL:NEW
cms4oc8ku00l4n3019ksshm7m	cms4oc8ks00l2n301melf35b5	cms35x3i0009kn301kd28orpb	cmrt646sq00ndlq016h4ggo4t	2026-07-27	2026-07-28 13:11:01.998	ADMIN_HISTORICAL:NEW
cms4of5p000l8n301xycq9nh1	cms4of5oy00l6n301funbw5zy	cms3kei3j00gmn301mhqotbc4	cmrix5g4700njmn01bwfs64se	2026-07-26	2026-07-28 13:13:18.229	ADMIN_HISTORICAL:NEW
cms4og1js00lcn3018x87t4v8	cms4og1jr00lan3014f8v8wma	cmqp4ky050002lk01gx0v2tv9	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	2026-07-28 13:13:59.513	ADMIN_HISTORICAL:NEW
cms4q56gi00lzn301q3p0f6lk	cms4q56gg00lxn301uqmtl97x	cms362k9k009sn3012zp10a99	cmrix5g4700njmn01bwfs64se	2026-07-26	2026-07-28 14:01:31.89	ADMIN_HISTORICAL:NEW
cms4q5hb300m3n301k4hh7mrn	cms4q5hb200m1n301lqskagao	cmrri21yv00m2lq01gugwiiyq	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	2026-07-28 14:01:45.952	ADMIN_HISTORICAL:NEW
cms63isal0029k101os5ckfvj	cms63isai0027k101l87x2ku4	cmp6n9pyb0047p401exgskztu	cmrt646t200nglq011fg40dno	2026-07-28	2026-07-29 13:03:47.902	ADMIN_HISTORICAL:NEW
cms63j5uo002dk1015cg5m8sl	cms63j5um002bk101n50glr2h	cmrf1usfb00lkmn01msecwoo3	cmrt646t200nglq011fg40dno	2026-07-28	2026-07-29 13:04:05.472	ADMIN_HISTORICAL:NEW
cms63ksan002hk101ibquiktz	cms63ksam002fk101f8w42i8t	cmqp4ky050002lk01gx0v2tv9	cmrt646ud00ntlq01qxuz53eg	2026-07-28	2026-07-29 13:05:21.216	ADMIN_HISTORICAL:NEW
cms63m8wl002lk101zibs9omd	cms63m8wi002jk101m8udrv5j	cmrwed60g000un301vg8ksj6i	cmrt646uf00nulq0145dvchqs	2026-07-28	2026-07-29 13:06:29.397	ADMIN_HISTORICAL:NEW
cms63s3yp002pk101h97lxzng	cms63s3yo002nk1015lfc04gp	cmqf2b3xg0001wmtsjmoqct8a	cmrt646t800nhlq01y7vjtyig	2026-07-28	2026-07-29 13:11:02.93	ADMIN_HISTORICAL:NEW
cms63szja002tk1015cplayjw	cms63szj8002rk101eiqyhtej	cmrdak4v0002wmn01j2my021k	cmrt646t800nhlq01y7vjtyig	2026-07-28	2026-07-29 13:11:43.847	ADMIN_HISTORICAL:NEW
cms63tma1002xk101gnwbicxg	cms63tm9z002vk1019o793nrb	cmrdalmpn0035mn01esii22rz	cmrt646t800nhlq01y7vjtyig	2026-07-28	2026-07-29 13:12:13.321	ADMIN_HISTORICAL:NEW
cms63v6wu0031k1010k7cas2f	cms63v6ws002zk101m94wvw2n	cms4v82l8000nml0184j2mtyd	cmrt646tf00nilq01uijk7vbb	2026-07-28	2026-07-29 13:13:26.719	ADMIN_HISTORICAL:NEW
cms63vm2t0035k1017wiugfer	cms63vm2s0033k101w5ofk3cr	cmqnnz1kg00d8od0103g8czza	cmrt646tf00nilq01uijk7vbb	2026-07-28	2026-07-29 13:13:46.374	ADMIN_HISTORICAL:NEW
cms63xom00039k1013zmjjb07	cms63xolz0037k101lk8esuh6	cms3kuoyo00hin301dzucqsrq	cmrt646tf00nilq01uijk7vbb	2026-07-28	2026-07-29 13:15:22.969	ADMIN_HISTORICAL:NEW
cms63yvcc003dk101hqqfuq51	cms63yvcb003bk101pxromli3	cmrbure45000vmn014ppcw3bv	cmrt646tj00njlq01sc8ry7bp	2026-07-28	2026-07-29 13:16:18.349	ADMIN_HISTORICAL:NEW
cms640sas0041k101c77hn2ox	cms640sar003zk1016ajq0cw1	cmrbunzzo000mmn01dkqpill6	cmrt646tj00njlq01sc8ry7bp	2026-07-28	2026-07-29 13:17:47.717	ADMIN_HISTORICAL:NEW
cms6410pl0045k101sr8b6i5q	cms6410pj0043k1011anz7k7w	cmpuxbc7900i9p401d4rkyuom	cmrt646tj00njlq01sc8ry7bp	2026-07-28	2026-07-29 13:17:58.617	ADMIN_HISTORICAL:NEW
cms6418i50049k1016make6dr	cms6418i30047k101rcebsfmy	cmp5dd5sd0074l401pv3drst8	cmrt646tj00njlq01sc8ry7bp	2026-07-28	2026-07-29 13:18:08.717	ADMIN_HISTORICAL:NEW
cms641g5n004dk1017r8pp8lh	cms641g5m004bk10187wjwgym	cmpfpx1dd00ekp4015zb7hrup	cmrt646tj00njlq01sc8ry7bp	2026-07-28	2026-07-29 13:18:18.636	ADMIN_HISTORICAL:NEW
cms641sxo004hk101pl0b1bu6	cms641sxm004fk101f81g2bo6	cmrwe3svz000mn3011way6tzi	cmrt646tm00nklq01aidpf9xo	2026-07-28	2026-07-29 13:18:35.197	ADMIN_HISTORICAL:NEW
cms6421pg004lk101bf7i3202	cms6421pd004jk101iigz78v8	cmqf2b42m000vwmtsnd6eu11l	cmrt646tm00nklq01aidpf9xo	2026-07-28	2026-07-29 13:18:46.564	ADMIN_HISTORICAL:NEW
cms64295v004pk1013ykt0kut	cms64295u004nk101ppl9ny0x	cmqqipr55001fp9010qryqpgy	cmrt646tm00nklq01aidpf9xo	2026-07-28	2026-07-29 13:18:56.227	ADMIN_HISTORICAL:NEW
cms642e1m004tk101pncznwf6	cms642e1k004rk101hz8fbw1l	cmqqio1g50018p9018hz9fq36	cmrt646tm00nklq01aidpf9xo	2026-07-28	2026-07-29 13:19:02.554	ADMIN_HISTORICAL:NEW
cms642lfx004xk101n0hgs6zl	cms642lfw004vk1017z5clba4	cmqqija83000up901vbrlsocv	cmrt646tm00nklq01aidpf9xo	2026-07-28	2026-07-29 13:19:12.141	ADMIN_HISTORICAL:NEW
cms642s8y0051k101n80xtcv1	cms642s8x004zk101mxgjkebg	cmr1tvvf8001fmm01nvgjy6v9	cmrt646tm00nklq01aidpf9xo	2026-07-28	2026-07-29 13:19:20.962	ADMIN_HISTORICAL:NEW
cms643vy00055k101fawhivpo	cms643vxy0053k1012i24gi00	cmrbwaec5001dmn01can4i9wf	cmrt646pp00mrlq01tm5scppj	2026-07-28	2026-07-29 13:20:12.408	ADMIN_HISTORICAL:NEW
cms6444v50059k101tl2v064q	cms6444v40057k101r5x5pvpu	cmrbw6y2c0014mn01a6ii4tiu	cmrt646pp00mrlq01tm5scppj	2026-07-28	2026-07-29 13:20:23.969	ADMIN_HISTORICAL:NEW
cms679bgt0007mo010evi1ulo	cms679bgr0005mo01hq63o6yn	cmpb26l0900ccp4014tau0gjw	cmrt646t200nglq011fg40dno	2026-07-28	2026-07-29 14:48:24.654	ADMIN_HISTORICAL:NEW
cms6dkf5d0011mo01dbauvsyr	cms6dkf5c000zmo01w4wazitl	cmqnlllpk00csod01wkefk1ot	cmrt646pp00mrlq01tm5scppj	2026-07-28	2026-07-29 17:45:00.338	ADMIN_HISTORICAL:NEW
cms6dlix40015mo01lza83aod	cms6dlix20013mo0189g6tzsx	cmqno2ywp00dfod01x3mtrdjg	cmrt646pp00mrlq01tm5scppj	2026-07-28	2026-07-29 17:45:51.88	ADMIN_HISTORICAL:NEW
cms6eykac001lmo01fxi3iocv	cms6eyka9001jmo01kr9b66gr	cmqnlllpk00csod01wkefk1ot	cmrix5g2f00n1mn0185zxtut4	2026-07-22	2026-07-29 18:23:59.796	ADMIN_HISTORICAL:NEW
cms6fcwzu001zmo01t4hhrqyx	cms6fcwzs001xmo01nuh2gm80	cmqzcgki3006umg01b9522uso	cmrix5g3200n9mn01rq7lk2vl	2026-07-24	2026-07-29 18:35:09.45	ADMIN_HISTORICAL:NEW
cms7dkh6d002bmo01emt2hkcv	cms7dkh6b0029mo01mrv5t1fi	cmqzcgki3006umg01b9522uso	cmr908w1300cmmm0155c5onnh	2026-07-14	2026-07-30 10:32:49.142	ADMIN_HISTORICAL:NEW
cms7e8jo2002fmo01jjkrubyg	cms7e8jny002dmo017ntbd4o6	cmqnjvfwv00clod01smhvf5v7	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	2026-07-30 10:51:32.114	ADMIN_HISTORICAL:NEW
cms7ebgwe002jmo017fgirrnu	cms7ebgwd002hmo015634r27o	cmpazudle00byp401oz4zx3e1	cmrt646tu00nnlq01orfp75rn	2026-07-29	2026-07-30 10:53:48.495	ADMIN_HISTORICAL:NEW
cms7ebza3002lmo01ye0c85wl	cms60mx8p0011k1014v0avtw4	cmp6mxgtj003np401n6d3md2o	cmrt646tx00nolq01k7yci8xd	2026-07-29	2026-07-30 10:54:12.315	ADMIN_HISTORICAL:BOOKED
cms7ec5zf002nmo01ex2bv6a5	cms62gm3s0023k101dg72ajas	cmqf2b3z80007wmtsodeuow25	cmrt646tx00nolq01k7yci8xd	2026-07-29	2026-07-30 10:54:21.003	ADMIN_HISTORICAL:BOOKED
cms7ecqsq002pmo018dw261qo	cms60r93l0017k101k76cex31	cmps12dpz00hvp401tesxyqev	cmrt646oy00mklq01woumqdb3	2026-07-29	2026-07-30 10:54:47.978	ADMIN_HISTORICAL:BOOKED
cms7ecxnx002tmo01wfoc2rop	cms7ecxnv002rmo01yup3sm4y	cmqnjvfwv00clod01smhvf5v7	cmrt646oy00mklq01woumqdb3	2026-07-29	2026-07-30 10:54:56.878	ADMIN_HISTORICAL:NEW
cms7ed562002vmo01r6sm6wiy	cms60t15k0019k101yv6rzk2f	cmqnjmmn900ceod01dz6unzwp	cmrt646oy00mklq01woumqdb3	2026-07-29	2026-07-30 10:55:06.603	ADMIN_HISTORICAL:BOOKED
cms7edg5t002xmo01pbv13k97	cms60vbxt001bk101gls3xwis	cmqrwntpy0016sc0146g80wvq	cmrt646oy00mklq01woumqdb3	2026-07-29	2026-07-30 10:55:20.85	ADMIN_HISTORICAL:BOOKED
cms7efyxh002zmo01mg5uh2d4	cms60ysuq001dk101pfcp5khd	cmrdrcgat00kumn0112odkalw	cmrt646p400mllq01dz1vl45e	2026-07-29	2026-07-30 10:57:18.486	ADMIN_HISTORICAL:BOOKED
cms7eg40q0033mo0158g5kl2v	cms7eg40p0031mo01h1zlbmtj	cmqp3jmsv00euod010vtuk1qt	cmrt646p400mllq01dz1vl45e	2026-07-29	2026-07-30 10:57:25.083	ADMIN_HISTORICAL:NEW
cms7egmgs0035mo01zo0byq6o	cms612qad001hk10160fe6jqs	cmqw8ec6p0010mg01ce7hdn33	cmrt646ps00mslq01wu9xrxm6	2026-07-29	2026-07-30 10:57:48.988	ADMIN_HISTORICAL:BOOKED
cms7egsdu0037mo012s4i6941	cms613drv001jk101sozu0n9y	cmrwe3svz000mn3011way6tzi	cmrt646ps00mslq01wu9xrxm6	2026-07-29	2026-07-30 10:57:56.658	ADMIN_HISTORICAL:BOOKED
cms7egwob0039mo0139cdkm4x	cms6drzu50017mo01l6xivtc9	cmpuxgfvo00iep401kuin241v	cmrt646ps00mslq01wu9xrxm6	2026-07-29	2026-07-30 10:58:02.219	ADMIN_HISTORICAL:BOOKED
cms7ehaw3003bmo01gy1avdg5	cms61cjdc001rk10132pxhqbx	cmp5qutpd0015p401e0b83fu9	cmrt646pv00mtlq01e9o4srjr	2026-07-29	2026-07-30 10:58:20.643	ADMIN_HISTORICAL:BOOKED
cms7ehfnb003dmo01s2q0ae3t	cms61d5do001vk101h6rzgpnq	cmp5qzr8e001ap401fa4uuzw4	cmrt646pv00mtlq01e9o4srjr	2026-07-29	2026-07-30 10:58:26.807	ADMIN_HISTORICAL:BOOKED
cms7ehqs4003fmo01p6nhsow9	cms61eheq001xk101bl0fspqn	cmraefj5300hzmm01gbupayou	cmrt646pv00mtlq01e9o4srjr	2026-07-29	2026-07-30 10:58:41.236	ADMIN_HISTORICAL:BOOKED
cms7eqww4003lmo011wm0996j	cms7eqww2003jmo01bp2intxs	cmqur46xc00jno701ceuxfoxy	cmrueiugk00yklq014e4kvo2m	2026-07-24	2026-07-30 11:05:49.061	ADMIN_HISTORICAL:NEW
cms7f4x9t003pmo01sk3yxn2s	cms6277fq0021k1016co4wjdz	cmrwed60g000un301vg8ksj6i	cmrt646q300mulq0117pev09h	2026-07-30	2026-07-30 11:16:42.737	STAFF_KEY
cms7gejzo004bmo01o0xdx8wv	cms7gejzl0049mo01r6ovmmk2	cmqur46xc00jno701ceuxfoxy	cmrt646tp00nllq01wb0f586b	2026-07-29	2026-07-30 11:52:11.7	ADMIN_HISTORICAL:NEW
\.


--
-- Data for Name: cash_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_expenses (id, kind, label, "amountDinars", "expenseDate", note, "recordedByUserId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: checkins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkins (id, "memberId", "qrCodeId", "reservationId", "scannedAt", method) FROM stdin;
cms7f4x9p003nmo01rabt1wr8	cmrwed60g000un301vg8ksj6i	cmr9an1gn00femm01m281e7rt	cms6277fq0021k1016co4wjdz	2026-07-30 11:16:42.734	STAFF_ROSTER
\.


--
-- Data for Name: coaches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coaches (id, "imageUrl", "firstName", "lastName", description, email, phone, "sessionCostDinars", "monthlySalaryDinars", "payrollMode", "isActive", "createdAt", "updatedAt", "userId") FROM stdin;
cmq409siz0003wmko7colc5on	\N	Dhouha	Ben Amor	\N	\N	94126115	50	\N	PER_SESSION	t	2026-06-07 16:37:52.315	2026-06-07 16:37:52.315	\N
cmql83ep6000cod017esn6v7r	\N	Dina	Boughanmi	\N	\N	94126577	45	\N	PER_SESSION	t	2026-06-19 17:48:56.491	2026-06-19 17:48:56.491	\N
cmq40bvbx0005wmkonbu4odyv	\N	Nourhene	Dhif	\N	\N	27928785	\N	1000	PER_MONTH	t	2026-06-07 16:39:29.373	2026-06-25 10:52:50.449	cmqtdvery00iho7014i79virw
cmq40aidn0004wmkovcqw775u	\N	Aicha	Gharbi	\N	\N	29631303	30	\N	PER_SESSION	t	2026-06-07 16:38:25.931	2026-06-25 16:42:34.066	\N
cmq407j3i0002wmko2bzj8hjy	\N	Hela	Friga	\N	\N	26950746	40	\N	PER_SESSION	t	2026-06-07 16:36:06.894	2026-06-25 16:42:50.644	cmqrvr7rf000dsc01jb52sobm
\.


--
-- Data for Name: member_pack_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_pack_balances (id, "memberId", "packId", "courseSlug", remaining, "createdAt", "updatedAt") FROM stdin;
cmqqoldz900dap9013usy4mfa	cmp6mujhf003ip4019yxl5iri	cmp4sadgq005hl4016z9eqilf	\N	0	2026-06-23 13:29:40.101	2026-07-29 13:48:26.216
cmqdta805001qwm3gmcbjktw7	cmp76c7ig005vp401qbizrga9	cmp4sixhw005ol401euqmhrwh	pilates-reformer	5	2026-06-14 13:19:56.933	2026-06-14 13:19:56.933
cmqdta805001rwm3gn2yg8kp7	cmp76c7ig005vp401qbizrga9	cmp4sixhw005ol401euqmhrwh	mat-pilates	5	2026-06-14 13:19:56.933	2026-06-14 13:19:56.933
cmqdta84u002bwm3gub9mcyog	cmp9uagwy00bnp401aww8aab6	cmp4sbkj5005il4015b2x78mh	\N	16	2026-06-14 13:19:57.102	2026-06-14 13:19:57.102
cmqqudfq6011kp9014c5f302s	cmqqio1g50018p9018hz9fq36	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 16:11:26.815	2026-07-29 13:19:02.579
cmqqqxxon00nsp901rbnjkshd	cmqp2at3e00elod01ib880iqc	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 14:35:24.743	2026-06-23 14:35:24.745
cmr0u5dhb000ymm01nzciah4r	cmpuxlbuw00ijp4016pmesm29	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-30 16:02:52.415	2026-07-30 11:38:35.261
cmqdta87b002lwm3g19cw6xyd	cmpcdicon00d0p401ddbj8mmg	cmp4scs0q005jl401azkonj0y	\N	24	2026-06-14 13:19:57.191	2026-06-14 13:19:57.191
cmqdta87r002mwm3g1aswy4mz	cmpcfa7e300d9p401ktuwubni	cmp4sixhw005ol401euqmhrwh	pilates-reformer	5	2026-06-14 13:19:57.207	2026-06-14 13:19:57.207
cmqdta87r002nwm3gzu4evk1q	cmpcfa7e300d9p401ktuwubni	cmp4sixhw005ol401euqmhrwh	mat-pilates	5	2026-06-14 13:19:57.207	2026-06-14 13:19:57.207
cmqrymz8a005do7013hmwgsv4	cmqp3rvft000is001ahcjqwvz	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 10:58:36.634	2026-06-24 10:58:36.636
cmqqqvijc00n0p901bxug6it0	cmpuxbc7900i9p401d4rkyuom	cmp4sejni005kl4013ure33mc	\N	35	2026-06-23 14:33:31.8	2026-07-29 13:17:58.635
cmqqqy8h000o8p901tgdzma8g	cmp6mqu0z003dp401zgzrluwq	cmp4s8kui005fl40100a1ew4b	\N	4	2026-06-23 14:35:38.724	2026-06-23 14:35:38.726
cmqz4fwtv0033mg01ivjkag7u	cmp9p95jj00b2p401dqlrtohp	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-29 11:15:27.859	2026-07-30 11:40:54.01
cmqqqyg3g00ogp901xs7msfjq	cmp6mkxvt0038p401gsyxjp1p	cmp4s8kui005fl40100a1ew4b	\N	4	2026-06-23 14:35:48.604	2026-06-23 14:35:48.606
cmqrye89d002ho701u560hgv2	cmqnjvfwv00clod01smhvf5v7	cmp4s9cxl005gl4018m1wy6wp	\N	6	2026-06-24 10:51:48.434	2026-07-30 10:54:56.873
cmqrzeq450095o701q0gjp4dw	cmp9pbn9j00b7p401wd3w8sn0	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-24 11:20:11.189	2026-07-30 11:39:04.526
cmqql3osh009yp9019fcqfq5v	cmp9u530f00bip401o3641wtg	cmp4s8kui005fl40100a1ew4b	\N	3	2026-06-23 11:51:55.457	2026-06-24 11:05:38.676
cmqw2od59000rmg01d49e68wu	cmp5e2po6007el401m0wr4bxe	cmp4s9cxl005gl4018m1wy6wp	\N	3	2026-06-27 08:02:44.493	2026-07-15 13:31:26.862
cmqrydsqs0029o701o8vo1v06	cmqf2b42m000vwmtsnd6eu11l	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-24 10:51:28.324	2026-07-29 13:18:46.589
cmqqslx2e00swp901nbeny9ky	cmqp3ozqi0004s001fm3nxvgn	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 15:22:03.302	2026-06-23 15:22:03.304
cmqw8ilsi001gmg014qo9lgzx	cmqw8ilsb001emg0158v8etes	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-27 10:46:13.459	2026-07-30 11:43:55.294
cmqqqeps500gop9019o10hvf6	cmpxtbvan00jsp401dbkqvo9n	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-23 14:20:28.037	2026-07-01 08:50:07.479
cmqzc9adl006bmg01vb7196dv	cmqz4ky2t003fmg011oeykh0h	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-29 14:54:15.753	2026-07-09 12:23:25.167
cmqtgh5s600ino701dgaif1n9	cmqpbrpkn001slk01gekkfisb	cmp4s8kui005fl40100a1ew4b	\N	2	2026-06-25 12:05:44.455	2026-07-09 12:15:35.916
cmr3dc145008omm01x5ys21k5	cmr3dc13z008mmm01r1xcp8qr	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-02 10:35:28.037	2026-07-15 14:05:38.713
cmqqqeef900g8p901e3jepbb5	cmpxt9h9d00jnp401acy1ppf1	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-23 14:20:13.317	2026-07-09 11:26:51.058
cmr29fwis007tmm01d3j0mf8g	cmqf2b42m000vwmtsnd6eu11l	cmp4sadgq005hl4016z9eqilf	\N	4	2026-07-01 15:58:44.068	2026-07-29 13:18:46.595
cmqqt40fg00x0p901kydv6nsq	cmp87ym20006yp401590xadl0	cmp4sadgq005hl4016z9eqilf	\N	4	2026-06-23 15:36:07.468	2026-07-30 11:35:36.963
cmqqkuwbl006up90199uozkp2	cmp5doqck0079l4013c3pypy1	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-23 11:45:05.313	2026-06-23 15:35:03.649
cmqqqeisx00ggp901qj4sljrf	cmpuxgfvo00iep401kuin241v	cmp4s9cxl005gl4018m1wy6wp	\N	0	2026-06-23 14:20:18.994	2026-07-30 10:58:02.212
cmqrymmky0055o701mbg0fzqr	cmqnjhe4500c7od01xunmmhyz	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-24 10:58:20.242	2026-07-15 13:55:31.484
cmqw8njsk0021mg0198aqnbzn	cmqw8njse001zmg010hmpycb7	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-27 10:50:04.149	2026-07-01 08:57:16.172
cmqs24s9u00edo701v0vghj4t	cmqp4nucc000glk01of7k32cs	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 12:36:26.275	2026-06-24 12:36:26.277
cmqz44r3r002zmg016kk3j6h8	cmqqimbo30011p9015ihys621	cmp4s8kui005fl40100a1ew4b	\N	1	2026-06-29 11:06:47.224	2026-07-13 11:16:22.29
cmqqqgci300hcp901virr1vbx	cmpxths4t00k7p401ms2nx4f0	cmp4s9cxl005gl4018m1wy6wp	\N	0	2026-06-23 14:21:44.139	2026-07-09 11:35:21.573
cmr1txafd001pmm01ymehrquk	cmp88f7g90073p401w4uw4pqs	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-01 08:44:21.386	2026-07-15 13:25:02.721
cmqqqnppp00k4p901s4thh5pr	cmpqvd4pp00hkp401fok0cwt8	cmp4sadgq005hl4016z9eqilf	\N	5	2026-06-23 14:27:27.853	2026-07-15 13:54:48.25
cmqw8sc4a0029mg01wpuq724k	cmqw8ilsb001emg0158v8etes	cmp4t5amk005zl4014v76r8bk	\N	6	2026-06-27 10:53:47.482	2026-07-30 11:43:55.306
cmqt868p400hno701vha3pz0p	cmph5kmv300f7p401b8x8jouu	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-25 08:13:18.089	2026-07-21 07:41:57.216
cmr0e8q3p009dmg016bc7q4nr	cmr0e8q3k009bmg01p00ba0nx	cmqur0gkm00jko7014ajnmg2a	\N	3	2026-06-30 08:37:34.885	2026-07-29 16:30:35.128
cmqqqgqms00hkp90196nrjmuc	cmp6vndph004yp401vluusox7	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-23 14:22:02.453	2026-07-15 14:00:19.522
cmqtanbeh00hxo701e5p3dtnr	cmqp3jmsv00euod010vtuk1qt	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-25 09:22:33.978	2026-07-30 10:57:25.077
cmqxmx5qy002pmg018339wekr	cmp9jyb2l009tp4012t706wff	cmp4s8kui005fl40100a1ew4b	\N	2	2026-06-28 10:17:13.307	2026-07-15 13:27:29.111
cmqqktfni006ap9017idim278	cmp9l6t2c00acp4018v82zolp	cmp4s9cxl005gl4018m1wy6wp	\N	0	2026-06-23 11:43:57.054	2026-07-21 07:54:58.21
cmqqqgws800hsp9012wnnu5ik	cmp6maci6002tp40119cnxlu3	cmp4sadgq005hl4016z9eqilf	\N	5	2026-06-23 14:22:10.424	2026-07-27 17:20:07.226
cmqdta7zh001nwm3g1bjavcm3	cmp6ywfdb0055p401dvfsqap4	cmp4scs0q005jl401azkonj0y	\N	21	2026-06-14 13:19:56.909	2026-07-30 11:30:24.742
cmqw8ru5r0025mg012iv3xsd9	cmqw8ha3o0017mg010cohkf7t	cmp4t5amk005zl4014v76r8bk	\N	6	2026-06-27 10:53:24.207	2026-07-30 11:44:21.009
cmr54gw10009qmm01e0pili44	cmr54gw0r009omm01n0aos5l6	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-03 16:02:50.532	2026-07-28 12:59:32.803
cmqqudpmx011sp9018hpkqkx4	cmqqipr55001fp9010qryqpgy	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 16:11:39.658	2026-07-29 13:18:56.254
cmqzch2es0072mg01wi4hbhsw	cmqzcgki3006umg01b9522uso	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-29 15:00:18.676	2026-07-30 10:32:49.117
cmqw8ec6u0012mg01i1bve8x0	cmqw8ec6p0010mg01ce7hdn33	cmp4sadgq005hl4016z9eqilf	\N	12	2026-06-27 10:42:54.391	2026-07-30 10:57:48.982
cmqqkx9mr0081p901ti2dh2jg	cmp5d9vn5006zl401fo5j5q04	cmp4slcpz005ul401m1rpf0qa	pilates-reformer	0	2026-06-23 11:46:55.875	2026-07-30 11:33:24.678
cmqdta7o70007wm3g8264pb31	cmp5cjt07006sl401hpc0r3sj	cmp4s8kui005fl40100a1ew4b	\N	5	2026-06-14 13:19:56.503	2026-06-14 13:19:56.503
cmqryrhva0071o701qjdyls7v	cmqp4mhgd0009lk015rytzui9	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 11:02:07.414	2026-06-24 11:02:07.416
cmqtghn9q00iro7015a7v7qhu	cmqpbt84l001zlk01r9quitpi	cmp4s8kui005fl40100a1ew4b	\N	1	2026-06-25 12:06:07.119	2026-07-09 12:15:46.955
cmqqtjv4o0110p901olkbswtm	cmqf2b43f0011wmts29fvfire	cmp4s8kui005fl40100a1ew4b	\N	1	2026-06-23 15:48:27.096	2026-07-27 17:25:09.519
cmqmk9d54002iod019z2n8onh	cmpbet54q00cpp4015io1o59b	cmp4sixhw005ol401euqmhrwh	mat-pilates	4	2026-06-20 16:17:15.977	2026-06-23 14:16:54.575
cmqs9vxjl00gko7013s61wnx8	cmp5dd5sd0074l401pv3drst8	cmp4sixhw005ol401euqmhrwh	pilates-reformer	2	2026-06-24 16:13:30.129	2026-07-29 13:28:06.055
cmqw8khui001nmg015c2v99zo	cmqw8khue001lmg01a483drty	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-27 10:47:41.659	2026-07-01 08:56:20.992
cmqdta7r2000lwm3getk7c8oy	cmp5nv1lh000mp4013w3oizro	cmp4t4k5c005yl401cme1vz52	\N	8	2026-06-14 13:19:56.607	2026-06-14 13:19:56.607
cmqv1tuy6000lmg01gyehw5jo	cmpb26l0900ccp4014tau0gjw	cmp4sadgq005hl4016z9eqilf	\N	2	2026-06-26 14:51:15.054	2026-07-30 11:34:14.764
cmqqkws5s007mp9015eazdm7g	cmp9oxt9w00avp401sfiouy8l	cmp4s8kui005fl40100a1ew4b	\N	3	2026-06-23 11:46:33.232	2026-06-23 11:51:15.984
cmqqoepd100atp901da5tkkfk	cmpdskdbb00e0p401bi55y2g7	cmp4skb22005rl4014f0e7wgs	pilates-reformer	8	2026-06-23 13:24:28.261	2026-07-09 12:39:12.138
cmqmk31sj001mod01ifh2hbqm	cmp6mh9mn0033p401xa6v43p7	cmp4sejni005kl4013ure33mc	\N	38	2026-06-20 16:12:21.331	2026-07-27 16:49:56.934
cmqmk06ko000yod016ngwowse	cmpb23ldo00c7p401ut25a8kv	cmp4sadgq005hl4016z9eqilf	\N	5	2026-06-20 16:10:07.56	2026-07-01 08:53:14.18
cmqqtfw9000zwp901h3651gd5	cmqqija83000up901vbrlsocv	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 15:45:21.924	2026-07-29 13:19:12.166
cmqqqs4us00lsp9016pwb1jsb	cmpuxyh5x00itp401pqas19s7	cmp4sadgq005hl4016z9eqilf	\N	4	2026-06-23 14:30:54.101	2026-07-27 17:18:25.111
cmqqkwen50079p901bwo6ldnn	cmp6mxgtj003np401n6d3md2o	cmp4skb22005rl4014f0e7wgs	pilates-reformer	1	2026-06-23 11:46:15.713	2026-07-30 10:54:12.308
cmqw8m90p001umg01j6kay1vd	cmqw8m90j001smg01dxisiguv	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-27 10:49:03.529	2026-07-01 08:56:26.829
cmqmjzshx000qod01wzoas1vr	cmpux8mfw00i4p401v4t85sji	cmp4sadgq005hl4016z9eqilf	\N	7	2026-06-20 16:09:49.318	2026-07-01 08:57:01.884
cmqw8ha3u0019mg012ua4kw3a	cmqw8ha3o0017mg010cohkf7t	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-27 10:45:11.658	2026-07-30 11:44:20.996
cmqw5srng000tmg018uagcqur	cmqpbpjdd001llk01e8vm535o	cmp4s8kui005fl40100a1ew4b	\N	1	2026-06-27 09:30:08.764	2026-07-09 12:36:36.243
cmqmk2pb5001eod01jybdaf9p	cmp6tmko3004rp4010ev8s38b	cmp4s9cxl005gl4018m1wy6wp	\N	2	2026-06-20 16:12:05.153	2026-07-01 09:56:52.455
cmqqr56kn00qcp9019zgzw88r	cmq251ruu00l5p4010gsntqmg	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-23 14:41:02.856	2026-06-24 12:28:28.396
cmqmkf8ly0042od01q09625a5	cmp5r29es001fp401vky62ly4	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-20 16:21:50.038	2026-06-24 12:29:43.885
cmqur9jsc00jwo70195dicju2	cmqur9js700juo7015s7s7fwr	cmqur0gkm00jko7014ajnmg2a	\N	0	2026-06-26 09:55:31.308	2026-07-15 10:03:42.308
cmqmkbsbz002pod017aszg1v2	cmpb26l0900ccp4014tau0gjw	cmp4sixhw005ol401euqmhrwh	pilates-reformer	0	2026-06-20 16:19:08.975	2026-07-30 11:34:14.742
cmqtay77c00i4o7017492csm8	cmqqifegn000gp901x4b3a61j	cmp4sixhw005ol401euqmhrwh	pilates-reformer	0	2026-06-25 09:31:01.753	2026-07-28 12:49:15.997
cmqs22upb00e1o701ea9b9805	cmqqihcm6000np901ub12rzon	cmp4s9cxl005gl4018m1wy6wp	\N	3	2026-06-24 12:34:56.112	2026-07-28 12:50:56.279
cmqmk9d54002hod01ry62omep	cmpbet54q00cpp4015io1o59b	cmp4sixhw005ol401euqmhrwh	pilates-reformer	1	2026-06-20 16:17:15.977	2026-06-23 14:40:55.706
cmqqqpr4u00kkp9012t3avsul	cmpzp6len00kwp4012mdrq8ka	cmp4s8kui005fl40100a1ew4b	\N	3	2026-06-23 14:29:03.006	2026-06-23 14:52:38.157
cmqnnz1ko00daod01t4dspo0u	cmqnnz1kg00d8od0103g8czza	cmp4s9cxl005gl4018m1wy6wp	\N	0	2026-06-21 10:48:59.065	2026-07-29 13:13:46.398
cmqmkbsbz002qod01wjj8mopu	cmpb26l0900ccp4014tau0gjw	cmp4sixhw005ol401euqmhrwh	mat-pilates	2	2026-06-20 16:19:08.975	2026-07-30 11:34:14.743
cmqqkx9mr0082p901c2pkmwmf	cmp5d9vn5006zl401fo5j5q04	cmp4slcpz005ul401m1rpf0qa	mat-pilates	8	2026-06-23 11:46:55.875	2026-07-30 11:33:24.666
cmqs27j3r00epo701m0k4bryj	cmqqimbo30011p9015ihys621	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 12:38:34.359	2026-06-24 12:38:34.361
cmqs27pzp00exo701jmmqx9f0	cmqpbt84l001zlk01r9quitpi	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 12:38:43.285	2026-06-24 12:38:43.287
cmqtay77c00i5o701r9n6tzl1	cmqqifegn000gp901x4b3a61j	cmp4sixhw005ol401euqmhrwh	mat-pilates	2	2026-06-25 09:31:01.753	2026-07-21 07:32:49.958
cmqdta7tl000vwm3gs0l2mxsp	cmp6me3mt002yp401esc9ykn5	cmp4sadgq005hl4016z9eqilf	\N	7	2026-06-14 13:19:56.697	2026-07-23 12:50:25.689
cmqs9vxjl00glo701yj65gpnq	cmp5dd5sd0074l401pv3drst8	cmp4sixhw005ol401euqmhrwh	mat-pilates	1	2026-06-24 16:13:30.129	2026-07-29 13:28:06.058
cmqqr2est00pjp901eay5gxk0	cmq254vcp00lap401whu604y8	cmp4sixhw005ol401euqmhrwh	pilates-reformer	5	2026-06-23 14:38:53.549	2026-06-23 14:38:53.549
cmqqr2est00pkp901rsvm7z0h	cmq254vcp00lap401whu604y8	cmp4sixhw005ol401euqmhrwh	mat-pilates	4	2026-06-23 14:38:53.549	2026-06-23 14:38:53.551
cmqmke8qy003mod01rwwnsfnv	cmp5i45nq000ap401mr5kujgq	cmp4sadgq005hl4016z9eqilf	\N	0	2026-06-20 16:21:03.562	2026-07-29 16:18:56.671
cmqs27w4k00f5o701xrtop56d	cmqpbrpkn001slk01gekkfisb	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 12:38:51.236	2026-06-24 12:38:51.238
cmqmkcecm0036od01f7qkwiiy	cmp6ndov4004cp4011gucmmzn	cmp4t4k5c005yl401cme1vz52	\N	6	2026-06-20 16:19:37.51	2026-06-23 11:52:48.092
cmqqr497a00pwp901ey05ftmg	cmqqihcm6000np901ub12rzon	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 14:40:19.606	2026-06-23 14:40:19.609
cmqqkwen5007ap9010799jrf0	cmp6mxgtj003np401n6d3md2o	cmp4skb22005rl4014f0e7wgs	mat-pilates	2	2026-06-23 11:46:15.713	2026-07-30 10:54:12.309
cmqmkcml1003eod01xtfmzep3	cmp5r6eqa001kp401z95m2mtr	cmp4t4k5c005yl401cme1vz52	\N	6	2026-06-20 16:19:48.182	2026-06-23 11:52:59.896
cmqqoepd100aup9013t3u3w29	cmpdskdbb00e0p401bi55y2g7	cmp4skb22005rl4014f0e7wgs	mat-pilates	9	2026-06-23 13:24:28.261	2026-06-23 13:24:28.263
cmqqoh0po00bqp90171u2x0r4	cmqp3lgcp00f1od0111da04jy	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 13:26:16.285	2026-06-23 13:26:16.286
cmqs283kr00fdo7019gl5k3fs	cmqpbpjdd001llk01e8vm535o	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 12:39:00.891	2026-06-24 12:39:00.893
cmqmkef0v003uod019l86fcih	cmp5lkgat000fp4013f720b0o	cmp4s8kui005fl40100a1ew4b	\N	1	2026-06-20 16:21:11.696	2026-06-23 14:24:20.127
cmqqsu7d300ugp901fi8d7fza	cmqp3qkb7000bs001u04q0vsn	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 15:28:29.896	2026-06-23 15:28:29.898
cmqs29i7200g1o7015lvnb4x6	cmqp4nucc000glk01of7k32cs	cmp4t00w6005xl401jv0qklyp	\N	0	2026-06-24 12:40:06.494	2026-06-24 12:40:06.497
cmqqqswbq00mcp90165jeum2y	cmpwo5qcf00jgp401y23i6i2r	cmp4sadgq005hl4016z9eqilf	\N	4	2026-06-23 14:31:29.702	2026-07-27 17:02:51.256
cmqp1dmlu00e9od01smkqralv	cmqp1dmlo00e7od01uqu7xeqx	cmp4s6te2005el4011ra2qxrl	\N	1	2026-06-22 09:52:00.691	2026-06-22 09:52:00.691
cmqqkpv0k005ap9015ghx78zb	cmpfpx1dd00ekp4015zb7hrup	cmp4sbkj5005il4015b2x78mh	\N	8	2026-06-23 11:41:10.34	2026-07-29 13:18:18.657
cmqzd3wml008img016ib7kjn1	cmqz4i19x0038mg01irua66ou	cmp4s8kui005fl40100a1ew4b	\N	2	2026-06-29 15:18:04.27	2026-07-09 11:45:28.484
cmqql15bn009ap901xml71wnt	cmpfdk63200ebp401atbgmxt9	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-23 11:49:56.915	2026-06-24 10:58:44.916
cmqs1xhv200c1o701kn8a8fc1	cmqf2b405000dwmtsddcf7agj	cmp4s8kui005fl40100a1ew4b	\N	1	2026-06-24 12:30:46.19	2026-07-15 13:34:50.316
cmqqjfnx2001op901nlrla223	cmqqjfnwv001mp901zr9d550e	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 11:05:14.967	2026-07-01 09:58:50.404
cmr639etr00almm01s5riuus8	cmr638xlv00admm01cm77sv03	cmqur0gkm00jko7014ajnmg2a	\N	7	2026-07-04 08:16:48.208	2026-07-15 10:51:33.497
cmqqkmkrp003mp901vq6w7c8n	cmp6n445r003xp4019r22o12e	cmp4s9cxl005gl4018m1wy6wp	\N	0	2026-06-23 11:38:37.093	2026-07-15 13:24:33.737
cmqs1xc7s00bto701o15196ul	cmqf2b41m000pwmtsgzlybd2p	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-24 12:30:38.872	2026-07-21 08:27:25.659
cmqqkltzy0036p901y5ka1jsq	cmp6n0r9g003sp401svwhqzjy	cmp4s9cxl005gl4018m1wy6wp	\N	1	2026-06-23 11:38:02.398	2026-07-09 11:56:14.624
cmr1tvvff001hmm01e41lhgrx	cmr1tvvf8001fmm01nvgjy6v9	cmp4sbkj5005il4015b2x78mh	\N	7	2026-07-01 08:43:15.292	2026-07-30 11:41:57.105
cmqqqm4wp00j4p901lv8crrvp	cmp9muoo600alp401b1jj91hv	cmp4s8kui005fl40100a1ew4b	\N	2	2026-06-23 14:26:14.233	2026-07-09 12:18:01.348
cmqqkocq0004ep901b7egmx1k	cmp6n6c330042p401572wyy97	cmp4s8kui005fl40100a1ew4b	\N	2	2026-06-23 11:39:59.976	2026-06-24 11:01:02.92
cmqrzd35p008zo701eqmiswpj	cmp80zids006np4015qmgm2k4	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-24 11:18:54.781	2026-07-29 13:47:40.303
cmqqqk43200ikp90198uwxs9v	cmpv004tl00iyp4017n7rkxr5	cmp4sadgq005hl4016z9eqilf	\N	0	2026-06-23 14:24:39.854	2026-07-09 11:59:05.444
cmr3d5w31008fmm0115ahmgnh	cmqno2ywp00dfod01x3mtrdjg	cmp4sadgq005hl4016z9eqilf	\N	5	2026-07-02 10:30:41.581	2026-07-29 17:45:51.877
cmqqkkiza002qp9016shipdxn	cmp71pbmj005ip401rxsl0n27	cmp4sadgq005hl4016z9eqilf	\N	7	2026-06-23 11:37:01.463	2026-07-21 08:25:22.204
cmqqtl10m0118p901k7b65b15	cmqf2b3z80007wmtsodeuow25	cmp4t5amk005zl4014v76r8bk	\N	3	2026-06-23 15:49:21.382	2026-07-30 11:24:20.725
cmqqq7g4o00ekp9017f1wacwh	cmpvehn3c00j7p401p14lsb1d	cmp4s9cxl005gl4018m1wy6wp	\N	7	2026-06-23 14:14:48.936	2026-06-23 14:14:48.939
cmqqki0s4001yp901mgwckd1i	cmqp0fvcq00e0od01115zmkft	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 11:35:04.565	2026-06-23 11:35:04.567
cmqqkib0o0026p901w2ze9zjp	cmqpbic6z0010lk01lg3znp3o	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 11:35:17.833	2026-06-23 11:35:17.834
cmqqoizmh00cap901td5fiw8n	cmp5qutpd0015p401e0b83fu9	cmp4sadgq005hl4016z9eqilf	\N	3	2026-06-23 13:27:48.185	2026-07-30 10:58:20.633
cmqqkioq8002ep901nweqaron	cmqpbg2wz000tlk01pnlcrmdj	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 11:35:35.601	2026-06-23 11:35:35.603
cmqqkpp5z0052p901prsy4ozu	cmp8b0p5m0078p401ko5fipst	cmp4sixhw005ol401euqmhrwh	mat-pilates	3	2026-06-23 11:41:02.76	2026-07-30 11:25:00.416
cmqqq6rm700e0p901te2bqb77	cmpuxpn4l00iop40156zk6rje	cmp4s8kui005fl40100a1ew4b	\N	1	2026-06-23 14:14:17.167	2026-07-13 11:16:02.297
cmqqknhfs003yp901awap5k11	cmp580zx2006el401ov0q9nd9	cmp4skb22005rl4014f0e7wgs	mat-pilates	9	2026-06-23 11:39:19.432	2026-06-23 14:29:42.928
cmqs1xmqy00c9o701pp2913ge	cmqf2b40z000jwmtsglaha6m4	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-24 12:30:52.522	2026-07-21 08:27:42.756
cmr54ln15009ymm01ztjolijk	cmpya6nur00kgp401et6xel9m	cmp4s8kui005fl40100a1ew4b	\N	1	2026-07-03 16:06:32.154	2026-07-29 13:45:17.388
cmqqkl43u002xp901z1gpc1ov	cmpmhc40500h9p40180sb0edr	cmp4sixhw005ol401euqmhrwh	pilates-reformer	0	2026-06-23 11:37:28.842	2026-07-15 13:30:10.711
cmqqq9g4c00ezp901hpfiwwnz	cmpuxlbuw00ijp4016pmesm29	cmp4sixhw005ol401euqmhrwh	pilates-reformer	0	2026-06-23 14:16:22.236	2026-07-30 11:38:35.248
cmqqq9g4c00f0p901ft7axaj2	cmpuxlbuw00ijp4016pmesm29	cmp4sixhw005ol401euqmhrwh	mat-pilates	3	2026-06-23 14:16:22.236	2026-07-30 11:38:35.248
cmqqq72yv00ecp901jinfnwem	cmps12dpz00hvp401tesxyqev	cmp4sbkj5005il4015b2x78mh	\N	1	2026-06-23 14:14:31.879	2026-07-30 10:54:47.971
cmr638xm100afmm01iuyvt2j0	cmr638xlv00admm01cm77sv03	cmquqvx9k00jio701xv9bwsuw	\N	1	2026-07-04 08:16:25.898	2026-07-04 08:16:25.898
cmqmk8czz001uod014dm42gqh	cmp6n9pyb0047p401exgskztu	cmp4sadgq005hl4016z9eqilf	\N	0	2026-06-20 16:16:29.136	2026-07-29 18:11:13.452
cmqqqmb8u00jcp901xrlg5edl	cmp9n16yg00aqp401yfgd8zit	cmp4s8kui005fl40100a1ew4b	\N	2	2026-06-23 14:26:22.447	2026-07-09 12:17:26.007
cmqqkpp5z0051p901xaesrqr4	cmp8b0p5m0078p401ko5fipst	cmp4sixhw005ol401euqmhrwh	pilates-reformer	3	2026-06-23 11:41:02.76	2026-07-30 11:25:00.415
cmqrwntq30018sc01xzbr9w28	cmqrwntpy0016sc0146g80wvq	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-24 10:03:16.923	2026-07-30 10:55:20.839
cmqqrhk3p00rkp901yujnrd0a	cmqqifegn000gp901x4b3a61j	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 14:50:40.261	2026-06-23 14:50:40.264
cmqqswyu900v0p901qid6106r	cmqf2b3xg0001wmtsjmoqct8a	cmp4skb22005rl4014f0e7wgs	mat-pilates	6	2026-06-23 15:30:38.817	2026-07-29 13:11:02.964
cmqqql3p700iwp901oa7ryoxu	cmqp1r6nz00eeod015izfwb4m	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 14:25:26.011	2026-06-23 14:25:26.013
cmqqknhfs003xp901q2jm7nef	cmp580zx2006el401ov0q9nd9	cmp4skb22005rl4014f0e7wgs	pilates-reformer	7	2026-06-23 11:39:19.432	2026-06-23 15:24:58.494
cmqqoj51900cip9011o0w85hj	cmp5qzr8e001ap401fa4uuzw4	cmp4sadgq005hl4016z9eqilf	\N	3	2026-06-23 13:27:55.197	2026-07-30 10:58:26.799
cmqs1zs9t00d1o70132au8w96	cmqno2ywp00dfod01x3mtrdjg	cmp4s8kui005fl40100a1ew4b	\N	0	2026-06-24 12:32:32.993	2026-07-29 17:45:51.867
cmr1us0f7006lmm01of52j84a	cmp6n9pyb0047p401exgskztu	cmp4t00w6005xl401jv0qklyp	\N	1	2026-07-01 09:08:14.755	2026-07-29 18:11:13.454
cmqqkl43u002yp9010usmhz7f	cmpmhc40500h9p40180sb0edr	cmp4sixhw005ol401euqmhrwh	mat-pilates	2	2026-06-23 11:37:28.842	2026-07-09 12:30:58.858
cmqqsxtgc00vgp901elc9csdk	cmqpbn2ri001elk01umecmq7c	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 15:31:18.492	2026-06-23 15:31:18.494
cmqqswyu900uzp901js5iitvk	cmqf2b3xg0001wmtsjmoqct8a	cmp4skb22005rl4014f0e7wgs	pilates-reformer	4	2026-06-23 15:30:38.817	2026-07-29 13:11:02.962
cmqqsy3ut00vop901j3wrlbaw	cmqpbli4t0017lk01pgc2c00k	cmp4s6te2005el4011ra2qxrl	\N	0	2026-06-23 15:31:31.974	2026-06-23 15:31:31.976
cmr66x4vu00awmm01hq4339lf	cmr66x4vm00aumm01n1n9q5b4	cmp4sadgq005hl4016z9eqilf	\N	10	2026-07-04 09:59:13.914	2026-07-09 12:35:38.29
cmqs1yl3h00cto7015sfnk5fy	cmqno5z2j00dlod0156ophlux	cmp4s9cxl005gl4018m1wy6wp	\N	2	2026-06-24 12:31:37.037	2026-07-15 13:54:26.092
cmr91fzqa00domm01ll02luw4	cmr91fzq700dmmm01t48rlkdj	cmr0t6kdb000mmm01e58p4sux	mat-pilates	3	2026-07-06 09:49:14.53	2026-07-06 09:49:14.53
cmrdaevea0027mn01fu9xfdid	cmrdaeve70025mn01r9qzxda0	cmp4s6te2005el4011ra2qxrl	\N	1	2026-07-09 09:11:23.506	2026-07-09 09:11:23.506
cmraegf4u00i7mm01w7o0kboc	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	\N	0	2026-07-07 08:41:15.678	2026-07-30 10:32:49.136
cmrbukuwl0006mn01gemzvovv	cmrbukuwd0004mn016lbgagog	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-08 09:00:22.773	2026-07-15 13:22:43.449
cmrdrcgb100kwmn01eu169ryz	cmrdrcgat00kumn0112odkalw	cmp4skb22005rl4014f0e7wgs	mat-pilates	8	2026-07-09 17:05:24.11	2026-07-30 10:57:18.479
cmrdagpt3002gmn01y3xbahcq	cmrdagpsz002emn01k4cuyqwh	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-09 09:12:49.575	2026-07-15 13:53:57.529
cmr66zk2a00b5mm01e6hvaib4	cmr66zk2400b3mm01nzav5tty	cmp4s8kui005fl40100a1ew4b	\N	3	2026-07-04 10:01:06.898	2026-07-28 12:51:27.181
cmr91oeqk00dxmm01colsedmx	cmr91oeqe00dvmm012s7it3wq	cmp4t00w6005xl401jv0qklyp	\N	0	2026-07-06 09:55:47.229	2026-07-09 12:40:25.064
cmr92ygsw00e6mm010e4va1lm	cmr92ygsq00e4mm01t2ww4seu	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-06 10:31:36.081	2026-07-13 08:34:54.075
cmrdadhts001xmn0191qrdurh	cmrdadhtm001wmn01ebkmguat	cmr0t6kdb000mmm01e58p4sux	pilates-reformer	0	2026-07-09 09:10:19.265	2026-07-27 17:11:30.859
cmrkkcax3002vlq01n5744v1v	cmqw8njse001zmg010hmpycb7	cmr0t6kdb000mmm01e58p4sux	pilates-reformer	1	2026-07-14 11:23:43.047	2026-07-15 13:34:17.315
cmrdgx2f800f7mn01pq80x4sc	cmpzh61qy00kpp401u52chqfx	cmp4s8kui005fl40100a1ew4b	\N	3	2026-07-09 12:13:30.116	2026-07-14 11:12:37.053
cmrbunzzt000nmn013qjl0jkh	cmrbunzzo000mmn01dkqpill6	cmr0t6kdb000mmm01e58p4sux	pilates-reformer	0	2026-07-08 09:02:49.337	2026-07-30 11:45:25.645
cmrkkcax3002wlq01nxv7v906	cmqw8njse001zmg010hmpycb7	cmr0t6kdb000mmm01e58p4sux	mat-pilates	2	2026-07-14 11:23:43.047	2026-07-14 11:24:48.808
cmrkkgc3m0038lq013ajw0v8r	cmqw8khue001lmg01a483drty	cmp4t00w6005xl401jv0qklyp	\N	0	2026-07-14 11:26:51.202	2026-07-14 11:26:59.742
cmrdak4v6002ymn010k50qbry	cmrdak4v0002wmn01j2my021k	cmp4sixhw005ol401euqmhrwh	mat-pilates	2	2026-07-09 09:15:29.058	2026-07-29 14:24:21.457
cmrlvcqtx007llq01a9ffbwdq	cmrlvcqtr007jlq01qeub85bp	cmp4s6te2005el4011ra2qxrl	\N	1	2026-07-15 09:19:45.622	2026-07-15 09:19:45.622
cmrbure4b000xmn013muxsxh2	cmrbure45000vmn014ppcw3bv	cmp4sixhw005ol401euqmhrwh	mat-pilates	1	2026-07-08 09:05:27.611	2026-07-30 11:44:49.275
cmrdalmpr0036mn01ajdauvts	cmrdalmpn0035mn01esii22rz	cmp4sixhw005ol401euqmhrwh	pilates-reformer	3	2026-07-09 09:16:38.847	2026-07-29 14:25:40.646
cmr91fzqa00dnmm019nf9l6z5	cmr91fzq700dmmm01t48rlkdj	cmr0t6kdb000mmm01e58p4sux	pilates-reformer	2	2026-07-06 09:49:14.53	2026-07-27 17:12:59.497
cmrbumgk8000fmn01237y0jaf	cmrbumgk4000dmn01h99tqe11	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-08 09:01:37.496	2026-07-15 13:22:51.607
cmrkszpxl005mlq014vanpord	cmpxtfc9z00k2p401mfev8i51	cmp4s9cxl005gl4018m1wy6wp	\N	5	2026-07-14 15:25:52.522	2026-07-14 15:30:47.245
cmrlwjrxt008elq01i4lnbos1	cmpi6ban400fip401ppm9o7wy	cmp4sixhw005ol401euqmhrwh	pilates-reformer	5	2026-07-15 09:53:13.265	2026-07-15 09:53:13.265
cmrdadhts001ymn01noseeb76	cmrdadhtm001wmn01ebkmguat	cmr0t6kdb000mmm01e58p4sux	mat-pilates	0	2026-07-09 09:10:19.265	2026-07-28 12:48:01.503
cmrm70e2800kklq01lox45tkq	cmpazudle00byp401oz4zx3e1	cmp4slcpz005ul401m1rpf0qa	pilates-reformer	10	2026-07-15 14:46:04.592	2026-07-30 10:53:48.491
cmrm49dpa00cplq01uid0gmmq	cmr91oeqe00dvmm012s7it3wq	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-15 13:29:05.182	2026-07-15 13:29:31.365
cmrdbo3640043mn01bqqyuk2v	cmpuxgfvo00iep401kuin241v	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-09 09:46:33.101	2026-07-30 10:58:02.214
cmrbure4b000wmn01f4b3ssyl	cmrbure45000vmn014ppcw3bv	cmp4sixhw005ol401euqmhrwh	pilates-reformer	2	2026-07-08 09:05:27.611	2026-07-30 11:44:49.263
cmrafe0sb00jzmm01igbvu3ts	cmqnlovfk00czod0169336zw1	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-07 09:07:23.388	2026-07-21 07:55:06.082
cmrdaicj9002pmn01lsubmfx8	cmrdaicj5002nmn01fbw9scjq	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-09 09:14:05.686	2026-07-15 13:53:40.633
cmrum92so00z9lq01yxqi6mky	cmqur46xc00jno701ceuxfoxy	cmqur0gkm00jko7014ajnmg2a	\N	1	2026-07-21 12:14:53.545	2026-07-30 11:52:11.694
cmrksxsob005glq01hoegp3xd	cmpxtdnho00jxp401mtude4xv	cmp4s9cxl005gl4018m1wy6wp	\N	3	2026-07-14 15:24:22.762	2026-07-15 13:54:41.622
cmraefj5900i1mm01iz54f8a3	cmraefj5300hzmm01gbupayou	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-07 08:40:34.222	2026-07-30 10:58:41.228
cmrbunzzt000omn01icxw3fg4	cmrbunzzo000mmn01dkqpill6	cmr0t6kdb000mmm01e58p4sux	mat-pilates	0	2026-07-08 09:02:49.337	2026-07-30 11:45:25.646
cmrdrcgb100kvmn01w02huosr	cmrdrcgat00kumn0112odkalw	cmp4skb22005rl4014f0e7wgs	pilates-reformer	7	2026-07-09 17:05:24.11	2026-07-30 10:57:18.478
cmr3dnoa3008xmm019i7l6sqv	cmr3dno9x008vmm01yn5zbnx3	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-02 10:44:31.276	2026-07-27 17:06:09.702
cmr91c6e100d6mm01t0aa49d8	cmp6mujhf003ip4019yxl5iri	cmp4scs0q005jl401azkonj0y	\N	11	2026-07-06 09:46:16.537	2026-07-29 13:48:26.221
cmrfb3yis00m9mn01f5gb75as	cmrfb3yin00m7mn01e62jdrb9	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-10 19:06:26.309	2026-07-15 14:06:41.528
cmrdalmpr0037mn01mnu6n17k	cmrdalmpn0035mn01esii22rz	cmp4sixhw005ol401euqmhrwh	mat-pilates	2	2026-07-09 09:16:38.847	2026-07-29 14:25:40.648
cmrbw6y2g0016mn01tr9hqwr6	cmrbw6y2c0014mn01a6ii4tiu	cmp4s8kui005fl40100a1ew4b	\N	2	2026-07-08 09:45:32.921	2026-07-29 13:20:23.986
cmrm70e2800kllq01ychh6dz5	cmpazudle00byp401oz4zx3e1	cmp4slcpz005ul401m1rpf0qa	mat-pilates	18	2026-07-15 14:46:04.592	2026-07-30 10:53:48.478
cmrkjma2m0012lq016dmp7sp5	cmrkjma2h0010lq01o3ge2qc3	cmp4s8kui005fl40100a1ew4b	\N	4	2026-07-14 11:03:28.895	2026-07-21 07:41:44.595
cmrf9259h00lymn01en7fldoa	cmraefj5300hzmm01gbupayou	cmp4s9cxl005gl4018m1wy6wp	\N	5	2026-07-10 18:09:02.501	2026-07-30 10:58:41.229
cmrlwjrxt008flq01sgd98456	cmpi6ban400fip401ppm9o7wy	cmp4sixhw005ol401euqmhrwh	mat-pilates	3	2026-07-15 09:53:13.265	2026-07-21 08:34:45.769
cmr6940rl00bgmm01eacalffi	cmr6940rg00bemm01s11l95mw	cmp4s8kui005fl40100a1ew4b	\N	2	2026-07-04 11:00:34.402	2026-07-28 13:07:50.589
cmrjemetc0001lq01glxwm7p4	cmqnjhe4500c7od01xunmmhyz	cmp4s9cxl005gl4018m1wy6wp	\N	6	2026-07-13 15:55:50.784	2026-07-27 17:05:57.732
cmrbwaec8001fmn01n5l3gdct	cmrbwaec5001dmn01can4i9wf	cmp4s8kui005fl40100a1ew4b	\N	2	2026-07-08 09:48:13.977	2026-07-29 13:20:12.425
cmrnml84i00kylq01es532hn8	cmrnml84b00kwlq01sw6qm4zc	cmp4s9cxl005gl4018m1wy6wp	\N	7	2026-07-16 14:49:57.09	2026-07-27 17:33:02.84
cmrnrrjxf00ldlq01l286a39w	cmrnrrjxa00lblq014meynmha	cmp4s8kui005fl40100a1ew4b	\N	3	2026-07-16 17:14:50.404	2026-07-30 11:34:56.028
cmrf1sefe00ldmn01anrn9k5f	cmrf1sef700lbmn01oewtlk1z	cmp4s8kui005fl40100a1ew4b	\N	3	2026-07-10 14:45:30.506	2026-07-21 08:26:10.497
cms4v82le000pml01uz6o5hnr	cms4v82l8000nml0184j2mtyd	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-28 16:23:44.93	2026-07-29 13:13:26.745
cmruxkruo000to901cyg5w6h8	cmruxkruh000ro901qcd982u7	cmp4sixhw005ol401euqmhrwh	mat-pilates	5	2026-07-21 17:31:55.008	2026-07-21 17:31:55.008
cmruxoqqb0011o901s9kxbz5a	cmruxoqq5000zo901ix6vukw5	cmr0t6kdb000mmm01e58p4sux	mat-pilates	3	2026-07-21 17:35:00.18	2026-07-21 17:35:00.18
cms4l8mu700i8n301ebl2o9hc	cmp6n9pyb0047p401exgskztu	cmp4s9cxl005gl4018m1wy6wp	\N	8	2026-07-28 11:44:15.007	2026-07-29 18:11:13.455
cms4zrk3m001fml01ipdg6yla	cmqnlllpk00csod01wkefk1ot	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-28 18:30:52.547	2026-07-29 18:23:59.768
cms4l9kwz00ien30122spm1hy	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	\N	1	2026-07-28 11:44:59.171	2026-07-30 13:10:37.994
cms3kr38b00hcn3016zx9zj40	cms3kr38500han30115yyomyb	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-27 18:42:50.267	2026-07-28 12:49:48.985
cms60d2eh000vk101powe9yp3	cmqnlllpk00csod01wkefk1ot	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-29 11:35:22.217	2026-07-29 18:23:59.79
cms35a7wh0095n301wtokbpd0	cmr91dvvk00ddmm01yvoi91dd	cmr0t6kdb000mmm01e58p4sux	pilates-reformer	2	2026-07-27 11:29:48.93	2026-07-29 13:29:30.874
cms35lfl3009en301m2riyezp	cms35lfky009cn301i7ou31cd	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-27 11:38:32.104	2026-07-27 17:19:37.341
cms3kuoyr00hkn301ca96t9o7	cms3kuoyo00hin301dzucqsrq	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-27 18:45:38.403	2026-07-29 16:49:48.064
cmruxkruo000so901ol7j0v5k	cmruxkruh000ro901qcd982u7	cmp4sixhw005ol401euqmhrwh	pilates-reformer	2	2026-07-21 17:31:55.008	2026-07-27 17:25:38.387
cmruxoqqb0010o901a4pkrmjm	cmruxoqq5000zo901ix6vukw5	cmr0t6kdb000mmm01e58p4sux	pilates-reformer	0	2026-07-21 17:35:00.18	2026-07-27 17:25:48.568
cmrxgghz8001en3019of9mmmc	cmqnjmmn900ceod01dz6unzwp	cmp4s9cxl005gl4018m1wy6wp	\N	6	2026-07-23 11:56:00.645	2026-07-30 10:55:06.595
cms35a7wh0096n3016pf3fflb	cmr91dvvk00ddmm01yvoi91dd	cmr0t6kdb000mmm01e58p4sux	mat-pilates	2	2026-07-27 11:29:48.93	2026-07-29 13:29:30.877
cmrxhnzkk0028n301gcefqhe1	cmqrwntpy0016sc0146g80wvq	cmp4s9cxl005gl4018m1wy6wp	\N	16	2026-07-23 12:29:49.652	2026-07-30 10:55:20.841
cms365esq00a2n301et4st73r	cms365esm00a0n3016r7lmgxk	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-27 11:54:04.203	2026-07-27 17:41:14.924
cms4z6pfi0019ml01qwjpkl7f	cmrwe3svz000mn3011way6tzi	cmp4s9cxl005gl4018m1wy6wp	\N	4	2026-07-28 18:14:39.679	2026-07-30 10:57:56.651
cms6bk9z6000hmo019w8m7wzy	cms3kuoyo00hin301dzucqsrq	cmp4t00w6005xl401jv0qklyp	\N	0	2026-07-29 16:48:54.402	2026-07-29 16:49:48.086
cms3kei3p00gon301c2wr1fe4	cms3kei3j00gmn301mhqotbc4	cmp4s8kui005fl40100a1ew4b	\N	4	2026-07-27 18:33:03.014	2026-07-28 13:13:18.225
cms4wo5n70015ml01zbyw2ri0	cmrwed60g000un301vg8ksj6i	cmp4s8kui005fl40100a1ew4b	\N	0	2026-07-28 17:04:14.996	2026-07-30 11:16:42.722
cms4q1w0e00lln301k6tdrob8	cms362k9k009sn3012zp10a99	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-28 13:58:58.382	2026-07-28 14:01:31.886
cms4q3b6m00lrn3017angm898	cmrri21yv00m2lq01gugwiiyq	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-28 14:00:04.702	2026-07-28 14:01:45.949
cms4rgt5q0007ml010eeoxqut	cms3kn6uo00h2n301qm5snmp2	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-28 14:38:34.142	2026-07-28 14:38:34.142
cmrdak4v6002xmn01c6ljflwz	cmrdak4v0002wmn01j2my021k	cmp4sixhw005ol401euqmhrwh	pilates-reformer	3	2026-07-09 09:15:29.058	2026-07-29 14:24:21.455
cmrxhf4h2001wn301pzhpeczp	cmqqipr55001fp9010qryqpgy	cmp4s8kui005fl40100a1ew4b	\N	4	2026-07-23 12:22:56.102	2026-07-29 13:18:56.258
cms4ok3tm00len301sus69hcm	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	\N	1	2026-07-28 13:17:09.082	2026-07-29 13:05:21.244
cms4mx5xe00ion301usgne4na	cmqp4ky050002lk01gx0v2tv9	cmp4s8kui005fl40100a1ew4b	\N	2	2026-07-28 12:31:19.106	2026-07-29 13:05:21.248
cmrxup8qt006fn301alt1cns3	cmrbunzzo000mmn01dkqpill6	cmp4slcpz005ul401m1rpf0qa	pilates-reformer	13	2026-07-23 18:34:43.205	2026-07-30 11:45:25.648
cmrxhbqrq001qn301qaxut61e	cmqqio1g50018p9018hz9fq36	cmp4s8kui005fl40100a1ew4b	\N	4	2026-07-23 12:20:18.374	2026-07-29 13:19:02.584
cmrxga3yx0018n301puyfeyi7	cmp5i45nq000ap401mr5kujgq	cmp4s9cxl005gl4018m1wy6wp	\N	5	2026-07-23 11:51:02.554	2026-07-29 16:18:56.688
cmrxup8qt006gn301gk6e210f	cmrbunzzo000mmn01dkqpill6	cmp4slcpz005ul401m1rpf0qa	mat-pilates	14	2026-07-23 18:34:43.205	2026-07-30 11:45:25.66
cms35x3i6009mn301tjfo3qni	cms35x3i0009kn301kd28orpb	cmp4s6te2005el4011ra2qxrl	\N	0	2026-07-27 11:47:36.319	2026-07-29 11:57:26.082
cms4ul99y000jml01et78mbf1	cms35x3i0009kn301kd28orpb	cmp4s9cxl005gl4018m1wy6wp	\N	6	2026-07-28 16:06:00.503	2026-07-29 11:57:26.088
cmrxgj8ln001kn301greab7xv	cmqqija83000up901vbrlsocv	cmp4s8kui005fl40100a1ew4b	\N	3	2026-07-23 11:58:08.46	2026-07-29 13:19:12.171
cms4vgzy6000xml01sw65zcde	cms4vgzxz000vml01z4j4yu76	cmp4s6te2005el4011ra2qxrl	\N	1	2026-07-28 16:30:41.406	2026-07-30 11:53:48.596
\.


--
-- Data for Name: member_pack_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_pack_enrollments (id, "memberId", "packId", "packPaymentId", "purchasedAt", "packStartedAt", "packExpiresAt", status, "closedAt", "createdAt", "updatedAt") FROM stdin;
cmr0jicq70001pn01ybwetgyy	cmpb26l0900ccp4014tau0gjw	cmp4sixhw005ol401euqmhrwh	cmqdv6dcq002lwmxsmu9hobe3	2026-05-17 00:00:00	2026-05-19 00:00:00	2026-06-28 00:00:00	ACTIVE	\N	2026-06-30 11:05:02.191	2026-06-30 11:05:02.196
cmr1tvvfk001lmm01k2l0k5bv	cmr1tvvf8001fmm01nvgjy6v9	cmp4sbkj5005il4015b2x78mh	cmr1tvvfi001jmm01ge2qv5ip	2026-07-01 00:00:00	2026-06-30 00:00:00	2026-10-30 00:00:00	ACTIVE	\N	2026-07-01 08:43:15.296	2026-07-30 11:41:57.803
cmr1us0ff006pmm01yc6jml95	cmp6n9pyb0047p401exgskztu	cmp4t00w6005xl401jv0qklyp	cmr1us0fd006nmm018gxsl5p4	2026-07-01 00:00:00	\N	\N	PENDING_START	\N	2026-07-01 09:08:14.763	2026-07-29 12:52:05.996
cmr0t1ra9000hmm01hpi96jqp	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	cmqzckxzw007umg01i07xqpa8	2026-06-29 00:00:00	2026-07-14 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-06-30 15:32:04.066	2026-07-30 10:32:49.135
cmr0t1ra6000bmm01tqddo3i6	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	cmqzci02p007amg011cbqb3z4	2026-06-29 00:00:00	2026-06-16 00:00:00	2026-07-26 00:00:00	ACTIVE	\N	2026-06-30 15:32:04.063	2026-07-30 10:32:49.156
cmr0t1ra40009mm01fu4gwe93	cmqzcgki3006umg01b9522uso	cmp4s6te2005el4011ra2qxrl	cmqzcgkic006ymg01rve7iery	2026-06-29 00:00:00	2026-06-16 00:00:00	2026-07-16 00:00:00	ACTIVE	\N	2026-06-30 15:32:04.06	2026-07-30 10:32:49.153
cmr0t1ra7000dmm01ya5eh8iw	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	cmqzcie2c007emg01mv00r5zm	2026-06-29 00:00:00	2026-07-24 00:00:00	2026-09-02 00:00:00	ACTIVE	\N	2026-06-30 15:32:04.064	2026-07-29 18:35:09.444
cmr3hjo9z0099mm01qx5fhey8	cmr0e8q3k009bmg01p00ba0nx	cmqur0gkm00jko7014ajnmg2a	cmr0e8q3r009fmg01qg94wvtv	2026-06-30 00:00:00	2026-06-29 00:00:00	2026-08-29 00:00:00	ACTIVE	\N	2026-07-02 12:33:23.111	2026-07-30 15:08:36.279
cmr0tonjd000qmm012tsvnwxq	cmqz4ky2t003fmg011oeykh0h	cmp4s8kui005fl40100a1ew4b	cmqz4ky31003jmg01x0u3n9gf	2026-06-29 00:00:00	2026-06-09 00:00:00	2026-07-19 00:00:00	ACTIVE	\N	2026-06-30 15:49:52.298	2026-07-30 10:26:00.758
cmr3d5w3b008jmm011lqpt7tz	cmqno2ywp00dfod01x3mtrdjg	cmp4sadgq005hl4016z9eqilf	cmr3d5w39008hmm01htqp5gk8	2026-07-02 00:00:00	2026-07-07 00:00:00	2026-10-07 00:00:00	ACTIVE	\N	2026-07-02 10:30:41.591	2026-07-15 13:24:54.543
cmr0u31x3000wmm01h85v1k3a	cmpuxlbuw00ijp4016pmesm29	cmp4sixhw005ol401euqmhrwh	cmqdv6ddq003fwmxsm1qfyh8n	2026-05-31 00:00:00	2026-06-01 00:00:00	2026-08-01 00:00:00	ACTIVE	\N	2026-06-30 16:01:04.12	2026-06-30 16:01:04.122
cmr10rk900016mm0186az6i2l	cmpxths4t00k7p401ms2nx4f0	cmp4s9cxl005gl4018m1wy6wp	cmqdv6def003zwmxsr01wkqlq	2026-06-02 00:00:00	2026-06-02 00:00:00	2026-08-02 00:00:00	ACTIVE	\N	2026-06-30 19:08:05.317	2026-06-30 19:08:05.32
cmr1shg4h001cmm0105vdhmtz	cmpv004tl00iyp4017n7rkxr5	cmp4sadgq005hl4016z9eqilf	cmqdv6ddx003lwmxsh9nh8x2g	2026-05-31 00:00:00	2026-06-03 00:00:00	2026-09-03 00:00:00	ACTIVE	\N	2026-07-01 08:04:02.657	2026-07-01 08:04:02.662
cmr1twi1d001nmm01i3agog51	cmp88f7g90073p401w4uw4pqs	cmp4s8kui005fl40100a1ew4b	cmqdv6dcm002hwmxszvqr7oq1	2026-05-15 00:00:00	2026-06-09 00:00:00	2026-07-19 00:00:00	ACTIVE	\N	2026-07-01 08:43:44.594	2026-07-01 08:43:44.595
cmr1urpcp006hmm01ryhniael	cmp6n9pyb0047p401exgskztu	cmp4sadgq005hl4016z9eqilf	cmqdv6db4001dwmxswb41doum	2026-05-14 00:00:00	2026-05-18 00:00:00	2026-08-18 00:00:00	ACTIVE	\N	2026-07-01 09:08:00.409	2026-07-01 09:08:00.413
cmr0u5dhk0012mm016d1vfqlf	cmpuxlbuw00ijp4016pmesm29	cmp4s8kui005fl40100a1ew4b	cmr0u5dhi0010mm01cxtmqi5v	2026-06-30 00:00:00	2026-06-25 00:00:00	2026-08-04 00:00:00	ACTIVE	\N	2026-06-30 16:02:52.424	2026-07-30 11:38:35.53
cmr0jicqa0003pn018fpl7y8i	cmpb26l0900ccp4014tau0gjw	cmp4sadgq005hl4016z9eqilf	cmqrzh43m009do701kkaohpof	2026-06-24 00:00:00	2026-05-19 00:00:00	2026-08-19 00:00:00	ACTIVE	\N	2026-06-30 11:05:02.195	2026-07-30 11:34:15.156
cmr1wuhwt007lmm01laztadik	cmp6n0r9g003sp401svwhqzjy	cmp4s9cxl005gl4018m1wy6wp	cmqdv6daj0017wmxsagfm22zu	2026-05-14 00:00:00	2026-05-21 00:00:00	2026-07-21 00:00:00	ACTIVE	\N	2026-07-01 10:06:09.965	2026-07-01 10:06:09.968
cmr29a2zd007rmm01uuc8e7k3	cmqf2b42m000vwmtsnd6eu11l	cmp4s8kui005fl40100a1ew4b	cmqf2b42z000zwmtslwps3krf	2026-06-14 00:00:00	2026-06-15 00:00:00	2026-07-25 00:00:00	ACTIVE	\N	2026-07-01 15:54:12.506	2026-07-01 15:54:12.508
cmr2bjfjz007zmm01geyxlgs6	cmpqvd4pp00hkp401fok0cwt8	cmp4sadgq005hl4016z9eqilf	cmqdv6ddf0035wmxs83e5qsl7	2026-05-28 00:00:00	2026-06-03 00:00:00	2026-09-03 00:00:00	ACTIVE	\N	2026-07-01 16:57:27.935	2026-07-01 16:57:27.937
cmr2bn9qz0081mm01anqblauo	cmqno2ywp00dfod01x3mtrdjg	cmp4s8kui005fl40100a1ew4b	cmqno2ywz00djod01zp7yra8f	2026-06-21 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	ACTIVE	\N	2026-07-01 17:00:27.035	2026-07-29 17:45:51.888
cmr0tvzbh000smm01u96c73yz	cmpxtfc9z00k2p401mfev8i51	cmp4s9cxl005gl4018m1wy6wp	cmqdv6dec003xwmxs4uuj7cdi	2026-06-02 00:00:00	2026-06-02 00:00:00	2026-08-02 00:00:00	REPLACED	2026-07-14 15:25:52.514	2026-06-30 15:55:34.157	2026-07-14 15:25:52.515
cmr2chrkv0085mm01nicwrmg7	cmqf2b405000dwmtsddcf7agj	cmp4s8kui005fl40100a1ew4b	cmqf2b40n000hwmtsin8njl0v	2026-06-12 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	ACTIVE	\N	2026-07-01 17:24:09.824	2026-07-01 17:24:09.828
cmr2hytdp008bmm014enm5hbl	cmp9muoo600alp401b1jj91hv	cmp4s8kui005fl40100a1ew4b	cmqdv6dc00021wmxsz9rkqzzw	2026-05-16 00:00:00	2026-06-03 00:00:00	2026-07-13 00:00:00	ACTIVE	\N	2026-07-01 19:57:23.39	2026-07-01 19:57:23.392
cmr3g3flr0093mm01jzyheg8c	cmqqihcm6000np901ub12rzon	cmp4s6te2005el4011ra2qxrl	cmqqihcme000rp901bv7gvzq6	2026-06-23 00:00:00	\N	\N	REPLACED	2026-07-02 11:52:45.762	2026-07-02 11:52:45.759	2026-07-02 11:52:45.763
cmr3g3flt0095mm017kysen0w	cmqqihcm6000np901ub12rzon	cmp4s9cxl005gl4018m1wy6wp	cmqrwhklz000rsc01rc9mf40p	2026-06-24 00:00:00	2026-06-20 00:00:00	2026-08-20 00:00:00	ACTIVE	\N	2026-07-02 11:52:45.761	2026-07-02 11:52:45.764
cmr4pbgfh009hmm012el8a38v	cmpzp6len00kwp4012mdrq8ka	cmp4s8kui005fl40100a1ew4b	cmqdv6det0045wmxsmcuh45mn	2026-06-03 00:00:00	2026-06-04 00:00:00	2026-07-14 00:00:00	ACTIVE	\N	2026-07-03 08:58:42.797	2026-07-03 08:58:42.801
cmr54l13s009wmm011ayojfz0	cmpya6nur00kgp401et6xel9m	cmp4s8kui005fl40100a1ew4b	cmqdv6dej0041wmxsyuvfnqcu	2026-06-02 00:00:00	2026-06-04 00:00:00	2026-07-14 00:00:00	ACTIVE	\N	2026-07-03 16:06:03.736	2026-07-03 16:06:03.74
cmr58r6ku00a6mm018tkeggh9	cmpuxgfvo00iep401kuin241v	cmp4s9cxl005gl4018m1wy6wp	cmqdv6ddo003dwmxs4ineitbm	2026-05-31 00:00:00	2026-06-02 00:00:00	2026-08-02 00:00:00	ACTIVE	\N	2026-07-03 18:02:49.23	2026-07-03 18:02:49.233
cmr638xm500ajmm01v8303ar9	cmr638xlv00admm01cm77sv03	cmquqvx9k00jio701xv9bwsuw	cmr638xm300ahmm01wvfv7zt5	2026-07-04 00:00:00	\N	\N	PENDING_START	\N	2026-07-04 08:16:25.901	2026-07-04 08:16:25.901
cmr65hzjm00armm0154b83zpx	cmqf2b43f0011wmts29fvfire	cmp4s8kui005fl40100a1ew4b	cmqf2b43t0015wmtsbkxtfe6m	2026-06-14 00:00:00	2026-06-14 00:00:00	2026-07-24 00:00:00	ACTIVE	\N	2026-07-04 09:19:27.539	2026-07-04 09:19:27.544
cmr3dnoa80091mm0157e1wzg8	cmr3dno9x008vmm01yn5zbnx3	cmp4s8kui005fl40100a1ew4b	cmr3dnoa5008zmm01dipex94l	2026-07-02 00:00:00	2026-06-22 00:00:00	2026-08-01 00:00:00	ACTIVE	\N	2026-07-02 10:44:31.28	2026-07-09 11:14:07.162
cmr1txafl001tmm0191rt5ws1	cmp88f7g90073p401w4uw4pqs	cmp4s8kui005fl40100a1ew4b	cmr1txafk001rmm01tjybzryr	2026-07-01 00:00:00	2026-06-23 00:00:00	2026-08-02 00:00:00	ACTIVE	\N	2026-07-01 08:44:21.394	2026-07-09 11:21:48.054
cmr0t1ra8000fmm01r8il4ig5	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	cmqzck6vb007qmg0105yqs6p6	2026-06-29 00:00:00	2026-07-24 00:00:00	2026-09-02 00:00:00	ACTIVE	\N	2026-06-30 15:32:04.065	2026-07-29 18:35:09.447
cmr66x4w100b0mm017iamsi9m	cmr66x4vm00aumm01n1n9q5b4	cmp4sadgq005hl4016z9eqilf	cmr66x4vw00aymm01p4x19rqw	2026-07-04 00:00:00	2026-07-02 00:00:00	2026-10-02 00:00:00	ACTIVE	\N	2026-07-04 09:59:13.921	2026-07-09 12:23:31.923
cmr3dc14a008smm01g3ok4d4c	cmr3dc13z008mmm01r1xcp8qr	cmp4s8kui005fl40100a1ew4b	cmr3dc147008qmm01ulvp3suq	2026-07-02 00:00:00	2026-07-01 00:00:00	2026-08-10 00:00:00	ACTIVE	\N	2026-07-02 10:35:28.042	2026-07-09 12:16:04.935
cmr54gw17009umm018tiruohu	cmr54gw0r009omm01n0aos5l6	cmp4s8kui005fl40100a1ew4b	cmr54gw13009smm01k1ate9fz	2026-07-03 00:00:00	2026-07-04 00:00:00	2026-08-13 00:00:00	ACTIVE	\N	2026-07-03 16:02:50.539	2026-07-09 12:35:46.343
cmr29fwj1007xmm01scand2vf	cmqf2b42m000vwmtsnd6eu11l	cmp4sadgq005hl4016z9eqilf	cmr29fwiz007vmm01swmy9mfl	2026-07-01 00:00:00	2026-07-03 00:00:00	2026-10-03 00:00:00	ACTIVE	\N	2026-07-01 15:58:44.078	2026-07-14 11:20:32.017
cmr2cg18q0083mm01r64mz8zu	cmqw8njse001zmg010hmpycb7	cmp4s6te2005el4011ra2qxrl	cmqw8njsm0023mg011o7u45d1	2026-06-27 00:00:00	2026-06-27 00:00:00	2026-07-27 00:00:00	REPLACED	2026-07-14 11:23:43.038	2026-07-01 17:22:49.035	2026-07-14 11:23:43.039
cmr639eu100apmm01418xz1vr	cmr638xlv00admm01cm77sv03	cmqur0gkm00jko7014ajnmg2a	cmr639etz00anmm01f04sgs0o	2026-07-04 00:00:00	2026-07-04 00:00:00	2026-09-04 00:00:00	ACTIVE	\N	2026-07-04 08:16:48.217	2026-07-15 10:51:33.495
cmr91bomv00d4mm01xshksvyp	cmp6mujhf003ip4019yxl5iri	cmp4sadgq005hl4016z9eqilf	cmqdv6da60013wmxsyzdoz9na	2026-05-14 00:00:00	2026-05-31 00:00:00	2026-08-31 00:00:00	ACTIVE	\N	2026-07-06 09:45:53.527	2026-07-06 09:45:53.529
cmraekyhb00idmm01cev6lkp9	cmqur46xc00jno701ceuxfoxy	cmqur0gkm00jko7014ajnmg2a	cmqur46xl00jro701jo0fuabr	2026-06-26 00:00:00	2026-05-31 00:00:00	2026-07-31 00:00:00	REPLACED	\N	2026-07-07 08:44:47.376	2026-07-30 11:52:11.714
cmr99n25700egmm017gksyqws	cmqpbrpkn001slk01gekkfisb	cmp4s6te2005el4011ra2qxrl	cmqpbrpkr001wlk015xnkgq0n	2026-06-22 00:00:00	\N	\N	REPLACED	2026-07-06 13:38:41.184	2026-07-06 13:38:41.179	2026-07-06 13:38:41.184
cmr99n5tt00emmm01rix53v6c	cmqpbt84l001zlk01r9quitpi	cmp4s8kui005fl40100a1ew4b	cmqtghn9s00ito701kejp6rks	2026-06-25 00:00:00	2026-06-24 00:00:00	2026-08-03 00:00:00	ACTIVE	\N	2026-07-06 13:38:45.954	2026-07-09 11:22:59.842
cmr99n5ts00ekmm01q9hldlzk	cmqpbt84l001zlk01r9quitpi	cmp4s6te2005el4011ra2qxrl	cmqpbt84r0023lk01oqewzngd	2026-06-22 00:00:00	\N	\N	REPLACED	2026-07-06 13:38:45.955	2026-07-06 13:38:45.952	2026-07-06 13:38:45.956
cmr9brk4e00hqmm01m7fceq6a	cmqqimbo30011p9015ihys621	cmp4s8kui005fl40100a1ew4b	cmqz44r3x0031mg01shvopxs2	2026-06-29 00:00:00	2026-06-26 00:00:00	2026-08-05 00:00:00	ACTIVE	\N	2026-07-06 14:38:10.334	2026-07-09 11:36:19.933
cmr9bqovs00hgmm01kom97pf9	cmqqifegn000gp901x4b3a61j	cmp4s6te2005el4011ra2qxrl	cmqqifegw000kp90189zzm7lm	2026-06-23 00:00:00	2026-06-08 00:00:00	2026-07-08 00:00:00	ACTIVE	\N	2026-07-06 14:37:29.849	2026-07-30 12:26:26.828
cmr9bqovv00himm010b1o59df	cmqqifegn000gp901x4b3a61j	cmp4sixhw005ol401euqmhrwh	cmqrwfs45000nsc010xqvf9yg	2026-06-24 00:00:00	2026-06-10 00:00:00	2026-08-10 00:00:00	ACTIVE	\N	2026-07-06 14:37:29.851	2026-07-30 12:26:26.832
cmr9bquz500hmmm01gxnsjlta	cmqqija83000up901vbrlsocv	cmp4s8kui005fl40100a1ew4b	cmqrwjws90013sc01i5iw6fpe	2026-06-24 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	ACTIVE	\N	2026-07-06 14:37:37.746	2026-07-29 13:19:12.153
cmrdaof1g003hmn01l2lqcf0u	cmqqio1g50018p9018hz9fq36	cmp4s8kui005fl40100a1ew4b	cmqrwj8vz000zsc019flh4t87	2026-06-24 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	ACTIVE	\N	2026-07-09 09:18:48.868	2026-07-29 13:19:02.567
cmr9brk4b00homm01vvwul7p5	cmqqimbo30011p9015ihys621	cmp4s6te2005el4011ra2qxrl	cmqqimboa0015p9015ea4cb9z	2026-06-23 00:00:00	\N	\N	REPLACED	2026-07-06 14:38:10.336	2026-07-06 14:38:10.331	2026-07-06 14:38:10.337
cmrdaof1f003fmn01l5rmci82	cmqqio1g50018p9018hz9fq36	cmp4s6te2005el4011ra2qxrl	cmqqio1gd001cp901yzrdzc72	2026-06-23 00:00:00	2026-06-13 00:00:00	2026-07-13 00:00:00	ACTIVE	\N	2026-07-09 09:18:48.867	2026-07-29 13:19:02.563
cmrbukuwq000amn01uvkga3fm	cmrbukuwd0004mn016lbgagog	cmp4s6te2005el4011ra2qxrl	cmrbukuwn0008mn01amxdrxnb	2026-07-08 00:00:00	2026-07-07 00:00:00	2026-08-06 00:00:00	ACTIVE	\N	2026-07-08 09:00:22.778	2026-07-15 13:22:43.446
cmrafdal400jxmm01l06ik7sm	cmqnlovfk00czod0169336zw1	cmp4s8kui005fl40100a1ew4b	cmqnlovfq00d3od01y7or62rp	2026-06-21 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	ACTIVE	\N	2026-07-07 09:06:49.433	2026-07-07 09:06:49.436
cmr0t1raa000jmm01sdayefqb	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	cmqzcnl5a0086mg01sdjkluz7	2026-06-29 00:00:00	2026-06-30 00:00:00	2026-08-09 00:00:00	REPLACED	\N	2026-06-30 15:32:04.067	2026-07-29 18:35:09.467
cmrasf2d800l5mm0156ytuuy1	cmqf2b3z80007wmtsodeuow25	cmp4t5amk005zl4014v76r8bk	cmqf2b3zt000bwmtsvy0rx2qi	2026-06-11 00:00:00	2026-06-14 00:00:00	2026-08-14 00:00:00	ACTIVE	\N	2026-07-07 15:12:07.1	2026-07-07 15:12:07.102
cmraefj5d00i5mm01qi7f4b5m	cmraefj5300hzmm01gbupayou	cmp4s6te2005el4011ra2qxrl	cmraefj5b00i3mm01i93dp46l	2026-07-07 00:00:00	2026-07-06 00:00:00	2026-08-05 00:00:00	ACTIVE	\N	2026-07-07 08:40:34.226	2026-07-30 10:58:41.247
cmrdaevec002bmn019n1i5lwi	cmrdaeve70025mn01r9qzxda0	cmp4s6te2005el4011ra2qxrl	cmrdaeveb0029mn019z7no6ck	2026-07-09 00:00:00	\N	\N	PENDING_START	\N	2026-07-09 09:11:23.509	2026-07-09 09:11:23.509
cmrdan6nb003dmn015kvlnnjf	cmqp0fvcq00e0od01115zmkft	cmp4s6te2005el4011ra2qxrl	cmqp0fvcz00e4od01mg8xwdss	2026-06-22 00:00:00	2026-05-19 00:00:00	2026-06-18 00:00:00	ACTIVE	\N	2026-07-09 09:17:51.335	2026-07-09 09:17:51.34
cmr9bquz300hkmm01gjpkpzob	cmqqija83000up901vbrlsocv	cmp4s6te2005el4011ra2qxrl	cmqqija89000yp90110hzbaop	2026-06-23 00:00:00	2026-06-13 00:00:00	2026-07-13 00:00:00	ACTIVE	\N	2026-07-06 14:37:37.744	2026-07-29 13:19:12.151
cmr99lkb900eemm01jgz9hd3x	cmqnjvfwv00clod01smhvf5v7	cmp4s9cxl005gl4018m1wy6wp	cmqnjvfx600cpod011890aqpz	2026-06-21 00:00:00	2026-06-15 00:00:00	2026-08-15 00:00:00	REPLACED	\N	2026-07-06 13:37:31.413	2026-07-30 11:02:12.111
cmr99n25a00eimm01jpshfnr2	cmqpbrpkn001slk01gekkfisb	cmp4s8kui005fl40100a1ew4b	cmqtgh5s900ipo701a077x32j	2026-06-25 00:00:00	2026-06-24 00:00:00	2026-08-03 00:00:00	ACTIVE	\N	2026-07-06 13:38:41.182	2026-07-09 11:22:54.521
cmrafe0sk00k3mm01awzp0c06	cmqnlovfk00czod0169336zw1	cmp4s8kui005fl40100a1ew4b	cmrafe0si00k1mm01c009uo2j	2026-07-07 00:00:00	2026-06-30 00:00:00	2026-08-09 00:00:00	ACTIVE	\N	2026-07-07 09:07:23.396	2026-07-09 11:48:43.65
cmr6940rp00bkmm01me7h295i	cmr6940rg00bemm01s11l95mw	cmp4s8kui005fl40100a1ew4b	cmr6940rn00bimm01b2jzka8f	2026-07-04 00:00:00	2026-07-04 00:00:00	2026-08-13 00:00:00	ACTIVE	\N	2026-07-04 11:00:34.405	2026-07-09 12:36:50.426
cmr91dvvp00djmm01bi655ohz	cmr91dvvk00ddmm01yvoi91dd	cmr0t6kdb000mmm01e58p4sux	cmr91dvvo00dhmm01t8qe0iz2	2026-07-06 00:00:00	2026-07-05 00:00:00	2026-09-05 00:00:00	ACTIVE	\N	2026-07-06 09:47:36.229	2026-07-30 11:23:42.721
cmrbz3p92001nmn01kin1kajw	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmqp4ky0f0006lk01kpqvbw9e	2026-06-22 00:00:00	2026-06-20 00:00:00	2026-07-20 00:00:00	REPLACED	\N	2026-07-08 11:07:00.374	2026-07-30 12:26:38.711
cmr92ygt100eamm01p0arq54s	cmr92ygsq00e4mm01t2ww4seu	cmp4s6te2005el4011ra2qxrl	cmr92ygsz00e8mm018wzeujzo	2026-07-06 00:00:00	2026-07-06 00:00:00	2026-08-05 00:00:00	ACTIVE	\N	2026-07-06 10:31:36.085	2026-07-13 08:34:54.073
cmr91fzqc00dsmm01vkafshq5	cmr91fzq700dmmm01t48rlkdj	cmr0t6kdb000mmm01e58p4sux	cmr91fzqb00dqmm01h3sgrv6n	2026-07-06 00:00:00	2026-07-06 00:00:00	2026-09-06 00:00:00	ACTIVE	\N	2026-07-06 09:49:14.533	2026-07-13 08:35:01.559
cmr91oeqp00e1mm01g1yx5dhn	cmr91oeqe00dvmm012s7it3wq	cmp4t00w6005xl401jv0qklyp	cmr91oeqm00dzmm01ius7j1cl	2026-07-06 00:00:00	2026-07-05 00:00:00	2026-07-20 00:00:00	REPLACED	2026-07-13 08:35:50.404	2026-07-06 09:55:47.233	2026-07-13 08:35:50.405
cmraf656700jrmm01bm2qojed	cmqur9js700juo7015s7s7fwr	cmqur0gkm00jko7014ajnmg2a	cmqur9jsd00jyo701ettlpf6s	2026-06-26 00:00:00	2026-05-22 00:00:00	2026-07-22 00:00:00	ACTIVE	\N	2026-07-07 09:01:15.824	2026-07-15 09:58:46.684
cmrbumgkb000jmn013lrs2592	cmrbumgk4000dmn01h99tqe11	cmp4s6te2005el4011ra2qxrl	cmrbumgk9000hmn01m0yqiw76	2026-07-08 00:00:00	2026-07-07 00:00:00	2026-08-06 00:00:00	ACTIVE	\N	2026-07-08 09:01:37.499	2026-07-15 13:22:51.605
cmrbunzzy000smn01e5pqfsq3	cmrbunzzo000mmn01dkqpill6	cmr0t6kdb000mmm01e58p4sux	cmrbunzzv000qmn01a9swzs82	2026-07-08 00:00:00	2026-07-08 00:00:00	2026-09-08 00:00:00	ACTIVE	\N	2026-07-08 09:02:49.342	2026-07-15 13:27:05.069
cmrdak4va0032mn011qvaxvqn	cmrdak4v0002wmn01j2my021k	cmp4sixhw005ol401euqmhrwh	cmrdak4v80030mn017m9d5kd8	2026-07-09 00:00:00	2026-07-13 00:00:00	2026-09-13 00:00:00	ACTIVE	\N	2026-07-09 09:15:29.063	2026-07-21 07:07:08.031
cmrdaicjd002tmn01buzoek94	cmrdaicj5002nmn01fbw9scjq	cmp4s6te2005el4011ra2qxrl	cmrdaicjb002rmn015wy4oz8r	2026-07-09 00:00:00	2026-07-08 00:00:00	2026-08-07 00:00:00	ACTIVE	\N	2026-07-09 09:14:05.689	2026-07-15 13:53:40.63
cmrdagpt6002kmn01riukefpr	cmrdagpsz002emn01k4cuyqwh	cmp4s6te2005el4011ra2qxrl	cmrdagpt5002imn01462zkdte	2026-07-09 00:00:00	2026-07-08 00:00:00	2026-08-07 00:00:00	ACTIVE	\N	2026-07-09 09:12:49.578	2026-07-15 13:53:57.527
cmr91c6ea00damm013eb8ymcg	cmp6mujhf003ip4019yxl5iri	cmp4scs0q005jl401azkonj0y	cmr91c6e800d8mm01hbeilygh	2026-07-06 00:00:00	2026-07-09 00:00:00	2026-12-09 00:00:00	ACTIVE	\N	2026-07-06 09:46:16.546	2026-07-15 13:58:03.049
cmrbure4e0011mn01la24xvy3	cmrbure45000vmn014ppcw3bv	cmp4sixhw005ol401euqmhrwh	cmrbure4c000zmn01ye4k0u0j	2026-07-08 00:00:00	2026-07-10 00:00:00	2026-09-10 00:00:00	ACTIVE	\N	2026-07-08 09:05:27.615	2026-07-15 14:06:26.428
cmrdalmpu003bmn01rrfcmnom	cmrdalmpn0035mn01esii22rz	cmp4sixhw005ol401euqmhrwh	cmrdalmps0039mn01cssz9ex0	2026-07-09 00:00:00	2026-07-13 00:00:00	2026-09-13 00:00:00	ACTIVE	\N	2026-07-09 09:16:38.85	2026-07-21 07:24:19.193
cmrbwaecb001jmn01cutt3dop	cmrbwaec5001dmn01can4i9wf	cmp4s8kui005fl40100a1ew4b	cmrbwaec9001hmn013d4v63y0	2026-07-08 00:00:00	2026-07-14 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-07-08 09:48:13.979	2026-07-21 07:37:39.98
cmrbw6y2l001amn01qh8pq92x	cmrbw6y2c0014mn01a6ii4tiu	cmp4s8kui005fl40100a1ew4b	cmrbw6y2i0018mn011n0yowln	2026-07-08 00:00:00	2026-07-14 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-07-08 09:45:32.926	2026-07-21 07:37:50.395
cmraegf4z00ibmm01733edusw	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	cmraegf4x00i9mm01n3tuto25	2026-07-07 00:00:00	2026-07-14 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-07-07 08:41:15.684	2026-07-30 10:32:49.138
cmrdaourb003pmn014puaxn2z	cmqw8ha3o0017mg010cohkf7t	cmp4s6te2005el4011ra2qxrl	cmqw8ha3w001bmg01tkxms7y2	2026-06-27 00:00:00	2026-06-24 00:00:00	2026-07-24 00:00:00	ACTIVE	\N	2026-07-09 09:19:09.239	2026-07-30 11:44:21.243
cmrdapcj8003xmn01ic9p185w	cmqz4i19x0038mg01irua66ou	cmp4s8kui005fl40100a1ew4b	cmqz4i1a4003cmg01tauwkmg0	2026-06-29 00:00:00	2026-06-08 00:00:00	2026-07-18 00:00:00	ACTIVE	\N	2026-07-09 09:19:32.276	2026-07-09 09:19:32.28
cmrdbu59d004dmn01h8bhquur	cmqrwntpy0016sc0146g80wvq	cmp4s9cxl005gl4018m1wy6wp	cmqtgii5200ixo701pxkf7as7	2026-06-25 00:00:00	2026-06-23 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-07-09 09:51:15.746	2026-07-30 10:55:20.863
cmrdaoxi9003vmn0154e6u442	cmqw8ilsb001emg0158v8etes	cmp4t5amk005zl4014v76r8bk	cmqw8sc4i002bmg01aoagf4fe	2026-06-27 00:00:00	2026-06-30 00:00:00	2026-08-30 00:00:00	ACTIVE	\N	2026-07-09 09:19:12.802	2026-07-09 11:50:23.497
cmrdaourd003rmn015bdjudvf	cmqw8ha3o0017mg010cohkf7t	cmp4t5amk005zl4014v76r8bk	cmqw8ru5w0027mg018z85ds9l	2026-06-27 00:00:00	2026-06-30 00:00:00	2026-08-30 00:00:00	ACTIVE	\N	2026-07-09 09:19:09.241	2026-07-09 11:50:30.048
cmrdgx2fn00f9mn01ftvbt40v	cmpzh61qy00kpp401u52chqfx	cmp4s8kui005fl40100a1ew4b	cmqdv6dem0043wmxsnvnjcn1r	2026-06-03 00:00:00	\N	\N	REPLACED	2026-06-24 00:00:00	2026-07-09 12:13:30.132	2026-07-09 12:13:30.135
cmrdgx2fp00fbmn01xwiu4eea	cmpzh61qy00kpp401u52chqfx	cmp4s8kui005fl40100a1ew4b	cmqs9t4tj00gbo7010edbzpc7	2026-06-24 00:00:00	2026-06-07 00:00:00	2026-07-17 00:00:00	ACTIVE	\N	2026-07-09 12:13:30.133	2026-07-09 12:13:30.136
cmrdhk1e900i9mn01v5q008wr	cmpmhc40500h9p40180sb0edr	cmp4sixhw005ol401euqmhrwh	cmqdv6ddc0033wmxs5fzynm86	2026-05-25 00:00:00	2026-05-21 00:00:00	2026-07-21 00:00:00	ACTIVE	\N	2026-07-09 12:31:21.874	2026-07-30 10:34:35.367
cmriywk5u00osmn01mgh562xu	cmr91oeqe00dvmm012s7it3wq	cmp4s6te2005el4011ra2qxrl	cmriywk5s00oqmn015jyi84zu	2026-07-13 00:00:00	2026-07-06 00:00:00	2026-08-05 00:00:00	REPLACED	2026-07-15 13:29:05.174	2026-07-13 08:35:50.419	2026-07-15 13:29:05.175
cmrdp2no300krmn01udp50mqq	cmpi6ban400fip401ppm9o7wy	cmp4sixhw005ol401euqmhrwh	cmqdv6dda0031wmxstjtt3zu4	2026-05-22 00:00:00	2026-05-23 00:00:00	2026-07-23 00:00:00	ACTIVE	\N	2026-07-09 16:01:47.859	2026-07-09 16:01:47.861
cmrf41ook00lsmn015sl4gw4a	cmp9n16yg00aqp401yfgd8zit	cmp4s8kui005fl40100a1ew4b	cmqdv6dc20023wmxszmd9jvem	2026-05-16 00:00:00	2026-06-03 00:00:00	2026-07-13 00:00:00	ACTIVE	\N	2026-07-10 15:48:42.932	2026-07-10 15:48:42.935
cmrfb5ovc00mfmn01nerwjz7q	cmp71pbmj005ip401rxsl0n27	cmp4sadgq005hl4016z9eqilf	cmqdv6dbl001pwmxsrtm4jk7z	2026-05-14 00:00:00	2026-05-20 00:00:00	2026-08-20 00:00:00	ACTIVE	\N	2026-07-10 19:07:47.112	2026-07-10 19:07:47.115
cmrfb66ws00mhmn01jyb0nzq0	cmp6mh9mn0033p401xa6v43p7	cmp4sejni005kl4013ure33mc	cmqdv6d9t000xwmxsqlf9ug9v	2026-05-14 00:00:00	2026-05-18 00:00:00	2027-05-18 00:00:00	ACTIVE	\N	2026-07-10 19:08:10.493	2026-07-10 19:08:10.494
cmrgrz2ij00mlmn010tbj2rdr	cmp8b0p5m0078p401ko5fipst	cmp4sixhw005ol401euqmhrwh	cmqdv6d8v000fwmxs22u4zx53	2026-05-15 00:00:00	2026-05-22 00:00:00	2026-07-22 00:00:00	ACTIVE	\N	2026-07-11 19:46:17.852	2026-07-11 19:46:17.854
cmrhk4h4h00mpmn011zyqlqbn	cmp87ym20006yp401590xadl0	cmp4sadgq005hl4016z9eqilf	cmqdv6dbt001vwmxsbi7309dg	2026-05-15 00:00:00	2026-06-11 00:00:00	2026-09-11 00:00:00	ACTIVE	\N	2026-07-12 08:54:19.314	2026-07-12 08:54:19.316
cmriyt8i700oemn01j7y4icfg	cmqnjhe4500c7od01xunmmhyz	cmp4s8kui005fl40100a1ew4b	cmqnjhe4e00cbod01e4mgdqm7	2026-06-21 00:00:00	2026-06-17 00:00:00	2026-07-27 00:00:00	ACTIVE	\N	2026-07-13 08:33:15.343	2026-07-30 11:41:22.257
cmrf1sefj00lhmn01dwys4n9r	cmrf1sef700lbmn01oewtlk1z	cmp4s8kui005fl40100a1ew4b	cmrf1sefg00lfmn01pj6vrp45	2026-07-10 00:00:00	2026-07-10 00:00:00	2026-08-19 00:00:00	ACTIVE	\N	2026-07-10 14:45:30.511	2026-07-15 13:30:47.188
cmrjc5nwx000bqd012xbsx06f	cmp9pbn9j00b7p401wd3w8sn0	cmp4s8kui005fl40100a1ew4b	cmqrz9rdj008xo701nue1mmm9	2026-06-24 00:00:00	2026-06-25 00:00:00	2026-08-04 00:00:00	ACTIVE	\N	2026-07-13 14:46:50.193	2026-07-30 11:38:55.403
cmrjc5nwv0009qd01i5b4vtwo	cmp9pbn9j00b7p401wd3w8sn0	cmp4s8kui005fl40100a1ew4b	cmqdv6dc80027wmxsmwx92mur	2026-05-16 00:00:00	2026-05-18 00:00:00	2026-06-27 00:00:00	ACTIVE	\N	2026-07-13 14:46:50.191	2026-07-30 11:38:55.341
cmrkknjv8003ulq010j9n0qy6	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmrkknjv5003slq018c5zeq3r	2026-07-14 00:00:00	\N	\N	PENDING_START	\N	2026-07-14 11:32:27.86	2026-07-29 13:05:21.145
cmrjd61r50003kb016ywplmdw	cmp5dd5sd0074l401pv3drst8	cmp4sixhw005ol401euqmhrwh	cmqs9vxjn00gno701s5xowtc8	2026-06-24 00:00:00	2026-06-25 00:00:00	2026-08-25 00:00:00	ACTIVE	\N	2026-07-13 15:15:07.746	2026-07-13 15:15:07.749
cmrjjtauf000blq01uey2vtps	cmp6mxgtj003np401n6d3md2o	cmp4skb22005rl4014f0e7wgs	cmqdv6daf0015wmxsnlo3woj4	2026-05-14 00:00:00	2026-05-23 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-07-13 18:21:10.311	2026-07-13 18:21:10.314
cmrkfxbvp000jlq01o9e78as4	cmpfpx1dd00ekp4015zb7hrup	cmp4sbkj5005il4015b2x78mh	cmqdv6dd5002xwmxs8evhb5lr	2026-05-20 00:00:00	2026-05-22 00:00:00	2026-09-22 00:00:00	ACTIVE	\N	2026-07-14 09:20:05.99	2026-07-14 09:20:05.993
cmrkkcax80030lq01sbzbvucv	cmqw8njse001zmg010hmpycb7	cmr0t6kdb000mmm01e58p4sux	cmrkkcax6002ylq01z9qwmg0t	2026-07-14 00:00:00	2026-07-02 00:00:00	2026-09-02 00:00:00	ACTIVE	\N	2026-07-14 11:23:43.053	2026-07-14 11:24:48.806
cmrkkgc3s003clq01od8xxafa	cmqw8khue001lmg01a483drty	cmp4t00w6005xl401jv0qklyp	cmrkkgc3q003alq015a3v4w6n	2026-07-14 00:00:00	2026-07-02 00:00:00	2026-07-17 00:00:00	ACTIVE	\N	2026-07-14 11:26:51.209	2026-07-14 11:26:59.739
cmrkke3d10036lq014lw3kmuz	cmqw8khue001lmg01a483drty	cmp4s6te2005el4011ra2qxrl	cmqw8khuk001pmg01a0opnegx	2026-06-27 00:00:00	2026-06-27 00:00:00	2026-07-27 00:00:00	REPLACED	2026-07-14 11:26:51.195	2026-07-14 11:25:06.565	2026-07-14 11:26:51.196
cmrdmuk7f00knmn01o4zxypn8	cmpxtdnho00jxp401mtude4xv	cmp4s9cxl005gl4018m1wy6wp	cmqdv6de9003vwmxs0cn1ozmd	2026-06-02 00:00:00	2026-06-02 00:00:00	2026-08-02 00:00:00	REPLACED	2026-07-14 15:24:22.753	2026-07-09 14:59:30.891	2026-07-14 15:24:22.754
cmrkks6q30044lq01rvinsltx	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmrkks6q10042lq01z5pdlr00	2026-07-14 00:00:00	\N	\N	PENDING_START	\N	2026-07-14 11:36:04.107	2026-07-29 13:05:21.149
cmrdaoijm003jmn01ls1prroh	cmqqipr55001fp9010qryqpgy	cmp4s6te2005el4011ra2qxrl	cmqqipr5b001jp901hdkszgjs	2026-06-23 00:00:00	2026-06-13 00:00:00	2026-07-13 00:00:00	ACTIVE	\N	2026-07-09 09:18:53.411	2026-07-29 13:18:56.237
cmrdbo36d0047mn01md4mtp63	cmpuxgfvo00iep401kuin241v	cmp4s8kui005fl40100a1ew4b	cmrdbo36b0045mn01scxadj73	2026-07-09 00:00:00	2026-07-08 00:00:00	2026-08-17 00:00:00	ACTIVE	\N	2026-07-09 09:46:33.109	2026-07-30 10:58:02.227
cmrf9259q00m2mn01ay0z35ba	cmraefj5300hzmm01gbupayou	cmp4s9cxl005gl4018m1wy6wp	cmrf9259o00m0mn01qycarwyf	2026-07-10 00:00:00	2026-07-10 00:00:00	2026-09-10 00:00:00	ACTIVE	\N	2026-07-10 18:09:02.511	2026-07-15 14:06:34.066
cmrjd61r40001kb01vml3m10w	cmp5dd5sd0074l401pv3drst8	cmp4sixhw005ol401euqmhrwh	cmqdv6dbx001zwmxsloou00e7	2026-05-13 00:00:00	2026-05-19 00:00:00	2026-07-19 00:00:00	ACTIVE	\N	2026-07-13 15:15:07.744	2026-07-29 12:54:56.351
cmrdrcgb700l0mn012kqic0kg	cmrdrcgat00kumn0112odkalw	cmp4skb22005rl4014f0e7wgs	cmrdrcgb400kymn01mho4uxsu	2026-07-09 00:00:00	2026-07-09 00:00:00	2026-10-09 00:00:00	ACTIVE	\N	2026-07-09 17:05:24.116	2026-07-15 13:57:13.648
cmrfb3yix00mdmn015pi0tykm	cmrfb3yin00m7mn01e62jdrb9	cmp4s6te2005el4011ra2qxrl	cmrfb3yiu00mbmn01vz645x2e	2026-07-10 00:00:00	2026-07-10 00:00:00	2026-08-09 00:00:00	ACTIVE	\N	2026-07-10 19:06:26.314	2026-07-15 14:06:41.526
cmrkjma2q0016lq01fnfcp9yg	cmrkjma2h0010lq01o3ge2qc3	cmp4s8kui005fl40100a1ew4b	cmrkjma2o0014lq01eh8cw0ek	2026-07-14 00:00:00	2026-07-15 00:00:00	2026-08-24 00:00:00	ACTIVE	\N	2026-07-14 11:03:28.899	2026-07-21 07:41:44.592
cmrjemetk0005lq0188ggpu7h	cmqnjhe4500c7od01xunmmhyz	cmp4s9cxl005gl4018m1wy6wp	cmrjemeti0003lq01pibk50ik	2026-07-13 00:00:00	2026-07-16 00:00:00	2026-09-16 00:00:00	ACTIVE	\N	2026-07-13 15:55:50.792	2026-07-21 07:49:31.127
cmrdbu59b004bmn01ut27sp67	cmqrwntpy0016sc0146g80wvq	cmp4s6te2005el4011ra2qxrl	cmqrwntq4001asc01oq7bln8i	2026-06-24 00:00:00	2026-07-21 00:00:00	2026-08-20 00:00:00	ACTIVE	\N	2026-07-09 09:51:15.743	2026-07-23 12:57:00.329
cmrdaoijn003lmn01l6dsotiw	cmqqipr55001fp9010qryqpgy	cmp4s8kui005fl40100a1ew4b	cmqrwihlw000vsc01ydy35bsk	2026-06-24 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	ACTIVE	\N	2026-07-09 09:18:53.412	2026-07-29 13:18:56.24
cmr54ln1d00a2mm01p97qskdb	cmpya6nur00kgp401et6xel9m	cmp4s8kui005fl40100a1ew4b	cmr54ln1b00a0mm019dpvksz4	2026-07-03 00:00:00	2026-07-09 00:00:00	2026-08-18 00:00:00	ACTIVE	\N	2026-07-03 16:06:32.161	2026-07-29 13:36:08.589
cmrdaos0t003nmn01ifot4yuh	cmqw8ec6p0010mg01ce7hdn33	cmp4sadgq005hl4016z9eqilf	cmqw8ec6x0014mg01efisqh1l	2026-06-27 00:00:00	2026-06-29 00:00:00	2026-09-29 00:00:00	REPLACED	2026-07-29 18:06:47.512	2026-07-09 09:19:05.694	2026-07-29 18:06:47.513
cmrkl27rw004elq01dawc49es	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmrkl27ru004clq01z7lmrj3e	2026-07-14 00:00:00	\N	\N	PENDING_START	\N	2026-07-14 11:43:52.028	2026-07-29 13:05:21.153
cmrkl82fz004klq01x8nifdx5	cmpxt9h9d00jnp401acy1ppf1	cmp4s8kui005fl40100a1ew4b	cmqdv6de5003rwmxs77daovoc	2026-06-02 00:00:00	2026-06-02 00:00:00	2026-07-12 00:00:00	ACTIVE	\N	2026-07-14 11:48:25.056	2026-07-14 11:48:25.059
cmrklvm5q004qlq0186pj6zij	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmrklvm5o004olq018pacgwin	2026-07-14 00:00:00	\N	\N	PENDING_START	\N	2026-07-14 12:06:43.694	2026-07-29 13:05:21.158
cmrm70e2o00knlq01d4fmaew8	cmpazudle00byp401oz4zx3e1	cmp4slcpz005ul401m1rpf0qa	cmqdv6dch002dwmxssphj3anm	2026-05-17 00:00:00	2026-05-21 00:00:00	2026-09-21 00:00:00	ACTIVE	\N	2026-07-15 14:46:04.609	2026-07-28 16:04:15.605
cmrklzs3w0050lq01d1cqj1kc	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmrklzs3t004ylq01e89y9b9h	2026-07-14 00:00:00	2026-07-17 00:00:00	2026-08-16 00:00:00	REPLACED	\N	2026-07-14 12:09:58.029	2026-07-29 13:05:21.162
cmrri21z600m8lq0156k4rkhm	cmrri21yv00m2lq01gugwiiyq	cmp4s6te2005el4011ra2qxrl	cmrri21z400m6lq01yxzno5tn	2026-07-19 00:00:00	2026-07-19 00:00:00	2026-08-18 00:00:00	REPLACED	2026-07-28 14:00:04.693	2026-07-19 07:54:08.898	2026-07-28 14:00:04.694
cmrkpxrh8005clq01hqsbrmyi	cmp5lkgat000fp4013f720b0o	cmp4s8kui005fl40100a1ew4b	cmqdv6d91000jwmxsmko3siv6	2026-05-13 00:00:00	2026-05-19 00:00:00	2026-06-28 00:00:00	ACTIVE	\N	2026-07-14 14:00:22.364	2026-07-14 14:00:22.367
cmrksxson005klq01hlybouc0	cmpxtdnho00jxp401mtude4xv	cmp4s9cxl005gl4018m1wy6wp	cmrksxsoj005ilq019k8rtvj0	2026-07-14 00:00:00	2026-06-26 00:00:00	2026-08-26 00:00:00	ACTIVE	\N	2026-07-14 15:24:22.775	2026-07-14 15:27:24.187
cmrkszpxs005qlq014cnes4d9	cmpxtfc9z00k2p401mfev8i51	cmp4s9cxl005gl4018m1wy6wp	cmrkszpxq005olq01yy2350qc	2026-07-14 00:00:00	2026-06-26 00:00:00	2026-08-26 00:00:00	ACTIVE	\N	2026-07-14 15:25:52.529	2026-07-14 15:28:05.137
cmrktg9uf006qlq01fddorh5z	cmp9p95jj00b2p401dqlrtohp	cmp4s8kui005fl40100a1ew4b	cmqz4fwtz0035mg01gcofdbuv	2026-06-29 00:00:00	2026-07-02 00:00:00	2026-08-11 00:00:00	ACTIVE	\N	2026-07-14 15:38:44.824	2026-07-30 11:40:42.025
cmrktg9ud006olq019k1zx9o6	cmp9p95jj00b2p401dqlrtohp	cmp4s8kui005fl40100a1ew4b	cmqdv6dc40025wmxshbix1fhz	2026-05-16 00:00:00	2026-05-18 00:00:00	2026-06-27 00:00:00	ACTIVE	\N	2026-07-14 15:38:44.821	2026-07-30 11:40:41.871
cmrkth2mk006slq01kp63ilnm	cmp5e2po6007el401m0wr4bxe	cmp4s9cxl005gl4018m1wy6wp	cmqdv6dcx002rwmxswxu2hjml	2026-05-13 00:00:00	\N	\N	REPLACED	2026-06-26 00:00:00	2026-07-14 15:39:22.124	2026-07-14 15:39:22.129
cmrkth2mo006ulq01sb7s476e	cmp5e2po6007el401m0wr4bxe	cmp4s9cxl005gl4018m1wy6wp	cmqurvize00k9o701408qu7za	2026-06-26 00:00:00	2026-05-18 00:00:00	2026-07-18 00:00:00	ACTIVE	\N	2026-07-14 15:39:22.128	2026-07-14 15:39:22.131
cmrkthfa1006wlq01zem6df4w	cmph5kmv300f7p401b8x8jouu	cmp4s8kui005fl40100a1ew4b	cmqdv6dd7002zwmxsa7zilu87	2026-05-21 00:00:00	\N	\N	REPLACED	2026-06-25 00:00:00	2026-07-14 15:39:38.521	2026-07-14 15:39:38.524
cmrkthfa2006ylq01vjoi1pdi	cmph5kmv300f7p401b8x8jouu	cmp4s8kui005fl40100a1ew4b	cmqt868p700hpo701pd06nfc8	2026-06-25 00:00:00	2026-06-22 00:00:00	2026-08-01 00:00:00	ACTIVE	\N	2026-07-14 15:39:38.523	2026-07-14 15:39:38.525
cmrktknwt0070lq01adeq8jd1	cmp9jyb2l009tp4012t706wff	cmp4s8kui005fl40100a1ew4b	cmqdv6dbg001lwmxsi0972s23	2026-05-16 00:00:00	\N	\N	REPLACED	2026-06-23 00:00:00	2026-07-14 15:42:09.677	2026-07-14 15:42:09.687
cmrktknwx0072lq01ue1un3i4	cmp9jyb2l009tp4012t706wff	cmp4s8kui005fl40100a1ew4b	cmqqgylbl000dp901dnscsomn	2026-06-23 00:00:00	\N	\N	REPLACED	2026-06-24 00:00:00	2026-07-14 15:42:09.68	2026-07-14 15:42:09.689
cmrktknwz0074lq01i33p60iv	cmp9jyb2l009tp4012t706wff	cmp4s8kui005fl40100a1ew4b	cmqs9u1cv00gfo7018vdlrjrd	2026-06-24 00:00:00	2026-06-28 00:00:00	2026-08-07 00:00:00	ACTIVE	\N	2026-07-14 15:42:09.684	2026-07-14 15:42:09.691
cmrlvcqu3007plq01jpm3szem	cmrlvcqtr007jlq01qeub85bp	cmp4s6te2005el4011ra2qxrl	cmrlvcqtz007nlq01qw79rx0k	2026-07-15 00:00:00	\N	\N	PENDING_START	\N	2026-07-15 09:19:45.627	2026-07-15 09:19:45.627
cmrdadhtw0022mn011nihpwxq	cmrdadhtm001wmn01ebkmguat	cmr0t6kdb000mmm01e58p4sux	cmrdadhtu0020mn01ainn6g7h	2026-07-09 00:00:00	2026-07-08 00:00:00	2026-09-08 00:00:00	ACTIVE	\N	2026-07-09 09:10:19.269	2026-07-15 13:28:11.732
cmrm49dpr00ctlq013j2uefbz	cmr91oeqe00dvmm012s7it3wq	cmp4s6te2005el4011ra2qxrl	cmrm49dpn00crlq0102gchh3q	2026-07-15 00:00:00	2026-07-08 00:00:00	2026-08-07 00:00:00	ACTIVE	\N	2026-07-15 13:29:05.199	2026-07-15 13:29:31.362
cmrlwjry3008jlq019cyrrquu	cmpi6ban400fip401ppm9o7wy	cmp4sixhw005ol401euqmhrwh	cmrlwjry0008hlq01vjw62u1q	2026-07-15 00:00:00	2026-07-09 00:00:00	2026-09-09 00:00:00	ACTIVE	\N	2026-07-15 09:53:13.275	2026-07-15 13:57:31.892
cmrrigne700malq01js49yqq4	cmqf2b40z000jwmtsglaha6m4	cmp4s8kui005fl40100a1ew4b	cmqf2b41a000nwmtsm3acqy88	2026-06-12 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	ACTIVE	\N	2026-07-19 08:05:29.84	2026-07-19 08:05:29.844
cmrtizeqg00o4lq01020j0kx6	cmps12dpz00hvp401tesxyqev	cmp4sbkj5005il4015b2x78mh	cmqdv6ddh0037wmxsh25xvgzz	2026-05-29 00:00:00	2026-06-01 00:00:00	2026-10-01 00:00:00	ACTIVE	\N	2026-07-20 17:55:37.432	2026-07-20 17:55:37.435
cmrtj3dut00o6lq01hj2nriw8	cmp9uagwy00bnp401aww8aab6	cmp4sbkj5005il4015b2x78mh	cmqdv6dcd002bwmxsd54p97xr	2026-05-16 00:00:00	\N	\N	PENDING_START	\N	2026-07-20 17:58:42.917	2026-07-20 17:58:42.917
cmrnrrjxj00lhlq01btlb6eiz	cmrnrrjxa00lblq014meynmha	cmp4s8kui005fl40100a1ew4b	cmrnrrjxh00lflq017a5dxyou	2026-07-16 00:00:00	2026-07-16 00:00:00	2026-08-25 00:00:00	ACTIVE	\N	2026-07-16 17:14:50.408	2026-07-21 07:49:38.299
cmruzkak1001bo901rtdd70mj	cmp80zids006np4015qmgm2k4	cmp4s8kui005fl40100a1ew4b	cmqdv6dbr001twmxsdq6nn2mc	2026-05-15 00:00:00	2026-05-22 00:00:00	2026-07-01 00:00:00	ACTIVE	\N	2026-07-21 18:27:31.825	2026-07-29 13:39:15.837
cmr66zk2d00b9mm01v3y8nqim	cmr66zk2400b3mm01nzav5tty	cmp4s8kui005fl40100a1ew4b	cmr66zk2b00b7mm01cethbcsr	2026-07-04 00:00:00	2026-07-17 00:00:00	2026-08-26 00:00:00	ACTIVE	\N	2026-07-04 10:01:06.902	2026-07-21 08:02:05.096
cmrm70e2q00kplq017rkkhnc8	cmpazudle00byp401oz4zx3e1	cmp4slcpz005ul401m1rpf0qa	cmqs9uw1a00gjo701rot8q5hg	2026-06-24 00:00:00	2026-06-25 00:00:00	2026-10-25 00:00:00	ACTIVE	\N	2026-07-15 14:46:04.611	2026-07-28 16:04:15.737
cmruesa5i00ynlq01zhmn84ii	cmpuxbc7900i9p401d4rkyuom	cmp4sejni005kl4013ure33mc	cmqdv6ddm003bwmxsmh4z1jgd	2026-05-31 00:00:00	2026-06-04 00:00:00	2027-06-04 00:00:00	ACTIVE	\N	2026-07-21 08:45:52.614	2026-07-21 08:45:52.617
cmrou71s800lllq01fc2mterj	cmp6ywfdb0055p401dvfsqap4	cmp4scs0q005jl401azkonj0y	cmqdv6dbj001nwmxs5neoxhgj	2026-05-14 00:00:00	2026-07-17 00:00:00	2026-12-17 00:00:00	ACTIVE	\N	2026-07-17 11:10:38.793	2026-07-21 08:57:24.771
cmrumszdw00zzlq0193y0y3pp	cmqnnz1kg00d8od0103g8czza	cmp4s9cxl005gl4018m1wy6wp	cmqnnz1kq00dcod01s93kwgtb	2026-06-21 00:00:00	2026-06-23 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-07-21 12:30:22.244	2026-07-21 12:30:22.247
cmrumydo60103lq01kgfqn061	cmp6tmko3004rp4010ev8s38b	cmp4s9cxl005gl4018m1wy6wp	cmqdv6dbc001hwmxsmsrrafm8	2026-05-14 00:00:00	2026-05-18 00:00:00	2026-07-18 00:00:00	ACTIVE	\N	2026-07-21 12:34:34.038	2026-07-21 12:34:34.04
cmrutsraj0003o901ogafhm37	cmp580zx2006el401ov0q9nd9	cmp4skb22005rl4014f0e7wgs	cmqdv6d8f0005wmxszwdd2qko	2026-05-13 00:00:00	2026-05-21 00:00:00	2026-08-21 00:00:00	ACTIVE	\N	2026-07-21 15:46:09.067	2026-07-21 15:46:09.07
cmruw334w000no90121rnnjyf	cmp6me3mt002yp401esc9ykn5	cmp4sadgq005hl4016z9eqilf	cmqdv6d9p000vwmxs48k34i54	2026-05-14 00:00:00	2026-06-30 00:00:00	2026-09-30 00:00:00	ACTIVE	\N	2026-07-21 16:50:10.209	2026-07-21 16:50:10.211
cmruxyw3o0019o901lx7xvfrk	cmp5d9vn5006zl401fo5j5q04	cmp4slcpz005ul401m1rpf0qa	cmqdv6d8l0009wmxs1xd01xog	2026-05-13 00:00:00	2026-05-23 00:00:00	2026-09-23 00:00:00	ACTIVE	\N	2026-07-21 17:42:53.701	2026-07-21 17:42:53.704
cmrum92su00zdlq01ij3x69cz	cmqur46xc00jno701ceuxfoxy	cmqur0gkm00jko7014ajnmg2a	cmrum92ss00zblq01riaeauur	2026-07-21 00:00:00	2026-07-21 00:00:00	2026-09-21 00:00:00	ACTIVE	\N	2026-07-21 12:14:53.55	2026-07-29 18:39:55.549
cmruzkak3001do901boynlh6e	cmp80zids006np4015qmgm2k4	cmp4s8kui005fl40100a1ew4b	cmqrzd35q0091o7018lgxgw3o	2026-06-24 00:00:00	2026-06-25 00:00:00	2026-08-04 00:00:00	ACTIVE	\N	2026-07-21 18:27:31.827	2026-07-21 18:27:31.83
cmrw75bnj0007n3012k5q8bud	cmq251ruu00l5p4010gsntqmg	cmp4s8kui005fl40100a1ew4b	cmqdv6dex0047wmxsgvq2c1lr	2026-06-05 00:00:00	2026-06-05 00:00:00	2026-07-15 00:00:00	ACTIVE	\N	2026-07-22 14:47:36.511	2026-07-22 14:47:36.513
cmrnml84m00l2lq0156hfl177	cmrnml84b00kwlq01sw6qm4zc	cmp4s9cxl005gl4018m1wy6wp	cmrnml84k00l0lq01anszfqf2	2026-07-16 00:00:00	2026-07-16 00:00:00	2026-09-16 00:00:00	ACTIVE	\N	2026-07-16 14:49:57.095	2026-07-23 14:57:24.027
cmrwe3sw8000sn301eyvw4e36	cmrwe3svz000mn3011way6tzi	cmp4s9cxl005gl4018m1wy6wp	cmrwe3sw6000qn301xgsp0cqz	2026-07-22 00:00:00	2026-07-21 00:00:00	2026-09-21 00:00:00	ACTIVE	\N	2026-07-22 18:02:22.857	2026-07-30 10:57:56.668
cmruxoqqg0015o901bi7ekxt8	cmruxoqq5000zo901ix6vukw5	cmr0t6kdb000mmm01e58p4sux	cmruxoqqd0013o901v3vtcjpu	2026-07-21 00:00:00	2026-07-15 00:00:00	2026-09-15 00:00:00	ACTIVE	\N	2026-07-21 17:35:00.184	2026-07-23 14:53:25.109
cmr0jm38t0005pn0127s76zla	cmp5i45nq000ap401mr5kujgq	cmp4sadgq005hl4016z9eqilf	cmqdv6d8y000hwmxs3hr2vd7l	2026-05-13 00:00:00	2026-05-19 00:00:00	2026-08-19 00:00:00	REPLACED	2026-07-23 11:51:02.544	2026-06-30 11:07:56.526	2026-07-23 11:51:02.544
cmrxhgxci0026n30137czgzve	cmqrwntpy0016sc0146g80wvq	cmp4s9cxl005gl4018m1wy6wp	cmrxhgxcg0024n301sj99ds5f	2026-07-23 00:00:00	2026-07-29 00:00:00	2026-09-29 00:00:00	ACTIVE	\N	2026-07-23 12:24:20.178	2026-07-29 11:49:34.374
cmrwf0kdp0012n301nw8vsz3x	cmqnjmmn900ceod01dz6unzwp	cmp4s9cxl005gl4018m1wy6wp	cmqnjmmnf00ciod0185a6hqx9	2026-06-21 00:00:00	2026-06-15 00:00:00	2026-08-15 00:00:00	REPLACED	\N	2026-07-22 18:27:51.469	2026-07-30 10:55:06.615
cmrxhf4hh0020n3017i6acfiq	cmqqipr55001fp9010qryqpgy	cmp4s8kui005fl40100a1ew4b	cmrxhf4hf001yn301ntbtqntq	2026-07-23 00:00:00	2026-07-28 00:00:00	2026-09-06 00:00:00	ACTIVE	\N	2026-07-23 12:22:56.118	2026-07-29 13:16:37.621
cmrxhbqrx001un3013xdcchvr	cmqqio1g50018p9018hz9fq36	cmp4s8kui005fl40100a1ew4b	cmrxhbqrv001sn301and4q1vf	2026-07-23 00:00:00	2026-07-28 00:00:00	2026-09-06 00:00:00	ACTIVE	\N	2026-07-23 12:20:18.382	2026-07-29 13:16:45.005
cmrxgj8lz001on301o88wk00e	cmqqija83000up901vbrlsocv	cmp4s8kui005fl40100a1ew4b	cmrxgj8lw001mn301y3uik9yc	2026-07-23 00:00:00	2026-07-28 00:00:00	2026-09-06 00:00:00	ACTIVE	\N	2026-07-23 11:58:08.471	2026-07-29 13:16:56.148
cmrwed60r0010n301wwdw1hqo	cmrwed60g000un301vg8ksj6i	cmp4s8kui005fl40100a1ew4b	cmrwed60o000yn301p131y200	2026-07-22 00:00:00	2026-07-22 00:00:00	2026-08-31 00:00:00	ACTIVE	\N	2026-07-22 18:09:39.772	2026-07-23 13:01:58.724
cmruxkrut000xo901559kfdf7	cmruxkruh000ro901qcd982u7	cmp4sixhw005ol401euqmhrwh	cmruxkruq000vo90118b5nrao	2026-07-21 00:00:00	2026-07-15 00:00:00	2026-09-15 00:00:00	ACTIVE	\N	2026-07-21 17:31:55.013	2026-07-23 14:53:57.365
cmrxnu3iu0066n3012jx959no	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmrxnu3is0064n301o4fihmio	2026-07-23 00:00:00	\N	\N	PENDING_START	\N	2026-07-23 15:22:32.406	2026-07-29 13:05:21.169
cms4ob1zi00l0n301o0uj539h	cms35x3i0009kn301kd28orpb	cmp4s9cxl005gl4018m1wy6wp	cms4ob1zg00kyn301ytfel5mg	2026-07-28 00:00:00	2026-07-27 00:00:00	2026-09-27 00:00:00	ACTIVE	\N	2026-07-28 13:10:06.799	2026-07-29 11:57:26.065
cms2z76y50092n3018nb5rnbb	cmqf2b3xg0001wmtsjmoqct8a	cmp4skb22005rl4014f0e7wgs	cmqf2b3y20005wmtsnnhyj4qm	2026-06-10 00:00:00	2026-06-10 00:00:00	2026-09-10 00:00:00	ACTIVE	\N	2026-07-27 08:39:30.03	2026-07-27 08:39:30.032
cmrxga3z4001cn301t9448r9m	cmp5i45nq000ap401mr5kujgq	cmp4s9cxl005gl4018m1wy6wp	cmrxga3z1001an301nax77rgi	2026-07-23 00:00:00	2026-07-23 00:00:00	2026-09-23 00:00:00	ACTIVE	\N	2026-07-23 11:51:02.56	2026-07-27 16:49:49.977
cms35a7wq009an3011vg4nc50	cmr91dvvk00ddmm01yvoi91dd	cmr0t6kdb000mmm01e58p4sux	cms35a7wo0098n3013svl7hao	2026-07-27 00:00:00	2026-07-30 00:00:00	2026-09-30 00:00:00	ACTIVE	\N	2026-07-27 11:29:48.939	2026-07-29 13:29:30.285
cms3kei3u00gsn301o52p4xbt	cms3kei3j00gmn301mhqotbc4	cmp4s8kui005fl40100a1ew4b	cms3kei3s00gqn30167fdod7s	2026-07-27 00:00:00	2026-07-26 00:00:00	2026-09-04 00:00:00	ACTIVE	\N	2026-07-27 18:33:03.019	2026-07-28 13:13:18.223
cms35lfl7009in301xo7fkgla	cms35lfky009cn301i7ou31cd	cmp4s6te2005el4011ra2qxrl	cms35lfl5009gn301fss9xjg9	2026-07-27 00:00:00	2026-07-24 00:00:00	2026-08-23 00:00:00	ACTIVE	\N	2026-07-27 11:38:32.108	2026-07-27 17:19:37.338
cmrxup8r3006kn301ryyixiud	cmrbunzzo000mmn01dkqpill6	cmp4slcpz005ul401m1rpf0qa	cmrxup8r1006in301kc0q8ccz	2026-07-23 00:00:00	2026-07-24 00:00:00	2026-11-24 00:00:00	ACTIVE	\N	2026-07-23 18:34:43.216	2026-07-27 17:26:12.726
cms365est00a6n301xtr9h7ke	cms365esm00a0n3016r7lmgxk	cmp4s6te2005el4011ra2qxrl	cms365ess00a4n301dr4hrzw9	2026-07-27 00:00:00	2026-07-26 00:00:00	2026-08-25 00:00:00	ACTIVE	\N	2026-07-27 11:54:04.206	2026-07-27 17:41:14.921
cmrf1usfn00lqmn01oxya3yw9	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	cmrf1usfk00lomn01ow3dkoed	2026-07-10 00:00:00	2026-07-12 00:00:00	2026-08-11 00:00:00	REPLACED	2026-07-27 18:56:49.171	2026-07-10 14:47:21.971	2026-07-27 18:56:49.172
cms4mx5xl00isn301vxhibe0y	cmqp4ky050002lk01gx0v2tv9	cmp4s8kui005fl40100a1ew4b	cms4mx5xj00iqn301rrjh43ch	2026-07-28 00:00:00	2026-07-26 00:00:00	2026-09-04 00:00:00	ACTIVE	\N	2026-07-28 12:31:19.114	2026-07-30 12:26:38.714
cmrxnq13u005wn30125y93tew	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cmrxnq13r005un301urkt5h41	2026-07-23 00:00:00	\N	\N	PENDING_START	\N	2026-07-23 15:19:22.65	2026-07-29 13:05:21.166
cms4v82li000tml01u1hlzh5u	cms4v82l8000nml0184j2mtyd	cmp4s6te2005el4011ra2qxrl	cms4v82lg000rml01zjotgit8	2026-07-28 00:00:00	2026-07-28 00:00:00	2026-08-27 00:00:00	ACTIVE	\N	2026-07-28 16:23:44.934	2026-07-29 13:13:26.711
cms3kn6uy00h8n3011rgikner	cms3kn6uo00h2n301qm5snmp2	cmp4s6te2005el4011ra2qxrl	cms3kn6uw00h6n301iib7pl0a	2026-07-27 00:00:00	2026-07-27 00:00:00	2026-08-26 00:00:00	ACTIVE	\N	2026-07-27 18:39:48.346	2026-07-28 12:49:32.697
cms3kr38g00hgn3013wi2b9w6	cms3kr38500han30115yyomyb	cmp4s6te2005el4011ra2qxrl	cms3kr38c00hen301au0vbci1	2026-07-27 00:00:00	2026-07-27 00:00:00	2026-08-26 00:00:00	ACTIVE	\N	2026-07-27 18:42:50.272	2026-07-28 12:49:48.983
cms4ok3tw00lin301tanjen3x	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	cms4ok3tt00lgn301ee01tx8q	2026-07-28 00:00:00	\N	\N	PENDING_START	\N	2026-07-28 13:17:09.092	2026-07-28 13:17:09.092
cms362k9t009yn301b5btkjs0	cms362k9k009sn3012zp10a99	cmp4s6te2005el4011ra2qxrl	cms362k9r009wn301rnav8pbw	2026-07-27 00:00:00	2026-07-24 00:00:00	2026-08-23 00:00:00	REPLACED	2026-07-28 13:58:58.376	2026-07-27 11:51:51.33	2026-07-28 13:58:58.376
cms4q1w0m00lpn3013f40lp5h	cms362k9k009sn3012zp10a99	cmp4s6te2005el4011ra2qxrl	cms4q1w0k00lnn301kbwafsbv	2026-07-28 00:00:00	2026-07-26 00:00:00	2026-08-25 00:00:00	ACTIVE	\N	2026-07-28 13:58:58.391	2026-07-28 14:01:31.884
cms4q3b6s00lvn301ikl8wqgx	cmrri21yv00m2lq01gugwiiyq	cmp4s6te2005el4011ra2qxrl	cms4q3b6q00ltn301cfsyqmgx	2026-07-28 00:00:00	2026-07-26 00:00:00	2026-08-25 00:00:00	ACTIVE	\N	2026-07-28 14:00:04.708	2026-07-28 14:01:45.948
cms60na2e0013k101xd22dn9o	cmqp3jmsv00euod010vtuk1qt	cmp4s6te2005el4011ra2qxrl	cmqp3jmt100eyod0197bui4ht	2026-06-22 00:00:00	2026-06-06 00:00:00	2026-07-06 00:00:00	REPLACED	\N	2026-07-29 11:43:18.711	2026-07-30 10:57:25.092
cms35x3ib009qn3018pawjncs	cms35x3i0009kn301kd28orpb	cmp4s6te2005el4011ra2qxrl	cms35x3i8009on301bdthda5z	2026-07-27 00:00:00	2026-07-24 00:00:00	2026-08-23 00:00:00	REPLACED	\N	2026-07-27 11:47:36.323	2026-07-29 11:57:26.061
cms4lqms200ikn301w5araglk	cmqnlllpk00csod01wkefk1ot	cmp4s8kui005fl40100a1ew4b	cmqnlllps00cwod0192pyfxog	2026-06-21 00:00:00	2026-06-19 00:00:00	2026-07-29 00:00:00	REPLACED	\N	2026-07-28 11:58:14.739	2026-07-29 18:23:59.811
cms60d2ep000zk101ml0chp0r	cmqnlllpk00csod01wkefk1ot	cmp4s6te2005el4011ra2qxrl	cms60d2em000xk101ogtyafxm	2026-07-29 00:00:00	2026-06-19 00:00:00	2026-07-19 00:00:00	REPLACED	\N	2026-07-29 11:35:22.225	2026-07-29 18:23:59.816
cms6byvwu000rmo01mznjn53c	cmqnjvfwv00clod01smhvf5v7	cmp4s9cxl005gl4018m1wy6wp	cms6byvws000pmo01d0dzojmz	2026-07-29 00:00:00	2026-07-29 00:00:00	2026-09-29 00:00:00	ACTIVE	\N	2026-07-29 17:00:16.014	2026-07-30 10:51:32.106
cmrxgghze001in301irvvrl0c	cmqnjmmn900ceod01dz6unzwp	cmp4s9cxl005gl4018m1wy6wp	cmrxgghzc001gn3018a7qlb13	2026-07-23 00:00:00	2026-07-29 00:00:00	2026-09-29 00:00:00	ACTIVE	\N	2026-07-23 11:56:00.65	2026-07-29 11:47:47.088
cmrxhnzkr002cn301mbk1tz9z	cmqrwntpy0016sc0146g80wvq	cmp4s9cxl005gl4018m1wy6wp	cmrxhnzkp002an30128vbn7ww	2026-07-23 00:00:00	2026-07-29 00:00:00	2026-09-29 00:00:00	ACTIVE	\N	2026-07-23 12:29:49.659	2026-07-29 11:49:34.384
cms61cc3k001pk101ekvjilim	cmp5qutpd0015p401e0b83fu9	cmp4sadgq005hl4016z9eqilf	cmqdv6d97000nwmxserzyl4sw	2026-05-13 00:00:00	2026-05-29 00:00:00	2026-08-29 00:00:00	ACTIVE	\N	2026-07-29 12:02:47.745	2026-07-29 12:02:47.749
cms61cwyp001tk101sr5qa21v	cmp5qzr8e001ap401fa4uuzw4	cmp4sadgq005hl4016z9eqilf	cmqdv6d9a000pwmxsg50az1de	2026-05-13 00:00:00	2026-05-29 00:00:00	2026-08-29 00:00:00	ACTIVE	\N	2026-07-29 12:03:14.785	2026-07-29 12:03:14.788
cms6bk9zd000lmo01anuu2lyk	cms3kuoyo00hin301dzucqsrq	cmp4t00w6005xl401jv0qklyp	cms6bk9za000jmo01tdep2ncd	2026-07-29 00:00:00	2026-07-30 00:00:00	2026-08-14 00:00:00	ACTIVE	\N	2026-07-29 16:48:54.409	2026-07-29 16:49:48.08
cms4vgzya0011ml01ur0fpos0	cms4vgzxz000vml01z4j4yu76	cmp4s6te2005el4011ra2qxrl	cms4vgzy8000zml0126ugsl3x	2026-07-28 00:00:00	2026-07-29 00:00:00	2026-08-28 00:00:00	ACTIVE	\N	2026-07-28 16:30:41.411	2026-07-30 11:52:37.043
cms3kuoyu00hon301useks8ty	cms3kuoyo00hin301dzucqsrq	cmp4s6te2005el4011ra2qxrl	cms3kuoys00hmn3015ojwtpno	2026-07-27 00:00:00	2026-07-28 00:00:00	2026-08-27 00:00:00	REPLACED	2026-07-29 16:48:54.392	2026-07-27 18:45:38.407	2026-07-29 16:48:54.393
cms3l92jl00hwn301p20rn9g9	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	cms3l92ji00hun301kama6dmz	2026-07-27 00:00:00	2026-07-28 00:00:00	2026-08-27 00:00:00	REPLACED	2026-07-30 13:10:37.965	2026-07-27 18:56:49.186	2026-07-30 13:10:37.966
cms60na2h0015k101fksoxro8	cmqp3jmsv00euod010vtuk1qt	cmp4s6te2005el4011ra2qxrl	cmqtaky3n00hto701ndlr5xw9	2026-06-25 00:00:00	2026-07-29 00:00:00	2026-08-28 00:00:00	ACTIVE	\N	2026-07-29 11:43:18.713	2026-07-30 10:57:25.076
cms6eddxn001fmo01mfax4pc0	cmqp3jmsv00euod010vtuk1qt	cmp4s6te2005el4011ra2qxrl	cms6eddxk001dmo01l5oqba3x	2026-07-29 00:00:00	2026-07-29 00:00:00	2026-08-28 00:00:00	ACTIVE	\N	2026-07-29 18:07:31.787	2026-07-30 10:57:25.08
cmrdaoxi8003tmn01dw72r4s5	cmqw8ilsb001emg0158v8etes	cmp4s6te2005el4011ra2qxrl	cmqw8ilsl001img01s7zqwcji	2026-06-27 00:00:00	2026-06-24 00:00:00	2026-07-24 00:00:00	ACTIVE	\N	2026-07-09 09:19:12.8	2026-07-30 11:43:55.543
cmr1urpcr006jmm0189onqm08	cmp6n9pyb0047p401exgskztu	cmp4t00w6005xl401jv0qklyp	cmqqjh6kn001up9014wm3o1nc	2026-06-23 00:00:00	2026-05-18 00:00:00	2026-06-02 00:00:00	ACTIVE	\N	2026-07-01 09:08:00.411	2026-07-30 13:04:46.795
cms6ecfsb001bmo01yhpxet0o	cmqw8ec6p0010mg01ce7hdn33	cmp4sadgq005hl4016z9eqilf	cms6ecfs90019mo01wv9t96ur	2026-07-29 00:00:00	\N	\N	PENDING_START	\N	2026-07-29 18:06:47.532	2026-07-29 18:06:47.532
cms4l8mue00icn301id40oqub	cmp6n9pyb0047p401exgskztu	cmp4s9cxl005gl4018m1wy6wp	cms4l8muc00ian3016stzufv8	2026-07-28 00:00:00	2026-05-18 00:00:00	2026-07-18 00:00:00	ACTIVE	\N	2026-07-28 11:44:15.015	2026-07-30 13:04:46.798
cms4l9kx400iin3011ngcdtp7	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	cms4l9kx200ign30199w5f5pg	2026-07-28 00:00:00	2026-07-28 00:00:00	2026-08-27 00:00:00	REPLACED	2026-07-30 13:10:37.965	2026-07-28 11:44:59.176	2026-07-30 13:10:37.966
cms7j7fdu004nmo01pc0fjakw	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	cms7j7fds004lmo01382i8rhe	2026-07-30 00:00:00	\N	\N	PENDING_START	\N	2026-07-30 13:10:37.987	2026-07-30 13:10:37.987
cms6dh31r000xmo01sq6jctwq	cmqnlllpk00csod01wkefk1ot	cmp4s6te2005el4011ra2qxrl	cms6dh31p000vmo01rjnfos2m	2026-07-29 00:00:00	2026-07-29 00:00:00	2026-08-28 00:00:00	ACTIVE	\N	2026-07-29 17:42:24.687	2026-07-29 18:23:59.789
\.


--
-- Data for Name: member_pending_packs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_pending_packs (id, "memberId", "packId", "position", "createdAt") FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, "userId", "firstName", "lastName", phone, "birthDate", "packId", "packStartedAt", "personalDiscountType", "personalDiscountValue", "personalDiscountReason", "enrollmentStatus", "expectedPackAmountDinars", "isActive", "createdAt", "updatedAt", note) FROM stdin;
cmp5cjt07006sl401hpc0r3sj	cmp5cjt05006ql401yinisshy	Radhia	Dridi	26676655	1972-01-15 23:00:00	cmp4s8kui005fl40100a1ew4b	\N	\N	\N	\N	ACTIVE	\N	f	2026-05-14 08:29:38.839	2026-06-14 13:19:56.494	\N
cmp5nv1lh000mp4013w3oizro	cmp5nv1lf000kp401s8d56d1b	Amal	Mejri	24474189	1995-06-09 22:00:00	cmp4t4k5c005yl401cme1vz52	\N	\N	\N	\N	ACTIVE	\N	f	2026-05-14 13:46:18.965	2026-06-14 13:19:56.597	\N
cmp76c7ig005vp401qbizrga9	cmp76c7ie005tp401y4r5qxth	Myriam	Hamzaoui	29837960	1992-02-02 23:00:00	cmp4sixhw005ol401euqmhrwh	\N	\N	\N	\N	ACTIVE	\N	f	2026-05-15 15:11:19.049	2026-06-14 13:19:56.927	\N
cmp9uagwy00bnp401aww8aab6	cmp9uagwx00blp401euphsr30	Fatma	Mgazzen	99367794	1992-07-09 22:00:00	cmp4sbkj5005il4015b2x78mh	\N	\N	\N	\N	ACTIVE	\N	f	2026-05-17 11:57:21.059	2026-06-14 13:19:57.094	\N
cmpcdicon00d0p401ddbj8mmg	cmpcdicol00cyp401nm8u0x8b	Marwa	Said	53038551	1989-01-15 23:00:00	cmp4scs0q005jl401azkonj0y	\N	\N	\N	\N	ACTIVE	\N	f	2026-05-19 06:30:53.879	2026-06-14 13:19:57.184	\N
cmp6mh9mn0033p401xa6v43p7	cmp6mh9ml0031p401jrc5hmop	Nada	Daghmouri	50141033	1993-06-04 22:00:00	cmp4sejni005kl4013ure33mc	2026-05-18 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 05:55:22.751	2026-06-20 16:12:21.326	\N
cmp5dd5sd0074l401pv3drst8	cmp5dd5sb0072l401r9zwq188	Intissar	Bouassida	98216649	1966-09-05 23:00:00	cmp4sixhw005ol401euqmhrwh	2026-06-25 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 08:52:28.429	2026-07-30 11:21:41.058	\N
cmqf2b3z80007wmtsodeuow25	\N	Fatma	Zouaidi	28126231	\N	cmp4t5amk005zl4014v76r8bk	2026-06-14 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-11 10:00:00	2026-07-30 11:24:21.275	\N
cmp6me3mt002yp401esc9ykn5	cmp6me3ms002wp401gdm4qqfc	Dorsaf	Aissaoui	22385075	1994-02-23 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-06-30 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 05:52:55.013	2026-07-09 11:48:53.077	\N
cmp80zids006np4015qmgm2k4	cmp80zidq006lp401iat2y4ek	Yasmine	Jouini	20733174	1995-08-25 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-25 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-16 05:29:14.704	2026-07-30 11:37:01.496	\N
cmp6ndov4004cp4011gucmmzn	cmp6ndov2004ap401wb0f98g7	KENZA	Kenza	54556321	2003-07-19 22:00:00	cmp4t4k5c005yl401cme1vz52	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 06:20:35.489	2026-06-20 16:19:37.504	\N
cmp5r6eqa001kp401z95m2mtr	cmp5r6eq8001ip40131e05rq2	Sara	Gannoune	29847786	2001-11-04 23:00:00	cmp4t4k5c005yl401cme1vz52	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 15:19:08.05	2026-06-20 16:19:48.175	\N
cmp5lkgat000fp4013f720b0o	cmp5lkgas000dp401gp6bp1nx	Yousra	Aouaifia	52165507	1976-03-01 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 12:42:05.574	2026-06-20 16:21:11.69	\N
cmp5r29es001fp401vky62ly4	cmp5r29er001dp401lbpf1cy9	Nada	Ben Mabrouk	26322771	1996-10-08 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 15:15:54.532	2026-06-20 16:21:50.033	\N
cmp6n0r9g003sp401svwhqzjy	cmp6n0r9d003qp401d5d0y8l4	Cherryne	Ben Youssef	58545919	1985-10-28 23:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-05-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 06:10:32.068	2026-06-23 11:38:02.392	\N
cmp6ywfdb0055p401dvfsqap4	cmp6ywfd90053p401rddw3c3f	Salma	El Ayech	24103455	1984-05-29 22:00:00	cmp4scs0q005jl401azkonj0y	2026-07-17 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 11:43:05.423	2026-07-30 11:30:25.368	\N
cmp6n445r003xp4019r22o12e	cmp6n445o003vp401iy0klavg	Asma	Cherni	29799477	1994-01-11 23:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-05-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 06:13:08.751	2026-06-23 11:38:37.087	\N
cmp580zx2006el401ov0q9nd9	cmp580zx0006cl40175bb94e1	Atidel	Jridi	28667110	1987-07-09 22:00:00	cmp4skb22005rl4014f0e7wgs	2026-05-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 06:23:02.871	2026-06-23 11:39:19.426	\N
cmp6n6c330042p401572wyy97	cmp6n6c320040p401wxpha3aw	Imen	Lachheb	20291386	1991-12-04 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-05-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 06:14:52.336	2026-06-23 11:39:59.969	\N
cmp9pbn9j00b7p401wd3w8sn0	cmp9pbn9i00b5p401hszoe9y3	Anissa	Ben Aziza	21591370	1992-08-15 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-25 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 09:38:17.864	2026-07-30 13:15:11.556	\N
cmp5qutpd0015p401e0b83fu9	cmp5qutpa0013p401ab1e3jq6	Ons	Ben Amor	93922376	1999-03-02 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-05-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 15:10:07.585	2026-07-30 10:58:20.653	\N
cmp9l6t2c00acp4018v82zolp	cmp9l6t2a00aap401y7mie04j	Chayma	Ryabi	28694458	1993-01-24 23:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-05-22 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 07:42:33.636	2026-06-23 11:43:57.048	\N
cmp5doqck0079l4013c3pypy1	cmp5doqci0077l4018392lf4p	Sarah	Laouini	58892003	2000-12-15 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-05-22 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 09:01:28.292	2026-06-23 11:45:05.307	\N
cmp6mxgtj003np401n6d3md2o	cmp6mxgti003lp401l2wssly5	Yosr	Mejri	97728795	1984-08-06 22:00:00	cmp4skb22005rl4014f0e7wgs	2026-05-23 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 06:07:58.567	2026-07-30 10:54:12.325	\N
cmp9oxt9w00avp401sfiouy8l	cmp9oxt9t00atp4015tbn38vi	Soumaya	Grami	55162716	1989-07-22 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-05-23 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 09:27:32.468	2026-06-23 11:46:33.227	\N
cmp5d9vn5006zl401fo5j5q04	cmp5d9vn3006xl401ftwcehmg	Wided	Jazi	26486466	1986-10-03 23:00:00	cmp4slcpz005ul401m1rpf0qa	2026-05-23 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 08:49:55.314	2026-07-30 11:33:25.22	\N
cmp9jyb2l009tp4012t706wff	cmp9jyb2j009rp401ibj6rggk	Maryem	Oueslaty	22710792	1986-06-12 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-28 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 07:07:57.454	2026-07-01 08:59:23.876	\N
cmp9u530f00bip401o3641wtg	cmp9u530d00bgp401ddqnere4	Mouna	werghemi	54624796	1997-07-23 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-05-25 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 11:53:09.759	2026-06-23 11:51:55.449	\N
cmpazudle00byp401oz4zx3e1	cmpazudlc00bwp4012b3nnemi	Amel	Saidi	58532651	1984-06-21 22:00:00	cmp4slcpz005ul401m1rpf0qa	2026-06-25 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-18 07:20:34.13	2026-07-30 11:31:14.522	\N
cmp88f7g90073p401w4uw4pqs	cmp88f7g60071p401mcl0m6dh	Latifa	Dhifi	94467956	1971-01-23 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-23 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-16 08:57:24.345	2026-07-09 11:21:48.05	\N
cmp6vndph004yp401vluusox7	cmp6vndpf004wp401rn3o2ggy	Arij	Mechri	20293224	2003-03-03 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 10:12:04.517	2026-06-23 14:22:02.445	\N
cmp6maci6002tp40119cnxlu3	cmp6maci4002rp4013sll2plf	Raoudha	Fathallah	98943445	1961-06-30 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-06-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 05:49:59.887	2026-06-23 14:22:10.419	\N
cmp9muoo600alp401b1jj91hv	cmp9muoo400ajp4015rgmk7n8	Islem	Ounissi	22627375	1982-02-22 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-03 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 08:29:07.302	2026-06-23 14:26:14.226	\N
cmp9n16yg00aqp401yfgd8zit	cmp9n16yf00aop40107k8vbbn	Alaa	Boulares	22627375	2010-03-26 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-03 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 08:34:10.936	2026-06-23 14:26:22.441	\N
cmp6mqu0z003dp401zgzrluwq	cmp6mqu0y003bp401m8abqjit	Khansa	Yazidi	52428501	1992-10-24 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-06 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 06:02:49.091	2026-06-23 14:35:38.717	\N
cmp6mkxvt0038p401gsyxjp1p	cmp6mkxvr0036p401m9m0r0fi	Ayda	Boudali Yazidi	27976632	1962-03-08 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-06 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 05:58:14.153	2026-06-23 14:35:48.597	\N
cmp87ym20006yp401590xadl0	cmp87ym1y006wp401gp258iqb	Chaima	Mahjoub	99469550	2007-01-09 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-06-11 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-16 08:44:30.12	2026-07-30 11:35:37.265	\N
cmp6n9pyb0047p401exgskztu	cmp6n9pya0045p401lai2ein7	Molka	Kehia	0033651660775	1993-08-04 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-05-18 00:00:00	\N	\N	\N	ACTIVE	\N	f	2026-05-15 06:17:30.276	2026-07-30 13:04:46.802	\N
cmp8b0p5m0078p401ko5fipst	cmp8b0p5k0076p40139qdxt36	Lamia	Ben nacef	99352574	1965-05-30 23:00:00	cmp4sixhw005ol401euqmhrwh	2026-05-22 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-16 10:10:06.298	2026-07-30 13:39:15.827	\N
cmp6mujhf003ip4019yxl5iri	cmp6mujhd003gp4018p4jm1lt	Mariem	Gassem	52326773	1992-04-01 22:00:00	cmp4scs0q005jl401azkonj0y	2026-07-09 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 06:05:42.051	2026-07-29 13:48:26.201	\N
cmpcfa7e300d9p401ktuwubni	cmpcfa7e200d7p401ky24jgjo	Mariem	Khemakhem	29109932	1987-04-08 22:00:00	cmp4sixhw005ol401euqmhrwh	\N	\N	\N	\N	ACTIVE	\N	f	2026-05-19 07:20:33.004	2026-06-14 13:19:57.2	\N
cmpux8mfw00i4p401v4t85sji	cmpux8mfu00i2p401993stlih	Bchira	Zaidi	53134227	1956-03-15 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-05-18 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 06:03:03.452	2026-06-20 16:09:49.308	\N
cmpb23ldo00c7p401ut25a8kv	cmpb23ldn00c5p401s9u4deej	Sarra	Mnaffedh	28605608	1986-12-31 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-05-18 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-18 08:23:43.357	2026-06-20 16:10:07.553	\N
cmp5e2po6007el401m0wr4bxe	cmp5e2po3007cl4010qyu6nhy	Neila	Azzabi	57170683	1954-04-10 23:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-05-18 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 09:12:20.598	2026-06-20 16:10:23.907	\N
cmpbet54q00cpp4015io1o59b	cmpbet54n00cnp401vb4afbh2	Syrine	saidani	52900840	1994-07-19 22:00:00	cmp4sixhw005ol401euqmhrwh	2026-05-18 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-18 14:19:30.746	2026-06-20 16:17:15.969	\N
cmqf2b42m000vwmtsnd6eu11l	\N	Chaima	Arfaoui	96616545	1989-04-19 00:00:00	cmp4sadgq005hl4016z9eqilf	2026-07-03 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-14 10:00:00	2026-07-29 13:18:46.578	\N
cmpuxgfvo00iep401kuin241v	cmpuxgfvm00icp4019ps3s4gj	Olfa	Habibi	99572276	1990-02-18 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-08 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 06:09:08.196	2026-07-30 10:58:02.229	\N
cmqf2b405000dwmtsddcf7agj	\N	Nouha	Neffeti	93930579	1997-07-12 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-12 10:00:00	2026-06-24 12:30:46.185	\N
cmqnjmmn900ceod01dz6unzwp	cmqnjmmn700ccod01sy50dle9	Fatma	Zrelli	22840490	2012-11-05 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-29 00:00:00	PERCENT	10	personnelle	ACTIVE	\N	t	2026-06-21 08:47:21.381	2026-07-30 10:55:06.619	\N
cmqf2b40z000jwmtsglaha6m4	\N	Yasmine	Rjeb	95857505	1997-04-06 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-12 10:00:00	2026-06-24 12:30:52.515	\N
cmqf2b43f0011wmts29fvfire	\N	Farah	Arres	22713638	1997-10-14 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-14 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-14 10:00:00	2026-06-23 15:48:27.089	\N
cmpi6ban400fip401ppm9o7wy	cmpi6ban100fgp401n2uywhix	Mariem	Bouslama	28650259	1997-02-01 23:00:00	cmp4sixhw005ol401euqmhrwh	2026-07-09 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-23 07:56:04.384	2026-07-15 13:57:31.89	\N
cmqnlllpk00csod01wkefk1ot	cmqnlllpi00cqod01m5nvfbwh	Wissal	Bouassida	25613595	1999-11-19 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-21 09:42:32.744	2026-07-29 18:23:59.822	\N
cmpfpx1dd00ekp4015zb7hrup	cmpfpx1db00eip4013hnojefx	Malika	Dhifallah	21716980	1981-01-29 23:00:00	cmp4sbkj5005il4015b2x78mh	2026-05-22 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-21 14:41:32.977	2026-07-29 13:18:18.647	\N
cmpb26l0900ccp4014tau0gjw	cmpb26l0800cap401w9jcvtwf	Soumaya	Mokni	50652152	1987-01-06 23:00:00	cmp4sixhw005ol401euqmhrwh	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-18 08:26:02.842	2026-07-30 11:34:15.161	\N
cmpfdk63200ebp401atbgmxt9	cmpfdk63000e9p401je5uh5pf	Islem	Ben othmen	92865063	1988-04-17 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-05-25 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-21 08:55:37.166	2026-06-23 11:49:56.909	\N
cmpdskdbb00e0p401bi55y2g7	cmpdskdb900dyp401c0o1z5h7	Fayrouz	Ktari	56834755	1993-09-05 22:00:00	cmp4skb22005rl4014f0e7wgs	2026-05-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-20 06:20:08.423	2026-06-23 13:24:28.253	\N
cmpuxpn4l00iop40156zk6rje	cmpuxpn4j00imp40189fygsiv	Balsem	Melki	56906575	1997-07-14 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-01 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 06:16:17.493	2026-06-23 14:14:17.156	\N
cmps12dpz00hvp401tesxyqev	cmps12dpx00htp401ia7ozgna	Salwa	Dellai	24562803	1988-04-08 22:00:00	cmp4sbkj5005il4015b2x78mh	2026-06-01 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-30 05:26:52.152	2026-07-30 10:54:47.994	\N
cmpvehn3c00j7p401p14lsb1d	cmpvehn3a00j5p401uht3iji1	Neila	Mzoughi	94121700	\N	cmp4s9cxl005gl4018m1wy6wp	2026-06-01 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 14:05:57.672	2026-06-23 14:14:48.928	\N
cmpxt9h9d00jnp401acy1ppf1	cmpxt9h9c00jlp401uffhtnzu	myriam	Fayach	00330607180456	2006-05-13 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-03 06:35:03.458	2026-06-23 14:20:13.309	\N
cmqnnz1kg00d8od0103g8czza	cmqnnz1kd00d6od017j56e9of	Lamia	Besbes	98432090	1970-12-18 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-06-23 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-21 10:48:59.056	2026-07-29 13:13:46.386	\N
cmpxtbvan00jsp401dbkqvo9n	cmpxtbvam00jqp401dvpzjs0p	Afef	Garfa	98322293	1987-12-15 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-03 06:36:54.959	2026-06-23 14:20:28.032	\N
cmpxtfc9z00k2p401mfev8i51	cmpxtfc9x00k0p401f0dp40ed	Imen	Melliti	20744039	1985-06-12 22:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-06-26 00:00:00	PERCENT	15	personnelle	ACTIVE	\N	t	2026-06-03 06:39:36.935	2026-07-14 15:28:05.134	\N
cmpxths4t00k7p401ms2nx4f0	cmpxths4s00k5p4016s9mk2l5	Salma	Ben Hamda	20744039	1989-12-03 23:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-06-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-03 06:41:30.798	2026-06-23 14:21:44.131	\N
cmpv004tl00iyp4017n7rkxr5	cmpv004tj00iwp401a7z3yawg	EYA	Saadaoui	24316902	2012-06-17 22:00:00	cmp4sadgq005hl4016z9eqilf	2026-06-03 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 07:20:26.217	2026-06-23 14:24:39.847	\N
cmpqvd4pp00hkp401fok0cwt8	cmpqvd4po00hip4011mkxbv8b	Marwa	Hmaidi	98761832	1989-12-19 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-06-03 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-29 09:59:29.821	2026-06-23 14:27:27.848	\N
cmpzp6len00kwp4012mdrq8ka	cmpzp6lel00kup401is12fvrg	Nadia	Mezzi	55288687	1988-10-08 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-04 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-04 14:16:22.751	2026-06-23 14:29:02.997	\N
cmpuxyh5x00itp401pqas19s7	cmpuxyh5v00irp401zuf4apy7	Najiba	Boulajfene	21690463	1973-03-16 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-06-04 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 06:23:09.669	2026-06-23 14:30:54.095	\N
cmpwo5qcf00jgp401y23i6i2r	cmpwo5qcd00jep4014eplovcx	Jihen	Beldi	97676009	1984-03-20 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-06-04 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-02 11:24:24.351	2026-06-23 14:31:29.694	\N
cmpuxbc7900i9p401d4rkyuom	cmpuxbc7800i7p401z5zf232x	Asma	Laamari	93619383	1983-10-29 23:00:00	cmp4sejni005kl4013ure33mc	2026-06-04 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 06:05:10.149	2026-07-29 13:17:58.627	\N
cmpzh61qy00kpp401u52chqfx	cmpzh61qx00knp4019i8v2fv6	Rakia	Ben Taieb	98164507	1987-01-10 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-07 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-04 10:32:00.347	2026-06-23 14:38:05.339	\N
cmq254vcp00lap401whu604y8	cmq254vco00l8p401ji9ij0t9	Ghofrane	Mahfoudhi	48064965	2003-06-16 00:00:00	cmp4sixhw005ol401euqmhrwh	2026-06-07 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-06 07:18:28.538	2026-06-23 14:38:53.542	\N
cmq251ruu00l5p4010gsntqmg	cmq251rus00l3p401y969vm1x	Emna	Ouerfelli	20819989	1985-08-17 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-05 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-06 07:16:04.038	2026-06-23 14:41:02.85	\N
cmqf2b3xg0001wmtsjmoqct8a	\N	Hend	Khadraoui	99357206	1973-11-21 00:00:00	cmp4skb22005rl4014f0e7wgs	2026-06-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-10 10:00:00	2026-07-29 13:11:02.947	\N
cmqf2b41m000pwmtsgzlybd2p	\N	Fatma	Ben Hassen	29098006	1993-10-07 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-13 10:00:00	2026-06-24 12:30:38.864	\N
cmph5kmv300f7p401b8x8jouu	cmph5kmv100f5p401inglcu4l	Sana	Zaiane	29740757	\N	cmp4s8kui005fl40100a1ew4b	2026-06-22 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-22 14:47:34.335	2026-07-01 09:31:06.967	\N
cmqnjhe4500c7od01xunmmhyz	cmqnjhe4300c5od01notfcgfh	Syrine	Hmida	58129113	2006-07-07 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-16 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-21 08:43:17.045	2026-07-30 11:41:22.261	\N
cmqnlovfk00czod0169336zw1	cmqnlovfj00cxod011y0ecdft	Hanen Dorra	Bouchaira	29346167	1994-06-24 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-30 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-21 09:45:05.313	2026-07-09 11:48:43.647	\N
cmpya6nur00kgp401et6xel9m	cmpya6nuq00kep401g1ln6nmz	Hayathem	Bouchagra	56832101	1977-04-14 22:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-09 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-03 14:28:45.508	2026-07-30 11:32:22.775	\N
cmp6tmko3004rp4010ev8s38b	cmp6tmko1004pp401sqixcbc5	Ones	Mzoughi	51455240	1978-07-18 22:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-05-18 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 09:15:27.651	2026-07-30 13:44:17.024	\N
cmqp1dmlo00e7od01uqu7xeqx	cmqp1dmlm00e5od011cautbd2	Eya	Rebai	53040510	1999-12-12 00:00:00	cmp4s6te2005el4011ra2qxrl	\N	\N	\N	\N	ACTIVE	\N	f	2026-06-22 09:52:00.685	2026-06-22 09:52:00.685	\N
cmqp0fvcq00e0od01115zmkft	cmqp0fvco00dyod01a72g05r7	Ghada	Chaabane	25749763	1999-11-08 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 09:25:45.722	2026-06-23 11:35:04.554	\N
cmqpbic6z0010lk01lg3znp3o	cmqpbic6x000ylk018sgob32h	Assya	Rejaibi	28536516	2001-06-07 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 14:35:36.635	2026-06-23 11:35:17.826	\N
cmqpbg2wz000tlk01pnlcrmdj	cmqpbg2wu000rlk01g9oop8lr	Sarra	Sarra	90212333	2001-01-12 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-05-19 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 14:33:51.298	2026-06-23 11:35:35.59	\N
cmp71pbmj005ip401rxsl0n27	cmp71pbmh005gp401j2677wm1	Ines	Dhahbi	52305456	1993-10-03 23:00:00	cmp4sadgq005hl4016z9eqilf	2026-05-20 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-15 13:01:32.827	2026-06-23 11:37:01.454	\N
cmqp3lgcp00f1od0111da04jy	cmqp3lgcn00ezod01l937x3qh	Arij	Ben Hamadi	22601376	1997-06-27 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-05-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 10:54:05.066	2026-06-23 13:26:16.277	\N
cmqp1r6nz00eeod015izfwb4m	cmqp1r6ny00ecod01b9u7qur4	Eya	aouissi	20000000	1999-12-12 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-03 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 10:02:33.216	2026-06-23 14:25:26.004	\N
cmqp2at3e00elod01ib880iqc	cmqp2at3b00ejod01o1jbpkve	Imen	Aouini	56172520	1996-06-06 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-06 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 10:17:48.746	2026-06-23 14:35:24.736	\N
cmp5qzr8e001ap401fa4uuzw4	cmp5qzr8d0018p401zxty1340	Insaf	Ben Amor	93922376	2002-08-18 22:00:00	cmp4sadgq005hl4016z9eqilf	2026-05-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-14 15:13:57.663	2026-07-30 10:58:26.819	\N
cmqp3rvft000is001ahcjqwvz	cmqp3rvfs000gs001vl1pbpld	Fatma	Ben Rhouma	22300912	2006-06-24 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-17 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 10:59:04.554	2026-06-24 10:58:36.627	\N
cmqp3ozqi0004s001fm3nxvgn	cmqp3ozqg0002s0017gspny25	Farah	Melliti	26073973	2003-04-15 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-09 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 10:56:50.154	2026-06-23 15:22:03.295	\N
cmqp3qkb7000bs001u04q0vsn	cmqp3qkb40009s001pwff74h4	Mounira	Mcharek	55573310	1972-03-21 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 10:58:03.475	2026-06-23 15:28:29.889	\N
cmqpbn2ri001elk01umecmq7c	cmqpbn2rg001clk01ip3c6q1x	Rim	Ben amara	22000000	2001-01-01 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 14:39:17.694	2026-06-23 15:31:18.487	\N
cmqpbli4t0017lk01pgc2c00k	cmqpbli4s0015lk0157urnfyj	Salma	Ghdemsi (dhifallah)	21000000	2000-01-01 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 14:38:04.301	2026-06-23 15:31:31.968	\N
cmqp4mhgd0009lk015rytzui9	cmqp4mhgb0007lk01wcbn5zgl	Nour	Lajnef	50242528	2003-08-30 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-18 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 11:22:52.765	2026-06-24 11:02:07.406	\N
cmqqihcm6000np901ub12rzon	cmqqihcm4000lp901cxctktij	Amira	Kadri	29472853	2001-11-18 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-06-20 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-23 10:38:34.015	2026-07-06 14:44:49.961	\N
cmqno5z2j00dlod0156ophlux	\N	Aya	Mhiri	20744039	2000-02-14 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-06-19 00:00:00	PERCENT	15	\N	ACTIVE	\N	t	2026-06-21 10:54:22.411	2026-06-24 12:31:37.027	\N
cmqpbpjdd001llk01e8vm535o	cmqpbpjdb001jlk01sd0qkvke	Ines	Darraji	98327784	1997-03-20 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-24 00:00:00	\N	\N	\N	ACTIVE	180	t	2026-06-22 14:41:12.529	2026-07-09 11:22:41.71	\N
cmqqio1g50018p9018hz9fq36	cmqqio1g40016p901zccog6td	Emna	Korbi	52472372	1998-02-14 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-28 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-23 10:43:46.134	2026-07-29 13:19:02.57	\N
cmqnjvfwv00clod01smhvf5v7	cmqnjvfws00cjod01j8b39tpm	Eya	Mghirbi	22840490	1984-11-19 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-29 00:00:00	PERCENT	10	\N	ACTIVE	\N	t	2026-06-21 08:54:12.559	2026-07-30 11:02:12.114	\N
cmqp4nucc000glk01of7k32cs	cmqp4nucb000elk011gita27e	Eya	Amri	20000000	1993-04-14 00:00:00	cmp4t00w6005xl401jv0qklyp	2026-06-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 11:23:56.125	2026-06-24 12:40:06.485	\N
cmqw8khue001lmg01a483drty	cmqw8khuc001jmg01oct3dxj2	Oumayma	Kassem	50027997	1996-07-11 00:00:00	cmp4t00w6005xl401jv0qklyp	2026-07-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-27 10:47:41.654	2026-07-14 11:26:59.736	\N
cmqqimbo30011p9015ihys621	cmqqimbo1000zp901igixi9wf	Nadya	Ayed	54540814	1993-04-06 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-26 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-23 10:42:26.067	2026-07-09 11:36:19.929	\N
cmqrwntpy0016sc0146g80wvq	cmqrwntpw0014sc013h57c16l	Fatma	Hichri	228404900	2013-02-27 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-29 00:00:00	PERCENT	10	personnelle	ACTIVE	\N	t	2026-06-24 10:03:16.918	2026-07-30 10:55:20.867	\N
cmqw8m90j001smg01dxisiguv	cmqw8m90h001qmg01l0kos78x	Lobna	Jaouadi	23284078	1997-07-05 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-27 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-27 10:49:03.523	2026-07-01 08:56:26.825	\N
cmqw8njse001zmg010hmpycb7	cmqw8njsc001xmg01edu55jji	Siwar	Triki	25097828	1996-08-06 00:00:00	cmr0t6kdb000mmm01e58p4sux	2026-07-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-27 10:50:04.143	2026-07-14 11:24:48.803	\N
cmqpbt84l001zlk01r9quitpi	cmqpbt84k001xlk012gwz0hln	Hiba	Jouini	99887961	1997-07-10 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-24 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 14:44:04.581	2026-07-09 11:22:59.839	\N
cmqqifegn000gp901x4b3a61j	cmqqifegk000ep9016ph72lqn	Molka	Gardouhi	55557310	2001-04-30 00:00:00	cmp4sixhw005ol401euqmhrwh	2026-06-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-23 10:37:03.095	2026-07-30 12:26:26.836	\N
cmqqjfnwv001mp901zr9d550e	cmqqjfnws001kp901bp7rvj2h	Farah	Mtibaa	96531641	2003-10-03 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-06-22 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-23 11:05:14.959	2026-07-01 09:58:50.4	\N
cmqqipr55001fp9010qryqpgy	cmqqipr54001dp901ynurss0c	Asma	Korbi	58478207	2000-09-08 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-28 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-23 10:45:06.089	2026-07-29 13:18:56.244	\N
cmqw8ec6p0010mg01ce7hdn33	cmqw8ec6n000ymg01g6yuxtgo	Wissal	Ouerfelli	29005702	1998-11-19 00:00:00	cmp4sadgq005hl4016z9eqilf	\N	\N	\N	\N	ACTIVE	\N	t	2026-06-27 10:42:54.385	2026-07-30 11:07:44.642	\N
cmqno2ywp00dfod01x3mtrdjg	cmqno2ywn00ddod01rdazx3wr	Senda	Ayedi	53036039	1979-02-16 00:00:00	cmp4sadgq005hl4016z9eqilf	2026-07-07 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-21 10:52:02.233	2026-07-29 17:45:51.89	\N
cmqpbrpkn001slk01gekkfisb	cmqpbrpkl001qlk01226gbtar	Arij	Jouini	53591454	1998-12-10 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-24 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 14:42:53.879	2026-07-09 11:22:54.518	\N
cmpxtdnho00jxp401mtude4xv	cmpxtdnhm00jvp401h8ebs106	Hanen	Gades	95609533	1977-05-13 22:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-06-26 00:00:00	PERCENT	15	personnelle	ACTIVE	\N	t	2026-06-03 06:38:18.156	2026-07-14 15:27:24.184	\N
cmqur9js700juo7015s7s7fwr	cmqur9js600jso701w738qrk1	Leila	Ben Ammar	25820034	1951-08-12 00:00:00	cmqur0gkm00jko7014ajnmg2a	2026-05-22 00:00:00	AMOUNT	100	ouverture	ACTIVE	\N	t	2026-06-26 09:55:31.303	2026-07-15 09:58:46.681	\N
cmqqija83000up901vbrlsocv	cmqqija82000sp901eerptodo	Ines	Ben Messeoud	52714234	1987-05-11 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-28 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-23 10:40:04.228	2026-07-29 13:19:12.156	\N
cmqp4ky050002lk01gx0v2tv9	cmqp4ky030000lk01du8ahjiz	Malek	Abdelli	22684279	2002-04-08 00:00:00	cmp4s6te2005el4011ra2qxrl	\N	\N	\N	\N	ACTIVE	\N	t	2026-06-22 11:21:40.901	2026-07-30 12:26:38.718	\N
cmqp3jmsv00euod010vtuk1qt	cmqp3jmst00esod01wqh4lcof	Cyrine	Gassa	0033759636298	1994-04-20 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-22 10:52:40.111	2026-07-30 10:57:25.095	\N
cmqur46xc00jno701ceuxfoxy	cmqur46x900jlo701y05c7e99	Fatma	Msekni	22316008	1979-02-14 00:00:00	cmqur0gkm00jko7014ajnmg2a	2026-07-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-26 09:51:21.36	2026-07-30 11:52:11.718	\N
cmpmhc40500h9p40180sb0edr	cmpmhc40300h7p401aakuvzsm	Siwar	Dhaouadi	53306504	1997-01-30 23:00:00	cmp4sixhw005ol401euqmhrwh	2026-05-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-26 08:15:42.917	2026-07-30 10:34:35.372	\N
cmr54gw0r009omm01n0aos5l6	cmr54gw0o009mmm01tgu8g7am	Syrine	Mansour	23247626	1991-09-01 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-04 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-03 16:02:50.523	2026-07-09 12:35:46.338	\N
cmrlvcqtr007jlq01qeub85bp	cmrlvcqto007hlq01ec3f419o	Syrine	Ben Haj Ahmed	00330745554335	1995-09-17 00:00:00	cmp4s6te2005el4011ra2qxrl	\N	\N	\N	\N	ACTIVE	\N	f	2026-07-15 09:19:45.615	2026-07-15 09:19:45.615	\N
cmr6940rg00bemm01s11l95mw	cmr6940re00bcmm01bhxg4a2c	Fatma	Ben Ghorbel	53855556	2002-07-24 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-04 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-04 11:00:34.396	2026-07-09 12:36:50.423	\N
cmrnml84b00kwlq01sw6qm4zc	cmrnml84900kulq01ofv62464	Samia	Zinelabidine	52672038	1989-06-11 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-16 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-16 14:49:57.083	2026-07-23 14:57:24.024	\N
cmrdaeve70025mn01r9qzxda0	cmrdaeve60023mn01etst11uw	Sirine	Bargaoui	24559617	1991-12-17 00:00:00	cmp4s6te2005el4011ra2qxrl	\N	\N	\N	\N	ACTIVE	\N	f	2026-07-09 09:11:23.503	2026-07-09 09:11:23.503	\N
cmr1tvvf8001fmm01nvgjy6v9	cmr1tvvf5001dmm012klv207a	Najla	Jallouli	58589703	1983-07-29 00:00:00	cmp4sbkj5005il4015b2x78mh	2026-06-30 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-01 08:43:15.284	2026-07-30 11:41:57.808	\N
cmr638xlv00admm01cm77sv03	cmr638xlt00abmm014n1r6u6i	Sabrine	Jebali	29145629	1994-09-15 00:00:00	cmqur0gkm00jko7014ajnmg2a	2026-07-04 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-04 08:16:25.891	2026-07-15 10:51:33.492	\N
cmrri21yv00m2lq01gugwiiyq	cmrri21yt00m0lq01so64itgy	Takwa	Ayari	99960012	2005-01-07 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-26 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-19 07:54:08.887	2026-07-28 14:01:45.945	\N
cmrdalmpn0035mn01esii22rz	cmrdalmpl0033mn01wlk6ic11	Jamila	Debira	99168109	1996-03-19 00:00:00	cmp4sixhw005ol401euqmhrwh	2026-07-13 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-09 09:16:38.843	2026-07-29 14:25:40.634	\N
cmr91oeqe00dvmm012s7it3wq	cmr91oeqc00dtmm01z36uw66q	Nour	Berrima	00971582583131	1997-01-31 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-08 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-06 09:55:47.222	2026-07-15 13:29:31.36	\N
cmqz4i19x0038mg01irua66ou	cmqz4i19v0036mg018dt8npt9	Cyrine	Zaouali	52454040	2006-01-02 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-08 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-29 11:17:06.933	2026-07-09 09:24:27.645	\N
cmqz4ky2t003fmg011oeykh0h	cmqz4ky2r003dmg01mfeq62oj	Jihen	Safi	94278779	1978-04-15 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-09 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-29 11:19:22.757	2026-07-30 10:26:00.763	\N
cmr91fzq700dmmm01t48rlkdj	cmr91fzq600dkmm01chaov4hu	Rym	Boulaabi	58985988	2001-03-23 00:00:00	cmr0t6kdb000mmm01e58p4sux	2026-07-06 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-06 09:49:14.527	2026-07-13 08:35:01.555	\N
cmrdadhtm001wmn01ebkmguat	cmrdadhtl001umn01yombq053	Zeineb	Sinaoui	21384145	2012-01-23 00:00:00	cmr0t6kdb000mmm01e58p4sux	2026-07-08 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-09 09:10:19.258	2026-07-15 13:28:11.729	\N
cmrdaicj5002nmn01fbw9scjq	cmrdaicj4002lmn01ah7rqa7c	Eya lamis	Rourou	92145777	2008-09-23 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-08 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-09 09:14:05.681	2026-07-15 13:53:40.626	\N
cmrkjma2h0010lq01o3ge2qc3	cmrkjma2f000ylq01frbmz6c6	Samar	Kabissa	26022659	1994-11-09 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-15 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-14 11:03:28.889	2026-07-21 07:41:44.589	\N
cmrbw6y2c0014mn01a6ii4tiu	cmrbw6y2a0012mn01hgp2x00r	Nabiha	KHMIRI	52524507	1951-06-12 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-14 00:00:00	AMOUNT	5	personnelle	ACTIVE	\N	t	2026-07-08 09:45:32.916	2026-07-29 13:20:23.977	\N
cmrf1sef700lbmn01oewtlk1z	cmrf1sef600l9mn011g74p7bq	Amira	Garfa	00330605592929	1989-12-29 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-10 14:45:30.5	2026-07-15 13:30:47.185	\N
cmpuxlbuw00ijp4016pmesm29	cmpuxlbuu00ihp4018gatfkcs	Marwa	Gammoudi	53961438	1988-04-10 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-25 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-01 06:12:56.264	2026-07-30 11:38:35.534	\N
cmrbwaec5001dmn01can4i9wf	cmrbwaec4001bmn01b0woh2r2	Siwar	Ben Abdallah	58446661	1981-06-25 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-14 00:00:00	AMOUNT	5	personnelle	ACTIVE	\N	t	2026-07-08 09:48:13.973	2026-07-29 13:20:12.416	\N
cmqw8ilsb001emg0158v8etes	cmqw8ils9001cmg01dtkcr3sm	Nour	Mraydi	28596575	2009-08-17 00:00:00	cmp4t5amk005zl4014v76r8bk	2026-06-30 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-27 10:46:13.452	2026-07-30 11:43:55.547	\N
cmr3dno9x008vmm01yn5zbnx3	cmr3dno9v008tmm01ehx8fsb6	Yasmine	Turki	53213439	2003-09-17 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-06-22 00:00:00	\N	\N	\N	ACTIVE	180	t	2026-07-02 10:44:31.27	2026-07-09 11:14:07.158	\N
cmp9p95jj00b2p401dqlrtohp	cmp9p95jg00b0p401pol3aoin	Rania	Zarred	55777614	1994-10-05 23:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-05-17 09:36:21.583	2026-07-30 13:12:28.346	\N
cmqzcgki3006umg01b9522uso	cmqzcgki1006smg01pw4smf4s	Lamia	Abdelkefi	50273930	1968-06-09 00:00:00	cmquqvx9k00jio701xv9bwsuw	2026-07-14 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-29 14:59:55.468	2026-07-30 10:32:49.159	\N
cmqw8ha3o0017mg010cohkf7t	cmqw8ha3n0015mg01yvnb3t2q	Rawene	Ben Romdhane	93969676	2009-01-16 00:00:00	cmp4t5amk005zl4014v76r8bk	2026-06-30 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-27 10:45:11.652	2026-07-30 11:44:21.25	\N
cmr91dvvk00ddmm01yvoi91dd	cmr91dvvi00dbmm0158qbt1k2	Yasmine	Dallegi	92811192	2009-05-23 00:00:00	cmr0t6kdb000mmm01e58p4sux	2026-07-30 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-06 09:47:36.224	2026-07-30 11:23:42.725	\N
cmr3dc13z008mmm01r1xcp8qr	cmr3dc13x008kmm01k83assv2	Oumaya	Zenati	20004787	1987-01-30 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-01 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-02 10:35:28.031	2026-07-09 12:16:04.931	\N
cmr66x4vm00aumm01n1n9q5b4	cmr66x4vj00asmm016p7t2k8n	Chahd	Soussi	23467177	2006-01-21 00:00:00	cmp4sadgq005hl4016z9eqilf	2026-07-02 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-04 09:59:13.906	2026-07-09 12:23:31.919	\N
cmraefj5300hzmm01gbupayou	cmraefj5100hxmm014te2jndx	Ceyda	Mazouz	50144589	1996-01-08 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-07 08:40:34.215	2026-07-30 10:58:41.25	\N
cmrfb3yin00m7mn01e62jdrb9	cmrfb3yil00m5mn01ektevnld	Nadine	Bouchiba	22578437	2010-02-08 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-10 19:06:26.303	2026-07-15 14:06:41.523	\N
cmr92ygsq00e4mm01t2ww4seu	cmr92ygso00e2mm011de59ke3	Rania	Dhaoui	95786796	2000-03-31 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-06 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-06 10:31:36.075	2026-07-13 08:34:54.07	\N
cmrbukuwd0004mn016lbgagog	cmrbukuwa0002mn011dfo307c	mayssa	saidi	97711798	1994-02-11 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-07 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-08 09:00:22.765	2026-07-15 13:22:43.441	\N
cmrbumgk4000dmn01h99tqe11	cmrbumgk3000bmn01v2b106eh	Sarra	Mouelhi	27044900	1998-10-21 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-07 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-08 09:01:37.492	2026-07-15 13:22:51.602	\N
cmrf1usfb00lkmn01msecwoo3	cmrf1usf900limn01nbb10ddy	Cyrine	Brinsi	25048052	1994-01-23 00:00:00	cmp4s6te2005el4011ra2qxrl	\N	\N	\N	\N	ACTIVE	\N	t	2026-07-10 14:47:21.959	2026-07-30 13:12:25.883	\N
cmrbure45000vmn014ppcw3bv	cmrbure44000tmn014gqiowcw	Zeineb	Aguebi	52789200	1985-08-20 00:00:00	cmp4sixhw005ol401euqmhrwh	2026-07-10 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-08 09:05:27.606	2026-07-30 11:44:49.508	\N
cmrdagpsz002emn01k4cuyqwh	cmrdagpsy002cmn01n2nwpyc0	Fatma	Ghorbel	54403504	1999-04-12 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-08 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-09 09:12:49.572	2026-07-15 13:53:57.524	\N
cmrdrcgat00kumn0112odkalw	cmrdrcgar00ksmn01lusa1csc	Chahrazed	Zrelli	29171512	1991-08-25 00:00:00	cmp4skb22005rl4014f0e7wgs	2026-07-09 00:00:00	PERCENT	10	personnelle	ACTIVE	\N	t	2026-07-09 17:05:24.101	2026-07-30 10:57:18.494	\N
cmrnrrjxa00lblq014meynmha	cmrnrrjx900l9lq01tns96u3k	Safa	Oueslati	27859190	1991-07-07 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-16 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-16 17:14:50.398	2026-07-30 11:34:56.712	\N
cmr66zk2400b3mm01nzav5tty	cmr66zk2300b1mm01l8latt7f	Sirine	Amri	29102769	2001-03-24 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-17 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-04 10:01:06.893	2026-07-21 08:02:05.093	\N
cmrdak4v0002wmn01j2my021k	cmrdak4uz002umn01new00unx	Sarah	Debira	99168109	2005-11-29 00:00:00	cmp4sixhw005ol401euqmhrwh	2026-07-13 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-09 09:15:29.052	2026-07-29 14:24:21.443	\N
cms3kuoyo00hin301dzucqsrq	\N	Nesrine	Agerbi	98 667 075	1994-02-17 00:00:00	cmp4t00w6005xl401jv0qklyp	2026-07-30 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 18:45:38.4	2026-07-30 11:23:01.43	\N
cmruxoqq5000zo901ix6vukw5	\N	Lina	Fathallah	55 432 393	2014-03-11 00:00:00	cmr0t6kdb000mmm01e58p4sux	2026-07-15 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-21 17:35:00.173	2026-07-23 14:53:25.106	\N
cmruxkruh000ro901qcd982u7	\N	Aida	Ben Amor	58 906 140	1979-10-22 00:00:00	cmp4sixhw005ol401euqmhrwh	2026-07-15 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-21 17:31:55.001	2026-07-23 14:53:57.362	\N
cms35lfky009cn301i7ou31cd	\N	Sarra	Charfeddine	25 275 381	1991-03-23 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-24 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 11:38:32.098	2026-07-27 17:19:37.335	\N
cms365esm00a0n3016r7lmgxk	\N	Nermine	Mkadmini	98 215580	\N	cmp4s6te2005el4011ra2qxrl	2026-07-26 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 11:54:04.199	2026-07-27 17:41:14.916	\N
cms3kr38500han30115yyomyb	\N	Sirine	Mechi	27 692 255	2002-08-26 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-27 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 18:42:50.261	2026-07-28 12:49:48.98	\N
cms4v82l8000nml0184j2mtyd	\N	Nada	Ghabara	28411929	1997-05-09 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-28 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-28 16:23:44.924	2026-07-29 13:13:26.732	\N
cmrbunzzo000mmn01dkqpill6	cmrbunzzn000kmn01zuqppjfe	Ilef	Bouaziz	52789200	2013-10-13 00:00:00	cmp4slcpz005ul401m1rpf0qa	2026-07-24 00:00:00	\N	\N	\N	ACTIVE	600	t	2026-07-08 09:02:49.332	2026-07-30 11:45:25.907	\N
cms3kei3j00gmn301mhqotbc4	\N	Rihab	Yacoubi	26 061 431	1986-04-21 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-26 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 18:33:03.007	2026-07-28 13:13:18.22	\N
cms362k9k009sn3012zp10a99	\N	Slimane	Nadia	52 530 933	2001-09-12 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-26 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 11:51:51.321	2026-07-28 14:01:31.88	\N
cms4vgzxz000vml01z4j4yu76	\N	Kawla	Barkaoui	22336658	\N	cmp4s6te2005el4011ra2qxrl	2026-07-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-28 16:30:41.399	2026-07-30 11:53:48.613	\N
cms3kn6uo00h2n301qm5snmp2	\N	Elaa	Abdelli	54 055 940	2002-12-21 00:00:00	cmp4s6te2005el4011ra2qxrl	2026-07-27 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 18:39:48.336	2026-07-28 14:38:34.137	\N
cmr0e8q3k009bmg01p00ba0nx	cmr0e8q3j0099mg0101z9g9mo	Boutheina	Zine El Abidine	20223858	1961-07-23 00:00:00	cmqur0gkm00jko7014ajnmg2a	2026-06-29 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-06-30 08:37:34.88	2026-07-30 15:08:36.282	\N
cmrwe3svz000mn3011way6tzi	\N	Marwa	Ayedi	0033766258522	1992-10-10 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-21 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-22 18:02:22.847	2026-07-30 10:57:56.67	\N
cms35x3i0009kn301kd28orpb	\N	Amina	Soltani	54 551 506	1997-06-09 00:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-27 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-27 11:47:36.313	2026-07-29 11:57:26.07	\N
cmp5i45nq000ap401mr5kujgq	cmp5i45no0008p401vpemjma9	Sana	Zenati	50793272	1991-01-29 23:00:00	cmp4s9cxl005gl4018m1wy6wp	2026-07-23 00:00:00	PERCENT	10	personnelle	ACTIVE	\N	t	2026-05-14 11:05:26.438	2026-07-30 11:07:07.289	\N
cmrwed60g000un301vg8ksj6i	\N	Mariem	Oueslati	50 315697	1992-10-22 00:00:00	cmp4s8kui005fl40100a1ew4b	2026-07-22 00:00:00	\N	\N	\N	ACTIVE	\N	t	2026-07-22 18:09:39.76	2026-07-30 11:17:53.361	\N
\.


--
-- Data for Name: pack_course_quotas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pack_course_quotas (id, "packId", "courseSlug", "sessionCount", "createdAt", "updatedAt") FROM stdin;
cmp4skb23005sl4011dfh2y4w	cmp4skb22005rl4014f0e7wgs	pilates-reformer	10	2026-05-13 23:10:09.908	2026-05-13 23:10:09.908
cmp4skb23005tl401z8vr4x7t	cmp4skb22005rl4014f0e7wgs	mat-pilates	10	2026-05-13 23:10:09.908	2026-05-13 23:10:09.908
cmp4slcpz005vl40199wenldz	cmp4slcpz005ul401m1rpf0qa	pilates-reformer	15	2026-05-13 23:10:58.727	2026-05-13 23:10:58.727
cmp4slcpz005wl401kuofgth9	cmp4slcpz005ul401m1rpf0qa	mat-pilates	15	2026-05-13 23:10:58.727	2026-05-13 23:10:58.727
cmr0t4s3e000kmm01hwev8pmg	cmp4sixhw005ol401euqmhrwh	pilates-reformer	5	2026-06-30 15:34:25.082	2026-06-30 15:34:25.082
cmr0t4s3e000lmm01jrfutpna	cmp4sixhw005ol401euqmhrwh	mat-pilates	5	2026-06-30 15:34:25.082	2026-06-30 15:34:25.082
cmr0t6kdb000nmm0159s0n4u3	cmr0t6kdb000mmm01e58p4sux	pilates-reformer	3	2026-06-30 15:35:48.375	2026-06-30 15:35:48.375
cmr0t6kdb000omm0110b1yhqg	cmr0t6kdb000mmm01e58p4sux	mat-pilates	3	2026-06-30 15:35:48.375	2026-06-30 15:35:48.375
\.


--
-- Data for Name: pack_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pack_features (id, "packId", label, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pack_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pack_payments (id, "memberId", "packId", "amountDinars", "listPriceDinars", "packSaleTotalDinars", "personalDiscountType", "personalDiscountValue", "personalDiscountDinars", "paidAt", source, "paymentKind", "paymentMethod", "promotionId", note, "recordedByUserId", "createdAt", "updatedAt") FROM stdin;
cmqdv6d8a0003wmxsa2l3mk7r	cmp6maci6002tp40119cnxlu3	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.314	2026-06-14 14:12:56.314
cmqdv6d8f0005wmxszwdd2qko	cmp580zx2006el401ov0q9nd9	cmp4skb22005rl4014f0e7wgs	450	450	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.319	2026-06-14 14:12:56.319
cmqdv6d8i0007wmxs67e5a6j1	cmp5cjt07006sl401hpc0r3sj	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.322	2026-06-14 14:12:56.322
cmqdv6d8l0009wmxs1xd01xog	cmp5d9vn5006zl401fo5j5q04	cmp4slcpz005ul401m1rpf0qa	600	600	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.326	2026-06-14 14:12:56.326
cmqdv6d8q000bwmxsi986rp4y	cmp9oxt9w00avp401sfiouy8l	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.33	2026-06-14 14:12:56.33
cmqdv6d8s000dwmxs1kqh4chs	cmp5doqck0079l4013c3pypy1	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.333	2026-06-14 14:12:56.333
cmqdv6d8v000fwmxs22u4zx53	cmp8b0p5m0078p401ko5fipst	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-15	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.335	2026-06-14 14:12:56.335
cmqdv6d8y000hwmxs3hr2vd7l	cmp5i45nq000ap401mr5kujgq	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.338	2026-06-14 14:12:56.338
cmqdv6d91000jwmxsmko3siv6	cmp5lkgat000fp4013f720b0o	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.342	2026-06-14 14:12:56.342
cmqdv6d94000lwmxs6zkzzgkk	cmp5nv1lh000mp4013w3oizro	cmp4t4k5c005yl401cme1vz52	150	150	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.344	2026-06-14 14:12:56.344
cmqdv6d97000nwmxserzyl4sw	cmp5qutpd0015p401e0b83fu9	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.347	2026-06-14 14:12:56.347
cmqdv6d9a000pwmxsg50az1de	cmp5qzr8e001ap401fa4uuzw4	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.35	2026-06-14 14:12:56.35
cmqdv6d9g000rwmxs2al4ncaw	cmp5r29es001fp401vky62ly4	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.357	2026-06-14 14:12:56.357
cmqdv6d9l000twmxscs6997mx	cmp5r6eqa001kp401z95m2mtr	cmp4t4k5c005yl401cme1vz52	150	150	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.361	2026-06-14 14:12:56.361
cmqdv6d9p000vwmxs48k34i54	cmp6me3mt002yp401esc9ykn5	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.365	2026-06-14 14:12:56.365
cmqdv6d9t000xwmxsqlf9ug9v	cmp6mh9mn0033p401xa6v43p7	cmp4sejni005kl4013ure33mc	1200	1200	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.37	2026-06-14 14:12:56.37
cmqdv6d9y000zwmxs6k5829nz	cmp6mkxvt0038p401gsyxjp1p	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.374	2026-06-14 14:12:56.374
cmqdv6da10011wmxsc1ltaqzk	cmp6mqu0z003dp401zgzrluwq	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.378	2026-06-14 14:12:56.378
cmqdv6da60013wmxsyzdoz9na	cmp6mujhf003ip4019yxl5iri	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.383	2026-06-14 14:12:56.383
cmqdv6daf0015wmxsnlo3woj4	cmp6mxgtj003np401n6d3md2o	cmp4skb22005rl4014f0e7wgs	450	450	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.391	2026-06-14 14:12:56.391
cmqdv6daj0017wmxsagfm22zu	cmp6n0r9g003sp401svwhqzjy	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.396	2026-06-14 14:12:56.396
cmqdv6dax0019wmxs1ufzh4as	cmp6n445r003xp4019r22o12e	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.41	2026-06-14 14:12:56.41
cmqdv6db2001bwmxssaaairxh	cmp6n6c330042p401572wyy97	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.414	2026-06-14 14:12:56.414
cmqdv6db9001fwmxs2z5cp0im	cmp6ndov4004cp4011gucmmzn	cmp4t4k5c005yl401cme1vz52	150	150	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.421	2026-06-14 14:12:56.421
cmqdv6dbc001hwmxsmsrrafm8	cmp6tmko3004rp4010ev8s38b	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.424	2026-06-14 14:12:56.424
cmqdv6dbe001jwmxsw3cv0z5a	cmp6vndph004yp401vluusox7	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.426	2026-06-14 14:12:56.426
cmqdv6dbg001lwmxsi0972s23	cmp9jyb2l009tp4012t706wff	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.429	2026-06-14 14:12:56.429
cmqdv6dbj001nwmxs5neoxhgj	cmp6ywfdb0055p401dvfsqap4	cmp4scs0q005jl401azkonj0y	650	650	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.431	2026-06-14 14:12:56.431
cmqdv6dbl001pwmxsrtm4jk7z	cmp71pbmj005ip401rxsl0n27	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.433	2026-06-14 14:12:56.433
cmqdv6dbo001rwmxs1tpk7dn1	cmp76c7ig005vp401qbizrga9	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-14	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.436	2026-06-14 14:12:56.436
cmqdv6dbr001twmxsdq6nn2mc	cmp80zids006np4015qmgm2k4	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-15	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.439	2026-06-14 14:12:56.439
cmqdv6dbt001vwmxsbi7309dg	cmp87ym20006yp401590xadl0	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-15	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.441	2026-06-14 14:12:56.441
cmqdv6dbv001xwmxstobe229b	cmp9l6t2c00acp4018v82zolp	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.443	2026-06-14 14:12:56.443
cmqdv6dbx001zwmxsloou00e7	cmp5dd5sd0074l401pv3drst8	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.446	2026-06-14 14:12:56.446
cmqdv6dc00021wmxsz9rkqzzw	cmp9muoo600alp401b1jj91hv	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.448	2026-06-14 14:12:56.448
cmqdv6dc20023wmxszmd9jvem	cmp9n16yg00aqp401yfgd8zit	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.45	2026-06-14 14:12:56.45
cmqdv6dc40025wmxshbix1fhz	cmp9p95jj00b2p401dqlrtohp	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.452	2026-06-14 14:12:56.452
cmqdv6dc80027wmxsmwx92mur	cmp9pbn9j00b7p401wd3w8sn0	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.457	2026-06-14 14:12:56.457
cmqdv6dcb0029wmxsbbufta2h	cmp9u530f00bip401o3641wtg	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.459	2026-06-14 14:12:56.459
cmqdv6dcd002bwmxsd54p97xr	cmp9uagwy00bnp401aww8aab6	cmp4sbkj5005il4015b2x78mh	480	480	\N	\N	\N	0	2026-05-16	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.461	2026-06-14 14:12:56.461
cmqdv6dch002dwmxssphj3anm	cmpazudle00byp401oz4zx3e1	cmp4slcpz005ul401m1rpf0qa	600	600	\N	\N	\N	0	2026-05-17	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.465	2026-06-14 14:12:56.465
cmqdv6dcj002fwmxsg0qe2tuh	cmpcdicon00d0p401ddbj8mmg	cmp4scs0q005jl401azkonj0y	650	650	\N	\N	\N	0	2026-05-18	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.467	2026-06-14 14:12:56.467
cmqdv6dcm002hwmxszvqr7oq1	cmp88f7g90073p401w4uw4pqs	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-15	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.47	2026-06-14 14:12:56.47
cmqdv6dco002jwmxs1tpft5yf	cmpb23ldo00c7p401ut25a8kv	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-17	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.473	2026-06-14 14:12:56.473
cmqdv6dcq002lwmxsmu9hobe3	cmpb26l0900ccp4014tau0gjw	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-17	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.475	2026-06-14 14:12:56.475
cmqdv6dct002nwmxszmod23mk	cmpbet54q00cpp4015io1o59b	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-17	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.477	2026-06-14 14:12:56.477
cmqdv6dcv002pwmxsm6mprj5z	cmpcfa7e300d9p401ktuwubni	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-18	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.48	2026-06-14 14:12:56.48
cmqdv6dcx002rwmxswxu2hjml	cmp5e2po6007el401m0wr4bxe	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-05-13	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.482	2026-06-14 14:12:56.482
cmqdv6dcz002twmxs39bgxhxe	cmpdskdbb00e0p401bi55y2g7	cmp4skb22005rl4014f0e7wgs	450	450	\N	\N	\N	0	2026-05-19	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.484	2026-06-14 14:12:56.484
cmqdv6dd3002vwmxstgxy4r2g	cmpfdk63200ebp401atbgmxt9	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-20	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.487	2026-06-14 14:12:56.487
cmqdv6dd5002xwmxs8evhb5lr	cmpfpx1dd00ekp4015zb7hrup	cmp4sbkj5005il4015b2x78mh	480	480	\N	\N	\N	0	2026-05-20	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.489	2026-06-14 14:12:56.489
cmqdv6dd7002zwmxsa7zilu87	cmph5kmv300f7p401b8x8jouu	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-21	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.492	2026-06-14 14:12:56.492
cmqdv6dda0031wmxstjtt3zu4	cmpi6ban400fip401ppm9o7wy	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-22	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.494	2026-06-14 14:12:56.494
cmqdv6ddc0033wmxs5fzynm86	cmpmhc40500h9p40180sb0edr	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-25	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.497	2026-06-14 14:12:56.497
cmqdv6ddf0035wmxs83e5qsl7	cmpqvd4pp00hkp401fok0cwt8	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-28	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.499	2026-06-14 14:12:56.499
cmqdv6ddh0037wmxsh25xvgzz	cmps12dpz00hvp401tesxyqev	cmp4sbkj5005il4015b2x78mh	480	480	\N	\N	\N	0	2026-05-29	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.501	2026-06-14 14:12:56.501
cmqdv6ddk0039wmxsqdm1xtcx	cmpux8mfw00i4p401v4t85sji	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-31	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.504	2026-06-14 14:12:56.504
cmqdv6ddm003bwmxsmh4z1jgd	cmpuxbc7900i9p401d4rkyuom	cmp4sejni005kl4013ure33mc	1200	1200	\N	\N	\N	0	2026-05-31	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.506	2026-06-14 14:12:56.506
cmqdv6ddo003dwmxs4ineitbm	cmpuxgfvo00iep401kuin241v	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-05-31	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.508	2026-06-14 14:12:56.508
cmqdv6ddt003hwmxsfg7mz0l7	cmpuxpn4l00iop40156zk6rje	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-05-31	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.513	2026-06-14 14:12:56.513
cmqdv6ddv003jwmxsw2dhb93p	cmpuxyh5x00itp401pqas19s7	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-31	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.515	2026-06-14 14:12:56.515
cmqdv6ddx003lwmxsh9nh8x2g	cmpv004tl00iyp4017n7rkxr5	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-31	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.518	2026-06-14 14:12:56.518
cmqdv6de0003nwmxsyn9w66ir	cmpvehn3c00j7p401p14lsb1d	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-05-31	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.52	2026-06-14 14:12:56.52
cmqdv6de2003pwmxsyxoo22zg	cmpwo5qcf00jgp401y23i6i2r	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-06-01	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.523	2026-06-14 14:12:56.523
cmqdv6de5003rwmxs77daovoc	cmpxt9h9d00jnp401acy1ppf1	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-02	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.525	2026-06-14 14:12:56.525
cmqdv6de7003twmxsc6wuswym	cmpxtbvan00jsp401dbkqvo9n	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-02	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.528	2026-06-14 14:12:56.528
cmqdv6de9003vwmxs0cn1ozmd	cmpxtdnho00jxp401mtude4xv	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-02	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.53	2026-06-14 14:12:56.53
cmqdv6dec003xwmxs4uuj7cdi	cmpxtfc9z00k2p401mfev8i51	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-02	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.532	2026-06-14 14:12:56.532
cmqdv6def003zwmxsr01wkqlq	cmpxths4t00k7p401ms2nx4f0	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-02	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.535	2026-06-14 14:12:56.535
cmqdv6dej0041wmxsyuvfnqcu	cmpya6nur00kgp401et6xel9m	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-02	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.539	2026-06-14 14:12:56.539
cmqdv6dem0043wmxsnvnjcn1r	cmpzh61qy00kpp401u52chqfx	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-03	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.542	2026-06-14 14:12:56.542
cmqdv6det0045wmxsmcuh45mn	cmpzp6len00kwp4012mdrq8ka	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-03	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.549	2026-06-14 14:12:56.549
cmqdv6dex0047wmxsgvq2c1lr	cmq251ruu00l5p4010gsntqmg	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-05	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.553	2026-06-14 14:12:56.553
cmqdv6df00049wmxsl4m6b81x	cmq254vcp00lap401whu604y8	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-06-05	AUTO	FULL	\N	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.556	2026-06-14 14:12:56.556
cmqf2b40n000hwmtsin8njl0v	cmqf2b405000dwmtsddcf7agj	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-12	AUTO	FULL	CASH	\N	Inscription manuelle (12/06/2026)	admin_aurapilates_001	2026-06-15 10:20:21.143	2026-06-21 08:28:42.722
cmqf2b3zt000bwmtsvy0rx2qi	cmqf2b3z80007wmtsodeuow25	cmp4t5amk005zl4014v76r8bk	190	190	\N	\N	\N	0	2026-06-11	AUTO	FULL	CASH	\N	Inscription manuelle (11/06/2026)	admin_aurapilates_001	2026-06-15 10:20:21.112	2026-06-21 08:30:33.045
cmqdv6ddq003fwmxsm1qfyh8n	cmpuxlbuw00ijp4016pmesm29	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-05-31	AUTO	FULL	CASH	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.511	2026-06-30 16:01:20.538
cmqdv6db4001dwmxswb41doum	cmp6n9pyb0047p401exgskztu	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-05-14	AUTO	FULL	CASH	\N	Rattrapage — vente pack à l'inscription	\N	2026-06-14 14:12:56.417	2026-06-20 16:15:34.273
cmqf2b43t0015wmtsbkxtfe6m	cmqf2b43f0011wmts29fvfire	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-14	AUTO	FULL	CASH	\N	Inscription manuelle (14/06/2026)	admin_aurapilates_001	2026-06-15 10:20:21.257	2026-06-21 08:23:18.861
cmqf2b42z000zwmtslwps3krf	cmqf2b42m000vwmtsnd6eu11l	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-14	AUTO	FULL	CASH	\N	Inscription manuelle (14/06/2026)	admin_aurapilates_001	2026-06-15 10:20:21.227	2026-06-21 08:24:24.774
cmqf2b41x000twmtsgg65b379	cmqf2b41m000pwmtsgzlybd2p	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-13	AUTO	FULL	CASH	\N	Inscription manuelle (13/06/2026)	admin_aurapilates_001	2026-06-15 10:20:21.189	2026-06-21 08:25:53.952
cmqf2b41a000nwmtsm3acqy88	cmqf2b40z000jwmtsglaha6m4	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-12	AUTO	FULL	CASH	\N	Inscription manuelle (12/06/2026)	admin_aurapilates_001	2026-06-15 10:20:21.166	2026-06-21 08:27:41.982
cmqf2b3y20005wmtsnnhyj4qm	cmqf2b3xg0001wmtsjmoqct8a	cmp4skb22005rl4014f0e7wgs	450	450	\N	\N	\N	0	2026-06-10	AUTO	FULL	TPE	\N	Inscription manuelle (10/06/2026)	admin_aurapilates_001	2026-06-15 10:20:21.051	2026-06-21 08:31:44.909
cmqnjhe4e00cbod01e4mgdqm7	cmqnjhe4500c7od01xunmmhyz	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-21	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-21 08:43:17.054	2026-06-21 08:43:17.054
cmqnjmmnf00ciod0185a6hqx9	cmqnjmmn900ceod01dz6unzwp	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-21	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-21 08:47:21.387	2026-06-21 08:48:23.621
cmqnjvfx600cpod011890aqpz	cmqnjvfwv00clod01smhvf5v7	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-21	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-21 08:54:12.57	2026-06-21 08:54:39.983
cmqnlllps00cwod0192pyfxog	cmqnlllpk00csod01wkefk1ot	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-21	AUTO	FULL	TPE	\N	Création adhérent	admin_aurapilates_001	2026-06-21 09:42:32.752	2026-06-21 09:42:32.752
cmqnlovfq00d3od01y7or62rp	cmqnlovfk00czod0169336zw1	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-21	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-21 09:45:05.319	2026-06-21 09:45:05.319
cmqnnz1kq00dcod01s93kwgtb	cmqnnz1kg00d8od0103g8czza	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-21	AUTO	FULL	TPE	\N	Création adhérent	admin_aurapilates_001	2026-06-21 10:48:59.067	2026-06-21 10:48:59.067
cmqno2ywz00djod01zp7yra8f	cmqno2ywp00dfod01x3mtrdjg	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-21	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-21 10:52:02.243	2026-06-21 10:52:02.243
cmqno5z2r00dpod01k1vnz695	cmqno5z2j00dlod0156ophlux	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-21	AUTO	FULL	TPE	\N	Création adhérent	admin_aurapilates_001	2026-06-21 10:54:22.419	2026-06-21 10:54:48.741
cmqp0fvcz00e4od01mg8xwdss	cmqp0fvcq00e0od01115zmkft	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 09:25:45.731	2026-06-22 09:25:45.731
cmqp1dmlw00ebod01a7pxp5u8	cmqp1dmlo00e7od01uqu7xeqx	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 09:52:00.692	2026-06-22 09:52:00.692
cmqp1r6o700eiod01gbztjwo0	cmqp1r6nz00eeod015izfwb4m	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 10:02:33.224	2026-06-22 10:02:33.224
cmqp2at3n00epod01joh1tlk3	cmqp2at3e00elod01ib880iqc	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 10:17:48.755	2026-06-22 10:17:48.755
cmqp3lgcx00f5od01wddkci5w	cmqp3lgcp00f1od0111da04jy	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 10:54:05.074	2026-06-22 10:54:05.074
cmqp3ozqq0008s001xo034a13	cmqp3ozqi0004s001fm3nxvgn	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 10:56:50.163	2026-06-22 10:56:50.163
cmqp3qkbg000fs001frdafyjt	cmqp3qkb7000bs001u04q0vsn	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 10:58:03.484	2026-06-22 10:58:03.484
cmqp3rvg0000ms00193xwxhml	cmqp3rvft000is001ahcjqwvz	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 10:59:04.561	2026-06-22 10:59:04.561
cmqp4ky0f0006lk01kpqvbw9e	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 11:21:40.911	2026-06-22 11:21:40.911
cmqp4mhgk000dlk01983srs92	cmqp4mhgd0009lk015rytzui9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 11:22:52.773	2026-06-22 11:22:52.773
cmqp4nucj000klk01udakym8u	cmqp4nucc000glk01of7k32cs	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	TPE	\N	Création adhérent	admin_aurapilates_001	2026-06-22 11:23:56.131	2026-06-22 11:23:56.131
cmqpbg2xl000xlk01kki1gouu	cmqpbg2wz000tlk01pnlcrmdj	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 14:33:51.321	2026-06-22 14:33:51.321
cmqpbic760014lk01mo093cee	cmqpbic6z0010lk01lg3znp3o	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 14:35:36.642	2026-06-22 14:35:36.642
cmqpbli4y001blk010lnjflbf	cmqpbli4t0017lk01pgc2c00k	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 14:38:04.306	2026-06-22 14:38:04.306
cmqpbn2rp001ilk01p1xn6nu9	cmqpbn2ri001elk01umecmq7c	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 14:39:17.701	2026-06-22 14:39:17.701
cmqpbpjdl001plk01bsgjeco1	cmqpbpjdd001llk01e8vm535o	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 14:41:12.537	2026-06-22 14:41:12.537
cmqpbrpkr001wlk015xnkgq0n	cmqpbrpkn001slk01gekkfisb	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 14:42:53.883	2026-06-22 14:42:53.883
cmqpbt84r0023lk01oqewzngd	cmqpbt84l001zlk01r9quitpi	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	CASH	\N	Création adhérent	admin_aurapilates_001	2026-06-22 14:44:04.588	2026-06-22 14:44:04.588
cmqqgylbl000dp901dnscsomn	cmp9jyb2l009tp4012t706wff	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-23	AUTO	FULL	\N	\N	Renouvellement pack (file d'attente)	admin_aurapilates_001	2026-06-23 09:55:59.217	2026-06-23 09:55:59.217
cmqqifegw000kp90189zzm7lm	cmqqifegn000gp901x4b3a61j	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-23	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-23 10:37:03.104	2026-06-23 10:37:03.104
cmqqihcme000rp901bv7gvzq6	cmqqihcm6000np901ub12rzon	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-23	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-06-23 10:38:34.023	2026-06-23 10:38:34.023
cmqqija89000yp90110hzbaop	cmqqija83000up901vbrlsocv	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-23	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-23 10:40:04.233	2026-06-23 10:40:04.233
cmqqimboa0015p9015ea4cb9z	cmqqimbo30011p9015ihys621	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-23	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-23 10:42:26.074	2026-06-23 10:42:26.074
cmqqio1gd001cp901yzrdzc72	cmqqio1g50018p9018hz9fq36	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-23	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-23 10:43:46.141	2026-06-23 10:43:46.141
cmqqipr5b001jp901hdkszgjs	cmqqipr55001fp9010qryqpgy	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-23	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-23 10:45:06.095	2026-06-23 10:45:06.095
cmqqjfnx4001qp901hv4jnymc	cmqqjfnwv001mp901zr9d550e	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-23	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-23 11:05:14.969	2026-06-23 11:05:14.969
cmqqjh6kn001up9014wm3o1nc	cmp6n9pyb0047p401exgskztu	cmp4t00w6005xl401jv0qklyp	25	25	\N	\N	\N	0	2026-06-23	AUTO	FULL	\N	\N	Renouvellement pack (file d'attente)	admin_aurapilates_001	2026-06-23 11:06:25.8	2026-06-23 11:06:25.8
cmqrwntq4001asc01oq7bln8i	cmqrwntpy0016sc0146g80wvq	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-24	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-24 10:03:16.925	2026-06-24 10:03:16.925
cmqrz9rdj008xo701nue1mmm9	cmp9pbn9j00b7p401wd3w8sn0	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 11:16:19.544	2026-06-24 11:16:19.544
cmqrzd35q0091o7018lgxgw3o	cmp80zids006np4015qmgm2k4	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 11:18:54.783	2026-06-24 11:18:54.783
cmqrzh43m009do701kkaohpof	cmpb26l0900ccp4014tau0gjw	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack (file d'attente)	admin_aurapilates_001	2026-06-24 11:22:02.627	2026-06-24 11:22:02.627
cmqs24eh300e9o701j42xh4pw	cmqp4nucc000glk01of7k32cs	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 12:36:08.391	2026-06-24 12:36:08.391
cmqs26b5x00elo70119thgzin	cmqp4nucc000glk01of7k32cs	cmp4t00w6005xl401jv0qklyp	25	25	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 12:37:37.413	2026-06-24 12:37:37.413
cmqs9t4tj00gbo7010edbzpc7	cmpzh61qy00kpp401u52chqfx	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack (file d'attente)	admin_aurapilates_001	2026-06-24 16:11:19.591	2026-06-24 16:11:19.591
cmqs9u1cv00gfo7018vdlrjrd	cmp9jyb2l009tp4012t706wff	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 16:12:01.76	2026-06-24 16:12:01.76
cmqs9uw1a00gjo701rot8q5hg	cmpazudle00byp401oz4zx3e1	cmp4slcpz005ul401m1rpf0qa	600	600	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack (file d'attente)	admin_aurapilates_001	2026-06-24 16:12:41.519	2026-06-24 16:12:41.519
cmqs9vxjn00gno701s5xowtc8	cmp5dd5sd0074l401pv3drst8	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-06-24	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 16:13:30.131	2026-06-24 16:13:30.131
cmqt868p700hpo701pd06nfc8	cmph5kmv300f7p401b8x8jouu	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-25	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-25 08:13:18.091	2026-06-25 08:13:18.091
cmqp3jmt100eyod0197bui4ht	cmqp3jmsv00euod010vtuk1qt	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-22	AUTO	FULL	TPE	\N	Création adhérent	admin_aurapilates_001	2026-06-22 10:52:40.117	2026-06-25 09:20:35.167
cmqtaky3n00hto701ndlr5xw9	cmqp3jmsv00euod010vtuk1qt	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-25	AUTO	FULL	\N	\N	Renouvellement pack	admin_aurapilates_001	2026-06-25 09:20:43.427	2026-06-25 09:20:43.427
cmqur46xl00jro701jo0fuabr	cmqur46xc00jno701ceuxfoxy	cmqur0gkm00jko7014ajnmg2a	595	650	\N	AMOUNT	55	55	2026-06-26	AUTO	FULL	CASH	\N	Création adhérente · Remise perso: fête des mères	admin_aurapilates_001	2026-06-26 09:51:21.37	2026-06-26 09:51:21.37
cmqur9jsd00jyo701ettlpf6s	cmqur9js700juo7015s7s7fwr	cmqur0gkm00jko7014ajnmg2a	550	650	\N	AMOUNT	100	100	2026-06-26	AUTO	FULL	TPE	\N	Création adhérente · Remise perso: ouverture	admin_aurapilates_001	2026-06-26 09:55:31.309	2026-06-26 09:55:31.309
cmqurvize00k9o701408qu7za	cmp5e2po6007el401m0wr4bxe	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-26	AUTO	FULL	\N	\N	Renouvellement pack (file d'attente)	admin_aurapilates_001	2026-06-26 10:12:36.699	2026-06-26 10:12:36.699
cmqw8ha3w001bmg01tkxms7y2	cmqw8ha3o0017mg010cohkf7t	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-27 10:45:11.66	2026-06-27 10:45:11.66
cmqw8ilsl001img01s7zqwcji	cmqw8ilsb001emg0158v8etes	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-27 10:46:13.461	2026-06-27 10:46:13.461
cmqw8khuk001pmg01a0opnegx	cmqw8khue001lmg01a483drty	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-27 10:47:41.66	2026-06-27 10:47:41.66
cmqw8m90r001wmg01rkccovnc	cmqw8m90j001smg01dxisiguv	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-27 10:49:03.531	2026-06-27 10:49:03.531
cmqw8njsm0023mg011o7u45d1	cmqw8njse001zmg010hmpycb7	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-27 10:50:04.15	2026-06-27 10:50:04.15
cmqtghn9s00ito701kejp6rks	cmqpbt84l001zlk01r9quitpi	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-25	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-25 12:06:07.12	2026-07-06 14:35:46.518
cmqtgh5s900ipo701a077x32j	cmqpbrpkn001slk01gekkfisb	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-25	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-25 12:05:44.458	2026-07-06 14:36:44.274
cmqrwfs45000nsc010xqvf9yg	cmqqifegn000gp901x4b3a61j	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-06-24	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 09:57:01.589	2026-07-06 14:41:28.155
cmqz44r3x0031mg01shvopxs2	cmqqimbo30011p9015ihys621	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-29 11:06:47.229	2026-07-06 14:42:30.865
cmqrwjws90013sc01i5iw6fpe	cmqqija83000up901vbrlsocv	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-24	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 10:00:14.265	2026-07-06 14:44:03.173
cmqrwhklz000rsc01rc9mf40p	cmqqihcm6000np901ub12rzon	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-24	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 09:58:25.176	2026-07-06 14:44:49.964
cmqrwj8vz000zsc019flh4t87	cmqqio1g50018p9018hz9fq36	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-24	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 09:59:43.295	2026-07-09 09:20:40.871
cmqrwihlw000vsc01ydy35bsk	cmqqipr55001fp9010qryqpgy	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-24	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-24 09:59:07.94	2026-07-09 09:21:18.712
cmqw8ec6x0014mg01efisqh1l	cmqw8ec6p0010mg01ce7hdn33	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-27 10:42:54.393	2026-07-09 09:22:00.291
cmqw8ru5w0027mg018z85ds9l	cmqw8ha3o0017mg010cohkf7t	cmp4t5amk005zl4014v76r8bk	190	190	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-06-27 10:53:24.213	2026-07-09 09:22:46.301
cmqw8sc4i002bmg01aoagf4fe	cmqw8ilsb001emg0158v8etes	cmp4t5amk005zl4014v76r8bk	190	190	\N	\N	\N	0	2026-06-27	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-06-27 10:53:47.49	2026-07-09 09:23:56.245
cmqtgii5200ixo701pxkf7as7	cmqrwntpy0016sc0146g80wvq	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-06-25	AUTO	FULL	CASH	\N	Renouvellement pack (file d'attente)	admin_aurapilates_001	2026-06-25 12:06:47.126	2026-07-23 12:33:34.096
cmqz4fwtz0035mg01gcofdbuv	cmp9p95jj00b2p401dqlrtohp	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-29	AUTO	FULL	TPE	\N	Renouvellement pack	admin_aurapilates_001	2026-06-29 11:15:27.864	2026-06-29 11:15:27.864
cmqzcgkic006ymg01rve7iery	cmqzcgki3006umg01b9522uso	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-29 14:59:55.476	2026-06-29 14:59:55.476
cmr0e8q3r009fmg01qg94wvtv	cmr0e8q3k009bmg01p00ba0nx	cmqur0gkm00jko7014ajnmg2a	650	650	\N	\N	\N	0	2026-06-30	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-06-30 08:37:34.887	2026-06-30 08:37:34.887
cmr0u5dhi0010mm01cxtmqi5v	cmpuxlbuw00ijp4016pmesm29	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-30	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-06-30 16:02:52.422	2026-06-30 16:02:52.422
cmr1txafk001rmm01tjybzryr	cmp88f7g90073p401w4uw4pqs	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-01	AUTO	FULL	TPE	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-01 08:44:21.392	2026-07-01 08:44:21.392
cmr1us0fd006nmm018gxsl5p4	cmp6n9pyb0047p401exgskztu	cmp4t00w6005xl401jv0qklyp	25	25	\N	\N	\N	0	2026-07-01	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-01 09:08:14.761	2026-07-01 09:08:14.761
cmr29fwiz007vmm01swmy9mfl	cmqf2b42m000vwmtsnd6eu11l	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-07-01	AUTO	FULL	TPE	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-01 15:58:44.076	2026-07-01 15:58:44.076
cmr3d5w39008hmm01htqp5gk8	cmqno2ywp00dfod01x3mtrdjg	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-07-02	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-02 10:30:41.589	2026-07-02 10:30:41.589
cmr3dnoa5008zmm01dipex94l	cmr3dno9x008vmm01yn5zbnx3	cmp4s8kui005fl40100a1ew4b	40	180	180	\N	\N	0	2026-07-02	AUTO	DEPOSIT	CASH	\N	Acompte à l'inscription	admin_aurapilates_001	2026-07-02 10:44:31.277	2026-07-02 10:44:31.277
cmqw5srnk000vmg014nzdi748	cmqpbpjdd001llk01e8vm535o	cmp4s8kui005fl40100a1ew4b	40	180	180	\N	\N	0	2026-06-27	AUTO	DEPOSIT	CASH	\N	Acompte à l'inscription	admin_aurapilates_001	2026-06-27 09:30:08.768	2026-07-02 10:45:01.971
cmr54ln1b00a0mm019dpvksz4	cmpya6nur00kgp401et6xel9m	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-03	AUTO	FULL	TPE	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-03 16:06:32.159	2026-07-03 16:06:32.159
cmr638xm300ahmm01wvfv7zt5	cmr638xlv00admm01cm77sv03	cmquqvx9k00jio701xv9bwsuw	70	70	\N	\N	\N	0	2026-07-04	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-04 08:16:25.899	2026-07-04 08:16:25.899
cmr639etz00anmm01f04sgs0o	cmr638xlv00admm01cm77sv03	cmqur0gkm00jko7014ajnmg2a	650	650	\N	\N	\N	0	2026-07-04	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-04 08:16:48.215	2026-07-04 08:16:48.215
cmr91c6e800d8mm01hbeilygh	cmp6mujhf003ip4019yxl5iri	cmp4scs0q005jl401azkonj0y	650	650	\N	\N	\N	0	2026-07-06	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-06 09:46:16.544	2026-07-06 09:46:16.544
cmr91oeqm00dzmm01ius7j1cl	cmr91oeqe00dvmm012s7it3wq	cmp4t00w6005xl401jv0qklyp	25	25	\N	\N	\N	0	2026-07-06	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-06 09:55:47.23	2026-07-06 09:55:47.23
cmr92ygsz00e8mm018wzeujzo	cmr92ygsq00e4mm01t2ww4seu	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-06	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-06 10:31:36.083	2026-07-06 10:31:36.083
cmrafe0si00k1mm01c009uo2j	cmqnlovfk00czod0169336zw1	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-07	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-07 09:07:23.394	2026-07-07 09:07:23.394
cmrbukuwn0008mn01amxdrxnb	cmrbukuwd0004mn016lbgagog	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-08	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-08 09:00:22.776	2026-07-08 09:00:22.776
cmrbumgk9000hmn01m0yqiw76	cmrbumgk4000dmn01h99tqe11	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-08	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-08 09:01:37.497	2026-07-08 09:01:37.497
cmqz4i1a4003cmg01tauwkmg0	cmqz4i19x0038mg01irua66ou	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-06-29 11:17:06.941	2026-07-09 09:24:27.648
cmqz4ky31003jmg01x0u3n9gf	cmqz4ky2t003fmg011oeykh0h	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-06-29	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-06-29 11:19:22.765	2026-07-09 09:25:52.916
cmr1tvvfi001jmm01ge2qv5ip	cmr1tvvf8001fmm01nvgjy6v9	cmp4sbkj5005il4015b2x78mh	480	480	\N	\N	\N	0	2026-07-01	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-01 08:43:15.294	2026-07-09 09:26:29.4
cmr3dc147008qmm01ulvp3suq	cmr3dc13z008mmm01r1xcp8qr	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-02	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-07-02 10:35:28.039	2026-07-09 09:27:08.895
cmr54gw13009smm01k1ate9fz	cmr54gw0r009omm01n0aos5l6	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-03	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-07-03 16:02:50.535	2026-07-09 09:27:43.162
cmr66x4vw00aymm01p4x19rqw	cmr66x4vm00aumm01n1n9q5b4	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-07-04	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-04 09:59:13.917	2026-07-09 09:29:47.498
cmr6940rn00bimm01b2jzka8f	cmr6940rg00bemm01s11l95mw	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-04	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-04 11:00:34.403	2026-07-09 09:31:08.32
cmr91dvvo00dhmm01t8qe0iz2	cmr91dvvk00ddmm01yvoi91dd	cmr0t6kdb000mmm01e58p4sux	150	150	\N	\N	\N	0	2026-07-06	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-06 09:47:36.228	2026-07-09 09:31:53.116
cmr91fzqb00dqmm01h3sgrv6n	cmr91fzq700dmmm01t48rlkdj	cmr0t6kdb000mmm01e58p4sux	150	150	\N	\N	\N	0	2026-07-06	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-06 09:49:14.531	2026-07-09 09:32:42.26
cmrbunzzv000qmn01a9swzs82	cmrbunzzo000mmn01dkqpill6	cmr0t6kdb000mmm01e58p4sux	150	150	\N	\N	\N	0	2026-07-08	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-08 09:02:49.339	2026-07-09 09:33:18.091
cmraefj5b00i3mm01i93dp46l	cmraefj5300hzmm01gbupayou	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-07	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-07 08:40:34.224	2026-07-10 18:08:42.109
cmqzci02p007amg011cbqb3z4	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	70	70	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-29 15:01:02.306	2026-07-23 13:07:51.568
cmrbure4c000zmn01ye4k0u0j	cmrbure45000vmn014ppcw3bv	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-07-08	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-08 09:05:27.612	2026-07-24 07:25:38.649
cmrdaeveb0029mn019z7no6ck	cmrdaeve70025mn01r9qzxda0	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-09	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-09 09:11:23.507	2026-07-09 09:11:23.507
cmrdagpt5002imn01462zkdte	cmrdagpsz002emn01k4cuyqwh	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-09	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-09 09:12:49.577	2026-07-09 09:12:49.577
cmrdaicjb002rmn015wy4oz8r	cmrdaicj5002nmn01fbw9scjq	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-09	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-09 09:14:05.687	2026-07-09 09:14:05.687
cmr66zk2b00b7mm01cethbcsr	cmr66zk2400b3mm01nzav5tty	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-04	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-07-04 10:01:06.9	2026-07-09 09:30:34.121
cmrbw6y2i0018mn011n0yowln	cmrbw6y2c0014mn01a6ii4tiu	cmp4s8kui005fl40100a1ew4b	175	180	\N	AMOUNT	5	5	2026-07-08	AUTO	FULL	CASH	\N	Création adhérente · Remise perso: personnelle	admin_aurapilates_001	2026-07-08 09:45:32.922	2026-07-09 09:35:11.534
cmrbwaec9001hmn013d4v63y0	cmrbwaec5001dmn01can4i9wf	cmp4s8kui005fl40100a1ew4b	175	180	\N	AMOUNT	5	5	2026-07-08	AUTO	FULL	CASH	\N	Création adhérente · Remise perso: personnelle	admin_aurapilates_001	2026-07-08 09:48:13.978	2026-07-09 09:35:55.065
cmrdadhtu0020mn01ainn6g7h	cmrdadhtm001wmn01ebkmguat	cmr0t6kdb000mmm01e58p4sux	150	150	\N	\N	\N	0	2026-07-09	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-07-09 09:10:19.266	2026-07-09 09:36:26.591
cmrdalmps0039mn01cssz9ex0	cmrdalmpn0035mn01esii22rz	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-07-09	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-09 09:16:38.849	2026-07-29 14:25:40.414
cmrdbfpi3003zmn01yhos84ny	cmr3dno9x008vmm01yn5zbnx3	cmp4s8kui005fl40100a1ew4b	140	180	180	\N	\N	0	2026-07-09	AUTO	BALANCE	TPE	\N	Solde pack — finalisation de l'acompte	admin_aurapilates_001	2026-07-09 09:40:02.139	2026-07-09 09:40:02.139
cmrdbgjtx0041mn015xj8dbgm	cmqpbpjdd001llk01e8vm535o	cmp4s8kui005fl40100a1ew4b	140	180	180	\N	\N	0	2026-07-09	AUTO	BALANCE	CASH	\N	Solde pack — finalisation de l'acompte	admin_aurapilates_001	2026-07-09 09:40:41.445	2026-07-09 09:40:41.445
cmrdbo36b0045mn01scxadj73	cmpuxgfvo00iep401kuin241v	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-09	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-09 09:46:33.107	2026-07-09 09:46:33.107
cmrdrcgb400kymn01mho4uxsu	cmrdrcgat00kumn0112odkalw	cmp4skb22005rl4014f0e7wgs	405	450	\N	PERCENT	10	45	2026-07-09	AUTO	FULL	TPE	\N	Création adhérente · Remise perso: personnelle	admin_aurapilates_001	2026-07-09 17:05:24.112	2026-07-09 17:07:31.105
cmrf1sefg00lfmn01pj6vrp45	cmrf1sef700lbmn01oewtlk1z	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-10	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-10 14:45:30.508	2026-07-10 14:46:09.942
cmrf1usfk00lomn01ow3dkoed	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-10	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-10 14:47:21.969	2026-07-10 14:47:21.969
cmrf9259o00m0mn01qycarwyf	cmraefj5300hzmm01gbupayou	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-07-10	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-10 18:09:02.508	2026-07-10 18:09:02.508
cmrfb3yiu00mbmn01vz645x2e	cmrfb3yin00m7mn01e62jdrb9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-10	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-10 19:06:26.311	2026-07-10 19:06:26.311
cmriywk5s00oqmn015jyi84zu	cmr91oeqe00dvmm012s7it3wq	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-13	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-13 08:35:50.417	2026-07-13 08:35:50.417
cmrjemeti0003lq01pibk50ik	cmqnjhe4500c7od01xunmmhyz	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-07-13	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-13 15:55:50.79	2026-07-13 15:55:50.79
cmrkjma2o0014lq01eh8cw0ek	cmrkjma2h0010lq01o3ge2qc3	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-14	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-14 11:03:28.897	2026-07-14 11:03:28.897
cmrkkcax6002ylq01z9qwmg0t	cmqw8njse001zmg010hmpycb7	cmr0t6kdb000mmm01e58p4sux	150	150	\N	\N	\N	0	2026-07-14	AUTO	FULL	TPE	\N	Renouvellement pack	admin_aurapilates_001	2026-07-14 11:23:43.051	2026-07-14 11:23:43.051
cmrkkgc3q003alq015a3v4w6n	cmqw8khue001lmg01a483drty	cmp4t00w6005xl401jv0qklyp	25	25	\N	\N	\N	0	2026-07-14	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-14 11:26:51.207	2026-07-14 11:26:51.207
cmrkknjv5003slq018c5zeq3r	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-14	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-14 11:32:27.858	2026-07-14 11:32:27.858
cmrkks6q10042lq01z5pdlr00	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-14	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-14 11:36:04.105	2026-07-14 11:36:04.105
cmrkl27ru004clq01z7lmrj3e	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-14	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-14 11:43:52.026	2026-07-14 11:43:52.026
cmrklvm5o004olq018pacgwin	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-14	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-14 12:06:43.692	2026-07-14 12:06:43.692
cmrklzs3t004ylq01e89y9b9h	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-14	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-14 12:09:58.026	2026-07-14 12:09:58.026
cmrksxsoj005ilq019k8rtvj0	cmpxtdnho00jxp401mtude4xv	cmp4s9cxl005gl4018m1wy6wp	229	270	\N	PERCENT	15	41	2026-07-14	AUTO	FULL	TPE	\N	Renouvellement pack · Remise perso: personnelle	admin_aurapilates_001	2026-07-14 15:24:22.772	2026-07-14 15:24:22.772
cmrkszpxq005olq01yy2350qc	cmpxtfc9z00k2p401mfev8i51	cmp4s9cxl005gl4018m1wy6wp	229	270	\N	PERCENT	15	41	2026-07-14	AUTO	FULL	CASH	\N	Renouvellement pack · Remise perso: personnelle	admin_aurapilates_001	2026-07-14 15:25:52.526	2026-07-14 15:25:52.526
cmrlvcqtz007nlq01qw79rx0k	cmrlvcqtr007jlq01qeub85bp	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-15	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-15 09:19:45.623	2026-07-15 09:19:45.623
cmrlwjry0008hlq01vjw62u1q	cmpi6ban400fip401ppm9o7wy	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-07-15	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-15 09:53:13.272	2026-07-15 09:53:13.272
cmrm49dpn00crlq0102gchh3q	cmr91oeqe00dvmm012s7it3wq	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-15	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-15 13:29:05.195	2026-07-15 13:29:05.195
cmrnml84k00l0lq01anszfqf2	cmrnml84b00kwlq01sw6qm4zc	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-07-16	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-16 14:49:57.092	2026-07-16 14:49:57.092
cmrnrrjxh00lflq017a5dxyou	cmrnrrjxa00lblq014meynmha	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-16	AUTO	FULL	TPE	\N	Création adhérente	admin_aurapilates_001	2026-07-16 17:14:50.405	2026-07-16 17:14:50.405
cmrri21z400m6lq01yxzno5tn	cmrri21yv00m2lq01gugwiiyq	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-19	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-19 07:54:08.896	2026-07-19 07:54:08.896
cmrum92ss00zblq01riaeauur	cmqur46xc00jno701ceuxfoxy	cmqur0gkm00jko7014ajnmg2a	700	700	\N	\N	\N	0	2026-07-21	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-21 12:14:53.548	2026-07-21 12:14:53.548
cmruxkruq000vo90118b5nrao	cmruxkruh000ro901qcd982u7	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-07-21	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-21 17:31:55.011	2026-07-21 17:31:55.011
cmruxoqqd0013o901v3vtcjpu	cmruxoqq5000zo901ix6vukw5	cmr0t6kdb000mmm01e58p4sux	150	150	\N	\N	\N	0	2026-07-21	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-21 17:35:00.181	2026-07-21 17:35:00.181
cmrwe3sw6000qn301xgsp0cqz	cmrwe3svz000mn3011way6tzi	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-07-22	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-22 18:02:22.854	2026-07-22 18:02:22.854
cmrwed60o000yn301p131y200	cmrwed60g000un301vg8ksj6i	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-22	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-22 18:09:39.769	2026-07-22 18:09:39.769
cmrxga3z1001an301nax77rgi	cmp5i45nq000ap401mr5kujgq	cmp4s9cxl005gl4018m1wy6wp	243	270	\N	PERCENT	10	27	2026-07-23	AUTO	FULL	TPE	\N	Renouvellement pack · Remise perso: personnelle	admin_aurapilates_001	2026-07-23 11:51:02.557	2026-07-23 11:51:02.557
cmrxgghzc001gn3018a7qlb13	cmqnjmmn900ceod01dz6unzwp	cmp4s9cxl005gl4018m1wy6wp	243	270	\N	PERCENT	10	27	2026-07-23	AUTO	FULL	CASH	\N	Renouvellement pack · Remise perso: personnelle	admin_aurapilates_001	2026-07-23 11:56:00.648	2026-07-23 11:56:00.648
cmrxgj8lw001mn301y3uik9yc	cmqqija83000up901vbrlsocv	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-23	AUTO	FULL	TPE	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-23 11:58:08.469	2026-07-23 11:58:08.469
cmrxhbqrv001sn301and4q1vf	cmqqio1g50018p9018hz9fq36	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-23	AUTO	FULL	TPE	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-23 12:20:18.379	2026-07-23 12:20:18.379
cmrxhf4hf001yn301ntbtqntq	cmqqipr55001fp9010qryqpgy	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-23	AUTO	FULL	TPE	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-23 12:22:56.115	2026-07-23 12:22:56.115
cmrxhgxcg0024n301sj99ds5f	cmqrwntpy0016sc0146g80wvq	cmp4s9cxl005gl4018m1wy6wp	243	270	\N	PERCENT	10	27	2026-07-23	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle) · Remise perso: personnelle	admin_aurapilates_001	2026-07-23 12:24:20.176	2026-07-23 12:33:34.096
cmrxhnzkp002an30128vbn7ww	cmqrwntpy0016sc0146g80wvq	cmp4s9cxl005gl4018m1wy6wp	243	270	\N	PERCENT	10	27	2026-07-23	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle) · Remise perso: personnelle	admin_aurapilates_001	2026-07-23 12:29:49.657	2026-07-23 12:33:34.096
cmqzcie2c007emg01mv00r5zm	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	70	70	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-06-29 15:01:20.436	2026-07-23 13:07:51.568
cmqzck6vb007qmg0105yqs6p6	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	70	70	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-29 15:02:44.423	2026-07-23 13:07:51.568
cmqzckxzw007umg01i07xqpa8	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	70	70	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-06-29 15:03:19.581	2026-07-23 13:07:51.568
cmqzcnl5a0086mg01sdjkluz7	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	70	70	\N	\N	\N	0	2026-06-29	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-06-29 15:05:22.894	2026-07-23 13:07:51.568
cmraegf4x00i9mm01n3tuto25	cmqzcgki3006umg01b9522uso	cmquqvx9k00jio701xv9bwsuw	70	70	\N	\N	\N	0	2026-07-07	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-07 08:41:15.682	2026-07-23 13:07:51.568
cmrxnq13r005un301urkt5h41	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-23	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-23 15:19:22.648	2026-07-23 15:19:22.648
cmrxnu3is0064n301o4fihmio	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-23	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-23 15:22:32.404	2026-07-23 15:22:32.404
cms35a7wo0098n3013svl7hao	cmr91dvvk00ddmm01yvoi91dd	cmr0t6kdb000mmm01e58p4sux	150	150	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-27 11:29:48.937	2026-07-27 11:29:48.937
cms35lfl5009gn301fss9xjg9	cms35lfky009cn301i7ou31cd	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 11:38:32.105	2026-07-27 11:38:32.105
cms35x3i8009on301bdthda5z	cms35x3i0009kn301kd28orpb	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 11:47:36.32	2026-07-27 11:47:36.32
cms362k9r009wn301rnav8pbw	cms362k9k009sn3012zp10a99	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 11:51:51.327	2026-07-27 11:51:51.327
cms365ess00a4n301dr4hrzw9	cms365esm00a0n3016r7lmgxk	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 11:54:04.204	2026-07-27 11:54:04.204
cms3kei3s00gqn30167fdod7s	cms3kei3j00gmn301mhqotbc4	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 18:33:03.016	2026-07-27 18:33:03.016
cms3kn6uw00h6n301iib7pl0a	cms3kn6uo00h2n301qm5snmp2	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 18:39:48.344	2026-07-27 18:39:48.344
cms3kr38c00hen301au0vbci1	cms3kr38500han30115yyomyb	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 18:42:50.269	2026-07-27 18:42:50.269
cms3kuoys00hmn3015ojwtpno	cms3kuoyo00hin301dzucqsrq	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-27 18:45:38.405	2026-07-27 18:45:38.405
cms3l92ji00hun301kama6dmz	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-27	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-27 18:56:49.183	2026-07-27 18:56:49.183
cms4l8muc00ian3016stzufv8	cmp6n9pyb0047p401exgskztu	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-28 11:44:15.012	2026-07-28 11:44:15.012
cms4l9kx200ign30199w5f5pg	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-28 11:44:59.175	2026-07-28 11:44:59.175
cmrxup8r1006in301kc0q8ccz	cmrbunzzo000mmn01dkqpill6	cmp4slcpz005ul401m1rpf0qa	350	600	600	\N	\N	0	2026-07-23	AUTO	DEPOSIT	CASH	\N	Acompte à l'inscription	admin_aurapilates_001	2026-07-23 18:34:43.213	2026-07-27 18:48:55.031
cms3l0psj00hqn3017l4l4kqr	cmrbunzzo000mmn01dkqpill6	cmp4slcpz005ul401m1rpf0qa	250	600	600	\N	\N	0	2026-07-27	AUTO	BALANCE	CASH	\N	Solde pack — finalisation de l'acompte	admin_aurapilates_001	2026-07-27 18:50:19.411	2026-07-27 18:50:19.411
cms4mx5xj00iqn301rrjh43ch	cmqp4ky050002lk01gx0v2tv9	cmp4s8kui005fl40100a1ew4b	180	180	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-28 12:31:19.111	2026-07-28 12:31:19.111
cms4ok3tt00lgn301ee01tx8q	cmqp4ky050002lk01gx0v2tv9	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Renouvellement pack (pack parallèle)	admin_aurapilates_001	2026-07-28 13:17:09.09	2026-07-28 13:17:09.09
cms4q1w0k00lnn301kbwafsbv	cms362k9k009sn3012zp10a99	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-28 13:58:58.388	2026-07-28 13:58:58.388
cms4q3b6q00ltn301cfsyqmgx	cmrri21yv00m2lq01gugwiiyq	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-28 14:00:04.706	2026-07-28 14:00:04.706
cms4ob1zg00kyn301ytfel5mg	cms35x3i0009kn301kd28orpb	cmp4s9cxl005gl4018m1wy6wp	270	270	\N	\N	\N	0	2026-07-28	AUTO	FULL	TPE	\N	Renouvellement pack	admin_aurapilates_001	2026-07-28 13:10:06.797	2026-07-28 14:10:07.965
cms4v82lg000rml01zjotgit8	cms4v82l8000nml0184j2mtyd	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-28 16:23:44.932	2026-07-28 16:23:44.932
cms4vgzy8000zml0126ugsl3x	cms4vgzxz000vml01z4j4yu76	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-28	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-28 16:30:41.409	2026-07-28 16:30:41.409
cms60d2em000xk101ogtyafxm	cmqnlllpk00csod01wkefk1ot	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-29	AUTO	FULL	TPE	\N	Renouvellement pack	admin_aurapilates_001	2026-07-29 11:35:22.222	2026-07-29 11:35:22.222
cmrdak4v80030mn017m9d5kd8	cmrdak4v0002wmn01j2my021k	cmp4sixhw005ol401euqmhrwh	250	250	\N	\N	\N	0	2026-07-09	AUTO	FULL	CASH	\N	Création adhérente	admin_aurapilates_001	2026-07-09 09:15:29.06	2026-07-29 14:24:21.187
cms6bk9za000jmo01tdep2ncd	cms3kuoyo00hin301dzucqsrq	cmp4t00w6005xl401jv0qklyp	25	25	\N	\N	\N	0	2026-07-29	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-29 16:48:54.407	2026-07-29 16:48:54.407
cms6byvws000pmo01d0dzojmz	cmqnjvfwv00clod01smhvf5v7	cmp4s9cxl005gl4018m1wy6wp	243	270	\N	PERCENT	10	27	2026-07-29	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-29 17:00:16.012	2026-07-29 17:00:16.012
cms6dh31p000vmo01rjnfos2m	cmqnlllpk00csod01wkefk1ot	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-29	AUTO	FULL	TPE	\N	Renouvellement pack	admin_aurapilates_001	2026-07-29 17:42:24.685	2026-07-29 17:42:24.685
cms6ecfs90019mo01wv9t96ur	cmqw8ec6p0010mg01ce7hdn33	cmp4sadgq005hl4016z9eqilf	380	380	\N	\N	\N	0	2026-07-29	AUTO	FULL	TPE	\N	Renouvellement pack	admin_aurapilates_001	2026-07-29 18:06:47.53	2026-07-29 18:06:47.53
cms6eddxk001dmo01l5oqba3x	cmqp3jmsv00euod010vtuk1qt	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-29	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-29 18:07:31.784	2026-07-29 18:07:31.784
cms7j7fds004lmo01382i8rhe	cmrf1usfb00lkmn01msecwoo3	cmp4s6te2005el4011ra2qxrl	40	40	\N	\N	\N	0	2026-07-30	AUTO	FULL	CASH	\N	Renouvellement pack	admin_aurapilates_001	2026-07-30 13:10:37.985	2026-07-30 13:10:37.985
\.


--
-- Data for Name: pack_promotion_packs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pack_promotion_packs ("promotionId", "packId", "createdAt") FROM stdin;
\.


--
-- Data for Name: pack_promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pack_promotions (id, label, "appliesToAll", "discountType", "discountValue", "startsAt", "endsAt", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: packs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.packs (id, category, name, description, "sessionCount", "priceCents", "durationDays", "isActive", "createdAt", "updatedAt") FROM stdin;
cmp4s8kui005fl40100a1ew4b	Pilates reformer	AURA START	\N	5	180	40 jours	t	2026-05-13 23:01:02.73	2026-05-13 23:01:02.73
cmp4s9cxl005gl4018m1wy6wp	Pilates reformer	AURA FLOW	\N	8	270	2 mois	t	2026-05-13 23:01:39.129	2026-05-13 23:01:39.129
cmp4sadgq005hl4016z9eqilf	Pilates reformer	AURA GLOW	\N	12	380	3 mois	t	2026-05-13 23:02:26.475	2026-05-13 23:02:26.475
cmp4sbkj5005il4015b2x78mh	Pilates reformer	AURA BALANCE	\N	16	480	4 mois	t	2026-05-13 23:03:22.289	2026-05-13 23:03:22.289
cmp4scs0q005jl401azkonj0y	Pilates reformer	AURA PRESTIGE	\N	24	650	5 mois	t	2026-05-13 23:04:18.642	2026-05-13 23:04:18.642
cmp4sejni005kl4013ure33mc	Pilates reformer	AURA INFINITY	\N	50	1200	12 mois	t	2026-05-13 23:05:41.118	2026-05-13 23:05:41.118
cmp4skb22005rl4014f0e7wgs	Pilates reformer + Mat pilates	AURA HARMONY	\N	\N	450	3 mois	t	2026-05-13 23:10:09.908	2026-05-13 23:10:09.908
cmp4slcpz005ul401m1rpf0qa	Pilates reformer + Mat pilates	AURA SCULPT	\N	\N	600	4 mois	t	2026-05-13 23:10:58.727	2026-05-13 23:10:58.727
cmp4t4k5c005yl401cme1vz52	Mat pilates	AURA PURE	\N	8	150	1 mois	t	2026-05-13 23:25:54.816	2026-05-13 23:25:54.816
cmp4t5amk005zl4014v76r8bk	Mat pilates	AURA GRACE	\N	12	190	2 mois	t	2026-05-13 23:26:29.132	2026-05-13 23:26:29.132
cmp4t675t0060l401gkwtvv3h	Mat pilates	AURA SIGNATURE	\N	24	320	3 mois	t	2026-05-13 23:27:11.297	2026-05-13 23:27:11.297
cmp4s6te2005el4011ra2qxrl	Pilates reformer	AURA UNIQUE REFORMER	\N	1	40	30 jours	t	2026-05-13 22:59:40.49	2026-05-13 23:31:40.216
cmp4t00w6005xl401jv0qklyp	Mat pilates	AURA UNIQUE MAT	\N	1	25	15 jours	t	2026-05-13 23:22:23.231	2026-05-13 23:34:25.811
cmp7dq3qu006ap401css8pocn	Mat pilates	AURA ÉLITE	\N	36	450	4 mois	t	2026-05-15 18:38:04.662	2026-05-15 18:38:04.662
cmp4sixhw005ol401euqmhrwh	Pilates reformer + Mat pilates	FUSION	\N	\N	250	2 mois	t	2026-05-13 23:09:05.684	2026-06-30 15:34:25.077
cmr0t6kdb000mmm01e58p4sux	Pilates reformer + Mat pilates	ETUDIANTES	\N	\N	150	2 mois	t	2026-06-30 15:35:48.375	2026-06-30 15:35:48.375
cmqur0gkm00jko7014ajnmg2a	Coaching privé	AURA EXCELLENCE	\N	10	700	2 mois	t	2026-06-26 09:48:27.238	2026-07-21 09:25:35.343
cmquqyrtu00jjo701tf86l809	Coaching privé	AURA PRIVILEGE	\N	5	360	40 jours	t	2026-06-26 09:47:08.507	2026-07-21 09:26:06.092
cmquqvx9k00jio701xv9bwsuw	Coaching privé	AURA UNIQUE PRIVE	\N	1	75	40 jours	t	2026-06-26 09:44:55.592	2026-07-21 09:26:14.378
\.


--
-- Data for Name: planning; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planning (id, "courseSlug", "coachId", "dayOfWeek", "anchorSessionYmd", level, "bookingWindow", "startTime", "endTime", "durationMinutes", capacity, "waitlistCapacity", "isDraft", "createdAt", "updatedAt", "draftSourceId") FROM stdin;
cms2x50hp007mn3013v52goia	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-08-05	BEGINNER	WEEKLY	17:00	18:00	50	6	2	t	2026-07-27 07:41:49.118	2026-07-27 07:41:49.118	cmrt646oy00mklq01woumqdb3
cms2x50i0007nn301qwy3caoa	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-08-05	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	t	2026-07-27 07:41:49.128	2026-07-27 07:41:49.128	cmrt646p400mllq01dz1vl45e
cms2x50i3007on301bi2xp7c9	coaching-prive	cmq40bvbx0005wmkonbu4odyv	THU	2026-08-06	\N	WEEKLY	16:00	17:00	50	6	2	t	2026-07-27 07:41:49.132	2026-07-27 07:41:49.132	cmrt646p800mmlq01pjo2y9i8
cms2x50ic007pn301r91f6ia9	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-08-03	\N	WEEKLY	08:00	09:00	50	1	0	t	2026-07-27 07:41:49.141	2026-07-27 07:41:49.141	cmrt646pc00mnlq017xis6rzf
cms2x50il007qn301i26dl9am	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-09	\N	WEEKLY	08:00	09:00	50	6	2	t	2026-07-27 07:41:49.15	2026-07-27 07:41:49.15	cmrt646pf00molq0119rle7ly
cms2x50iu007sn301d4xpg7ve	mat-pilates	cmq407j3i0002wmko2bzj8hjy	MON	2026-08-03	\N	WEEKLY	10:00	11:00	50	6	2	t	2026-07-27 07:41:49.158	2026-07-27 07:41:49.158	cmrt646pm00mqlq01cvviopma
cms2x50j5007tn3012ab3efh8	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-08-04	BEGINNER	WEEKLY	20:00	21:00	50	6	2	t	2026-07-27 07:41:49.169	2026-07-27 07:41:49.169	cmrt646pp00mrlq01tm5scppj
cms2x50ja007un30119e2mhn4	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-08-05	INTERMEDIATE	WEEKLY	19:00	20:00	50	6	2	t	2026-07-27 07:41:49.174	2026-07-27 07:41:49.174	cmrt646ps00mslq01wu9xrxm6
cms2x50jg007vn301woqs9uho	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-08-05	BEGINNER	WEEKLY	20:00	21:00	50	6	2	t	2026-07-27 07:41:49.181	2026-07-27 07:41:49.181	cmrt646pv00mtlq01e9o4srjr
cms2x50jl007wn301iaeh7vcf	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-08-06	BEGINNER	WEEKLY	11:00	12:00	50	6	2	t	2026-07-27 07:41:49.185	2026-07-27 07:41:49.185	cmrt646q300mulq0117pev09h
cms2x50jr007xn3013igjujoh	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-08-06	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	t	2026-07-27 07:41:49.191	2026-07-27 07:41:49.191	cmrt646q700mvlq01qbcsvueh
cms2x50jx007yn301dhq42taj	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-08-06	BEGINNER	WEEKLY	17:30	18:30	50	6	2	t	2026-07-27 07:41:49.198	2026-07-27 07:41:49.198	cmrt646qb00mwlq01wcfgcx1t
cms2x50k1007zn301au1tx509	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-08-06	\N	WEEKLY	18:00	19:00	50	6	2	t	2026-07-27 07:41:49.202	2026-07-27 07:41:49.202	cmrt646qf00mxlq013jxxqu4r
cmrt646oy00mklq01woumqdb3	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-29	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-07-20 11:55:25.282	2026-07-27 03:56:52.019	cmrix5g2200mzmn01zn08uvd2
cmrt646p400mllq01dz1vl45e	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-29	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-07-20 11:55:25.288	2026-07-27 03:56:52.019	cmrix5g2b00n0mn01v41bgdl4
cmrt646p800mmlq01pjo2y9i8	coaching-prive	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-30	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-20 11:55:25.292	2026-07-27 03:56:52.019	cmrix5g6l00o5mn01j8iuyonl
cmrt646pc00mnlq017xis6rzf	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-27	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-20 11:55:25.297	2026-07-27 03:56:52.019	cmrix5g6o00o6mn010gbfohtx
cmrt646pf00molq0119rle7ly	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-02	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-20 11:55:25.3	2026-07-27 03:56:52.019	cmrix5g6u00o8mn01g9smohii
cms2x50ip007rn301clazpy05	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-08-05	ALL_LEVELS	WEEKLY	15:00	16:00	50	6	2	t	2026-07-27 07:41:49.153	2026-07-29 11:00:26.636	cmrt646pj00mplq0171dhmv07
cmrt646pm00mqlq01cvviopma	mat-pilates	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-27	\N	WEEKLY	10:00	11:00	50	6	2	f	2026-07-20 11:55:25.307	2026-07-27 03:56:52.019	cmrix5g4t00nmmn01g87uvzzp
cmrt646pp00mrlq01tm5scppj	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-28	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-07-20 11:55:25.31	2026-07-27 03:56:52.019	cmrkiw4m0000ulq01k7ohqj0r
cmrt646ps00mslq01wu9xrxm6	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-29	INTERMEDIATE	WEEKLY	19:00	20:00	50	6	2	f	2026-07-20 11:55:25.313	2026-07-27 03:56:52.019	cmrix5g2f00n1mn0185zxtut4
cmrt646pv00mtlq01e9o4srjr	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-29	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-07-20 11:55:25.316	2026-07-27 03:56:52.019	cmrix5g2h00n2mn01o5xhtqm7
cmrt646q300mulq0117pev09h	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-30	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-07-20 11:55:25.324	2026-07-27 03:56:52.019	cmrix5g2k00n3mn010quiz7nx
cmrt646q700mvlq01qbcsvueh	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-30	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-07-20 11:55:25.327	2026-07-27 03:56:52.019	cmrix5g2n00n4mn013270gc7s
cmrt646qb00mwlq01wcfgcx1t	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-30	BEGINNER	WEEKLY	17:30	18:30	50	6	2	f	2026-07-20 11:55:25.331	2026-07-27 03:56:52.019	cmrix5g2q00n5mn01trk8ai08
cmrt646qf00mxlq013jxxqu4r	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-30	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-07-20 11:55:25.336	2026-07-27 03:56:52.019	cmrix5g2t00n6mn01k2bl15j2
cms2x50k90082n301debzllma	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-08-06	BEGINNER	WEEKLY	18:30	19:30	50	6	2	t	2026-07-27 07:41:49.21	2026-07-27 07:41:49.21	cmrt646ql00mylq01hei3u277
cms2x50kc0083n301nouvpcpo	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-08-07	BEGINNER	WEEKLY	10:00	11:00	50	6	2	t	2026-07-27 07:41:49.212	2026-07-27 07:41:49.212	cmrt646r700n0lq01uzun2f3f
cms2x50ke0084n301oem94dw4	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-08-07	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	t	2026-07-27 07:41:49.214	2026-07-27 07:41:49.214	cmrt646rc00n1lq01akqsjski
cms2x50kg0085n301098zkqbr	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-08-07	\N	WEEKLY	16:00	17:00	50	6	2	t	2026-07-27 07:41:49.217	2026-07-27 07:41:49.217	cmrt646rg00n2lq01bw7swcpv
cms2x50kl0087n301555h17ax	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-08-07	BEGINNER	WEEKLY	17:00	18:00	50	6	2	t	2026-07-27 07:41:49.221	2026-07-27 07:41:49.221	cmrt646rk00n3lq01bv1j5yfk
cms2x50kn0088n3012ei2zd23	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-08-07	BEGINNER	WEEKLY	18:00	19:00	50	6	2	t	2026-07-27 07:41:49.223	2026-07-27 07:41:49.223	cmrt646ro00n4lq01m7tbywnp
cms2x50kp0089n3014wgfww9b	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-08-07	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	t	2026-07-27 07:41:49.225	2026-07-27 07:41:49.225	cmrt646rr00n5lq01tkltjmli
cms2x50kr008an301bee2cecp	yoga	cmql83ep6000cod017esn6v7r	SAT	2026-08-08	\N	WEEKLY	09:00	10:00	50	6	2	t	2026-07-27 07:41:49.227	2026-07-27 07:41:49.227	cmrt646ru00n6lq01ubdc1itd
cms2x50kt008bn301nimue1jd	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-08-08	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	t	2026-07-27 07:41:49.229	2026-07-27 07:41:49.229	cmrt646s000n7lq01fy1wxihf
cms2x50kv008cn3013mgcplhy	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-08-08	BEGINNER	WEEKLY	11:15	12:15	50	6	2	t	2026-07-27 07:41:49.231	2026-07-27 07:41:49.231	cmrt646s500n8lq01mj5qeqpn
cms2x50k50080n301bidf7gun	mat-pilates	cmq407j3i0002wmko2bzj8hjy	FRI	2026-08-07	BEGINNER	WEEKLY	09:00	10:00	50	1	0	t	2026-07-27 07:41:49.205	2026-07-29 10:57:03.455	cmrt646qy00mzlq01xny0bg5e
cmrt646pj00mplq0171dhmv07	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-29	ALL_LEVELS	WEEKLY	15:00	16:00	50	6	2	f	2026-07-20 11:55:25.304	2026-07-29 11:00:26.626	cmrix5g6y00o9mn015gq3v78v
cms2x50kx008dn301vigpb2fi	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-09	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	t	2026-07-27 07:41:49.233	2026-07-27 07:41:49.233	cmrt646sb00n9lq016qr9l6xh
cms2x50l1008fn301ttz8fhca	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-09	\N	WEEKLY	11:00	12:00	50	6	2	t	2026-07-27 07:41:49.237	2026-07-27 07:41:49.237	cmrt646sj00nblq015owj98m0
cms2x50l3008gn301ndsgz82b	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-08-03	BEGINNER	WEEKLY	18:00	19:00	50	6	2	t	2026-07-27 07:41:49.24	2026-07-27 07:41:49.24	cmrt646sn00nclq01tp2531mh
cms2x50l7008hn301z9ungkpy	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-08-03	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	t	2026-07-27 07:41:49.243	2026-07-27 07:41:49.243	cmrt646sq00ndlq016h4ggo4t
cms2x50lc008jn301fgx8fmcn	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-08-04	BEGINNER	WEEKLY	10:00	11:00	50	6	2	t	2026-07-27 07:41:49.249	2026-07-27 07:41:49.249	cmrt646t200nglq011fg40dno
cms2x50lf008kn3017egvu1i1	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-08-04	\N	WEEKLY	16:00	17:00	50	6	2	t	2026-07-27 07:41:49.251	2026-07-27 07:41:49.251	cmrt646t800nhlq01y7vjtyig
cms2x50lh008ln301qbv46f8y	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-08-04	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	t	2026-07-27 07:41:49.253	2026-07-27 07:41:49.253	cmrt646tf00nilq01uijk7vbb
cms2x50lm008nn301cbgvsyt9	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-08-04	BEGINNER	WEEKLY	19:00	20:00	50	6	2	t	2026-07-27 07:41:49.258	2026-07-27 07:41:49.258	cmrt646tm00nklq01aidpf9xo
cms2x50lq008pn3010rtbuowg	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-08-05	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	t	2026-07-27 07:41:49.262	2026-07-27 07:41:49.262	cmrt646ts00nmlq01m4hlhyrc
cms2x50ls008qn301uluq87z4	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-08-05	BEGINNER	WEEKLY	11:00	12:00	50	6	2	t	2026-07-27 07:41:49.265	2026-07-27 07:41:49.265	cmrt646tu00nnlq01orfp75rn
cms2x50lx008sn301lt3yuhxw	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-08-03	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	t	2026-07-27 07:41:49.269	2026-07-27 07:41:49.269	cmrt646u000nplq01at0yofsd
cms2x50lz008tn301t9xhtj31	coaching-prive	cmq40bvbx0005wmkonbu4odyv	MON	2026-08-03	\N	WEEKLY	17:00	18:00	50	6	2	t	2026-07-27 07:41:49.271	2026-07-27 07:41:49.271	cmrt646u300nqlq01pv821bjr
cms2x50kz008en301f11ult9v	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-09	BEGINNER	WEEKLY	10:00	11:00	50	6	2	t	2026-07-27 07:41:49.235	2026-07-28 13:44:43.317	cmrt646sg00nalq01q9zyqgv7
cms2x50mc008xn30126k9hs3e	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-08-03	\N	WEEKLY	09:00	10:00	50	6	2	t	2026-07-27 07:41:49.285	2026-07-29 10:53:29.025	cmrt646ui00nvlq01x072hoir
cms2x50m1008un3012su3wnm7	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-08-03	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	t	2026-07-27 07:41:49.273	2026-07-29 10:53:50.656	cmrt646u900nslq017ccminqk
cms2x50mh008zn3011rqd9hje	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-08-04	\N	WEEKLY	08:00	09:00	50	6	2	t	2026-07-27 07:41:49.289	2026-07-29 10:54:17.153	cmrt646su00nelq0150zcxivb
cms2x50la008in3015mll8uz8	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-08-04	\N	WEEKLY	09:00	10:00	50	1	0	t	2026-07-27 07:41:49.246	2026-07-29 10:54:31.996	cmrt646sx00nflq01ux2slx5l
cms2x50m4008vn301nqby2n5e	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-08-04	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	t	2026-07-27 07:41:49.277	2026-07-29 10:54:56.383	cmrt646ud00ntlq01qxuz53eg
cms2x50mj0090n3010sj71ejs	sans-cours	cmq407j3i0002wmko2bzj8hjy	WED	2026-08-05	\N	WEEKLY	08:00	09:00	50	1	0	t	2026-07-27 07:41:49.291	2026-07-29 10:55:25.881	cmrt646u600nrlq01r292s1y6
cms2x50lo008on301bthsjrpj	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-08-05	\N	WEEKLY	09:00	10:00	50	6	2	t	2026-07-27 07:41:49.26	2026-07-29 10:55:45.021	cmrt646tp00nllq01wb0f586b
cmrt646qy00mzlq01xny0bg5e	mat-pilates	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-31	BEGINNER	WEEKLY	09:00	10:00	50	1	0	f	2026-07-20 11:55:25.355	2026-07-29 10:57:03.442	cmrix5g3200n9mn01rq7lk2vl
cms2x50m9008wn301q2u7oysv	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-08-04	BEGINNER	WEEKLY	15:00	16:00	50	6	2	t	2026-07-27 07:41:49.282	2026-07-29 10:59:13.958	cmrt646uf00nulq0145dvchqs
cms2x50lv008rn3016hg9ri51	mat-pilates	cmq40bvbx0005wmkonbu4odyv	WED	2026-08-05	BEGINNER	WEEKLY	16:00	17:00	50	6	2	t	2026-07-27 07:41:49.267	2026-07-29 11:00:55.797	cmrt646tx00nolq01k7yci8xd
cms2x50lj008mn301l4ickhb7	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-08-04	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	t	2026-07-27 07:41:49.256	2026-07-29 11:14:25.373	cmrt646tj00njlq01sc8ry7bp
cmruedfem00y8lq01ymu9agj8	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-16	\N	WEEKLY	19:00	20:00	50	6	2	f	2026-07-21 08:34:19.582	2026-07-27 03:56:52.019	\N
cmrueex9t00yelq0136on4oga	sans-cours	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-17	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-21 08:35:29.393	2026-07-27 03:56:52.019	\N
cmruefv3900yglq0112t7ahz4	sans-cours	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-10	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-21 08:36:13.221	2026-07-27 03:56:52.019	\N
cmrueh28900yilq0176h8dcs0	sans-cours	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-03	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-21 08:37:09.129	2026-07-27 03:56:52.019	\N
cmraj7iyb00k7mm01gvqv0r1e	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-06	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-07 10:54:18.803	2026-07-27 03:56:52.019	\N
cmraj83te00kamm01ypy92k41	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-06	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-07 10:54:45.842	2026-07-27 03:56:52.019	\N
cmr0lf2re000hpn01987ij19o	coaching-prive	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-07	\N	WEEKLY	09:00	10:00	50	1	0	f	2026-06-30 11:58:28.538	2026-07-27 03:56:52.019	cmqzb4q3d0045mg013g2z9beb
cmr0lf2rh000ipn01hpostdo9	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-07	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-30 11:58:28.541	2026-07-27 03:56:52.019	cmqzb5nyr0047mg01plloupsf
cmr0lf2rj000jpn01fw1phoju	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-07	INTERMEDIATE	WEEKLY	11:00	12:00	50	6	2	f	2026-06-30 11:58:28.544	2026-07-27 03:56:52.019	cmqzb68lc0049mg01yfgjbky0
cmr0lf2rm000kpn01905nx70m	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-07	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-30 11:58:28.546	2026-07-27 03:56:52.019	cmqzb7ybi004bmg010yvyjm53
cmr0lf2rp000lpn018lqbrm9x	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-07	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-30 11:58:28.549	2026-07-27 03:56:52.019	cmqzb8v2z004dmg01zbaatlac
cmr0lf2rs000mpn01i367mfch	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-07	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-30 11:58:28.552	2026-07-27 03:56:52.019	cmqzb9g51004fmg014z0v1i91
cmr0lf2ru000npn01m8kg1lra	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-07	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-30 11:58:28.555	2026-07-27 03:56:52.019	cmqzba3hr004hmg01l9mur8kl
cmrajn85l00kqmm01m555nlj3	coaching-prive	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-09	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-07 11:06:31.305	2026-07-27 03:56:52.019	\N
cmrix5g2n00n4mn013270gc7s	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-23	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-07-13 07:46:45.792	2026-07-27 03:56:52.019	cmr908vy000bsmm01tf9coigv
cmrix5g2q00n5mn01trk8ai08	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-23	BEGINNER	WEEKLY	17:30	18:30	50	6	2	f	2026-07-13 07:46:45.795	2026-07-27 03:56:52.019	cmr908vy900bumm01pqov4lss
cmrix5g2t00n6mn01k2bl15j2	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-23	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-07-13 07:46:45.797	2026-07-27 03:56:52.019	cmr908vyc00bvmm0116gg4fvm
cmrix5g2x00n7mn010nwkr2m6	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-23	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-07-13 07:46:45.801	2026-07-27 03:56:52.019	cmr908vyh00bwmm01ujirtt96
cmrajji4e00klmm01fj92to24	coaching-prive	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-14	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-07 11:03:37.599	2026-07-27 03:56:52.019	cmrajji4200kkmm01h02ao1fi
cmqsadiz800gzo701p5hbx0qh	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-26	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-24 16:27:11.06	2026-07-27 03:56:52.019	\N
cmqmx8m7y009iod01ycnnzwye	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-15	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 22:20:36.094	2026-07-27 03:56:52.019	\N
cmqmx9vfm009kod0104v54ivc	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-15	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 22:21:34.691	2026-07-27 03:56:52.019	\N
cmqmypic400agod01jctx3ywi	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-17	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 23:01:43.828	2026-07-27 03:56:52.019	\N
cmqzb4q3d0045mg013g2z9beb	coaching-prive	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-30	\N	WEEKLY	09:00	10:00	50	1	0	f	2026-06-29 14:22:43.226	2026-07-27 03:56:52.019	\N
cmr0lf2tk0016pn01axfzptwh	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-10	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-30 11:58:28.616	2026-07-27 03:56:52.019	cmqzbrqdd005jmg01lsrfq98k
cmr0lf2tn0017pn01ho4c6bvd	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-10	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-30 11:58:28.62	2026-07-27 03:56:52.019	cmqzbsa16005lmg01x3a4jtxl
cmr0lf2tr0018pn01qs0gu3me	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-10	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-30 11:58:28.623	2026-07-27 03:56:52.019	cmqzbsw1n005nmg01p1ci3ppa
cmr0lf2tu0019pn01zy6xx5ro	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-10	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-30 11:58:28.626	2026-07-27 03:56:52.019	cmqzbtc06005pmg01s13z6jmi
cmr0lf2tx001apn01dj916ttz	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-10	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-30 11:58:28.629	2026-07-27 03:56:52.019	cmqzbttac005rmg01g4u63y8s
cmr0lf2u0001bpn01lh3x4bs9	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-10	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-30 11:58:28.632	2026-07-27 03:56:52.019	cmqzbu918005tmg01vn3qffxk
cmr0lf2u4001cpn015p2kghiw	yoga	cmql83ep6000cod017esn6v7r	SAT	2026-07-11	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-30 11:58:28.636	2026-07-27 03:56:52.019	cmqzbv3yl005vmg01yavh0pvf
cmr0lf2u8001dpn01nnmoadgo	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-07-11	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-30 11:58:28.64	2026-07-27 03:56:52.019	cmqzbvm2w005xmg01sausgthh
cmrix5g3200n9mn01rq7lk2vl	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-24	BEGINNER	WEEKLY	09:00	10:00	50	1	0	f	2026-07-13 07:46:45.806	2026-07-27 03:56:52.019	cmr908vyn00bymm01jorz7q4v
cmrix5g3500namn01d6q34xfu	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-24	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-13 07:46:45.809	2026-07-27 03:56:52.019	cmr908vz200c0mm01wyn8lpeo
cmrix5g3700nbmn01utknxxky	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-24	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-07-13 07:46:45.812	2026-07-27 03:56:52.019	cmr908vz600c1mm01l0z41ey8
cmrix5g3a00ncmn018gebhfc1	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-24	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-13 07:46:45.814	2026-07-27 03:56:52.019	cmr908vz900c2mm01mn2vtqqd
cmrix5g3c00ndmn01mqlcrazs	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-24	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-07-13 07:46:45.817	2026-07-27 03:56:52.019	cmr908vzc00c3mm01yvcfqr8h
cms3h0x0a00bcn301sbprbh9i	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-23	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-07-27 16:58:30.298	2026-07-27 16:58:30.298	\N
cmrueiugk00yklq014e4kvo2m	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-24	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-21 08:38:32.373	2026-07-30 11:05:35.496	\N
cms2x50kj0086n3012lpgrxj4	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-08-07	\N	WEEKLY	08:00	09:00	50	6	2	t	2026-07-27 07:41:49.219	2026-07-29 10:56:26.088	cmrueiugt00yllq01e079kitt
cmrkiw4lc000tlq010dy0t6kq	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-14	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-07-14 10:43:08.736	2026-07-27 03:56:52.019	\N
cmr908vy000bsmm01tf9coigv	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-16	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-07-06 09:15:43.416	2026-07-27 03:56:52.019	cmr0lf2sw000ypn01loydepqu
cmrix5g5700nqmn0194rr3fv0	coaching-prive	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-21	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-13 07:46:45.883	2026-07-27 03:56:52.019	cmr908w1000clmm01uopzmbur
cmraj83ts00kbmm01qyxmsasf	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-13	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-07-07 10:54:45.856	2026-07-27 03:56:52.019	cmraj83te00kamm01ypy92k41
cmrix5g3l00nemn01nkgvmio8	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-24	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-13 07:46:45.825	2026-07-27 03:56:52.019	cmr908vze00c4mm01ubuybd8c
cmrix5g3q00nfmn015smlq1xu	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-24	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-07-13 07:46:45.831	2026-07-27 03:56:52.019	cmr908vzh00c5mm01jirbu4v2
cmrix5g3x00ngmn016ou822xw	yoga	cmql83ep6000cod017esn6v7r	SAT	2026-07-25	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-13 07:46:45.837	2026-07-27 03:56:52.019	cmr908vzk00c6mm01mr2ask9z
cmrix5g4000nhmn01u5fccimi	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-07-25	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-07-13 07:46:45.84	2026-07-27 03:56:52.019	cmr908vzo00c7mm01mh3cyc0p
cmrix5g4300nimn01y497k43n	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-07-25	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-07-13 07:46:45.843	2026-07-27 03:56:52.019	cmr908vzv00c8mm01xqo4398r
cmrix5g4700njmn01bwfs64se	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-26	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-07-13 07:46:45.847	2026-07-27 03:56:52.019	cmr908w0000c9mm01mtivvn2w
cmrix5g4a00nkmn01yk5dazn9	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-26	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-13 07:46:45.851	2026-07-27 03:56:52.019	cmr908w0500camm01ugf8l6df
cmrix5g4i00nlmn01csonnu9x	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-26	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-07-13 07:46:45.858	2026-07-27 03:56:52.019	cmr908w0a00cbmm01mcln1o2j
cmrix5g5100nomn010vza0qy5	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-20	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-13 07:46:45.878	2026-07-27 03:56:52.019	cmr908w0v00cjmm01zqnivmco
cmrix5g5400npmn01vxhayl3g	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-20	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-07-13 07:46:45.881	2026-07-27 03:56:52.019	cmr908w0y00ckmm011t7a402x
cmrix5g5a00nrmn01ycpuwb0d	coaching-prive	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-21	\N	WEEKLY	09:00	10:00	50	1	0	f	2026-07-13 07:46:45.886	2026-07-27 03:56:52.019	cmr908w1300cmmm0155c5onnh
cmrix5g5f00nsmn01ngqh0zx6	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-21	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-13 07:46:45.891	2026-07-27 03:56:52.019	cmr908w1500cnmm011dy7ckbg
cmrix5g5n00numn018rt26jt5	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-21	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-13 07:46:45.899	2026-07-27 03:56:52.019	cmr908w1a00cpmm01ih7e2u1j
cmrix5g5p00nvmn013lr7rusv	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-21	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-07-13 07:46:45.902	2026-07-27 03:56:52.019	cmr908w1d00cqmm015uw0f0fs
cmrix5g5s00nwmn014zjhvdkz	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-21	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-13 07:46:45.905	2026-07-27 03:56:52.019	cmr908w1g00crmm01psu6zflu
cmrix5g5v00nxmn01ay3ifpnw	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-21	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-07-13 07:46:45.907	2026-07-27 03:56:52.019	cmr908w1j00csmm01mge40q7b
cmrix5g5z00nymn01wf7vhgh9	mat-pilates	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-22	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-13 07:46:45.911	2026-07-27 03:56:52.019	cmr908w1o00cumm014gw9e9a3
cmq9i70e1002jwmysf7i38sbe	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-05-26	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-11 12:58:26.617	2026-07-27 03:56:52.019	\N
cmrix5g6j00o4mn01cwwkhd5f	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-22	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-13 07:46:45.931	2026-07-27 03:56:52.019	cmr908w1m00ctmm01wmvg9qmz
cmrix5g6300nzmn016so9a0e3	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-22	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-07-13 07:46:45.915	2026-07-27 03:56:52.019	cmr908w1r00cvmm01s5ud3j1n
cmrix5g6600o0mn01teqmhwe7	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-22	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-07-13 07:46:45.919	2026-07-27 03:56:52.019	cmr908w1u00cwmm01xajpas8u
cmrix5g6a00o1mn0150au9f9m	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-22	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-07-13 07:46:45.922	2026-07-27 03:56:52.019	cmr908w1x00cxmm01zrwzqnwz
cmrix5g6e00o2mn018y4e1pf0	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-20	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-07-13 07:46:45.926	2026-07-27 03:56:52.019	cmr908w0q00chmm01rfd4xxra
cmrix5g6g00o3mn01hdoi98nv	coaching-prive	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-20	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-07-13 07:46:45.929	2026-07-27 03:56:52.019	cmr908w0t00cimm01dqefnx05
cmrix5g4y00nnmn013oe4wyji	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-20	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-07-13 07:46:45.875	2026-07-27 03:56:52.019	cmr908w0o00cgmm0112vpuf89
cmrix5g5j00ntmn01jt2s3a1b	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-21	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-07-13 07:46:45.896	2026-07-27 03:56:52.019	cmr908w1800comm01l62vebvw
cmrix5g7100oamn01jpgzzoxz	coaching-prive	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-21	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-13 07:46:45.95	2026-07-27 03:56:52.019	cmrajji4e00klmm01fj92to24
cmrix5g6r00o7mn01wppxx1xl	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-20	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-07-13 07:46:45.94	2026-07-27 03:56:52.019	cmraj83ts00kbmm01qyxmsasf
cmrix5g7400obmn01995qg1pf	coaching-prive	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-23	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-13 07:46:45.953	2026-07-27 03:56:52.019	cmrajn85w00krmm01ek4beq4i
cmr0lf2qz000cpn016p7qcx7z	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-06	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-30 11:58:28.523	2026-07-27 03:56:52.019	cmqzawpbl003vmg017wfvylhl
cmr0lf2r2000dpn01uv7pvl3x	coaching-prive	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-06	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-06-30 11:58:28.527	2026-07-27 03:56:52.019	cmqzax7e1003xmg01mdcxle0s
cmr0lf2rx000opn01j5yjfv6p	sans-cours	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-08	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-06-30 11:58:28.557	2026-07-27 03:56:52.019	cmqzbb1ri004jmg016sdmj53b
cmrajtzh400kumm01ohn7wbor	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-09	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-07-07 11:11:46.649	2026-07-27 03:56:52.019	\N
cmr0lf2s0000ppn01yy85vtr2	mat-pilates	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-08	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-30 11:58:28.56	2026-07-27 03:56:52.019	cmqzbbxfq004lmg01ab9yig6w
cmr0lf2s3000qpn013kdvbhh8	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-08	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-30 11:58:28.564	2026-07-27 03:56:52.019	cmqzbgr3k004nmg01j97fznwu
cmr0lf2s6000rpn013e5f88dk	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-08	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-30 11:58:28.566	2026-07-27 03:56:52.019	cmqzbhbhv004pmg010mnvuaem
cmr0lf2s8000spn01sfclllrr	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-08	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-30 11:58:28.569	2026-07-27 03:56:52.019	cmqzbipqs004rmg012imxx8ci
cmqmoudyk0074od01t3pj66aj	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-08	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 18:25:35.276	2026-07-27 03:56:52.019	\N
cmrxijj23003cn301zy341lim	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-21	\N	WEEKLY	18:00	19:00	50	4	2	f	2026-07-23 12:54:21.244	2026-07-27 03:56:52.019	\N
cmrajhsik00khmm01ghpfzp9i	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-12	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-07 11:02:17.756	2026-07-27 03:56:52.019	\N
cmrajji4200kkmm01h02ao1fi	coaching-prive	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-07	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-07 11:03:37.586	2026-07-27 03:56:52.019	\N
cmr0lf2sz000zpn01vcdbfn1k	coaching-prive	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-09	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-30 11:58:28.596	2026-07-27 03:56:52.019	cmqzbnf9h0055mg01ej1yk1tr
cmqsacn6b00gxo70150y9si1o	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-26	BEGINNER	WEEKLY	11:00	12:00	50	1	0	f	2026-06-24 16:26:29.844	2026-07-27 03:56:52.019	\N
cmqzavffl003rmg01jh06614o	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-29	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-29 14:15:29.505	2026-07-27 03:56:52.019	\N
cmqzavv4x003tmg01emqe1sxn	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-29	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-29 14:15:49.857	2026-07-27 03:56:52.019	\N
cmqzawpbl003vmg017wfvylhl	coaching-prive	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-29	\N	WEEKLY	16:00	17:00	50	1	1	f	2026-06-29 14:16:28.978	2026-07-27 03:56:52.019	\N
cmqzax7e1003xmg01mdcxle0s	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-29	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-29 14:16:52.393	2026-07-27 03:56:52.019	\N
cmqzaxoid003zmg01n5umqrul	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-29	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-29 14:17:14.582	2026-07-27 03:56:52.019	\N
cmr0lf2sw000ypn01loydepqu	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-09	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-06-30 11:58:28.592	2026-07-27 03:56:52.019	cmqzbmdo40053mg01fabbc3zu
cmr0lf2t30010pn01bwtey846	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-09	BEGINNER	WEEKLY	17:30	18:30	50	6	2	f	2026-06-30 11:58:28.6	2026-07-27 03:56:52.019	cmqzbnzxw0057mg01m2o14l0o
cmr0lf2t70011pn017e89jceq	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-09	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-30 11:58:28.603	2026-07-27 03:56:52.019	cmqzbokag0059mg01kwlb280h
cmr0lf2t90012pn01klwvko87	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-09	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-06-30 11:58:28.606	2026-07-27 03:56:52.019	cmqzbp13s005bmg01hey1nfx7
cmr0lf2tc0013pn01s0pj7qeq	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-09	\N	WEEKLY	19:00	20:00	50	6	2	f	2026-06-30 11:58:28.608	2026-07-27 03:56:52.019	cmqzbpi8v005dmg01abdadn4r
cmr0lf2te0014pn010829r5ma	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-10	BEGINNER	WEEKLY	09:00	10:00	50	1	0	f	2026-06-30 11:58:28.611	2026-07-27 03:56:52.019	cmqzbqwev005hmg01ijekhjxx
cmqqzz0jb0005sc01y5vivpa4	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-22	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-23 18:48:11.639	2026-07-27 03:56:52.019	\N
cmqsaa65h00gpo701ax7nflqq	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-26	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-06-24 16:24:34.469	2026-07-27 03:56:52.019	\N
cmqsaatvn00gro701jyxz5a5o	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-26	BEGINNER	WEEKLY	09:00	10:00	50	6	2	f	2026-06-24 16:25:05.22	2026-07-27 03:56:52.019	\N
cmqsabfkk00gto70136g7cl5i	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-26	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-24 16:25:33.332	2026-07-27 03:56:52.019	\N
cmr0lf2uy001fpn011bm0do45	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-12	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-30 11:58:28.666	2026-07-27 03:56:52.019	cmqzbwwxw0061mg01qu6o8mfh
cmr0lf2v3001gpn01e0p9m4hg	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-12	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-30 11:58:28.672	2026-07-27 03:56:52.019	cmqzbxamw0063mg01z3g0846i
cmqmowvci0076od01gjeq6mc2	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-09	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 18:27:31.122	2026-07-27 03:56:52.019	\N
cms5zim1n000pk101b67059a5	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-30	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-07-29 11:11:41.34	2026-07-29 11:11:41.34	\N
cmqmoxols0078od01nvys4y9d	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-09	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 18:28:09.041	2026-07-27 03:56:52.019	\N
cmqmnwpek005yod01zw9o3vbd	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-05	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 17:59:23.804	2026-07-27 03:56:52.019	\N
cmqmnxfvz0060od01n78hetiu	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-05	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 17:59:58.128	2026-07-27 03:56:52.019	\N
cmqmnyu8n0062od01bnjo1esu	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-05	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 18:01:03.383	2026-07-27 03:56:52.019	\N
cmqmnzo9x0064od011mll6zta	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-05	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 18:01:42.309	2026-07-27 03:56:52.019	\N
cmqrxtu2w001ho701fpgerfv3	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-25	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-24 10:35:56.937	2026-07-27 03:56:52.019	\N
cmqrxucwc001jo701m5ngk3ac	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-25	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-06-24 10:36:21.324	2026-07-27 03:56:52.019	\N
cmqv0mg9q000bmg015w4z3qo0	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-25	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-26 14:17:29.823	2026-07-27 03:56:52.019	\N
cmqv0naxk000dmg01pk0odf1y	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-25	\N	WEEKLY	19:00	20:00	50	6	2	f	2026-06-26 14:18:09.56	2026-07-27 03:56:52.019	\N
cmqsafbyg00h3o701hho6wtxz	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-26	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-24 16:28:35.272	2026-07-27 03:56:52.019	\N
cmqsaebh500h1o7013z9alk6c	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-26	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-24 16:27:47.993	2026-07-27 03:56:52.019	\N
cmqsag6pq00h5o7014men1p68	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-26	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-24 16:29:15.134	2026-07-27 03:56:52.019	\N
cmqsah4mr00h7o701gjmxu85s	mat-pilates	cmql83ep6000cod017esn6v7r	SAT	2026-06-27	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-24 16:29:59.091	2026-07-27 03:56:52.019	\N
cmqsahxx500h9o701yzkspmas	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-06-27	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-24 16:30:37.05	2026-07-27 03:56:52.019	\N
cmqsaie5800hbo7015ot7sic6	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-06-27	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-06-24 16:30:58.077	2026-07-27 03:56:52.019	\N
cmqsajbd100hdo7019ez0j4qy	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-28	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-24 16:31:41.125	2026-07-27 03:56:52.019	\N
cmqsajtqe00hfo701nymfh9ne	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-28	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-24 16:32:04.935	2026-07-27 03:56:52.019	\N
cmqsakcej00hho701m260shkz	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-28	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-24 16:32:29.132	2026-07-27 03:56:52.019	\N
cmq9imrwz002xwmystj64mmgv	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-05-29	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-11 13:10:42.131	2026-07-27 03:56:52.019	\N
cmq9izzri0031wmyspn2330d4	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-05-29	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-11 13:20:58.83	2026-07-27 03:56:52.019	\N
cmqzbbxfq004lmg01ab9yig6w	mat-pilates	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-01	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-29 14:28:19.334	2026-07-27 03:56:52.019	\N
cmqzbgr3k004nmg01j97fznwu	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-01	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-29 14:32:04.4	2026-07-27 03:56:52.019	\N
cmqzbhbhv004pmg010mnvuaem	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-01	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-29 14:32:30.835	2026-07-27 03:56:52.019	\N
cmr0lf2sb000tpn01pz8eb9jd	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-08	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-30 11:58:28.571	2026-07-27 03:56:52.019	cmqzbj8gh004tmg01trtzpkn4
cmr0lf2sd000upn01jj3jcl8s	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-08	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-30 11:58:28.574	2026-07-27 03:56:52.019	cmqzbjt8e004vmg013phelgz0
cmr0lf2sg000vpn013xbcr6q5	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-08	INTERMEDIATE	WEEKLY	19:00	20:00	50	6	2	f	2026-06-30 11:58:28.576	2026-07-27 03:56:52.019	cmqzbknbz004xmg01m9lpevgu
cmr0lf2sk000wpn01pjqlqu42	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-08	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-06-30 11:58:28.581	2026-07-27 03:56:52.019	cmqzbl5hx004zmg01xgx79lhn
cmr0lf2sq000xpn01vwpfngt6	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-09	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-30 11:58:28.586	2026-07-27 03:56:52.019	cmqzbluk50051mg01cr2pwdun
cmql7shbg0007od01lgx42aq6	coaching-prive	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-01	\N	WEEKLY	09:00	10:00	50	1	\N	f	2026-06-19 17:40:26.669	2026-07-27 03:56:52.019	\N
cmq9hxe76001xwmys8qvf2i93	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-25	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 12:50:57.954	2026-07-27 03:56:52.019	\N
cmq9j6oes0033wmysrjgzykj6	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	SAT	2026-05-30	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 13:26:10.708	2026-07-27 03:56:52.019	\N
cmqmnp92u005wod01r3dnaqfx	sans-cours	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-05	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 17:53:36.055	2026-07-27 03:56:52.019	\N
cmq9j79fe0035wmysqce965s4	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	SAT	2026-05-30	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 13:26:37.946	2026-07-27 03:56:52.019	\N
cmq9j9gnv003bwmyscpctgab4	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-05-31	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 13:28:20.635	2026-07-27 03:56:52.019	\N
cmqmmp2vz004aod01988oo3q4	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-01	\N	WEEKLY	08:00	09:00	50	6	\N	f	2026-06-20 17:25:28.415	2026-07-27 03:56:52.019	\N
cmqmmrdfi004cod01wk7dyyjk	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-01	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 17:27:15.39	2026-07-27 03:56:52.019	\N
cmqmzcf9u00b8od01vzue4yz8	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-19	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 23:19:32.946	2026-07-27 03:56:52.019	\N
cmqmo0fc30066od01mjr23wg7	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-05	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 18:02:17.379	2026-07-27 03:56:52.019	\N
cmqrxvfno001lo7017g5c5k6u	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-25	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-24 10:37:11.557	2026-07-27 03:56:52.019	\N
cmqrxw40y001no701f545v9bq	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-25	BEGINNER	WEEKLY	17:30	18:30	50	6	2	f	2026-06-24 10:37:43.138	2026-07-27 03:56:52.019	\N
cmqmo1m700068od011oqh3hck	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-05	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 18:03:12.925	2026-07-27 03:56:52.019	\N
cmqmo3hvf006aod01dsqm3c30	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-05	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 18:04:40.635	2026-07-27 03:56:52.019	\N
cmqmo52dh006cod01oba3r6ut	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	SAT	2026-06-06	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 18:05:53.862	2026-07-27 03:56:52.019	\N
cmqmxi7fj009qod0105qunl7e	mat-pilates	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-15	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 22:28:03.487	2026-07-27 03:56:52.019	\N
cms5zim27000qk1011564ypmc	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-08-06	\N	WEEKLY	17:00	18:00	50	6	2	t	2026-07-29 11:11:41.36	2026-07-29 11:11:41.36	cms5zim1n000pk101b67059a5
cmrajn85w00krmm01ek4beq4i	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-16	ALL_LEVELS	WEEKLY	15:00	16:00	50	6	2	f	2026-07-07 11:06:31.316	2026-07-27 03:56:52.019	cmrajn85l00kqmm01m555nlj3
cmrt646ql00mylq01hei3u277	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-30	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-07-20 11:55:25.341	2026-07-27 03:56:52.019	cmrix5g2x00n7mn010nwkr2m6
cmrt646r700n0lq01uzun2f3f	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-31	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-20 11:55:25.363	2026-07-27 03:56:52.019	cmrix5g3500namn01d6q34xfu
cmrt646rc00n1lq01akqsjski	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-31	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-07-20 11:55:25.369	2026-07-27 03:56:52.019	cmrix5g3700nbmn01utknxxky
cmrt646rg00n2lq01bw7swcpv	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-31	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-20 11:55:25.372	2026-07-27 03:56:52.019	cmrix5g3a00ncmn018gebhfc1
cmqzb48c80043mg01yd1ldg0q	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-30	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-29 14:22:20.217	2026-07-27 03:56:52.019	\N
cmr908vy900bumm01pqov4lss	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-16	BEGINNER	WEEKLY	17:30	18:30	50	6	2	f	2026-07-06 09:15:43.425	2026-07-27 03:56:52.019	cmr0lf2t30010pn01bwtey846
cmr908vyc00bvmm0116gg4fvm	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-16	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-07-06 09:15:43.429	2026-07-27 03:56:52.019	cmr0lf2t70011pn017e89jceq
cmqmxdlzq009mod01att4rvhp	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-15	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 22:24:29.079	2026-07-27 03:56:52.019	\N
cmqmxe9mb009ood0176v8gtu3	coaching-prive	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-15	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 22:24:59.699	2026-07-27 03:56:52.019	\N
cmqmz1k0j00aiod01v1frcbrr	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-17	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 23:11:05.875	2026-07-27 03:56:52.019	\N
cmqmz2o5200akod01xuhpxo94	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-17	BEGINNER	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 23:11:57.878	2026-07-27 03:56:52.019	\N
cmqmza78n00b2od01wbrozyj1	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-18	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 23:17:49.224	2026-07-27 03:56:52.019	\N
cmqmzau0000b4od01md10weud	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-18	\N	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 23:18:18.72	2026-07-27 03:56:52.019	\N
cmqmzbt8b00b6od01w4xwbard	sans-cours	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-19	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 23:19:04.379	2026-07-27 03:56:52.019	\N
cmq9iaxpq002rwmys4kf15rcc	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-29	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 13:01:29.774	2026-07-27 03:56:52.019	\N
cmqmzegjv00bcod01rtb2irwa	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-19	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 23:21:07.915	2026-07-27 03:56:52.019	\N
cmqmp8vmo007qod01gzpgw27r	mat-pilates	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-10	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 18:36:51.361	2026-07-27 03:56:52.019	\N
cmqmp9mwu007sod019twll170	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-10	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 18:37:26.718	2026-07-27 03:56:52.019	\N
cmqmpa8yy007uod01krhkw3tw	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-10	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 18:37:55.307	2026-07-27 03:56:52.019	\N
cmqmpb90x007wod017b2nxcud	mat-pilates	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-10	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 18:38:42.033	2026-07-27 03:56:52.019	\N
cmqmpc0r4007yod01gj81ghpg	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-10	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 18:39:17.968	2026-07-27 03:56:52.019	\N
cmqmzk9nr00bood0122zis4gn	mat-pilates	cmql83ep6000cod017esn6v7r	SAT	2026-06-20	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 23:25:38.919	2026-07-27 03:56:52.019	\N
cmqmzl6d400bqod01swrx5394	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-06-20	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 23:26:21.304	2026-07-27 03:56:52.019	\N
cmq9evx3p0001wmysifsel0o9	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-18	\N	WEEKLY	08:00	09:00	50	8	6	f	2026-06-11 11:25:50.293	2026-07-27 03:56:52.019	\N
cmq9fbjyj000dwmyswkvgp1x0	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-19	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-11 11:37:59.756	2026-07-27 03:56:52.019	\N
cmqmx00s6009aod011p3g0675	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-14	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 22:13:55.062	2026-07-27 03:56:52.019	\N
cmqmx0whp009cod01f6okjpuy	coaching-prive	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-14	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 22:14:36.158	2026-07-27 03:56:52.019	\N
cmqmx228g009eod01n48ln87x	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-14	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 22:15:30.256	2026-07-27 03:56:52.019	\N
cmqmx2sa5009god01c20hdflw	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-14	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 22:16:04.014	2026-07-27 03:56:52.019	\N
cmqmyj7hv00a8od010orkc8k8	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-16	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 22:56:49.843	2026-07-27 03:56:52.019	\N
cmq9f95xd0009wmys4fh3rgu6	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-05-18	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-11 11:36:08.257	2026-07-27 03:56:52.019	\N
cmq9fa8vn000bwmyswb4kviea	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-05-18	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-11 11:36:58.74	2026-07-27 03:56:52.019	\N
cmq9fcoh0000fwmysdeo6eus5	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-19	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 11:38:52.26	2026-07-27 03:56:52.019	\N
cmq9feru8000jwmysq1vizy87	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-19	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 11:40:29.936	2026-07-27 03:56:52.019	\N
cmq9fhaem000nwmys8jdowqm2	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-05-19	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-11 11:42:27.31	2026-07-27 03:56:52.019	\N
cmq9fi14k000pwmysgpf3tejt	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-05-19	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-11 11:43:01.941	2026-07-27 03:56:52.019	\N
cmq9i2ci70027wmysscy2bu9b	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-05-25	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-11 12:54:49.039	2026-07-27 03:56:52.019	\N
cmq9i3yek002bwmysdk1xe5fo	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-26	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 12:56:04.076	2026-07-27 03:56:52.019	\N
cmq9fmidc000xwmys98o2xwh0	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-05-21	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 11:46:30.913	2026-07-27 03:56:52.019	\N
cmq9ibl4o002twmyst523zaud	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-29	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 13:02:00.121	2026-07-27 03:56:52.019	\N
cmq9ia9md002pwmysdj3fumo1	mat-pilates	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-29	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 13:00:58.549	2026-07-27 03:56:52.019	\N
cmq9inh4a002zwmyskfwm1sp8	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-05-29	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-11 13:11:14.794	2026-07-27 03:56:52.019	\N
cmq9j82w60037wmys4yl4j2hm	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-05-31	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-11 13:27:16.134	2026-07-27 03:56:52.019	\N
cmq9j8ubs0039wmys9cl9xj0d	coaching-prive	cmq407j3i0002wmko2bzj8hjy	SUN	2026-05-31	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 13:27:51.688	2026-07-27 03:56:52.019	\N
cmq9fqhqt0015wmys5qnjmndg	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-05-21	ALL_LEVELS	WEEKLY	18:30	19:30	50	6	2	f	2026-06-11 11:49:36.725	2026-07-27 03:56:52.019	\N
cmq9ftmkh001bwmys4oo2c448	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-22	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 11:52:02.945	2026-07-27 03:56:52.019	\N
cmq9fuddw001dwmysbkd747zi	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-22	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 11:52:37.7	2026-07-27 03:56:52.019	\N
cmrt646rk00n3lq01bv1j5yfk	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-31	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-07-20 11:55:25.377	2026-07-27 03:56:52.019	cmrix5g3c00ndmn01mqlcrazs
cmrt646ro00n4lq01m7tbywnp	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-31	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-20 11:55:25.38	2026-07-27 03:56:52.019	cmrix5g3l00nemn01nkgvmio8
cmrt646rr00n5lq01tkltjmli	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-31	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-07-20 11:55:25.383	2026-07-27 03:56:52.019	cmrix5g3q00nfmn015smlq1xu
cmrt646ru00n6lq01ubdc1itd	yoga	cmql83ep6000cod017esn6v7r	SAT	2026-08-01	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-20 11:55:25.387	2026-07-27 03:56:52.019	cmrix5g3x00ngmn016ou822xw
cmrt646s000n7lq01fy1wxihf	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-08-01	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-07-20 11:55:25.392	2026-07-27 03:56:52.019	cmrix5g4000nhmn01u5fccimi
cmrt646s500n8lq01mj5qeqpn	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-08-01	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-07-20 11:55:25.397	2026-07-27 03:56:52.019	cmrix5g4300nimn01y497k43n
cmrt646sb00n9lq016qr9l6xh	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-02	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-07-20 11:55:25.403	2026-07-27 03:56:52.019	cmrix5g4700njmn01bwfs64se
cmrt646sj00nblq015owj98m0	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-02	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-07-20 11:55:25.412	2026-07-27 03:56:52.019	cmrix5g4i00nlmn01csonnu9x
cmrt646sn00nclq01tp2531mh	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-27	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-20 11:55:25.415	2026-07-27 03:56:52.019	cmrix5g5100nomn010vza0qy5
cmrt646sq00ndlq016h4ggo4t	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-27	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-07-20 11:55:25.419	2026-07-27 03:56:52.019	cmrix5g5400npmn01vxhayl3g
cmrt646t200nglq011fg40dno	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-28	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-20 11:55:25.43	2026-07-27 03:56:52.019	cmrix5g5f00nsmn01ngqh0zx6
cmrt646t800nhlq01y7vjtyig	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-28	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-20 11:55:25.437	2026-07-27 03:56:52.019	cmrix5g5n00numn018rt26jt5
cmrt646tf00nilq01uijk7vbb	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-28	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-07-20 11:55:25.443	2026-07-27 03:56:52.019	cmrix5g5p00nvmn013lr7rusv
cmrt646tm00nklq01aidpf9xo	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-28	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-07-20 11:55:25.45	2026-07-27 03:56:52.019	cmrix5g5v00nxmn01ay3ifpnw
cmrt646ts00nmlq01m4hlhyrc	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-29	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-07-20 11:55:25.456	2026-07-27 03:56:52.019	cmrix5g6300nzmn016so9a0e3
cmrt646tu00nnlq01orfp75rn	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-29	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-07-20 11:55:25.459	2026-07-27 03:56:52.019	cmrix5g6600o0mn01teqmhwe7
cmq9ffwl9000lwmysoh33bslf	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-05-19	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-06-11 11:41:22.75	2026-07-27 03:56:52.019	\N
cmrt646sg00nalq01q9zyqgv7	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-08-02	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-20 11:55:25.408	2026-07-28 13:44:43.308	cmrix5g4a00nkmn01yk5dazn9
cmrt646sx00nflq01ux2slx5l	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-28	\N	WEEKLY	09:00	10:00	50	1	0	f	2026-07-20 11:55:25.426	2026-07-29 10:54:31.987	cmrix5g5a00nrmn01ycpuwb0d
cmrt646tp00nllq01wb0f586b	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-29	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-20 11:55:25.453	2026-07-29 10:55:45.012	cmrix5g5z00nymn01wf7vhgh9
cmrueiugt00yllq01e079kitt	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-31	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-21 08:38:32.382	2026-07-29 10:56:26.078	cmrueiugk00yklq014e4kvo2m
cmrt646tx00nolq01k7yci8xd	mat-pilates	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-29	BEGINNER	WEEKLY	16:00	17:00	50	6	2	f	2026-07-20 11:55:25.461	2026-07-29 11:00:55.788	cmrix5g6a00o1mn0150au9f9m
cmrt646tj00njlq01sc8ry7bp	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-28	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-07-20 11:55:25.447	2026-07-29 11:14:25.358	cmrix5g5s00nwmn014zjhvdkz
cmrix5g2k00n3mn010quiz7nx	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-23	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-07-13 07:46:45.789	2026-07-27 03:56:52.019	cmr908w2900d2mm01htgfrd9k
cmrt646u000nplq01at0yofsd	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-27	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-07-20 11:55:25.465	2026-07-27 03:56:52.019	cmrix5g6e00o2mn018y4e1pf0
cmrt646u300nqlq01pv821bjr	coaching-prive	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-27	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-07-20 11:55:25.468	2026-07-27 03:56:52.019	cmrix5g6g00o3mn01hdoi98nv
cmrt646ui00nvlq01x072hoir	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-27	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-20 11:55:25.482	2026-07-29 10:53:29.011	cmrix5g6r00o7mn01wppxx1xl
cmrt646u900nslq017ccminqk	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-27	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-07-20 11:55:25.473	2026-07-29 10:53:50.641	cmrix5g4y00nnmn013oe4wyji
cmrt646su00nelq0150zcxivb	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-28	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-20 11:55:25.422	2026-07-29 10:54:17.141	cmrix5g5700nqmn0194rr3fv0
cmrt646ud00ntlq01qxuz53eg	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-28	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-07-20 11:55:25.477	2026-07-29 10:54:56.371	cmrix5g5j00ntmn01jt2s3a1b
cmrt646u600nrlq01r292s1y6	sans-cours	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-29	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-20 11:55:25.47	2026-07-29 10:55:25.869	cmrix5g6j00o4mn01cwwkhd5f
cmrt646uf00nulq0145dvchqs	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-28	BEGINNER	WEEKLY	15:00	16:00	50	6	2	f	2026-07-20 11:55:25.48	2026-07-29 10:59:13.943	cmrix5g7100oamn01jpgzzoxz
cmrix5g2200mzmn01zn08uvd2	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-22	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-07-13 07:46:45.77	2026-07-27 03:56:52.019	cmr908w1z00cymm018ljz0vgg
cmrix5g2b00n0mn01v41bgdl4	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-22	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-07-13 07:46:45.78	2026-07-27 03:56:52.019	cmr908w2100czmm01ysvy2ut0
cmr908w1z00cymm018ljz0vgg	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-15	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-07-06 09:15:43.559	2026-07-27 03:56:52.019	cmr0lf2sb000tpn01pz8eb9jd
cmr908w2100czmm01ysvy2ut0	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-15	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-07-06 09:15:43.562	2026-07-27 03:56:52.019	cmr0lf2sd000upn01jj3jcl8s
cmr908w2400d0mm01op9pxsuj	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-15	INTERMEDIATE	WEEKLY	19:00	20:00	50	6	2	f	2026-07-06 09:15:43.565	2026-07-27 03:56:52.019	cmr0lf2sg000vpn013xbcr6q5
cmr908w2700d1mm018fjay3hf	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-15	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-07-06 09:15:43.567	2026-07-27 03:56:52.019	cmr0lf2sk000wpn01pjqlqu42
cmr908w2900d2mm01htgfrd9k	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-16	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-07-06 09:15:43.569	2026-07-27 03:56:52.019	cmr0lf2sq000xpn01vwpfngt6
cmqzaybih0041mg01964d2791	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-29	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-29 14:17:44.393	2026-07-27 03:56:52.019	\N
cmqrxi4cv000ro701utq80ofw	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-23	INTERMEDIATE	WEEKLY	11:00	12:00	50	6	2	f	2026-06-24 10:26:50.384	2026-07-27 03:56:52.019	\N
cmqrxit6a000to701bqvtuyq7	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-23	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-24 10:27:22.546	2026-07-27 03:56:52.019	\N
cmqrxjpuq000vo701sd9wab7y	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-23	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-24 10:28:04.899	2026-07-27 03:56:52.019	\N
cmqrxkdg5000xo701l23j4vxw	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-23	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-24 10:28:35.477	2026-07-27 03:56:52.019	\N
cmqrxkzog000zo7018edaiz42	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-23	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-24 10:29:04.288	2026-07-27 03:56:52.019	\N
cmqrxm7ii0011o701b63kg6sz	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-24	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-06-24 10:30:01.098	2026-07-27 03:56:52.019	\N
cmqrxn8zz0013o701zzhu0cgw	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-24	BEGINNER	WEEKLY	09:00	10:00	50	1	0	f	2026-06-24 10:30:49.68	2026-07-27 03:56:52.019	\N
cmqmqlnvv008qod01djrodw4c	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-12	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 19:14:47.468	2026-07-27 03:56:52.019	\N
cmqmwt2kn0090od0147oyjp5o	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-12	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 22:08:30.791	2026-07-27 03:56:52.019	\N
cmqmwu6kh0092od01h39znw53	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-12	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 22:09:22.626	2026-07-27 03:56:52.019	\N
cmqmz3ev800amod01hq79sqrj	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-17	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 23:12:32.516	2026-07-27 03:56:52.019	\N
cmqmz44v900aood01b4oxxshe	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-17	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 23:13:06.213	2026-07-27 03:56:52.019	\N
cmqmz4tnv00aqod01cnoxz75y	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-17	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 23:13:38.348	2026-07-27 03:56:52.019	\N
cmqmz5o1b00asod01dfkbqw75	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-18	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 23:14:17.711	2026-07-27 03:56:52.019	\N
cmqmz6p9a00auod01r4beqiab	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-18	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-06-20 23:15:05.951	2026-07-27 03:56:52.019	\N
cmq9i6cxz002hwmys1mk0mjj2	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-05-26	ALL_LEVELS	WEEKLY	15:00	16:00	50	6	2	f	2026-06-11 12:57:56.231	2026-07-27 03:56:52.019	\N
cmqmo68u5006eod01y2n8sgsj	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-06-06	ALL_LEVELS	WEEKLY	11:15	12:15	50	6	2	f	2026-06-20 18:06:48.893	2026-07-27 03:56:52.019	\N
cmqmn70we0052od01arz8py2d	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-03	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 17:39:25.647	2026-07-27 03:56:52.019	\N
cmqrxo7gt0015o701xvbt9ait	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-24	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-24 10:31:34.349	2026-07-27 03:56:52.019	\N
cmqrxot9c0017o701irtjaq4u	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-24	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-24 10:32:02.592	2026-07-27 03:56:52.019	\N
cmqrxpxim0019o701oel546r4	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-24	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-24 10:32:54.766	2026-07-27 03:56:52.019	\N
cmqrxqib6001bo701148h63ce	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-24	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-24 10:33:21.715	2026-07-27 03:56:52.019	\N
cmq9fkl3c000twmysjkkrem0a	mat-pilates	cmq40bvbx0005wmkonbu4odyv	WED	2026-05-20	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-11 11:45:01.128	2026-07-27 03:56:52.019	\N
cmq9fnhwa000zwmys4yw4bz7o	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-05-21	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-06-11 11:47:16.954	2026-07-27 03:56:52.019	\N
cmq9fs5iz0017wmysf6r5tuse	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-22	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-06-11 11:50:54.203	2026-07-27 03:56:52.019	\N
cmq9fst630019wmysziben0p0	mat-pilates	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-22	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 11:51:24.844	2026-07-27 03:56:52.019	\N
cmrix5g6l00o5mn01j8iuyonl	coaching-prive	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-23	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-13 07:46:45.934	2026-07-27 03:56:52.019	cmr908vy500btmm011t64awvd
cmrix5g6o00o6mn010gbfohtx	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-20	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-13 07:46:45.937	2026-07-27 03:56:52.019	cmraj7iyo00k8mm015us78ohr
cmrix5g6u00o8mn01g9smohii	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-26	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-13 07:46:45.942	2026-07-27 03:56:52.019	cmrajhsiy00kimm018h6qcok8
cmrix5g6y00o9mn015gq3v78v	coaching-prive	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-22	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-13 07:46:45.947	2026-07-27 03:56:52.019	cmrajmhqm00komm017ifjsr06
cmrdfci8z007xmn0106ezpk45	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-25	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-07-09 11:29:31.235	2026-07-27 03:56:52.019	\N
cmqzb5nyr0047mg01plloupsf	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-30	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-29 14:23:27.123	2026-07-27 03:56:52.019	\N
cmq9ja2de003dwmys3gepgv50	coaching-prive	cmq407j3i0002wmko2bzj8hjy	SUN	2026-05-31	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 13:28:48.77	2026-07-27 03:56:52.019	\N
cmq9f01ao0007wmys8as5zcu2	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-18	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 11:29:02.352	2026-07-27 03:56:52.019	\N
cmqmp1x8c007aod01vcuo3eko	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-09	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 18:31:26.844	2026-07-27 03:56:52.019	\N
cmqmp2mzc007cod01homcpmqy	mat-pilates	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-09	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 18:32:00.216	2026-07-27 03:56:52.019	\N
cmqmp3is2007eod018u8jm7ww	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-09	ALL_LEVELS	WEEKLY	15:00	16:00	50	6	2	f	2026-06-20 18:32:41.426	2026-07-27 03:56:52.019	\N
cmqmp47tr007god01eupe7omx	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-09	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 18:33:13.887	2026-07-27 03:56:52.019	\N
cmqmp4wt4007iod010albebt6	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-09	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 18:33:46.265	2026-07-27 03:56:52.019	\N
cmqmp5pjr007kod012ybjey7m	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-09	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 18:34:23.512	2026-07-27 03:56:52.019	\N
cmqmp6na5007mod01u6ifuqgr	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-09	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 18:35:07.229	2026-07-27 03:56:52.019	\N
cmqmp88v5007ood014a4y34sa	sans-cours	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-10	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 18:36:21.858	2026-07-27 03:56:52.019	\N
cmqmxk8jg009sod018axk63jt	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-15	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 22:29:38.237	2026-07-27 03:56:52.019	\N
cmqmxl62u009uod014m0gpyi8	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-15	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 22:30:21.702	2026-07-27 03:56:52.019	\N
cmqmxnjdd009wod01me8z43ab	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-16	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 22:32:12.242	2026-07-27 03:56:52.019	\N
cmqmxq768009yod018vfclcnx	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-16	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 22:34:16.401	2026-07-27 03:56:52.019	\N
cmqmz858g00awod01vqtyaded	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-18	BEGINNER	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 23:16:13.312	2026-07-27 03:56:52.019	\N
cmqmz8uab00ayod011jdohk6l	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-18	ALL_LEVELS	WEEKLY	17:30	18:30	50	6	2	f	2026-06-20 23:16:45.779	2026-07-27 03:56:52.019	\N
cmqmz9jpt00b0od013tk6bwbf	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-18	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-06-20 23:17:18.737	2026-07-27 03:56:52.019	\N
cmqmwwy100094od01h206q3vt	mat-pilates	cmql83ep6000cod017esn6v7r	SAT	2026-06-13	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 22:11:31.524	2026-07-27 03:56:52.019	\N
cmqmwxsdz0096od01664tgt8r	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-06-13	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 22:12:10.871	2026-07-27 03:56:52.019	\N
cmqzbipqs004rmg012imxx8ci	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-01	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-29 14:33:35.957	2026-07-27 03:56:52.019	\N
cmqzbj8gh004tmg01trtzpkn4	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-01	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-29 14:34:00.209	2026-07-27 03:56:52.019	\N
cmqzbjt8e004vmg013phelgz0	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-01	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-29 14:34:27.135	2026-07-27 03:56:52.019	\N
cmqzbknbz004xmg01m9lpevgu	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-01	INTERMEDIATE	WEEKLY	19:00	20:00	50	6	2	f	2026-06-29 14:35:06.144	2026-07-27 03:56:52.019	\N
cmqzbl5hx004zmg01xgx79lhn	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-01	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-06-29 14:35:29.686	2026-07-27 03:56:52.019	\N
cmqzbluk50051mg01cr2pwdun	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-02	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-29 14:36:02.165	2026-07-27 03:56:52.019	\N
cmqzbmdo40053mg01fabbc3zu	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-07-02	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-06-29 14:36:26.932	2026-07-27 03:56:52.019	\N
cmqzbnf9h0055mg01ej1yk1tr	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-02	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-29 14:37:15.653	2026-07-27 03:56:52.019	\N
cmqzbnzxw0057mg01m2o14l0o	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-02	BEGINNER	WEEKLY	17:30	18:30	50	6	2	f	2026-06-29 14:37:42.453	2026-07-27 03:56:52.019	\N
cmqzbokag0059mg01kwlb280h	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-02	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-29 14:38:08.824	2026-07-27 03:56:52.019	\N
cmqzbp13s005bmg01hey1nfx7	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-02	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-06-29 14:38:30.616	2026-07-27 03:56:52.019	\N
cmqmwz5f30098od01306pltsx	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-06-13	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-06-20 22:13:14.416	2026-07-27 03:56:52.019	\N
cmqmxuy8t00a0od019zvvur0b	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-16	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 22:37:58.109	2026-07-27 03:56:52.019	\N
cmqmxvpig00a2od01xxi462id	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-16	INTERMEDIATE	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 22:38:33.448	2026-07-27 03:56:52.019	\N
cmqmmse6j004eod012exildrt	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-01	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 17:28:03.019	2026-07-27 03:56:52.019	\N
cmqmmtijv004god01p3yq8m8n	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-01	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 17:28:55.339	2026-07-27 03:56:52.019	\N
cmqmmuas1004iod016m86gd1i	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-01	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 17:29:31.921	2026-07-27 03:56:52.019	\N
cmqmmv5en004kod01jyor4o8b	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-01	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 17:30:11.615	2026-07-27 03:56:52.019	\N
cmqmmwbi5004mod01dit09gof	mat-pilates	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-01	\N	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 17:31:06.173	2026-07-27 03:56:52.019	\N
cmqmmy2f8004ood01padr115b	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-02	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 17:32:27.716	2026-07-27 03:56:52.019	\N
cmqmmyw79004qod01za4ph9hp	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-02	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 17:33:06.31	2026-07-27 03:56:52.019	\N
cmrix5g4t00nmmn01g87uvzzp	mat-pilates	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-20	\N	WEEKLY	10:00	11:00	50	6	2	f	2026-07-13 07:46:45.869	2026-07-27 03:56:52.019	cmr908w0l00cfmm01va8fjdr1
cmr908vyh00bwmm01ujirtt96	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-07-16	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-07-06 09:15:43.433	2026-07-27 03:56:52.019	cmr0lf2t90012pn01klwvko87
cmr908vyn00bymm01jorz7q4v	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-17	BEGINNER	WEEKLY	09:00	10:00	50	1	0	f	2026-07-06 09:15:43.439	2026-07-27 03:56:52.019	cmr0lf2te0014pn010829r5ma
cmr908vz200c0mm01wyn8lpeo	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-17	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-06 09:15:43.455	2026-07-27 03:56:52.019	cmr0lf2tk0016pn01axfzptwh
cmr908vz600c1mm01l0z41ey8	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-17	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-07-06 09:15:43.459	2026-07-27 03:56:52.019	cmr0lf2tn0017pn01ho4c6bvd
cmr908vz900c2mm01mn2vtqqd	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-17	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-06 09:15:43.461	2026-07-27 03:56:52.019	cmr0lf2tr0018pn01qs0gu3me
cmr908vzc00c3mm01yvcfqr8h	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-17	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-07-06 09:15:43.464	2026-07-27 03:56:52.019	cmr0lf2tu0019pn01zy6xx5ro
cmqzau8ts003nmg01dlzbhcwv	coaching-prive	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-29	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-06-29 14:14:34.288	2026-07-27 03:56:52.019	\N
cmqzaux6n003pmg01nyaurvwj	coaching-prive	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-29	BEGINNER	WEEKLY	09:00	10:00	50	1	0	f	2026-06-29 14:15:05.856	2026-07-27 03:56:52.019	\N
cmr908vze00c4mm01ubuybd8c	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-17	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-06 09:15:43.467	2026-07-27 03:56:52.019	cmr0lf2tx001apn01dj916ttz
cmr908vzh00c5mm01jirbu4v2	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-17	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-07-06 09:15:43.47	2026-07-27 03:56:52.019	cmr0lf2u0001bpn01lh3x4bs9
cmr908vzk00c6mm01mr2ask9z	yoga	cmql83ep6000cod017esn6v7r	SAT	2026-07-18	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-06 09:15:43.473	2026-07-27 03:56:52.019	cmr0lf2u4001cpn015p2kghiw
cmr908vzo00c7mm01mh3cyc0p	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-07-18	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-07-06 09:15:43.476	2026-07-27 03:56:52.019	cmr0lf2u8001dpn01nnmoadgo
cmr908vzv00c8mm01xqo4398r	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-07-18	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-07-06 09:15:43.484	2026-07-27 03:56:52.019	cmr0lf2uc001epn0189o0lfr4
cmr908w0000c9mm01mtivvn2w	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-19	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-07-06 09:15:43.488	2026-07-27 03:56:52.019	cmr0lf2uy001fpn011bm0do45
cmr908w0500camm01ugf8l6df	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-19	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-06 09:15:43.494	2026-07-27 03:56:52.019	cmr0lf2v3001gpn01e0p9m4hg
cmr908w0a00cbmm01mcln1o2j	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-19	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-07-06 09:15:43.498	2026-07-27 03:56:52.019	cmr0lf2vc001hpn014r2sv0r9
cmr908w0v00cjmm01zqnivmco	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-13	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-06 09:15:43.52	2026-07-27 03:56:52.019	cmr0lf2r6000epn01b01vkwpm
cmr908w0y00ckmm011t7a402x	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-13	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-07-06 09:15:43.522	2026-07-27 03:56:52.019	cmr0lf2r8000fpn013mz6ywd2
cmr908w1000clmm01uopzmbur	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-14	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-06 09:15:43.525	2026-07-27 03:56:52.019	cmr0lf2rb000gpn01d8h5lce6
cmr908w1300cmmm0155c5onnh	coaching-prive	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-14	\N	WEEKLY	09:00	10:00	50	1	0	f	2026-07-06 09:15:43.527	2026-07-27 03:56:52.019	cmr0lf2re000hpn01987ij19o
cmr908w1500cnmm011dy7ckbg	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-14	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-07-06 09:15:43.529	2026-07-27 03:56:52.019	cmr0lf2rh000ipn01hpostdo9
cmr908w1a00cpmm01ih7e2u1j	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-14	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-06 09:15:43.535	2026-07-27 03:56:52.019	cmr0lf2rm000kpn01905nx70m
cmr908w1d00cqmm015uw0f0fs	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-07-14	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-07-06 09:15:43.537	2026-07-27 03:56:52.019	cmr0lf2rp000lpn018lqbrm9x
cmr908w1g00crmm01psu6zflu	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-14	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-07-06 09:15:43.54	2026-07-27 03:56:52.019	cmr0lf2rs000mpn01i367mfch
cmr908w1j00csmm01mge40q7b	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-14	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-07-06 09:15:43.543	2026-07-27 03:56:52.019	cmr0lf2ru000npn01m8kg1lra
cmr908w1o00cumm014gw9e9a3	mat-pilates	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-15	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-07-06 09:15:43.549	2026-07-27 03:56:52.019	cmr0lf2s0000ppn01yy85vtr2
cmr908w1x00cxmm01zrwzqnwz	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-15	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-07-06 09:15:43.557	2026-07-27 03:56:52.019	cmr0lf2s8000spn01sfclllrr
cmr908w0q00chmm01rfd4xxra	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-13	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-07-06 09:15:43.515	2026-07-27 03:56:52.019	cmr0lf2qz000cpn016p7qcx7z
cmr908w0t00cimm01dqefnx05	coaching-prive	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-13	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-07-06 09:15:43.517	2026-07-27 03:56:52.019	cmr0lf2r2000dpn01uv7pvl3x
cmr908w1m00ctmm01wmvg9qmz	sans-cours	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-15	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-06 09:15:43.546	2026-07-27 03:56:52.019	cmr0lf2rx000opn01j5yjfv6p
cmr908vy500btmm011t64awvd	coaching-prive	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-16	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-07-06 09:15:43.421	2026-07-27 03:56:52.019	cmr0lf2sz000zpn01vcdbfn1k
cmraj7iyo00k8mm015us78ohr	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-13	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-07 10:54:18.816	2026-07-27 03:56:52.019	cmraj7iyb00k7mm01gvqv0r1e
cmr0lf2uc001epn0189o0lfr4	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-07-11	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-06-30 11:58:28.644	2026-07-27 03:56:52.019	cmqzbw2g5005zmg01znmn6j5u
cmr908w0l00cfmm01va8fjdr1	mat-pilates	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-13	\N	WEEKLY	10:00	11:00	50	6	2	f	2026-07-06 09:15:43.51	2026-07-27 03:56:52.019	cmr0lf2qk000apn01mmcs724c
cmr908w0o00cgmm0112vpuf89	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-13	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-07-06 09:15:43.512	2026-07-27 03:56:52.019	cmr0lf2qt000bpn01sduu8iy3
cmr908w1800comm01l62vebvw	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-14	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-07-06 09:15:43.532	2026-07-27 03:56:52.019	cmr0lf2rj000jpn01fw1phoju
cmr908w1r00cvmm01s5ud3j1n	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-15	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-07-06 09:15:43.551	2026-07-27 03:56:52.019	cmr0lf2s3000qpn013kdvbhh8
cmr908w1u00cwmm01xajpas8u	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-15	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-07-06 09:15:43.555	2026-07-27 03:56:52.019	cmr0lf2s6000rpn013e5f88dk
cmrkiw4m0000ulq01k7ohqj0r	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-07-21	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-07-14 10:43:08.761	2026-07-27 03:56:52.019	cmrkiw4lc000tlq010dy0t6kq
cmr0lf2vc001hpn014r2sv0r9	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-12	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-30 11:58:28.68	2026-07-27 03:56:52.019	cmqzbxre80065mg01ewd495p6
cmr0lf2qk000apn01mmcs724c	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-06	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-30 11:58:28.508	2026-07-27 03:56:52.019	cmqzavffl003rmg01jh06614o
cmrlymi6u00a5lq01y2ze2m1j	coaching-prive	cmq40bvbx0005wmkonbu4odyv	SAT	2026-07-04	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-07-15 10:51:19.83	2026-07-27 03:56:52.019	\N
cmrix5g2f00n1mn0185zxtut4	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-22	INTERMEDIATE	WEEKLY	19:00	20:00	50	6	2	f	2026-07-13 07:46:45.783	2026-07-27 03:56:52.019	cmr908w2400d0mm01op9pxsuj
cmrix5g2h00n2mn01o5xhtqm7	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-07-22	BEGINNER	WEEKLY	20:00	21:00	50	6	2	f	2026-07-13 07:46:45.786	2026-07-27 03:56:52.019	cmr908w2700d1mm018fjay3hf
cmrajhsiy00kimm018h6qcok8	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-19	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-07-07 11:02:17.771	2026-07-27 03:56:52.019	cmrajhsik00khmm01ghpfzp9i
cmrajmhqm00komm017ifjsr06	coaching-prive	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-15	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-07 11:05:57.071	2026-07-27 03:56:52.019	cmrajmhq900knmm01rowtydu4
cmrajmhq900knmm01rowtydu4	coaching-prive	cmq40bvbx0005wmkonbu4odyv	WED	2026-07-08	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-07-07 11:05:57.057	2026-07-27 03:56:52.019	\N
cmr0lf2qt000bpn01sduu8iy3	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-07-06	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-30 11:58:28.518	2026-07-27 03:56:52.019	cmqzavv4x003tmg01emqe1sxn
cmq9exu3y0003wmys8253mcpy	mat-pilates	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-18	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 11:27:19.726	2026-07-27 03:56:52.019	\N
cmqmnag4e005aod010ly3t1sk	mat-pilates	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-03	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 17:42:05.341	2026-07-27 03:56:52.019	\N
cmqmnbjgv005cod01nuhx9q80	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-06-03	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 17:42:56.335	2026-07-27 03:56:52.019	\N
cmqmne7rq005iod01zkanqzoy	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-04	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 17:45:01.143	2026-07-27 03:56:52.019	\N
cmqmnf4hi005kod01psi4hj70	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-04	BEGINNER	WEEKLY	12:00	13:00	50	6	2	f	2026-06-20 17:45:43.542	2026-07-27 03:56:52.019	\N
cmqmni52q005mod01aovlvd87	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-04	BEGINNER	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 17:48:04.275	2026-07-27 03:56:52.019	\N
cmqmnllnj005ood011hxhn89j	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-04	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 17:50:45.727	2026-07-27 03:56:52.019	\N
cmqmnmijf005qod0197z3mscd	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-04	ALL_LEVELS	WEEKLY	17:30	18:30	50	6	2	f	2026-06-20 17:51:28.348	2026-07-27 03:56:52.019	\N
cmqmnnd0a005sod01q6r0k0ox	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-04	ALL_LEVELS	WEEKLY	18:30	19:30	50	6	2	f	2026-06-20 17:52:07.834	2026-07-27 03:56:52.019	\N
cmqmno8b1005uod016mioa44o	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-04	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 17:52:48.397	2026-07-27 03:56:52.019	\N
cmqmn5o330050od01720i3gaj	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-02	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 17:38:22.383	2026-07-27 03:56:52.019	\N
cmqmn3pa5004yod018829iesj	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-02	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 17:36:50.621	2026-07-27 03:56:52.019	\N
cmqmolfw0006ood01qjf789fx	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-08	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 18:18:37.873	2026-07-27 03:56:52.019	\N
cmqmoml4o006qod012vafqtdv	coaching-prive	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-08	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 18:19:31.321	2026-07-27 03:56:52.019	\N
cmqmondm4006sod0109qo59ei	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-08	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 18:20:08.236	2026-07-27 03:56:52.019	\N
cmqmoo7wy006uod01pzn2pc4w	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-08	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 18:20:47.506	2026-07-27 03:56:52.019	\N
cmqmopj9z006wod01dkqgg0r2	mat-pilates	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-08	\N	WEEKLY	15:00	16:00	50	6	2	f	2026-06-20 18:21:48.888	2026-07-27 03:56:52.019	\N
cmqmoreve006yod01rigzesni	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-08	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 18:23:16.491	2026-07-27 03:56:52.019	\N
cmqmosf9h0070od01qwkb5wc7	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-08	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 18:24:03.653	2026-07-27 03:56:52.019	\N
cmqmote780072od01pgga5alg	mat-pilates	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-08	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 18:24:48.932	2026-07-27 03:56:52.019	\N
cmqrx8jxy0007o701tzwcpknz	sans-cours	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-22	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-24 10:19:24.023	2026-07-27 03:56:52.019	\N
cmqzb68lc0049mg01yfgjbky0	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-30	INTERMEDIATE	WEEKLY	11:00	12:00	50	6	2	f	2026-06-29 14:23:53.856	2026-07-27 03:56:52.019	\N
cmqzb7ybi004bmg010yvyjm53	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-30	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-29 14:25:13.855	2026-07-27 03:56:52.019	\N
cmqzb8v2z004dmg01zbaatlac	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-30	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-29 14:25:56.315	2026-07-27 03:56:52.019	\N
cmqzb9g51004fmg014z0v1i91	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-30	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-29 14:26:23.606	2026-07-27 03:56:52.019	\N
cmqzba3hr004hmg01l9mur8kl	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-30	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-29 14:26:53.871	2026-07-27 03:56:52.019	\N
cmqzbb1ri004jmg016sdmj53b	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-07-01	BEGINNER	WEEKLY	08:00	09:00	50	1	0	f	2026-06-29 14:27:38.286	2026-07-27 03:56:52.019	\N
cmr0lf2r6000epn01b01vkwpm	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-06	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-30 11:58:28.53	2026-07-27 03:56:52.019	cmqzaxoid003zmg01n5umqrul
cmr0lf2r8000fpn013mz6ywd2	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-07-06	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-30 11:58:28.533	2026-07-27 03:56:52.019	cmqzaybih0041mg01964d2791
cmr0lf2rb000gpn01d8h5lce6	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-07-07	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-30 11:58:28.535	2026-07-27 03:56:52.019	cmqzb48c80043mg01yd1ldg0q
cmq9i9bc8002nwmys7rr8hoqf	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-05-29	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-11 13:00:14.12	2026-07-27 03:56:52.019	\N
cmqmncddo005eod01qngiqdlr	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-03	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 17:43:35.1	2026-07-27 03:56:52.019	\N
cmqmnd6y7005god01sutpmk1r	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-03	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 17:44:13.423	2026-07-27 03:56:52.019	\N
cmqrxa4w20009o701g4bhgdru	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-22	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-24 10:20:37.826	2026-07-27 03:56:52.019	\N
cmqrxamul000bo7013wmz5yzm	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-22	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-24 10:21:01.101	2026-07-27 03:56:52.019	\N
cmqrxbqrp000do701tzoiewue	coaching-prive	cmq407j3i0002wmko2bzj8hjy	MON	2026-06-22	BEGINNER	WEEKLY	12:00	13:00	50	1	0	f	2026-06-24 10:21:52.837	2026-07-27 03:56:52.019	\N
cmqrxddf7000fo701d3aeyir7	mat-pilates	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-22	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-06-24 10:23:08.851	2026-07-27 03:56:52.019	\N
cmqrxdzon000ho7018k4luggq	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-22	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-24 10:23:37.703	2026-07-27 03:56:52.019	\N
cmqrxenj9000jo7011cgedrh3	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-06-22	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-24 10:24:08.613	2026-07-27 03:56:52.019	\N
cmqrxfjhc000lo701tvtceqti	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-23	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-24 10:24:50.016	2026-07-27 03:56:52.019	\N
cmqrxgc0c000no701kc35xp16	coaching-prive	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-23	\N	WEEKLY	09:00	10:00	50	1	0	f	2026-06-24 10:25:26.988	2026-07-27 03:56:52.019	\N
cmqsakuut00hjo701fu9h8eyn	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-28	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-24 16:32:53.045	2026-07-27 03:56:52.019	\N
cmqmzdtxg00baod01igps5ws1	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-19	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 23:20:38.596	2026-07-27 03:56:52.019	\N
cmqmpdkr30082od019fokwjfc	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-10	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 18:40:30.543	2026-07-27 03:56:52.019	\N
cmqmpet3o0084od01vdjkgt3u	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-11	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 18:41:28.02	2026-07-27 03:56:52.019	\N
cmqmpfeie0086od01jt90wal1	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	THU	2026-06-11	INTERMEDIATE	WEEKLY	12:00	13:00	50	6	2	f	2026-06-20 18:41:55.766	2026-07-27 03:56:52.019	\N
cmqmpgex10088od01rb6gvhrn	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-11	ALL_LEVELS	WEEKLY	17:30	18:30	50	6	2	f	2026-06-20 18:42:42.949	2026-07-27 03:56:52.019	\N
cmqmph13j008aod01zri8pyzo	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-06-11	BEGINNER	WEEKLY	18:30	19:30	50	6	2	f	2026-06-20 18:43:11.695	2026-07-27 03:56:52.019	\N
cmqmphpw3008cod0143dkzhtm	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-11	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 18:43:43.827	2026-07-27 03:56:52.019	\N
cmqmpiici008eod01s39f479e	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-06-11	\N	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 18:44:20.707	2026-07-27 03:56:52.019	\N
cmqmpjhxf008god01k8bx57hm	sans-cours	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-12	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 18:45:06.819	2026-07-27 03:56:52.019	\N
cmqmpkjjb008iod01nlgfhzjm	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-12	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 18:45:55.559	2026-07-27 03:56:52.019	\N
cmqmpoa23008kod01azh8l5gg	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-12	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 18:48:49.9	2026-07-27 03:56:52.019	\N
cmqmpphwc008mod01h8ekff6d	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-12	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 18:49:46.716	2026-07-27 03:56:52.019	\N
cmqmqcqhh008ood01g6nrviry	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-12	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 19:07:50.933	2026-07-27 03:56:52.019	\N
cmqmo820q006god01zmdjmjcv	coaching-prive	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-07	\N	WEEKLY	08:00	09:00	50	1	1	f	2026-06-20 18:08:13.37	2026-07-27 03:56:52.019	\N
cmqmo92ut006iod01au1152iz	sans-cours	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-07	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 18:09:01.109	2026-07-27 03:56:52.019	\N
cmqmoac2k006kod0192t4qygc	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-07	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 18:09:59.708	2026-07-27 03:56:52.019	\N
cmqmobepy006mod019kuoczcx	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-07	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 18:10:49.798	2026-07-27 03:56:52.019	\N
cmqmpcw1m0080od01sxv5w13u	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-10	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 18:39:58.522	2026-07-27 03:56:52.019	\N
cmq9fdxrr000hwmys6dp512ve	mat-pilates	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-19	\N	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 11:39:50.967	2026-07-27 03:56:52.019	\N
cmqrxhe6s000po701g621fkx5	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-23	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-24 10:26:16.469	2026-07-27 03:56:52.019	\N
cmq9i1f5e0025wmystb64kyn4	mat-pilates	cmq40bvbx0005wmkonbu4odyv	MON	2026-05-25	\N	WEEKLY	18:00	19:00	50	6	2	f	2026-06-11 12:54:05.811	2026-07-27 03:56:52.019	\N
cmq9i30mf0029wmysv30jqj9x	sans-cours	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-26	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-11 12:55:20.296	2026-07-27 03:56:52.019	\N
cmqmmzzd2004sod01fkr7uorn	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-02	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 17:33:57.062	2026-07-27 03:56:52.019	\N
cmqmn0rkk004uod01ytgoy47j	mat-pilates	cmq407j3i0002wmko2bzj8hjy	TUE	2026-06-02	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 17:34:33.621	2026-07-27 03:56:52.019	\N
cmqmn2o9p004wod01inqdydva	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-02	\N	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 17:36:02.653	2026-07-27 03:56:52.019	\N
cmq9fpbtv0013wmysev1zh32u	pilates-reformer	cmq409siz0003wmko7colc5on	THU	2026-05-21	ALL_LEVELS	WEEKLY	17:30	18:30	50	6	2	f	2026-06-11 11:48:42.403	2026-07-27 03:56:52.019	\N
cmq9hkdf7001hwmysekhvs3xl	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-05-22	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-11 12:40:50.419	2026-07-27 03:56:52.019	\N
cmq9hlb0l001jwmys6pv2rvu2	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-05-22	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-11 12:41:33.957	2026-07-27 03:56:52.019	\N
cmq9hxw15001zwmys6frymznx	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-25	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 12:51:21.065	2026-07-27 03:56:52.019	\N
cmq9hyuad0021wmysl0edzaim	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-05-25	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-11 12:52:05.461	2026-07-27 03:56:52.019	\N
cmqzbpi8v005dmg01abdadn4r	mat-pilates	cmq40bvbx0005wmkonbu4odyv	THU	2026-07-02	\N	WEEKLY	19:00	20:00	50	6	2	f	2026-06-29 14:38:52.831	2026-07-27 03:56:52.019	\N
cmqzbqwev005hmg01ijekhjxx	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-03	BEGINNER	WEEKLY	09:00	10:00	50	1	0	f	2026-06-29 14:39:57.847	2026-07-27 03:56:52.019	\N
cmqzbrqdd005jmg01lsrfq98k	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-03	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-29 14:40:36.673	2026-07-27 03:56:52.019	\N
cmqzbsa16005lmg01x3a4jtxl	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	FRI	2026-07-03	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-29 14:41:02.154	2026-07-27 03:56:52.019	\N
cmqzbsw1n005nmg01p1ci3ppa	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-03	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-29 14:41:30.683	2026-07-27 03:56:52.019	\N
cmqzbtc06005pmg01s13z6jmi	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-03	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-29 14:41:51.367	2026-07-27 03:56:52.019	\N
cmqzbttac005rmg01g4u63y8s	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-03	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-29 14:42:13.765	2026-07-27 03:56:52.019	\N
cmqrxr3ki001do701db3c865w	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-24	ALL_LEVELS	WEEKLY	18:00	19:00	50	6	2	f	2026-06-24 10:33:49.267	2026-07-27 03:56:52.019	\N
cmqrxrtiz001fo7017x6xlb5z	pilates-reformer	cmq40aidn0004wmkovcqw775u	WED	2026-06-24	BEGINNER	WEEKLY	19:00	20:00	50	6	2	f	2026-06-24 10:34:22.908	2026-07-27 03:56:52.019	\N
cmqmn7q3a0054od011mu7pqvg	mat-pilates	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-03	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 17:39:58.295	2026-07-27 03:56:52.019	\N
cmqmn8nci0056od01iw2kvnrk	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-03	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 17:40:41.394	2026-07-27 03:56:52.019	\N
cmqmzf89h00beod01p8u2mqil	coaching-prive	cmq407j3i0002wmko2bzj8hjy	FRI	2026-06-19	\N	WEEKLY	12:00	13:00	50	6	2	f	2026-06-20 23:21:43.829	2026-07-27 03:56:52.019	\N
cmqmzg1d400bgod013njn246u	mat-pilates	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-19	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 23:22:21.544	2026-07-27 03:56:52.019	\N
cmqmzgokp00biod01cswpv9rp	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-19	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 23:22:51.625	2026-07-27 03:56:52.019	\N
cmqmzhmz400bkod01vmahn0qn	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-19	BEGINNER	WEEKLY	18:00	19:00	50	6	2	f	2026-06-20 23:23:36.208	2026-07-27 03:56:52.019	\N
cmqmzijl200bmod01hlllzqkz	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-06-19	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 23:24:18.471	2026-07-27 03:56:52.019	\N
cmqmykgkd00aaod01jghobkg1	pilates-reformer	cmq40aidn0004wmkovcqw775u	TUE	2026-06-16	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-20 22:57:48.253	2026-07-27 03:56:52.019	\N
cmqmylrz800acod01a4hh0qsb	sans-cours	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-17	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 22:58:49.7	2026-07-27 03:56:52.019	\N
cmqmynapp00aeod01gdldjelr	coaching-prive	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-17	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 23:00:00.637	2026-07-27 03:56:52.019	\N
cmqmy4eww00a4od013ljxe6pg	mat-pilates	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-16	\N	WEEKLY	16:00	17:00	50	6	2	f	2026-06-20 22:45:19.616	2026-07-27 03:56:52.019	\N
cmqmzm7ir00bsod01z9nayr5w	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-06-20	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-06-20 23:27:09.459	2026-07-27 03:56:52.019	\N
cmqmzmzi400buod01gtmsi0f1	coaching-prive	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-21	\N	WEEKLY	08:00	09:00	50	6	2	f	2026-06-20 23:27:45.724	2026-07-27 03:56:52.019	\N
cmqmznnmc00bwod01td8cigev	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-21	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-20 23:28:16.98	2026-07-27 03:56:52.019	\N
cmqmzoes500byod01924zdeoy	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-21	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-20 23:28:52.182	2026-07-27 03:56:52.019	\N
cmqmzp2t900c0od01v65bexcf	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-06-21	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 23:29:23.325	2026-07-27 03:56:52.019	\N
cmqmycf3z00a6od011azj1g9o	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-06-16	BEGINNER	WEEKLY	17:00	18:00	50	6	2	f	2026-06-20 22:51:33.12	2026-07-27 03:56:52.019	\N
cmqmn9bs60058od01t8j8c4fd	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	WED	2026-06-03	BEGINNER	WEEKLY	11:00	12:00	50	6	2	f	2026-06-20 17:41:13.063	2026-07-27 03:56:52.019	\N
cmq9hw6eo001vwmysignfhne8	mat-pilates	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-25	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-11 12:50:01.2	2026-07-27 03:56:52.019	\N
cmqzbu918005tmg01vn3qffxk	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	FRI	2026-07-03	ALL_LEVELS	WEEKLY	19:00	20:00	50	6	2	f	2026-06-29 14:42:34.173	2026-07-27 03:56:52.019	\N
cmqzbv3yl005vmg01yavh0pvf	yoga	cmql83ep6000cod017esn6v7r	SAT	2026-07-04	\N	WEEKLY	09:00	10:00	50	6	2	f	2026-06-29 14:43:14.253	2026-07-27 03:56:52.019	\N
cmqzbvm2w005xmg01sausgthh	pilates-reformer	cmql83ep6000cod017esn6v7r	SAT	2026-07-04	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-29 14:43:37.736	2026-07-27 03:56:52.019	\N
cmqzbw2g5005zmg01znmn6j5u	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SAT	2026-07-04	BEGINNER	WEEKLY	11:15	12:15	50	6	2	f	2026-06-29 14:43:58.95	2026-07-27 03:56:52.019	\N
cmqzbwwxw0061mg01qu6o8mfh	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-05	ALL_LEVELS	WEEKLY	09:00	10:00	50	6	2	f	2026-06-29 14:44:38.468	2026-07-27 03:56:52.019	\N
cmqzbxamw0063mg01z3g0846i	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-05	BEGINNER	WEEKLY	10:00	11:00	50	6	2	f	2026-06-29 14:44:56.216	2026-07-27 03:56:52.019	\N
cmqzbxre80065mg01ewd495p6	mat-pilates	cmq407j3i0002wmko2bzj8hjy	SUN	2026-07-05	\N	WEEKLY	11:00	12:00	50	6	2	f	2026-06-29 14:45:17.937	2026-07-27 03:56:52.019	\N
cmq9hmcn5001lwmys8nou6sv5	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	SAT	2026-05-23	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 12:42:22.721	2026-07-27 03:56:52.019	\N
cmq9hn28k001nwmyss37n6104	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	SAT	2026-05-23	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 12:42:55.892	2026-07-27 03:56:52.019	\N
cmq9hnsku001pwmysnt64r7ka	pilates-reformer	cmq40aidn0004wmkovcqw775u	SUN	2026-05-24	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 12:43:30.03	2026-07-27 03:56:52.019	\N
cmq9ho9t2001rwmys7qn7hvdi	pilates-reformer	cmq40aidn0004wmkovcqw775u	SUN	2026-05-24	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 12:43:52.358	2026-07-27 03:56:52.019	\N
cmq9i5qul002fwmysbtfm6z6i	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-26	ALL_LEVELS	WEEKLY	11:00	12:00	50	6	2	f	2026-06-11 12:57:27.452	2026-07-27 03:56:52.019	\N
cmq9i85cz002lwmysz2ljclrk	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	TUE	2026-05-26	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-11 12:59:19.715	2026-07-27 03:56:52.019	\N
cmq9i0qjd0023wmysjzi6fo59	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	MON	2026-05-25	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-11 12:53:33.913	2026-07-27 03:56:52.019	\N
cmq9hum75001twmyslo2e0ghs	coaching-prive	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-25	\N	WEEKLY	08:00	09:00	50	1	0	f	2026-06-11 12:48:48.354	2026-07-27 03:56:52.019	\N
cmq9i4xt5002dwmys5v7vckxt	mat-pilates	cmq407j3i0002wmko2bzj8hjy	TUE	2026-05-26	\N	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 12:56:49.961	2026-07-27 03:56:52.019	\N
cmq9ez4dc0005wmyslxmkno99	pilates-reformer	cmq407j3i0002wmko2bzj8hjy	MON	2026-05-18	ALL_LEVELS	WEEKLY	10:00	11:00	50	6	2	f	2026-06-11 11:28:19.68	2026-07-27 03:56:52.019	\N
cmq9fjtnr000rwmyskcdppnns	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-05-20	ALL_LEVELS	WEEKLY	15:00	16:00	50	6	2	f	2026-06-11 11:44:25.575	2026-07-27 03:56:52.019	\N
cmq9flabd000vwmysg3sih6hl	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	WED	2026-05-20	ALL_LEVELS	WEEKLY	17:00	18:00	50	6	2	f	2026-06-11 11:45:33.817	2026-07-27 03:56:52.019	\N
cmq9fo89h0011wmyszetbt2iy	pilates-reformer	cmq40bvbx0005wmkonbu4odyv	THU	2026-05-21	ALL_LEVELS	WEEKLY	16:00	17:00	50	6	2	f	2026-06-11 11:47:51.125	2026-07-27 03:56:52.019	\N
\.


--
-- Data for Name: qrcodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qrcodes (id, "publicId", "qrKey", name, status, "assignedMemberId", "createdByUserId", "assignedAt", "createdAt", "updatedAt", "assignedCoachId") FROM stdin;
cmp4ili4r001gl401p36nc3tr	408ffcff9a96b02ecc491052	2357	Nouveau QR 51	DRAFT	cmpdskdbb00e0p401bi55y2g7	admin_aurapilates_001	2026-05-20 06:20:08.429	2026-05-13 18:31:09.579	2026-05-20 06:20:08.43	\N
cmp4ili3k001fl401skpck5v6	f6755a2ffc8ca7b4c272b741	5706	Nouveau QR 50	DRAFT	cmpfdk63200ebp401atbgmxt9	admin_aurapilates_001	2026-05-21 08:55:37.173	2026-05-13 18:31:09.536	2026-05-21 08:55:37.174	\N
cmp4ili1k001dl401yzkmfev7	74f26a5d7578312bf9f60184	6372	Nouveau QR 48	DRAFT	cmph5kmv300f7p401b8x8jouu	admin_aurapilates_001	2026-05-22 14:47:34.341	2026-05-13 18:31:09.464	2026-05-22 14:47:34.342	\N
cmp4ili0k001cl401t6u7vv8j	fa41657e3cba410d38194dde	9232	Nouveau QR 47	DRAFT	cmpi6ban400fip401ppm9o7wy	admin_aurapilates_001	2026-05-23 07:56:04.395	2026-05-13 18:31:09.429	2026-05-23 07:56:04.396	\N
cmp4ilhzc001bl401ztxxxmzs	7c0db7e0e826e160129dec69	2847	Nouveau QR 46	DRAFT	cmpmhc40500h9p40180sb0edr	admin_aurapilates_001	2026-05-26 08:15:42.924	2026-05-13 18:31:09.384	2026-05-26 08:15:42.925	\N
cmp4ilhyc001al401tsrji869	36d10f952853af9681ec1cc5	3355	Nouveau QR 45	DRAFT	cmpqvd4pp00hkp401fok0cwt8	admin_aurapilates_001	2026-05-29 09:59:29.826	2026-05-13 18:31:09.349	2026-05-29 09:59:29.827	\N
cmp4ilhxb0019l401gcor8zvd	4af4d1ebb495bf6819d6451a	7100	Nouveau QR 44	DRAFT	cmps12dpz00hvp401tesxyqev	admin_aurapilates_001	2026-05-30 05:26:52.158	2026-05-13 18:31:09.312	2026-05-30 05:26:52.159	\N
cmp4ilhva0017l401i7rw2h4t	e06e391757e506bdb76012bb	4342	Nouveau QR 42	DRAFT	cmpuxbc7900i9p401d4rkyuom	admin_aurapilates_001	2026-06-01 06:05:10.153	2026-05-13 18:31:09.239	2026-06-01 06:05:10.154	\N
cmp4ilhub0016l4010db4g56u	b719c38084be50b3314c5eb5	5752	Nouveau QR 41	DRAFT	cmpuxgfvo00iep401kuin241v	admin_aurapilates_001	2026-06-01 06:09:08.201	2026-05-13 18:31:09.204	2026-06-01 06:09:08.202	\N
cmp4ilhtc0015l401kgz1d04z	f6cf99dbecd3936ba04fbdc1	6298	Nouveau QR 40	DRAFT	cmpuxlbuw00ijp4016pmesm29	admin_aurapilates_001	2026-06-01 06:12:56.27	2026-05-13 18:31:09.168	2026-06-01 06:12:56.271	\N
cmp4ilhsc0014l4010lifo63c	e57f9a72ef22c2fa92a1b790	4015	Nouveau QR 39	DRAFT	cmpuxpn4l00iop40156zk6rje	admin_aurapilates_001	2026-06-01 06:16:17.5	2026-05-13 18:31:09.132	2026-06-01 06:16:17.501	\N
cmp4ilhrd0013l401w38wolhj	09e3d79656d641a8b69a6a15	3671	Nouveau QR 38	DRAFT	cmpuxyh5x00itp401pqas19s7	admin_aurapilates_001	2026-06-01 06:23:09.677	2026-05-13 18:31:09.098	2026-06-01 06:23:09.678	\N
cmp4ilhqd0012l401mpn5fove	337ac84c83628cbcd501d66e	1660	Nouveau QR 37	DRAFT	cmpv004tl00iyp4017n7rkxr5	admin_aurapilates_001	2026-06-01 07:20:26.221	2026-05-13 18:31:09.062	2026-06-01 07:20:26.222	\N
cmp4ilhob0010l401dw9lc987	081b972fdec00ec6655ab9dc	6142	Nouveau QR 35	DRAFT	cmpwo5qcf00jgp401y23i6i2r	admin_aurapilates_001	2026-06-02 11:24:24.359	2026-05-13 18:31:08.987	2026-06-02 11:24:24.36	\N
cmp4ilhna000zl401fbndzfm4	5fec8c2f903f5ec35d5e9930	3169	Nouveau QR 34	DRAFT	cmpxt9h9d00jnp401acy1ppf1	admin_aurapilates_001	2026-06-03 06:35:03.463	2026-05-13 18:31:08.95	2026-06-03 06:35:03.464	\N
cmp4ilhmb000yl401zc3u4b20	a9f4ecd19c71825b64b5f34c	4762	Nouveau QR 33	DRAFT	cmpxtbvan00jsp401dbkqvo9n	admin_aurapilates_001	2026-06-03 06:36:54.965	2026-05-13 18:31:08.915	2026-06-03 06:36:54.965	\N
cmp4ilhla000xl4018gbziq9m	d6ab99702b02c225968d5079	2225	Nouveau QR 32	DRAFT	cmpxtdnho00jxp401mtude4xv	admin_aurapilates_001	2026-06-03 06:38:18.161	2026-05-13 18:31:08.878	2026-06-03 06:38:18.162	\N
cmp4ilhk0000wl401vhkv97a1	2a5ae93ca877718c9eaa82b1	5088	Nouveau QR 31	DRAFT	cmpxtfc9z00k2p401mfev8i51	admin_aurapilates_001	2026-06-03 06:39:36.941	2026-05-13 18:31:08.832	2026-06-03 06:39:36.942	\N
cmp4ilhhr000ul401rok0gp28	ea10b8d4500430f313a57bcc	9563	Nouveau QR 29	DRAFT	cmpya6nur00kgp401et6xel9m	admin_aurapilates_001	2026-06-03 14:28:45.514	2026-05-13 18:31:08.751	2026-06-03 14:28:45.515	\N
cmp4ilhgs000tl401f66mvjmx	19018d30f442bcb73b1c6531	8126	Nouveau QR 28	DRAFT	cmpzh61qy00kpp401u52chqfx	admin_aurapilates_001	2026-06-04 10:32:00.352	2026-05-13 18:31:08.717	2026-06-04 10:32:00.353	\N
cmp4ilhfv000sl401f7oxu1kj	bb1cc92a3c827ca3cece7d2d	7152	Nouveau QR 27	DRAFT	cmpzp6len00kwp4012mdrq8ka	admin_aurapilates_001	2026-06-04 14:16:22.758	2026-05-13 18:31:08.684	2026-06-04 14:16:22.758	\N
cmp4ilhey000rl4010pz10xsg	a91d136821ae72205a5df3e3	8099	Nouveau QR 26	DRAFT	cmq251ruu00l5p4010gsntqmg	admin_aurapilates_001	2026-06-06 07:16:04.045	2026-05-13 18:31:08.65	2026-06-06 07:16:04.045	\N
cmp4ilhdz000ql401319py43r	19a2ba357a8fab76a15677ee	2481	Nouveau QR 25	DRAFT	cmq254vcp00lap401whu604y8	admin_aurapilates_001	2026-06-06 07:18:28.544	2026-05-13 18:31:08.616	2026-06-06 07:18:28.545	\N
cmp4iljj9002tl401e85jjyff	b6f0ab891446ffdb6e69e44e	5780	Nouveau QR 100	DRAFT	cmp580zx2006el401ov0q9nd9	admin_aurapilates_001	2026-05-14 06:23:02.878	2026-05-13 18:31:11.397	2026-05-14 06:23:02.879	\N
cmp4iljhd002rl401rb24c6xb	6c32c41306326d28f949c2d6	5722	Nouveau QR 98	DRAFT	cmp5cjt07006sl401hpc0r3sj	admin_aurapilates_001	2026-05-14 08:29:38.846	2026-05-13 18:31:11.329	2026-05-14 08:29:38.847	\N
cmp4ilgpd0004l401aqsgm1em	e4c81bb14d394e37a8445bab	1009	Nouveau QR 03	ACTIVE	cmqf2b41m000pwmtsgzlybd2p	admin_aurapilates_001	2026-06-21 08:25:53.957	2026-05-13 18:31:07.729	2026-06-21 08:25:53.958	\N
cmp4ilgqn0005l401wpkxcxua	ac7075830814ca6e87f8e41c	0581	Nouveau QR 04	ACTIVE	cmqf2b40z000jwmtsglaha6m4	admin_aurapilates_001	2026-06-21 08:27:41.987	2026-05-13 18:31:07.776	2026-06-21 08:27:41.987	\N
cmp4ilgsv0007l401erz0ln9b	2bb5804774877737577a59ac	2413	Nouveau QR 06	ACTIVE	cmqf2b3z80007wmtsodeuow25	admin_aurapilates_001	2026-06-21 08:30:33.049	2026-05-13 18:31:07.856	2026-06-21 08:30:33.05	\N
cmp4ilgty0008l401qy8gus91	f7957fb05606d00a8c63e79c	6345	Nouveau QR 07	ACTIVE	cmqf2b3xg0001wmtsjmoqct8a	admin_aurapilates_001	2026-06-21 08:31:44.913	2026-05-13 18:31:07.894	2026-06-21 08:31:44.913	\N
cmp4ilguz0009l40140e9n2mn	bb46baabca8fdea72b2cf89d	4522	Nouveau QR 08	ACTIVE	cmqnjhe4500c7od01xunmmhyz	admin_aurapilates_001	2026-06-21 08:43:17.055	2026-05-13 18:31:07.931	2026-06-21 08:43:17.056	\N
cmp4ilgw5000al401etvygx20	a15218f1a03f85c852b4c80a	9220	Nouveau QR 09	ACTIVE	cmqnjmmn900ceod01dz6unzwp	admin_aurapilates_001	2026-06-21 08:47:21.389	2026-05-13 18:31:07.973	2026-06-21 08:47:21.389	\N
cmp4ilgxg000bl401sgs5ft9y	44940720fbd9bd3edf095703	0713	Nouveau QR 10	ACTIVE	cmqnjvfwv00clod01smhvf5v7	admin_aurapilates_001	2026-06-21 08:54:12.572	2026-05-13 18:31:08.021	2026-06-21 08:54:12.573	\N
cmp4ilgyh000cl401z2f7j96l	4780fc1534d48abe79e41c35	7756	Nouveau QR 11	ACTIVE	cmqnlllpk00csod01wkefk1ot	admin_aurapilates_001	2026-06-21 09:42:32.754	2026-05-13 18:31:08.057	2026-06-21 09:42:32.755	\N
cmp4ilh7b000kl401uz15yi9g	77c5af1ebbdfb09f303f725e	7917	Nouveau QR 19	ACTIVE	cmqnnz1kg00d8od0103g8czza	admin_aurapilates_001	2026-06-21 10:48:59.068	2026-05-13 18:31:08.376	2026-06-21 10:48:59.069	\N
cmp4ilh0j000el4019v1kmlwd	f9d1341279e5e466f63ace9d	1799	Nouveau QR 13	ACTIVE	cmqno2ywp00dfod01x3mtrdjg	admin_aurapilates_001	2026-06-21 10:52:02.245	2026-05-13 18:31:08.131	2026-06-21 10:52:02.246	\N
cmp4ilh1l000fl401nf4sovq9	8fb3d23fd9d269bb22ad0fd8	0128	Nouveau QR 14	ACTIVE	cmqno5z2j00dlod0156ophlux	admin_aurapilates_001	2026-06-21 10:54:22.421	2026-05-13 18:31:08.17	2026-06-21 10:54:22.422	\N
cmp4ilh2p000gl4014hja6sj5	bc1afd81e2aad0ecf3527968	3283	Nouveau QR 15	ACTIVE	cmr66zk2400b3mm01nzav5tty	admin_aurapilates_001	2026-07-09 09:30:34.125	2026-05-13 18:31:08.209	2026-07-09 09:30:34.126	\N
cmp4ilh45000hl401gzgevy5e	96fa17d041f4d860c4a2254b	8553	Nouveau QR 16	ACTIVE	cmr91dvvk00ddmm01yvoi91dd	admin_aurapilates_001	2026-07-09 09:31:53.121	2026-05-13 18:31:08.261	2026-07-09 09:31:53.122	\N
cmp4ilhc1000ol40198zbi60q	8bcb1b35acbf5e9218381c38	0814	Nouveau QR 23	ACTIVE	cmrbure45000vmn014ppcw3bv	admin_aurapilates_001	2026-07-09 09:34:03.377	2026-05-13 18:31:08.545	2026-07-09 09:34:03.378	\N
cmp4ilhd0000pl40176dsgtt4	9c2fb4dc065a3756718c34f9	3918	Nouveau QR 24	ACTIVE	cmrbwaec5001dmn01can4i9wf	admin_aurapilates_001	2026-07-09 09:35:55.069	2026-05-13 18:31:08.581	2026-07-09 09:35:55.07	\N
cmp4ilh5e000il4012eajt7yw	4518a11b87eb0c83c1d63cbf	1513	Nouveau QR 17	ACTIVE	cmqpbpjdd001llk01e8vm535o	admin_aurapilates_001	2026-07-09 09:40:41.447	2026-05-13 18:31:08.306	2026-07-09 09:40:41.448	\N
cmp4ilh6d000jl401qw73ivy9	5e67ea61a12f1a75fdacdb17	1192	Nouveau QR 18	ACTIVE	cmrf1sef700lbmn01oewtlk1z	admin_aurapilates_001	2026-07-10 14:46:09.948	2026-05-13 18:31:08.341	2026-07-10 14:46:09.948	\N
cmp4ilh9b000ml401ztxszj48	d6f3b03829c8bf3c351f9e79	2304	Nouveau QR 21	ACTIVE	cmruxoqq5000zo901ix6vukw5	admin_aurapilates_001	2026-07-21 17:35:00.186	2026-05-13 18:31:08.448	2026-07-21 17:35:00.187	\N
cmp4iljgc002ql401zfsf7nme	a4e71f0e163a6525a55908b3	5554	Nouveau QR 97	DRAFT	cmp5d9vn5006zl401fo5j5q04	admin_aurapilates_001	2026-05-14 08:49:55.319	2026-05-13 18:31:11.292	2026-05-14 08:49:55.32	\N
cmp4iljf8002pl401yxf5sm0u	c5c595f99f9c669f1b73db8a	6190	Nouveau QR 96	DRAFT	cmp5dd5sd0074l401pv3drst8	admin_aurapilates_001	2026-05-14 08:52:28.433	2026-05-13 18:31:11.253	2026-05-14 08:52:28.434	\N
cmp4ilje8002ol401bywj36km	8a2e9847863c2b335af0c55e	9641	Nouveau QR 95	DRAFT	cmp5doqck0079l4013c3pypy1	admin_aurapilates_001	2026-05-14 09:01:28.298	2026-05-13 18:31:11.216	2026-05-14 09:01:28.299	\N
cmp4iljd6002nl401ezi449ti	74558c96be64f72d13d41f39	5221	Nouveau QR 94	DRAFT	cmp5e2po6007el401m0wr4bxe	admin_aurapilates_001	2026-05-14 09:12:20.606	2026-05-13 18:31:11.178	2026-05-14 09:12:20.607	\N
cmp4iljc4002ml401mqva8aqx	187bf58cbf5fb8540f67c994	9937	Nouveau QR 93	DRAFT	cmp5i45nq000ap401mr5kujgq	admin_aurapilates_001	2026-05-14 11:05:26.446	2026-05-13 18:31:11.14	2026-05-14 11:05:26.447	\N
cmp4iljb8002ll401q9hk8ohv	58990a94d4d32094a3ba046a	7871	Nouveau QR 92	DRAFT	cmp5lkgat000fp4013f720b0o	admin_aurapilates_001	2026-05-14 12:42:05.58	2026-05-13 18:31:11.108	2026-05-14 12:42:05.581	\N
cmp4iljab002kl401ww7lgm0r	df40603229f8afe9dfca1baa	7144	Nouveau QR 91	DRAFT	cmp5nv1lh000mp4013w3oizro	admin_aurapilates_001	2026-05-14 13:46:18.972	2026-05-13 18:31:11.076	2026-05-14 13:46:18.973	\N
cmp4ilj92002jl401fk1sau1y	ceb4f8dd40048e209f276a1e	9853	Nouveau QR 90	DRAFT	cmp5qutpd0015p401e0b83fu9	admin_aurapilates_001	2026-05-14 15:10:07.591	2026-05-13 18:31:11.03	2026-05-14 15:10:07.591	\N
cmp4ilj7x002il4014l88u0be	81cccc019fb1ecadf02bef8f	3405	Nouveau QR 89	DRAFT	cmp5qzr8e001ap401fa4uuzw4	admin_aurapilates_001	2026-05-14 15:13:57.667	2026-05-13 18:31:10.989	2026-05-14 15:13:57.668	\N
cmp4ilj6s002hl401ozf7q91f	7fff7b9884883048deace3d0	4927	Nouveau QR 88	DRAFT	cmp5r29es001fp401vky62ly4	admin_aurapilates_001	2026-05-14 15:15:54.537	2026-05-13 18:31:10.949	2026-05-14 15:15:54.537	\N
cmp4ilj5n002gl401dg8zgey8	7536491951292f15c41b0452	0507	Nouveau QR 87	DRAFT	cmp5r6eqa001kp401z95m2mtr	admin_aurapilates_001	2026-05-14 15:19:08.057	2026-05-13 18:31:10.908	2026-05-14 15:19:08.058	\N
cmp4iljic002sl401cwp600bp	6a3111f3ed6de86eb6a60403	3156	Nouveau QR 99	DRAFT	cmp6maci6002tp40119cnxlu3	admin_aurapilates_001	2026-05-15 05:49:59.893	2026-05-13 18:31:11.364	2026-05-15 05:49:59.894	\N
cmp4ilj4i002fl401hd4t52ov	3ee265fddae1b138679d321d	8871	Nouveau QR 86	DRAFT	cmp6me3mt002yp401esc9ykn5	admin_aurapilates_001	2026-05-15 05:52:55.019	2026-05-13 18:31:10.867	2026-05-15 05:52:55.02	\N
cmp4ilj3f002el401l7yacu2y	14ad0a302217ab0ac48b8b12	2026	Nouveau QR 85	DRAFT	cmp6mh9mn0033p401xa6v43p7	admin_aurapilates_001	2026-05-15 05:55:22.754	2026-05-13 18:31:10.827	2026-05-15 05:55:22.755	\N
cmp4ilj1d002cl401waz91w4s	50a7849946da6f19ac2a1c63	3731	Nouveau QR 83	DRAFT	cmp6mqu0z003dp401zgzrluwq	admin_aurapilates_001	2026-05-15 06:02:49.094	2026-05-13 18:31:10.754	2026-05-15 06:02:49.095	\N
cmp4ilj0f002bl401a9rynczt	89bb4a80bb480929b0c9502b	5613	Nouveau QR 82	DRAFT	cmp6mujhf003ip4019yxl5iri	admin_aurapilates_001	2026-05-15 06:05:42.056	2026-05-13 18:31:10.719	2026-05-15 06:05:42.057	\N
cmp4ilizh002al401fhz2u4eo	958c3104ca92948bd7b52d2d	8320	Nouveau QR 81	DRAFT	cmp6mxgtj003np401n6d3md2o	admin_aurapilates_001	2026-05-15 06:07:58.571	2026-05-13 18:31:10.685	2026-05-15 06:07:58.572	\N
cmp4iliyi0029l401djkfmktk	52a1d1ffc0635c7fe700d99b	1657	Nouveau QR 80	DRAFT	cmp6n0r9g003sp401svwhqzjy	admin_aurapilates_001	2026-05-15 06:10:32.075	2026-05-13 18:31:10.65	2026-05-15 06:10:32.075	\N
cmp4ilixi0028l401bqlw19rr	f930b200f173d0b2b253300e	1048	Nouveau QR 79	DRAFT	cmp6n445r003xp4019r22o12e	admin_aurapilates_001	2026-05-15 06:13:08.757	2026-05-13 18:31:10.614	2026-05-15 06:13:08.758	\N
cmp4ilivl0026l4011u0ammho	82ea5be24e5efb00500c6a07	1462	Nouveau QR 77	DRAFT	cmp6n9pyb0047p401exgskztu	admin_aurapilates_001	2026-05-15 06:17:30.281	2026-05-13 18:31:10.546	2026-05-15 06:17:30.282	\N
cmp4ilium0025l4010f6pdcp7	bf4c670a35219a063073306d	9371	Nouveau QR 76	DRAFT	cmp6ndov4004cp4011gucmmzn	admin_aurapilates_001	2026-05-15 06:20:35.495	2026-05-13 18:31:10.51	2026-05-15 06:20:35.495	\N
cmp4ilitj0024l401tfvesr61	1e85cd15b5623d2ac32f7e76	5544	Nouveau QR 75	DRAFT	cmp6tmko3004rp4010ev8s38b	admin_aurapilates_001	2026-05-15 09:15:27.657	2026-05-13 18:31:10.471	2026-05-15 09:15:27.658	\N
cmp4ilisj0023l401z8v69een	2f5cf590f157872a4592ad25	1131	Nouveau QR 74	DRAFT	cmp6vndph004yp401vluusox7	admin_aurapilates_001	2026-05-15 10:12:04.526	2026-05-13 18:31:10.435	2026-05-15 10:12:04.527	\N
cmp4ilirl0022l4019br3ebcc	d867b89be32b9783d8499a76	8730	Nouveau QR 73	DRAFT	cmp6ywfdb0055p401dvfsqap4	admin_aurapilates_001	2026-05-15 11:43:05.428	2026-05-13 18:31:10.401	2026-05-15 11:43:05.429	\N
cmp4iliqm0021l4010ptsiyjz	d5588125258055f51d8fbe2f	1818	Nouveau QR 72	DRAFT	cmp71pbmj005ip401rxsl0n27	admin_aurapilates_001	2026-05-15 13:01:32.837	2026-05-13 18:31:10.367	2026-05-15 13:01:32.838	\N
cmp4iliol001zl4013o5x7qgn	2c819327057d798599fe251f	2557	Nouveau QR 70	DRAFT	cmp80zids006np4015qmgm2k4	admin_aurapilates_001	2026-05-16 05:29:14.711	2026-05-13 18:31:10.294	2026-05-16 05:29:14.712	\N
cmp4ilinn001yl401w1e7kh75	21f30e419a4cbec1ddd1ad9c	7236	Nouveau QR 69	DRAFT	cmp87ym20006yp401590xadl0	admin_aurapilates_001	2026-05-16 08:44:30.126	2026-05-13 18:31:10.259	2026-05-16 08:44:30.127	\N
cmp4ilimg001xl401cuqih1qo	0f5860dfc04060ecbcbbed13	1132	Nouveau QR 68	DRAFT	cmp88f7g90073p401w4uw4pqs	admin_aurapilates_001	2026-05-16 08:57:24.352	2026-05-13 18:31:10.217	2026-05-16 08:57:24.353	\N
cmp4ililj001wl401oufx6wtj	12ff71fba692c492f00cd258	1926	Nouveau QR 67	DRAFT	cmp8b0p5m0078p401ko5fipst	admin_aurapilates_001	2026-05-16 10:10:06.306	2026-05-13 18:31:10.184	2026-05-16 10:10:06.307	\N
cmp4ilikj001vl401d1egog92	d1651552a0408cb637bfc5a0	9153	Nouveau QR 66	DRAFT	cmp9jyb2l009tp4012t706wff	admin_aurapilates_001	2026-05-17 07:07:57.459	2026-05-13 18:31:10.148	2026-05-17 07:07:57.46	\N
cmp4iliii001tl401k03ypudp	a55a2dcb97d9360d4b47446a	6768	Nouveau QR 64	DRAFT	cmp9l6t2c00acp4018v82zolp	admin_aurapilates_001	2026-05-17 07:42:33.644	2026-05-13 18:31:10.075	2026-05-17 07:42:33.646	\N
cmp4ilihh001sl4014dqt4cg0	41d5a753b01f9132148cc87c	4167	Nouveau QR 63	DRAFT	cmp9n16yg00aqp401yfgd8zit	admin_aurapilates_001	2026-05-17 08:34:10.942	2026-05-13 18:31:10.038	2026-05-17 08:34:10.943	\N
cmp4iligg001rl401hm421w0g	778f5044c35dc8f7a2ce27f2	1207	Nouveau QR 62	DRAFT	cmp9oxt9w00avp401sfiouy8l	admin_aurapilates_001	2026-05-17 09:27:32.476	2026-05-13 18:31:10.001	2026-05-17 09:27:32.477	\N
cmp4ilifh001ql401nh79itjl	6da34c6b96e2ca22aff69ee0	8257	Nouveau QR 61	DRAFT	cmp9p95jj00b2p401dqlrtohp	admin_aurapilates_001	2026-05-17 09:36:21.591	2026-05-13 18:31:09.966	2026-05-17 09:36:21.591	\N
cmp4iliek001pl401bbku7y8m	89e2a35a192efc5c0d9586e1	9824	Nouveau QR 60	DRAFT	cmp9pbn9j00b7p401wd3w8sn0	admin_aurapilates_001	2026-05-17 09:38:17.867	2026-05-13 18:31:09.932	2026-05-17 09:38:17.868	\N
cmp4ilicp001nl401rjsqzoko	b318dcd50a0333a5b3fa5246	9317	Nouveau QR 58	DRAFT	cmp9uagwy00bnp401aww8aab6	admin_aurapilates_001	2026-05-17 11:57:21.064	2026-05-13 18:31:09.865	2026-05-17 11:57:21.065	\N
cmp4ilibm001ml401wwu0kizs	60cf525e59dba4bd73fd69b9	1150	Nouveau QR 57	DRAFT	cmpazudle00byp401oz4zx3e1	admin_aurapilates_001	2026-05-18 07:20:34.135	2026-05-13 18:31:09.826	2026-05-18 07:20:34.136	\N
cmp4iliad001ll401uhrhmnna	9ffde96e71a29e9858218a39	7508	Nouveau QR 56	DRAFT	cmpb23ldo00c7p401ut25a8kv	admin_aurapilates_001	2026-05-18 08:23:43.362	2026-05-13 18:31:09.782	2026-05-18 08:23:43.363	\N
cmp4ili98001kl401nvuemw5e	2ec8beb70ba1dcbb2861c9e0	2960	Nouveau QR 55	DRAFT	cmpb26l0900ccp4014tau0gjw	admin_aurapilates_001	2026-05-18 08:26:02.847	2026-05-13 18:31:09.741	2026-05-18 08:26:02.848	\N
cmp4ili85001jl401ntcabvbi	abd7937549af0a46e292dd06	3037	Nouveau QR 54	DRAFT	cmpbet54q00cpp4015io1o59b	admin_aurapilates_001	2026-05-18 14:19:30.755	2026-05-13 18:31:09.702	2026-05-18 14:19:30.756	\N
cmp4ili6y001il401bubykpv6	d19821339bef01ece5fb676c	3673	Nouveau QR 53	DRAFT	cmpcdicon00d0p401ddbj8mmg	admin_aurapilates_001	2026-05-19 06:30:53.885	2026-05-13 18:31:09.659	2026-05-19 06:30:53.886	\N
cmp4ilj2b002dl401n1poeaov	425700f661df9d81df0d0412	5821	Nouveau QR 84	DRAFT	cmp6mkxvt0038p401gsyxjp1p	admin_aurapilates_001	2026-05-15 05:58:14.163	2026-05-13 18:31:10.788	2026-05-15 05:58:14.164	\N
cmp4iliwl0027l4017ba9holj	6c909c0c9000ca1fb69e01c9	1065	Nouveau QR 78	DRAFT	cmp6n6c330042p401572wyy97	admin_aurapilates_001	2026-05-15 06:14:52.341	2026-05-13 18:31:10.581	2026-05-15 06:14:52.342	\N
cmp4ilipi0020l401yh44nrdc	8119417e8a22a3bbdf8d226b	4470	Nouveau QR 71	DRAFT	cmp76c7ig005vp401qbizrga9	admin_aurapilates_001	2026-05-15 15:11:19.056	2026-05-13 18:31:10.327	2026-05-15 15:11:19.057	\N
cmp4ili2k001el401dfbz8uer	d49f0b1d19f18b97a13b4de5	0368	Nouveau QR 49	DRAFT	cmpfpx1dd00ekp4015zb7hrup	admin_aurapilates_001	2026-05-21 14:41:32.984	2026-05-13 18:31:09.5	2026-05-21 14:41:32.985	\N
cmp4ilhwb0018l40112usq5nc	7d60eaa7218b28c25236b325	2962	Nouveau QR 43	DRAFT	cmpux8mfw00i4p401v4t85sji	admin_aurapilates_001	2026-06-01 06:03:03.458	2026-05-13 18:31:09.275	2026-06-01 06:03:03.459	\N
cmp4iliji001ul4012a612ajq	9e1c4c1aeb602c7aea70b122	8416	Nouveau QR 65	DRAFT	cmp9muoo600alp401b1jj91hv	admin_aurapilates_001	2026-05-17 08:29:07.308	2026-05-13 18:31:10.111	2026-05-17 08:29:07.308	\N
cmp4ilidm001ol4014hucp3an	af146d52396282789cddb52b	7676	Nouveau QR 59	DRAFT	cmp9u530f00bip401o3641wtg	admin_aurapilates_001	2026-05-17 11:53:09.764	2026-05-13 18:31:09.898	2026-05-17 11:53:09.765	\N
cmp4ili5u001hl401oggkmm2m	f61324f2096e8391a20ccee7	9060	Nouveau QR 52	DRAFT	cmpcfa7e300d9p401ktuwubni	admin_aurapilates_001	2026-05-19 07:20:33.011	2026-05-13 18:31:09.618	2026-05-19 07:20:33.012	\N
cmp4ilhpd0011l401ap2gvvke	db45a4fc41ec231983f6d392	6855	Nouveau QR 36	DRAFT	cmpvehn3c00j7p401p14lsb1d	admin_aurapilates_001	2026-06-01 14:05:57.678	2026-05-13 18:31:09.025	2026-06-01 14:05:57.679	\N
cmp4ilhip000vl4018ptitdlr	0afa4cf6de1b5dbbe4147a24	1898	Nouveau QR 30	DRAFT	cmpxths4t00k7p401ms2nx4f0	admin_aurapilates_001	2026-06-03 06:41:30.802	2026-05-13 18:31:08.786	2026-06-03 06:41:30.803	\N
cmp4ilgln0002l401wfesr9ft	753ded377633e2a255c522c0	6113	Nouveau QR 01	ACTIVE	cmqf2b43f0011wmts29fvfire	admin_aurapilates_001	2026-06-21 08:23:18.864	2026-05-13 18:31:07.595	2026-06-21 08:23:18.865	\N
cmp4ilgo70003l4017vb21few	cd4a9eb22a8004e8f711b311	8874	Nouveau QR 02	ACTIVE	cmqf2b42m000vwmtsnd6eu11l	admin_aurapilates_001	2026-06-21 08:24:24.776	2026-05-13 18:31:07.687	2026-06-21 08:24:24.777	\N
cmp4ilgru0006l401yn3fglj9	0c53268b32b3cb8b39eae2eb	1766	Nouveau QR 05	ACTIVE	cmqf2b405000dwmtsddcf7agj	admin_aurapilates_001	2026-06-21 08:28:42.726	2026-05-13 18:31:07.819	2026-06-21 08:28:42.726	\N
cmp4ilgzj000dl401t44dx4we	aa2eb4043161dfc7b9ba8e0e	6614	Nouveau QR 12	ACTIVE	cmqnlovfk00czod0169336zw1	admin_aurapilates_001	2026-06-21 09:45:05.32	2026-05-13 18:31:08.095	2026-06-21 09:45:05.321	\N
cmqrvqskc000csc01xlcfuqz7	3671d8242ab98d7ca6e2307f	9950	Coach Hela Friga	ACTIVE	\N	admin_aurapilates_001	2026-06-24 09:37:35.772	2026-06-24 09:37:35.772	2026-06-24 09:37:35.772	cmq407j3i0002wmko2bzj8hjy
cmqtdtd1m00igo701cd83one5	2241912a59ec5f43f36918e6	5626	Coach Nourhene Dhif	ACTIVE	\N	admin_aurapilates_001	2026-06-25 10:51:14.889	2026-06-25 10:51:14.89	2026-06-25 10:51:14.89	cmq40bvbx0005wmkonbu4odyv
cmr9an1ly00fjmm01lcsaz0ud	3f05d58bef8dfac099de3200	5858	Nouveau QR 033	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.103	2026-07-06 14:06:40.103	\N
cmr9an1mw00fkmm01zasjgnn7	78fa280a7fc998080600e83a	8561	Nouveau QR 034	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.136	2026-07-06 14:06:40.136	\N
cmr9an1nw00flmm01vl7zvpy1	53802938da8ef28f55981da6	4853	Nouveau QR 035	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.172	2026-07-06 14:06:40.172	\N
cmr9an1ov00fmmm019bt5356k	71d3e89bf22f8b19c65ad38f	5198	Nouveau QR 036	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.208	2026-07-06 14:06:40.208	\N
cmr9an1py00fnmm01b2fypbhm	b1267d381476d2d909188b47	3961	Nouveau QR 037	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.246	2026-07-06 14:06:40.246	\N
cmr9an1r200fomm01jh29u0rl	3642ef12a29b47701ace4724	3353	Nouveau QR 038	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.286	2026-07-06 14:06:40.286	\N
cmr9an0nd00eomm01neekfax6	31da4ade9769cc3f6d6465c3	9089	Nouveau QR 002	ACTIVE	cmqqimbo30011p9015ihys621	admin_aurapilates_001	2026-07-06 14:42:30.87	2026-07-06 14:06:38.857	2026-07-06 14:42:30.87	\N
cmr9an0pg00eqmm01eo3jktov	5cd09e06153e352e4a238fb2	6460	Nouveau QR 004	ACTIVE	cmqqihcm6000np901ub12rzon	admin_aurapilates_001	2026-07-06 14:44:49.97	2026-07-06 14:06:38.933	2026-07-06 14:44:49.971	\N
cmr9an0ql00ermm01au257hj2	3b2130f56ec5f44a963e8c2d	7141	Nouveau QR 005	ACTIVE	cmqqio1g50018p9018hz9fq36	admin_aurapilates_001	2026-07-09 09:20:40.877	2026-07-06 14:06:38.974	2026-07-09 09:20:40.877	\N
cmr9an0rq00esmm01i6vlbe0n	b606458af2153b4f90622410	9602	Nouveau QR 006	ACTIVE	cmqqipr55001fp9010qryqpgy	admin_aurapilates_001	2026-07-09 09:21:18.718	2026-07-06 14:06:39.014	2026-07-09 09:21:18.718	\N
cmr9an0sv00etmm011x9kx9w0	c8ce4852c2e334c20c858152	6521	Nouveau QR 007	ACTIVE	cmqw8ec6p0010mg01ce7hdn33	admin_aurapilates_001	2026-07-09 09:22:00.296	2026-07-06 14:06:39.056	2026-07-09 09:22:00.297	\N
cmr9an0uw00evmm011dkf86vo	b9820f4dc19433c0a6749e6c	5574	Nouveau QR 009	ACTIVE	cmqw8ilsb001emg0158v8etes	admin_aurapilates_001	2026-07-09 09:23:56.25	2026-07-06 14:06:39.129	2026-07-09 09:23:56.25	\N
cmr9an0vw00ewmm01n9102ih6	c7690d7c59b336e9e155e2b5	8596	Nouveau QR 010	ACTIVE	cmqz4i19x0038mg01irua66ou	admin_aurapilates_001	2026-07-09 09:24:27.653	2026-07-06 14:06:39.164	2026-07-09 09:24:27.654	\N
cmr9an0x300exmm01cm0x3gwy	1d4698d7098441c0778b3293	3504	Nouveau QR 011	ACTIVE	cmqz4ky2t003fmg011oeykh0h	admin_aurapilates_001	2026-07-09 09:25:52.923	2026-07-06 14:06:39.207	2026-07-09 09:25:52.924	\N
cmr9an0y900eymm01itd5f1ks	3470278538323af3be439c5c	9442	Nouveau QR 012	ACTIVE	cmr1tvvf8001fmm01nvgjy6v9	admin_aurapilates_001	2026-07-09 09:26:29.404	2026-07-06 14:06:39.249	2026-07-09 09:26:29.405	\N
cmr9an10m00f0mm018xhjsps2	1317ff2a163fe67c093a7f15	1634	Nouveau QR 014	ACTIVE	cmr54gw0r009omm01n0aos5l6	admin_aurapilates_001	2026-07-09 09:27:43.166	2026-07-06 14:06:39.334	2026-07-09 09:27:43.167	\N
cmr9an11t00f1mm01e91pt8cg	a6638b40dbf30bf61237f5b5	2511	Nouveau QR 015	ACTIVE	cmr66x4vm00aumm01n1n9q5b4	admin_aurapilates_001	2026-07-09 09:29:47.503	2026-07-06 14:06:39.377	2026-07-09 09:29:47.503	\N
cmr9an12z00f2mm01maiokg1z	3c3a638ba41ead7fa7ab28d4	7513	Nouveau QR 016	ACTIVE	cmr6940rg00bemm01s11l95mw	admin_aurapilates_001	2026-07-09 09:31:08.324	2026-07-06 14:06:39.42	2026-07-09 09:31:08.324	\N
cmr9an1dk00fbmm01dgaccgu0	d871b414772a1bf26def0f74	1117	Nouveau QR 025	ACTIVE	cmrdadhtm001wmn01ebkmguat	admin_aurapilates_001	2026-07-09 09:36:26.595	2026-07-06 14:06:39.8	2026-07-09 09:36:26.596	\N
cmr9an1el00fcmm01ebk3ga5g	adf2ef7c1f4b6da3d675bec1	6785	Nouveau QR 026	ACTIVE	cmrdak4v0002wmn01j2my021k	admin_aurapilates_001	2026-07-09 09:37:05.045	2026-07-06 14:06:39.837	2026-07-09 09:37:05.046	\N
cmr9an1fn00fdmm019v8dq4nt	13239d668e572e2b2e757010	5859	Nouveau QR 027	ACTIVE	cmrdalmpn0035mn01esii22rz	admin_aurapilates_001	2026-07-09 09:37:31.815	2026-07-06 14:06:39.875	2026-07-09 09:37:31.815	\N
cmr9an14600f3mm01rvz0vduz	3038b297a0baacb579f2d083	9643	Nouveau QR 017	ACTIVE	cmr3dno9x008vmm01yn5zbnx3	admin_aurapilates_001	2026-07-09 09:40:02.143	2026-07-06 14:06:39.462	2026-07-09 09:40:02.144	\N
cmr9an15q00f4mm01eadcnn8h	3ef5c2dffe46c33fc2da236d	7850	Nouveau QR 018	ACTIVE	cmrdrcgat00kumn0112odkalw	admin_aurapilates_001	2026-07-09 17:07:31.11	2026-07-06 14:06:39.518	2026-07-09 17:07:31.11	\N
cmr9an18f00f6mm010jp5klaq	e23d669f39b8d39449c3f5a0	6441	Nouveau QR 020	ACTIVE	cmrnml84b00kwlq01sw6qm4zc	admin_aurapilates_001	2026-07-16 14:49:57.096	2026-07-06 14:06:39.615	2026-07-16 14:49:57.097	\N
cmr9an19j00f7mm01hu4pcjo1	3edf2a1be4140848e5d22f6a	3183	Nouveau QR 021	ACTIVE	cmruxkruh000ro901qcd982u7	admin_aurapilates_001	2026-07-21 17:31:55.015	2026-07-06 14:06:39.656	2026-07-21 17:31:55.016	\N
cmr9an1ao00f8mm01th5v7tbx	089ebfc48f7229b2f1ef04cd	8006	Nouveau QR 022	ACTIVE	cmrwe3svz000mn3011way6tzi	admin_aurapilates_001	2026-07-22 18:02:22.858	2026-07-06 14:06:39.697	2026-07-22 18:02:22.859	\N
cmr9an1gn00femm01m281e7rt	1fe27977444492cd02585224	3751	Nouveau QR 028	ACTIVE	cmrwed60g000un301vg8ksj6i	admin_aurapilates_001	2026-07-22 18:09:39.773	2026-07-06 14:06:39.911	2026-07-22 18:09:39.774	\N
cmr9an1ir00fgmm01f7isfdxs	0de267511c37757745431fbe	3028	Nouveau QR 030	ACTIVE	cmqzcgki3006umg01b9522uso	admin_aurapilates_001	2026-07-23 13:07:51.573	2026-07-06 14:06:39.987	2026-07-23 13:07:51.574	\N
cmr9an1ju00fhmm01vp2c7jhc	c50a9895c6ea578d827cac5f	3014	Nouveau QR 031	ACTIVE	cms3kei3j00gmn301mhqotbc4	admin_aurapilates_001	2026-07-27 18:33:03.02	2026-07-06 14:06:40.026	2026-07-27 18:33:03.021	\N
cmr9an1bm00f9mm017nc9b6kt	940e10eec35691d051cebe61	0676	Nouveau QR 023	ACTIVE	cmrbunzzo000mmn01dkqpill6	admin_aurapilates_001	2026-07-27 18:50:19.414	2026-07-06 14:06:39.73	2026-07-27 18:50:19.415	\N
cmr9an1kw00fimm013ks7wu7s	ede95545f55b4c1d3dc4d2d7	4294	Nouveau QR 032	ACTIVE	cms35x3i0009kn301kd28orpb	admin_aurapilates_001	2026-07-28 14:10:07.977	2026-07-06 14:06:40.065	2026-07-28 14:10:07.978	\N
cmr9an1s400fpmm01bsce7hrc	813a58249e632ee37289a5a9	0341	Nouveau QR 039	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.325	2026-07-06 14:06:40.325	\N
cmr9an1t700fqmm011ikel6f2	2b02d400d419042b3581e3e9	5132	Nouveau QR 040	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.364	2026-07-06 14:06:40.364	\N
cmr9an1uc00frmm01bp0z5lir	4d5bbfc2d5d4e3e9e6097ddc	1847	Nouveau QR 041	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.404	2026-07-06 14:06:40.404	\N
cmr9an1va00fsmm01l3ooia34	8d8d0ec72435c9f491d64d60	7832	Nouveau QR 042	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.438	2026-07-06 14:06:40.438	\N
cmr9an1w900ftmm018pn1xiq8	e094c59f3498cdd5ec45d8e5	5637	Nouveau QR 043	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.473	2026-07-06 14:06:40.473	\N
cmr9an1x800fumm012fzwabph	afdf5e154fe397de8add85e9	0146	Nouveau QR 044	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.508	2026-07-06 14:06:40.508	\N
cmr9an1yb00fvmm01n3crqfhv	88f88f4fb42d96dc44c890e9	7435	Nouveau QR 045	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.548	2026-07-06 14:06:40.548	\N
cmr9an1zb00fwmm012ht6gej1	1e5e4b95b19df9a661f6b94a	2841	Nouveau QR 046	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.584	2026-07-06 14:06:40.584	\N
cmr9an20b00fxmm01vlub0q2f	a304964b9e5ae95a1d0ec717	0527	Nouveau QR 047	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.62	2026-07-06 14:06:40.62	\N
cmr9an21d00fymm01xv6tn2e0	de0b9ac1189255caa0ed719f	3036	Nouveau QR 048	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.657	2026-07-06 14:06:40.657	\N
cmr9an22900fzmm01fvo0gnum	f5a3bc936a226f808546e432	8101	Nouveau QR 049	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.689	2026-07-06 14:06:40.689	\N
cmr9an23900g0mm01p1j1mdy1	83fcc81fa2e84f5330d2d0d2	6714	Nouveau QR 050	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.726	2026-07-06 14:06:40.726	\N
cmr9an24c00g1mm01y8nzgpgg	6f1b7ed15d3ee3364dad8f9e	0398	Nouveau QR 051	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.764	2026-07-06 14:06:40.764	\N
cmr9an25a00g2mm01jtu783tc	66cd226f7c6da124862a7851	9943	Nouveau QR 052	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.798	2026-07-06 14:06:40.798	\N
cmr9an26h00g3mm016qmc5q4k	5f766e27ab2165c05cc42473	2010	Nouveau QR 053	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.841	2026-07-06 14:06:40.841	\N
cmr9an27r00g4mm01b5rnrjzv	869c0d220ec29490ed93e4b2	3094	Nouveau QR 054	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.887	2026-07-06 14:06:40.887	\N
cmr9an28q00g5mm01s6lkmuut	af11974443d3dff6b2bf0752	5031	Nouveau QR 055	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.922	2026-07-06 14:06:40.922	\N
cmr9an29q00g6mm01kwsjslqk	97a45ec2f4f393d0a8f685ab	4575	Nouveau QR 056	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.959	2026-07-06 14:06:40.959	\N
cmr9an2ao00g7mm01qvbw2pmg	6c58513cbbd18f5341a398c8	6252	Nouveau QR 057	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:40.992	2026-07-06 14:06:40.992	\N
cmr9an2bm00g8mm01gvjhacim	627ac78e562f45b2d4e4ea5f	1763	Nouveau QR 058	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.027	2026-07-06 14:06:41.027	\N
cmr9an2cl00g9mm015jydmvok	70f4aac1b466928b8d9c35aa	5106	Nouveau QR 059	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.061	2026-07-06 14:06:41.061	\N
cmr9an2di00gamm016aqwh8tu	f49e3b93c94161aae8552021	4766	Nouveau QR 060	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.094	2026-07-06 14:06:41.094	\N
cmr9an2el00gbmm01r25qok7j	528f30037d6e8b161c61521e	0768	Nouveau QR 061	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.134	2026-07-06 14:06:41.134	\N
cmr9an2fj00gcmm01tfs4kg0w	56e499b69aa4791ba070ff05	0819	Nouveau QR 062	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.167	2026-07-06 14:06:41.167	\N
cmr9an2gg00gdmm010xrb465f	c173128553d6fb2dc32985ae	9594	Nouveau QR 063	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.2	2026-07-06 14:06:41.2	\N
cmr9an2he00gemm014v12z68c	88179c717630e685ff549235	0076	Nouveau QR 064	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.235	2026-07-06 14:06:41.235	\N
cmr9an2ii00gfmm01bs5fwaw6	03252a6440a586cad2871812	6256	Nouveau QR 065	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.275	2026-07-06 14:06:41.275	\N
cmr9an2jf00ggmm01sqydn11y	741cdb7d490c804add990db4	3895	Nouveau QR 066	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.307	2026-07-06 14:06:41.307	\N
cmr9an2ke00ghmm0166bs9rze	f0aae7da192f99eebb538a87	3384	Nouveau QR 067	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.342	2026-07-06 14:06:41.342	\N
cmr9an2lc00gimm018d61vgzh	3ec25472f76af222663afb05	2671	Nouveau QR 068	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.377	2026-07-06 14:06:41.377	\N
cmr9an2me00gjmm0110y3wpwy	25ebdbb09c220fe89b727270	2719	Nouveau QR 069	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.414	2026-07-06 14:06:41.414	\N
cmr9an2nd00gkmm0173ei6c0n	9a9adf4fbedd38c95b780a21	8917	Nouveau QR 070	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.449	2026-07-06 14:06:41.449	\N
cmr9an2oa00glmm01kg6inehs	f5ef5e8dbd5d2aedbca7c5d0	4660	Nouveau QR 071	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.482	2026-07-06 14:06:41.482	\N
cmr9an2p600gmmm01q1tcb7ld	ae184961422496ecc9aa2597	8086	Nouveau QR 072	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.515	2026-07-06 14:06:41.515	\N
cmr9an2q400gnmm01txs5funt	5d26759f046c86593fd8907a	0311	Nouveau QR 073	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.549	2026-07-06 14:06:41.549	\N
cmr9an2r400gomm012xh7o3lc	7197367b880fb7409247042d	9156	Nouveau QR 074	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.585	2026-07-06 14:06:41.585	\N
cmr9an2s600gpmm01tpbwd9ii	2150e14b029fd552690835d9	1576	Nouveau QR 075	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.623	2026-07-06 14:06:41.623	\N
cmr9an2te00gqmm01rw91cwzm	18ea85aa87fcc5c52eb85ba8	5489	Nouveau QR 076	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.666	2026-07-06 14:06:41.666	\N
cmr9an2uf00grmm01flgkmfo3	685dfc10512f0e47f3029ea8	8268	Nouveau QR 077	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.703	2026-07-06 14:06:41.703	\N
cmr9an2vg00gsmm01onm5k3yx	86a2670d79538fdbc7d341cc	2497	Nouveau QR 078	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.741	2026-07-06 14:06:41.741	\N
cmr9an2wh00gtmm01z56nt3qu	1b69f8ce4560cfdee00765eb	6477	Nouveau QR 079	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.778	2026-07-06 14:06:41.778	\N
cmr9an2xg00gumm01zujy4spm	953b4adda3235f2f9e9394a4	9067	Nouveau QR 080	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.812	2026-07-06 14:06:41.812	\N
cmr9an2yk00gvmm0127fc5htg	fc2bb0dad60b548769831b8e	9362	Nouveau QR 081	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.852	2026-07-06 14:06:41.852	\N
cmr9an2zm00gwmm01p1938g84	27994d8999919b63f6c967cd	9795	Nouveau QR 082	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.891	2026-07-06 14:06:41.891	\N
cmr9an30n00gxmm01s1k9wtfu	9c6495581c9ba5b132564d6f	4670	Nouveau QR 083	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.928	2026-07-06 14:06:41.928	\N
cmr9an31o00gymm01bzrm1u9u	79007767678fc085d02d2e49	7034	Nouveau QR 084	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.965	2026-07-06 14:06:41.965	\N
cmr9an32m00gzmm0135xxsprj	0c44159f686daec56e7b7838	8365	Nouveau QR 085	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:41.998	2026-07-06 14:06:41.998	\N
cmr9an33j00h0mm01iia828fr	a10bd888976c2cbf585cbf73	0591	Nouveau QR 086	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.031	2026-07-06 14:06:42.031	\N
cmr9an34g00h1mm01a83997xi	3bed9fae74319755ee5875cf	9354	Nouveau QR 087	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.064	2026-07-06 14:06:42.064	\N
cmr9an35i00h2mm01enijbfvv	4b1e858e6820cf389364b349	3396	Nouveau QR 088	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.103	2026-07-06 14:06:42.103	\N
cmr9an36g00h3mm01otedrufa	bbda97e1574db8135d57348a	3533	Nouveau QR 089	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.137	2026-07-06 14:06:42.137	\N
cmr9an37i00h4mm011lbv55hg	4c5ed456e4d6890748106a7c	8532	Nouveau QR 090	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.175	2026-07-06 14:06:42.175	\N
cmr9an38h00h5mm01pwmiwv99	0c3f51b99f55100597737530	9298	Nouveau QR 091	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.21	2026-07-06 14:06:42.21	\N
cmr9an3bg00h8mm01glm9te8v	20eb767113a49ae4bbd8b4ec	8860	Nouveau QR 094	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.317	2026-07-06 14:06:42.317	\N
cmr9an3cg00h9mm01gdtqdbmp	5cf691fe512b340e1e8e8623	4671	Nouveau QR 095	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.353	2026-07-06 14:06:42.353	\N
cmr9an3dh00hamm01nphzqtrx	b4c3eea5708df6d5ebbbe51e	4583	Nouveau QR 096	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.39	2026-07-06 14:06:42.39	\N
cmr9an3eg00hbmm01sah43917	405fa164c8e5ea7033a6eaac	3099	Nouveau QR 097	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.425	2026-07-06 14:06:42.425	\N
cmr9an3fo00hcmm01fbmxm8tv	8194e7b1d9464085ac9d81b5	8042	Nouveau QR 098	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.468	2026-07-06 14:06:42.468	\N
cmr9an3gy00hdmm019zm2v9c6	134a338b254eb4c8241cc336	5417	Nouveau QR 099	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.514	2026-07-06 14:06:42.514	\N
cmr9an3i300hemm0126ee0eiv	82290f36ed44bafe8df79fde	6050	Nouveau QR 100	DRAFT	\N	admin_aurapilates_001	\N	2026-07-06 14:06:42.555	2026-07-06 14:06:42.555	\N
cmr9an39g00h6mm01yc40t8y1	4de5d40e72f010a0fac093e8	9414	Nouveau QR 092	ACTIVE	cmqpbt84l001zlk01r9quitpi	admin_aurapilates_001	2026-07-06 14:35:46.526	2026-07-06 14:06:42.244	2026-07-06 14:35:46.527	\N
cmr9an3ae00h7mm01azndd9de	d75929726cebe42c12042a75	6437	Nouveau QR 093	ACTIVE	cmqpbrpkn001slk01gekkfisb	admin_aurapilates_001	2026-07-06 14:36:44.278	2026-07-06 14:06:42.278	2026-07-06 14:36:44.279	\N
cmr9an0m000enmm01ycizwtca	e94c48fc46429a1042969479	5649	Nouveau QR 001	ACTIVE	cmqqifegn000gp901x4b3a61j	admin_aurapilates_001	2026-07-06 14:41:28.161	2026-07-06 14:06:38.809	2026-07-06 14:41:28.162	\N
cmr9an0oe00epmm01gz75galo	667754913895d2d993bc2a8d	4441	Nouveau QR 003	ACTIVE	cmqqija83000up901vbrlsocv	admin_aurapilates_001	2026-07-06 14:44:03.18	2026-07-06 14:06:38.894	2026-07-06 14:44:03.181	\N
cmr9an0tx00eumm011t5ksuc7	92c4254b7f7572ef0336fedf	9023	Nouveau QR 008	ACTIVE	cmqw8ha3o0017mg010cohkf7t	admin_aurapilates_001	2026-07-09 09:22:46.304	2026-07-06 14:06:39.094	2026-07-09 09:22:46.305	\N
cmr9an0zf00ezmm01uanbwzh3	c47de0cbc36948dab744c3a5	5066	Nouveau QR 013	ACTIVE	cmr3dc13z008mmm01r1xcp8qr	admin_aurapilates_001	2026-07-09 09:27:08.898	2026-07-06 14:06:39.292	2026-07-09 09:27:08.899	\N
cmp4ilhao000nl401ppjrmrbu	9cc7b74ed2f3347b35b55ce9	1922	Nouveau QR 22	ACTIVE	cmr91fzq700dmmm01t48rlkdj	admin_aurapilates_001	2026-07-09 09:32:42.266	2026-05-13 18:31:08.496	2026-07-09 09:32:42.266	\N
cmr9an1ck00famm01dd9ofdtb	e4ab878e7051316c1410a2df	4978	Nouveau QR 024	ACTIVE	cmrbw6y2c0014mn01a6ii4tiu	admin_aurapilates_001	2026-07-09 09:35:11.538	2026-07-06 14:06:39.765	2026-07-09 09:35:11.539	\N
cmr9an17300f5mm01hlcaazs5	acb764eda2ee2a266dfb74a9	7367	Nouveau QR 019	ACTIVE	cmrkjma2h0010lq01o3ge2qc3	admin_aurapilates_001	2026-07-14 11:03:28.9	2026-07-06 14:06:39.568	2026-07-14 11:03:28.901	\N
cmp4ilh8a000ll40144lxcp49	4672c93073c285df1e7cc7e9	4572	Nouveau QR 20	ACTIVE	cmrnrrjxa00lblq014meynmha	admin_aurapilates_001	2026-07-16 17:14:50.409	2026-05-13 18:31:08.411	2026-07-16 17:14:50.411	\N
cmr9an1hp00ffmm01hwvpjk9p	aec32c56e43779c6268e8ccf	2869	Nouveau QR 029	ACTIVE	cmqrwntpy0016sc0146g80wvq	admin_aurapilates_001	2026-07-23 12:33:34.102	2026-07-06 14:06:39.949	2026-07-23 12:33:34.102	\N
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, "memberId", "planningId", "sessionDate", status, source, "createdByUserId", "packRefundedAt", "createdAt", "updatedAt", "debitedPackId") FROM stdin;
cmqmjzsi1000sod01muneei82	cmpux8mfw00i4p401v4t85sji	cmq9ez4dc0005wmyslxmkno99	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:09:49.322	2026-06-20 16:09:49.322	\N
cmqmk06kr0010od01uhvkzixt	cmpb23ldo00c7p401ut25a8kv	cmq9ez4dc0005wmyslxmkno99	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:10:07.563	2026-06-20 16:10:07.563	\N
cmqmk0j700018od01yb5f4k9z	cmp5e2po6007el401m0wr4bxe	cmq9ez4dc0005wmyslxmkno99	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:10:23.917	2026-06-20 16:10:23.917	\N
cmqmk2pb7001god01m6cjo4n8	cmp6tmko3004rp4010ev8s38b	cmq9f01ao0007wmys8as5zcu2	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:12:05.156	2026-06-20 16:12:05.156	\N
cmqmk31sl001ood01i14x0lrc	cmp6mh9mn0033p401xa6v43p7	cmq9f01ao0007wmys8as5zcu2	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:12:21.334	2026-06-20 16:12:21.334	\N
cmqmk8d03001wod01rspm7plz	cmp6n9pyb0047p401exgskztu	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:16:29.14	2026-06-20 16:16:29.14	\N
cmqmk8peg0024od0119mtpjqq	cmp9pbn9j00b7p401wd3w8sn0	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:16:45.208	2026-06-20 16:16:45.208	\N
cmqmk8zyu002cod0125uyz6g4	cmp9p95jj00b2p401dqlrtohp	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:16:58.903	2026-06-20 16:16:58.903	\N
cmqmk9d58002kod01ku5l7s1c	cmpbet54q00cpp4015io1o59b	cmq9f95xd0009wmys4fh3rgu6	2026-05-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:17:15.98	2026-06-20 16:17:15.98	\N
cmqmkbsc1002sod01n2rysj8l	cmpb26l0900ccp4014tau0gjw	cmq9fdxrr000hwmys6dp512ve	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:19:08.978	2026-06-20 16:19:08.978	\N
cmqmkc0qz0030od01z3a3kxfu	cmp5dd5sd0074l401pv3drst8	cmq9fdxrr000hwmys6dp512ve	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:19:19.883	2026-06-20 16:19:19.883	\N
cmqmkcecp0038od01kb57st2w	cmp6ndov4004cp4011gucmmzn	cmq9fdxrr000hwmys6dp512ve	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:19:37.513	2026-06-20 16:19:37.513	\N
cmqmkcml5003god015auoc20f	cmp5r6eqa001kp401z95m2mtr	cmq9fdxrr000hwmys6dp512ve	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:19:48.185	2026-06-20 16:19:48.185	\N
cmqmke8r1003ood01e2a1mopd	cmp5i45nq000ap401mr5kujgq	cmq9feru8000jwmysq1vizy87	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:21:03.565	2026-06-20 16:21:03.565	\N
cmqmkef0y003wod01fsw8lrev	cmp5lkgat000fp4013f720b0o	cmq9feru8000jwmysq1vizy87	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:21:11.699	2026-06-20 16:21:11.699	\N
cmqmkf8m30044od01gmisq8pp	cmp5r29es001fp401vky62ly4	cmq9fhaem000nwmys8jdowqm2	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-20 16:21:50.043	2026-06-20 16:21:50.043	\N
cmqqki0s80020p901ukj415ms	cmqp0fvcq00e0od01115zmkft	cmq9fi14k000pwmysgpf3tejt	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:35:04.568	2026-06-23 11:35:04.568	\N
cmqqkib0r0028p9011zr9if10	cmqpbic6z0010lk01lg3znp3o	cmq9fi14k000pwmysgpf3tejt	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:35:17.835	2026-06-23 11:35:17.835	\N
cmqqkioqd002gp9011jwtfomu	cmqpbg2wz000tlk01pnlcrmdj	cmq9fi14k000pwmysgpf3tejt	2026-05-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:35:35.605	2026-06-23 11:35:35.605	\N
cmqqkk2lu002kp90155lv05dn	cmp6n9pyb0047p401exgskztu	cmq9fjtnr000rwmyskcdppnns	2026-05-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:36:40.242	2026-06-23 11:36:40.242	\N
cmqqkkizd002sp901ojw5n6o9	cmp71pbmj005ip401rxsl0n27	cmq9fjtnr000rwmyskcdppnns	2026-05-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:37:01.466	2026-06-23 11:37:01.466	\N
cmqqkl43y0030p901uxh6esgh	cmpmhc40500h9p40180sb0edr	cmq9fmidc000xwmys98o2xwh0	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:37:28.847	2026-06-23 11:37:28.847	\N
cmqqklu020038p9011m23kl4u	cmp6n0r9g003sp401svwhqzjy	cmq9fpbtv0013wmysev1zh32u	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:38:02.402	2026-06-23 11:38:02.402	\N
cmqqkm238003gp901kmtib96x	cmpazudle00byp401oz4zx3e1	cmq9fpbtv0013wmysev1zh32u	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:38:12.884	2026-06-23 11:38:12.884	\N
cmqqkmkrt003op901is1z0ziq	cmp6n445r003xp4019r22o12e	cmq9fpbtv0013wmysev1zh32u	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:38:37.097	2026-06-23 11:38:37.097	\N
cmqqkmzwk003sp901ju7nfxb6	cmpbet54q00cpp4015io1o59b	cmq9fpbtv0013wmysev1zh32u	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:38:56.708	2026-06-23 11:38:56.708	\N
cmqqknhfu0040p901hu29f5sf	cmp580zx2006el401ov0q9nd9	cmq9fpbtv0013wmysev1zh32u	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:39:19.434	2026-06-23 11:39:19.434	\N
cmqqknyhl0044p901ud22upom	cmp9pbn9j00b7p401wd3w8sn0	cmq9fqhqt0015wmys5qnjmndg	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:39:41.53	2026-06-23 11:39:41.53	\N
cmqqko5oh0048p901r5akmo3l	cmp9p95jj00b2p401dqlrtohp	cmq9fqhqt0015wmys5qnjmndg	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:39:50.85	2026-06-23 11:39:50.85	\N
cmqqkocq2004gp9010oenb3a6	cmp6n6c330042p401572wyy97	cmq9fqhqt0015wmys5qnjmndg	2026-05-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:39:59.979	2026-06-23 11:39:59.979	\N
cmqqkpday004op901cfhpvicu	cmp80zids006np4015qmgm2k4	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:40:47.387	2026-06-23 11:40:47.387	\N
cmqqkpjpj004wp901fowvtfzq	cmph5kmv300f7p401b8x8jouu	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:40:55.688	2026-06-23 11:40:55.688	\N
cmqqkpp630054p901hzjgfgs3	cmp8b0p5m0078p401ko5fipst	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:41:02.763	2026-06-23 11:41:02.763	\N
cmqqkpv0n005cp901h14qw07y	cmpfpx1dd00ekp4015zb7hrup	cmq9hkdf7001hwmysekhvs3xl	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:41:10.344	2026-06-23 11:41:10.344	\N
cmqqks1t4005op9015cobn6cz	cmp5dd5sd0074l401pv3drst8	cmq9fst630019wmysziben0p0	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:42:52.457	2026-06-23 11:42:52.457	\N
cmqqks6zr005sp901lvxvd5z6	cmpazudle00byp401oz4zx3e1	cmq9fst630019wmysziben0p0	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:42:59.176	2026-06-23 11:42:59.176	\N
cmqqksowp005wp901yuq0d2ao	cmpb26l0900ccp4014tau0gjw	cmq9ftmkh001bwmys4oo2c448	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:43:22.393	2026-06-23 11:43:22.393	\N
cmqqksx9y0060p9013xut4crv	cmpb23ldo00c7p401ut25a8kv	cmq9ftmkh001bwmys4oo2c448	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:43:33.239	2026-06-23 11:43:33.239	\N
cmqqkt2lx0064p901mrw8k0tx	cmpux8mfw00i4p401v4t85sji	cmq9ftmkh001bwmys4oo2c448	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:43:40.149	2026-06-23 11:43:40.149	\N
cmqqktfnl006cp901b24moc8n	cmp9l6t2c00acp4018v82zolp	cmq9ftmkh001bwmys4oo2c448	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:43:57.057	2026-06-23 11:43:57.057	\N
cmqqktrj4006gp9015i0mfevq	cmp5e2po6007el401m0wr4bxe	cmq9ftmkh001bwmys4oo2c448	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:44:12.449	2026-06-23 11:44:12.449	\N
cmqqkug8o006kp901bwd081j8	cmp5i45nq000ap401mr5kujgq	cmq9fuddw001dwmysbkd747zi	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:44:44.472	2026-06-23 11:44:44.472	\N
cmqqkulx3006op901fu8rzurb	cmp6tmko3004rp4010ev8s38b	cmq9fuddw001dwmysbkd747zi	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:44:51.832	2026-06-23 11:44:51.832	\N
cmqqkuwbp006wp901ct76htxf	cmp5doqck0079l4013c3pypy1	cmq9fuddw001dwmysbkd747zi	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:45:05.317	2026-06-23 11:45:05.317	\N
cmqqkv30k0070p901xv13ugf4	cmp5lkgat000fp4013f720b0o	cmq9fuddw001dwmysbkd747zi	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:45:13.989	2026-06-23 11:45:13.989	\N
cmqqkva7r0074p9017chfof1e	cmp6n9pyb0047p401exgskztu	cmq9fuddw001dwmysbkd747zi	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:45:23.32	2026-06-23 11:45:23.32	\N
cmqqkwen7007cp901ne8lt423	cmp6mxgtj003np401n6d3md2o	cmq9hn28k001nwmyss37n6104	2026-05-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:46:15.716	2026-06-23 11:46:15.716	\N
cmqqkwlrw007gp901a78ypc7a	cmp6n445r003xp4019r22o12e	cmq9hn28k001nwmyss37n6104	2026-05-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:46:24.957	2026-06-23 11:46:24.957	\N
cmqqkws5u007op901nm3qpbxm	cmp9oxt9w00avp401sfiouy8l	cmq9hn28k001nwmyss37n6104	2026-05-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:46:33.235	2026-06-23 11:46:33.235	\N
cmqqkx13u007wp9012jbdc558	cmpi6ban400fip401ppm9o7wy	cmq9hn28k001nwmyss37n6104	2026-05-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:46:44.826	2026-06-23 11:46:44.826	\N
cmqqkx9mu0084p901ltaq8qts	cmp5d9vn5006zl401fo5j5q04	cmq9hn28k001nwmyss37n6104	2026-05-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:46:55.878	2026-06-23 11:46:55.878	\N
cmqqkxuw8008cp901ti7kw062	cmp9jyb2l009tp4012t706wff	cmq9hnsku001pwmysnt64r7ka	2026-05-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:47:23.433	2026-06-23 11:47:23.433	\N
cmqqky39r008gp901qih5lufb	cmp6mh9mn0033p401xa6v43p7	cmq9hnsku001pwmysnt64r7ka	2026-05-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:47:34.287	2026-06-23 11:47:34.287	\N
cmqqkyawt008kp901wiz0vr2j	cmpfpx1dd00ekp4015zb7hrup	cmq9hnsku001pwmysnt64r7ka	2026-05-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:47:44.189	2026-06-23 11:47:44.189	\N
cmqql01fm008op901ihcx79x0	cmpb26l0900ccp4014tau0gjw	cmq9hw6eo001vwmysignfhne8	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:49:05.218	2026-06-23 11:49:05.218	\N
cmqql06uh008sp90195gk56j4	cmpazudle00byp401oz4zx3e1	cmq9hw6eo001vwmysignfhne8	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:49:12.233	2026-06-23 11:49:12.233	\N
cmqql0dau008wp901ccqy624m	cmp5d9vn5006zl401fo5j5q04	cmq9hw6eo001vwmysignfhne8	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:49:20.598	2026-06-23 11:49:20.598	\N
cmqql0qr30090p901m38lxv8o	cmp5e2po6007el401m0wr4bxe	cmq9hxe76001xwmys8qvf2i93	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:49:38.032	2026-06-23 11:49:38.032	\N
cmqql0yry0094p901eadhrl6m	cmp8b0p5m0078p401ko5fipst	cmq9hxe76001xwmys8qvf2i93	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:49:48.43	2026-06-23 11:49:48.43	\N
cmqql15bp009cp901xidxk0q5	cmpfdk63200ebp401atbgmxt9	cmq9hxe76001xwmys8qvf2i93	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:49:56.918	2026-06-23 11:49:56.918	\N
cmqql1j0w009gp901olj2xv5d	cmp5i45nq000ap401mr5kujgq	cmq9hxw15001zwmys6frymznx	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:50:14.672	2026-06-23 11:50:14.672	\N
cmqql1nxr009kp901xqoyk566	cmp6tmko3004rp4010ev8s38b	cmq9hxw15001zwmys6frymznx	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:50:21.039	2026-06-23 11:50:21.039	\N
cmqql2uc1009op901ewuog0s6	cmp9oxt9w00avp401sfiouy8l	cmq9hyuad0021wmysl0edzaim	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:51:15.985	2026-06-23 11:51:15.985	\N
cmqql3035009sp901psm7qdhu	cmp6mh9mn0033p401xa6v43p7	cmq9hyuad0021wmysl0edzaim	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:51:23.442	2026-06-23 11:51:23.442	\N
cmqql3osj00a0p9019g74qwb1	cmp9u530f00bip401o3641wtg	cmq9i2ci70027wmysscy2bu9b	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:51:55.46	2026-06-23 11:51:55.46	\N
cmqql4tel00a4p901ui5291bp	cmp6ndov4004cp4011gucmmzn	cmq9i4xt5002dwmys5v7vckxt	2026-05-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:52:48.093	2026-06-23 11:52:48.093	\N
cmqql52ig00a8p9014ivffazh	cmp5r6eqa001kp401z95m2mtr	cmq9i4xt5002dwmys5v7vckxt	2026-05-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:52:59.896	2026-06-23 11:52:59.896	\N
cmqql5p6y00acp90164hymte7	cmpmhc40500h9p40180sb0edr	cmq9i5qul002fwmysbtfm6z6i	2026-05-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 11:53:29.291	2026-06-23 11:53:29.291	\N
cmqqngpte00aip901849ccpew	cmpi6ban400fip401ppm9o7wy	cmq9i6cxz002hwmys1mk0mjj2	2026-05-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 12:58:02.547	2026-06-23 12:58:02.547	\N
cmqqnh6t600amp901nphernyl	cmph5kmv300f7p401b8x8jouu	cmq9i6cxz002hwmys1mk0mjj2	2026-05-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 12:58:24.57	2026-06-23 12:58:24.57	\N
cmqqoepd400awp901rp12wnwj	cmpdskdbb00e0p401bi55y2g7	cmq9ia9md002pwmysdj3fumo1	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:24:28.264	2026-06-23 13:24:28.264	\N
cmqqof5ig00b0p90155z4xkwq	cmpb26l0900ccp4014tau0gjw	cmq9iaxpq002rwmys4kf15rcc	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:24:49.192	2026-06-23 13:24:49.192	\N
cmqqofdhn00b4p90146v4q3kf	cmp9l6t2c00acp4018v82zolp	cmq9iaxpq002rwmys4kf15rcc	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:24:59.531	2026-06-23 13:24:59.531	\N
cmqqofju400b8p901o3gajfdv	cmp5d9vn5006zl401fo5j5q04	cmq9iaxpq002rwmys4kf15rcc	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:25:07.756	2026-06-23 13:25:07.756	\N
cmqqog1ib00bcp901m81v6s29	cmp5i45nq000ap401mr5kujgq	cmq9ibl4o002twmyst523zaud	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:25:30.659	2026-06-23 13:25:30.659	\N
cmqqog66z00bgp901r219biyi	cmp6tmko3004rp4010ev8s38b	cmq9ibl4o002twmyst523zaud	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:25:36.732	2026-06-23 13:25:36.732	\N
cmqqogbzt00bkp901454q8uk2	cmp5e2po6007el401m0wr4bxe	cmq9ibl4o002twmyst523zaud	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:25:44.25	2026-06-23 13:25:44.25	\N
cmqqoh0pr00bsp9017voblubf	cmqp3lgcp00f1od0111da04jy	cmq9ibl4o002twmyst523zaud	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:26:16.287	2026-06-23 13:26:16.287	\N
cmqqohatr00bwp901ibp5r94o	cmp6mxgtj003np401n6d3md2o	cmq9ibl4o002twmyst523zaud	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:26:29.391	2026-06-23 13:26:29.391	\N
cmqqoifkf00c0p90109uj013p	cmpi6ban400fip401ppm9o7wy	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:27:22.191	2026-06-23 13:27:22.191	\N
cmqqoipl600c4p901pk241w7u	cmp5r29es001fp401vky62ly4	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:27:35.179	2026-06-23 13:27:35.179	\N
cmqqoizml00ccp901tg4ghj3m	cmp5qutpd0015p401e0b83fu9	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:27:48.189	2026-06-23 13:27:48.189	\N
cmqqoj51d00ckp901lnnf9tor	cmp5qzr8e001ap401fa4uuzw4	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:27:55.201	2026-06-23 13:27:55.201	\N
cmqqojcwg00cop901q5fjbodz	cmp580zx2006el401ov0q9nd9	cmq9inh4a002zwmyskfwm1sp8	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:28:05.392	2026-06-23 13:28:05.392	\N
cmqqok06x00csp901h21gm1zk	cmp6mxgtj003np401n6d3md2o	cmq9j79fe0035wmysqce965s4	2026-05-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:28:35.577	2026-06-23 13:28:35.577	\N
cmqqok85z00cwp901osznmcql	cmpdskdbb00e0p401bi55y2g7	cmq9j79fe0035wmysqce965s4	2026-05-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:28:45.911	2026-06-23 13:28:45.911	\N
cmqqol0o900d0p901uqa85ws2	cmp9jyb2l009tp4012t706wff	cmq9j9gnv003bwmyscpctgab4	2026-05-31	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:29:22.858	2026-06-23 13:29:22.858	\N
cmqqol6g600d4p901h19ff8oz	cmpazudle00byp401oz4zx3e1	cmq9j9gnv003bwmyscpctgab4	2026-05-31	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:29:30.342	2026-06-23 13:29:30.342	\N
cmqqoldzb00dcp901mopw7hb6	cmp6mujhf003ip4019yxl5iri	cmq9j9gnv003bwmyscpctgab4	2026-05-31	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:29:40.104	2026-06-23 13:29:40.104	\N
cmqqop1o900dgp901g9wq3p1g	cmp5e2po6007el401m0wr4bxe	cmqmmrdfi004cod01wk7dyyjk	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:32:30.778	2026-06-23 13:32:30.778	\N
cmqqop7jw00dkp901mya6xj0i	cmpb23ldo00c7p401ut25a8kv	cmqmmrdfi004cod01wk7dyyjk	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:32:38.396	2026-06-23 13:32:38.396	\N
cmqqp4wlr00dop901o2eetl6t	cmpfdk63200ebp401atbgmxt9	cmqmmrdfi004cod01wk7dyyjk	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 13:44:50.703	2026-06-23 13:44:50.703	\N
cmqqq6mb000dup9013oujxi0u	cmp6n9pyb0047p401exgskztu	cmqmmuas1004iod016m86gd1i	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:14:10.285	2026-06-23 14:14:10.285	\N
cmqqq6rma00e2p901oi3ikrxb	cmpuxpn4l00iop40156zk6rje	cmqmmuas1004iod016m86gd1i	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:14:17.17	2026-06-23 14:14:17.17	\N
cmqqq6xio00e6p901zay6sj1w	cmp6n445r003xp4019r22o12e	cmqmmuas1004iod016m86gd1i	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:14:24.816	2026-06-23 14:14:24.816	\N
cmqqq72yy00eep901i1nih6cl	cmps12dpz00hvp401tesxyqev	cmqmmuas1004iod016m86gd1i	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:14:31.882	2026-06-23 14:14:31.882	\N
cmqqq7g4s00emp901sacb5cxm	cmpvehn3c00j7p401p14lsb1d	cmqmmuas1004iod016m86gd1i	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:14:48.94	2026-06-23 14:14:48.94	\N
cmqqq863n00eqp901zegjsu2e	cmp5qutpd0015p401e0b83fu9	cmqmmv5en004kod01jyor4o8b	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:15:22.596	2026-06-23 14:15:22.596	\N
cmqqq8a6e00eup901qkrtmfnj	cmp5qzr8e001ap401fa4uuzw4	cmqmmv5en004kod01jyor4o8b	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:15:27.878	2026-06-23 14:15:27.878	\N
cmqqq9g4f00f2p901xfcttecc	cmpuxlbuw00ijp4016pmesm29	cmqmmwbi5004mod01dit09gof	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:16:22.239	2026-06-23 14:16:22.239	\N
cmqqqa52n00f6p901ajwqpeki	cmpbet54q00cpp4015io1o59b	cmqmmwbi5004mod01dit09gof	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:16:54.576	2026-06-23 14:16:54.576	\N
cmqqqab6v00fap901hnzmtq2u	cmp5dd5sd0074l401pv3drst8	cmqmmwbi5004mod01dit09gof	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:17:02.503	2026-06-23 14:17:02.503	\N
cmqqqbdi500fep901gxv0i0rz	cmp5d9vn5006zl401fo5j5q04	cmqmmyw79004qod01za4ph9hp	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:17:52.157	2026-06-23 14:17:52.157	\N
cmqqqbkh100fip901j1i3p0fn	cmp5doqck0079l4013c3pypy1	cmqmmyw79004qod01za4ph9hp	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:18:01.189	2026-06-23 14:18:01.189	\N
cmqqqc60c00fmp9016rzfu2b3	cmp5i45nq000ap401mr5kujgq	cmqmmzzd2004sod01fkr7uorn	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:18:29.1	2026-06-23 14:18:29.1	\N
cmqqqcbru00fqp90191ujtbq1	cmp6n9pyb0047p401exgskztu	cmqmmzzd2004sod01fkr7uorn	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:18:36.57	2026-06-23 14:18:36.57	\N
cmqqqchxk00fup901tygqz9qn	cmpb26l0900ccp4014tau0gjw	cmqmmzzd2004sod01fkr7uorn	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:18:44.553	2026-06-23 14:18:44.553	\N
cmqqqcnu700fyp90164enld6m	cmp5lkgat000fp4013f720b0o	cmqmmzzd2004sod01fkr7uorn	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:18:52.208	2026-06-23 14:18:52.208	\N
cmqqqdm9r00g2p901jpyin2l8	cmpi6ban400fip401ppm9o7wy	cmqmn2o9p004wod01inqdydva	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:19:36.832	2026-06-23 14:19:36.832	\N
cmqqqeefd00gap901c2304d8i	cmpxt9h9d00jnp401acy1ppf1	cmqmn3pa5004yod018829iesj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:20:13.321	2026-06-23 14:20:13.321	\N
cmqqqeit000gip901chv2joze	cmpuxgfvo00iep401kuin241v	cmqmn3pa5004yod018829iesj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:20:18.996	2026-06-23 14:20:18.996	\N
cmqqqeps700gqp9015e6z2wi6	cmpxtbvan00jsp401dbkqvo9n	cmqmn3pa5004yod018829iesj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:20:28.039	2026-06-23 14:20:28.039	\N
cmqqqfars00gyp901xca1f2qf	cmpxtdnho00jxp401mtude4xv	cmqmn5o330050od01720i3gaj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:20:55.24	2026-06-23 14:20:55.24	\N
cmqqqfn9z00h6p901zz23fxet	cmpxtfc9z00k2p401mfev8i51	cmqmn5o330050od01720i3gaj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:21:11.448	2026-06-23 14:21:11.448	\N
cmqqqgci600hep901x3rzameq	cmpxths4t00k7p401ms2nx4f0	cmqmn5o330050od01720i3gaj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:21:44.143	2026-06-23 14:21:44.143	\N
cmqqqgqmx00hmp9018dumv97k	cmp6vndph004yp401vluusox7	cmqmn5o330050od01720i3gaj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:22:02.457	2026-06-23 14:22:02.457	\N
cmqqqgwsb00hup901kqnrf0bb	cmp6maci6002tp40119cnxlu3	cmqmn5o330050od01720i3gaj	2026-06-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:22:10.427	2026-06-23 14:22:10.427	\N
cmqqqhsrt00hyp9013a38t6zx	cmpazudle00byp401oz4zx3e1	cmqmn7q3a0054od011mu7pqvg	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:22:51.882	2026-06-23 14:22:51.882	\N
cmqqqhxmn00i2p901mshbid65	cmp5dd5sd0074l401pv3drst8	cmqmn7q3a0054od011mu7pqvg	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:22:58.175	2026-06-23 14:22:58.175	\N
cmqqqji8t00i6p901utqh8wwf	cmp9jyb2l009tp4012t706wff	cmqmn8nci0056od01iw2kvnrk	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:24:11.55	2026-06-23 14:24:11.55	\N
cmqqqjov400iap9018x0fo095	cmp5lkgat000fp4013f720b0o	cmqmn8nci0056od01iw2kvnrk	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:24:20.129	2026-06-23 14:24:20.129	\N
cmqqqjva100iep901uxhy5tka	cmp5doqck0079l4013c3pypy1	cmqmn8nci0056od01iw2kvnrk	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:24:28.441	2026-06-23 14:24:28.441	\N
cmqqqk43400imp901b3w7zu6h	cmpv004tl00iyp4017n7rkxr5	cmqmn8nci0056od01iw2kvnrk	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:24:39.857	2026-06-23 14:24:39.857	\N
cmqqqkax800iqp90157l5n44h	cmpfdk63200ebp401atbgmxt9	cmqmn8nci0056od01iw2kvnrk	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:24:48.717	2026-06-23 14:24:48.717	\N
cmqqql3p900iyp901ranezqg5	cmqp1r6nz00eeod015izfwb4m	cmqmn9bs60058od01t8j8c4fd	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:25:26.014	2026-06-23 14:25:26.014	\N
cmqqqm4wr00j6p90153x8xh4c	cmp9muoo600alp401b1jj91hv	cmqmncddo005eod01qngiqdlr	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:26:14.235	2026-06-23 14:26:14.235	\N
cmqqqmb8x00jep901w3bh85j2	cmp9n16yg00aqp401yfgd8zit	cmqmncddo005eod01qngiqdlr	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:26:22.449	2026-06-23 14:26:22.449	\N
cmqqqmidv00jip901bq862gbl	cmp9u530f00bip401o3641wtg	cmqmncddo005eod01qngiqdlr	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:26:31.7	2026-06-23 14:26:31.7	\N
cmqqqmq6p00jmp901pb81m4gc	cmp6tmko3004rp4010ev8s38b	cmqmncddo005eod01qngiqdlr	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:26:41.809	2026-06-23 14:26:41.809	\N
cmqqqn3xm00jqp901rt1i2qcm	cmp6n445r003xp4019r22o12e	cmqmnd6y7005god01sutpmk1r	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:26:59.627	2026-06-23 14:26:59.627	\N
cmqqqnbrn00jup9016ae0k7j7	cmpxtdnho00jxp401mtude4xv	cmqmnd6y7005god01sutpmk1r	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:27:09.779	2026-06-23 14:27:09.779	\N
cmqqqnit900jyp901gzv4pwgg	cmp6mxgtj003np401n6d3md2o	cmqmnd6y7005god01sutpmk1r	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:27:18.91	2026-06-23 14:27:18.91	\N
cmqqqnppt00k6p901621slxy1	cmpqvd4pp00hkp401fok0cwt8	cmqmnd6y7005god01sutpmk1r	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:27:27.857	2026-06-23 14:27:27.857	\N
cmqqqp73g00kap901i0w1mg53	cmp5r29es001fp401vky62ly4	cmqmni52q005mod01aovlvd87	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:28:37.036	2026-06-23 14:28:37.036	\N
cmqqqpe4m00kep901eg9e9y7s	cmph5kmv300f7p401b8x8jouu	cmqmni52q005mod01aovlvd87	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:28:46.15	2026-06-23 14:28:46.15	\N
cmqqqpr4y00kmp901nkwhrx60	cmpzp6len00kwp4012mdrq8ka	cmqmni52q005mod01aovlvd87	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:29:03.01	2026-06-23 14:29:03.01	\N
cmqqqqahl00kqp901tgyd9fee	cmpmhc40500h9p40180sb0edr	cmqmno8b1005uod016mioa44o	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:29:28.089	2026-06-23 14:29:28.089	\N
cmqqqqgcz00kup901r00b3vcv	cmp5dd5sd0074l401pv3drst8	cmqmno8b1005uod016mioa44o	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:29:35.699	2026-06-23 14:29:35.699	\N
cmqqqqlxs00kyp901v2rqj66i	cmp580zx2006el401ov0q9nd9	cmqmno8b1005uod016mioa44o	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:29:42.928	2026-06-23 14:29:42.928	\N
cmqqqr3r400l2p901t4pr27xt	cmpbet54q00cpp4015io1o59b	cmqmnmijf005qod0197z3mscd	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:30:06.016	2026-06-23 14:30:06.016	\N
cmqqqr8dr00l6p901nyy7elf1	cmpazudle00byp401oz4zx3e1	cmqmnmijf005qod0197z3mscd	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:30:12.016	2026-06-23 14:30:12.016	\N
cmqqqrdea00lap901ouvpdk21	cmp6n0r9g003sp401svwhqzjy	cmqmnmijf005qod0197z3mscd	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:30:18.515	2026-06-23 14:30:18.515	\N
cmqqqribk00lep901qrp01cvy	cmpb26l0900ccp4014tau0gjw	cmqmnmijf005qod0197z3mscd	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:30:24.896	2026-06-23 14:30:24.896	\N
cmqqqrzyt00lmp90149egvh5d	cmpya6nur00kgp401et6xel9m	cmqmnmijf005qod0197z3mscd	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:30:47.765	2026-06-23 14:30:47.765	\N
cmqqqs4uv00lup901gswmum33	cmpuxyh5x00itp401pqas19s7	cmqmnmijf005qod0197z3mscd	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:30:54.104	2026-06-23 14:30:54.104	\N
cmqqqsfnw00lyp901v0zym6i2	cmp80zids006np4015qmgm2k4	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:31:08.109	2026-06-23 14:31:08.109	\N
cmqqqskx100m2p901y3izuu0r	cmp9p95jj00b2p401dqlrtohp	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:31:14.917	2026-06-23 14:31:14.917	\N
cmqqqsq6700m6p901ltb9c5ga	cmp9pbn9j00b7p401wd3w8sn0	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:31:21.728	2026-06-23 14:31:21.728	\N
cmqqqswbt00mep901p7koqcdl	cmpwo5qcf00jgp401y23i6i2r	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:31:29.706	2026-06-23 14:31:29.706	\N
cmqqqu1dw00mip901tcs2zmd2	cmp6mujhf003ip4019yxl5iri	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:32:22.917	2026-06-23 14:32:22.917	\N
cmqqqua5900mmp901cfwl5yn7	cmpuxlbuw00ijp4016pmesm29	cmqmnnd0a005sod01q6r0k0ox	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:32:34.269	2026-06-23 14:32:34.269	\N
cmqqqv4n900mqp901yx2ci4m9	cmp5i45nq000ap401mr5kujgq	cmqmnf4hi005kod01psi4hj70	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:33:13.797	2026-06-23 14:33:13.797	\N
cmqqqv8ru00mup901c050w7dw	cmp6n9pyb0047p401exgskztu	cmqmnf4hi005kod01psi4hj70	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:33:19.146	2026-06-23 14:33:19.146	\N
cmqqqvijg00n2p901ayllci2d	cmpuxbc7900i9p401d4rkyuom	cmqmnf4hi005kod01psi4hj70	2026-06-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:33:31.804	2026-06-23 14:33:31.804	\N
cmqqqvz4l00n6p901gyu6wquv	cmp6n445r003xp4019r22o12e	cmqmnwpek005yod01zw9o3vbd	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:33:53.301	2026-06-23 14:33:53.301	\N
cmqqqw5cq00nap901o3ga2mq6	cmp5e2po6007el401m0wr4bxe	cmqmnwpek005yod01zw9o3vbd	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:34:01.37	2026-06-23 14:34:01.37	\N
cmqqqwhiq00nep901ffgkm8ey	cmpb23ldo00c7p401ut25a8kv	cmqmnwpek005yod01zw9o3vbd	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:34:17.139	2026-06-23 14:34:17.139	\N
cmqqqwphm00nip9010xvxcgxc	cmp9l6t2c00acp4018v82zolp	cmqmnwpek005yod01zw9o3vbd	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:34:27.466	2026-06-23 14:34:27.466	\N
cmqqqxp3900nmp901kmmaypg6	cmp6mxgtj003np401n6d3md2o	cmqmo52dh006cod01oba3r6ut	2026-06-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:35:13.606	2026-06-23 14:35:13.606	\N
cmqqqxxop00nup901xbww8sll	cmqp2at3e00elod01ib880iqc	cmqmo52dh006cod01oba3r6ut	2026-06-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:35:24.746	2026-06-23 14:35:24.746	\N
cmqqqy30t00o2p901vagk5h41	cmqp3jmsv00euod010vtuk1qt	cmqmo52dh006cod01oba3r6ut	2026-06-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:35:31.661	2026-06-23 14:35:31.661	\N
cmqqqy8h200oap901setnuesj	cmp6mqu0z003dp401zgzrluwq	cmqmo52dh006cod01oba3r6ut	2026-06-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:35:38.727	2026-06-23 14:35:38.727	\N
cmqqqyg3i00oip9014pcgpls7	cmp6mkxvt0038p401gsyxjp1p	cmqmo52dh006cod01oba3r6ut	2026-06-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:35:48.606	2026-06-23 14:35:48.606	\N
cmqqr016v00omp90118e3c9hf	cmpuxbc7900i9p401d4rkyuom	cmqmoac2k006kod0192t4qygc	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:37:02.6	2026-06-23 14:37:02.6	\N
cmqqr08x400oqp901ytj50pjj	cmpazudle00byp401oz4zx3e1	cmqmoac2k006kod0192t4qygc	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:37:12.617	2026-06-23 14:37:12.617	\N
cmqqr0ma000oup901lmw8u1er	cmp6mujhf003ip4019yxl5iri	cmqmoac2k006kod0192t4qygc	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:37:29.928	2026-06-23 14:37:29.928	\N
cmqqr0qsg00oyp901kd2plges	cmpxtbvan00jsp401dbkqvo9n	cmqmoac2k006kod0192t4qygc	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:37:35.776	2026-06-23 14:37:35.776	\N
cmqqr1dlw00p6p9013dh19o6c	cmpzh61qy00kpp401u52chqfx	cmqmoac2k006kod0192t4qygc	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:38:05.349	2026-06-23 14:38:05.349	\N
cmqqr1t8t00pap90156y5u1y6	cmpazudle00byp401oz4zx3e1	cmqmobepy006mod019kuoczcx	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:38:25.614	2026-06-23 14:38:25.614	\N
cmqqr1yxc00pep9015jjtrdzr	cmp5d9vn5006zl401fo5j5q04	cmqmobepy006mod019kuoczcx	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:38:32.976	2026-06-23 14:38:32.976	\N
cmqqr2esv00pmp901ivj1kr80	cmq254vcp00lap401whu604y8	cmqmobepy006mod019kuoczcx	2026-06-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:38:53.552	2026-06-23 14:38:53.552	\N
cmqqr3z8m00pqp901f8qs6f34	cmps12dpz00hvp401tesxyqev	cmqmnzo9x0064od011mll6zta	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:40:06.694	2026-06-23 14:40:06.694	\N
cmqqr497d00pyp901q4ujapeo	cmqqihcm6000np901ub12rzon	cmqmnzo9x0064od011mll6zta	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:40:19.61	2026-06-23 14:40:19.61	\N
cmqqr4knr00q2p901xe3one0a	cmpi6ban400fip401ppm9o7wy	cmqmnzo9x0064od011mll6zta	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:40:34.455	2026-06-23 14:40:34.455	\N
cmqqr512300q6p901rqlnp7mp	cmpbet54q00cpp4015io1o59b	cmqmo0fc30066od01mjr23wg7	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:40:55.707	2026-06-23 14:40:55.707	\N
cmqqr56kq00qep901pnx1j7ok	cmq251ruu00l5p4010gsntqmg	cmqmo0fc30066od01mjr23wg7	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:41:02.859	2026-06-23 14:41:02.859	\N
cmqqr64ou00qip901xmx1639u	cmp80zids006np4015qmgm2k4	cmqmo1m700068od011oqh3hck	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:41:47.07	2026-06-23 14:41:47.07	\N
cmqqr69ji00qmp9010lda4cdb	cmpuxgfvo00iep401kuin241v	cmqmo1m700068od011oqh3hck	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:41:53.359	2026-06-23 14:41:53.359	\N
cmqqr6eto00qqp9018hg7bqu5	cmpxtdnho00jxp401mtude4xv	cmqmo1m700068od011oqh3hck	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:42:00.204	2026-06-23 14:42:00.204	\N
cmqqr6lf800qup9013qp37jza	cmpxtfc9z00k2p401mfev8i51	cmqmo1m700068od011oqh3hck	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:42:08.757	2026-06-23 14:42:08.757	\N
cmqqr6xmh00qyp901onj7b8a6	cmpxths4t00k7p401ms2nx4f0	cmqmo1m700068od011oqh3hck	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:42:24.569	2026-06-23 14:42:24.569	\N
cmqqr78tu00r2p901pfplglos	cmpuxlbuw00ijp4016pmesm29	cmqmo1m700068od011oqh3hck	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:42:39.091	2026-06-23 14:42:39.091	\N
cmqqrevkg00r6p901qew1ldbm	cmpb23ldo00c7p401ut25a8kv	cmqmondm4006sod0109qo59ei	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:48:35.153	2026-06-23 14:48:35.153	\N
cmqqrh8n000rap901pi9kt7og	cmpxt9h9d00jnp401acy1ppf1	cmqmosf9h0070od01qwkb5wc7	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:50:25.405	2026-06-23 14:50:25.405	\N
cmqqrhf8w00rep90126uudx0l	cmq251ruu00l5p4010gsntqmg	cmqmosf9h0070od01qwkb5wc7	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:50:33.969	2026-06-23 14:50:33.969	\N
cmqqrhk3t00rmp901bu9p3ugm	cmqqifegn000gp901x4b3a61j	cmqmosf9h0070od01qwkb5wc7	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:50:40.265	2026-06-23 14:50:40.265	\N
cmqqrhqy100rqp901zalex7e0	cmpb26l0900ccp4014tau0gjw	cmqmosf9h0070od01qwkb5wc7	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:50:49.13	2026-06-23 14:50:49.13	\N
cmqqrhwx100rup901lwfs90du	cmp6mh9mn0033p401xa6v43p7	cmqmosf9h0070od01qwkb5wc7	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:50:56.87	2026-06-23 14:50:56.87	\N
cmqqrivd300ryp9017h8z6zwo	cmpzh61qy00kpp401u52chqfx	cmqmoudyk0074od01t3pj66aj	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:51:41.512	2026-06-23 14:51:41.512	\N
cmqqrj28t00s2p901g5ant3a2	cmpuxlbuw00ijp4016pmesm29	cmqmoudyk0074od01t3pj66aj	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:51:50.429	2026-06-23 14:51:50.429	\N
cmqqrk32m00s6p901lat532wd	cmpzp6len00kwp4012mdrq8ka	cmqmoudyk0074od01t3pj66aj	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:52:38.158	2026-06-23 14:52:38.158	\N
cmqqrkbq100sap901q6pwe007	cmp5dd5sd0074l401pv3drst8	cmqmoudyk0074od01t3pj66aj	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 14:52:49.37	2026-06-23 14:52:49.37	\N
cmqqsky8800sep901xmgunzwz	cmp5doqck0079l4013c3pypy1	cmqmoxols0078od01nvys4y9d	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:21:18.153	2026-06-23 15:21:18.153	\N
cmqqsl94400sip901cr0qt5yb	cmp5i45nq000ap401mr5kujgq	cmqmp1x8c007aod01vcuo3eko	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:21:32.26	2026-06-23 15:21:32.26	\N
cmqqslof000sqp901m8r49w0x	cmp5d9vn5006zl401fo5j5q04	cmqmp1x8c007aod01vcuo3eko	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:21:52.092	2026-06-23 15:21:52.092	\N
cmqqslx2h00syp901btdvhkw9	cmqp3ozqi0004s001fm3nxvgn	cmqmp1x8c007aod01vcuo3eko	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:22:03.305	2026-06-23 15:22:03.305	\N
cmqqsny8300t2p901arenat3v	cmph5kmv300f7p401b8x8jouu	cmqmp3is2007eod018u8jm7ww	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:23:38.115	2026-06-23 15:23:38.115	\N
cmqqsobm100t6p901fs2yxdfj	cmpazudle00byp401oz4zx3e1	cmqmp47tr007god01eupe7omx	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:23:55.465	2026-06-23 15:23:55.465	\N
cmqqsoj6x00tap901kw7xwxso	cmpi6ban400fip401ppm9o7wy	cmqmp47tr007god01eupe7omx	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:24:05.289	2026-06-23 15:24:05.289	\N
cmqqsoztb00tep901jkh9lgyf	cmps12dpz00hvp401tesxyqev	cmqmp4wt4007iod010albebt6	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:24:26.831	2026-06-23 15:24:26.831	\N
cmqqsp5xe00tip901cbzsm4e1	cmp6n445r003xp4019r22o12e	cmqmp4wt4007iod010albebt6	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:24:34.754	2026-06-23 15:24:34.754	\N
cmqqspo8u00tmp901ktw2o43n	cmp580zx2006el401ov0q9nd9	cmqmp5pjr007kod012ybjey7m	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:24:58.495	2026-06-23 15:24:58.495	\N
cmqqspxrn00tqp901u3x8ih6n	cmpxtfc9z00k2p401mfev8i51	cmqmp6na5007mod01u6ifuqgr	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:25:10.836	2026-06-23 15:25:10.836	\N
cmqqsq6g800tup901w3xxgxef	cmpxths4t00k7p401ms2nx4f0	cmqmp6na5007mod01u6ifuqgr	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:25:22.089	2026-06-23 15:25:22.089	\N
cmqqsqck100u2p901rhig7xzl	cmp88f7g90073p401w4uw4pqs	cmqmp6na5007mod01u6ifuqgr	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:25:30.002	2026-06-23 15:25:30.002	\N
cmqqssfzt00u6p901bl8p0yax	cmpb26l0900ccp4014tau0gjw	cmqmp8vmo007qod01gzpgw27r	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:27:07.769	2026-06-23 15:27:07.769	\N
cmqqsssgs00uap9014s0dihjl	cmpv004tl00iyp4017n7rkxr5	cmqmp9mwu007sod019twll170	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:27:23.933	2026-06-23 15:27:23.933	\N
cmqqsu7d700uip901o0155w8d	cmqp3qkb7000bs001u04q0vsn	cmqmp9mwu007sod019twll170	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:28:29.9	2026-06-23 15:28:29.9	\N
cmqqsvwss00ump90146bmrws5	cmp6n6c330042p401572wyy97	cmqmpc0r4007yod01gj81ghpg	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:29:49.516	2026-06-23 15:29:49.516	\N
cmqqsw3bs00uqp901izry6nxk	cmq251ruu00l5p4010gsntqmg	cmqmpc0r4007yod01gj81ghpg	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:29:57.976	2026-06-23 15:29:57.976	\N
cmqqswmbo00uup901iiutl0en	cmpuxyh5x00itp401pqas19s7	cmqmpc0r4007yod01gj81ghpg	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:30:22.597	2026-06-23 15:30:22.597	\N
cmqqswyuc00v2p901sugbp2n6	cmqf2b3xg0001wmtsjmoqct8a	cmqmpc0r4007yod01gj81ghpg	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:30:38.82	2026-06-23 15:30:38.82	\N
cmqqsxi9o00v6p901shrt4ii7	cmp5dd5sd0074l401pv3drst8	cmqmpcw1m0080od01sxv5w13u	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:31:03.996	2026-06-23 15:31:03.996	\N
cmqqsxnu100vap901z5wut16h	cmpfpx1dd00ekp4015zb7hrup	cmqmpcw1m0080od01sxv5w13u	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:31:11.21	2026-06-23 15:31:11.21	\N
cmqqsxtge00vip901skai0epw	cmqpbn2ri001elk01umecmq7c	cmqmpcw1m0080od01sxv5w13u	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:31:18.495	2026-06-23 15:31:18.495	\N
cmqqsy3ux00vqp9016z87jy68	cmqpbli4t0017lk01pgc2c00k	cmqmpcw1m0080od01sxv5w13u	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:31:31.977	2026-06-23 15:31:31.977	\N
cmqqsywrd00vup901aedjf8oz	cmpqvd4pp00hkp401fok0cwt8	cmqmpdkr30082od019fokwjfc	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:32:09.433	2026-06-23 15:32:09.433	\N
cmqqsz1qx00vyp901p9kwjidw	cmp88f7g90073p401w4uw4pqs	cmqmpdkr30082od019fokwjfc	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:32:15.898	2026-06-23 15:32:15.898	\N
cmqqszb2900w2p901zli921ua	cmp6mujhf003ip4019yxl5iri	cmqmpdkr30082od019fokwjfc	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:32:27.97	2026-06-23 15:32:27.97	\N
cmqqszrza00w6p901n3lc36k4	cmpxtdnho00jxp401mtude4xv	cmqmpdkr30082od019fokwjfc	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:32:49.895	2026-06-23 15:32:49.895	\N
cmqqt01d200wap901yn2txsxv	cmpxtfc9z00k2p401mfev8i51	cmqmpdkr30082od019fokwjfc	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:33:02.054	2026-06-23 15:33:02.054	\N
cmqqt2bgk00wep901aag8cdqh	cmpmhc40500h9p40180sb0edr	cmqmpfeie0086od01jt90wal1	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:34:48.453	2026-06-23 15:34:48.453	\N
cmqqt2gsu00wip901k1wcd14i	cmpfdk63200ebp401atbgmxt9	cmqmpfeie0086od01jt90wal1	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:34:55.374	2026-06-23 15:34:55.374	\N
cmqqt2n6p00wmp901vnl0f5z0	cmp5doqck0079l4013c3pypy1	cmqmpfeie0086od01jt90wal1	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:35:03.65	2026-06-23 15:35:03.65	\N
cmqqt2w8800wqp901ib6e45fn	cmp6mh9mn0033p401xa6v43p7	cmqmpfeie0086od01jt90wal1	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:35:15.369	2026-06-23 15:35:15.369	\N
cmqqt3t6x00wup901yoy0giqy	cmpazudle00byp401oz4zx3e1	cmqmpgex10088od01rb6gvhrn	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:35:58.089	2026-06-23 15:35:58.089	\N
cmqqt40fj00x2p901kc8oty7k	cmp87ym20006yp401590xadl0	cmqmpgex10088od01rb6gvhrn	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:36:07.472	2026-06-23 15:36:07.472	\N
cmqqt45u000x6p901yyqrvr0y	cmpxt9h9d00jnp401acy1ppf1	cmqmpgex10088od01rb6gvhrn	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:36:14.472	2026-06-23 15:36:14.472	\N
cmqqt4aqn00xap901eob0zzmt	cmp5d9vn5006zl401fo5j5q04	cmqmpgex10088od01rb6gvhrn	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:36:20.831	2026-06-23 15:36:20.831	\N
cmqqt4lxm00xep901oxta6g5s	cmpya6nur00kgp401et6xel9m	cmqmpgex10088od01rb6gvhrn	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:36:35.339	2026-06-23 15:36:35.339	\N
cmqqt5boa00xip9014ca7kj9g	cmp80zids006np4015qmgm2k4	cmqmph13j008aod01zri8pyzo	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:37:08.699	2026-06-23 15:37:08.699	\N
cmqqt5fn500xmp901ww7uqjr9	cmpwo5qcf00jgp401y23i6i2r	cmqmph13j008aod01zri8pyzo	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:37:13.841	2026-06-23 15:37:13.841	\N
cmqqt5rvm00xqp9010rzdlmos	cmpuxlbuw00ijp4016pmesm29	cmqmph13j008aod01zri8pyzo	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:37:29.698	2026-06-23 15:37:29.698	\N
cmqqt5zz200xup9012ha9erl8	cmp9p95jj00b2p401dqlrtohp	cmqmph13j008aod01zri8pyzo	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:37:40.191	2026-06-23 15:37:40.191	\N
cmqqt65ri00xyp901l50ja5bp	cmp9pbn9j00b7p401wd3w8sn0	cmqmph13j008aod01zri8pyzo	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:37:47.694	2026-06-23 15:37:47.694	\N
cmqqt6btr00y2p901hiabkuwh	cmp6n0r9g003sp401svwhqzjy	cmqmph13j008aod01zri8pyzo	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:37:55.552	2026-06-23 15:37:55.552	\N
cmqqt7f4800y6p901pyqk1rgl	cmp6mxgtj003np401n6d3md2o	cmqmpiici008eod01s39f479e	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:38:46.473	2026-06-23 15:38:46.473	\N
cmqqt7o9600yap901pq1eehu9	cmpi6ban400fip401ppm9o7wy	cmqmpiici008eod01s39f479e	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:38:58.314	2026-06-23 15:38:58.314	\N
cmqqt8pzx00yep9012ihz13n2	cmp9l6t2c00acp4018v82zolp	cmqmpoa23008kod01azh8l5gg	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:39:47.23	2026-06-23 15:39:47.23	\N
cmqqt8v0o00yip901ax37e3fg	cmpv004tl00iyp4017n7rkxr5	cmqmpoa23008kod01azh8l5gg	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:39:53.737	2026-06-23 15:39:53.737	\N
cmqqt90ra00ymp901f6cz4d5d	cmpxtbvan00jsp401dbkqvo9n	cmqmpoa23008kod01azh8l5gg	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:40:01.175	2026-06-23 15:40:01.175	\N
cmqqt9p0300yqp901p76twic0	cmqf2b3xg0001wmtsjmoqct8a	cmqmqcqhh008ood01g6nrviry	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:40:32.595	2026-06-23 15:40:32.595	\N
cmqqta3sh00yup9017dox0n1z	cmps12dpz00hvp401tesxyqev	cmqmqlnvv008qod01djrodw4c	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:40:51.761	2026-06-23 15:40:51.761	\N
cmqqtasz200yyp901o4qvvz8i	cmp5r29es001fp401vky62ly4	cmqmwt2kn0090od0147oyjp5o	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:41:24.398	2026-06-23 15:41:24.398	\N
cmqqtazgo00z2p9013vrg0ip7	cmp6n445r003xp4019r22o12e	cmqmwt2kn0090od0147oyjp5o	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:41:32.808	2026-06-23 15:41:32.808	\N
cmqqtb5pv00z6p9014dcr6h8v	cmp6n9pyb0047p401exgskztu	cmqmwt2kn0090od0147oyjp5o	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:41:40.915	2026-06-23 15:41:40.915	\N
cmqqtbori00zap9012fj8il8q	cmpxtfc9z00k2p401mfev8i51	cmqmwu6kh0092od01h39znw53	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:42:05.599	2026-06-23 15:42:05.599	\N
cmqqtbvon00zep901yk6mvk3r	cmpxths4t00k7p401ms2nx4f0	cmqmwu6kh0092od01h39znw53	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:42:14.568	2026-06-23 15:42:14.568	\N
cmqqtc35400zip9015m0nlv9d	cmp5dd5sd0074l401pv3drst8	cmqmwu6kh0092od01h39znw53	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:42:24.233	2026-06-23 15:42:24.233	\N
cmqqtfiqo00zmp90122a3xvhe	cmpuxbc7900i9p401d4rkyuom	cmqmwxsdz0096od01664tgt8r	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:45:04.417	2026-06-23 15:45:04.417	\N
cmqqtfoqw00zqp901x4fck698	cmpv004tl00iyp4017n7rkxr5	cmqmwxsdz0096od01664tgt8r	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:45:12.2	2026-06-23 15:45:12.2	\N
cmqqtfw9200zyp901s1vxcpw3	cmqqija83000up901vbrlsocv	cmqmwxsdz0096od01664tgt8r	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:45:21.927	2026-06-23 15:45:21.927	\N
cmqqthjga0102p901c2jrkzer	cmp71pbmj005ip401rxsl0n27	cmqmwz5f30098od01306pltsx	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:46:38.651	2026-06-23 15:46:38.651	\N
cmqqthouy0106p901jkf26k5r	cmp6mxgtj003np401n6d3md2o	cmqmwz5f30098od01306pltsx	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:46:45.658	2026-06-23 15:46:45.658	\N
cmqqthx7h010ap901hn7v1ohb	cmpuxpn4l00iop40156zk6rje	cmqmwz5f30098od01306pltsx	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:46:56.477	2026-06-23 15:46:56.477	\N
cmqqtihp3010ep901l3usulga	cmpuxbc7900i9p401d4rkyuom	cmqmx228g009eod01n48ln87x	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:47:23.031	2026-06-23 15:47:23.031	\N
cmqqtiod2010ip9011o1swlnz	cmpazudle00byp401oz4zx3e1	cmqmx228g009eod01n48ln87x	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:47:31.67	2026-06-23 15:47:31.67	\N
cmqqtiyo1010mp901phscy38b	cmp9jyb2l009tp4012t706wff	cmqmx228g009eod01n48ln87x	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:47:45.026	2026-06-23 15:47:45.026	\N
cmqqtj8i2010qp9014bnpwpgs	cmp6mujhf003ip4019yxl5iri	cmqmx228g009eod01n48ln87x	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:47:57.77	2026-06-23 15:47:57.77	\N
cmqqtjgg8010up901ybu1gbc7	cmpzh61qy00kpp401u52chqfx	cmqmx228g009eod01n48ln87x	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:48:08.072	2026-06-23 15:48:08.072	\N
cmqqtjv4r0112p901d44zjh87	cmqf2b43f0011wmts29fvfire	cmqmx228g009eod01n48ln87x	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:48:27.1	2026-06-23 15:48:27.1	\N
cmqqtl10p011ap901lheh78ug	cmqf2b3z80007wmtsodeuow25	cmqmx2sa5009god01c20hdflw	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 15:49:21.385	2026-06-23 15:49:21.385	\N
cmqqubv8t011ep901u4i7dpen	cmp5d9vn5006zl401fo5j5q04	cmqmx2sa5009god01c20hdflw	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 16:10:13.614	2026-06-23 16:10:13.614	\N
cmqqudfq9011mp9017xarzci2	cmqqio1g50018p9018hz9fq36	cmqmwxsdz0096od01664tgt8r	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 16:11:26.818	2026-06-23 16:11:26.818	\N
cmqqudpn0011up901b8nmtsj8	cmqqipr55001fp9010qryqpgy	cmqmwxsdz0096od01664tgt8r	2026-06-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-23 16:11:39.661	2026-06-23 16:11:39.661	\N
cmqryce0k001vo701zuegryka	cmp5d9vn5006zl401fo5j5q04	cmqmxdlzq009mod01att4rvhp	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:50:22.581	2026-06-24 10:50:22.581	\N
cmqryd8m7001zo701x03rf1t5	cmpazudle00byp401oz4zx3e1	cmqmxi7fj009qod0105qunl7e	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:51:02.24	2026-06-24 10:51:02.24	\N
cmqrydkl70023o701vwa30b7k	cmq251ruu00l5p4010gsntqmg	cmqmxk8jg009sod018axk63jt	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:51:17.755	2026-06-24 10:51:17.755	\N
cmqrydsqv002bo70138tuug52	cmqf2b42m000vwmtsnd6eu11l	cmqmxk8jg009sod018axk63jt	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:51:28.327	2026-06-24 10:51:28.327	\N
cmqrye89g002jo701sumsb280	cmqnjvfwv00clod01smhvf5v7	cmqmxk8jg009sod018axk63jt	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:51:48.436	2026-06-24 10:51:48.436	\N
cmqryekp9002ro701gdh325hq	cmqnjmmn900ceod01dz6unzwp	cmqmxk8jg009sod018axk63jt	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:52:04.557	2026-06-24 10:52:04.557	\N
cmqryf1wl002vo701jluqrtbj	cmph5kmv300f7p401b8x8jouu	cmqmxl62u009uod014m0gpyi8	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:52:26.853	2026-06-24 10:52:26.853	\N
cmqryf8z5002zo701etl1wxio	cmpi6ban400fip401ppm9o7wy	cmqmxl62u009uod014m0gpyi8	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:52:36.018	2026-06-24 10:52:36.018	\N
cmqryfd3b0033o701shfilkqz	cmp5dd5sd0074l401pv3drst8	cmqmxl62u009uod014m0gpyi8	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:52:41.351	2026-06-24 10:52:41.351	\N
cmqryfzex0037o701elq2lu0n	cmpwo5qcf00jgp401y23i6i2r	cmqmxuy8t00a0od019zvvur0b	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:53:10.281	2026-06-24 10:53:10.281	\N
cmqryg3ln003bo701stnz2mgl	cmp9pbn9j00b7p401wd3w8sn0	cmqmxuy8t00a0od019zvvur0b	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:53:15.708	2026-06-24 10:53:15.708	\N
cmqrygbv0003fo7017zo8hjlr	cmpb23ldo00c7p401ut25a8kv	cmqmxuy8t00a0od019zvvur0b	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:53:26.412	2026-06-24 10:53:26.412	\N
cmqryggj2003jo701vdbocn29	cmpxtbvan00jsp401dbkqvo9n	cmqmxuy8t00a0od019zvvur0b	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:53:32.462	2026-06-24 10:53:32.462	\N
cmqrygn1l003ro701tvv0h5ew	cmqqifegn000gp901x4b3a61j	cmqmxuy8t00a0od019zvvur0b	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:53:40.906	2026-06-24 10:53:40.906	\N
cmqryh20j003vo701ycb73rzu	cmp6n0r9g003sp401svwhqzjy	cmqmxvpig00a2od01xxi462id	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:54:00.308	2026-06-24 10:54:00.308	\N
cmqryhlu8003zo701xt46ro1y	cmqf2b3z80007wmtsodeuow25	cmqmy4eww00a4od013ljxe6pg	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:54:26.001	2026-06-24 10:54:26.001	\N
cmqryhrut0043o701w53u26ou	cmp6mxgtj003np401n6d3md2o	cmqmy4eww00a4od013ljxe6pg	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:54:33.798	2026-06-24 10:54:33.798	\N
cmqryibv90047o701gymtfdyq	cmpazudle00byp401oz4zx3e1	cmqmycf3z00a6od011azj1g9o	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:54:59.734	2026-06-24 10:54:59.734	\N
cmqryik6s004bo701b4zpssm8	cmpuxpn4l00iop40156zk6rje	cmqmycf3z00a6od011azj1g9o	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:55:10.516	2026-06-24 10:55:10.516	\N
cmqryisap004fo701jjp8anlx	cmp6vndph004yp401vluusox7	cmqmycf3z00a6od011azj1g9o	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:55:21.025	2026-06-24 10:55:21.025	\N
cmqryj68u004jo701g3l2vfdu	cmp6maci6002tp40119cnxlu3	cmqmycf3z00a6od011azj1g9o	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:55:39.103	2026-06-24 10:55:39.103	\N
cmqryjtp9004no7018pufkiwx	cmpxtdnho00jxp401mtude4xv	cmqmykgkd00aaod01jghobkg1	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:56:09.501	2026-06-24 10:56:09.501	\N
cmqryk1jv004ro70164ummnd3	cmp88f7g90073p401w4uw4pqs	cmqmykgkd00aaod01jghobkg1	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:56:19.676	2026-06-24 10:56:19.676	\N
cmqryk7ml004vo7015frvbuv7	cmpuxgfvo00iep401kuin241v	cmqmykgkd00aaod01jghobkg1	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:56:27.549	2026-06-24 10:56:27.549	\N
cmqrym7vs004zo7010ve8daeu	cmpv004tl00iyp4017n7rkxr5	cmqmypic400agod01jctx3ywi	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:58:01.192	2026-06-24 10:58:01.192	\N
cmqrymml10057o701ukpk77af	cmqnjhe4500c7od01xunmmhyz	cmqmypic400agod01jctx3ywi	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:58:20.246	2026-06-24 10:58:20.246	\N
cmqrymz8d005fo701nhzdxz3h	cmqp3rvft000is001ahcjqwvz	cmqmypic400agod01jctx3ywi	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:58:36.637	2026-06-24 10:58:36.637	\N
cmqryn5md005jo7014ra7xvor	cmpfdk63200ebp401atbgmxt9	cmqmypic400agod01jctx3ywi	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:58:44.917	2026-06-24 10:58:44.917	\N
cmqrynzk0005no701yotv06un	cmqf2b3xg0001wmtsjmoqct8a	cmqmz3ev800amod01hq79sqrj	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:59:23.712	2026-06-24 10:59:23.712	\N
cmqryo875005ro701ounxvnhx	cmp6mh9mn0033p401xa6v43p7	cmqmz3ev800amod01hq79sqrj	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:59:34.913	2026-06-24 10:59:34.913	\N
cmqryoffj005vo701hcqlmt0k	cmps12dpz00hvp401tesxyqev	cmqmz3ev800amod01hq79sqrj	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 10:59:44.288	2026-06-24 10:59:44.288	\N
cmqryou63005zo701xv7ope7z	cmp9muoo600alp401b1jj91hv	cmqmz44v900aood01b4oxxshe	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:00:03.387	2026-06-24 11:00:03.387	\N
cmqryp0v00063o70167vbdx74	cmp9n16yg00aqp401yfgd8zit	cmqmz44v900aood01b4oxxshe	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:00:12.061	2026-06-24 11:00:12.061	\N
cmqryphs90067o701fzot9z06	cmpxtdnho00jxp401mtude4xv	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:00:33.993	2026-06-24 11:00:33.993	\N
cmqrypmi6006bo70191gr8a6j	cmpzh61qy00kpp401u52chqfx	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:00:40.11	2026-06-24 11:00:40.11	\N
cmqrypv61006fo70125er5w1k	cmp88f7g90073p401w4uw4pqs	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:00:51.337	2026-06-24 11:00:51.337	\N
cmqryq43t006jo701hk03xdlz	cmp6n6c330042p401572wyy97	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:01:02.921	2026-06-24 11:01:02.921	\N
cmqryqeen006no7016qz8lf7i	cmpxtfc9z00k2p401mfev8i51	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:01:16.272	2026-06-24 11:01:16.272	\N
cmqryqjr1006ro701hnui6xdv	cmpxths4t00k7p401ms2nx4f0	cmqmz4tnv00aqod01cnoxz75y	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:01:23.197	2026-06-24 11:01:23.197	\N
cmqryrafe006vo701jujbm832	cmp5i45nq000ap401mr5kujgq	cmqmz5o1b00asod01dfkbqw75	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:01:57.771	2026-06-24 11:01:57.771	\N
cmqryrhvd0073o701mmin4pwu	cmqp4mhgd0009lk015rytzui9	cmqmz5o1b00asod01dfkbqw75	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:02:07.417	2026-06-24 11:02:07.417	\N
cmqryrx0q0077o7017p5fuu2m	cmp6mujhf003ip4019yxl5iri	cmqmz6p9a00auod01r4beqiab	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:02:27.051	2026-06-24 11:02:27.051	\N
cmqrys5ga007bo701inm0nz1g	cmpmhc40500h9p40180sb0edr	cmqmz6p9a00auod01r4beqiab	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:02:37.978	2026-06-24 11:02:37.978	\N
cmqrysf9d007fo701pruielqj	cmp6n9pyb0047p401exgskztu	cmqmz6p9a00auod01r4beqiab	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:02:50.689	2026-06-24 11:02:50.689	\N
cmqrysoqw007no701g46hdmn4	cmqp4nucc000glk01of7k32cs	cmqmz6p9a00auod01r4beqiab	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:03:02.985	2026-06-24 11:03:02.985	\N
cmqrysy27007ro70126ii3k2g	cmp6mh9mn0033p401xa6v43p7	cmqmz6p9a00auod01r4beqiab	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:03:15.055	2026-06-24 11:03:15.055	\N
cmqryu682007vo701dhgk3xpf	cmp87ym20006yp401590xadl0	cmqmz8uab00ayod011jdohk6l	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:04:12.291	2026-06-24 11:04:12.291	\N
cmqryucka007zo701ymwwgst9	cmpya6nur00kgp401et6xel9m	cmqmz8uab00ayod011jdohk6l	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:04:20.507	2026-06-24 11:04:20.507	\N
cmqryujn20083o701yp9e7g10	cmp6n0r9g003sp401svwhqzjy	cmqmz8uab00ayod011jdohk6l	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:04:29.678	2026-06-24 11:04:29.678	\N
cmqryuqhd0087o701p7vbey5x	cmp5dd5sd0074l401pv3drst8	cmqmz8uab00ayod011jdohk6l	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:04:38.545	2026-06-24 11:04:38.545	\N
cmqryuy1q008bo701m04sagls	cmpuxyh5x00itp401pqas19s7	cmqmz8uab00ayod011jdohk6l	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:04:48.35	2026-06-24 11:04:48.35	\N
cmqrywtzd008jo701xvy3rndk	cmpxtdnho00jxp401mtude4xv	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:06:16.394	2026-06-24 11:06:16.394	\N
cmqryxa24008no701pxyjs3n1	cmp80zids006np4015qmgm2k4	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:06:37.229	2026-06-24 11:06:37.229	\N
cmqryxilp008ro701hhgo0z2z	cmp9p95jj00b2p401dqlrtohp	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:06:48.301	2026-06-24 11:06:48.301	\N
cmqrzeq480097o701tv5ulbr8	cmp9pbn9j00b7p401wd3w8sn0	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:20:11.192	2026-06-24 11:20:11.192	\N
cmqrziuj9009fo701ohrzfbok	cmpuxlbuw00ijp4016pmesm29	cmqmz9jpt00b0od013tk6bwbf	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:23:23.541	2026-06-24 11:23:23.541	\N
cmqrzk9rm009jo701odxcc5br	cmqqifegn000gp901x4b3a61j	cmqmzau0000b4od01md10weud	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:24:29.938	2026-06-24 11:24:29.938	\N
cmqrzkg8p009no701al8muhrh	cmqf2b3z80007wmtsodeuow25	cmqmzau0000b4od01md10weud	2026-06-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 11:24:38.33	2026-06-24 11:24:38.33	\N
cmqs1sszg009vo7012shjpkga	cmp9l6t2c00acp4018v82zolp	cmqmzdtxg00baod01igps5ws1	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:27:07.325	2026-06-24 12:27:07.325	\N
cmqs1szfq009zo701of2avxuy	cmp5i45nq000ap401mr5kujgq	cmqmzdtxg00baod01igps5ws1	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:27:15.686	2026-06-24 12:27:15.686	\N
cmqs1t58900a3o7014jhxrzh6	cmpv004tl00iyp4017n7rkxr5	cmqmzdtxg00baod01igps5ws1	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:27:23.194	2026-06-24 12:27:23.194	\N
cmqs1tj8w00abo701f2uyv2za	cmqnlovfk00czod0169336zw1	cmqmzegjv00bcod01rtb2irwa	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:27:41.36	2026-06-24 12:27:41.36	\N
cmqs1u63100afo7016jjgp7es	cmqf2b3z80007wmtsodeuow25	cmqmzg1d400bgod013njn246u	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:28:10.958	2026-06-24 12:28:10.958	\N
cmqs1ujjh00ajo701ep6duado	cmq251ruu00l5p4010gsntqmg	cmqmzgokp00biod01cswpv9rp	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:28:28.397	2026-06-24 12:28:28.397	\N
cmqs1upag00ano701a3eyjcfo	cmqf2b42m000vwmtsnd6eu11l	cmqmzgokp00biod01cswpv9rp	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:28:35.849	2026-06-24 12:28:35.849	\N
cmqs1w5se00aro70167krqfdh	cmp5r29es001fp401vky62ly4	cmqmzhmz400bkod01vmahn0qn	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:29:43.886	2026-06-24 12:29:43.886	\N
cmqs1wape00avo701v3pojwcx	cmpxtfc9z00k2p401mfev8i51	cmqmzhmz400bkod01vmahn0qn	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:29:50.258	2026-06-24 12:29:50.258	\N
cmqs1wh7800azo7012slmtuki	cmpxths4t00k7p401ms2nx4f0	cmqmzhmz400bkod01vmahn0qn	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:29:58.676	2026-06-24 12:29:58.676	\N
cmqs1wnop00b7o701xykc47rh	cmqqija83000up901vbrlsocv	cmqmzhmz400bkod01vmahn0qn	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:30:07.082	2026-06-24 12:30:07.082	\N
cmqs1wu2j00bfo701ydn6nawd	cmqqipr55001fp9010qryqpgy	cmqmzhmz400bkod01vmahn0qn	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:30:15.355	2026-06-24 12:30:15.355	\N
cmqs1wye100bno701eg7lnup9	cmqqio1g50018p9018hz9fq36	cmqmzhmz400bkod01vmahn0qn	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:30:20.954	2026-06-24 12:30:20.954	\N
cmqs1xc7u00bvo7019vqpd27q	cmqf2b41m000pwmtsgzlybd2p	cmqmzijl200bmod01hlllzqkz	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:30:38.874	2026-06-24 12:30:38.874	\N
cmqs1xhv400c3o701dw20cirk	cmqf2b405000dwmtsddcf7agj	cmqmzijl200bmod01hlllzqkz	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:30:46.192	2026-06-24 12:30:46.192	\N
cmqs1xmr100cbo701blnw850l	cmqf2b40z000jwmtsglaha6m4	cmqmzijl200bmod01hlllzqkz	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:30:52.526	2026-06-24 12:30:52.526	\N
cmqs1xs8l00cfo701dxsi3k88	cmpuxgfvo00iep401kuin241v	cmqmzijl200bmod01hlllzqkz	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:30:59.637	2026-06-24 12:30:59.637	\N
cmqs1y6sw00cno701v424nfro	cmqnlllpk00csod01wkefk1ot	cmqmzijl200bmod01hlllzqkz	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:31:18.512	2026-06-24 12:31:18.512	\N
cmqs1yl3k00cvo7010panfs65	cmqno5z2j00dlod0156ophlux	cmqmzijl200bmod01hlllzqkz	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:31:37.041	2026-06-24 12:31:37.041	\N
cmqs1zs9v00d3o7010xl892nm	cmqno2ywp00dfod01x3mtrdjg	cmqmzgokp00biod01cswpv9rp	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:32:32.996	2026-06-24 12:32:32.996	\N
cmqs20m7900d7o701hy3aeyap	cmqf2b43f0011wmts29fvfire	cmqmzl6d400bqod01swrx5394	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:33:11.782	2026-06-24 12:33:11.782	\N
cmqs20s7c00dfo701awmlsk95	cmqp4ky050002lk01gx0v2tv9	cmqmzl6d400bqod01swrx5394	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:33:19.561	2026-06-24 12:33:19.561	\N
cmqs211lf00djo7018owd9a7w	cmqno2ywp00dfod01x3mtrdjg	cmqmzl6d400bqod01swrx5394	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:33:31.731	2026-06-24 12:33:31.731	\N
cmqs21dxe00dno7017vo983id	cmp71pbmj005ip401rxsl0n27	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:33:47.715	2026-06-24 12:33:47.715	\N
cmqs21mgh00dro701evbjf6yy	cmpv004tl00iyp4017n7rkxr5	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:33:58.769	2026-06-24 12:33:58.769	\N
cmqs224s000dvo70163exj0vw	cmp6n9pyb0047p401exgskztu	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:34:22.513	2026-06-24 12:34:22.513	\N
cmqs22upe00e3o701pxe2zpyq	cmqqihcm6000np901ub12rzon	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:34:56.114	2026-06-24 12:34:56.114	\N
cmqs24s9z00efo701aui4pv9o	cmqp4nucc000glk01of7k32cs	cmqmzm7ir00bsod01z9nayr5w	2026-06-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:36:26.279	2026-06-24 12:36:26.279	\N
cmqs27j3u00ero701f2na455o	cmqqimbo30011p9015ihys621	cmqmznnmc00bwod01td8cigev	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:38:34.363	2026-06-24 12:38:34.363	\N
cmqs27pzs00ezo701rkimmwba	cmqpbt84l001zlk01r9quitpi	cmqmznnmc00bwod01td8cigev	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:38:43.288	2026-06-24 12:38:43.288	\N
cmqs27w4n00f7o701yepcwp9i	cmqpbrpkn001slk01gekkfisb	cmqmznnmc00bwod01td8cigev	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:38:51.24	2026-06-24 12:38:51.24	\N
cmqs283ku00ffo7018q1q1tbg	cmqpbpjdd001llk01e8vm535o	cmqmznnmc00bwod01td8cigev	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:39:00.894	2026-06-24 12:39:00.894	\N
cmqs28iyi00fjo701w78osthh	cmp9jyb2l009tp4012t706wff	cmqmzoes500byod01924zdeoy	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:39:20.826	2026-06-24 12:39:20.826	\N
cmqs28t7400fno701bnhr5c4j	cmp6mujhf003ip4019yxl5iri	cmqmzoes500byod01924zdeoy	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:39:34.096	2026-06-24 12:39:34.096	\N
cmqs291go00fro701ibxl4nhn	cmqno2ywp00dfod01x3mtrdjg	cmqmzoes500byod01924zdeoy	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:39:44.808	2026-06-24 12:39:44.808	\N
cmqs29bx500fvo701c3jx2p2q	cmpmhc40500h9p40180sb0edr	cmqmzp2t900c0od01v65bexcf	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:39:58.361	2026-06-24 12:39:58.361	\N
cmqs29i7600g3o701c4ts2dbm	cmqp4nucc000glk01of7k32cs	cmqmzp2t900c0od01v65bexcf	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-24 12:40:06.498	2026-06-24 12:40:06.498	\N
cmqtanbel00hzo701txcoi9s1	cmqp3jmsv00euod010vtuk1qt	cmqmoudyk0074od01t3pj66aj	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-25 09:22:33.981	2026-06-25 09:22:33.981	\N
cmqtay77h00i7o701elqznprh	cmqqifegn000gp901x4b3a61j	cmqmp9mwu007sod019twll170	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-25 09:31:01.758	2026-06-25 09:31:01.758	\N
cmqtb24j500ibo701mgmpkjon	cmqqifegn000gp901x4b3a61j	cmqmpiici008eod01s39f479e	2026-06-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-25 09:34:04.913	2026-06-25 09:34:04.913	\N
cmqzc9ado006dmg01m2o0ugah	cmqz4ky2t003fmg011oeykh0h	cmqmp6na5007mod01u6ifuqgr	2026-06-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 14:54:15.757	2026-06-29 14:54:15.757	\N
cmqzc9wge006hmg01qm5hiqfe	cmqz4ky2t003fmg011oeykh0h	cmqmpdkr30082od019fokwjfc	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 14:54:44.367	2026-06-29 14:54:44.367	\N
cmqzch2ew0074mg01nk5fwu0l	cmqzcgki3006umg01b9522uso	cmqmykgkd00aaod01jghobkg1	2026-06-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 15:00:18.68	2026-06-29 15:00:18.68	\N
cmqzcjdkr007kmg0192wlv8m0	cmqzcgki3006umg01b9522uso	cmqmzcf9u00b8od01vzue4yz8	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 15:02:06.46	2026-06-29 15:02:06.46	\N
cmqzclt7h0080mg012b8235d7	cmqzcgki3006umg01b9522uso	cmqrxgc0c000no701kc35xp16	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 15:04:00.03	2026-06-29 15:04:00.03	\N
cmqzco1cf008cmg019mzebv88	cmqzcgki3006umg01b9522uso	cmqsaa65h00gpo701ax7nflqq	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 15:05:43.888	2026-06-29 15:05:43.888	\N
cmqzd3wmp008kmg01bw3vky82	cmqz4i19x0038mg01irua66ou	cmqmoudyk0074od01t3pj66aj	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 15:18:04.274	2026-06-29 15:18:04.274	\N
cmqzd4a0x008omg01yzjpj3vi	cmqz4i19x0038mg01irua66ou	cmqmp9mwu007sod019twll170	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-06-29 15:18:21.634	2026-06-29 15:18:21.634	\N
cmr1u4l4h001vmm01dkqyr3tl	cmpv004tl00iyp4017n7rkxr5	cmqrxhe6s000po701g621fkx5	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:50:01.841	2026-07-01 08:50:01.841	cmp4sadgq005hl4016z9eqilf
cmr1u4ph4001zmm01dasvy1xk	cmpxtbvan00jsp401dbkqvo9n	cmqrxhe6s000po701g621fkx5	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:50:07.48	2026-07-01 08:50:07.48	cmp4s8kui005fl40100a1ew4b
cmr1u4vn40023mm01ugcefd08	cmpux8mfw00i4p401v4t85sji	cmqrxhe6s000po701g621fkx5	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:50:15.472	2026-07-01 08:50:15.472	cmp4sadgq005hl4016z9eqilf
cmr1u5lj70027mm01am55g7v0	cmpb26l0900ccp4014tau0gjw	cmqrxi4cv000ro701utq80ofw	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:50:49.027	2026-07-01 08:50:49.027	cmp4sadgq005hl4016z9eqilf
cmr1u5rn9002bmm01cgzqhtt4	cmp5i45nq000ap401mr5kujgq	cmqrxi4cv000ro701utq80ofw	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:50:56.949	2026-07-01 08:50:56.949	cmp4sadgq005hl4016z9eqilf
cmr1u5zpi002fmm013l88kigf	cmp6mh9mn0033p401xa6v43p7	cmqrxi4cv000ro701utq80ofw	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:51:07.398	2026-07-01 08:51:07.398	cmp4sejni005kl4013ure33mc
cmr1u6xc2002jmm016ubvc0tx	cmpv004tl00iyp4017n7rkxr5	cmqrxo7gt0015o701xvbt9ait	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:51:50.978	2026-07-01 08:51:50.978	cmp4sadgq005hl4016z9eqilf
cmr1u71b6002nmm01d7719v2n	cmp5e2po6007el401m0wr4bxe	cmqrxo7gt0015o701xvbt9ait	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:51:56.13	2026-07-01 08:51:56.13	cmp4s9cxl005gl4018m1wy6wp
cmr1u78wl002rmm01t2lz5i3j	cmpux8mfw00i4p401v4t85sji	cmqrxo7gt0015o701xvbt9ait	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:52:05.973	2026-07-01 08:52:05.973	cmp4sadgq005hl4016z9eqilf
cmr1u81zj002vmm01etblvqnx	cmqf2b3xg0001wmtsjmoqct8a	cmqrxot9c0017o701irtjaq4u	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:52:43.664	2026-07-01 08:52:43.664	cmp4skb22005rl4014f0e7wgs
cmr1u89na002zmm01rj4dy0eq	cmqnlovfk00czod0169336zw1	cmqrxot9c0017o701irtjaq4u	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:52:53.59	2026-07-01 08:52:53.59	cmp4s8kui005fl40100a1ew4b
cmr1u8pj90033mm018blid634	cmpb23ldo00c7p401ut25a8kv	cmqrxtu2w001ho701fpgerfv3	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:53:14.181	2026-07-01 08:53:14.181	cmp4sadgq005hl4016z9eqilf
cmr1u90km0037mm01cnt54lci	cmp6mh9mn0033p401xa6v43p7	cmqrxucwc001jo701m5ngk3ac	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:53:28.487	2026-07-01 08:53:28.487	cmp4sejni005kl4013ure33mc
cmr1u96bs003bmm01m8nxn41u	cmp6n9pyb0047p401exgskztu	cmqrxucwc001jo701m5ngk3ac	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:53:35.944	2026-07-01 08:53:35.944	cmp4sadgq005hl4016z9eqilf
cmr1uanjb003fmm01r9hkh4dg	cmp9l6t2c00acp4018v82zolp	cmqsabfkk00gto70136g7cl5i	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:54:44.903	2026-07-01 08:54:44.903	cmp4s9cxl005gl4018m1wy6wp
cmr1uavb0003jmm01hufw09oo	cmp5i45nq000ap401mr5kujgq	cmqsabfkk00gto70136g7cl5i	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:54:54.972	2026-07-01 08:54:54.972	cmp4sadgq005hl4016z9eqilf
cmr1ub01j003nmm01unpc4uyh	cmp5e2po6007el401m0wr4bxe	cmqsabfkk00gto70136g7cl5i	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:55:01.112	2026-07-01 08:55:01.112	cmp4s9cxl005gl4018m1wy6wp
cmr1ubiry003rmm01jhrcb3sl	cmp5dd5sd0074l401pv3drst8	cmqsah4mr00h7o701gjmxu85s	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:55:25.39	2026-07-01 08:55:25.39	cmp4sixhw005ol401euqmhrwh
cmr1uc4k5003vmm01blt5uk2i	cmqnlllpk00csod01wkefk1ot	cmqsahxx500h9o701yzkspmas	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:55:53.621	2026-07-01 08:55:53.621	cmp4s8kui005fl40100a1ew4b
cmr1uc8ne003zmm01o8qbuocn	cmqnnz1kg00d8od0103g8czza	cmqsahxx500h9o701yzkspmas	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:55:58.923	2026-07-01 08:55:58.923	cmp4s9cxl005gl4018m1wy6wp
cmr1ucev60043mm01grdnm2x7	cmqnlovfk00czod0169336zw1	cmqsahxx500h9o701yzkspmas	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:56:06.979	2026-07-01 08:56:06.979	cmp4s8kui005fl40100a1ew4b
cmr1ucpog0047mm01yfcylgpi	cmqw8khue001lmg01a483drty	cmqsahxx500h9o701yzkspmas	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:56:20.993	2026-07-01 08:56:20.993	cmp4s6te2005el4011ra2qxrl
cmr1ucu6m004bmm01m7vnrxq7	cmqw8m90j001smg01dxisiguv	cmqsahxx500h9o701yzkspmas	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:56:26.831	2026-07-01 08:56:26.831	cmp4s6te2005el4011ra2qxrl
cmr1ud1kg004fmm01kqukefqc	cmpuxbc7900i9p401d4rkyuom	cmqsahxx500h9o701yzkspmas	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:56:36.401	2026-07-01 08:56:36.401	cmp4sejni005kl4013ure33mc
cmr1udgm8004jmm014yzzcwg2	cmp71pbmj005ip401rxsl0n27	cmqsaie5800hbo7015ot7sic6	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:56:55.905	2026-07-01 08:56:55.905	cmp4sadgq005hl4016z9eqilf
cmr1udl8d004nmm01oyqb3cy0	cmpux8mfw00i4p401v4t85sji	cmqsaie5800hbo7015ot7sic6	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:57:01.885	2026-07-01 08:57:01.885	cmp4sadgq005hl4016z9eqilf
cmr1udp4o004rmm01en8gt8dj	cmpv004tl00iyp4017n7rkxr5	cmqsaie5800hbo7015ot7sic6	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:57:06.936	2026-07-01 08:57:06.936	cmp4sadgq005hl4016z9eqilf
cmr1udw98004vmm01v7zbfa08	cmqw8njse001zmg010hmpycb7	cmqsaie5800hbo7015ot7sic6	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:57:16.172	2026-07-01 08:57:16.172	cmp4s6te2005el4011ra2qxrl
cmr1ue24t004zmm010pmzy1x0	cmqqihcm6000np901ub12rzon	cmqsaie5800hbo7015ot7sic6	2026-06-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:57:23.79	2026-07-01 08:57:23.79	cmp4s9cxl005gl4018m1wy6wp
cmr1uesdw0053mm01bgszbs6p	cmqqija83000up901vbrlsocv	cmqsajtqe00hfo701nymfh9ne	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:57:57.812	2026-07-01 08:57:57.812	cmp4s8kui005fl40100a1ew4b
cmr1uezqz0057mm014gucr1t7	cmqpbt84l001zlk01r9quitpi	cmqsajtqe00hfo701nymfh9ne	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:58:07.355	2026-07-01 08:58:07.355	cmp4s8kui005fl40100a1ew4b
cmr1uf64l005bmm01jru0zmen	cmqpbrpkn001slk01gekkfisb	cmqsajtqe00hfo701nymfh9ne	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:58:15.621	2026-07-01 08:58:15.621	cmp4s8kui005fl40100a1ew4b
cmr1ufcnw005fmm01ner04zfc	cmqf2b41m000pwmtsgzlybd2p	cmqsajtqe00hfo701nymfh9ne	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:58:24.092	2026-07-01 08:58:24.092	cmp4s8kui005fl40100a1ew4b
cmr1ufi6k005jmm01tsn33zhz	cmqf2b405000dwmtsddcf7agj	cmqsajtqe00hfo701nymfh9ne	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:58:31.244	2026-07-01 08:58:31.244	cmp4s8kui005fl40100a1ew4b
cmr1ufrgm005nmm01lvgyn4ro	cmpuxbc7900i9p401d4rkyuom	cmqsajtqe00hfo701nymfh9ne	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:58:43.27	2026-07-01 08:58:43.27	cmp4sejni005kl4013ure33mc
cmr1ug7fc005rmm010qxsm5w3	cmpazudle00byp401oz4zx3e1	cmqsakcej00hho701m260shkz	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:59:03.96	2026-07-01 08:59:03.96	cmp4slcpz005ul401m1rpf0qa
cmr1ugc8k005vmm01rp1lhjag	cmp6mujhf003ip4019yxl5iri	cmqsakcej00hho701m260shkz	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:59:10.196	2026-07-01 08:59:10.196	cmp4sadgq005hl4016z9eqilf
cmr1ugglb005zmm01uy1xee50	cmpzh61qy00kpp401u52chqfx	cmqsakcej00hho701m260shkz	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:59:15.839	2026-07-01 08:59:15.839	cmp4s8kui005fl40100a1ew4b
cmr1ugmsn0063mm012it0vi34	cmp9jyb2l009tp4012t706wff	cmqsakcej00hho701m260shkz	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:59:23.88	2026-07-01 08:59:23.88	cmp4s8kui005fl40100a1ew4b
cmr1uh3060067mm01g5nxwkxt	cmpxt9h9d00jnp401acy1ppf1	cmqsakcej00hho701m260shkz	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:59:44.886	2026-07-01 08:59:44.886	cmp4s8kui005fl40100a1ew4b
cmr1uh9bz006bmm01ahsdxjuc	cmpfpx1dd00ekp4015zb7hrup	cmqsakcej00hho701m260shkz	2026-06-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 08:59:53.087	2026-07-01 08:59:53.087	cmp4sbkj5005il4015b2x78mh
cmr1vl2bk006rmm0133xb9aw4	cmp6n9pyb0047p401exgskztu	cmqrxddf7000fo701d3aeyir7	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 09:30:50.24	2026-07-01 09:30:50.24	cmp4t00w6005xl401jv0qklyp
cmr1vlf8b006vmm01qq5qsljz	cmph5kmv300f7p401b8x8jouu	cmqrxdzon000ho7018k4luggq	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 09:31:06.971	2026-07-01 09:31:06.971	cmp4s8kui005fl40100a1ew4b
cmr1wijqg006zmm017tsir76m	cmp6tmko3004rp4010ev8s38b	cmqrxdzon000ho7018k4luggq	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 09:56:52.456	2026-07-01 09:56:52.456	cmp4s9cxl005gl4018m1wy6wp
cmr1wioba0073mm01k9jxdtum	cmps12dpz00hvp401tesxyqev	cmqrxdzon000ho7018k4luggq	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 09:56:58.391	2026-07-01 09:56:58.391	cmp4sbkj5005il4015b2x78mh
cmr1wj87z0077mm01tzo38ktb	cmqf2b42m000vwmtsnd6eu11l	cmqrxenj9000jo7011cgedrh3	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 09:57:24.191	2026-07-01 09:57:24.191	cmp4s8kui005fl40100a1ew4b
cmr1wjdfb007bmm01zr3t6e7c	cmqnjhe4500c7od01xunmmhyz	cmqrxenj9000jo7011cgedrh3	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 09:57:30.935	2026-07-01 09:57:30.935	cmp4s8kui005fl40100a1ew4b
cmr1wl2qt007fmm01xeyaj7s6	cmqqjfnwv001mp901zr9d550e	cmqrxenj9000jo7011cgedrh3	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-01 09:58:50.406	2026-07-01 09:58:50.406	cmp4s6te2005el4011ra2qxrl
cmraeob0s00ifmm017r1jvp11	cmqur46xc00jno701ceuxfoxy	cmq9j8ubs0039wmys9cl9xj0d	2026-05-31	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:47:23.596	2026-07-07 08:47:23.596	cmqur0gkm00jko7014ajnmg2a
cmraepb7a00ijmm019wku4sr9	cmqur46xc00jno701ceuxfoxy	cmql7shbg0007od01lgx42aq6	2026-06-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:48:10.486	2026-07-07 08:48:10.486	cmqur0gkm00jko7014ajnmg2a
cmraeqdr900inmm01nboqxurh	cmqur46xc00jno701ceuxfoxy	cmqmo3hvf006aod01dsqm3c30	2026-06-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:49:00.454	2026-07-07 08:49:00.454	cmqur0gkm00jko7014ajnmg2a
cmraer0i400irmm01x4dre225	cmqur46xc00jno701ceuxfoxy	cmqmoml4o006qod012vafqtdv	2026-06-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:49:29.933	2026-07-07 08:49:29.933	cmqur0gkm00jko7014ajnmg2a
cmraex3xm00ivmm01c3dh5ksc	cmqur46xc00jno701ceuxfoxy	cmqmpa8yy007uod01krhkw3tw	2026-06-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:54:14.315	2026-07-07 08:54:14.315	cmqur0gkm00jko7014ajnmg2a
cmraexf5000izmm01jh2bz9cu	cmqur46xc00jno701ceuxfoxy	cmqmpphwc008mod01h8ekff6d	2026-06-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:54:28.836	2026-07-07 08:54:28.836	cmqur0gkm00jko7014ajnmg2a
cmraexy3r00j3mm01xpxgfey7	cmqur46xc00jno701ceuxfoxy	cmqmxe9mb009ood0176v8gtu3	2026-06-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:54:53.415	2026-07-07 08:54:53.415	cmqur0gkm00jko7014ajnmg2a
cmraeya1100j7mm01hjthobw4	cmqur46xc00jno701ceuxfoxy	cmqmz1k0j00aiod01v1frcbrr	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:55:08.869	2026-07-07 08:55:08.869	cmqur0gkm00jko7014ajnmg2a
cmraezoir00jbmm012qox93rl	cmqur46xc00jno701ceuxfoxy	cmqmzf89h00beod01p8u2mqil	2026-06-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:56:14.308	2026-07-07 08:56:14.308	cmqur0gkm00jko7014ajnmg2a
cmraf0f0a00jfmm01ch09x2r8	cmqur46xc00jno701ceuxfoxy	cmqrxbqrp000do701tzoiewue	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 08:56:48.634	2026-07-07 08:56:48.634	cmqur0gkm00jko7014ajnmg2a
cmrafc69y00jtmm011m2xjimo	cmr0e8q3k009bmg01p00ba0nx	cmqzawpbl003vmg017wfvylhl	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-07 09:05:57.19	2026-07-07 09:05:57.19	cmqur0gkm00jko7014ajnmg2a
cmrdesp8d004hmn01b4dfqcma	cmr3dno9x008vmm01yn5zbnx3	cmqrxenj9000jo7011cgedrh3	2026-06-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:14:07.165	2026-07-09 11:14:07.165	cmp4s8kui005fl40100a1ew4b
cmrdets4l004lmn01zkbmmdz9	cmp6mxgtj003np401n6d3md2o	cmqrxit6a000to701bqvtuyq7	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:14:57.573	2026-07-09 11:14:57.573	cmp4skb22005rl4014f0e7wgs
cmrdeu3z8004pmn01atjuux2v	cmqnnz1kg00d8od0103g8czza	cmqrxjpuq000vo701sd9wab7y	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:15:12.932	2026-07-09 11:15:12.932	cmp4s9cxl005gl4018m1wy6wp
cmrdeu9cl004tmn01utza4jer	cmqnjvfwv00clod01smhvf5v7	cmqrxjpuq000vo701sd9wab7y	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:15:19.893	2026-07-09 11:15:19.893	cmp4s9cxl005gl4018m1wy6wp
cmrdeumjj004xmn018jd7lmae	cmqnjmmn900ceod01dz6unzwp	cmqrxjpuq000vo701sd9wab7y	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:15:36.991	2026-07-09 11:15:36.991	cmp4s9cxl005gl4018m1wy6wp
cmrdeyp8h0051mn016j9okb8e	cmp6vndph004yp401vluusox7	cmqrxkdg5000xo701l23j4vxw	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:18:47.105	2026-07-09 11:18:47.105	cmp4s8kui005fl40100a1ew4b
cmrdeyzz00055mn013pess7v0	cmp6maci6002tp40119cnxlu3	cmqrxkdg5000xo701l23j4vxw	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:19:01.02	2026-07-09 11:19:01.02	cmp4sadgq005hl4016z9eqilf
cmrdf0xcb0059mn017xk7t8e0	cmpxtfc9z00k2p401mfev8i51	cmqrxkzog000zo7018edaiz42	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:20:30.923	2026-07-09 11:20:30.923	cmp4s9cxl005gl4018m1wy6wp
cmrdf1b8z005dmn01j0002hib	cmpxths4t00k7p401ms2nx4f0	cmqrxkzog000zo7018edaiz42	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:20:48.948	2026-07-09 11:20:48.948	cmp4s9cxl005gl4018m1wy6wp
cmrdf1ta0005hmn01qjl6db2m	cmqno5z2j00dlod0156ophlux	cmqrxkzog000zo7018edaiz42	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:21:12.313	2026-07-09 11:21:12.313	cmp4s9cxl005gl4018m1wy6wp
cmrdf2kux005lmn015kd1gg7s	cmp88f7g90073p401w4uw4pqs	cmqrxkzog000zo7018edaiz42	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:21:48.057	2026-07-09 11:21:48.057	cmp4s8kui005fl40100a1ew4b
cmrdf3q9d005pmn015bwcflg5	cmqpbpjdd001llk01e8vm535o	cmqrxqib6001bo701148h63ce	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:22:41.714	2026-07-09 11:22:41.714	cmp4s8kui005fl40100a1ew4b
cmrdf4058005tmn01tibkj6iv	cmqpbrpkn001slk01gekkfisb	cmqrxqib6001bo701148h63ce	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:22:54.524	2026-07-09 11:22:54.524	cmp4s8kui005fl40100a1ew4b
cmrdf4491005xmn01njvqeksu	cmqpbt84l001zlk01r9quitpi	cmqrxqib6001bo701148h63ce	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:22:59.846	2026-07-09 11:22:59.846	cmp4s8kui005fl40100a1ew4b
cmrdf4a8x0061mn01m2hyk4s6	cmp6n9pyb0047p401exgskztu	cmqrxqib6001bo701148h63ce	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:23:07.618	2026-07-09 11:23:07.618	cmp4sadgq005hl4016z9eqilf
cmrdf4kan0065mn01rzmzvu8h	cmpuxyh5x00itp401pqas19s7	cmqrxqib6001bo701148h63ce	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:23:20.64	2026-07-09 11:23:20.64	cmp4sadgq005hl4016z9eqilf
cmrdf53w30069mn01s7124fsv	cmqnjvfwv00clod01smhvf5v7	cmqrxr3ki001do701db3c865w	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:23:46.035	2026-07-09 11:23:46.035	cmp4s9cxl005gl4018m1wy6wp
cmrdf5dje006dmn01l3rh0ewb	cmqnjmmn900ceod01dz6unzwp	cmqrxr3ki001do701db3c865w	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:23:58.538	2026-07-09 11:23:58.538	cmp4s9cxl005gl4018m1wy6wp
cmrdf6zzm006hmn019473xi6o	cmqw8ilsb001emg0158v8etes	cmqrxr3ki001do701db3c865w	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:25:14.291	2026-07-09 11:25:14.291	cmp4s6te2005el4011ra2qxrl
cmrdf77c6006lmn018jturbg5	cmqw8ha3o0017mg010cohkf7t	cmqrxr3ki001do701db3c865w	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:25:23.815	2026-07-09 11:25:23.815	cmp4s6te2005el4011ra2qxrl
cmrdf7kj4006pmn01b8ilrst0	cmpxtdnho00jxp401mtude4xv	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:25:40.912	2026-07-09 11:25:40.912	cmp4s9cxl005gl4018m1wy6wp
cmrdf7t57006tmn0111vi40iw	cmqz4ky2t003fmg011oeykh0h	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:25:52.075	2026-07-09 11:25:52.075	cmp4s8kui005fl40100a1ew4b
cmrdf8fo8006xmn0167tjpn29	cmpqvd4pp00hkp401fok0cwt8	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:26:21.272	2026-07-09 11:26:21.272	cmp4sadgq005hl4016z9eqilf
cmrdf8p4n0071mn01tc3iwzc1	cmp88f7g90073p401w4uw4pqs	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:26:33.528	2026-07-09 11:26:33.528	cmp4s8kui005fl40100a1ew4b
cmrdf92no0075mn01yqukxocs	cmpxt9h9d00jnp401acy1ppf1	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:26:51.06	2026-07-09 11:26:51.06	cmp4s8kui005fl40100a1ew4b
cmrdf9z5y0079mn01n5qwxk7a	cmps12dpz00hvp401tesxyqev	cmqrxvfno001lo7017g5c5k6u	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:27:33.191	2026-07-09 11:27:33.191	cmp4sbkj5005il4015b2x78mh
cmrdfaifo007dmn01bvq3132l	cmpazudle00byp401oz4zx3e1	cmqrxw40y001no701f545v9bq	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:27:58.164	2026-07-09 11:27:58.164	cmp4slcpz005ul401m1rpf0qa
cmrdfamzx007hmn01hib53k1c	cmpb26l0900ccp4014tau0gjw	cmqrxw40y001no701f545v9bq	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:28:04.078	2026-07-09 11:28:04.078	cmp4sadgq005hl4016z9eqilf
cmrdfat09007lmn01vxbmzjbc	cmp87ym20006yp401590xadl0	cmqrxw40y001no701f545v9bq	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:28:11.865	2026-07-09 11:28:11.865	cmp4sadgq005hl4016z9eqilf
cmrdfazkg007pmn014atg7jf8	cmp6n0r9g003sp401svwhqzjy	cmqrxw40y001no701f545v9bq	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:28:20.368	2026-07-09 11:28:20.368	cmp4s9cxl005gl4018m1wy6wp
cmrdfbaxz007tmn012hbrv25e	cmpya6nur00kgp401et6xel9m	cmqrxw40y001no701f545v9bq	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:28:35.112	2026-07-09 11:28:35.112	cmp4s8kui005fl40100a1ew4b
cmrdfd83d007zmn01dw06ysok	cmp80zids006np4015qmgm2k4	cmrdfci8z007xmn0106ezpk45	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:30:04.729	2026-07-09 11:30:04.729	cmp4s8kui005fl40100a1ew4b
cmrdfdcxf0083mn01q7nflpkt	cmp9p95jj00b2p401dqlrtohp	cmrdfci8z007xmn0106ezpk45	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:30:10.995	2026-07-09 11:30:10.995	cmp4s8kui005fl40100a1ew4b
cmrdfdil50087mn010eg89vom	cmp9pbn9j00b7p401wd3w8sn0	cmrdfci8z007xmn0106ezpk45	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:30:18.33	2026-07-09 11:30:18.33	cmp4s8kui005fl40100a1ew4b
cmrdfdoij008bmn01w2zc04kp	cmpwo5qcf00jgp401y23i6i2r	cmrdfci8z007xmn0106ezpk45	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:30:26.011	2026-07-09 11:30:26.011	cmp4sadgq005hl4016z9eqilf
cmrdfdu7h008fmn01bg62kmvj	cmpuxlbuw00ijp4016pmesm29	cmrdfci8z007xmn0106ezpk45	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:30:33.389	2026-07-09 11:30:33.389	cmp4s8kui005fl40100a1ew4b
cmrdff6n3008jmn0197vmmde2	cmp5dd5sd0074l401pv3drst8	cmqv0naxk000dmg01pk0odf1y	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:31:36.159	2026-07-09 11:31:36.159	cmp4sixhw005ol401euqmhrwh
cmrdffc91008nmn01aingetay	cmp6mxgtj003np401n6d3md2o	cmqv0naxk000dmg01pk0odf1y	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:31:43.43	2026-07-09 11:31:43.43	cmp4skb22005rl4014f0e7wgs
cmrdfficz008rmn01vodkk4bf	cmqf2b3z80007wmtsodeuow25	cmqv0naxk000dmg01pk0odf1y	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:31:51.347	2026-07-09 11:31:51.347	cmp4t5amk005zl4014v76r8bk
cmrdfg0i0008vmn01o35icwnw	cmph5kmv300f7p401b8x8jouu	cmqsaebh500h1o7013z9alk6c	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:32:14.856	2026-07-09 11:32:14.856	cmp4s8kui005fl40100a1ew4b
cmrdfh7fa008zmn017dh6nyx4	cmqqifegn000gp901x4b3a61j	cmqsaebh500h1o7013z9alk6c	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:33:10.486	2026-07-09 11:33:10.486	cmp4sixhw005ol401euqmhrwh
cmrdfk0km0093mn01zkjnbbol	cmpxths4t00k7p401ms2nx4f0	cmqsafbyg00h3o701hho6wtxz	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:35:21.574	2026-07-09 11:35:21.574	cmp4s9cxl005gl4018m1wy6wp
cmrdfl9ls0097mn0156in0w5d	cmqqimbo30011p9015ihys621	cmqsafbyg00h3o701hho6wtxz	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:36:19.936	2026-07-09 11:36:19.936	cmp4s8kui005fl40100a1ew4b
cmrdflx4t009bmn01yzc0qh85	cmqno5z2j00dlod0156ophlux	cmqsag6pq00h5o7014men1p68	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:36:50.429	2026-07-09 11:36:50.429	cmp4s9cxl005gl4018m1wy6wp
cmrdfm3kg009fmn01hymyh0ed	cmpqvd4pp00hkp401fok0cwt8	cmqsag6pq00h5o7014men1p68	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:36:58.769	2026-07-09 11:36:58.769	cmp4sadgq005hl4016z9eqilf
cmrdfnky3009jmn01h6dwanu3	cmqf2b40z000jwmtsglaha6m4	cmqsag6pq00h5o7014men1p68	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:38:07.948	2026-07-09 11:38:07.948	cmp4s8kui005fl40100a1ew4b
cmrdfnxol009nmn01gs3tyq5n	cmqf2b41m000pwmtsgzlybd2p	cmqsag6pq00h5o7014men1p68	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:38:24.454	2026-07-09 11:38:24.454	cmp4s8kui005fl40100a1ew4b
cmrdfwko6009vmn01ybm0nxdq	cmqnnz1kg00d8od0103g8czza	cmqzavffl003rmg01jh06614o	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:45:07.494	2026-07-09 11:45:07.494	cmp4s9cxl005gl4018m1wy6wp
cmrdfx0v9009zmn013jkf7jsa	cmqz4i19x0038mg01irua66ou	cmqzavv4x003tmg01emqe1sxn	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:45:28.485	2026-07-09 11:45:28.485	cmp4s8kui005fl40100a1ew4b
cmrdfy6wy00a3mn01s6gvrmp1	cmqqimbo30011p9015ihys621	cmqzaxoid003zmg01n5umqrul	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:46:22.979	2026-07-09 11:46:22.979	cmp4s8kui005fl40100a1ew4b
cmrdfyc7h00a7mn011hn8gvzp	cmps12dpz00hvp401tesxyqev	cmqzaxoid003zmg01n5umqrul	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:46:29.838	2026-07-09 11:46:29.838	cmp4sbkj5005il4015b2x78mh
cmrdfz0x500abmn01b9drjck4	cmqw8ec6p0010mg01ce7hdn33	cmqzaybih0041mg01964d2791	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:47:01.865	2026-07-09 11:47:01.865	cmp4sadgq005hl4016z9eqilf
cmrdfzsi500afmn01wmx2fwwi	cmqzcgki3006umg01b9522uso	cmqzb4q3d0045mg013g2z9beb	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:47:37.614	2026-07-09 11:47:37.614	cmquqvx9k00jio701xv9bwsuw
cmrdg0yyh00ajmn01qumpv84e	cmqno5z2j00dlod0156ophlux	cmqzb5nyr0047mg01plloupsf	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:48:32.634	2026-07-09 11:48:32.634	cmp4s9cxl005gl4018m1wy6wp
cmrdg17gk00anmn01016y7ywm	cmqnlovfk00czod0169336zw1	cmqzb5nyr0047mg01plloupsf	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:48:43.652	2026-07-09 11:48:43.652	cmp4s8kui005fl40100a1ew4b
cmrdg1eqh00armn01fqlce0uc	cmp6me3mt002yp401esc9ykn5	cmqzb5nyr0047mg01plloupsf	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:48:53.081	2026-07-09 11:48:53.081	cmp4sadgq005hl4016z9eqilf
cmrdg1ko200avmn011fv28kgw	cmqpbpjdd001llk01e8vm535o	cmqzb5nyr0047mg01plloupsf	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:49:00.77	2026-07-09 11:49:00.77	cmp4s8kui005fl40100a1ew4b
cmrdg1ugg00azmn01f3dxxvc7	cmqpbt84l001zlk01r9quitpi	cmqzb5nyr0047mg01plloupsf	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:49:13.456	2026-07-09 11:49:13.456	cmp4s8kui005fl40100a1ew4b
cmrdg2a7h00b3mn01ia4j7a27	cmpazudle00byp401oz4zx3e1	cmqzb68lc0049mg01yfgjbky0	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:49:33.869	2026-07-09 11:49:33.869	cmp4slcpz005ul401m1rpf0qa
cmrdg2g1800b7mn0196d89898	cmp5i45nq000ap401mr5kujgq	cmqzb68lc0049mg01yfgjbky0	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:49:41.42	2026-07-09 11:49:41.42	cmp4sadgq005hl4016z9eqilf
cmrdg2mid00bbmn01qhd26aj7	cmpb26l0900ccp4014tau0gjw	cmqzb68lc0049mg01yfgjbky0	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:49:49.814	2026-07-09 11:49:49.814	cmp4sadgq005hl4016z9eqilf
cmrdg3ci300bfmn01xsiqeba3	cmqw8ilsb001emg0158v8etes	cmqzb7ybi004bmg010yvyjm53	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:50:23.5	2026-07-09 11:50:23.5	cmp4t5amk005zl4014v76r8bk
cmrdg3hk300bjmn01rqwj1eyd	cmqw8ha3o0017mg010cohkf7t	cmqzb7ybi004bmg010yvyjm53	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:50:30.051	2026-07-09 11:50:30.051	cmp4t5amk005zl4014v76r8bk
cmrdg3o9s00bnmn01k4f0qhi2	cmpuxlbuw00ijp4016pmesm29	cmqzb7ybi004bmg010yvyjm53	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:50:38.752	2026-07-09 11:50:38.752	cmp4sixhw005ol401euqmhrwh
cmrdg4lmb00brmn01cwa2bqjw	cmpuxbc7900i9p401d4rkyuom	cmqzb8v2z004dmg01zbaatlac	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:51:21.972	2026-07-09 11:51:21.972	cmp4sejni005kl4013ure33mc
cmrdg54lt00bzmn0154y0fkxu	cmr1tvvf8001fmm01nvgjy6v9	cmqzb8v2z004dmg01zbaatlac	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:51:46.577	2026-07-09 11:51:46.577	cmp4sbkj5005il4015b2x78mh
cmrdg5a6a00c3mn01opmz2zf9	cmqf2b3xg0001wmtsjmoqct8a	cmqzb8v2z004dmg01zbaatlac	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:51:53.794	2026-07-09 11:51:53.794	cmp4skb22005rl4014f0e7wgs
cmrdg5r6800c7mn01s6byo1cz	cmp5dd5sd0074l401pv3drst8	cmqzb9g51004fmg014z0v1i91	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:52:15.824	2026-07-09 11:52:15.824	cmp4sixhw005ol401euqmhrwh
cmrdg5wvz00cbmn01h85w5zdb	cmp88f7g90073p401w4uw4pqs	cmqzb9g51004fmg014z0v1i91	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:52:23.231	2026-07-09 11:52:23.231	cmp4s8kui005fl40100a1ew4b
cmrdg9gv100cfmn01rnkk3ew3	cmpqvd4pp00hkp401fok0cwt8	cmqzba3hr004hmg01l9mur8kl	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:55:09.086	2026-07-09 11:55:09.086	cmp4sadgq005hl4016z9eqilf
cmrdg9m5j00cjmn01xyna3c96	cmqz4ky2t003fmg011oeykh0h	cmqzba3hr004hmg01l9mur8kl	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:55:15.943	2026-07-09 11:55:15.943	cmp4s8kui005fl40100a1ew4b
cmrdga4ra00cnmn01hxgo6lzb	cmqw8ilsb001emg0158v8etes	cmqzbbxfq004lmg01ab9yig6w	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:55:40.054	2026-07-09 11:55:40.054	cmp4t5amk005zl4014v76r8bk
cmrdgaais00crmn01wuc8t1us	cmqw8ha3o0017mg010cohkf7t	cmqzbbxfq004lmg01ab9yig6w	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:55:47.524	2026-07-09 11:55:47.524	cmp4t5amk005zl4014v76r8bk
cmrdgaqgr00cvmn01k77cco0b	cmpv004tl00iyp4017n7rkxr5	cmqzbgr3k004nmg01j97fznwu	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:56:08.187	2026-07-09 11:56:08.187	cmp4sadgq005hl4016z9eqilf
cmrdgavfk00czmn01kbfx2d7j	cmp6n0r9g003sp401svwhqzjy	cmqzbgr3k004nmg01j97fznwu	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:56:14.624	2026-07-09 11:56:14.624	cmp4s9cxl005gl4018m1wy6wp
cmrdgcnln00d3mn01xlid3dee	cmr3dc13z008mmm01r1xcp8qr	cmqzbmdo40053mg01fabbc3zu	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:57:37.787	2026-07-09 11:57:37.787	cmp4s8kui005fl40100a1ew4b
cmrdgctjq00d7mn01asv4f3w3	cmqpbpjdd001llk01e8vm535o	cmqzbmdo40053mg01fabbc3zu	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:57:45.494	2026-07-09 11:57:45.494	cmp4s8kui005fl40100a1ew4b
cmrdge5q100dbmn01t34k3lv5	cmp9l6t2c00acp4018v82zolp	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:58:47.929	2026-07-09 11:58:47.929	cmp4s9cxl005gl4018m1wy6wp
cmrdgeb6d00dfmn0151y7nwe4	cmqnlovfk00czod0169336zw1	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:58:54.997	2026-07-09 11:58:54.997	cmp4s8kui005fl40100a1ew4b
cmrdgej8k00djmn01yyl2rywv	cmpv004tl00iyp4017n7rkxr5	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:59:05.445	2026-07-09 11:59:05.445	cmp4sadgq005hl4016z9eqilf
cmrdgese600dnmn01yth5e2o8	cmqno5z2j00dlod0156ophlux	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:59:17.311	2026-07-09 11:59:17.311	cmp4s9cxl005gl4018m1wy6wp
cmrdgeznp00drmn01odkspjxj	cmr3dc13z008mmm01r1xcp8qr	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:59:26.725	2026-07-09 11:59:26.725	cmp4s8kui005fl40100a1ew4b
cmrdgf53z00dvmn01bchza0ob	cmpb26l0900ccp4014tau0gjw	cmqzbrqdd005jmg01lsrfq98k	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 11:59:33.791	2026-07-09 11:59:33.791	cmp4sadgq005hl4016z9eqilf
cmrdgfqcp00dzmn01tjs9lwpw	cmp5e2po6007el401m0wr4bxe	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:00:01.321	2026-07-09 12:00:01.321	cmp4s9cxl005gl4018m1wy6wp
cmrdgfwdm00e3mn01zupbgysc	cmp6me3mt002yp401esc9ykn5	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:00:09.13	2026-07-09 12:00:09.13	cmp4sadgq005hl4016z9eqilf
cmrdggodf00e7mn01lr9dkvxs	cmp5d9vn5006zl401fo5j5q04	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:00:45.411	2026-07-09 12:00:45.411	cmp4slcpz005ul401m1rpf0qa
cmrdgrhtr00ebmn01pij2x2je	cmqqimbo30011p9015ihys621	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:09:10.144	2026-07-09 12:09:10.144	cmp4s8kui005fl40100a1ew4b
cmrdgroud00efmn01s9b5n9ga	cmr1tvvf8001fmm01nvgjy6v9	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:09:19.238	2026-07-09 12:09:19.238	cmp4sbkj5005il4015b2x78mh
cmrdgs5z700ejmn016o47qedh	cmp88f7g90073p401w4uw4pqs	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:09:41.443	2026-07-09 12:09:41.443	cmp4s8kui005fl40100a1ew4b
cmrdgsl1o00enmn01poozho9g	cmqw8ec6p0010mg01ce7hdn33	cmqzbjt8e004vmg013phelgz0	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:10:00.972	2026-07-09 12:10:00.972	cmp4sadgq005hl4016z9eqilf
cmrdgt15a00ermn012mbwdzn8	cmqnjvfwv00clod01smhvf5v7	cmqzbjt8e004vmg013phelgz0	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:10:21.838	2026-07-09 12:10:21.838	cmp4s9cxl005gl4018m1wy6wp
cmrdgt6hn00evmn01ojcrd9wu	cmqnjmmn900ceod01dz6unzwp	cmqzbjt8e004vmg013phelgz0	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:10:28.764	2026-07-09 12:10:28.764	cmp4s9cxl005gl4018m1wy6wp
cmrdgtcet00ezmn019l175k9p	cmqnjhe4500c7od01xunmmhyz	cmqzbjt8e004vmg013phelgz0	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:10:36.437	2026-07-09 12:10:36.437	cmp4s8kui005fl40100a1ew4b
cmrdgu3sv00f3mn01l9bjqd0o	cmr3dno9x008vmm01yn5zbnx3	cmqzbjt8e004vmg013phelgz0	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:11:11.935	2026-07-09 12:11:11.935	cmp4s8kui005fl40100a1ew4b
cmrdgzrhq00fdmn01u4s8qnxk	cmqpbrpkn001slk01gekkfisb	cmqzbknbz004xmg01m9lpevgu	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:15:35.918	2026-07-09 12:15:35.918	cmp4s8kui005fl40100a1ew4b
cmrdh000c00fhmn01wjsol8lm	cmqpbt84l001zlk01r9quitpi	cmqzbknbz004xmg01m9lpevgu	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:15:46.957	2026-07-09 12:15:46.957	cmp4s8kui005fl40100a1ew4b
cmrdh07cj00flmn01wbll8lij	cmp6mxgtj003np401n6d3md2o	cmqzbknbz004xmg01m9lpevgu	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:15:56.468	2026-07-09 12:15:56.468	cmp4skb22005rl4014f0e7wgs
cmrdh0dvu00fpmn01ww3nimu1	cmr3dc13z008mmm01r1xcp8qr	cmqzbknbz004xmg01m9lpevgu	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:16:04.938	2026-07-09 12:16:04.938	cmp4s8kui005fl40100a1ew4b
cmrdh1qaf00fxmn01r574yca6	cmpqvd4pp00hkp401fok0cwt8	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:17:07.671	2026-07-09 12:17:07.671	cmp4sadgq005hl4016z9eqilf
cmrdh1ufu00g1mn01mp1x0uth	cmp5qutpd0015p401e0b83fu9	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:17:13.05	2026-07-09 12:17:13.05	cmp4sadgq005hl4016z9eqilf
cmrdh1yey00g5mn0165slga9n	cmp5qzr8e001ap401fa4uuzw4	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:17:18.203	2026-07-09 12:17:18.203	cmp4sadgq005hl4016z9eqilf
cmrdh24fs00g9mn011j5lmro5	cmp9n16yg00aqp401yfgd8zit	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:17:26.008	2026-07-09 12:17:26.008	cmp4s8kui005fl40100a1ew4b
cmrdh2vph00gdmn01cgiv13vi	cmp9muoo600alp401b1jj91hv	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:18:01.349	2026-07-09 12:18:01.349	cmp4s8kui005fl40100a1ew4b
cmrdh9ksj00ghmn01h6dwbazq	cmqf2b40z000jwmtsglaha6m4	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:23:13.795	2026-07-09 12:23:13.795	cmp4s8kui005fl40100a1ew4b
cmrdh9p7300glmn018paljnei	cmps12dpz00hvp401tesxyqev	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:23:19.503	2026-07-09 12:23:19.503	cmp4sbkj5005il4015b2x78mh
cmrdh9tkg00gpmn01rmqfgpzx	cmqz4ky2t003fmg011oeykh0h	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:23:25.168	2026-07-09 12:23:25.168	cmp4s8kui005fl40100a1ew4b
cmrdh9ys500gtmn01vkqusg82	cmr66x4vm00aumm01n1n9q5b4	cmqzbnf9h0055mg01ej1yk1tr	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:23:31.926	2026-07-09 12:23:31.926	cmp4sadgq005hl4016z9eqilf
cmrdhaf0y00gxmn01cq264r72	cmpazudle00byp401oz4zx3e1	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:23:52.978	2026-07-09 12:23:52.978	cmp4slcpz005ul401m1rpf0qa
cmrdhali300h1mn01xz5mav1c	cmpya6nur00kgp401et6xel9m	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:24:01.371	2026-07-09 12:24:01.371	cmp4s8kui005fl40100a1ew4b
cmrdhbgk000h5mn01zl11e5v2	cmqnjhe4500c7od01xunmmhyz	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:24:41.617	2026-07-09 12:24:41.617	cmp4s8kui005fl40100a1ew4b
cmrdhbn9100h9mn01v2ztqfd7	cmp87ym20006yp401590xadl0	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:24:50.293	2026-07-09 12:24:50.293	cmp4sadgq005hl4016z9eqilf
cmrdhialv00hdmn01zuaa47fj	cmp80zids006np4015qmgm2k4	cmqzbp13s005bmg01hey1nfx7	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:30:00.499	2026-07-09 12:30:00.499	cmp4s8kui005fl40100a1ew4b
cmrdhiiia00hhmn01x6oh2uu7	cmpwo5qcf00jgp401y23i6i2r	cmqzbp13s005bmg01hey1nfx7	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:30:10.738	2026-07-09 12:30:10.738	cmp4sadgq005hl4016z9eqilf
cmrdhimli00hlmn013mhgg520	cmp9pbn9j00b7p401wd3w8sn0	cmqzbp13s005bmg01hey1nfx7	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:30:16.038	2026-07-09 12:30:16.038	cmp4s8kui005fl40100a1ew4b
cmrdhiuj700hpmn015w9a0nil	cmp9p95jj00b2p401dqlrtohp	cmqzbp13s005bmg01hey1nfx7	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:30:26.323	2026-07-09 12:30:26.323	cmp4s8kui005fl40100a1ew4b
cmrdhj1yt00htmn01vcvqhd3e	cmpuxbc7900i9p401d4rkyuom	cmqzbp13s005bmg01hey1nfx7	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:30:35.957	2026-07-09 12:30:35.957	cmp4sejni005kl4013ure33mc
cmrdhj6r200hxmn01ruzcrfyg	cmpuxlbuw00ijp4016pmesm29	cmqzbp13s005bmg01hey1nfx7	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:30:42.158	2026-07-09 12:30:42.158	cmp4s8kui005fl40100a1ew4b
cmrdhjjmz00i1mn01sht2o364	cmpmhc40500h9p40180sb0edr	cmqzbpi8v005dmg01abdadn4r	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:30:58.859	2026-07-09 12:30:58.859	cmp4sixhw005ol401euqmhrwh
cmrdhjqm200i5mn01kyvn5utc	cmp6mxgtj003np401n6d3md2o	cmqzbpi8v005dmg01abdadn4r	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:31:07.898	2026-07-09 12:31:07.898	cmp4skb22005rl4014f0e7wgs
cmrdhllgq00ibmn01110shzb0	cmqw8ilsb001emg0158v8etes	cmqzbsw1n005nmg01p1ci3ppa	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:32:34.538	2026-07-09 12:32:34.538	cmp4t5amk005zl4014v76r8bk
cmrdhlq0400ifmn01p6nhm1gs	cmqw8ha3o0017mg010cohkf7t	cmqzbsw1n005nmg01p1ci3ppa	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:32:40.42	2026-07-09 12:32:40.42	cmp4t5amk005zl4014v76r8bk
cmrdhm2jt00ijmn01wdal33e4	cmp6vndph004yp401vluusox7	cmqzbtc06005pmg01s13z6jmi	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:32:56.682	2026-07-09 12:32:56.682	cmp4s8kui005fl40100a1ew4b
cmrdhm8gq00inmn018xtstzxb	cmp6maci6002tp40119cnxlu3	cmqzbtc06005pmg01s13z6jmi	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:33:04.346	2026-07-09 12:33:04.346	cmp4sadgq005hl4016z9eqilf
cmrdhnypv00irmn011hkdbv0q	cmpuxyh5x00itp401pqas19s7	cmqzbttac005rmg01g4u63y8s	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:34:25.027	2026-07-09 12:34:25.027	cmp4sadgq005hl4016z9eqilf
cmrdhpj8z00ivmn01ppelwl3y	cmr66x4vm00aumm01n1n9q5b4	cmqzbvm2w005xmg01sausgthh	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:35:38.291	2026-07-09 12:35:38.291	cmp4sadgq005hl4016z9eqilf
cmrdhppgr00izmn01lgrjcc2s	cmr54gw0r009omm01n0aos5l6	cmqzbvm2w005xmg01sausgthh	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:35:46.347	2026-07-09 12:35:46.347	cmp4s8kui005fl40100a1ew4b
cmrdhqcwo00j3mn01emlff9pg	cmr3dc13z008mmm01r1xcp8qr	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:36:16.729	2026-07-09 12:36:16.729	cmp4s8kui005fl40100a1ew4b
cmrdhqrys00j7mn0193pj1061	cmqpbpjdd001llk01e8vm535o	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:36:36.245	2026-07-09 12:36:36.245	cmp4s8kui005fl40100a1ew4b
cmrdhr2wt00jbmn01k899q38g	cmr6940rg00bemm01s11l95mw	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:36:50.429	2026-07-09 12:36:50.429	cmp4s8kui005fl40100a1ew4b
cmrdhsd9300jfmn0154zbixhg	cmp5d9vn5006zl401fo5j5q04	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:37:50.487	2026-07-09 12:37:50.487	cmp4slcpz005ul401m1rpf0qa
cmrdht97800jjmn01lblxs76i	cmpuxbc7900i9p401d4rkyuom	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:38:31.892	2026-07-09 12:38:31.892	cmp4sejni005kl4013ure33mc
cmrdhtokh00jnmn015vyw6zye	cmr91dvvk00ddmm01yvoi91dd	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:38:51.81	2026-07-09 12:38:51.81	cmr0t6kdb000mmm01e58p4sux
cmrdhttyu00jrmn0185e67s3t	cmqf2b405000dwmtsddcf7agj	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:38:58.806	2026-07-09 12:38:58.806	cmp4s8kui005fl40100a1ew4b
cmrdhtypc00jvmn01gmv6vqk6	cmp6me3mt002yp401esc9ykn5	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:39:04.945	2026-07-09 12:39:04.945	cmp4sadgq005hl4016z9eqilf
cmrdhu49700jzmn018mklvs6a	cmpdskdbb00e0p401bi55y2g7	cmqzbwwxw0061mg01qu6o8mfh	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:39:12.14	2026-07-09 12:39:12.14	cmp4skb22005rl4014f0e7wgs
cmrdhugp900k3mn01ovoz5li6	cmpazudle00byp401oz4zx3e1	cmqzbxamw0063mg01z3g0846i	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:39:28.269	2026-07-09 12:39:28.269	cmp4slcpz005ul401m1rpf0qa
cmrdhv7ph00k7mn01f0r4an12	cmp9jyb2l009tp4012t706wff	cmqzbxamw0063mg01z3g0846i	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:40:03.269	2026-07-09 12:40:03.269	cmp4s8kui005fl40100a1ew4b
cmrdhvkl500kbmn01nt86f9jf	cmpazudle00byp401oz4zx3e1	cmqzbxre80065mg01ewd495p6	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:40:19.961	2026-07-09 12:40:19.961	cmp4slcpz005ul401m1rpf0qa
cmrdhvoix00kfmn01tofkcekb	cmr91oeqe00dvmm012s7it3wq	cmqzbxre80065mg01ewd495p6	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-09 12:40:25.066	2026-07-09 12:40:25.066	cmp4t00w6005xl401jv0qklyp
cmriyvcos00ogmn01c08kyrqe	cmr92ygsq00e4mm01t2ww4seu	cmr0lf2qk000apn01mmcs724c	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 08:34:54.077	2026-07-13 08:34:54.077	cmp4s6te2005el4011ra2qxrl
cmriyvigq00okmn016dk8prhm	cmr91fzq700dmmm01t48rlkdj	cmr0lf2qk000apn01mmcs724c	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 08:35:01.562	2026-07-13 08:35:01.562	cmr0t6kdb000mmm01e58p4sux
cmriywtbf00oumn01l1jrpmic	cmr91oeqe00dvmm012s7it3wq	cmr0lf2qt000bpn01sduu8iy3	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 08:36:02.283	2026-07-13 08:36:02.283	cmp4s6te2005el4011ra2qxrl
cmrj4meew00p0mn011do1kw24	cmpuxbc7900i9p401d4rkyuom	cmr0lf2r6000epn01b01vkwpm	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 11:15:54.104	2026-07-13 11:15:54.104	cmp4sejni005kl4013ure33mc
cmrj4mkqh00p4mn01pch2oyns	cmpuxpn4l00iop40156zk6rje	cmr0lf2r6000epn01b01vkwpm	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 11:16:02.298	2026-07-13 11:16:02.298	cmp4s8kui005fl40100a1ew4b
cmrj4n05u00p8mn01mjv0hud9	cmqqimbo30011p9015ihys621	cmr0lf2r6000epn01b01vkwpm	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 11:16:22.291	2026-07-13 11:16:22.291	cmp4s8kui005fl40100a1ew4b
cmrj4n5wr00pcmn01rnun7tvn	cmps12dpz00hvp401tesxyqev	cmr0lf2r6000epn01b01vkwpm	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 11:16:29.739	2026-07-13 11:16:29.739	cmp4sbkj5005il4015b2x78mh
cmrj4o3bi00pgmn0197dmjt17	cmqnlllpk00csod01wkefk1ot	cmr0lf2r8000fpn013mz6ywd2	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 11:17:13.038	2026-07-13 11:17:13.038	cmp4s8kui005fl40100a1ew4b
cmrjbf0nz0005qd01ngakmpc9	cmqrwntpy0016sc0146g80wvq	cmqrxjpuq000vo701sd9wab7y	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-13 14:26:07.008	2026-07-13 14:26:07.008	cmp4s9cxl005gl4018m1wy6wp
cmrkjwgw50018lq0185etz99w	cmqno2ywp00dfod01x3mtrdjg	cmqrxkdg5000xo701l23j4vxw	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:11:24.294	2026-07-14 11:11:24.294	cmp4s8kui005fl40100a1ew4b
cmrkjwt7d001clq01vklm336n	cmpuxgfvo00iep401kuin241v	cmqrxkdg5000xo701l23j4vxw	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:11:40.249	2026-07-14 11:11:40.249	cmp4s9cxl005gl4018m1wy6wp
cmrkjx182001glq015zx2jh9m	cmpzh61qy00kpp401u52chqfx	cmqrxkzog000zo7018edaiz42	2026-06-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:11:50.642	2026-07-14 11:11:50.642	cmp4s8kui005fl40100a1ew4b
cmrkjxidr001klq01h0sx5pdf	cmqrwntpy0016sc0146g80wvq	cmqrxr3ki001do701db3c865w	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:12:12.879	2026-07-14 11:12:12.879	cmp4s9cxl005gl4018m1wy6wp
cmrkjy11a001olq01u58qcnhq	cmpzh61qy00kpp401u52chqfx	cmqrxrtiz001fo7017x6xlb5z	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:12:37.054	2026-07-14 11:12:37.054	cmp4s8kui005fl40100a1ew4b
cmrkjycyt001slq01vz9bcv20	cmp6mujhf003ip4019yxl5iri	cmrdfci8z007xmn0106ezpk45	2026-06-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:12:52.517	2026-07-14 11:12:52.517	cmp4sadgq005hl4016z9eqilf
cmrkjzn05001wlq01xvb5963l	cmpuxgfvo00iep401kuin241v	cmqsafbyg00h3o701hho6wtxz	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:13:52.181	2026-07-14 11:13:52.181	cmp4s9cxl005gl4018m1wy6wp
cmrkjzsxr0020lq01390auvh9	cmqno2ywp00dfod01x3mtrdjg	cmqsafbyg00h3o701hho6wtxz	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:13:59.871	2026-07-14 11:13:59.871	cmp4s8kui005fl40100a1ew4b
cmrkk1grp0024lq0168pt9ya2	cmqf2b42m000vwmtsnd6eu11l	cmqsag6pq00h5o7014men1p68	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:15:17.413	2026-07-14 11:15:17.413	cmp4s8kui005fl40100a1ew4b
cmrkk398m0028lq01sas485ay	cmpuxgfvo00iep401kuin241v	cmqzba3hr004hmg01l9mur8kl	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:16:40.966	2026-07-14 11:16:40.966	cmp4s9cxl005gl4018m1wy6wp
cmrkk4xfp002clq01isafqktc	cmqf2b42m000vwmtsnd6eu11l	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:17:58.981	2026-07-14 11:17:58.981	cmp4s8kui005fl40100a1ew4b
cmrkk51h4002glq01a316rdyu	cmqrwntpy0016sc0146g80wvq	cmqzbj8gh004tmg01trtzpkn4	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:18:04.216	2026-07-14 11:18:04.216	cmp4s9cxl005gl4018m1wy6wp
cmrkk5uhm002klq01l6ikn1kv	cmp6mujhf003ip4019yxl5iri	cmqzbnzxw0057mg01m2o14l0o	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:18:41.819	2026-07-14 11:18:41.819	cmp4sadgq005hl4016z9eqilf
cmrkk7yej002olq01izrxxl0e	cmpuxgfvo00iep401kuin241v	cmqzbu918005tmg01vn3qffxk	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:20:20.203	2026-07-14 11:20:20.203	cmp4s9cxl005gl4018m1wy6wp
cmrkk87is002slq01cmlqayu0	cmqf2b42m000vwmtsnd6eu11l	cmqzbu918005tmg01vn3qffxk	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:20:32.02	2026-07-14 11:20:32.02	cmp4sadgq005hl4016z9eqilf
cmrkkdpnt0032lq01ammyxbvz	cmqw8njse001zmg010hmpycb7	cmqzbokag0059mg01kwlb280h	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:24:48.809	2026-07-14 11:24:48.809	cmr0t6kdb000mmm01e58p4sux
cmrkkgiow003elq01b6xx1crv	cmqw8khue001lmg01a483drty	cmqzbokag0059mg01kwlb280h	2026-07-02	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:26:59.744	2026-07-14 11:26:59.744	cmp4t00w6005xl401jv0qklyp
cmrkkh5z7003ilq01fbpo39vh	cmqw8njse001zmg010hmpycb7	cmqzbw2g5005zmg01znmn6j5u	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:27:29.923	2026-07-14 11:27:29.923	cmr0t6kdb000mmm01e58p4sux
cmrkkjbe6003mlq01jvcjdm97	cmp6mujhf003ip4019yxl5iri	cmqzbxamw0063mg01z3g0846i	2026-07-05	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:29:10.254	2026-07-14 11:29:10.254	cmp4sadgq005hl4016z9eqilf
cmrkkr0nd003wlq01hc9nh213	cmqp4ky050002lk01gx0v2tv9	cmqsag6pq00h5o7014men1p68	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:35:09.578	2026-07-14 11:35:09.578	cmp4s6te2005el4011ra2qxrl
cmrkkx62l0046lq01cjuii88a	cmqp4ky050002lk01gx0v2tv9	cmqzbhbhv004pmg010mnvuaem	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:39:56.542	2026-07-14 11:39:56.542	cmp4s6te2005el4011ra2qxrl
cmrkl2y2k004glq012wet6ct9	cmqp4ky050002lk01gx0v2tv9	cmqzbsa16005lmg01x3a4jtxl	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 11:44:26.109	2026-07-14 11:44:26.109	cmp4s6te2005el4011ra2qxrl
cmrklxm7a004slq01tin0a4ik	cmqp4ky050002lk01gx0v2tv9	cmr0lf2s6000rpn013e5f88dk	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 12:08:17.063	2026-07-14 12:08:17.063	cmp4s6te2005el4011ra2qxrl
cmrklzzj10052lq01sspq3luq	cmqp4ky050002lk01gx0v2tv9	cmr0lf2uy001fpn011bm0do45	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 12:10:07.645	2026-07-14 12:10:07.645	cmp4s6te2005el4011ra2qxrl
cmrkt1ony005slq01lruokqlz	cmpxtdnho00jxp401mtude4xv	cmqsafbyg00h3o701hho6wtxz	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:27:24.19	2026-07-14 15:27:24.19	cmp4s9cxl005gl4018m1wy6wp
cmrkt2k9f005wlq013x6vj5b9	cmpxtfc9z00k2p401mfev8i51	cmqsafbyg00h3o701hho6wtxz	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:28:05.139	2026-07-14 15:28:05.139	cmp4s9cxl005gl4018m1wy6wp
cmrkt42ei0060lq01vpo2t604	cmpxtfc9z00k2p401mfev8i51	cmqzba3hr004hmg01l9mur8kl	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:29:15.307	2026-07-14 15:29:15.307	cmp4s9cxl005gl4018m1wy6wp
cmrkt4a7a0064lq01n792rnup	cmpxtdnho00jxp401mtude4xv	cmqzba3hr004hmg01l9mur8kl	2026-06-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:29:25.414	2026-07-14 15:29:25.414	cmp4s9cxl005gl4018m1wy6wp
cmrkt5a7g0068lq01rgkgewg1	cmpxtdnho00jxp401mtude4xv	cmqzbl5hx004zmg01xgx79lhn	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:30:12.076	2026-07-14 15:30:12.076	cmp4s9cxl005gl4018m1wy6wp
cmrkt61ce006clq0199bttfc6	cmpxtfc9z00k2p401mfev8i51	cmqzbu918005tmg01vn3qffxk	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:30:47.246	2026-07-14 15:30:47.246	cmp4s9cxl005gl4018m1wy6wp
cmrkt6883006glq0192l52vdm	cmpxtdnho00jxp401mtude4xv	cmqzbu918005tmg01vn3qffxk	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:30:56.164	2026-07-14 15:30:56.164	cmp4s9cxl005gl4018m1wy6wp
cmrkt77hk006klq012wkqm1ta	cmpuxyh5x00itp401pqas19s7	cmqzbu918005tmg01vn3qffxk	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-14 15:31:41.865	2026-07-14 15:31:41.865	cmp4sadgq005hl4016z9eqilf
cmrlvjf95007rlq01waptod7a	cmraefj5300hzmm01gbupayou	cmr0lf2r8000fpn013mz6ywd2	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:24:57.21	2026-07-15 09:24:57.21	cmp4s6te2005el4011ra2qxrl
cmrlvpxog007vlq01jhotpayg	cmqnlovfk00czod0169336zw1	cmr0lf2rh000ipn01hpostdo9	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:30:01.025	2026-07-15 09:30:01.025	cmp4s8kui005fl40100a1ew4b
cmrlvq37f007zlq01a7fg55mk	cmp6me3mt002yp401esc9ykn5	cmr0lf2rh000ipn01hpostdo9	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:30:08.188	2026-07-15 09:30:08.188	cmp4sadgq005hl4016z9eqilf
cmrlvqgnc0083lq01335qvttu	cmpazudle00byp401oz4zx3e1	cmr0lf2rj000jpn01fw1phoju	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:30:25.608	2026-07-15 09:30:25.608	cmp4slcpz005ul401m1rpf0qa
cmrlvqm3e0087lq01b434aaq4	cmp6mh9mn0033p401xa6v43p7	cmr0lf2rj000jpn01fw1phoju	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:30:32.667	2026-07-15 09:30:32.667	cmp4sejni005kl4013ure33mc
cmrlvqqra008blq013sx484b7	cmpb26l0900ccp4014tau0gjw	cmr0lf2rj000jpn01fw1phoju	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:30:38.71	2026-07-15 09:30:38.71	cmp4sadgq005hl4016z9eqilf
cmrlwqx7j008llq017lj0plpj	cmqur9js700juo7015s7s7fwr	cmq9fs5iz0017wmysf6r5tuse	2026-05-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:58:46.687	2026-07-15 09:58:46.687	cmqur0gkm00jko7014ajnmg2a
cmrlwrf5q008plq010jhwfnhf	cmqur9js700juo7015s7s7fwr	cmq9hum75001twmyslo2e0ghs	2026-05-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:59:09.951	2026-07-15 09:59:09.951	cmqur0gkm00jko7014ajnmg2a
cmrlwrrjs008tlq01nh6akue6	cmqur9js700juo7015s7s7fwr	cmq9i9bc8002nwmys7rr8hoqf	2026-05-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:59:26.008	2026-07-15 09:59:26.008	cmqur0gkm00jko7014ajnmg2a
cmrlws63n008xlq01zpn1fne1	cmqur9js700juo7015s7s7fwr	cmq9ja2de003dwmys3gepgv50	2026-05-31	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 09:59:44.868	2026-07-15 09:59:44.868	cmqur0gkm00jko7014ajnmg2a
cmrlwsl110091lq01cuoauuqz	cmqur9js700juo7015s7s7fwr	cmqmn70we0052od01arz8py2d	2026-06-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:00:04.213	2026-07-15 10:00:04.213	cmqur0gkm00jko7014ajnmg2a
cmrlwt2z20095lq0188w3irwh	cmqur9js700juo7015s7s7fwr	cmqmx0whp009cod01f6okjpuy	2026-06-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:00:27.47	2026-07-15 10:00:27.47	cmqur0gkm00jko7014ajnmg2a
cmrlwtiob0099lq01dnz1ia87	cmqur9js700juo7015s7s7fwr	cmqmynapp00aeod01gdldjelr	2026-06-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:00:47.819	2026-07-15 10:00:47.819	cmqur0gkm00jko7014ajnmg2a
cmrlwtveo009dlq01fqy9l4jg	cmqur9js700juo7015s7s7fwr	cmqmzmzi400buod01gtmsi0f1	2026-06-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:01:04.32	2026-07-15 10:01:04.32	cmqur0gkm00jko7014ajnmg2a
cmrlwvqcc009hlq01y07c2tml	cmqur9js700juo7015s7s7fwr	cmqrxm7ii0011o701b63kg6sz	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:02:31.068	2026-07-15 10:02:31.068	cmqur0gkm00jko7014ajnmg2a
cmrlwx9b9009llq010cd0zrs0	cmqur9js700juo7015s7s7fwr	cmqzau8ts003nmg01dlzbhcwv	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:03:42.309	2026-07-15 10:03:42.309	cmqur0gkm00jko7014ajnmg2a
cmrlyfw16009plq01zkqbjany	cmr0e8q3k009bmg01p00ba0nx	cmr0lf2r2000dpn01uv7pvl3x	2026-07-06	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:46:11.179	2026-07-15 10:46:11.179	cmqur0gkm00jko7014ajnmg2a
cmrlygdys009tlq01weylhxnh	cmr0e8q3k009bmg01p00ba0nx	cmr0lf2sz000zpn01vcdbfn1k	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:46:34.42	2026-07-15 10:46:34.42	cmqur0gkm00jko7014ajnmg2a
cmrlygvd4009xlq01b0sfygsn	cmr638xlv00admm01cm77sv03	cmrajji4200kkmm01h02ao1fi	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:46:56.968	2026-07-15 10:46:56.968	cmqur0gkm00jko7014ajnmg2a
cmrlyh30s00a1lq01fm777d4a	cmr638xlv00admm01cm77sv03	cmrajn85l00kqmm01m555nlj3	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:47:06.892	2026-07-15 10:47:06.892	cmqur0gkm00jko7014ajnmg2a
cmrlymsqh00a7lq01ozm0dcjl	cmr638xlv00admm01cm77sv03	cmrlymi6u00a5lq01y2ze2m1j	2026-07-04	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 10:51:33.498	2026-07-15 10:51:33.498	cmqur0gkm00jko7014ajnmg2a
cmrm4175m00adlq01cllk668d	cmrbukuwd0004mn016lbgagog	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:22:43.45	2026-07-15 13:22:43.45	cmp4s6te2005el4011ra2qxrl
cmrm41dg800ahlq01e0j85od8	cmrbumgk4000dmn01h99tqe11	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:22:51.608	2026-07-15 13:22:51.608	cmp4s6te2005el4011ra2qxrl
cmrm41kwt00allq01wt7v0e59	cmqnnz1kg00d8od0103g8czza	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:23:01.278	2026-07-15 13:23:01.278	cmp4s9cxl005gl4018m1wy6wp
cmrm41qwk00aplq019y2ix3d8	cmr1tvvf8001fmm01nvgjy6v9	cmr0lf2rp000lpn018lqbrm9x	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:23:09.044	2026-07-15 13:23:09.044	cmp4sbkj5005il4015b2x78mh
cmrm42hi700atlq01v3x9te40	cmph5kmv300f7p401b8x8jouu	cmr0lf2rs000mpn01i367mfch	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:23:43.52	2026-07-15 13:23:43.52	cmp4s8kui005fl40100a1ew4b
cmrm42p3n00axlq01wfg2yune	cmqf2b42m000vwmtsnd6eu11l	cmr0lf2rs000mpn01i367mfch	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:23:53.364	2026-07-15 13:23:53.364	cmp4sadgq005hl4016z9eqilf
cmrm430hl00b1lq01rl8rxlc2	cmqnjvfwv00clod01smhvf5v7	cmr0lf2rs000mpn01i367mfch	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:24:08.122	2026-07-15 13:24:08.122	cmp4s9cxl005gl4018m1wy6wp
cmrm4342600b5lq01764miarc	cmqrwntpy0016sc0146g80wvq	cmr0lf2rs000mpn01i367mfch	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:24:12.751	2026-07-15 13:24:12.751	cmp4s9cxl005gl4018m1wy6wp
cmrm43bhe00b9lq01xr3om7d0	cmqnjmmn900ceod01dz6unzwp	cmr0lf2rs000mpn01i367mfch	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:24:22.371	2026-07-15 13:24:22.371	cmp4s9cxl005gl4018m1wy6wp
cmrm43k9600bdlq011tov6e98	cmp6n445r003xp4019r22o12e	cmr0lf2rs000mpn01i367mfch	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:24:33.739	2026-07-15 13:24:33.739	cmp4s9cxl005gl4018m1wy6wp
cmrm440b600bhlq0194u6bcw6	cmqno2ywp00dfod01x3mtrdjg	cmr0lf2ru000npn01m8kg1lra	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:24:54.546	2026-07-15 13:24:54.546	cmp4sadgq005hl4016z9eqilf
cmrm446ma00bllq01a0cbj4d3	cmp88f7g90073p401w4uw4pqs	cmr0lf2ru000npn01m8kg1lra	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:25:02.722	2026-07-15 13:25:02.722	cmp4s8kui005fl40100a1ew4b
cmrm44ftw00bplq01es19ozuh	cmqqija83000up901vbrlsocv	cmr0lf2ru000npn01m8kg1lra	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:25:14.661	2026-07-15 13:25:14.661	cmp4s8kui005fl40100a1ew4b
cmrm44l3e00btlq01us6wzmdr	cmqqipr55001fp9010qryqpgy	cmr0lf2ru000npn01m8kg1lra	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:25:21.482	2026-07-15 13:25:21.482	cmp4s8kui005fl40100a1ew4b
cmrm44pq000bxlq01b1g4hthq	cmqqio1g50018p9018hz9fq36	cmr0lf2ru000npn01m8kg1lra	2026-07-07	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:25:27.48	2026-07-15 13:25:27.48	cmp4s8kui005fl40100a1ew4b
cmrm46ga600c1lq01jpujdew4	cmpazudle00byp401oz4zx3e1	cmr0lf2s0000ppn01yy85vtr2	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:26:48.558	2026-07-15 13:26:48.558	cmp4slcpz005ul401m1rpf0qa
cmrm46olp00c5lq01upm2ryrn	cmqf2b3xg0001wmtsjmoqct8a	cmr0lf2s0000ppn01yy85vtr2	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:26:59.342	2026-07-15 13:26:59.342	cmp4skb22005rl4014f0e7wgs
cmrm46t0v00c9lq01383l9d8y	cmrbunzzo000mmn01dkqpill6	cmr0lf2s0000ppn01yy85vtr2	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:27:05.072	2026-07-15 13:27:05.072	cmr0t6kdb000mmm01e58p4sux
cmrm47bko00cdlq01c0kysy0i	cmp9jyb2l009tp4012t706wff	cmr0lf2s3000qpn013kdvbhh8	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:27:29.112	2026-07-15 13:27:29.112	cmp4s8kui005fl40100a1ew4b
cmrm47ruf00chlq01482d96w0	cmp5e2po6007el401m0wr4bxe	cmr0lf2s6000rpn013e5f88dk	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:27:50.2	2026-07-15 13:27:50.2	cmp4s9cxl005gl4018m1wy6wp
cmrm488gn00cllq01ugedjvib	cmrdadhtm001wmn01ebkmguat	cmr0lf2s6000rpn013e5f88dk	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:28:11.735	2026-07-15 13:28:11.735	cmr0t6kdb000mmm01e58p4sux
cmrm49xwm00cvlq01y2l37rwc	cmr91oeqe00dvmm012s7it3wq	cmr0lf2s6000rpn013e5f88dk	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:29:31.366	2026-07-15 13:29:31.366	cmp4s6te2005el4011ra2qxrl
cmrm4an9k00czlq018q3tswzn	cmph5kmv300f7p401b8x8jouu	cmr0lf2sw000ypn01loydepqu	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:30:04.232	2026-07-15 13:30:04.232	cmp4s8kui005fl40100a1ew4b
cmrm4as9l00d3lq017040r45z	cmpmhc40500h9p40180sb0edr	cmr0lf2sw000ypn01loydepqu	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:30:10.713	2026-07-15 13:30:10.713	cmp4sixhw005ol401euqmhrwh
cmrm4azti00d7lq01xdkdfdkm	cmp6mh9mn0033p401xa6v43p7	cmr0lf2sw000ypn01loydepqu	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:30:20.502	2026-07-15 13:30:20.502	cmp4sejni005kl4013ure33mc
cmrm4bkev00dblq014gg52a44	cmrf1sef700lbmn01oewtlk1z	cmr0lf2tk0016pn01axfzptwh	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:30:47.191	2026-07-15 13:30:47.191	cmp4s8kui005fl40100a1ew4b
cmrm4bpdp00dflq01x35l019z	cmpfpx1dd00ekp4015zb7hrup	cmr0lf2tk0016pn01axfzptwh	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:30:53.629	2026-07-15 13:30:53.629	cmp4sbkj5005il4015b2x78mh
cmrm4cf0v00dnlq018dfg5op1	cmp5e2po6007el401m0wr4bxe	cmr0lf2tn0017pn01ho4c6bvd	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:31:26.863	2026-07-15 13:31:26.863	cmp4s9cxl005gl4018m1wy6wp
cmrm4czu700drlq01b9rp88ai	cmqf2b43f0011wmts29fvfire	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:31:53.839	2026-07-15 13:31:53.839	cmp4s8kui005fl40100a1ew4b
cmrm4dmqt00dvlq01oh7tq1zs	cmqnnz1kg00d8od0103g8czza	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:32:23.525	2026-07-15 13:32:23.525	cmp4s9cxl005gl4018m1wy6wp
cmrm4dsed00dzlq01c73h4pfi	cmr54gw0r009omm01n0aos5l6	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:32:30.853	2026-07-15 13:32:30.853	cmp4s8kui005fl40100a1ew4b
cmrm4fijv00e3lq01pdq6mpz9	cmqnlovfk00czod0169336zw1	cmr0lf2u8001dpn01nnmoadgo	2026-07-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:33:51.404	2026-07-15 13:33:51.404	cmp4s8kui005fl40100a1ew4b
cmrm4fu0300e7lq01wyyiic7j	cmpazudle00byp401oz4zx3e1	cmr0lf2uc001epn0189o0lfr4	2026-07-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:34:06.243	2026-07-15 13:34:06.243	cmp4slcpz005ul401m1rpf0qa
cmrm4fye400eblq015blr5nj4	cmp5d9vn5006zl401fo5j5q04	cmr0lf2uc001epn0189o0lfr4	2026-07-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:34:11.932	2026-07-15 13:34:11.932	cmp4slcpz005ul401m1rpf0qa
cmrm4g2jo00eflq017kqariob	cmqw8njse001zmg010hmpycb7	cmr0lf2uc001epn0189o0lfr4	2026-07-11	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:34:17.316	2026-07-15 13:34:17.316	cmr0t6kdb000mmm01e58p4sux
cmrm4gigx00ejlq01rbum2gxi	cmr91dvvk00ddmm01yvoi91dd	cmr0lf2uy001fpn011bm0do45	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:34:37.953	2026-07-15 13:34:37.953	cmr0t6kdb000mmm01e58p4sux
cmrm4gs0d00enlq01wk8p8rwd	cmqf2b405000dwmtsddcf7agj	cmr0lf2uy001fpn011bm0do45	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:34:50.317	2026-07-15 13:34:50.317	cmp4s8kui005fl40100a1ew4b
cmrm4h1ef00erlq01xujd7nsv	cmrf1usfb00lkmn01msecwoo3	cmr0lf2uy001fpn011bm0do45	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:35:02.487	2026-07-15 13:35:02.487	cmp4s6te2005el4011ra2qxrl
cmrm4hdak00evlq0138c6ov9z	cmpazudle00byp401oz4zx3e1	cmr0lf2v3001gpn01e0p9m4hg	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:35:17.9	2026-07-15 13:35:17.9	cmp4slcpz005ul401m1rpf0qa
cmrm4hgxg00ezlq01rqb7fbsy	cmp6mujhf003ip4019yxl5iri	cmr0lf2v3001gpn01e0p9m4hg	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:35:22.612	2026-07-15 13:35:22.612	cmp4sadgq005hl4016z9eqilf
cmrm4hryw00f3lq01o5vt7doj	cmpuxbc7900i9p401d4rkyuom	cmr0lf2v3001gpn01e0p9m4hg	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:35:36.921	2026-07-15 13:35:36.921	cmp4sejni005kl4013ure33mc
cmrm4i4fq00f7lq01vzbzktrn	cmpazudle00byp401oz4zx3e1	cmr0lf2vc001hpn014r2sv0r9	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:35:53.078	2026-07-15 13:35:53.078	cmp4slcpz005ul401m1rpf0qa
cmrm4il8d00fblq01qyedwzk3	cmrdrcgat00kumn0112odkalw	cmr0lf2vc001hpn014r2sv0r9	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:36:14.846	2026-07-15 13:36:14.846	cmp4skb22005rl4014f0e7wgs
cmrm4ir2600fflq01ul00j9t5	cmrbure45000vmn014ppcw3bv	cmr0lf2vc001hpn014r2sv0r9	2026-07-12	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:36:22.399	2026-07-15 13:36:22.399	cmp4sixhw005ol401euqmhrwh
cmrm4knvx00fjlq01wtompf65	cmqw8ec6p0010mg01ce7hdn33	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:37:51.597	2026-07-15 13:37:51.597	cmp4sadgq005hl4016z9eqilf
cmrm54lk500fnlq010sawyh06	cmr1tvvf8001fmm01nvgjy6v9	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:53:21.702	2026-07-15 13:53:21.702	cmp4sbkj5005il4015b2x78mh
cmrm54pl600frlq011nx266to	cmr3dno9x008vmm01yn5zbnx3	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:53:26.923	2026-07-15 13:53:26.923	cmp4s8kui005fl40100a1ew4b
cmrm54v5i00fvlq01hkq1mcsp	cmr6940rg00bemm01s11l95mw	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:53:34.135	2026-07-15 13:53:34.135	cmp4s8kui005fl40100a1ew4b
cmrm5506200fzlq01nzq5v527	cmrdaicj5002nmn01fbw9scjq	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:53:40.634	2026-07-15 13:53:40.634	cmp4s6te2005el4011ra2qxrl
cmrm55d7d00g3lq01alqtxd9f	cmrdagpsz002emn01k4cuyqwh	cmr0lf2sd000upn01jj3jcl8s	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:53:57.53	2026-07-15 13:53:57.53	cmp4s6te2005el4011ra2qxrl
cmrm55sc000g7lq01qpil5c6n	cmp6mxgtj003np401n6d3md2o	cmr0lf2sg000vpn013xbcr6q5	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:54:17.137	2026-07-15 13:54:17.137	cmp4skb22005rl4014f0e7wgs
cmrm55z8t00gblq01vbjf3yex	cmqno5z2j00dlod0156ophlux	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:54:26.094	2026-07-15 13:54:26.094	cmp4s9cxl005gl4018m1wy6wp
cmrm5646h00gflq01vd3nmt74	cmpuxgfvo00iep401kuin241v	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:54:32.489	2026-07-15 13:54:32.489	cmp4s8kui005fl40100a1ew4b
cmrm56b8600gjlq012o4no8b2	cmpxtdnho00jxp401mtude4xv	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:54:41.622	2026-07-15 13:54:41.622	cmp4s9cxl005gl4018m1wy6wp
cmrm56gcb00gnlq01vtohk2xx	cmpqvd4pp00hkp401fok0cwt8	cmr0lf2sk000wpn01pjqlqu42	2026-07-08	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:54:48.251	2026-07-15 13:54:48.251	cmp4sadgq005hl4016z9eqilf
cmrm57dp800grlq01m8ucpsae	cmqnjhe4500c7od01xunmmhyz	cmr0lf2t30010pn01bwtey846	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:55:31.485	2026-07-15 13:55:31.485	cmp4s8kui005fl40100a1ew4b
cmrm57i7y00gvlq01dr9b48wx	cmp5d9vn5006zl401fo5j5q04	cmr0lf2t30010pn01bwtey846	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:55:37.343	2026-07-15 13:55:37.343	cmp4slcpz005ul401m1rpf0qa
cmrm57mnz00gzlq013q2waw8c	cmqqifegn000gp901x4b3a61j	cmr0lf2t30010pn01bwtey846	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:55:43.104	2026-07-15 13:55:43.104	cmp4sixhw005ol401euqmhrwh
cmrm590a700h3lq01rllr7ng4	cmpya6nur00kgp401et6xel9m	cmr0lf2t30010pn01bwtey846	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:56:47.407	2026-07-15 13:56:47.407	cmp4s8kui005fl40100a1ew4b
cmrm594gt00h7lq01d7wdg8x5	cmp87ym20006yp401590xadl0	cmr0lf2t30010pn01bwtey846	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:56:52.829	2026-07-15 13:56:52.829	cmp4sadgq005hl4016z9eqilf
cmrm59kj700hblq01estwv366	cmrdrcgat00kumn0112odkalw	cmr0lf2t70011pn017e89jceq	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:57:13.651	2026-07-15 13:57:13.651	cmp4skb22005rl4014f0e7wgs
cmrm59or900hflq01iqva600r	cmr91dvvk00ddmm01yvoi91dd	cmr0lf2t70011pn017e89jceq	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:57:19.126	2026-07-15 13:57:19.126	cmr0t6kdb000mmm01e58p4sux
cmrm59ylz00hjlq01u51zn0ev	cmpi6ban400fip401ppm9o7wy	cmr0lf2t70011pn017e89jceq	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:57:31.895	2026-07-15 13:57:31.895	cmp4sixhw005ol401euqmhrwh
cmrm5abxr00hnlq01d17i109m	cmp80zids006np4015qmgm2k4	cmr0lf2t90012pn01klwvko87	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:57:49.167	2026-07-15 13:57:49.167	cmp4s8kui005fl40100a1ew4b
cmrm5ahua00hrlq01mkd4r0mq	cmpuxlbuw00ijp4016pmesm29	cmr0lf2t90012pn01klwvko87	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:57:56.818	2026-07-15 13:57:56.818	cmp4s8kui005fl40100a1ew4b
cmrm5amng00hvlq018omyjltg	cmp6mujhf003ip4019yxl5iri	cmr0lf2t90012pn01klwvko87	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:58:03.052	2026-07-15 13:58:03.052	cmp4scs0q005jl401azkonj0y
cmrm5atub00hzlq01lm95exum	cmp9pbn9j00b7p401wd3w8sn0	cmr0lf2t90012pn01klwvko87	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:58:12.372	2026-07-15 13:58:12.372	cmp4s8kui005fl40100a1ew4b
cmrm5b0b900i3lq015zr4fyn5	cmp9p95jj00b2p401dqlrtohp	cmr0lf2t90012pn01klwvko87	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:58:20.757	2026-07-15 13:58:20.757	cmp4s8kui005fl40100a1ew4b
cmrm5b6r600i7lq015kk4sasp	cmpwo5qcf00jgp401y23i6i2r	cmr0lf2t90012pn01klwvko87	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:58:29.107	2026-07-15 13:58:29.107	cmp4sadgq005hl4016z9eqilf
cmrm5bzb500iblq01ujhd6lsr	cmp5qutpd0015p401e0b83fu9	cmrajtzh400kumm01ohn7wbor	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:59:06.113	2026-07-15 13:59:06.113	cmp4sadgq005hl4016z9eqilf
cmrm5c2dd00iflq01dvefz7ii	cmp5qzr8e001ap401fa4uuzw4	cmrajtzh400kumm01ohn7wbor	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:59:10.082	2026-07-15 13:59:10.082	cmp4sadgq005hl4016z9eqilf
cmrm5cqq700ijlq01c98s4t7z	cmqf2b3z80007wmtsodeuow25	cmr0lf2tr0018pn01qs0gu3me	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:59:41.647	2026-07-15 13:59:41.647	cmp4t5amk005zl4014v76r8bk
cmrm5cur800inlq015bf4rc3d	cmrdadhtm001wmn01ebkmguat	cmr0lf2tr0018pn01qs0gu3me	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:59:46.868	2026-07-15 13:59:46.868	cmr0t6kdb000mmm01e58p4sux
cmrm5d4r200irlq01dq1zpfdq	cmqf2b42m000vwmtsnd6eu11l	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 13:59:59.822	2026-07-15 13:59:59.822	cmp4sadgq005hl4016z9eqilf
cmrm5d97a00ivlq01yr577y13	cmpuxyh5x00itp401pqas19s7	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:00:05.59	2026-07-15 14:00:05.59	cmp4sadgq005hl4016z9eqilf
cmrm5dffx00izlq01lnb7zlku	cmqqihcm6000np901ub12rzon	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:00:13.677	2026-07-15 14:00:13.677	cmp4s9cxl005gl4018m1wy6wp
cmrm5djyb00j3lq01uaf9oz7g	cmp6vndph004yp401vluusox7	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:00:19.523	2026-07-15 14:00:19.523	cmp4s8kui005fl40100a1ew4b
cmrm5dso700j7lq01j5pfh7az	cmp6maci6002tp40119cnxlu3	cmr0lf2tu0019pn01zy6xx5ro	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:00:30.824	2026-07-15 14:00:30.824	cmp4sadgq005hl4016z9eqilf
cmrm5jsp400jblq01rmerka9u	cmqnjvfwv00clod01smhvf5v7	cmr0lf2tx001apn01dj916ttz	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:05:10.792	2026-07-15 14:05:10.792	cmp4s9cxl005gl4018m1wy6wp
cmrm5k03b00jflq015emxkaq9	cmqnjmmn900ceod01dz6unzwp	cmr0lf2tx001apn01dj916ttz	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:05:20.375	2026-07-15 14:05:20.375	cmp4s9cxl005gl4018m1wy6wp
cmrm5k3k300jjlq01hvi5wz5n	cmqrwntpy0016sc0146g80wvq	cmr0lf2tx001apn01dj916ttz	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:05:24.867	2026-07-15 14:05:24.867	cmp4s9cxl005gl4018m1wy6wp
cmrm5k9v700jnlq01jg4dh4eu	cmqno2ywp00dfod01x3mtrdjg	cmr0lf2tx001apn01dj916ttz	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:05:33.044	2026-07-15 14:05:33.044	cmp4sadgq005hl4016z9eqilf
cmrm5ke8q00jrlq012fsjxf4l	cmr3dc13z008mmm01r1xcp8qr	cmr0lf2tx001apn01dj916ttz	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:05:38.714	2026-07-15 14:05:38.714	cmp4s8kui005fl40100a1ew4b
cmrm5l02l00jvlq012bxa0lff	cmr54gw0r009omm01n0aos5l6	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:06:07.005	2026-07-15 14:06:07.005	cmp4s8kui005fl40100a1ew4b
cmrm5l4pl00jzlq017py7mmtf	cmqw8ec6p0010mg01ce7hdn33	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:06:13.018	2026-07-15 14:06:13.018	cmp4sadgq005hl4016z9eqilf
cmrm5l9qy00k3lq01c8kjsh4z	cmrbunzzo000mmn01dkqpill6	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:06:19.546	2026-07-15 14:06:19.546	cmr0t6kdb000mmm01e58p4sux
cmrm5lf2600k7lq012vo5wpsq	cmrbure45000vmn014ppcw3bv	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:06:26.431	2026-07-15 14:06:26.431	cmp4sixhw005ol401euqmhrwh
cmrm5lkyc00kblq01zwi22vwq	cmraefj5300hzmm01gbupayou	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:06:34.069	2026-07-15 14:06:34.069	cmp4s9cxl005gl4018m1wy6wp
cmrm5lqpk00kflq01gkxbmwcb	cmrfb3yin00m7mn01e62jdrb9	cmr0lf2u0001bpn01lh3x4bs9	2026-07-10	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-15 14:06:41.528	2026-07-15 14:06:41.528	cmp4s6te2005el4011ra2qxrl
cmrnmq8ek00l4lq01h9goze2u	cmpazudle00byp401oz4zx3e1	cmr0lf2t30010pn01bwtey846	2026-07-09	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-16 14:53:50.732	2026-07-16 14:53:50.732	cmp4slcpz005ul401m1rpf0qa
cmrub5zkc00oclq01g9b6gyst	cmpazudle00byp401oz4zx3e1	cmr908w0l00cfmm01va8fjdr1	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:04:33.612	2026-07-21 07:04:33.612	cmp4slcpz005ul401m1rpf0qa
cmrub66le00oglq01p47cc4wa	cmp5d9vn5006zl401fo5j5q04	cmr908w0l00cfmm01va8fjdr1	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:04:42.723	2026-07-21 07:04:42.723	cmp4slcpz005ul401m1rpf0qa
cmrub9apu00oklq01lffoc6gm	cmrdak4v0002wmn01j2my021k	cmr908w0q00chmm01rfd4xxra	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:07:08.034	2026-07-21 07:07:08.034	cmp4sixhw005ol401euqmhrwh
cmrubved800oolq01y4v3a7l5	cmrdalmpn0035mn01esii22rz	cmr908w0q00chmm01rfd4xxra	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:24:19.197	2026-07-21 07:24:19.197	cmp4sixhw005ol401euqmhrwh
cmrubvywl00oslq01rdksetr5	cmr0e8q3k009bmg01p00ba0nx	cmr908w0t00cimm01dqefnx05	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:24:45.813	2026-07-21 07:24:45.813	cmqur0gkm00jko7014ajnmg2a
cmrubx86f00owlq017d927pzi	cmqno2ywp00dfod01x3mtrdjg	cmr908w0v00cjmm01zqnivmco	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:25:44.488	2026-07-21 07:25:44.488	cmp4sadgq005hl4016z9eqilf
cmrubxfgg00p0lq01okyh2qvh	cmqf2b3xg0001wmtsjmoqct8a	cmr908w0v00cjmm01zqnivmco	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:25:53.921	2026-07-21 07:25:53.921	cmp4skb22005rl4014f0e7wgs
cmrubxmn200p4lq01pn1uxgwa	cmps12dpz00hvp401tesxyqev	cmr908w0v00cjmm01zqnivmco	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:26:03.231	2026-07-21 07:26:03.231	cmp4sbkj5005il4015b2x78mh
cmruby7qc00p8lq01wekt0dd2	cmrbunzzo000mmn01dkqpill6	cmr908w0y00ckmm011t7a402x	2026-07-13	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:26:30.565	2026-07-21 07:26:30.565	cmr0t6kdb000mmm01e58p4sux
cmruc59lq00pclq01iowkyn28	cmpazudle00byp401oz4zx3e1	cmr908w1500cnmm011dy7ckbg	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:31:59.582	2026-07-21 07:31:59.582	cmp4slcpz005ul401m1rpf0qa
cmruc62u600pglq01fxp2mgt6	cmp8b0p5m0078p401ko5fipst	cmr908w1a00cpmm01ih7e2u1j	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:32:37.47	2026-07-21 07:32:37.47	cmp4sixhw005ol401euqmhrwh
cmruc6ch300pklq01pul5kimo	cmqqifegn000gp901x4b3a61j	cmr908w1a00cpmm01ih7e2u1j	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:32:49.959	2026-07-21 07:32:49.959	cmp4sixhw005ol401euqmhrwh
cmruc7vt700polq0122imxwt4	cmqnnz1kg00d8od0103g8czza	cmr908w1d00cqmm015uw0f0fs	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:34:01.676	2026-07-21 07:34:01.676	cmp4s9cxl005gl4018m1wy6wp
cmruc8dnc00pslq01l0pwc5me	cmqf2b42m000vwmtsnd6eu11l	cmr908w1g00crmm01psu6zflu	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:34:24.793	2026-07-21 07:34:24.793	cmp4sadgq005hl4016z9eqilf
cmruc8j0700pwlq01nzxel0xq	cmpfpx1dd00ekp4015zb7hrup	cmr908w1g00crmm01psu6zflu	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:34:31.735	2026-07-21 07:34:31.735	cmp4sbkj5005il4015b2x78mh
cmruc92xv00q0lq018tzz0rz1	cmpuxgfvo00iep401kuin241v	cmr908w1j00csmm01mge40q7b	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:34:57.571	2026-07-21 07:34:57.571	cmp4s8kui005fl40100a1ew4b
cmruc993l00q4lq0104b4jfun	cmqw8ec6p0010mg01ce7hdn33	cmr908w1j00csmm01mge40q7b	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:35:05.553	2026-07-21 07:35:05.553	cmp4sadgq005hl4016z9eqilf
cmruc9ll900q8lq01bmrgxceq	cmqnjvfwv00clod01smhvf5v7	cmr908w1j00csmm01mge40q7b	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:35:21.741	2026-07-21 07:35:21.741	cmp4s9cxl005gl4018m1wy6wp
cmruc9vre00qclq010rz2doom	cmqnjmmn900ceod01dz6unzwp	cmr908w1j00csmm01mge40q7b	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:35:34.922	2026-07-21 07:35:34.922	cmp4s9cxl005gl4018m1wy6wp
cmruca8nl00qglq01558595ne	cmqrwntpy0016sc0146g80wvq	cmr908w1j00csmm01mge40q7b	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:35:51.633	2026-07-21 07:35:51.633	cmp4s9cxl005gl4018m1wy6wp
cmrucagpu00qklq014bxh3302	cmqnlllpk00csod01wkefk1ot	cmr908w1j00csmm01mge40q7b	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:36:02.082	2026-07-21 07:36:02.082	cmp4s8kui005fl40100a1ew4b
cmrucb9jf00qolq010gf7iklm	cmp5qutpd0015p401e0b83fu9	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:36:39.435	2026-07-21 07:36:39.435	cmp4sadgq005hl4016z9eqilf
cmrucbdkt00qslq01fpvbf7ch	cmp5qzr8e001ap401fa4uuzw4	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:36:44.669	2026-07-21 07:36:44.669	cmp4sadgq005hl4016z9eqilf
cmrucck9b00qwlq01palu0vj1	cmrbwaec5001dmn01can4i9wf	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:37:39.983	2026-07-21 07:37:39.983	cmp4s8kui005fl40100a1ew4b
cmruccsam00r0lq01a154279i	cmrbw6y2c0014mn01a6ii4tiu	cmrkiw4lc000tlq010dy0t6kq	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:37:50.399	2026-07-21 07:37:50.399	cmp4s8kui005fl40100a1ew4b
cmrucesx500r4lq01mvt245co	cmpazudle00byp401oz4zx3e1	cmr908w1o00cumm014gw9e9a3	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:39:24.521	2026-07-21 07:39:24.521	cmp4slcpz005ul401m1rpf0qa
cmrucf0nr00r8lq014raoyqpb	cmp8b0p5m0078p401ko5fipst	cmr908w1o00cumm014gw9e9a3	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:39:34.551	2026-07-21 07:39:34.551	cmp4sixhw005ol401euqmhrwh
cmrucgcj600rclq01l8970ikt	cmqf2b41m000pwmtsgzlybd2p	cmr908w2100czmm01ysvy2ut0	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:40:36.595	2026-07-21 07:40:36.595	cmp4s8kui005fl40100a1ew4b
cmruch33900rglq01ptotb06r	cmqf2b40z000jwmtsglaha6m4	cmr908w2100czmm01ysvy2ut0	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:41:11.013	2026-07-21 07:41:11.013	cmp4s8kui005fl40100a1ew4b
cmruchgfw00rklq01s0b41tc2	cmrbunzzo000mmn01dkqpill6	cmr908w2100czmm01ysvy2ut0	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:41:28.316	2026-07-21 07:41:28.316	cmr0t6kdb000mmm01e58p4sux
cmrucht0400rolq019trcdu3v	cmrkjma2h0010lq01o3ge2qc3	cmr908w2100czmm01ysvy2ut0	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:41:44.596	2026-07-21 07:41:44.596	cmp4s8kui005fl40100a1ew4b
cmruci2qp00rslq01fryju912	cmph5kmv300f7p401b8x8jouu	cmr908w2100czmm01ysvy2ut0	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:41:57.217	2026-07-21 07:41:57.217	cmp4s8kui005fl40100a1ew4b
cmrucirud00rwlq01kdjvbyi3	cmqw8ec6p0010mg01ce7hdn33	cmr908w2400d0mm01op9pxsuj	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:42:29.749	2026-07-21 07:42:29.749	cmp4sadgq005hl4016z9eqilf
cmrucizoo00s0lq01bu43hyvg	cmp6mxgtj003np401n6d3md2o	cmr908w2400d0mm01op9pxsuj	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:42:39.912	2026-07-21 07:42:39.912	cmp4skb22005rl4014f0e7wgs
cmrucp10z00s4lq016afaq1h3	cmr0e8q3k009bmg01p00ba0nx	cmr908vy500btmm011t64awvd	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:47:21.588	2026-07-21 07:47:21.588	cmqur0gkm00jko7014ajnmg2a
cmrucr13d00s8lq01t1i7bnr2	cmpb26l0900ccp4014tau0gjw	cmr908vy900bumm01pqov4lss	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:48:54.986	2026-07-21 07:48:54.986	cmp4sadgq005hl4016z9eqilf
cmrucr7qf00sclq018ja8nh6j	cmpazudle00byp401oz4zx3e1	cmr908vy900bumm01pqov4lss	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:49:03.592	2026-07-21 07:49:03.592	cmp4slcpz005ul401m1rpf0qa
cmrucrea900sglq0161uxvmgr	cmp5d9vn5006zl401fo5j5q04	cmr908vy900bumm01pqov4lss	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:49:12.082	2026-07-21 07:49:12.082	cmp4slcpz005ul401m1rpf0qa
cmrucrk2000sklq019jqlodms	cmpya6nur00kgp401et6xel9m	cmr908vy900bumm01pqov4lss	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:49:19.561	2026-07-21 07:49:19.561	cmp4s8kui005fl40100a1ew4b
cmrucrszd00solq01ld1nrz16	cmqnjhe4500c7od01xunmmhyz	cmr908vy900bumm01pqov4lss	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:49:31.129	2026-07-21 07:49:31.129	cmp4s9cxl005gl4018m1wy6wp
cmrucryil00sslq01yarm9yuz	cmrnrrjxa00lblq014meynmha	cmr908vy900bumm01pqov4lss	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:49:38.302	2026-07-21 07:49:38.302	cmp4s8kui005fl40100a1ew4b
cmrucsn8r00swlq010ygb710e	cmrbunzzo000mmn01dkqpill6	cmr908vyc00bvmm0116gg4fvm	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:50:10.348	2026-07-21 07:50:10.348	cmr0t6kdb000mmm01e58p4sux
cmruct89j00t0lq01w55z36ks	cmrbure45000vmn014ppcw3bv	cmr908vyc00bvmm0116gg4fvm	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:50:37.592	2026-07-21 07:50:37.592	cmp4sixhw005ol401euqmhrwh
cmructls800t4lq01gob7s0me	cmqf2b3z80007wmtsodeuow25	cmr908vyc00bvmm0116gg4fvm	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:50:55.113	2026-07-21 07:50:55.113	cmp4t5amk005zl4014v76r8bk
cmructsz700t8lq01r6tpi6zy	cmp6mxgtj003np401n6d3md2o	cmr908vyc00bvmm0116gg4fvm	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:51:04.435	2026-07-21 07:51:04.435	cmp4skb22005rl4014f0e7wgs
cmrucu1id00tclq019mqj0ql6	cmr91dvvk00ddmm01yvoi91dd	cmr908vyc00bvmm0116gg4fvm	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:51:15.493	2026-07-21 07:51:15.493	cmr0t6kdb000mmm01e58p4sux
cmrucupof00tglq012mwso46p	cmp9p95jj00b2p401dqlrtohp	cmr908vyh00bwmm01ujirtt96	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:51:46.815	2026-07-21 07:51:46.815	cmp4s8kui005fl40100a1ew4b
cmrucuw2k00tklq01sv7dlwfc	cmp9pbn9j00b7p401wd3w8sn0	cmr908vyh00bwmm01ujirtt96	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:51:55.1	2026-07-21 07:51:55.1	cmp4s8kui005fl40100a1ew4b
cmrucv4ub00tolq01uerzprbt	cmpwo5qcf00jgp401y23i6i2r	cmr908vyh00bwmm01ujirtt96	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:52:06.467	2026-07-21 07:52:06.467	cmp4sadgq005hl4016z9eqilf
cmrucvben00tslq01gyezb7j2	cmp6mujhf003ip4019yxl5iri	cmr908vyh00bwmm01ujirtt96	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:52:14.975	2026-07-21 07:52:14.975	cmp4scs0q005jl401azkonj0y
cmrucvhyp00twlq01hdakh8k9	cmr3dno9x008vmm01yn5zbnx3	cmr908vyh00bwmm01ujirtt96	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:52:23.473	2026-07-21 07:52:23.473	cmp4s8kui005fl40100a1ew4b
cmrucvt0t00u0lq01wzt7gvgr	cmpuxlbuw00ijp4016pmesm29	cmr908vyh00bwmm01ujirtt96	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:52:37.805	2026-07-21 07:52:37.805	cmp4s8kui005fl40100a1ew4b
cmrucytcz00u4lq01oehk61fy	cmp9l6t2c00acp4018v82zolp	cmr908vz200c0mm01wyn8lpeo	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:54:58.211	2026-07-21 07:54:58.211	cmp4s9cxl005gl4018m1wy6wp
cmrucyzfn00u8lq01nurkekoh	cmqnlovfk00czod0169336zw1	cmr908vz200c0mm01wyn8lpeo	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:55:06.083	2026-07-21 07:55:06.083	cmp4s8kui005fl40100a1ew4b
cmrud1q4h00uclq01pi7wdfmf	cmrdadhtm001wmn01ebkmguat	cmr908vz600c1mm01l0z41ey8	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 07:57:13.986	2026-07-21 07:57:13.986	cmr0t6kdb000mmm01e58p4sux
cmrud5kv700uolq01imuvx2aw	cmrdalmpn0035mn01esii22rz	cmr908vz900c2mm01mn2vtqqd	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:00:13.795	2026-07-21 08:00:13.795	cmp4sixhw005ol401euqmhrwh
cmrud5s2w00uslq01936vavc4	cmrdak4v0002wmn01j2my021k	cmr908vz900c2mm01mn2vtqqd	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:00:23.144	2026-07-21 08:00:23.144	cmp4sixhw005ol401euqmhrwh
cmrud659k00uwlq012eizp176	cmqnjvfwv00clod01smhvf5v7	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:00:40.232	2026-07-21 08:00:40.232	cmp4s9cxl005gl4018m1wy6wp
cmrud6nex00v0lq0157tmngo6	cmqnjmmn900ceod01dz6unzwp	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:01:03.754	2026-07-21 08:01:03.754	cmp4s9cxl005gl4018m1wy6wp
cmrud6wgb00v4lq012y3evjl5	cmqrwntpy0016sc0146g80wvq	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:01:15.467	2026-07-21 08:01:15.467	cmp4s9cxl005gl4018m1wy6wp
cmrud72r900v8lq01k5gj3rt8	cmr1tvvf8001fmm01nvgjy6v9	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:01:23.637	2026-07-21 08:01:23.637	cmp4sbkj5005il4015b2x78mh
cmrud7ach00vclq01tr8so9wo	cmqqihcm6000np901ub12rzon	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:01:33.474	2026-07-21 08:01:33.474	cmp4s9cxl005gl4018m1wy6wp
cmrud7yqz00vglq01lu1k8ln2	cmr66zk2400b3mm01nzav5tty	cmr908vzc00c3mm01yvcfqr8h	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:02:05.1	2026-07-21 08:02:05.1	cmp4s8kui005fl40100a1ew4b
cmrudxmwb00vklq01yrklsjgx	cmqf2b42m000vwmtsnd6eu11l	cmr908vze00c4mm01ubuybd8c	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:22:02.795	2026-07-21 08:22:02.795	cmp4sadgq005hl4016z9eqilf
cmrudxrgr00volq01i8c2syvz	cmqno2ywp00dfod01x3mtrdjg	cmr908vze00c4mm01ubuybd8c	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:22:08.715	2026-07-21 08:22:08.715	cmp4sadgq005hl4016z9eqilf
cmrudxvfx00vslq01tst3454b	cmpuxgfvo00iep401kuin241v	cmr908vze00c4mm01ubuybd8c	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:22:13.869	2026-07-21 08:22:13.869	cmp4s8kui005fl40100a1ew4b
cmrudy6wv00vwlq01wnzxusni	cmqw8ec6p0010mg01ce7hdn33	cmr908vze00c4mm01ubuybd8c	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:22:28.736	2026-07-21 08:22:28.736	cmp4sadgq005hl4016z9eqilf
cmrudz3wf00w0lq01vm6swi64	cmp6maci6002tp40119cnxlu3	cmr908vze00c4mm01ubuybd8c	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:23:11.488	2026-07-21 08:23:11.488	cmp4sadgq005hl4016z9eqilf
cmrudzvz100w4lq012up5a4v9	cmrdrcgat00kumn0112odkalw	cmr908vzh00c5mm01jirbu4v2	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:23:47.869	2026-07-21 08:23:47.869	cmp4skb22005rl4014f0e7wgs
cmrue021300w8lq01rsuwbxdd	cmqqija83000up901vbrlsocv	cmr908vzh00c5mm01jirbu4v2	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:23:55.719	2026-07-21 08:23:55.719	cmp4s8kui005fl40100a1ew4b
cmrue0aln00wclq0100oolldu	cmqqipr55001fp9010qryqpgy	cmr908vzh00c5mm01jirbu4v2	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:24:06.828	2026-07-21 08:24:06.828	cmp4s8kui005fl40100a1ew4b
cmrue0hre00wglq01cr906ee4	cmqqio1g50018p9018hz9fq36	cmr908vzh00c5mm01jirbu4v2	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:24:16.107	2026-07-21 08:24:16.107	cmp4s8kui005fl40100a1ew4b
cmrue0p1200wklq01orn1kt3u	cmp5qzr8e001ap401fa4uuzw4	cmr908vzh00c5mm01jirbu4v2	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:24:25.527	2026-07-21 08:24:25.527	cmp4sadgq005hl4016z9eqilf
cmrue0snx00wolq0191hhao70	cmp5qutpd0015p401e0b83fu9	cmr908vzh00c5mm01jirbu4v2	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:24:30.237	2026-07-21 08:24:30.237	cmp4sadgq005hl4016z9eqilf
cmrue1rjb00wslq01vmv8mcte	cmqnlllpk00csod01wkefk1ot	cmr908vzv00c8mm01xqo4398r	2026-07-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:25:15.432	2026-07-21 08:25:15.432	cmp4s8kui005fl40100a1ew4b
cmrue1wrg00wwlq01uhjdsauw	cmp71pbmj005ip401rxsl0n27	cmr908vzv00c8mm01xqo4398r	2026-07-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:25:22.205	2026-07-21 08:25:22.205	cmp4sadgq005hl4016z9eqilf
cmrue22ny00x0lq010wm20uss	cmp5d9vn5006zl401fo5j5q04	cmr908vzv00c8mm01xqo4398r	2026-07-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:25:29.855	2026-07-21 08:25:29.855	cmp4slcpz005ul401m1rpf0qa
cmrue2y0z00x4lq01mkqu8wma	cmrf1sef700lbmn01oewtlk1z	cmr908vzv00c8mm01xqo4398r	2026-07-18	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:26:10.499	2026-07-21 08:26:10.499	cmp4s8kui005fl40100a1ew4b
cmrue4k0s00x8lq01t1dv6736	cmqf2b41m000pwmtsgzlybd2p	cmr908w0000c9mm01mtivvn2w	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:27:25.661	2026-07-21 08:27:25.661	cmp4s8kui005fl40100a1ew4b
cmrue4x7p00xclq01038xxae8	cmqf2b40z000jwmtsglaha6m4	cmr908w0000c9mm01mtivvn2w	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:27:42.757	2026-07-21 08:27:42.757	cmp4s8kui005fl40100a1ew4b
cmrue5xsw00xglq01r82i8z0c	cmrri21yv00m2lq01gugwiiyq	cmr908w0000c9mm01mtivvn2w	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:28:30.177	2026-07-21 08:28:30.177	cmp4s6te2005el4011ra2qxrl
cmrue66jr00xklq01u7tzjb0f	cmr91dvvk00ddmm01yvoi91dd	cmr908w0000c9mm01mtivvn2w	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:28:41.511	2026-07-21 08:28:41.511	cmr0t6kdb000mmm01e58p4sux
cmrue6yxq00xolq01iusw3sqf	cmp6mujhf003ip4019yxl5iri	cmr908w0500camm01ugf8l6df	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:29:18.302	2026-07-21 08:29:18.302	cmp4scs0q005jl401azkonj0y
cmrue745000xslq0146haxa0e	cmpazudle00byp401oz4zx3e1	cmr908w0500camm01ugf8l6df	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:29:25.044	2026-07-21 08:29:25.044	cmp4slcpz005ul401m1rpf0qa
cmrue7mjt00xwlq01afy35l40	cmrdadhtm001wmn01ebkmguat	cmr908w0a00cbmm01mcln1o2j	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:29:48.905	2026-07-21 08:29:48.905	cmr0t6kdb000mmm01e58p4sux
cmrue7rui00y0lq01w0c25023	cmpazudle00byp401oz4zx3e1	cmr908w0a00cbmm01mcln1o2j	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:29:55.77	2026-07-21 08:29:55.77	cmp4slcpz005ul401m1rpf0qa
cmrue8oms00y4lq01stx4jgqy	cmqf2b3xg0001wmtsjmoqct8a	cmr908w0a00cbmm01mcln1o2j	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:30:38.261	2026-07-21 08:30:38.261	cmp4skb22005rl4014f0e7wgs
cmruedzm200yalq013x03donj	cmpi6ban400fip401ppm9o7wy	cmruedfem00y8lq01ymu9agj8	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:34:45.77	2026-07-21 08:34:45.77	cmp4sixhw005ol401euqmhrwh
cmruf2ivm00yplq01tyalwcfn	cmpuxbc7900i9p401d4rkyuom	cmr908w2400d0mm01op9pxsuj	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:53:50.482	2026-07-21 08:53:50.482	cmp4sejni005kl4013ure33mc
cmruf3kip00ytlq01tgyhahki	cmpuxbc7900i9p401d4rkyuom	cmr908vze00c4mm01ubuybd8c	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:54:39.266	2026-07-21 08:54:39.266	cmp4sejni005kl4013ure33mc
cmruf748700yxlq01dgxbxn32	cmp6ywfdb0055p401dvfsqap4	cmr908vz600c1mm01l0z41ey8	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 08:57:24.775	2026-07-21 08:57:24.775	cmp4scs0q005jl401azkonj0y
cmrum9xnn00zflq01ykzn3h0c	cmqur46xc00jno701ceuxfoxy	cmqrxn8zz0013o701zzhu0cgw	2026-06-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 12:15:33.539	2026-07-21 12:15:33.539	cmqur0gkm00jko7014ajnmg2a
cmrumbjfu00zjlq01odwu9ozy	cmqur46xc00jno701ceuxfoxy	cmqsacn6b00gxo70150y9si1o	2026-06-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 12:16:48.426	2026-07-21 12:16:48.426	cmqur0gkm00jko7014ajnmg2a
cmrumc8g000znlq017kpznywd	cmqur46xc00jno701ceuxfoxy	cmqzaux6n003pmg01nyaurvwj	2026-06-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 12:17:20.833	2026-07-21 12:17:20.833	cmqur0gkm00jko7014ajnmg2a
cmrumddqe00zrlq017nh12cly	cmqur46xc00jno701ceuxfoxy	cmqzbb1ri004jmg016sdmj53b	2026-07-01	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 12:18:14.342	2026-07-21 12:18:14.342	cmqur0gkm00jko7014ajnmg2a
cmrume00p00zvlq018e5wr418	cmqur46xc00jno701ceuxfoxy	cmqzbqwev005hmg01ijekhjxx	2026-07-03	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 12:18:43.225	2026-07-21 12:18:43.225	cmqur0gkm00jko7014ajnmg2a
cmruv1ome0007o9013omse7fm	cmrdak4v0002wmn01j2my021k	cmrix5g6e00o2mn018y4e1pf0	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 16:21:05.126	2026-07-21 16:21:05.126	cmp4sixhw005ol401euqmhrwh
cmruv1zee000bo9018qb5npzs	cmrdalmpn0035mn01esii22rz	cmrix5g6e00o2mn018y4e1pf0	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 16:21:19.095	2026-07-21 16:21:19.095	cmp4sixhw005ol401euqmhrwh
cmruv2jmx000fo901ecwsyncu	cmr0e8q3k009bmg01p00ba0nx	cmrix5g6g00o3mn01hdoi98nv	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 16:21:45.322	2026-07-21 16:21:45.322	cmqur0gkm00jko7014ajnmg2a
cmrwdhqxd000in301fearthmh	cmqur46xc00jno701ceuxfoxy	cmrix5g5700nqmn0194rr3fv0	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-22 17:45:13.874	2026-07-22 17:45:13.874	cmqur0gkm00jko7014ajnmg2a
cmrxi7s0v002en301g5m6213f	cmqw8ec6p0010mg01ce7hdn33	cmrix5g5100nomn010vza0qy5	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:45:12.991	2026-07-23 12:45:12.991	cmp4sadgq005hl4016z9eqilf
cmrxi8cen002in301xmnwebg7	cmps12dpz00hvp401tesxyqev	cmrix5g5100nomn010vza0qy5	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:45:39.407	2026-07-23 12:45:39.407	cmp4sbkj5005il4015b2x78mh
cmrxi94xj002mn301ur2t9srx	cmraefj5300hzmm01gbupayou	cmrix5g5400npmn01vxhayl3g	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:46:16.376	2026-07-23 12:46:16.376	cmp4s9cxl005gl4018m1wy6wp
cmrxi9ibj002qn3012bgk339a	cmr54gw0r009omm01n0aos5l6	cmrix5g5400npmn01vxhayl3g	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:46:33.727	2026-07-23 12:46:33.727	cmp4s8kui005fl40100a1ew4b
cmrxia45b002un3015xi2frei	cmruxkruh000ro901qcd982u7	cmrix5g5400npmn01vxhayl3g	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:47:02.016	2026-07-23 12:47:02.016	cmp4sixhw005ol401euqmhrwh
cmrxiac7o002yn301iabora0k	cmruxoqq5000zo901ix6vukw5	cmrix5g5400npmn01vxhayl3g	2026-07-20	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:47:12.468	2026-07-23 12:47:12.468	cmr0t6kdb000mmm01e58p4sux
cmrxie5ih0032n301lqsbj5fi	cmpb26l0900ccp4014tau0gjw	cmrix5g5f00nsmn01ngqh0zx6	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:50:10.41	2026-07-23 12:50:10.41	cmp4sadgq005hl4016z9eqilf
cmrxiehay0036n301pi2opv8k	cmp6me3mt002yp401esc9ykn5	cmrix5g5f00nsmn01ngqh0zx6	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:50:25.69	2026-07-23 12:50:25.69	cmp4sadgq005hl4016z9eqilf
cmrumu1i30101lq01ba6acw1q	cmqnnz1kg00d8od0103g8czza	cmrix5g5p00nvmn013lr7rusv	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-21 12:31:11.643	2026-07-23 12:51:47.905	cmp4s9cxl005gl4018m1wy6wp
cmrxik69w003fn301sy7yg2fg	cmp5d9vn5006zl401fo5j5q04	cmrxijj23003cn301zy341lim	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:54:51.332	2026-07-23 12:54:51.332	cmp4slcpz005ul401m1rpf0qa
cmrxil2dg003jn3016ssp5nn2	cmqno2ywp00dfod01x3mtrdjg	cmrix5g5s00nwmn014zjhvdkz	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:55:32.932	2026-07-23 12:55:32.932	cmp4sadgq005hl4016z9eqilf
cmrximl0c003nn301d5ea00qr	cmqnjmmn900ceod01dz6unzwp	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:56:43.74	2026-07-23 12:56:43.74	cmp4s9cxl005gl4018m1wy6wp
cmrximxt7003rn301pcco13z1	cmqrwntpy0016sc0146g80wvq	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:57:00.332	2026-07-23 12:57:00.332	cmp4s6te2005el4011ra2qxrl
cmrxin69v003vn301b3nsmzb1	cmqqipr55001fp9010qryqpgy	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:57:11.3	2026-07-23 12:57:11.3	cmp4s8kui005fl40100a1ew4b
cmrxinfwa003zn301170c58ho	cmqqio1g50018p9018hz9fq36	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:57:23.77	2026-07-23 12:57:23.77	cmp4s8kui005fl40100a1ew4b
cmrxinmox0043n301elo7c4b4	cmqqija83000up901vbrlsocv	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:57:32.578	2026-07-23 12:57:32.578	cmp4s8kui005fl40100a1ew4b
cmrxipw700047n301bq9ec353	cmrbwaec5001dmn01can4i9wf	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:59:18.204	2026-07-23 12:59:18.204	cmp4s8kui005fl40100a1ew4b
cmrxiq206004bn301xwc06q8d	cmrbw6y2c0014mn01a6ii4tiu	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:59:25.734	2026-07-23 12:59:25.734	cmp4s8kui005fl40100a1ew4b
cmrxiqa3s004fn3016tgj0984	cmp6ywfdb0055p401dvfsqap4	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:59:36.232	2026-07-23 12:59:36.232	cmp4scs0q005jl401azkonj0y
cmrxiqiby004jn3013eu2nnnp	cmrwe3svz000mn3011way6tzi	cmrkiw4m0000ulq01k7ohqj0r	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 12:59:46.894	2026-07-23 12:59:46.894	cmp4s9cxl005gl4018m1wy6wp
cmrxisq40004on3011n470mdn	cmqur46xc00jno701ceuxfoxy	cmrix5g6j00o4mn01cwwkhd5f	2026-07-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 13:01:30.288	2026-07-23 13:01:30.288	cmqur0gkm00jko7014ajnmg2a
cmrxitc1z004sn301cf124nxn	cmrwed60g000un301vg8ksj6i	cmrix5g6300nzmn016so9a0e3	2026-07-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 13:01:58.727	2026-07-23 13:01:58.727	cmp4s8kui005fl40100a1ew4b
cmrxiuq5a004wn301lcviiez3	cmps12dpz00hvp401tesxyqev	cmrix5g2200mzmn01zn08uvd2	2026-07-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 13:03:03.646	2026-07-23 13:03:03.646	cmp4sbkj5005il4015b2x78mh
cmrxiv0490050n301mlk8sllx	cmqf2b3xg0001wmtsjmoqct8a	cmrix5g2200mzmn01zn08uvd2	2026-07-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 13:03:16.569	2026-07-23 13:03:16.569	cmp4skb22005rl4014f0e7wgs
cmrxivp1w0054n30179p3xeyc	cmqw8ec6p0010mg01ce7hdn33	cmrix5g2f00n1mn0185zxtut4	2026-07-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 13:03:48.885	2026-07-23 13:03:48.885	cmp4sadgq005hl4016z9eqilf
cmrxivvln0058n301zpp9p4p1	cmpuxgfvo00iep401kuin241v	cmrix5g2f00n1mn0185zxtut4	2026-07-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 13:03:57.372	2026-07-23 13:03:57.372	cmp4s8kui005fl40100a1ew4b
cmrxmsnay005gn301fi9tshj1	cmruxoqq5000zo901ix6vukw5	cmr908w2700d1mm018fjay3hf	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 14:53:25.114	2026-07-23 14:53:25.114	cmr0t6kdb000mmm01e58p4sux
cmrxmtc6w005kn301g2gwwylj	cmruxkruh000ro901qcd982u7	cmr908w2700d1mm018fjay3hf	2026-07-15	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 14:53:57.368	2026-07-23 14:53:57.368	cmp4sixhw005ol401euqmhrwh
cmrxmxrni005on301nay6rldx	cmrnml84b00kwlq01sw6qm4zc	cmrajn85w00krmm01ek4beq4i	2026-07-16	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 14:57:24.03	2026-07-23 14:57:24.03	cmp4s9cxl005gl4018m1wy6wp
cmrxnqvfq005yn301e5z06tkf	cmqp4ky050002lk01gx0v2tv9	cmr908vz600c1mm01l0z41ey8	2026-07-17	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 15:20:01.958	2026-07-23 15:20:01.958	cmp4s6te2005el4011ra2qxrl
cmrxnusu10068n301ndr7zbdk	cmqp4ky050002lk01gx0v2tv9	cmr908w0000c9mm01mtivvn2w	2026-07-19	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-23 15:23:05.209	2026-07-23 15:23:05.209	cmp4s6te2005el4011ra2qxrl
cms3gprj000acn301z6ra42b9	cmp5i45nq000ap401mr5kujgq	cmrix5g2n00n4mn013270gc7s	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:49:49.981	2026-07-27 16:49:49.981	cmp4s9cxl005gl4018m1wy6wp
cms3gpww600agn301kufd41z7	cmp6mh9mn0033p401xa6v43p7	cmrix5g2n00n4mn013270gc7s	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:49:56.935	2026-07-27 16:49:56.935	cmp4sejni005kl4013ure33mc
cms3gw7wi00aon30198yg50rn	cmp5d9vn5006zl401fo5j5q04	cmrix5g2q00n5mn01trk8ai08	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:54:51.138	2026-07-27 16:54:51.138	cmp4slcpz005ul401m1rpf0qa
cms3gwvij00awn30108epnb93	cmpb26l0900ccp4014tau0gjw	cmrix5g2q00n5mn01trk8ai08	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:55:21.739	2026-07-27 16:55:21.739	cmp4sadgq005hl4016z9eqilf
cms3gxnew00b0n3018o2ngp9j	cmrnrrjxa00lblq014meynmha	cmrix5g2q00n5mn01trk8ai08	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:55:57.897	2026-07-27 16:55:57.897	cmp4s8kui005fl40100a1ew4b
cms3gxyk100b4n301gfnnw44w	cmp87ym20006yp401590xadl0	cmrix5g2q00n5mn01trk8ai08	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:56:12.337	2026-07-27 16:56:12.337	cmp4sadgq005hl4016z9eqilf
cms3gycxe00b8n301ibfbpuda	cmpya6nur00kgp401et6xel9m	cmrix5g2q00n5mn01trk8ai08	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:56:30.962	2026-07-27 16:56:30.962	cmp4s8kui005fl40100a1ew4b
cms3h1d5h00ben3011u2ks15q	cmp6mxgtj003np401n6d3md2o	cms3h0x0a00bcn301sbprbh9i	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 16:58:51.221	2026-07-27 16:58:51.221	cmp4skb22005rl4014f0e7wgs
cms3h30o400bin301skskq22f	cmr91dvvk00ddmm01yvoi91dd	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:00:08.356	2026-07-27 17:00:08.356	cmr0t6kdb000mmm01e58p4sux
cms3h3mhu00bmn301ow9ua4se	cmqf2b3z80007wmtsodeuow25	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:00:36.642	2026-07-27 17:00:36.642	cmp4t5amk005zl4014v76r8bk
cms3h5b8100bqn3017evyxv05	cmrbure45000vmn014ppcw3bv	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:01:55.345	2026-07-27 17:01:55.345	cmp4sixhw005ol401euqmhrwh
cms3h5fea00bun301so7rmkqz	cmrbunzzo000mmn01dkqpill6	cmrix5g2t00n6mn01k2bl15j2	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:02:00.754	2026-07-27 17:02:00.754	cmr0t6kdb000mmm01e58p4sux
cms3h6id500byn3012ulyzc1l	cmpwo5qcf00jgp401y23i6i2r	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:02:51.258	2026-07-27 17:02:51.258	cmp4sadgq005hl4016z9eqilf
cms3h6xzr00c2n301ykvkvcc9	cmp80zids006np4015qmgm2k4	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:03:11.512	2026-07-27 17:03:11.512	cmp4s8kui005fl40100a1ew4b
cms3hai9100c6n301jja2fexb	cmqnjhe4500c7od01xunmmhyz	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:05:57.734	2026-07-27 17:05:57.734	cmp4s9cxl005gl4018m1wy6wp
cms3harhj00can301asanwn90	cmr3dno9x008vmm01yn5zbnx3	cmrix5g2x00n7mn010nwkr2m6	2026-07-23	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:06:09.703	2026-07-27 17:06:09.703	cmp4s8kui005fl40100a1ew4b
cms3hepb500cen30140xz3vsw	cmp5i45nq000ap401mr5kujgq	cmrix5g3500namn01d6q34xfu	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:09:13.505	2026-07-27 17:09:13.505	cmp4s9cxl005gl4018m1wy6wp
cms3hhnak00cmn3015ux4veoq	cmrdadhtm001wmn01ebkmguat	cmrix5g3700nbmn01utknxxky	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:11:30.86	2026-07-27 17:11:30.86	cmr0t6kdb000mmm01e58p4sux
cms3hm88l00csn301v28w6au7	cmrwed60g000un301vg8ksj6i	cmrix5g3700nbmn01utknxxky	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:15:04.629	2026-07-27 17:15:04.629	cmp4s8kui005fl40100a1ew4b
cms3hoyda00cwn3016m3y9r19	cmqw8ilsb001emg0158v8etes	cmrix5g3a00ncmn018gebhfc1	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:17:11.807	2026-07-27 17:17:11.807	cmp4t5amk005zl4014v76r8bk
cms3hp62200d0n3011s340jmv	cmqw8ha3o0017mg010cohkf7t	cmrix5g3a00ncmn018gebhfc1	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:17:21.771	2026-07-27 17:17:21.771	cmp4t5amk005zl4014v76r8bk
cms3hpimd00d4n3012qrak10j	cmrdak4v0002wmn01j2my021k	cmrix5g3a00ncmn018gebhfc1	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:17:38.053	2026-07-27 17:17:38.053	cmp4sixhw005ol401euqmhrwh
cms3hprzw00d8n301j7s9rbja	cmrdalmpn0035mn01esii22rz	cmrix5g3a00ncmn018gebhfc1	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:17:50.204	2026-07-27 17:17:50.204	cmp4sixhw005ol401euqmhrwh
cms3hqixk00dcn301diqi8cgc	cmpuxyh5x00itp401pqas19s7	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:18:25.112	2026-07-27 17:18:25.112	cmp4sadgq005hl4016z9eqilf
cms3hqrgs00dgn301fo0hq9vt	cms35x3i0009kn301kd28orpb	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:18:36.173	2026-07-27 17:18:36.173	cmp4s6te2005el4011ra2qxrl
cms3hrp4v00dkn301xzrp7o7e	cms362k9k009sn3012zp10a99	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:19:19.807	2026-07-27 17:19:19.807	cmp4s6te2005el4011ra2qxrl
cms3hs2ny00don301mbpy2s62	cms35lfky009cn301i7ou31cd	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:19:37.342	2026-07-27 17:19:37.342	cmp4s6te2005el4011ra2qxrl
cms3hspq300dsn3013lkyimya	cmp6maci6002tp40119cnxlu3	cmrix5g3c00ndmn01mqlcrazs	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:20:07.227	2026-07-27 17:20:07.227	cmp4sadgq005hl4016z9eqilf
cms3hvf2300dwn301cwvar8gp	cmp5qzr8e001ap401fa4uuzw4	cmrix5g3l00nemn01nkgvmio8	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:22:13.372	2026-07-27 17:22:13.372	cmp4sadgq005hl4016z9eqilf
cms3hvlmt00e0n3011m27mgjq	cmp5qutpd0015p401e0b83fu9	cmrix5g3l00nemn01nkgvmio8	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:22:21.893	2026-07-27 17:22:21.893	cmp4sadgq005hl4016z9eqilf
cms3hwgde00e4n301k2dw88rh	cmqw8ec6p0010mg01ce7hdn33	cmrix5g3l00nemn01nkgvmio8	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:23:01.73	2026-07-27 17:23:01.73	cmp4sadgq005hl4016z9eqilf
cms3hwrf400e8n301ml8c5wm0	cmqno2ywp00dfod01x3mtrdjg	cmrix5g3l00nemn01nkgvmio8	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:23:16.048	2026-07-27 17:23:16.048	cmp4sadgq005hl4016z9eqilf
cms3hx0wk00ecn301f9ycm50g	cmrwe3svz000mn3011way6tzi	cmrix5g3l00nemn01nkgvmio8	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:23:28.34	2026-07-27 17:23:28.34	cmp4s9cxl005gl4018m1wy6wp
cms3hx7ds00egn301pkn2wcn0	cmp6ywfdb0055p401dvfsqap4	cmrix5g3l00nemn01nkgvmio8	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:23:36.736	2026-07-27 17:23:36.736	cmp4scs0q005jl401azkonj0y
cms3hz6z300eon3019ggk3p77	cmqf2b43f0011wmts29fvfire	cmrix5g3q00nfmn015smlq1xu	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:25:09.52	2026-07-27 17:25:09.52	cmp4s8kui005fl40100a1ew4b
cms3hzt8z00esn301p4w6fyws	cmruxkruh000ro901qcd982u7	cmrix5g3q00nfmn015smlq1xu	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:25:38.388	2026-07-27 17:25:38.388	cmp4sixhw005ol401euqmhrwh
cms3i013t00ewn301pym3r87d	cmruxoqq5000zo901ix6vukw5	cmrix5g3q00nfmn015smlq1xu	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:25:48.569	2026-07-27 17:25:48.569	cmr0t6kdb000mmm01e58p4sux
cms3i0au300f0n3014p2vjsxz	cmrbure45000vmn014ppcw3bv	cmrix5g3q00nfmn015smlq1xu	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:26:01.18	2026-07-27 17:26:01.18	cmp4sixhw005ol401euqmhrwh
cms3i0jqw00f4n301nc5avn24	cmrbunzzo000mmn01dkqpill6	cmrix5g3q00nfmn015smlq1xu	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:26:12.729	2026-07-27 17:26:12.729	cmp4slcpz005ul401m1rpf0qa
cms3i7ti600f8n3015cm6rqsu	cmp5d9vn5006zl401fo5j5q04	cmrix5g4300nimn01y497k43n	2026-07-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:31:51.967	2026-07-27 17:31:51.967	cmp4slcpz005ul401m1rpf0qa
cms3i8dn600fcn3010np7wyo5	cmp6mujhf003ip4019yxl5iri	cmrix5g4300nimn01y497k43n	2026-07-25	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:32:18.066	2026-07-27 17:32:18.066	cmp4scs0q005jl401azkonj0y
cms3i8x8y00fgn301htb3tzx4	cmr91dvvk00ddmm01yvoi91dd	cmrix5g4700njmn01bwfs64se	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:32:43.474	2026-07-27 17:32:43.474	cmr0t6kdb000mmm01e58p4sux
cms3idbfv00fon301ndtvknxd	cmrwed60g000un301vg8ksj6i	cmrix5g4700njmn01bwfs64se	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:36:08.491	2026-07-27 17:36:08.491	cmp4s8kui005fl40100a1ew4b
cms3idmf000fsn301frk42amg	cmp87ym20006yp401590xadl0	cmrix5g4700njmn01bwfs64se	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:36:22.717	2026-07-27 17:36:22.717	cmp4sadgq005hl4016z9eqilf
cms3idswd00fwn301lc36n61i	cmrdrcgat00kumn0112odkalw	cmrix5g4700njmn01bwfs64se	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:36:31.118	2026-07-27 17:36:31.118	cmp4skb22005rl4014f0e7wgs
cms3ih98600g0n301t8w4gnn3	cmp6mujhf003ip4019yxl5iri	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:39:12.246	2026-07-27 17:39:12.246	cmp4scs0q005jl401azkonj0y
cms3ihktx00g4n3010ym3wzl3	cmpuxbc7900i9p401d4rkyuom	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:39:27.285	2026-07-27 17:39:27.285	cmp4sejni005kl4013ure33mc
cms3ijvvx00g8n301u4rmdlgz	cms365esm00a0n3016r7lmgxk	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:41:14.926	2026-07-27 17:41:14.926	cmp4s6te2005el4011ra2qxrl
cms3ik2oc00gcn3018ylqe5gp	cmpfpx1dd00ekp4015zb7hrup	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:41:23.724	2026-07-27 17:41:23.724	cmp4sbkj5005il4015b2x78mh
cms3ikzmc00ggn30144eccz7j	cmp5d9vn5006zl401fo5j5q04	cmrix5g4i00nlmn01csonnu9x	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 17:42:06.421	2026-07-27 17:42:06.421	cmp4slcpz005ul401m1rpf0qa
cms3lf4td00hyn301e66d05xc	cmrf1usfb00lkmn01msecwoo3	cmrix5g3700nbmn01utknxxky	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-27 19:01:32.066	2026-07-27 19:01:32.066	cmp4s6te2005el4011ra2qxrl
cms4nhk4t00iun301ct87cutu	cmqw8ilsb001emg0158v8etes	cmrt646pm00mqlq01cvviopma	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:47:10.637	2026-07-28 12:47:10.637	cmp4t5amk005zl4014v76r8bk
cms4nhxtf00iyn301aqkbphjg	cmqw8ha3o0017mg010cohkf7t	cmrt646pm00mqlq01cvviopma	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:47:28.371	2026-07-28 12:47:28.371	cmp4t5amk005zl4014v76r8bk
cms4ni7o800j2n3017ubz3mbu	cmp5d9vn5006zl401fo5j5q04	cmrt646pm00mqlq01cvviopma	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:47:41.145	2026-07-28 12:47:41.145	cmp4slcpz005ul401m1rpf0qa
cms4nindr00j6n3011uolii51	cmrdadhtm001wmn01ebkmguat	cmrt646pm00mqlq01cvviopma	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:48:01.504	2026-07-28 12:48:01.504	cmr0t6kdb000mmm01e58p4sux
cms4nk8v200jan301y1bjghxp	cmqqifegn000gp901x4b3a61j	cmrt646u000nplq01at0yofsd	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:49:15.998	2026-07-28 12:49:15.998	cmp4sixhw005ol401euqmhrwh
cms4nklr100jen301o6rctant	cms3kn6uo00h2n301qm5snmp2	cmrt646u000nplq01at0yofsd	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:49:32.702	2026-07-28 12:49:32.702	cmp4s6te2005el4011ra2qxrl
cms4nkybe00jin301wish1ahg	cms3kr38500han30115yyomyb	cmrt646u000nplq01at0yofsd	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:49:48.986	2026-07-28 12:49:48.986	cmp4s6te2005el4011ra2qxrl
cms4nm25000jmn301wo03xqi3	cmqw8ec6p0010mg01ce7hdn33	cmrt646sn00nclq01tp2531mh	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:50:40.597	2026-07-28 12:50:40.597	cmp4sadgq005hl4016z9eqilf
cms4nme8o00jqn3019gh7jubo	cmqqihcm6000np901ub12rzon	cmrt646sn00nclq01tp2531mh	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:50:56.28	2026-07-28 12:50:56.28	cmp4s9cxl005gl4018m1wy6wp
cms4nn23200jun301drm7lugo	cmr66zk2400b3mm01nzav5tty	cmrt646sn00nclq01tp2531mh	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:51:27.182	2026-07-28 12:51:27.182	cmp4s8kui005fl40100a1ew4b
cms4nnfk000jyn301q69yxrhf	cmr1tvvf8001fmm01nvgjy6v9	cmrt646sn00nclq01tp2531mh	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:51:44.641	2026-07-28 12:51:44.641	cmp4sbkj5005il4015b2x78mh
cms4nnw2b00k2n301xpgyu73s	cmps12dpz00hvp401tesxyqev	cmrt646sn00nclq01tp2531mh	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:52:06.035	2026-07-28 12:52:06.035	cmp4sbkj5005il4015b2x78mh
cms4nxgsk00kan3015yk1z9w2	cmr54gw0r009omm01n0aos5l6	cmrt646sq00ndlq016h4ggo4t	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:59:32.804	2026-07-28 12:59:32.804	cmp4s8kui005fl40100a1ew4b
cms4nxxhv00ken30151hsao7o	cmp5qutpd0015p401e0b83fu9	cmrt646sq00ndlq016h4ggo4t	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 12:59:54.451	2026-07-28 12:59:54.451	cmp4sadgq005hl4016z9eqilf
cms4nycf100kin301ih95kak6	cmp5qzr8e001ap401fa4uuzw4	cmrt646sq00ndlq016h4ggo4t	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 13:00:13.789	2026-07-28 13:00:13.789	cmp4sadgq005hl4016z9eqilf
cms4o84vy00kon301c7tre37d	cmr6940rg00bemm01s11l95mw	cmrt646sq00ndlq016h4ggo4t	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 13:07:50.59	2026-07-28 13:07:50.59	cmp4s8kui005fl40100a1ew4b
cms4o8rz200ksn3015ksye36z	cmp5dd5sd0074l401pv3drst8	cmrt646sq00ndlq016h4ggo4t	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 13:08:20.51	2026-07-28 13:08:20.51	cmp4sixhw005ol401euqmhrwh
cms4oc8ks00l2n301melf35b5	cms35x3i0009kn301kd28orpb	cmrt646sq00ndlq016h4ggo4t	2026-07-27	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 13:11:01.996	2026-07-28 13:11:01.996	cmp4s9cxl005gl4018m1wy6wp
cms4of5oy00l6n301funbw5zy	cms3kei3j00gmn301mhqotbc4	cmrix5g4700njmn01bwfs64se	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 13:13:18.226	2026-07-28 13:13:18.226	cmp4s8kui005fl40100a1ew4b
cms4og1jr00lan3014f8v8wma	cmqp4ky050002lk01gx0v2tv9	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 13:13:59.511	2026-07-28 13:13:59.511	cmp4s8kui005fl40100a1ew4b
cms4q56gg00lxn301uqmtl97x	cms362k9k009sn3012zp10a99	cmrix5g4700njmn01bwfs64se	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 14:01:31.888	2026-07-28 14:01:31.888	cmp4s6te2005el4011ra2qxrl
cms4q5hb200m1n301lqskagao	cmrri21yv00m2lq01gugwiiyq	cmrix5g4a00nkmn01yk5dazn9	2026-07-26	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-28 14:01:45.95	2026-07-28 14:01:45.95	cmp4s6te2005el4011ra2qxrl
cms60t15k0019k101yv6rzk2f	cmqnjmmn900ceod01dz6unzwp	cmrt646oy00mklq01woumqdb3	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:47:47.095	2026-07-30 10:55:06.601	cmp4s9cxl005gl4018m1wy6wp
cms60vbxt001bk101gls3xwis	cmqrwntpy0016sc0146g80wvq	cmrt646oy00mklq01woumqdb3	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:49:34.386	2026-07-30 10:55:20.848	cmp4s9cxl005gl4018m1wy6wp
cms614kz4001lk101924vijsm	cmr1tvvf8001fmm01nvgjy6v9	cmrt646ps00mslq01wu9xrxm6	2026-07-29	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:56:46.001	2026-07-29 11:56:46.001	cmp4sbkj5005il4015b2x78mh
cms615fh6001nk101espgvay7	cms35x3i0009kn301kd28orpb	cmrt646ps00mslq01wu9xrxm6	2026-07-29	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:57:25.53	2026-07-29 11:57:25.53	cmp4s9cxl005gl4018m1wy6wp
cms63isai0027k101l87x2ku4	cmp6n9pyb0047p401exgskztu	cmrt646t200nglq011fg40dno	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:03:47.898	2026-07-29 13:03:47.898	cmp4sadgq005hl4016z9eqilf
cms63j5um002bk101n50glr2h	cmrf1usfb00lkmn01msecwoo3	cmrt646t200nglq011fg40dno	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:04:05.471	2026-07-29 13:04:05.471	cmp4s6te2005el4011ra2qxrl
cms63ksam002fk101f8w42i8t	cmqp4ky050002lk01gx0v2tv9	cmrt646ud00ntlq01qxuz53eg	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:05:21.214	2026-07-29 13:05:21.214	cmp4s8kui005fl40100a1ew4b
cms63m8wi002jk101m8udrv5j	cmrwed60g000un301vg8ksj6i	cmrt646uf00nulq0145dvchqs	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:06:29.394	2026-07-29 13:06:29.394	cmp4s8kui005fl40100a1ew4b
cms63s3yo002nk1015lfc04gp	cmqf2b3xg0001wmtsjmoqct8a	cmrt646t800nhlq01y7vjtyig	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:11:02.928	2026-07-29 13:11:02.928	cmp4skb22005rl4014f0e7wgs
cms63szj8002rk101eiqyhtej	cmrdak4v0002wmn01j2my021k	cmrt646t800nhlq01y7vjtyig	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:11:43.844	2026-07-29 13:11:43.844	cmp4sixhw005ol401euqmhrwh
cms63tm9z002vk1019o793nrb	cmrdalmpn0035mn01esii22rz	cmrt646t800nhlq01y7vjtyig	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:12:13.32	2026-07-29 13:12:13.32	cmp4sixhw005ol401euqmhrwh
cms63v6ws002zk101m94wvw2n	cms4v82l8000nml0184j2mtyd	cmrt646tf00nilq01uijk7vbb	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:13:26.716	2026-07-29 13:13:26.716	cmp4s6te2005el4011ra2qxrl
cms63vm2s0033k101w5ofk3cr	cmqnnz1kg00d8od0103g8czza	cmrt646tf00nilq01uijk7vbb	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:13:46.372	2026-07-29 13:13:46.372	cmp4s9cxl005gl4018m1wy6wp
cms63xolz0037k101lk8esuh6	cms3kuoyo00hin301dzucqsrq	cmrt646tf00nilq01uijk7vbb	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:15:22.967	2026-07-29 13:15:22.967	cmp4s6te2005el4011ra2qxrl
cms63yvcb003bk101pxromli3	cmrbure45000vmn014ppcw3bv	cmrt646tj00njlq01sc8ry7bp	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:16:18.348	2026-07-29 13:16:18.348	cmp4sixhw005ol401euqmhrwh
cms640sar003zk1016ajq0cw1	cmrbunzzo000mmn01dkqpill6	cmrt646tj00njlq01sc8ry7bp	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:17:47.715	2026-07-29 13:17:47.715	cmp4slcpz005ul401m1rpf0qa
cms6410pj0043k1011anz7k7w	cmpuxbc7900i9p401d4rkyuom	cmrt646tj00njlq01sc8ry7bp	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:17:58.616	2026-07-29 13:17:58.616	cmp4sejni005kl4013ure33mc
cms6418i30047k101rcebsfmy	cmp5dd5sd0074l401pv3drst8	cmrt646tj00njlq01sc8ry7bp	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:18:08.716	2026-07-29 13:18:08.716	cmp4sixhw005ol401euqmhrwh
cms641g5m004bk10187wjwgym	cmpfpx1dd00ekp4015zb7hrup	cmrt646tj00njlq01sc8ry7bp	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:18:18.634	2026-07-29 13:18:18.634	cmp4sbkj5005il4015b2x78mh
cms641sxm004fk101f81g2bo6	cmrwe3svz000mn3011way6tzi	cmrt646tm00nklq01aidpf9xo	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:18:35.194	2026-07-29 13:18:35.194	cmp4s9cxl005gl4018m1wy6wp
cms6421pd004jk101iigz78v8	cmqf2b42m000vwmtsnd6eu11l	cmrt646tm00nklq01aidpf9xo	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:18:46.561	2026-07-29 13:18:46.561	cmp4sadgq005hl4016z9eqilf
cms64295u004nk101ppl9ny0x	cmqqipr55001fp9010qryqpgy	cmrt646tm00nklq01aidpf9xo	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:18:56.226	2026-07-29 13:18:56.226	cmp4s8kui005fl40100a1ew4b
cms642e1k004rk101hz8fbw1l	cmqqio1g50018p9018hz9fq36	cmrt646tm00nklq01aidpf9xo	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:19:02.552	2026-07-29 13:19:02.552	cmp4s8kui005fl40100a1ew4b
cms642lfw004vk1017z5clba4	cmqqija83000up901vbrlsocv	cmrt646tm00nklq01aidpf9xo	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:19:12.14	2026-07-29 13:19:12.14	cmp4s8kui005fl40100a1ew4b
cms642s8x004zk101mxgjkebg	cmr1tvvf8001fmm01nvgjy6v9	cmrt646tm00nklq01aidpf9xo	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:19:20.961	2026-07-29 13:19:20.961	cmp4sbkj5005il4015b2x78mh
cms643vxy0053k1012i24gi00	cmrbwaec5001dmn01can4i9wf	cmrt646pp00mrlq01tm5scppj	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:20:12.407	2026-07-29 13:20:12.407	cmp4s8kui005fl40100a1ew4b
cms6444v40057k101r5x5pvpu	cmrbw6y2c0014mn01a6ii4tiu	cmrt646pp00mrlq01tm5scppj	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:20:23.968	2026-07-29 13:20:23.968	cmp4s8kui005fl40100a1ew4b
cms637rn10025k101yuiuyqwh	cmp5dd5sd0074l401pv3drst8	cmrt646tx00nolq01k7yci8xd	2026-07-29	CANCELLED	ADMIN	admin_aurapilates_001	2026-07-29 13:25:33.993	2026-07-29 12:55:13.838	2026-07-29 13:25:33.994	cmp4sixhw005ol401euqmhrwh
cms64e0yy005bk101s485i81g	cmp5dd5sd0074l401pv3drst8	cms5zim1n000pk101b67059a5	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:28:05.483	2026-07-29 13:28:05.483	cmp4sixhw005ol401euqmhrwh
cms64fues005dk101q79atc59	cmr91dvvk00ddmm01yvoi91dd	cms5zim1n000pk101b67059a5	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:29:30.292	2026-07-29 13:29:30.292	cmr0t6kdb000mmm01e58p4sux
cms64q92s005lk1010k6nozdt	cmp5d9vn5006zl401fo5j5q04	cms5zim1n000pk101b67059a5	2026-07-30	CANCELLED	ADMIN	admin_aurapilates_001	2026-07-29 13:45:45.329	2026-07-29 13:37:35.86	2026-07-29 13:45:45.33	cmp4slcpz005ul401m1rpf0qa
cms62gm3s0023k101dg72ajas	cmqf2b3z80007wmtsodeuow25	cmrt646tx00nolq01k7yci8xd	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 12:34:06.952	2026-07-30 10:54:21.002	cmp4t5amk005zl4014v76r8bk
cms60ysuq001dk101pfcp5khd	cmrdrcgat00kumn0112odkalw	cmrt646p400mllq01dz1vl45e	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:52:16.275	2026-07-30 10:57:18.485	cmp4skb22005rl4014f0e7wgs
cms612qad001hk10160fe6jqs	cmqw8ec6p0010mg01ce7hdn33	cmrt646ps00mslq01wu9xrxm6	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:55:19.574	2026-07-30 10:57:48.987	cmp4sadgq005hl4016z9eqilf
cms613drv001jk101sozu0n9y	cmrwe3svz000mn3011way6tzi	cmrt646ps00mslq01wu9xrxm6	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:55:50.011	2026-07-30 10:57:56.657	cmp4s9cxl005gl4018m1wy6wp
cms61cjdc001rk10132pxhqbx	cmp5qutpd0015p401e0b83fu9	cmrt646pv00mtlq01e9o4srjr	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 12:02:57.168	2026-07-30 10:58:20.641	cmp4sadgq005hl4016z9eqilf
cms61d5do001vk101h6rzgpnq	cmp5qzr8e001ap401fa4uuzw4	cmrt646pv00mtlq01e9o4srjr	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 12:03:25.692	2026-07-30 10:58:26.806	cmp4sadgq005hl4016z9eqilf
cms61eheq001xk101bl0fspqn	cmraefj5300hzmm01gbupayou	cmrt646pv00mtlq01e9o4srjr	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 12:04:27.938	2026-07-30 10:58:41.235	cmp4s9cxl005gl4018m1wy6wp
cms6277fq0021k1016co4wjdz	cmrwed60g000un301vg8ksj6i	cmrt646q300mulq0117pev09h	2026-07-30	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 12:26:48.039	2026-07-30 11:16:42.728	cmp4s8kui005fl40100a1ew4b
cms64nc1o005hk101ys4xrody	cmp6ywfdb0055p401dvfsqap4	cmrt646qb00mwlq01wcfgcx1t	2026-07-30	CANCELLED	ADMIN	admin_aurapilates_001	2026-07-30 11:30:24.731	2026-07-29 13:35:19.74	2026-07-30 11:30:24.732	cmp4scs0q005jl401azkonj0y
cms64nuja005jk101nantjydg	cmpazudle00byp401oz4zx3e1	cms5zim1n000pk101b67059a5	2026-07-30	CANCELLED	ADMIN	admin_aurapilates_001	2026-07-29 13:44:23.13	2026-07-29 13:35:43.703	2026-07-29 13:44:23.13	cmp4slcpz005ul401m1rpf0qa
cms6504r2005rk101umjh7ahs	cmpya6nur00kgp401et6xel9m	cmrt646qb00mwlq01wcfgcx1t	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:45:16.814	2026-07-29 13:45:16.814	cmp4s8kui005fl40100a1ew4b
cms653712005vk101109nvtks	cmp80zids006np4015qmgm2k4	cmrt646ql00mylq01hei3u277	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:47:39.735	2026-07-29 13:47:39.735	cmp4s8kui005fl40100a1ew4b
cms6546e6005xk101q0qpmwsy	cmp6mujhf003ip4019yxl5iri	cmrt646ql00mylq01hei3u277	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:48:25.566	2026-07-29 13:48:25.566	cmp4scs0q005jl401azkonj0y
cms679bgr0005mo01hq63o6yn	cmpb26l0900ccp4014tau0gjw	cmrt646t200nglq011fg40dno	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 14:48:24.651	2026-07-29 14:48:24.651	cmp4sadgq005hl4016z9eqilf
cms6ahquq000bmo01chw6gjsy	cmp5i45nq000ap401mr5kujgq	cmrt646q300mulq0117pev09h	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 16:18:56.69	2026-07-29 16:18:56.69	cmp4s9cxl005gl4018m1wy6wp
cms6awpru000dmo01ybcv4epf	cmr0e8q3k009bmg01p00ba0nx	cmrt646p800mmlq01pjo2y9i8	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 16:30:35.13	2026-07-29 16:30:35.13	cmqur0gkm00jko7014ajnmg2a
cms64zjal005pk101krmp44pb	cmpazudle00byp401oz4zx3e1	cmrt646qb00mwlq01wcfgcx1t	2026-07-30	CANCELLED	ADMIN	admin_aurapilates_001	2026-07-29 16:35:31.768	2026-07-29 13:44:49.006	2026-07-29 16:35:31.769	cmp4slcpz005ul401m1rpf0qa
cms7g1drn003zmo018sg2d49l	cmr1tvvf8001fmm01nvgjy6v9	cmrt646ql00mylq01hei3u277	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:41:57.107	2026-07-30 11:41:57.107	cmp4sbkj5005il4015b2x78mh
cms6blfeh000nmo01482jk3mn	cms3kuoyo00hin301dzucqsrq	cms5zim1n000pk101b67059a5	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 16:49:48.089	2026-07-29 16:49:48.089	cmp4t00w6005xl401jv0qklyp
cms6dkf5c000zmo01w4wazitl	cmqnlllpk00csod01wkefk1ot	cmrt646pp00mrlq01tm5scppj	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 17:45:00.336	2026-07-29 17:45:00.336	cmp4s6te2005el4011ra2qxrl
cms6dlix20013mo0189g6tzsx	cmqno2ywp00dfod01x3mtrdjg	cmrt646pp00mrlq01tm5scppj	2026-07-28	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 17:45:51.879	2026-07-29 17:45:51.879	cmp4sadgq005hl4016z9eqilf
cms6eyka9001jmo01kr9b66gr	cmqnlllpk00csod01wkefk1ot	cmrix5g2f00n1mn0185zxtut4	2026-07-22	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 18:23:59.793	2026-07-29 18:23:59.793	cmp4s6te2005el4011ra2qxrl
cms6fcwzs001xmo01nuh2gm80	cmqzcgki3006umg01b9522uso	cmrix5g3200n9mn01rq7lk2vl	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 18:35:09.448	2026-07-29 18:35:09.448	cmquqvx9k00jio701xv9bwsuw
cms7dkh6b0029mo01mrv5t1fi	cmqzcgki3006umg01b9522uso	cmr908w1300cmmm0155c5onnh	2026-07-14	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-30 10:32:49.139	2026-07-30 10:32:49.139	cmquqvx9k00jio701xv9bwsuw
cms7e8jny002dmo017ntbd4o6	cmqnjvfwv00clod01smhvf5v7	cmrix5g5v00nxmn01ay3ifpnw	2026-07-21	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-30 10:51:32.111	2026-07-30 10:51:32.111	cmp4s9cxl005gl4018m1wy6wp
cms7ebgwd002hmo015634r27o	cmpazudle00byp401oz4zx3e1	cmrt646tu00nnlq01orfp75rn	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-30 10:53:48.493	2026-07-30 10:53:48.493	cmp4slcpz005ul401m1rpf0qa
cms60mx8p0011k1014v0avtw4	cmp6mxgtj003np401n6d3md2o	cmrt646tx00nolq01k7yci8xd	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:43:02.089	2026-07-30 10:54:12.314	cmp4skb22005rl4014f0e7wgs
cms60r93l0017k101k76cex31	cmps12dpz00hvp401tesxyqev	cmrt646oy00mklq01woumqdb3	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 11:46:24.081	2026-07-30 10:54:47.977	cmp4sbkj5005il4015b2x78mh
cms7ecxnv002rmo01yup3sm4y	cmqnjvfwv00clod01smhvf5v7	cmrt646oy00mklq01woumqdb3	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-30 10:54:56.876	2026-07-30 10:54:56.876	cmp4s9cxl005gl4018m1wy6wp
cms7eg40p0031mo01h1zlbmtj	cmqp3jmsv00euod010vtuk1qt	cmrt646p400mllq01dz1vl45e	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-30 10:57:25.081	2026-07-30 10:57:25.081	cmp4s6te2005el4011ra2qxrl
cms6drzu50017mo01l6xivtc9	cmpuxgfvo00iep401kuin241v	cmrt646ps00mslq01wu9xrxm6	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-29 17:50:53.742	2026-07-30 10:58:02.218	cmp4s8kui005fl40100a1ew4b
cms7eqww2003jmo01bp2intxs	cmqur46xc00jno701ceuxfoxy	cmrueiugk00yklq014e4kvo2m	2026-07-24	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:05:49.059	2026-07-30 11:05:49.059	cmqur0gkm00jko7014ajnmg2a
cms6bfpxy000fmo01bpzj54is	cmqf2b3z80007wmtsodeuow25	cms5zim1n000pk101b67059a5	2026-07-30	CANCELLED	ADMIN	admin_aurapilates_001	2026-07-30 11:24:20.717	2026-07-29 16:45:21.814	2026-07-30 11:24:20.717	cmp4t5amk005zl4014v76r8bk
cms6513cv005tk101p26e2ky3	cmp5d9vn5006zl401fo5j5q04	cmrt646qb00mwlq01wcfgcx1t	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-29 13:46:01.664	2026-07-30 11:33:24.681	cmp4slcpz005ul401m1rpf0qa
cms7frh0u003rmo010u8cczx2	cmpb26l0900ccp4014tau0gjw	cmrt646qb00mwlq01wcfgcx1t	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:34:14.767	2026-07-30 11:34:14.767	cmp4sadgq005hl4016z9eqilf
cms64rwpn005nk10112wawp6l	cmrnrrjxa00lblq014meynmha	cmrt646qb00mwlq01wcfgcx1t	2026-07-30	CANCELLED	ADMIN	admin_aurapilates_001	2026-07-30 11:34:56.023	2026-07-29 13:38:53.148	2026-07-30 11:34:56.024	cmp4s8kui005fl40100a1ew4b
cms7ft8g5003tmo018ltublu2	cmp87ym20006yp401590xadl0	cmrt646qb00mwlq01wcfgcx1t	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:35:36.966	2026-07-30 11:35:36.966	cmp4sadgq005hl4016z9eqilf
cms7fx20w003vmo01via9rj0w	cmpuxlbuw00ijp4016pmesm29	cmrt646ql00mylq01hei3u277	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:38:35.264	2026-07-30 11:38:35.264	cmp4s8kui005fl40100a1ew4b
cms7g0130003xmo01esnjkph2	cmp9p95jj00b2p401dqlrtohp	cmrt646ql00mylq01hei3u277	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:40:54.013	2026-07-30 11:40:54.013	cmp4s8kui005fl40100a1ew4b
cms7g3wz00041mo01ij25yvgp	cmqw8ilsb001emg0158v8etes	cmrt646qf00mxlq013jxxqu4r	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:43:55.308	2026-07-30 11:43:55.308	cmp4t5amk005zl4014v76r8bk
cms7g4gt00043mo016gh0whk0	cmqw8ha3o0017mg010cohkf7t	cmrt646qf00mxlq013jxxqu4r	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:44:21.013	2026-07-30 11:44:21.013	cmp4t5amk005zl4014v76r8bk
cms7g52m60045mo01bz1qx9rw	cmrbure45000vmn014ppcw3bv	cmrt646qf00mxlq013jxxqu4r	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:44:49.278	2026-07-30 11:44:49.278	cmp4sixhw005ol401euqmhrwh
cms7g5uou0047mo01wpg17dzm	cmrbunzzo000mmn01dkqpill6	cmrt646qf00mxlq013jxxqu4r	2026-07-30	BOOKED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:45:25.662	2026-07-30 11:45:25.662	cmp4slcpz005ul401m1rpf0qa
cms7gejzl0049mo01r6ovmmk2	cmqur46xc00jno701ceuxfoxy	cmrt646tp00nllq01wb0f586b	2026-07-29	ATTENDED	ADMIN	admin_aurapilates_001	\N	2026-07-30 11:52:11.697	2026-07-30 11:52:11.697	cmqur0gkm00jko7014ajnmg2a
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, "sessionToken", "userId", expires, "createdAt", "updatedAt") FROM stdin;
cmqgqm1vf0001wmhwleuxyhj0	82d926fe143e14456e11afc46568d7d04280680dec68efa9f44263991ed7a18c	cmq3zqwp1004cwmdk9plg925l	2026-06-16 17:09:59.924	2026-06-16 14:28:28.539	2026-06-16 15:09:59.925
cmq50y5jh0001wm94rpmy2tcu	9fe96d7900e5efc719b8dc8715b49d79500db95fcb68652dc233f4341dc5ad1e	cmq3zqwp1004cwmdk9plg925l	2026-06-08 11:45:16.097	2026-06-08 09:44:35.203	2026-06-08 09:45:16.099
cmqff65rr0005wm6sctllee2t	44e8ae5546bd8f512008c60f38b761b6d41d8d8ccdcd1d6a6f8be65209c742ab	cmq3zqwp1004cwmdk9plg925l	2026-06-15 19:31:02.813	2026-06-15 16:20:25.143	2026-06-15 17:31:02.815
cmq9e5x9n0001wmwwwp32p17k	750f9cfcbd6524eca1c17347dbd3cca271a8e53ba8091ee904d1e428cb07c163	cmq3zqwp1004cwmdk9plg925l	2026-06-11 15:09:56.68	2026-06-11 11:05:37.45	2026-06-11 13:09:56.684
cmqginwck0001wmvsy0yjk6qy	9632d7f0cd8110dce34ab5512729eded980e55919e99a16edf78eef67321616b	cmq3zqwp1004cwmdk9plg925l	2026-06-16 13:58:36.829	2026-06-16 10:45:57.762	2026-06-16 11:58:36.83
cmq3zzyk20001wmkobusm9ndz	cd2aaf9568f2960b64a3603eb82c5e94e32504bea462500e592d834d375098ad	cmq3zqwp1004cwmdk9plg925l	2026-06-07 19:04:59.612	2026-06-07 16:30:13.668	2026-06-07 17:04:59.615
cmq9bl8hq0005wmaot3j7iqtl	00dd2bac165acd621ca32d819229e171217ee7a4f36b8b3f87ae57c76da22c77	cmq3zqwp1004cwmdk9plg925l	2026-06-11 12:20:20.059	2026-06-11 09:53:32.99	2026-06-11 10:20:20.068
cmq9pcd1m0001wmosmvz2k28t	1cdfd489559868b8796455f375c0f14350aa45833252fe3ec9f8ed15ce9dea78	cmq3zqwp1004cwmdk9plg925l	2026-06-11 19:20:38.661	2026-06-11 16:18:33.608	2026-06-11 17:20:38.663
cmqe5i1yg0001wmcwz905dmvs	b82b24518269a316826fbf8849ffca10638e2b76c559e0f7f7f5a40836f1eae6	cmq3zqwp1004cwmdk9plg925l	2026-06-14 21:16:27.601	2026-06-14 19:01:57.737	2026-06-14 19:16:27.602
cmqi7ai440003wmrgb27pky2h	96bf5bb211a39947ae8848088de4df132df403ba7114565b4d4b5acf106177db	admin_aurapilates_001	2026-06-17 17:03:38.667	2026-06-17 15:03:09.364	2026-06-17 15:03:38.67
cmqlay7ek000eod01qzym2apx	8709a934a89afa8f24ceed4492e50422a4c4724649a6e958566f3f1d573c9103	cmq3zqwp1004cwmdk9plg925l	2026-06-19 21:08:52.603	2026-06-19 19:08:52.604	2026-06-19 19:08:52.604
cmqs1dp8n009ro701xketz2mu	6dba4d09f89ddd2f91cfbe1cd44fb4838d427bd54810f2df9a87f360af5b3418	admin_aurapilates_001	2026-06-24 14:23:19.854	2026-06-24 12:15:22.632	2026-06-24 12:23:19.855
cmqkpvxol0013mt017pu1mahi	07446ab2e03dd8e79ee2ac88c2c9fe423634df09a97e7bb9bfb286afdb8e30ac	admin_aurapilates_001	2026-06-19 11:28:08.132	2026-06-19 09:19:14.757	2026-06-19 09:28:08.133
cmqjuzx970011mt01pxrsmi57	fa854616f99ddc8036b1ef5fdd1d36416d1bcd08fa58d108c65f89be0e5e0423	admin_aurapilates_001	2026-06-18 20:54:40.363	2026-06-18 18:54:32.732	2026-06-18 18:54:40.363
cmqif9a0c000hmt01olc67xxh	455161a8a1e8b3d3014c38effb77470bfa243e62073a443166a9efc4b0a40103	admin_aurapilates_001	2026-06-17 20:46:48.974	2026-06-17 18:46:09.133	2026-06-17 18:46:48.976
cmqievwwf000bmt01oqtd22mh	03e26cad6d798623c8a8508a0d501a6c9f1d7093eb17f9f9cdb78a9e530f464c	admin_aurapilates_001	2026-06-17 20:56:13.636	2026-06-17 18:35:45.615	2026-06-17 18:56:13.639
cmql37nzl0019mt01hz9u30o5	8a61cdcd1db8eec47e7cbad0b4437a6f94b9934f572769d5aeea5d5ef8368f47	cmq3zqwp1004cwmdk9plg925l	2026-06-19 19:38:29.968	2026-06-19 15:32:17.073	2026-06-19 17:38:29.968
cmqjpil02000xmt01gpla0vpn	fa3ac507d6cfdfc3a881536b5efcf344780f4f70af046cc5c486bfb62fb55955	admin_aurapilates_001	2026-06-18 19:53:11.041	2026-06-18 16:21:05.618	2026-06-18 17:53:11.042
cmqob23zk00duod01dr1z2xp0	00984d9f158b9106bdc6d162185edafe49ea980c19d0f12a1189079caea798ce	cmq3zqwp1004cwmdk9plg925l	2026-06-22 00:09:46.711	2026-06-21 21:35:13.328	2026-06-21 22:09:46.712
cmqjsmuxb000zmt01kukpwlt7	d91bdbd1dbb527c33855dd4fa329be762383cdce6ecbffcbfc638ee5ea610a2a	admin_aurapilates_001	2026-06-18 19:57:32.106	2026-06-18 17:48:23.952	2026-06-18 17:57:32.107
cmqnigmt000c4od014wjy1hy3	3af3e3d1b703db2f59685d05582b19f8a392ab62e16ee3774508c06e71807f56	admin_aurapilates_001	2026-06-21 12:46:02.707	2026-06-21 08:14:42.036	2026-06-21 10:46:02.708
cmqn44r9j00c2od01m6p2zjw8	73e8fec77b0fc956dab79f2df92c0bb022de0eaedd636e3708d637e5be258733	cmq3zqwp1004cwmdk9plg925l	2026-06-21 03:36:56.94	2026-06-21 01:33:33.32	2026-06-21 01:36:56.941
cmqitmwnm000pmt010fkbvk2x	fdffa7bd762793d419d6a776ad69fb79a0c269f42c7b0b71b9e7d0b113963eeb	cmq3zqwp1004cwmdk9plg925l	2026-06-18 03:33:37.361	2026-06-18 01:28:39.634	2026-06-18 01:33:37.362
cmqmh6ngw000kod01qgjim7ka	0647f284c8e0b3e6fd0270299319aed4314d364fc0500e990fabeb12d538e2cd	admin_aurapilates_001	2026-06-20 19:15:14.07	2026-06-20 14:51:10.544	2026-06-20 17:15:14.071
cmqlaym1b000god017co6v3uf	124708ff6140de5b9f1a5a4a7180a0a92d72a0a1530c4583b2e3bc1a17291347	cmq3zqwp1004cwmdk9plg925l	2026-06-19 21:10:32.529	2026-06-19 19:09:11.567	2026-06-19 19:10:32.531
cmqjkly3d000vmt01v7d5wz22	c48ed46fa707b9c28589f3b1d6d4df5d143ba4aa7322f5acc24e473695f8def4	admin_aurapilates_001	2026-06-18 18:21:01.186	2026-06-18 14:03:44.473	2026-06-18 16:21:01.186
cmql81u030009od01m58pjb1j	e7ea41ff0444ad7da46bb2d4d5d3d6c9b723c3a057435d4d51f1e24c63973fe0	cmq3zqwp1004cwmdk9plg925l	2026-06-19 19:49:04.51	2026-06-19 17:47:43.012	2026-06-19 17:49:04.511
cmqnnvbji00d5od017nd4qb68	40f3d180b512f17ec3e495c7f6e2a13669cd67d94f180bce2bbfb1a85e5beaf3	admin_aurapilates_001	2026-06-21 13:14:08.13	2026-06-21 10:46:05.359	2026-06-21 11:14:08.131
cmqmw39ot008wod01xgu210hn	8722aba235cb8c0e21d19d88deebb5b7a2901c690433e24d4691c332ae2b0383	cmq3zqwp1004cwmdk9plg925l	2026-06-21 00:06:15.173	2026-06-20 21:48:26.958	2026-06-20 22:06:15.174
cmqpff9zc0003p9012179uwy7	7c0398b5e218977622e796faf5cbe603ec25972252939039fe20957fcddd3cdf	admin_aurapilates_001	2026-06-22 18:30:32.775	2026-06-22 16:25:12.264	2026-06-22 16:30:32.776
cmqoyv4hh00dxod01iqmtovlh	28942899a772bb09c538293786e66e38e9da66b7b4f3d1b62626e934c59f374e	admin_aurapilates_001	2026-06-22 12:51:34.163	2026-06-22 08:41:38.165	2026-06-22 10:51:34.164
cmqoapcc800dsod01mlonli4s	122347fea617c4a74f9c4cef7ad20585afe7f07fa9e79088f67e7e8aec970701	admin_aurapilates_001	2026-06-21 23:25:42.58	2026-06-21 21:25:17.624	2026-06-21 21:25:42.581
cmqmwrxws008yod01q1k7oasw	221c83d3347c64141b07d5218371578e9cd383624cd035ae27bbdc65d799a811	admin_aurapilates_001	2026-06-21 01:36:27.072	2026-06-20 22:07:38.092	2026-06-20 23:36:27.073
cmqpdfcpk0001p9013oq81fs6	b893c5c6dc850e4b71e79cb81ccdfdc9633b63383601884e619cf23bcb106d64	admin_aurapilates_001	2026-06-22 17:30:53.545	2026-06-22 15:29:16.569	2026-06-22 15:30:53.546
cmqphxi2v0007p901wetgbdiy	e21945928610932112b234ea2a8ff1009a87133a995ace631f35d93da4b9cef7	cmq3zqwp1004cwmdk9plg925l	2026-06-22 22:22:22.961	2026-06-22 17:35:21.799	2026-06-22 20:22:22.962
cmqpak37x000qlk018sux031e	59e53bdeaef47e820357e4938a3eecc9a61d507453a4cd8c5d642c77ea170561	admin_aurapilates_001	2026-06-22 18:25:08.903	2026-06-22 14:08:58.702	2026-06-22 16:25:08.904
cmqqgve4m0009p901cuqz6u8c	33bc0558398117a5f47b774ddc23a7277fedf40d7de929e958cb4894ca95f654	admin_aurapilates_001	2026-06-23 13:56:06.641	2026-06-23 09:53:29.926	2026-06-23 11:56:06.642
cmqql94r800agp901y6bhlh1e	516ce25a22cd7e4d0aa7cd8c645761f5daa03341059b0d5c7d0657c257f08543	admin_aurapilates_001	2026-06-23 16:12:27.141	2026-06-23 11:56:09.428	2026-06-23 14:12:27.142
cmqqq4gr000dsp901witauciq	b3408534b03c31b916a59bbf39d978617e764cd9dbed0507996719f89c0bc7e7	admin_aurapilates_001	2026-06-23 18:13:25.799	2026-06-23 14:12:29.773	2026-06-23 16:13:25.799
cmqqzvyxu0003sc01pvcz47e0	fd6399116493e0e5d545b106087a760dd859a10a78454e40cf51e7b86061754a	admin_aurapilates_001	2026-06-23 20:48:12.264	2026-06-23 18:45:49.602	2026-06-23 18:48:12.265
cmqr39yqg0007sc01l36v92ak	320b253875c9ad231edfc05aa55f16ad1d17021e48d06ce8e9f5fa7d0e559443	cmq3zqwp1004cwmdk9plg925l	2026-06-23 23:21:36.992	2026-06-23 20:20:41.369	2026-06-23 21:21:36.992
cmqrsr08t0009sc01v8vmtdva	48f9a95534a415a567a4f1713973c85cd1dd284bd461528c9a15b41c18f70992	admin_aurapilates_001	2026-06-24 12:13:56.472	2026-06-24 08:13:46.877	2026-06-24 10:13:56.473
cmqrwx4mk0003o701kx57y16o	43228170681570d6d38d8ff2df0fb91929cfbdaa732c85a3ac75f346cceab1de	cmqrvr7rf000dsc01jb52sobm	2026-06-24 12:12:38.149	2026-06-24 10:10:30.956	2026-06-24 10:12:38.149
cmr2gnslg0087mm01rn6eig3l	1a4d1d5a09a75f983941e3b96b90a55e79cb49614b2ddf90b681c10e9782bb40	cmq3zqwp1004cwmdk9plg925l	2026-07-01 21:20:54.577	2026-07-01 19:20:49.54	2026-07-01 19:20:54.578
cmqtnj2ue00j5o701du3catdp	f8617a7c874059059d004fd0617bc7686c98b6d8f955a953d1c07d5833db5e2a	admin_aurapilates_001	2026-06-25 17:23:17.986	2026-06-25 15:23:11.271	2026-06-25 15:23:17.987
cmqzt0vye0090mg01h8vv3t68	c30d797f1b5a6dde4065bd6bac4bf19a0375fa079728d4608204c639e23cd8d5	cmq3zqwp1004cwmdk9plg925l	2026-06-30 03:22:08.401	2026-06-29 22:43:37.286	2026-06-30 01:22:08.402
cmqtipwek00j1o701o6kzg7pe	49dd6d6b9e94828dd46191f0278bcc5c04b5afc7977611cc4d4ddf38d1ed833f	admin_aurapilates_001	2026-06-25 18:18:40.975	2026-06-25 13:08:31.437	2026-06-25 16:18:40.976
cmqv0l4ki0007mg01hdgzaxuj	886d204df7c0a53368d4e40c1d00e26f69ef5db1576e194361abe54e06953233	admin_aurapilates_001	2026-06-26 17:04:14.224	2026-06-26 14:16:28.002	2026-06-26 15:04:14.225
cmqv0lae60009mg013c7d9wuy	fb05527d2205d516b341613b16e0890cbc3e65ed71c49c1c6c27269a033b73f9	admin_aurapilates_001	2026-06-26 18:26:35.297	2026-06-26 14:16:35.551	2026-06-26 16:26:35.298
cmqw7upay000xmg01xy8e1312	5b2c674262b80721e1d53f19500cc7b20aceffe73934d85a475bb5bcc35e52ee	admin_aurapilates_001	2026-06-27 13:53:01.328	2026-06-27 10:27:38.267	2026-06-27 11:53:01.329
cms52wchj0005k101tsdfznhf	a8c30f59ce2caf1dc5908efbbdc8f038655393770e4b34a3f4bb6a084850cce9	admin_aurapilates_001	2026-07-28 21:58:45.025	2026-07-28 19:58:34.808	2026-07-28 19:58:45.026
cmqti455200izo7011n9c9elj	84434fbf883b444342aeafdac3c0d4e5f59d7de1630b9fbc2234f742222cf642	admin_aurapilates_001	2026-06-25 16:55:36.657	2026-06-25 12:51:36.326	2026-06-25 14:55:36.658
cmqv1bbmu000jmg017a5p0lth	af5af25ab89ad4b513457d49fa60852e2e2e9a4c84ab591355c1f968817ba0e2	cmq3zqwp1004cwmdk9plg925l	2026-06-26 17:00:23.46	2026-06-26 14:36:50.215	2026-06-26 15:00:23.461
cmqtedwq400ilo701xtvdro9i	c5639cad14e04132b855ec6f098097d970d792edcf1ebf860cfecc79dffe3dc8	admin_aurapilates_001	2026-06-25 15:08:28.786	2026-06-25 11:07:13.516	2026-06-25 13:08:28.787
cmqzeatn5008smg019vwftk1g	ed665ad51555a911df3198285a23851e6f4dd26742c7f5efb4067fe12d6c1f10	admin_aurapilates_001	2026-06-29 19:25:13.211	2026-06-29 15:51:26.609	2026-06-29 17:25:13.212
cmqs9sb8100g7o701lvxjsau2	4cbfd8bc645a94e28027caccc2fcf29d55fa610625b37dc121c0fffaade58203	admin_aurapilates_001	2026-06-24 18:55:58.269	2026-06-24 16:10:41.233	2026-06-24 16:55:58.27
cmqrx1l430005o70173sb4hdt	03def0a27af2d3b54c15701d4f60fa5ffc520afd93b5502523b7a33a0a303d9f	admin_aurapilates_001	2026-06-24 14:25:06.499	2026-06-24 10:13:58.948	2026-06-24 12:25:06.5
cmqtjsu4n00j3o701gdq74s83	32d6509e459067575d062c11b5b1920395073be9de25472e353e9c5b28888a85	admin_aurapilates_001	2026-06-25 15:38:48.742	2026-06-25 13:38:48.072	2026-06-25 13:38:48.743
cmqtdves300ijo701muxsgo5z	0f19e364369ca712fb09b3617cfa254d856ca859c31738ef436ce9a5d01f0238	cmqtdvery00iho7014i79virw	2026-06-25 12:53:11.785	2026-06-25 10:52:50.451	2026-06-25 10:53:11.786
cmqt85w1l00hlo701ulb3qp5c	69c7be02dcb7035ff588e245163d690a0f494a9149c2deaa470d8718a2316446	admin_aurapilates_001	2026-06-25 12:22:35.813	2026-06-25 08:13:01.689	2026-06-25 10:22:35.814
cmqu01sj100jdo7019bslxzj0	3692b342b92c35f8e836105c019526b9264b420b01a57ced13cbbba33a219887	cmq3zqwp1004cwmdk9plg925l	2026-06-25 23:13:39.756	2026-06-25 21:13:39.757	2026-06-25 21:13:39.757
cmqyxf504002tmg01r22iob2u	1351fb207f2ee9304dcde95965cca17dd989f7f01bcb874fe9dce2cfabac0075	admin_aurapilates_001	2026-06-29 12:10:37.808	2026-06-29 07:58:54.485	2026-06-29 10:10:37.809
cmqxmwiaw002nmg01lswe9hn8	cb6c004e41b97d814f414629c5c2715aa9a8415794d900808ee4a29ed3aea714	admin_aurapilates_001	2026-06-28 12:19:59.333	2026-06-28 10:16:42.92	2026-06-28 10:19:59.334
cmr3d40gp008dmm01r3afngrf	f9c6e5081fc1532726a69b85f8c73af3abe69d5a2f17fd6d92504eb92c23c22f	admin_aurapilates_001	2026-07-02 14:33:04.552	2026-07-02 10:29:13.945	2026-07-02 12:33:04.553
cmqw2in8d000pmg01xqle7t5u	6b19897bd0f519021442074d9d1176dd1c0f9fea630537c296ee05cfa06a4bbf	admin_aurapilates_001	2026-06-27 12:13:32.638	2026-06-27 07:58:17.629	2026-06-27 10:13:32.638
cmqv58ip1000nmg0199u8lsfr	e5b9628b8e4c898c4919ecfe20b08d601b43fccf8be0d023e82f0c278e355c4a	admin_aurapilates_001	2026-06-26 20:03:09.381	2026-06-26 16:26:37.862	2026-06-26 18:03:09.381
cmqyeifa3002rmg01vww8a4wo	a59f04fa2e8b4cd2e56dccdcf6266a931e143d0ec0f8f3a57bb7c9b535636243	cmq3zqwp1004cwmdk9plg925l	2026-06-29 01:09:44.766	2026-06-28 23:09:35.067	2026-06-28 23:09:44.767
cmqwapbi6002lmg01k9cqibee	293ef0880125c4dd98e99b9c989583215ceeef7a9e2fe45bf330ce70032cbc8c	admin_aurapilates_001	2026-06-27 13:47:35.687	2026-06-27 11:47:25.95	2026-06-27 11:47:35.688
cmr0nqr190003mm01kst2dekc	a4c68edde4f988d932e38757188da4a09fd6c2b05d060e0882c1a7f4ab9dbee1	admin_aurapilates_001	2026-06-30 15:57:17.59	2026-06-30 13:03:32.445	2026-06-30 13:57:17.591
cmqzu1lw60092mg01l1zqu96m	dc60d47b51c0531c30b1efe83df4d6bf9aa427ac4f9c515f8455bbae3838b05f	admin_aurapilates_001	2026-06-30 01:39:06.964	2026-06-29 23:12:10.518	2026-06-29 23:39:06.965
cmr10ralp0014mm01x7afpher	45d7e9f26968acbfac59ae1519ed3766116dee6f70a9e81acf987990ccdfe1e4	admin_aurapilates_001	2026-06-30 21:08:05.291	2026-06-30 19:07:52.813	2026-06-30 19:08:05.292
cmr0ikwy0009jmg01xl55jl1m	2bdb961d7c763bc2e2fce5a7214abccc8474ddd4d40955d5a41b7c0fbd9384d1	admin_aurapilates_001	2026-06-30 15:05:04.617	2026-06-30 10:39:02.089	2026-06-30 13:05:04.618
cmqzargj5003lmg01sy4a2t5m	5b139900ad9579fbbe270ceff2921eede70b9844b389c2166af6d484fa973dff	admin_aurapilates_001	2026-06-29 19:12:58.604	2026-06-29 14:12:24.306	2026-06-29 17:12:58.605
cmr0e4qwp0098mg0161b6e9im	53af54efbceeb28ff3b8d0db861412c0ff577937b8c66d78c35f80bc60823947	admin_aurapilates_001	2026-06-30 12:38:59.039	2026-06-30 08:34:29.305	2026-06-30 10:38:59.04
cmr0nss610005mm010iy80vn5	9c6f7ecfa177860898b1edac4911aaa1f065e53d9c47e4d19a45345de433a9dd	admin_aurapilates_001	2026-06-30 17:30:30.971	2026-06-30 13:05:07.225	2026-06-30 15:30:30.972
cmr692fv200bbmm01uv2ue8n8	37ea540587f6b0b30424a32f1bd3d6245afd224b90a2de9cb3b1b81de5d4e897	admin_aurapilates_001	2026-07-04 13:36:02.234	2026-07-04 10:59:20.654	2026-07-04 11:36:02.235
cmr1se9bg001amm01hdt4xsti	7715ee7cc3b8f27d8812d21784edf6f4c6d4fab676cf5957e767d6cba5c631b1	admin_aurapilates_001	2026-07-01 12:05:36.421	2026-07-01 08:01:33.868	2026-07-01 10:05:36.422
cmr3ql1mj009bmm01rkz8whzz	a743ac3f835104685624d85ec30694a57eb2761f065856c5323a0a1c7fa9a1cd	admin_aurapilates_001	2026-07-02 18:46:29.233	2026-07-02 16:46:23.611	2026-07-02 16:46:29.234
cmr0twszy000umm01tsewo5jz	cc2971866836e1dc87f2e9248e179d09f70d442eda322e1c74abc355c99b8485	cmpxtfc9x00k0p401f0dp40ed	2026-06-30 21:58:49.416	2026-06-30 15:56:12.622	2026-06-30 19:58:49.417
cmr2hyj780089mm01w56m6x4t	b7a57bd2b27b1633982ed9e7ee24f2523c4587172ba5e515f0d18a2d3de0d329	admin_aurapilates_001	2026-07-01 21:57:23.365	2026-07-01 19:57:10.196	2026-07-01 19:57:23.366
cmr528wo1009lmm0134qvsd26	ab06df7a5644e2cad9d91913c0b12b0f11349f5c275025fb09af763aa9e8e10f	admin_aurapilates_001	2026-07-03 20:02:37.661	2026-07-03 15:00:38.881	2026-07-03 18:02:37.662
cmr51y4rl009jmm01pvgmmufm	b61acea3e68494b8148404eea891fe0fe98c5ebbbc1ed3639efe9aacf45b5513	cmq3zqwp1004cwmdk9plg925l	2026-07-03 16:53:32.273	2026-07-03 14:52:16.161	2026-07-03 14:53:32.274
cmr6376p400aamm01eo0uj2ml	2396fb65fa6bd84c482579ad0d2df20f6b65830eb238f2947533d48b7c31ec17	admin_aurapilates_001	2026-07-04 12:59:18.345	2026-07-04 08:15:04.36	2026-07-04 10:59:18.347
cmr5doxbh00a8mm018h9y0tt6	5ec385f20dd6d563b3fd8f7d15c35d9343281a0e5e2f5622e46b3f31df45ff94	admin_aurapilates_001	2026-07-03 22:21:05.184	2026-07-03 20:21:01.997	2026-07-03 20:21:05.185
cmr7r2f5j00bomm01p42s5uu2	7d76acf33ee7c901b3123ddd539ba292730dac2ee1d45af35ef9ea318ed431f0	cmq3zqwp1004cwmdk9plg925l	2026-07-05 14:11:04.368	2026-07-05 12:10:58.999	2026-07-05 12:11:04.369
cmr7oxvk900bmmm01c73cukle	f8d763bad39494f5f22fd6e4c0a881354dcc8cafc7c3e7fbf343536970f6287c	admin_aurapilates_001	2026-07-05 13:11:41.104	2026-07-05 11:11:27.753	2026-07-05 11:11:41.105
cmrdem36c004fmn016ljoc854	ff435140fb6ebb1469097aa2a6ea3b9e06984b060826996da2f2f7e748420904	admin_aurapilates_001	2026-07-09 15:38:39.329	2026-07-09 11:08:58.644	2026-07-09 13:38:39.33
cmrjb85bk0001qd01yiknvxoj	7fb5cb5de80e15a4fe5922f892d2edfb84898e8fb0b37b133469455d0e02e2fa	admin_aurapilates_001	2026-07-13 18:49:56.657	2026-07-13 14:20:46.449	2026-07-13 16:49:56.658
cmrda1lw3001tmn013b9co985	2d575d5add1e03d050374f1ac82a48e2611fb5d191890d250de381c20dc9c107	admin_aurapilates_001	2026-07-09 13:08:55.922	2026-07-09 09:01:04.66	2026-07-09 11:08:55.923
cmrapyjmb00kxmm01j4y4m1to	7b49de590e01f81ac7220a714f05b513f00902d6ad0c12159c77a25b2fee6217	admin_aurapilates_001	2026-07-07 17:12:07.08	2026-07-07 14:03:17.075	2026-07-07 15:12:07.081
cmr99latp00ecmm01h5ml2q8c	c236a95c041e066de37a00fbe9af4d5b27091cf07dcedfbd51d5d9d54f60acbd	admin_aurapilates_001	2026-07-06 18:06:24.248	2026-07-06 13:37:19.117	2026-07-06 16:06:24.249
cmrjb8krz0003qd01i2jw39mz	4e013ea68365e71db022636666343c29995ec755e2a74260d6bf50b1d544f235	admin_aurapilates_001	2026-07-13 17:45:06.252	2026-07-13 14:21:06.479	2026-07-13 15:45:06.253
cmrf03r2m00l8mn01x73c4rnm	8c00837eb68f2eac6979e516eb020d85efca681b100b1901501c6c8ca9ca86be	admin_aurapilates_001	2026-07-10 18:00:40.186	2026-07-10 13:58:20.879	2026-07-10 16:00:40.186
cmraj07nt00k5mm01vb0s1h5p	6dc5ded7da82e5234ffe47b15018dfb24fafb506a371090ddc62683a915e85b5	admin_aurapilates_001	2026-07-07 16:03:14.384	2026-07-07 10:48:37.577	2026-07-07 14:03:14.385
cmrf4h48900lumn0145pshl8m	356b7217026f7ece614f9e5377333017804bf8977e12f42a4338c08cd8858cab	admin_aurapilates_001	2026-07-10 20:08:13.303	2026-07-10 16:00:42.922	2026-07-10 18:08:13.304
cmrc9pnlm001pmn01zuungnwo	5ecb03be8f16864454d0d7183bc88a0c2afdaede6d4dadeced1dc89c0d323a42	admin_aurapilates_001	2026-07-08 18:04:08.691	2026-07-08 16:04:00.826	2026-07-08 16:04:08.692
cmrbujcym0001mn012zriqmwb	0720a9f626eb0614c4bf79522bba94dbfb20393f6b86fef54dbe1403e6f7a3c7	admin_aurapilates_001	2026-07-08 13:06:47.148	2026-07-08 08:59:12.863	2026-07-08 11:06:47.149
cmr9jfu0x00humm01px0gwnf0	647b275bd7146dde68c1f30f31073fa9379610a1f1c84e0a912b268ca839191c	admin_aurapilates_001	2026-07-06 20:13:03.607	2026-07-06 18:13:00.225	2026-07-06 18:13:03.608
cmrido0tx00mvmn0132g0iskw	d2821c3c82cc29dd99544cb9b7c536dc7537a94277fc51fd0abd65f0b75693c1	cmq3zqwp1004cwmdk9plg925l	2026-07-13 00:41:25.271	2026-07-12 22:41:20.181	2026-07-12 22:41:25.272
cmrj9aiwk00pkmn01duf69u74	6308c8ed2cb08298fd247c6cf6f9266b703f6cd05b1d5bd55bfb9b2558400bca	cmq3zqwp1004cwmdk9plg925l	2026-07-13 16:16:23.674	2026-07-13 13:26:38.133	2026-07-13 14:16:23.675
cmraw850y0001s601l652bzmz	ca3e0bae98331855b81472550c195931b03f68eeeef92a1ef360403e368a3f2e	admin_aurapilates_001	2026-07-07 18:59:20.805	2026-07-07 16:58:42.419	2026-07-07 16:59:20.806
cmrix5fkx00mymn018gj3gxw6	8c4a1d247baf08e437f8bbbb7dce8ebd3b9028365c726fd9f0d84f479a248acc	admin_aurapilates_001	2026-07-13 13:02:50.116	2026-07-13 07:46:45.153	2026-07-13 11:02:50.117
cmrcgunl3001rmn01bxpn1nfv	3f4f60343ac44d454414ab6ac669916cb0fdce253ca6837445ec2aef5c2d24ff	cmq3zqwp1004cwmdk9plg925l	2026-07-08 22:14:06.246	2026-07-08 19:23:51.4	2026-07-08 20:14:06.247
cmrjkvvw6000dlq01np6y0jr6	758fda68bab0e1e19d88eb12ac9136906058ec531c8d0c3573a6bd9c843af958	admin_aurapilates_001	2026-07-13 20:51:31.909	2026-07-13 18:51:10.519	2026-07-13 18:51:31.91
cmrhk431f00mnmn01xtuiqyw0	7bb42239b803aab84e7e064f206b66a79953edc3dd781aaf9706d26e72d0b9ff	admin_aurapilates_001	2026-07-12 10:54:19.287	2026-07-12 08:54:01.059	2026-07-12 08:54:19.288
cmradzm9u00hwmm01zlz46muu	63dd277a4d5d54fd5e4c5b70da7210cec177afaeaaa276e343bd6ba745182d1d	admin_aurapilates_001	2026-07-07 12:48:34.593	2026-07-07 08:28:11.778	2026-07-07 10:48:34.594
cmrlum00x007glq013nkqckoc	d3c129e453ac71db94fff32ca4c4329fc45cd29b3feb79025f58a4aea0c42838	admin_aurapilates_001	2026-07-15 14:19:25.998	2026-07-15 08:58:57.825	2026-07-15 12:19:25.999
cmrf915fo00lwmn014yviaysa	c7ef10ffb408d6a908a33ec4479d4e55a6819360bfe15148e252b2fdd8dcb8b9	admin_aurapilates_001	2026-07-10 21:08:19.888	2026-07-10 18:08:16.068	2026-07-10 19:08:19.889
cmreo9chr00l2mn01s2ce1ghn	a2520a9d4dc7be362a6f2b2c20ac69f1c946f97c6361acc1b03a430bfeb2f48c	admin_aurapilates_001	2026-07-10 12:48:44.951	2026-07-10 08:26:46.527	2026-07-10 10:48:44.952
cmrdmenaa00klmn01j5mnev0r	674643a92c5289e5eb8e87f433f4d967152be12cc451f1acb3d7c7ddc8210140	admin_aurapilates_001	2026-07-09 17:27:02.814	2026-07-09 14:47:08.387	2026-07-09 15:27:02.815
cmrdjymi300kjmn01e1qj2ut6	0e56f481b0dc5851cff9591ba9073b9cd60bf910ad29876dee0d8b4db8a40dd8	admin_aurapilates_001	2026-07-09 17:58:05.193	2026-07-09 13:38:41.644	2026-07-09 15:58:05.194
cmrf9sluw00m4mn01qhi5fu47	3fb5e1c5f05e9cec5780d328a9280b4089630bc6b2cf84d32b695ba26ed4191f	admin_aurapilates_001	2026-07-10 20:31:46.852	2026-07-10 18:29:37.065	2026-07-10 18:31:46.852
cmrdoxxzw00kpmn01en6800s9	eecab4a4fb5ee7bf0e60b782ae9d992a7ae050ff1a80ebd50d3a9226ed1d3c9f	admin_aurapilates_001	2026-07-09 19:07:33.497	2026-07-09 15:58:07.965	2026-07-09 17:07:33.498
cmrgryujl00mjmn01qme8oco0	8a55a4a1b04b188d54511b59a4067ae624f5dd9815e0d1821097d0e27bc590b1	admin_aurapilates_001	2026-07-11 22:07:41.153	2026-07-11 19:46:07.521	2026-07-11 20:07:41.154
cmrkhqvvh000llq013r57zk0l	81920844e3d6eaa0a2dfed7fb6d5eb11cd8aac5c23a5648097513569c92d6101	admin_aurapilates_001	2026-07-14 14:39:47.137	2026-07-14 10:11:04.542	2026-07-14 12:39:47.138
cmridnx2h00mtmn01fgty1j15	2c6a43842dfd45c5d36fed6753794322ae2ddc48261fbcf963e210c60a69f397	cmq3zqwp1004cwmdk9plg925l	2026-07-13 00:41:15.304	2026-07-12 22:41:15.305	2026-07-12 22:41:15.305
cmrkoh3xb005alq01rcwj57tz	f1d573e5e015d074c4259e3011a9b53be447cc4513a39be260701f79be11fd22	cmq3zqwp1004cwmdk9plg925l	2026-07-14 17:45:03.412	2026-07-14 13:19:25.727	2026-07-14 15:45:03.412
cmrnr4z6200l8lq01kmuy53ym	a31cfae1fde2fb2cf3d6cf360d00133c7fb5d2602e90b778bb902d5bf8e722a7	admin_aurapilates_001	2026-07-16 19:14:50.925	2026-07-16 16:57:17.066	2026-07-16 17:14:50.926
cmrl2eeu3007clq01hg0hhrmn	d6e92393170a77a11f8f78e5fd4da1760811c6a4e978d5950b8268c694bfef43	admin_aurapilates_001	2026-07-14 21:54:14.923	2026-07-14 19:49:14.524	2026-07-14 19:54:14.924
cmrk1fmaq000flq01uw013otm	81f4e727bdb4f126df0f8987af09d6501128a44f6c184cdf6daa5fefbd5aa69c	cmq3zqwp1004cwmdk9plg925l	2026-07-14 04:34:47.703	2026-07-14 02:34:25.058	2026-07-14 02:34:47.704
cmrnmip4700ktlq01tl3gnmf0	8a365f7a7de4c1ae6b4d610bf67d3b9d92a936bead68ed45c7518a167105a526	admin_aurapilates_001	2026-07-16 18:57:14.864	2026-07-16 14:47:59.143	2026-07-16 16:57:14.865
cmrkxknkm0078lq01hhaag0vj	ab8bfbd100d27054e666bd77d8bae76fba426475d74732ee7be99af4959bb632	admin_aurapilates_001	2026-07-14 21:49:11.514	2026-07-14 17:34:07.702	2026-07-14 19:49:11.515
cmrksqder005elq01faw8jwvd	0d9ef89a88c727fdffa0a1d765c20b4a090621a4beebb51f22162f51bc92d70c	admin_aurapilates_001	2026-07-14 19:34:05.351	2026-07-14 15:18:36.387	2026-07-14 17:34:05.352
cmrktoysv0076lq0142bl66up	7fce9a3caee9bb1a5d30be97ce8f1833f20f7ebdc8c29871bb95f14d833f3031	cmq3zqwp1004cwmdk9plg925l	2026-07-14 17:49:49.846	2026-07-14 15:45:30.415	2026-07-14 15:49:49.846
cmrm1ruxr00ablq01ca9oxz1z	fe60ff34416415f0410711f7290a251fc9feb1e490de1258fd17a0dd4066cc85	admin_aurapilates_001	2026-07-15 16:45:50.644	2026-07-15 12:19:28.479	2026-07-15 14:45:50.645
cmrle9anl007elq012nww6she	73221137f2f17429486a3d65edbd0976c9a96c14cf4f62485d6d265f9927e1c9	cmq3zqwp1004cwmdk9plg925l	2026-07-15 03:21:15.293	2026-07-15 01:21:11.217	2026-07-15 01:21:15.294
cmrm7061900kjlq018ud4vvc3	1fa946999d24a9d61209feb0cd7df41613d399622cfacf7416ffbc79b119ed18	admin_aurapilates_001	2026-07-15 16:52:08.606	2026-07-15 14:45:54.189	2026-07-15 14:52:08.607
cmrmk1s9o00krlq01all2qzk8	6915df3a4f30cf1c9c987698c78774936cb35103ac48b1d2f2f16d0a76407878	cmq3zqwp1004cwmdk9plg925l	2026-07-15 22:51:12.082	2026-07-15 20:51:04.668	2026-07-15 20:51:12.083
cmroullsb00lnlq010w7lvpmr	f558ada943a6310ec89f91aef9f12a8cf43a8a305d76ee93e01ecfe73daa5b03	cmq3zqwp1004cwmdk9plg925l	2026-07-17 13:22:02.242	2026-07-17 11:21:57.899	2026-07-17 11:22:02.243
cmrp4hqox00lplq01rqg82g5z	41d746b5fc06092503e335051929a274f1405132a3eb917d0f28bd30e3697d0a	admin_aurapilates_001	2026-07-17 17:59:01.145	2026-07-17 15:58:53.793	2026-07-17 15:59:01.146
cmrw8eyel0009n301miwxc3ut	eaa0eadffe2d6ebd878552c48358e72b6ace7d4ae29a9e7a20c508f3cf843cac	admin_aurapilates_001	2026-07-22 19:38:29.841	2026-07-22 15:23:05.517	2026-07-22 17:38:29.842
cms4v42p7000lml01iymmfrqf	172bb5b99d6b28aa7c52faada9182c50e293478c3d2dc79598ad2d4d8e58d91c	admin_aurapilates_001	2026-07-28 20:22:01.079	2026-07-28 16:20:38.443	2026-07-28 18:22:01.08
cmrutjkqz0001o901kbyjfujw	1a5c874548f8635b7d117862c28f97c47f8c0ba302284ad519cdc4e619f7bbe5	admin_aurapilates_001	2026-07-21 19:42:34.212	2026-07-21 15:39:00.683	2026-07-21 17:42:34.213
cmrrmg9el00mclq01p41rpwh6	1c5bf35847d73a57f9e1d07a2ff2c1adea79853f0b90fd5bd9eb9aac61d871fc	admin_aurapilates_001	2026-07-19 11:57:11.094	2026-07-19 09:57:10.174	2026-07-19 09:57:11.095
cms50j3h00001k1017viwzadb	43b92c0112300d66cf676acbef6947ac4ac92d6f593a9f7935595e1618c31658	admin_aurapilates_001	2026-07-28 20:52:33.673	2026-07-28 18:52:17.365	2026-07-28 18:52:33.674
cmrrp8xu600melq01u3q1unqd	e2233c0e9ac9b4d696e1901b5dd9da9fbff7774b1df11b5a274a15fdd498d147	cmq3zqwp1004cwmdk9plg925l	2026-07-19 13:15:32.263	2026-07-19 11:15:27.439	2026-07-19 11:15:32.264
cmrqog2gw00lxlq01t161g1yt	66caf0e9540fed0c656dc2d79d0a85569e160b75ddb7f71db44ddd961d9a3ec8	admin_aurapilates_001	2026-07-18 20:05:42.962	2026-07-18 18:05:14.241	2026-07-18 18:05:42.963
cmrytphgx006qn301zfc9aifs	ee25b2261f59430b4d33682188fa254a5ed36d90a4414a272a3734ec22d00b5d	admin_aurapilates_001	2026-07-24 15:01:06.928	2026-07-24 10:54:41.074	2026-07-24 13:01:06.929
cmrtiz3q400o2lq01zegduxuv	8a8cb6968532bd1bf4e1b89cf2539a8676e7a80a4ae03e4cff7a01930caa5209	admin_aurapilates_001	2026-07-20 20:09:33.593	2026-07-20 17:55:23.165	2026-07-20 18:09:33.594
cmrqej01o00ltlq01ysyrj6be	a313c6d7945f70c176fa09ab406bc942dedf18769343155e60d70ead5e45d12b	cmq3zqwp1004cwmdk9plg925l	2026-07-18 15:27:40.885	2026-07-18 13:27:34.909	2026-07-18 13:27:40.886
cmrwuecf60014n301o4cvfb86	a48f874117895a1956d6242dad302188fdb86936666951a108f6cbde3022af54	cmq3zqwp1004cwmdk9plg925l	2026-07-23 03:41:06.398	2026-07-23 01:38:28.579	2026-07-23 01:41:06.398
cmrxumpku006en301neo4kugf	73c4b6deb812b6bb7a62eaba55b4e1f28053de04a1a987f99497ca8b767fe5ac	admin_aurapilates_001	2026-07-23 20:46:16.367	2026-07-23 18:32:45.055	2026-07-23 18:46:16.368
cmrxkogvt005en301t1xfjihv	d60af989b7595b7c520e360873f483a249ab3c7147b0687c3ea65ae4b2fbcc5e	admin_aurapilates_001	2026-07-23 17:54:43.757	2026-07-23 13:54:10.937	2026-07-23 15:54:43.758
cmrw57vs10003n301cnlqcmbb	38c27724cbddd9088ce069018c878dc054ebe2050f98b630ffc4348e2744c00d	admin_aurapilates_001	2026-07-22 16:48:01.744	2026-07-22 13:53:36.673	2026-07-22 14:48:01.745
cmrsdk5cz00mglq01gylo2dh9	f8fb8730c86831192b1f1127b3f5bbe52f100a9f0684f377517c7a59dd4dd702	admin_aurapilates_001	2026-07-20 00:36:03.846	2026-07-19 22:36:01.187	2026-07-19 22:36:03.847
cmrv34hmi001fo9015tleghi3	392827cac6a1fa15d8609a2ea00f9fe5b89a8a71716abc3bfb9af26738f74326	admin_aurapilates_001	2026-07-21 22:07:42.442	2026-07-21 20:07:12.954	2026-07-21 20:07:42.443
cmrri03pz00lzlq018ugpkg29	ebe518117d452111b8b122aa81e6d7f558b522529ebeac691ecee404ba83551a	admin_aurapilates_001	2026-07-19 11:57:07.514	2026-07-19 07:52:37.847	2026-07-19 09:57:07.515
cmruuz3o70005o901ydasw7q8	4e701ec80b6b1a609f4202a9dbbea0abfdc63f588ed4277bf7e599a973e0faec	cmq3zqwp1004cwmdk9plg925l	2026-07-21 18:21:44.487	2026-07-21 16:19:04.663	2026-07-21 16:21:44.488
cmruaz2cr00oalq01k5ujzxrg	64d020c12fc3b5e20731ce4dcaae5edb45d515cc9e1582702c8ee98de8c98fd9	admin_aurapilates_001	2026-07-21 11:16:51.477	2026-07-21 06:59:10.636	2026-07-21 09:16:51.478
cmrtz72jk00o8lq0184gkvlek	79d9fd771ecbc36410d0e23eb8a80ad795f01d22a779dd86f85e97cc03413d3a	cmq3zqwp1004cwmdk9plg925l	2026-07-21 03:29:32.857	2026-07-21 01:29:28.737	2026-07-21 01:29:32.857
cmrv6fb0z001ho90190gu7izj	2b22223e179e8de2e79008230ef41277914fd07fe2d4aa10cab727635323021e	cmq3zqwp1004cwmdk9plg925l	2026-07-21 23:39:43.127	2026-07-21 21:39:36.468	2026-07-21 21:39:43.128
cmruvmdhd000lo901wm734pe3	5189dcbe5a15c98c88123dc07b009d025c5baecf9d0b190aaa8e8dedfa548497	cmqnnz1kd00d6od017j56e9of	2026-07-21 19:06:52.697	2026-07-21 16:37:10.466	2026-07-21 17:06:52.698
cmrxg51yc0016n3016n6t4r8w	df7e056bbe9aebd4092c021843281a8b5eba6a2b504cf72d93256d6f2d1f1453	admin_aurapilates_001	2026-07-23 15:54:07.194	2026-07-23 11:47:06.66	2026-07-23 13:54:07.194
cmruxyjvf0017o901wg6z0wuo	31ac39f88a393244816c3c3ef1608204809bd58bb7930e2adfa27e3461795f2e	admin_aurapilates_001	2026-07-21 22:07:10.518	2026-07-21 17:42:37.851	2026-07-21 20:07:10.519
cmrw0f2rt0001n301xk1oc1vt	0ac6bc15197df748b8a93ca5adc94d4b07917e3609c0b434a959d77c13b04ef2	admin_aurapilates_001	2026-07-22 15:53:34.169	2026-07-22 11:39:14.249	2026-07-22 13:53:34.17
cmrw9zarw000bn301fk5nqmqu	cb83e7d1805ea0806ce5b02c2842f6bb85f7ae419b76ecce52cab645891e6150	admin_aurapilates_001	2026-07-22 18:08:13.039	2026-07-22 16:06:54.284	2026-07-22 16:08:13.04
cmrwd9605000fn301r60qwz9y	8eb3e533dc4d0a1d37b2279dfcd726823e33d7cd5fab181cb769ff27e7a12d7b	admin_aurapilates_001	2026-07-22 20:56:21.5	2026-07-22 17:38:33.509	2026-07-22 18:56:21.5
cmrwczyxt000dn3017tvtxj4n	cc32c96dff0cb7bd89538801b8f29c4b3ac7207eeeb7bda7e38ec53b2be71297	cmq3zqwp1004cwmdk9plg925l	2026-07-22 19:31:30.811	2026-07-22 17:31:24.45	2026-07-22 17:31:30.811
cmrz49uvc006yn301ecl9z0of	4bccb8d8be80e053af6c7c0b667d7f0f224db19809b115a8b8a7eb6140020816	admin_aurapilates_001	2026-07-24 20:50:02.516	2026-07-24 15:50:27.72	2026-07-24 18:50:02.517
cms3k5rv700gkn3011dn5curw	452458131bbaca58d64c55291c49030dcf70064a830ab29d0f53bd97d08bfbc0	admin_aurapilates_001	2026-07-27 21:01:32.042	2026-07-27 18:26:15.763	2026-07-27 19:01:32.043
cmrxw850c006mn301aecyu15c	e6b79a956bdeb771685723e01d94a1d0604d9e624f072e86dfa7311673368f0a	cmq3zqwp1004cwmdk9plg925l	2026-07-23 22:01:04.483	2026-07-23 19:17:24.445	2026-07-23 20:01:04.484
cms3fqfzv00aan301yrr0ydni	08da9eb810f9223c4711069e354465c86cd1a6dc55f157ef261ffa68aef8361c	admin_aurapilates_001	2026-07-27 20:26:12.687	2026-07-27 16:22:22.075	2026-07-27 18:26:12.688
cmryy85nr006sn301y5kurt8l	ab77d78a176a341027b1500609e779dfbcdc61790491b91e220a3cc131d1bbf4	admin_aurapilates_001	2026-07-24 17:07:44.397	2026-07-24 13:01:10.695	2026-07-24 15:07:44.398
cmrzpgio70074n3013ukj0nkz	6c8356c08eed4e0d46083fae5a33333b5d3343f207da2462c6dd3e7027e6cbca	cmq3zqwp1004cwmdk9plg925l	2026-07-25 03:44:10.087	2026-07-25 01:43:30.439	2026-07-25 01:44:10.088
cmrzaouht0070n301nko1tgs3	51cb0ab8781b6e3122de15e507490b37eb2976ed532bc24e737407ebcf3a39ec	admin_aurapilates_001	2026-07-24 20:52:06.429	2026-07-24 18:50:04.77	2026-07-24 18:52:06.429
cms2x508j007ln301e1jt0jm0	db73bd3d991ed2547b63a9c9adc9984033f5b310a2328c74dc90511e6f32bfaa	admin_aurapilates_001	2026-07-27 12:24:23.767	2026-07-27 07:41:48.788	2026-07-27 10:24:23.768
cms1jqwfj007cn301vxcvt4uq	abe5ae2806bb5f5bb3c628547702539d9631b789938ce2156f5d7ac2fcbeadde	admin_aurapilates_001	2026-07-26 13:04:21.784	2026-07-26 08:39:09.487	2026-07-26 11:04:21.785
cms0f0ofe0076n301rqqjpmiu	16742f3e73781515dff161a0949cd5647129c9ea7949ee0f24e8dcf09194f17b	cmq3zqwp1004cwmdk9plg925l	2026-07-25 15:39:17.96	2026-07-25 13:39:01.418	2026-07-25 13:39:17.961
cms37i52s00a8n301srpc6mah	90caded44767591554ddb371ad54cbf86a724c4d6d48820134c2d0ed588e057f	admin_aurapilates_001	2026-07-27 16:58:48.097	2026-07-27 12:31:57.749	2026-07-27 14:58:48.098
cms1qbrt2007gn3015mm3232v	cdcc5d606d0952e4032fa7a8dee840966a7de1f13d8d75adf015a04c95947a05	cmq3zqwp1004cwmdk9plg925l	2026-07-26 13:43:25.791	2026-07-26 11:43:20.966	2026-07-26 11:43:25.793
cms32y5b30094n301nuuvpk4k	35f15da73613cb987d06db0fc8df1b48ee9131376bf1cd275b88634903ee19db	admin_aurapilates_001	2026-07-27 14:31:53.974	2026-07-27 10:24:26.463	2026-07-27 12:31:53.975
cms4jp9us00i6n301ed5u0uwm	518e08c6209fe53ef3eeac8e8525fe1fd53f7fc80b0c40e233ec03cc10dc24d4	admin_aurapilates_001	2026-07-28 15:02:24.918	2026-07-28 11:01:12.1	2026-07-28 13:02:24.919
cms60ayff000tk101qs3t8lhw	4003dcd0ad379e6b7c4ee44e0fad61da7ba50fd7b4f34a4f02bc7cf44d4953ce	admin_aurapilates_001	2026-07-29 15:34:45.221	2026-07-29 11:33:43.755	2026-07-29 13:34:45.222
cms7nacsd004rmo014s74xjfg	f6e7642d4e15ed179a806efd24d328ef41c88cffb36662ec8db97e13eff5af0a	admin_aurapilates_001	2026-07-30 17:09:50.899	2026-07-30 15:04:53.053	2026-07-30 15:09:50.9
cms6a6vur0009mo01u1b0r4nf	0063241f1ce4003d0c5cafdba7a7212b0223d32480c7c6e0b37ee5c450e4b196	admin_aurapilates_001	2026-07-29 20:10:49.549	2026-07-29 16:10:29.955	2026-07-29 18:10:49.55
cms7mu8wf004pmo010kq1s0y0	d83ede08ae4b327f82971803f1c2a96926c8c3011983169c348b089496da63af	cmq3zqwp1004cwmdk9plg925l	2026-07-30 16:52:45.856	2026-07-30 14:52:21.519	2026-07-30 14:52:45.857
cms7izpus004jmo01f63xt0lb	f606a400b4f1114922585a9d8e0fa8e59f466ecf7502a7deab371464aefc3bca	admin_aurapilates_001	2026-07-30 17:04:50.105	2026-07-30 13:04:38.308	2026-07-30 15:04:50.105
cms7hm9bb004hmo01d09yh161	cf70ad65ba7fe650dfa3a623af72c1e9c6189a455ea69d9de9de06ed75642b78	admin_aurapilates_001	2026-07-30 14:27:52.842	2026-07-30 12:26:10.727	2026-07-30 12:27:52.843
cms64mocs005fk101bzlm45ym	d429ad07e4f94d1be630f646f7180115c2ef707c4ac11efb354a6e0d945614ef	admin_aurapilates_001	2026-07-29 18:10:27.185	2026-07-29 13:34:49.036	2026-07-29 16:10:27.186
cms5vl47e0007k1013xtg7ab5	4de509b5e13f68748324d18c9fdb8445ba6422573e2c36a4dfff09d0d2633a27	admin_aurapilates_001	2026-07-29 13:33:40.557	2026-07-29 09:21:39.722	2026-07-29 11:33:40.558
cms4ui8r0000dml014acpaplc	20d6d9663a5b3f3cf98f7089fae987877619a2529a3ec6675eae84b91a935210	admin_aurapilates_001	2026-07-28 20:48:49.333	2026-07-28 16:03:39.853	2026-07-28 18:48:49.334
cms4o17zh00kmn301dpkyoesn	22b0439684413a16021fecdd3c1c840ae3f688d7678562a8cbe0491fc1bb2324	admin_aurapilates_001	2026-07-28 17:03:32.486	2026-07-28 13:02:28.014	2026-07-28 15:03:32.487
cms7en890003hmo01alifnm7w	581c50a890e7403c46ad2f4c9ae401dfa1e2fc08a230844edc99efd76552eb80	admin_aurapilates_001	2026-07-30 15:04:36.474	2026-07-30 11:02:57.156	2026-07-30 13:04:36.475
cms6fb1s3001vmo01k6ribogp	cc28c3213e61964ee8282a44de64e42cf2e3a247f462a9bbb2733ea4dcf8ab6c	cmq3zqwp1004cwmdk9plg925l	2026-07-29 20:34:36.148	2026-07-29 18:33:42.34	2026-07-29 18:34:36.149
cms6ifqae0023mo014zx7ztg5	26c94ad86962968c8e9957f9cbca2e57fe8033945717e2dd96b6d382b3dba8eb	admin_aurapilates_001	2026-07-29 22:01:28.444	2026-07-29 20:01:19.574	2026-07-29 20:01:28.445
\.


--
-- Data for Name: studio_planning_period; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.studio_planning_period (id, "bookingWindow", "periodStartDate", "draftPeriodStartDate", "draftBookingWindow", "draftPublishAt", "updatedAt", "draftPublicationPhase", "draftSundayPublishAt", "lateCancellationRuleEnabled", "memberReservationOpenTime", "memberReservationCloseTime") FROM stdin;
singleton	WEEKLY	2026-07-27	2026-08-03	WEEKLY	2026-08-01 13:00:00	2026-07-27 07:41:49.105	SCHEDULED	2026-08-02 13:00:00	t	08:00	22:00
\.


--
-- Data for Name: studio_planning_period_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.studio_planning_period_archive (id, "bookingWindow", "periodStartDate", "periodEndDate", "archivedAt") FROM stdin;
cmq3zqvwr0000wmdk9jgadbt3	WEEKLY	2026-05-18	2026-05-24	2026-06-07 16:23:10.347
cmq3zqvwx0001wmdk2degbyge	WEEKLY	2026-05-25	2026-05-31	2026-06-07 16:23:10.353
cmq3zqvx20002wmdkf6e61som	WEEKLY	2026-06-01	2026-06-07	2026-06-07 16:23:10.358
cmq3zqvx50003wmdkl6qsexlx	WEEKLY	2026-06-08	2026-06-14	2026-06-07 16:23:10.361
cmqnsx6ep00dqod01hb5x6wlq	WEEKLY	2026-06-15	2026-06-21	2026-06-21 13:07:30.098
cmqob4cc400dvod0128jfr6s8	WEEKLY	2026-06-22	2026-06-28	2026-06-21 21:36:57.461
cmr8gwdjp00bpmm01g1zmfq98	WEEKLY	2026-06-29	2026-07-05	2026-07-06 00:14:06.997
cmrihiyaw00mwmn01oyu3xydr	WEEKLY	2026-07-06	2026-07-12	2026-07-13 00:29:22.088
cmrsh0dot00mhlq014lk3c894	WEEKLY	2026-07-13	2026-07-19	2026-07-20 00:12:37.326
cms2p3q27007jn301uk5agp92	WEEKLY	2026-07-20	2026-07-26	2026-07-27 03:56:52.016
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, image, password, role, "createdAt", "updatedAt") FROM stdin;
admin_aurapilates_001	\N	aurapilates26@gmail.com	\N	$2b$10$ifv9UAHUutxhn9jMA1anuO50xk7KZyQROJeEDlpJk5lagCek0ff2a	ADMIN	2026-05-09 18:56:01.811	2026-05-09 18:56:01.811
cmpcfa7e200d7p401ky24jgjo	Mariem Khemakhem	maryam.khemakhem@gmail.com	\N	\N	MEMBRE	2026-05-19 07:20:33.002	2026-05-19 07:20:33.002
cmp6ywfd90053p401rddw3c3f	Salma El Ayech	salmaayech@gmail.com	\N	\N	MEMBRE	2026-05-15 11:43:05.421	2026-05-15 13:58:34.596
cmp580zx0006cl40175bb94e1	Atidel Jridi	jridiatidel2023@gmail.com	\N	\N	MEMBRE	2026-05-14 06:23:02.869	2026-05-15 05:25:15.509
cmp5cjt05006ql401yinisshy	Radhia Dridi	radhia@gmail.com	\N	\N	MEMBRE	2026-05-14 08:29:38.837	2026-05-15 05:31:20.979
cmp5d9vn3006xl401ftwcehmg	Wided Jazi	widedjazi@gmail.com	\N	\N	MEMBRE	2026-05-14 08:49:55.312	2026-05-15 05:32:38.017
cmp5e2po3007cl4010qyu6nhy	Neila Azzabi	neilaazzabi@gmail.com	\N	\N	MEMBRE	2026-05-14 09:12:20.596	2026-05-19 09:35:17.717
cmp5doqci0077l4018392lf4p	Sarah Laouini	sarahlaouini6@gmail.com	\N	\N	MEMBRE	2026-05-14 09:01:28.29	2026-05-15 05:35:02.529
cmp71pbmh005gp401j2677wm1	Ines Dhahbi	inesdhahbi21@gmail.com	\N	\N	MEMBRE	2026-05-15 13:01:32.826	2026-05-15 13:58:41.428
cmp5i45no0008p401vpemjma9	Sana Zenati	sanazenati@outlook.fr	\N	\N	MEMBRE	2026-05-14 11:05:26.436	2026-05-15 05:38:40.499
cmp5lkgas000dp401gp6bp1nx	Yousra Aouaifia	yousraaouaifia@gmail.com	\N	\N	MEMBRE	2026-05-14 12:42:05.572	2026-05-15 05:39:40.541
cmp5nv1lf000kp401s8d56d1b	Amal Mejri	amalmejri@gmail.com	\N	\N	MEMBRE	2026-05-14 13:46:18.963	2026-05-15 05:41:08.146
cmp5qutpa0013p401ab1e3jq6	Ons Ben Amor	ons.benamor@esprit.tn	\N	\N	MEMBRE	2026-05-14 15:10:07.583	2026-05-15 05:42:12.224
cmp5qzr8d0018p401zxty1340	Insaf Ben Amor	insafbenamor009@gmail.com	\N	\N	MEMBRE	2026-05-14 15:13:57.661	2026-05-15 05:43:29.634
cmp5r29er001dp401lbpf1cy9	Nada Ben Mabrouk	nada.bm20@gmail.com	\N	\N	MEMBRE	2026-05-14 15:15:54.531	2026-05-15 05:44:32.544
cmp5r6eq8001ip40131e05rq2	Sara Gannoune	gannounesarra@gmail.com	\N	\N	MEMBRE	2026-05-14 15:19:08.048	2026-05-15 05:45:25.322
cmp6maci4002rp4013sll2plf	Raoudha Fathallah	mechrierij@gmail.com	\N	\N	MEMBRE	2026-05-15 05:49:59.885	2026-05-15 05:49:59.885
cmp6me3ms002wp401gdm4qqfc	Dorsaf Aissaoui	dorsaf.aissaoui@outlook.com	\N	\N	MEMBRE	2026-05-15 05:52:55.012	2026-05-15 05:52:55.012
cmp6mh9ml0031p401jrc5hmop	Nada Daghmouri	nada.daghmouri@gmail.com	\N	\N	MEMBRE	2026-05-15 05:55:22.749	2026-05-15 05:55:22.749
cmp6mkxvr0036p401m9m0r0fi	Ayda Boudali Yazidi	boudali.ayda@gmail.com	\N	\N	MEMBRE	2026-05-15 05:58:14.152	2026-05-15 05:58:14.152
cmp6mqu0y003bp401m8abqjit	Khansa Yazidi	yazidi.khansa@gmail.com	\N	\N	MEMBRE	2026-05-15 06:02:49.09	2026-05-15 06:02:49.09
cmp6mujhd003gp4018p4jm1lt	Mariem Gassem	mariem.gassem@gmail.com	\N	\N	MEMBRE	2026-05-15 06:05:42.05	2026-05-15 06:05:42.05
cmp6mxgti003lp401l2wssly5	Yosr Mejri	yosrmejri@gmail.com	\N	\N	MEMBRE	2026-05-15 06:07:58.566	2026-05-15 06:07:58.566
cmp6n0r9d003qp401d5d0y8l4	Cherryne Ben Youssef	cherryneabrous@gmail.com	\N	\N	MEMBRE	2026-05-15 06:10:32.066	2026-05-15 06:10:32.066
cmp6n445o003vp401iy0klavg	Asma Cherni	cherni.asma.ph@gmail.com	\N	\N	MEMBRE	2026-05-15 06:13:08.749	2026-05-15 06:13:08.749
cmp6n6c320040p401wxpha3aw	Imen Lachheb	imen.lachheb@live.fr	\N	\N	MEMBRE	2026-05-15 06:14:52.334	2026-05-15 06:14:52.334
cmp6ndov2004ap401wb0f98g7	KENZA Kenza	6ykenza1@gmail.com	\N	\N	MEMBRE	2026-05-15 06:20:35.487	2026-05-15 06:20:35.487
cmpdskdb900dyp401c0o1z5h7	Fayrouz Ktari	fayrouz.ktari@decatlon.com	\N	\N	MEMBRE	2026-05-20 06:20:08.421	2026-05-20 06:20:08.421
cmp6tmko1004pp401sqixcbc5	Ones Mzoughi	onesmzoughi78@gmail.com	\N	\N	MEMBRE	2026-05-15 09:15:27.649	2026-05-15 09:15:27.649
cmp6vndpf004wp401rn3o2ggy	Arij Mechri	erijmechri@gmail.com	\N	\N	MEMBRE	2026-05-15 10:12:04.515	2026-05-15 10:12:04.515
cmps12dpx00htp401ia7ozgna	Salwa Dellai	wa03880@gmail.com	\N	\N	MEMBRE	2026-05-30 05:26:52.15	2026-05-30 05:26:52.15
cmp76c7ie005tp401y4r5qxth	Myriam Hamzaoui	myriam.hamzaoui92@gmail.com	\N	\N	MEMBRE	2026-05-15 15:11:19.047	2026-05-16 05:21:23.492
cmp80zidq006lp401iat2y4ek	Yasmine Jouini	yassoujn@gmail.com	\N	\N	MEMBRE	2026-05-16 05:29:14.703	2026-05-16 05:29:14.703
cmp87ym1y006wp401gp258iqb	Chaima Mahjoub	chaimamahjoub@gmail.com	\N	\N	MEMBRE	2026-05-16 08:44:30.119	2026-05-16 08:44:30.119
cmp88f7g60071p401mcl0m6dh	Latifa Dhifi	latifa.dhifi.ch@gmail.com	\N	\N	MEMBRE	2026-05-16 08:57:24.343	2026-05-16 08:57:24.343
cmp8b0p5k0076p40139qdxt36	Lamia Ben nacef	lamiabennacef@gmail.com	\N	\N	MEMBRE	2026-05-16 10:10:06.296	2026-05-16 10:10:06.296
cmp9jyb2j009rp401ibj6rggk	Maryem Oueslaty	oueslatymaryem@gmail.com	\N	\N	MEMBRE	2026-05-17 07:07:57.452	2026-05-17 07:07:57.452
cmp9l6t2a00aap401y7mie04j	Chayma Ryabi	chaymaraybiiii@gmail.com	\N	\N	MEMBRE	2026-05-17 07:42:33.634	2026-05-17 07:42:33.634
cmp5dd5sb0072l401r9zwq188	Intissar Bouassida	intissar@gmail.com	\N	\N	MEMBRE	2026-05-14 08:52:28.428	2026-05-17 08:19:24.942
cmp9muoo400ajp4015rgmk7n8	Islem Ounissi	iss@gmail.com	\N	\N	MEMBRE	2026-05-17 08:29:07.301	2026-05-17 08:29:07.301
cmp9n16yf00aop40107k8vbbn	Alaa Boulares	alaaboulares@gmail.com	\N	\N	MEMBRE	2026-05-17 08:34:10.935	2026-05-17 08:34:10.935
cmp9oxt9t00atp4015tbn38vi	Soumaya Grami	gramisoumaya@gmail.com	\N	\N	MEMBRE	2026-05-17 09:27:32.465	2026-05-17 09:27:32.465
cmp9p95jg00b0p401pol3aoin	Rania Zarred	zarredrania@gmail.com	\N	\N	MEMBRE	2026-05-17 09:36:21.581	2026-05-17 09:36:21.581
cmp9pbn9i00b5p401hszoe9y3	Anissa Ben Aziza	anissabenaziza16@gmail.com	\N	\N	MEMBRE	2026-05-17 09:38:17.862	2026-05-17 09:38:17.862
cmp9u530d00bgp401ddqnere4	Mouna werghemi	mounawerghemi@gmail.com	\N	\N	MEMBRE	2026-05-17 11:53:09.757	2026-05-17 11:53:42.479
cmp9uagwx00blp401euphsr30	Fatma Mgazzen	fatmamgazzen@gmail.com	\N	\N	MEMBRE	2026-05-17 11:57:21.057	2026-05-17 11:57:21.057
cmpazudlc00bwp4012b3nnemi	Amel Saidi	amel2.saidi@gmail.com	\N	\N	MEMBRE	2026-05-18 07:20:34.128	2026-05-18 07:20:34.128
cmpb23ldn00c5p401s9u4deej	Sarra Mnaffedh	sarramnafedh@gmail.com	\N	\N	MEMBRE	2026-05-18 08:23:43.355	2026-05-18 08:23:43.355
cmpb26l0800cap401w9jcvtwf	Soumaya Mokni	maknisoumaya@hotmail.fr	\N	\N	MEMBRE	2026-05-18 08:26:02.84	2026-05-18 08:26:02.84
cmpbet54n00cnp401vb4afbh2	Syrine saidani	saidanisyrine@gmail.com	\N	\N	MEMBRE	2026-05-18 14:19:30.744	2026-05-18 14:19:30.744
cmpcdicol00cyp401nm8u0x8b	Marwa Said	drsaid.marwa@gmail.com	\N	\N	MEMBRE	2026-05-19 06:30:53.878	2026-05-19 06:30:53.878
cmpfdk63000e9p401je5uh5pf	Islem Ben othmen	islembenothmen@gmail.com	\N	\N	MEMBRE	2026-05-21 08:55:37.164	2026-05-21 08:55:51.605
cmpfpx1db00eip4013hnojefx	Malika Dhifallah	malika.dhifallah@gmail.com	\N	\N	MEMBRE	2026-05-21 14:41:32.975	2026-05-21 14:41:32.975
cmph5kmv100f5p401inglcu4l	Sana Zaiane	s.zaiane19@gmail.com	\N	\N	MEMBRE	2026-05-22 14:47:34.334	2026-05-22 14:47:34.334
cmpi6ban100fgp401n2uywhix	Mariem Bouslama	mariembouslama@gmail.com	\N	\N	MEMBRE	2026-05-23 07:56:04.382	2026-05-23 07:56:04.382
cmpmhc40300h7p401aakuvzsm	Siwar Dhaouadi	siwardhaouadi@gmail.com	\N	\N	MEMBRE	2026-05-26 08:15:42.916	2026-05-26 08:15:42.916
cmpqvd4po00hip4011mkxbv8b	Marwa Hmaidi	hmaydimarwa@gmail.com	\N	\N	MEMBRE	2026-05-29 09:59:29.82	2026-05-29 09:59:29.82
cmpux8mfu00i2p401993stlih	Bchira Zaidi	bchirazaidi@gmail.com	\N	\N	MEMBRE	2026-06-01 06:03:03.45	2026-06-01 06:03:03.45
cmpuxbc7800i7p401z5zf232x	Asma Laamari	asmalabben1983@gmail.com	\N	\N	MEMBRE	2026-06-01 06:05:10.148	2026-06-01 06:05:10.148
cmpuxgfvm00icp4019ps3s4gj	Olfa Habibi	olfahabibi19.02@gmail.com	\N	\N	MEMBRE	2026-06-01 06:09:08.194	2026-06-01 06:09:08.194
cmpuxpn4j00imp40189fygsiv	Balsem Melki	balsem.elmelki@gmail.com	\N	\N	MEMBRE	2026-06-01 06:16:17.492	2026-06-01 06:16:17.492
cmpuxyh5v00irp401zuf4apy7	Najiba Boulajfene	najiba.boulajfene@gmail.com	\N	\N	MEMBRE	2026-06-01 06:23:09.668	2026-06-01 06:23:09.668
cmpv004tj00iwp401a7z3yawg	EYA Saadaoui	eyasaadaoui@gmail.com	\N	\N	MEMBRE	2026-06-01 07:20:26.215	2026-06-01 07:20:26.215
cmpvehn3a00j5p401uht3iji1	Neila Mzoughi	neyla.mzoughi@icloud.com	\N	\N	MEMBRE	2026-06-01 14:05:57.67	2026-06-01 14:05:57.67
cmpwo5qcd00jep4014eplovcx	Jihen Beldi	jihen.beldi@gmail.com	\N	\N	MEMBRE	2026-06-02 11:24:24.349	2026-06-02 11:24:24.349
cmpxt9h9c00jlp401uffhtnzu	myriam Fayach	myriamf.46120@gmail.com	\N	\N	MEMBRE	2026-06-03 06:35:03.456	2026-06-03 06:35:03.456
cmpxtbvam00jqp401dvpzjs0p	Afef Garfa	garfaafef@gmail.com	\N	\N	MEMBRE	2026-06-03 06:36:54.958	2026-06-03 06:36:54.958
cmpxtdnhm00jvp401h8ebs106	Hanen Gades	hanengades@gmail.com	\N	\N	MEMBRE	2026-06-03 06:38:18.155	2026-06-03 06:38:18.155
cmpuxlbuu00ihp4018gatfkcs	Marwa Gammoudi	marwagammadi@gmail.com	\N	\N	MEMBRE	2026-06-01 06:12:56.262	2026-06-30 16:01:20.541
cmpxtfc9x00k0p401f0dp40ed	Imen Melliti	imenmelliti@gmail.com	\N	\N	MEMBRE	2026-06-03 06:39:36.934	2026-06-03 06:39:36.934
cmpxths4s00k5p4016s9mk2l5	Salma Ben Hamda	salmabenhamda@gmail.com	\N	\N	MEMBRE	2026-06-03 06:41:30.796	2026-06-03 06:41:30.796
cmpya6nuq00kep401g1ln6nmz	Hayathem Bouchagra	h.bouchagra@yahoo.fr	\N	\N	MEMBRE	2026-06-03 14:28:45.506	2026-06-03 14:28:45.506
cmpzh61qx00knp4019i8v2fv6	Rakia Ben Taieb	rakiabentaieb@gmail.com	\N	\N	MEMBRE	2026-06-04 10:32:00.345	2026-06-04 10:32:00.345
cmpzp6lel00kup401is12fvrg	Nadia Mezzi	mezzinadia@yahoo.fr	\N	\N	MEMBRE	2026-06-04 14:16:22.749	2026-06-04 14:16:22.749
cmq251rus00l3p401y969vm1x	Emna Ouerfelli	emna.ouerf@gmail.com	\N	\N	MEMBRE	2026-06-06 07:16:04.036	2026-06-06 07:16:04.036
cmq3zqwp1004cwmdk9plg925l	Direction	superadmin@gmail.com	\N	$2b$10$0AdNf4HMe3TVuSIWY7s/FOGXAoSaDaX1OqXL2EwkG/tPVGhvCSyre	SUPER_ADMIN	2026-06-07 16:23:11.365	2026-06-07 16:23:11.365
cmq254vco00l8p401ji9ij0t9	Ghofrane Mahfoudhi	ghofranemh111@gmail.com	\N	\N	MEMBRE	2026-06-06 07:18:28.536	2026-06-14 12:58:42.37
cmp6n9pya0045p401lai2ein7	Molka Kehia	kehiamollea@gmail.com	\N	\N	MEMBRE	2026-05-15 06:17:30.274	2026-06-20 16:15:34.275
cmqnjhe4300c5od01notfcgfh	Syrine Hmida	cirina_hmida@yahoo.fr	\N	\N	MEMBRE	2026-06-21 08:43:17.044	2026-06-21 08:43:17.044
cmqnjmmn700ccod01sy50dle9	Fatma Zrelli	mghirline@yahoo.fr	\N	\N	MEMBRE	2026-06-21 08:47:21.38	2026-06-21 08:48:23.623
cmqnjvfws00cjod01j8b39tpm	Eya Mghirbi	mghirbie@yahoo.fr	\N	\N	MEMBRE	2026-06-21 08:54:12.557	2026-06-21 08:54:39.986
cmqnlllpi00cqod01m5nvfbwh	Wissal Bouassida	bouassidawissal@gmail.com	\N	\N	MEMBRE	2026-06-21 09:42:32.742	2026-06-21 09:42:32.742
cmqnlovfj00cxod011y0ecdft	Hanen Dorra Bouchaira	bouchairahanendorra@hotmail.com	\N	\N	MEMBRE	2026-06-21 09:45:05.312	2026-06-21 09:45:05.312
cmqnnz1kd00d6od017j56e9of	Lamia Besbes	lamiabsbs@gmail.com	\N	\N	MEMBRE	2026-06-21 10:48:59.053	2026-06-21 10:48:59.053
cmqno2ywn00ddod01rdazx3wr	Senda Ayedi	senda.ayedi@yahoo.fr	\N	\N	MEMBRE	2026-06-21 10:52:02.231	2026-06-21 10:52:02.231
cmqp0fvco00dyod01a72g05r7	Ghada Chaabane	ghadachaabane@gmail.com	\N	\N	MEMBRE	2026-06-22 09:25:45.72	2026-06-22 09:25:45.72
cmqp1dmlm00e5od011cautbd2	Eya Rebai	eyarebai@gmail.com	\N	\N	MEMBRE	2026-06-22 09:52:00.683	2026-06-22 09:52:00.683
cmqp1r6ny00ecod01b9u7qur4	Eya aouissi	eyaaouissi@gmail.com	\N	\N	MEMBRE	2026-06-22 10:02:33.214	2026-06-22 10:02:33.214
cmqp2at3b00ejod01o1jbpkve	Imen Aouini	imene.aouini@gmail.com	\N	\N	MEMBRE	2026-06-22 10:17:48.744	2026-06-22 10:17:48.744
cmqp3lgcn00ezod01l937x3qh	Arij Ben Hamadi	arij.benhammadi@gmail.com	\N	\N	MEMBRE	2026-06-22 10:54:05.063	2026-06-22 10:54:05.063
cmqp3ozqg0002s0017gspny25	Farah Melliti	farahmelliti@gmail.com	\N	\N	MEMBRE	2026-06-22 10:56:50.152	2026-06-22 10:56:50.152
cmqp3qkb40009s001pwff74h4	Mounira Mcharek	mounira.mcharek@gmail.com	\N	\N	MEMBRE	2026-06-22 10:58:03.473	2026-06-22 10:58:03.473
cmqp3rvfs000gs001vl1pbpld	Fatma Ben Rhouma	benrhoumafatma@gmail.com	\N	\N	MEMBRE	2026-06-22 10:59:04.552	2026-06-22 10:59:04.552
cmqp4ky030000lk01du8ahjiz	Malek Abdelli	malekabdelli22@gmail.com	\N	\N	MEMBRE	2026-06-22 11:21:40.899	2026-06-22 11:21:40.899
cmqp4mhgb0007lk01wcbn5zgl	Nour Lajnef	nourlajnef@gmail.com	\N	\N	MEMBRE	2026-06-22 11:22:52.764	2026-06-22 11:22:52.764
cmqp4nucb000elk011gita27e	Eya Amri	amrieya.14@gmail.com	\N	\N	MEMBRE	2026-06-22 11:23:56.123	2026-06-22 11:23:56.123
cmqpbg2wu000rlk01g9oop8lr	Sarra Sarra	sarrasarra@gmail.com	\N	\N	MEMBRE	2026-06-22 14:33:51.295	2026-06-22 14:33:51.295
cmqpbic6x000ylk018sgob32h	Assya Rejaibi	assyarejaibi7@gmail.com	\N	\N	MEMBRE	2026-06-22 14:35:36.633	2026-06-22 14:35:36.633
cmqpbli4s0015lk0157urnfyj	Salma Ghdemsi (dhifallah)	salmaghdemsi@gmail.com	\N	\N	MEMBRE	2026-06-22 14:38:04.3	2026-06-22 14:38:04.3
cmqpbn2rg001clk01ip3c6q1x	Rim Ben amara	rimbenamara@gmail.com	\N	\N	MEMBRE	2026-06-22 14:39:17.693	2026-06-22 14:39:17.693
cmqqjfnws001kp901bp7rvj2h	Farah Mtibaa	farahmtibaa86@gmail.com	\N	\N	MEMBRE	2026-06-23 11:05:14.956	2026-06-23 11:05:14.956
cmqrvr7rf000dsc01jb52sobm	Hela Friga	coach.cmq407j3i0002wmko2bzj8hjy@coaches.aurapilates.local	\N	\N	COACH	2026-06-24 09:37:55.467	2026-06-24 09:37:55.467
cmqp3jmst00esod01wqh4lcof	Cyrine Gassa	cyrinegassa@gmail.com	\N	\N	MEMBRE	2026-06-22 10:52:40.11	2026-06-25 09:20:35.17
cmqtdvery00iho7014i79virw	Nourhene Dhif	coach.cmq40bvbx0005wmkonbu4odyv@coaches.aurapilates.local	\N	\N	COACH	2026-06-25 10:52:50.447	2026-06-25 10:52:50.447
cmqur46x900jlo701y05c7e99	Fatma Msekni	fatmamsekni@gmail.com	\N	\N	MEMBRE	2026-06-26 09:51:21.358	2026-06-26 09:51:21.358
cmqur9js600jso701w738qrk1	Leila Ben Ammar	leilabenammar@gmail.com	\N	\N	MEMBRE	2026-06-26 09:55:31.302	2026-06-26 09:55:31.302
cmqw8khuc001jmg01oct3dxj2	Oumayma Kassem	oumaima.kassem@gmail.com	\N	\N	MEMBRE	2026-06-27 10:47:41.653	2026-06-27 10:47:41.653
cmqw8m90h001qmg01l0kos78x	Lobna Jaouadi	jaouadilobna@gmail.com	\N	\N	MEMBRE	2026-06-27 10:49:03.521	2026-06-27 10:49:03.521
cmqw8njsc001xmg01edu55jji	Siwar Triki	siwartriki4@gmail.com	\N	\N	MEMBRE	2026-06-27 10:50:04.141	2026-06-27 10:50:04.141
cmr0e8q3j0099mg0101z9g9mo	Boutheina Zine El Abidine	boutheina.bengamra@gmail.com	\N	\N	MEMBRE	2026-06-30 08:37:34.879	2026-06-30 08:37:34.879
cmr3dno9v008tmm01ehx8fsb6	Yasmine Turki	yasmineturki2003@gmail.com	\N	\N	MEMBRE	2026-07-02 10:44:31.268	2026-07-02 10:44:31.268
cmqpbpjdb001jlk01sd0qkvke	Ines Darraji	darrajiines1897@gmail.com	\N	\N	MEMBRE	2026-06-22 14:41:12.528	2026-07-02 10:45:01.975
cmr638xlt00abmm014n1r6u6i	Sabrine Jebali	jbelisabrine019@gmail.com	\N	\N	MEMBRE	2026-07-04 08:16:25.889	2026-07-04 08:16:25.889
cmr91oeqc00dtmm01z36uw66q	Nour Berrima	berrimanour4@gmail.com	\N	\N	MEMBRE	2026-07-06 09:55:47.221	2026-07-06 09:55:47.221
cmr92ygso00e2mm011de59ke3	Rania Dhaoui	dhaouirania31@gmail.com	\N	\N	MEMBRE	2026-07-06 10:31:36.073	2026-07-06 10:31:36.073
cmqpbrpkl001qlk01226gbtar	Arij Jouini	jouiniarij1@gmail.com	\N	\N	MEMBRE	2026-06-22 14:42:53.878	2026-07-06 14:36:44.276
cmqqifegk000ep9016ph72lqn	Molka Gardouhi	molkagardouhi@gmail.com	\N	\N	MEMBRE	2026-06-23 10:37:03.093	2026-07-06 14:41:28.158
cmqqimbo1000zp901igixi9wf	Nadya Ayed	nadyahanenfaeza@gmail.com	\N	\N	MEMBRE	2026-06-23 10:42:26.066	2026-07-06 14:42:30.867
cmqqija82000sp901eerptodo	Ines Ben Messeoud	ines.bm195@gmail.com	\N	\N	MEMBRE	2026-06-23 10:40:04.227	2026-07-06 14:44:03.176
cmqqihcm4000lp901cxctktij	Amira Kadri	amirakadri73@gmail.com	\N	\N	MEMBRE	2026-06-23 10:38:34.013	2026-07-06 14:44:49.967
cmqqio1g40016p901zccog6td	Emna Korbi	emna.korbi@outlook.com	\N	\N	MEMBRE	2026-06-23 10:43:46.132	2026-07-09 09:20:40.873
cmqqipr54001dp901ynurss0c	Asma Korbi	asmakorbi@gmail.com	\N	\N	MEMBRE	2026-06-23 10:45:06.088	2026-07-09 09:21:18.714
cmqw8ec6n000ymg01g6yuxtgo	Wissal Ouerfelli	ouerfelliwissal@gmail.com	\N	\N	MEMBRE	2026-06-27 10:42:54.383	2026-07-09 09:22:00.293
cmqw8ha3n0015mg01yvnb3t2q	Rawene Ben Romdhane	raouenbrm@gmail.com	\N	\N	MEMBRE	2026-06-27 10:45:11.651	2026-07-09 09:22:46.302
cmqw8ils9001cmg01dtkcr3sm	Nour Mraydi	nourmraydi19@gmail.com	\N	\N	MEMBRE	2026-06-27 10:46:13.45	2026-07-09 09:23:56.247
cmqz4i19v0036mg018dt8npt9	Cyrine Zaouali	zaoualicyrine1@gmail.com	\N	\N	MEMBRE	2026-06-29 11:17:06.932	2026-07-09 09:24:27.65
cmqz4ky2r003dmg01mfeq62oj	Jihen Safi	jihensafi@gmail.com	\N	\N	MEMBRE	2026-06-29 11:19:22.755	2026-07-09 09:25:52.919
cmr1tvvf5001dmm012klv207a	Najla Jallouli	j.najla@stram.tn	\N	\N	MEMBRE	2026-07-01 08:43:15.281	2026-07-09 09:26:29.402
cmr3dc13x008kmm01k83assv2	Oumaya Zenati	omaya.zenati300187@gmail.com	\N	\N	MEMBRE	2026-07-02 10:35:28.03	2026-07-09 09:27:08.897
cmr54gw0o009mmm01tgu8g7am	Syrine Mansour	cyrine.mansour14@gmail.com	\N	\N	MEMBRE	2026-07-03 16:02:50.52	2026-07-09 09:27:43.164
cmr66x4vj00asmm016p7t2k8n	Chahd Soussi	c.soussi11@gmail.com	\N	\N	MEMBRE	2026-07-04 09:59:13.904	2026-07-09 09:29:47.5
cmr66zk2300b1mm01l8latt7f	Sirine Amri	sirineamri243@gmail.com	\N	\N	MEMBRE	2026-07-04 10:01:06.891	2026-07-09 09:30:34.123
cmr6940re00bcmm01bhxg4a2c	Fatma Ben Ghorbel	fatmabenghorbel@gmail.com	\N	\N	MEMBRE	2026-07-04 11:00:34.394	2026-07-09 09:31:08.321
cmr91dvvi00dbmm0158qbt1k2	Yasmine Dallegi	yasminedallegi@gmail.com	\N	\N	MEMBRE	2026-07-06 09:47:36.223	2026-07-09 09:31:53.118
cmr91fzq600dkmm01chaov4hu	Rym Boulaabi	rymboulaabi@gmail.com	\N	\N	MEMBRE	2026-07-06 09:49:14.526	2026-07-09 09:32:42.263
cmqrwntpw0014sc013h57c16l	Fatma Hichri	fatmahichri@gmail.com	\N	\N	MEMBRE	2026-06-24 10:03:16.917	2026-07-23 12:33:34.098
cmqzcgki1006smg01pw4smf4s	Lamia Abdelkefi	lamiaabdelkefi@gmail.com	\N	\N	MEMBRE	2026-06-29 14:59:55.466	2026-07-23 13:07:51.571
cmqpbt84k001xlk012gwz0hln	Hiba Jouini	hibajouini64@gmail.com	\N	\N	MEMBRE	2026-06-22 14:44:04.58	2026-07-06 14:35:46.521
cmrbukuwa0002mn011dfo307c	mayssa saidi	mayssasaidi@gmail.com	\N	\N	MEMBRE	2026-07-08 09:00:22.763	2026-07-08 09:00:22.763
cmrbumgk3000bmn01v2b106eh	Sarra Mouelhi	sarramouelhi@gmail.com	\N	\N	MEMBRE	2026-07-08 09:01:37.491	2026-07-08 09:01:37.491
cmrdaeve60023mn01etst11uw	Sirine Bargaoui	sirinebargaoui@gmail.com	\N	\N	MEMBRE	2026-07-09 09:11:23.502	2026-07-09 09:11:23.502
cmrdagpsy002cmn01n2nwpyc0	Fatma Ghorbel	fatmaghorbel1999@gmail.com	\N	\N	MEMBRE	2026-07-09 09:12:49.571	2026-07-09 09:12:49.571
cmrdaicj4002lmn01ah7rqa7c	Eya lamis Rourou	eyarourou008@gmail.com	\N	\N	MEMBRE	2026-07-09 09:14:05.68	2026-07-09 09:14:05.68
cmrbw6y2a0012mn01hgp2x00r	Nabiha KHMIRI	neilakhemiri@gmail.com	\N	\N	MEMBRE	2026-07-08 09:45:32.915	2026-07-09 09:35:11.536
cmrbwaec4001bmn01b0woh2r2	Siwar Ben Abdallah	siwarbenabdallah@saida-groupe.com	\N	\N	MEMBRE	2026-07-08 09:48:13.972	2026-07-09 09:35:55.067
cmrdadhtl001umn01yombq053	Zeineb Sinaoui	jemlibessima@gmail.com	\N	\N	MEMBRE	2026-07-09 09:10:19.257	2026-07-09 09:36:26.593
cmrdrcgar00ksmn01lusa1csc	Chahrazed Zrelli	chahrazrelly@hotmail.fr	\N	\N	MEMBRE	2026-07-09 17:05:24.099	2026-07-09 17:07:31.107
cmrf1sef600l9mn011g74p7bq	Amira Garfa	garfaamira@gmail.com	\N	\N	MEMBRE	2026-07-10 14:45:30.498	2026-07-10 14:46:09.945
cmrf1usf900limn01nbb10ddy	Cyrine Brinsi	brinsssicyrine@gmail.com	\N	\N	MEMBRE	2026-07-10 14:47:21.958	2026-07-10 14:47:21.958
cmraefj5100hxmm014te2jndx	Ceyda Mazouz	mazouzceyda@gmail.com	\N	\N	MEMBRE	2026-07-07 08:40:34.214	2026-07-10 18:08:42.112
cmrfb3yil00m5mn01ektevnld	Nadine Bouchiba	nadinebouchiba008@gmail.com	\N	\N	MEMBRE	2026-07-10 19:06:26.301	2026-07-10 19:06:26.301
cmrkjma2f000ylq01frbmz6c6	Samar Kabissa	samarkabissa@gmx.fr	\N	\N	MEMBRE	2026-07-14 11:03:28.887	2026-07-14 11:03:28.887
cmrlvcqto007hlq01ec3f419o	Syrine Ben Haj Ahmed	belhajsyrine95@gmail.com	\N	\N	MEMBRE	2026-07-15 09:19:45.613	2026-07-15 09:19:45.613
cmrnml84900kulq01ofv62464	Samia Zinelabidine	zainsamia@gmail.com	\N	\N	MEMBRE	2026-07-16 14:49:57.081	2026-07-16 14:49:57.081
cmrnrrjx900l9lq01tns96u3k	Safa Oueslati	oueslatisafa@outlook.fr	\N	\N	MEMBRE	2026-07-16 17:14:50.397	2026-07-16 17:14:50.397
cmrri21yt00m0lq01so64itgy	Takwa Ayari	takwaelayari2@gmail.com	\N	\N	MEMBRE	2026-07-19 07:54:08.886	2026-07-19 07:54:08.886
cmrbure44000tmn014gqiowcw	Zeineb Aguebi	dr.aguebizaineb@outlook.fr	\N	\N	MEMBRE	2026-07-08 09:05:27.604	2026-07-24 07:25:38.651
cmrbunzzn000kmn01zuqppjfe	Ilef Bouaziz	ilefbouaziz@gmail.com	\N	\N	MEMBRE	2026-07-08 09:02:49.331	2026-07-27 18:48:55.034
cmrdak4uz002umn01new00unx	Sarah Debira	sarahbebira21@gmail.com	\N	\N	MEMBRE	2026-07-09 09:15:29.051	2026-07-29 14:24:21.19
cmrdalmpl0033mn01wlk6ic11	Jamila Debira	jamilabebira@gmail.com	\N	\N	MEMBRE	2026-07-09 09:16:38.842	2026-07-29 14:25:40.417
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: cash_expenses cash_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_expenses
    ADD CONSTRAINT cash_expenses_pkey PRIMARY KEY (id);


--
-- Name: checkins checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_pkey PRIMARY KEY (id);


--
-- Name: coaches coaches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coaches
    ADD CONSTRAINT coaches_pkey PRIMARY KEY (id);


--
-- Name: member_pack_balances member_pack_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pack_balances
    ADD CONSTRAINT member_pack_balances_pkey PRIMARY KEY (id);


--
-- Name: member_pack_enrollments member_pack_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pack_enrollments
    ADD CONSTRAINT member_pack_enrollments_pkey PRIMARY KEY (id);


--
-- Name: member_pending_packs member_pending_packs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pending_packs
    ADD CONSTRAINT member_pending_packs_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: pack_course_quotas pack_course_quotas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_course_quotas
    ADD CONSTRAINT pack_course_quotas_pkey PRIMARY KEY (id);


--
-- Name: pack_features pack_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_features
    ADD CONSTRAINT pack_features_pkey PRIMARY KEY (id);


--
-- Name: pack_payments pack_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_payments
    ADD CONSTRAINT pack_payments_pkey PRIMARY KEY (id);


--
-- Name: pack_promotion_packs pack_promotion_packs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_promotion_packs
    ADD CONSTRAINT pack_promotion_packs_pkey PRIMARY KEY ("promotionId", "packId");


--
-- Name: pack_promotions pack_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_promotions
    ADD CONSTRAINT pack_promotions_pkey PRIMARY KEY (id);


--
-- Name: packs packs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packs
    ADD CONSTRAINT packs_pkey PRIMARY KEY (id);


--
-- Name: planning planning_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planning
    ADD CONSTRAINT planning_pkey PRIMARY KEY (id);


--
-- Name: qrcodes qrcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT qrcodes_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: studio_planning_period_archive studio_planning_period_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.studio_planning_period_archive
    ADD CONSTRAINT studio_planning_period_archive_pkey PRIMARY KEY (id);


--
-- Name: studio_planning_period studio_planning_period_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.studio_planning_period
    ADD CONSTRAINT studio_planning_period_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: attendance_memberId_sessionDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "attendance_memberId_sessionDate_idx" ON public.attendance USING btree ("memberId", "sessionDate");


--
-- Name: attendance_planningId_sessionDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "attendance_planningId_sessionDate_idx" ON public.attendance USING btree ("planningId", "sessionDate");


--
-- Name: attendance_reservationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "attendance_reservationId_key" ON public.attendance USING btree ("reservationId");


--
-- Name: cash_expenses_expenseDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cash_expenses_expenseDate_idx" ON public.cash_expenses USING btree ("expenseDate");


--
-- Name: checkins_memberId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "checkins_memberId_idx" ON public.checkins USING btree ("memberId");


--
-- Name: checkins_qrCodeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "checkins_qrCodeId_idx" ON public.checkins USING btree ("qrCodeId");


--
-- Name: checkins_reservationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "checkins_reservationId_key" ON public.checkins USING btree ("reservationId");


--
-- Name: checkins_scannedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "checkins_scannedAt_idx" ON public.checkins USING btree ("scannedAt");


--
-- Name: coaches_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX coaches_email_key ON public.coaches USING btree (email);


--
-- Name: coaches_lastName_firstName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "coaches_lastName_firstName_idx" ON public.coaches USING btree ("lastName", "firstName");


--
-- Name: coaches_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "coaches_userId_key" ON public.coaches USING btree ("userId");


--
-- Name: member_pack_balances_memberId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "member_pack_balances_memberId_idx" ON public.member_pack_balances USING btree ("memberId");


--
-- Name: member_pack_balances_memberId_packId_courseSlug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "member_pack_balances_memberId_packId_courseSlug_key" ON public.member_pack_balances USING btree ("memberId", "packId", "courseSlug");


--
-- Name: member_pack_balances_packId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "member_pack_balances_packId_idx" ON public.member_pack_balances USING btree ("packId");


--
-- Name: member_pack_enrollments_memberId_packId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "member_pack_enrollments_memberId_packId_idx" ON public.member_pack_enrollments USING btree ("memberId", "packId");


--
-- Name: member_pack_enrollments_memberId_purchasedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "member_pack_enrollments_memberId_purchasedAt_idx" ON public.member_pack_enrollments USING btree ("memberId", "purchasedAt");


--
-- Name: member_pack_enrollments_packPaymentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "member_pack_enrollments_packPaymentId_key" ON public.member_pack_enrollments USING btree ("packPaymentId");


--
-- Name: member_pending_packs_memberId_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "member_pending_packs_memberId_position_idx" ON public.member_pending_packs USING btree ("memberId", "position");


--
-- Name: members_packId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "members_packId_idx" ON public.members USING btree ("packId");


--
-- Name: members_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "members_userId_key" ON public.members USING btree ("userId");


--
-- Name: pack_course_quotas_courseSlug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_course_quotas_courseSlug_idx" ON public.pack_course_quotas USING btree ("courseSlug");


--
-- Name: pack_course_quotas_packId_courseSlug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "pack_course_quotas_packId_courseSlug_key" ON public.pack_course_quotas USING btree ("packId", "courseSlug");


--
-- Name: pack_course_quotas_packId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_course_quotas_packId_idx" ON public.pack_course_quotas USING btree ("packId");


--
-- Name: pack_features_packId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_features_packId_idx" ON public.pack_features USING btree ("packId");


--
-- Name: pack_features_packId_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_features_packId_sortOrder_idx" ON public.pack_features USING btree ("packId", "sortOrder");


--
-- Name: pack_payments_memberId_paidAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_payments_memberId_paidAt_idx" ON public.pack_payments USING btree ("memberId", "paidAt");


--
-- Name: pack_payments_packId_paidAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_payments_packId_paidAt_idx" ON public.pack_payments USING btree ("packId", "paidAt");


--
-- Name: pack_payments_paidAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_payments_paidAt_idx" ON public.pack_payments USING btree ("paidAt");


--
-- Name: pack_promotion_packs_packId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_promotion_packs_packId_idx" ON public.pack_promotion_packs USING btree ("packId");


--
-- Name: pack_promotions_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_promotions_isActive_idx" ON public.pack_promotions USING btree ("isActive");


--
-- Name: pack_promotions_startsAt_endsAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pack_promotions_startsAt_endsAt_idx" ON public.pack_promotions USING btree ("startsAt", "endsAt");


--
-- Name: packs_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX packs_name_key ON public.packs USING btree (name);


--
-- Name: planning_coachId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "planning_coachId_idx" ON public.planning USING btree ("coachId");


--
-- Name: planning_courseSlug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "planning_courseSlug_idx" ON public.planning USING btree ("courseSlug");


--
-- Name: planning_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "planning_dayOfWeek_idx" ON public.planning USING btree ("dayOfWeek");


--
-- Name: planning_dayOfWeek_startTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "planning_dayOfWeek_startTime_idx" ON public.planning USING btree ("dayOfWeek", "startTime");


--
-- Name: planning_draftSourceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "planning_draftSourceId_idx" ON public.planning USING btree ("draftSourceId");


--
-- Name: planning_draftSourceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "planning_draftSourceId_key" ON public.planning USING btree ("draftSourceId");


--
-- Name: planning_isDraft_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "planning_isDraft_idx" ON public.planning USING btree ("isDraft");


--
-- Name: qrcodes_assignedCoachId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qrcodes_assignedCoachId_idx" ON public.qrcodes USING btree ("assignedCoachId");


--
-- Name: qrcodes_assignedMemberId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qrcodes_assignedMemberId_idx" ON public.qrcodes USING btree ("assignedMemberId");


--
-- Name: qrcodes_createdByUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qrcodes_createdByUserId_idx" ON public.qrcodes USING btree ("createdByUserId");


--
-- Name: qrcodes_publicId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qrcodes_publicId_idx" ON public.qrcodes USING btree ("publicId");


--
-- Name: qrcodes_publicId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "qrcodes_publicId_key" ON public.qrcodes USING btree ("publicId");


--
-- Name: qrcodes_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX qrcodes_status_idx ON public.qrcodes USING btree (status);


--
-- Name: reservations_createdByUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservations_createdByUserId_idx" ON public.reservations USING btree ("createdByUserId");


--
-- Name: reservations_debitedPackId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservations_debitedPackId_idx" ON public.reservations USING btree ("debitedPackId");


--
-- Name: reservations_memberId_planningId_sessionDate_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reservations_memberId_planningId_sessionDate_key" ON public.reservations USING btree ("memberId", "planningId", "sessionDate");


--
-- Name: reservations_memberId_sessionDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservations_memberId_sessionDate_idx" ON public.reservations USING btree ("memberId", "sessionDate");


--
-- Name: reservations_planningId_sessionDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservations_planningId_sessionDate_idx" ON public.reservations USING btree ("planningId", "sessionDate");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: studio_planning_period_archive_periodStartDate_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "studio_planning_period_archive_periodStartDate_key" ON public.studio_planning_period_archive USING btree ("periodStartDate");


--
-- Name: studio_planning_period_archive_periodStartDate_periodEndDat_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "studio_planning_period_archive_periodStartDate_periodEndDat_idx" ON public.studio_planning_period_archive USING btree ("periodStartDate", "periodEndDate");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: attendance attendance_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_planningId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_planningId_fkey" FOREIGN KEY ("planningId") REFERENCES public.planning(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: attendance attendance_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "attendance_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cash_expenses cash_expenses_recordedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_expenses
    ADD CONSTRAINT "cash_expenses_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: checkins checkins_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT "checkins_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checkins checkins_qrCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT "checkins_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES public.qrcodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checkins checkins_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT "checkins_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coaches coaches_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coaches
    ADD CONSTRAINT "coaches_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: member_pack_balances member_pack_balances_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pack_balances
    ADD CONSTRAINT "member_pack_balances_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_pack_balances member_pack_balances_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pack_balances
    ADD CONSTRAINT "member_pack_balances_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_pack_enrollments member_pack_enrollments_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pack_enrollments
    ADD CONSTRAINT "member_pack_enrollments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_pack_enrollments member_pack_enrollments_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pack_enrollments
    ADD CONSTRAINT "member_pack_enrollments_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_pack_enrollments member_pack_enrollments_packPaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pack_enrollments
    ADD CONSTRAINT "member_pack_enrollments_packPaymentId_fkey" FOREIGN KEY ("packPaymentId") REFERENCES public.pack_payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: member_pending_packs member_pending_packs_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pending_packs
    ADD CONSTRAINT "member_pending_packs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_pending_packs member_pending_packs_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_pending_packs
    ADD CONSTRAINT "member_pending_packs_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: members members_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "members_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: members members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pack_course_quotas pack_course_quotas_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_course_quotas
    ADD CONSTRAINT "pack_course_quotas_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pack_features pack_features_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_features
    ADD CONSTRAINT "pack_features_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pack_payments pack_payments_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_payments
    ADD CONSTRAINT "pack_payments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pack_payments pack_payments_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_payments
    ADD CONSTRAINT "pack_payments_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pack_payments pack_payments_promotionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_payments
    ADD CONSTRAINT "pack_payments_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES public.pack_promotions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pack_payments pack_payments_recordedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_payments
    ADD CONSTRAINT "pack_payments_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pack_promotion_packs pack_promotion_packs_packId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_promotion_packs
    ADD CONSTRAINT "pack_promotion_packs_packId_fkey" FOREIGN KEY ("packId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pack_promotion_packs pack_promotion_packs_promotionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pack_promotion_packs
    ADD CONSTRAINT "pack_promotion_packs_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES public.pack_promotions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: planning planning_coachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planning
    ADD CONSTRAINT "planning_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public.coaches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: planning planning_draftSourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planning
    ADD CONSTRAINT "planning_draftSourceId_fkey" FOREIGN KEY ("draftSourceId") REFERENCES public.planning(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: qrcodes qrcodes_assignedCoachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT "qrcodes_assignedCoachId_fkey" FOREIGN KEY ("assignedCoachId") REFERENCES public.coaches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: qrcodes qrcodes_assignedMemberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT "qrcodes_assignedMemberId_fkey" FOREIGN KEY ("assignedMemberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: qrcodes qrcodes_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT "qrcodes_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservations reservations_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reservations reservations_debitedPackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_debitedPackId_fkey" FOREIGN KEY ("debitedPackId") REFERENCES public.packs(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reservations reservations_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_planningId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_planningId_fkey" FOREIGN KEY ("planningId") REFERENCES public.planning(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict UOHq2uoQfcLmREg1QU37uqDeVvadUyA8TB39YjR3QRq2fkUQWz43MZ6GsPea7yX

