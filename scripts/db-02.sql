--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.2

-- Started on 2020-04-08 23:30:58 EDT

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

--
-- TOC entry 587 (class 1247 OID 37511)
-- Name: enum_auth_site; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_auth_site AS ENUM (
    'twitter',
    'weibo',
    'email'
);


ALTER TYPE public.enum_auth_site OWNER TO v2land;

--
-- TOC entry 675 (class 1247 OID 37518)
-- Name: enum_authorizationAccessToken_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public."enum_authorizationAccessToken_status" AS ENUM (
    'active',
    'revoked'
);


ALTER TYPE public."enum_authorizationAccessToken_status" OWNER TO v2land;

--
-- TOC entry 678 (class 1247 OID 37524)
-- Name: enum_client_role; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_client_role AS ENUM (
    'admin',
    'manager',
    'contributor'
);


ALTER TYPE public.enum_client_role OWNER TO v2land;

--
-- TOC entry 681 (class 1247 OID 37532)
-- Name: enum_contact_method; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_contact_method AS ENUM (
    'twitter',
    'weibo',
    'twitterAt',
    'weiboAt',
    'email',
    'emailDailyReport',
    'mobileAppNotification'
);


ALTER TYPE public.enum_contact_method OWNER TO v2land;

--
-- TOC entry 684 (class 1247 OID 37548)
-- Name: enum_contact_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_contact_status AS ENUM (
    'active',
    'inactive',
    'expired'
);


ALTER TYPE public.enum_contact_status OWNER TO v2land;

--
-- TOC entry 687 (class 1247 OID 37556)
-- Name: enum_contact_type; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_contact_type AS ENUM (
    'email',
    'twitter',
    'weibo',
    'telegram',
    'mobileApp'
);


ALTER TYPE public.enum_contact_type OWNER TO v2land;

--
-- TOC entry 690 (class 1247 OID 37568)
-- Name: enum_critique_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_critique_status AS ENUM (
    'pending',
    'admitted',
    'rejected',
    'removed'
);


ALTER TYPE public.enum_critique_status OWNER TO v2land;

--
-- TOC entry 693 (class 1247 OID 37578)
-- Name: enum_event_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_event_status AS ENUM (
    'pending',
    'admitted',
    'rejected',
    'hidden',
    'removed'
);


ALTER TYPE public.enum_event_status OWNER TO v2land;

--
-- TOC entry 696 (class 1247 OID 37590)
-- Name: enum_news_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_news_status AS ENUM (
    'pending',
    'admitted',
    'rejected',
    'removed'
);


ALTER TYPE public.enum_news_status OWNER TO v2land;

--
-- TOC entry 699 (class 1247 OID 37600)
-- Name: enum_notification_mode; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_notification_mode AS ENUM (
    'EveryNewStack',
    '30DaysSinceLatestStack',
    'new',
    '7DaysSinceLatestNews',
    'daily',
    'weekly',
    'monthly',
    'EveryFriday'
);


ALTER TYPE public.enum_notification_mode OWNER TO v2land;

--
-- TOC entry 702 (class 1247 OID 37618)
-- Name: enum_notification_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_notification_status AS ENUM (
    'pending',
    'ongoing',
    'complete',
    'discarded'
);


ALTER TYPE public.enum_notification_status OWNER TO v2land;

--
-- TOC entry 705 (class 1247 OID 37628)
-- Name: enum_record_action; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_record_action AS ENUM (
    'createEvent',
    'updateEventStatus',
    'updateEventDetail',
    'createEventHeaderImage',
    'updateEventHeaderImage',
    'createStack',
    'updateStackStatus',
    'updateStackDetail',
    'invalidateStack',
    'notifyNewStack',
    'createNews',
    'updateNewsStatus',
    'updateNewsDetail',
    'notifyNewNews',
    'createSubscription',
    'updateSubscription',
    'cancelSubscription',
    'addModeToSubscription',
    'createClient',
    'updateClientRole',
    'updateClientDetail',
    'updateClientPassword',
    'createClientVerificationToken',
    'authorizeThirdPartyAccount',
    'unauthorizeThirdPartyAccount',
    'notify',
    'sendEmailDailyReport',
    'sendWeeklyDailyReport',
    'sendMonthlyDailyReport',
    'addContactToSubscription',
    'removeSubscriptionContact'
);


ALTER TYPE public.enum_record_action OWNER TO v2land;

--
-- TOC entry 708 (class 1247 OID 37692)
-- Name: enum_record_model; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_record_model AS ENUM (
    'Event',
    'Stack',
    'News',
    'Client',
    'HeaderImage',
    'Subscription',
    'Auth',
    'Report',
    'Miscellaneous',
    'Contact'
);


ALTER TYPE public.enum_record_model OWNER TO v2land;

--
-- TOC entry 711 (class 1247 OID 37714)
-- Name: enum_record_operation; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_record_operation AS ENUM (
    'create',
    'update',
    'destroy'
);


ALTER TYPE public.enum_record_operation OWNER TO v2land;

--
-- TOC entry 714 (class 1247 OID 37722)
-- Name: enum_reportNotification_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public."enum_reportNotification_status" AS ENUM (
    'pending',
    'complete',
    'invalid'
);


ALTER TYPE public."enum_reportNotification_status" OWNER TO v2land;

--
-- TOC entry 717 (class 1247 OID 37730)
-- Name: enum_report_method; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_report_method AS ENUM (
    'email',
    'telegram'
);


ALTER TYPE public.enum_report_method OWNER TO v2land;

--
-- TOC entry 720 (class 1247 OID 37736)
-- Name: enum_report_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_report_status AS ENUM (
    'pending',
    'ongoing',
    'complete',
    'invalid'
);


ALTER TYPE public.enum_report_status OWNER TO v2land;

--
-- TOC entry 723 (class 1247 OID 37746)
-- Name: enum_report_type; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_report_type AS ENUM (
    'daily',
    'weekly',
    'monthly'
);


ALTER TYPE public.enum_report_type OWNER TO v2land;

--
-- TOC entry 726 (class 1247 OID 37754)
-- Name: enum_stack_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_stack_status AS ENUM (
    'pending',
    'admitted',
    'invalid',
    'rejected',
    'hidden',
    'removed'
);


ALTER TYPE public.enum_stack_status OWNER TO v2land;

--
-- TOC entry 729 (class 1247 OID 37768)
-- Name: enum_subscription_mode; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_subscription_mode AS ENUM (
    'EveryNewStack',
    '30DaysSinceLatestStack',
    'new',
    '7DaysSinceLatestNews',
    'daily',
    'weekly',
    'monthly',
    'EveryFriday'
);


ALTER TYPE public.enum_subscription_mode OWNER TO v2land;

--
-- TOC entry 732 (class 1247 OID 37786)
-- Name: enum_subscription_status; Type: TYPE; Schema: public; Owner: v2land
--

CREATE TYPE public.enum_subscription_status AS ENUM (
    'active',
    'unsubscribed'
);


ALTER TYPE public.enum_subscription_status OWNER TO v2land;

--
-- TOC entry 820 (class 1247 OID 38237)
-- Name: enum_tag_status; Type: TYPE; Schema: public; Owner: zehuali
--

CREATE TYPE public.enum_tag_status AS ENUM (
    'visible',
    'hidden'
);


ALTER TYPE public.enum_tag_status OWNER TO zehuali;

--
-- TOC entry 249 (class 1255 OID 37791)
-- Name: sails_session_store_clear(); Type: FUNCTION; Schema: public; Owner: v2land
--

CREATE FUNCTION public.sails_session_store_clear() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM sails_session_store;
END;
$$;


ALTER FUNCTION public.sails_session_store_clear() OWNER TO v2land;

--
-- TOC entry 250 (class 1255 OID 37792)
-- Name: sails_session_store_destroy(text); Type: FUNCTION; Schema: public; Owner: v2land
--

CREATE FUNCTION public.sails_session_store_destroy(sid_in text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM sails_session_store WHERE sid = sid_in;
END;
$$;


ALTER FUNCTION public.sails_session_store_destroy(sid_in text) OWNER TO v2land;

--
-- TOC entry 251 (class 1255 OID 37793)
-- Name: sails_session_store_get(text); Type: FUNCTION; Schema: public; Owner: v2land
--

CREATE FUNCTION public.sails_session_store_get(sid_in text, OUT data_out json) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  SELECT data FROM sails_session_store WHERE sid = sid_in INTO data_out;
END;
$$;


ALTER FUNCTION public.sails_session_store_get(sid_in text, OUT data_out json) OWNER TO v2land;

--
-- TOC entry 252 (class 1255 OID 37794)
-- Name: sails_session_store_length(); Type: FUNCTION; Schema: public; Owner: v2land
--

CREATE FUNCTION public.sails_session_store_length(OUT length integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
  SELECT count(*) FROM sails_session_store INTO length;
END;
$$;


ALTER FUNCTION public.sails_session_store_length(OUT length integer) OWNER TO v2land;

--
-- TOC entry 253 (class 1255 OID 37795)
-- Name: sails_session_store_set(text, json); Type: FUNCTION; Schema: public; Owner: v2land
--

CREATE FUNCTION public.sails_session_store_set(sid_in text, data_in json) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- delete current session data if it exists so the next insert succeeds
  DELETE FROM sails_session_store WHERE sid = sid_in;
  INSERT INTO sails_session_store(sid, data) VALUES(sid_in, data_in);
END;
$$;


ALTER FUNCTION public.sails_session_store_set(sid_in text, data_in json) OWNER TO v2land;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 248 (class 1259 OID 38360)
-- Name: Session; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."Session" (
    sid character varying(36),
    expires timestamp with time zone,
    data text,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Session" OWNER TO v2land;

--
-- TOC entry 212 (class 1259 OID 37802)
-- Name: auth; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.auth (
    site public.enum_auth_site,
    "profileId" text,
    profile jsonb,
    token text,
    "tokenSecret" text,
    "accessToken" text,
    "accessTokenSecret" text,
    "refreshToken" text,
    redirect text,
    owner integer,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public.auth OWNER TO v2land;

--
-- TOC entry 213 (class 1259 OID 37808)
-- Name: auth_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.auth_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_id_seq OWNER TO v2land;

--
-- TOC entry 3515 (class 0 OID 0)
-- Dependencies: 213
-- Name: auth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.auth_id_seq OWNED BY public.auth.id;


--
-- TOC entry 214 (class 1259 OID 37810)
-- Name: authorizationAccessToken; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."authorizationAccessToken" (
    id integer NOT NULL,
    token text NOT NULL,
    "refreshToken" text,
    expire timestamp with time zone,
    "authorizationClientId" integer NOT NULL,
    owner integer NOT NULL,
    status public."enum_authorizationAccessToken_status" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."authorizationAccessToken" OWNER TO v2land;

--
-- TOC entry 215 (class 1259 OID 37816)
-- Name: authorizationAccessToken_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

ALTER TABLE public."authorizationAccessToken" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."authorizationAccessToken_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 216 (class 1259 OID 37818)
-- Name: authorizationClient; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."authorizationClient" (
    name text NOT NULL,
    description text,
    "redirectURI" text,
    "allowAuthorizationByCredentials" boolean NOT NULL,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."authorizationClient" OWNER TO v2land;

--
-- TOC entry 217 (class 1259 OID 37824)
-- Name: authorizationClient_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

ALTER TABLE public."authorizationClient" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."authorizationClient_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 37826)
-- Name: authorizationCode; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."authorizationCode" (
    id integer NOT NULL,
    code text NOT NULL,
    url text,
    expire timestamp with time zone NOT NULL,
    owner integer NOT NULL,
    "authorizationClientId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."authorizationCode" OWNER TO v2land;

--
-- TOC entry 219 (class 1259 OID 37832)
-- Name: authorizationCode_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

ALTER TABLE public."authorizationCode" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."authorizationCode_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE SEQUENCE public.commit_id_seq
    INCREMENT 1
    START WITH 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER TABLE public.commit_id_seq OWNER TO v2land;

ALTER SEQUENCE public.commit_id_seq
    OWNER TO v2land;

--
-- TOC entry 220 (class 1259 OID 37834)
-- Name: client; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.client (
    username text,
    email text,
    password text,
    role public.enum_client_role,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "emailVerified" boolean DEFAULT false,
    settings jsonb
);


ALTER TABLE public.client OWNER TO v2land;

--
-- TOC entry 221 (class 1259 OID 37846)
-- Name: client_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.client_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.client_id_seq OWNER TO v2land;

--
-- TOC entry 3516 (class 0 OID 0)
-- Dependencies: 221
-- Name: client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.client_id_seq OWNED BY public.client.id;


--
-- TOC entry 222 (class 1259 OID 37848)
-- Name: contact_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.contact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_id_seq OWNER TO v2land;

--
-- TOC entry 223 (class 1259 OID 37850)
-- Name: contact; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.contact (
    id integer DEFAULT nextval('public.contact_id_seq'::regclass) NOT NULL,
    "profileId" text,
    type public.enum_contact_type NOT NULL,
    method public.enum_contact_method NOT NULL,
    status public.enum_contact_status NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    owner integer,
    "subscriptionId" integer,
    "authId" integer,
    "unsubscribeId" text
);


ALTER TABLE public.contact OWNER TO v2land;

--
-- TOC entry 224 (class 1259 OID 37857)
-- Name: critique_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.critique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.critique_id_seq OWNER TO v2land;

--
-- TOC entry 225 (class 1259 OID 37859)
-- Name: critique; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.critique (
    id integer DEFAULT nextval('public.critique_id_seq'::regclass) NOT NULL,
    url text NOT NULL,
    source text NOT NULL,
    title text NOT NULL,
    abstract text NOT NULL,
    "time" timestamp with time zone NOT NULL,
    status public.enum_critique_status DEFAULT 'pending'::public.enum_critique_status,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "eventId" integer
);


ALTER TABLE public.critique OWNER TO v2land;

--
-- TOC entry 226 (class 1259 OID 37867)
-- Name: event; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.event (
    name text,
    description text,
    status public.enum_event_status,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    pinyin text,
    "latestAdmittedNewsId" integer
);


ALTER TABLE public.event OWNER TO v2land;

--
-- TOC entry 247 (class 1259 OID 38333)
-- Name: eventStackNews; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."eventStackNews" (
    "eventId" integer NOT NULL,
    "newsId" integer NOT NULL,
    "stackId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."eventStackNews" OWNER TO v2land;

--
-- TOC entry 227 (class 1259 OID 37873)
-- Name: eventTag; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."eventTag" (
    "eventId" integer,
    "tagId" integer,
    id integer NOT NULL,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);


ALTER TABLE public."eventTag" OWNER TO v2land;

--
-- TOC entry 228 (class 1259 OID 37876)
-- Name: eventTag_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public."eventTag_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."eventTag_id_seq" OWNER TO v2land;

--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 228
-- Name: eventTag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public."eventTag_id_seq" OWNED BY public."eventTag".id;


--
-- TOC entry 229 (class 1259 OID 37878)
-- Name: event_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_id_seq OWNER TO v2land;

--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 229
-- Name: event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.event_id_seq OWNED BY public.event.id;


--
-- TOC entry 230 (class 1259 OID 37880)
-- Name: headerImage; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."headerImage" (
    "imageUrl" text,
    source text,
    "sourceUrl" text,
    "eventId" integer,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."headerImage" OWNER TO v2land;

--
-- TOC entry 231 (class 1259 OID 37886)
-- Name: headerimage_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.headerimage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.headerimage_id_seq OWNER TO v2land;

--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 231
-- Name: headerimage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.headerimage_id_seq OWNED BY public."headerImage".id;


--
-- TOC entry 232 (class 1259 OID 37894)
-- Name: news; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.news (
    url text,
    source text,
    title text,
    abstract text,
    "time" timestamp with time zone,
    status public.enum_news_status,
    comment text,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "isInTemporaryStack" boolean
);


ALTER TABLE public.news OWNER TO v2land;

--
-- TOC entry 233 (class 1259 OID 37900)
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.news_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.news_id_seq OWNER TO v2land;

--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 233
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- TOC entry 234 (class 1259 OID 37902)
-- Name: notification; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.notification (
    "time" date,
    mode public.enum_notification_mode,
    "eventId" integer,
    status public.enum_notification_status,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public.notification OWNER TO v2land;

--
-- TOC entry 235 (class 1259 OID 37905)
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_id_seq OWNER TO v2land;

--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 235
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- TOC entry 236 (class 1259 OID 37907)
-- Name: record; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.record (
    model character varying(256),
    target integer,
    operation public.enum_record_operation,
    action character varying(256),
    data jsonb,
    owner integer,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    before jsonb,
    subtarget integer
);


ALTER TABLE public.record OWNER TO v2land;

--
-- TOC entry 237 (class 1259 OID 37913)
-- Name: record_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.record_id_seq OWNER TO v2land;

--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 237
-- Name: record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.record_id_seq OWNED BY public.record.id;


--
-- TOC entry 238 (class 1259 OID 37915)
-- Name: report_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_id_seq OWNER TO v2land;

--
-- TOC entry 239 (class 1259 OID 37917)
-- Name: report; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.report (
    id integer DEFAULT nextval('public.report_id_seq'::regclass) NOT NULL,
    "time" timestamp with time zone DEFAULT '2018-10-27 02:08:13.457+08'::timestamp with time zone NOT NULL,
    type public.enum_report_type DEFAULT 'daily'::public.enum_report_type,
    method public.enum_report_method DEFAULT 'email'::public.enum_report_method,
    status public.enum_report_status DEFAULT 'pending'::public.enum_report_status,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    owner integer
);


ALTER TABLE public.report OWNER TO v2land;

--
-- TOC entry 240 (class 1259 OID 37925)
-- Name: reportNotification; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public."reportNotification" (
    status public."enum_reportNotification_status" DEFAULT 'pending'::public."enum_reportNotification_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "notificationId" integer NOT NULL,
    "reportId" integer NOT NULL
);


ALTER TABLE public."reportNotification" OWNER TO v2land;

--
-- TOC entry 241 (class 1259 OID 37936)
-- Name: stack_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.stack_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.stack_id_seq OWNER TO v2land;

--
-- TOC entry 242 (class 1259 OID 37938)
-- Name: stack; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.stack (
    title text,
    description text,
    status public.enum_stack_status,
    "eventId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    id integer DEFAULT nextval('public.stack_id_seq'::regclass) NOT NULL,
    "order" integer DEFAULT '-1'::integer NOT NULL,
    "time" timestamp with time zone
);


ALTER TABLE public.stack OWNER TO v2land;

--
-- TOC entry 243 (class 1259 OID 37946)
-- Name: subscription; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.subscription (
    mode public.enum_subscription_mode,
    status public.enum_subscription_status,
    "unsubscribeId" text,
    subscriber integer,
    "eventId" integer,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public.subscription OWNER TO v2land;

--
-- TOC entry 244 (class 1259 OID 37952)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_id_seq OWNER TO v2land;

--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 244
-- Name: subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.subscription_id_seq OWNED BY public.subscription.id;


--
-- TOC entry 245 (class 1259 OID 37954)
-- Name: tag; Type: TABLE; Schema: public; Owner: v2land
--

CREATE TABLE public.tag (
    id integer NOT NULL,
    name text,
    description text,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    status public.enum_tag_status
);


ALTER TABLE public.tag OWNER TO v2land;


--
-- TOC entry 246 (class 1259 OID 37960)
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: v2land
--

CREATE SEQUENCE public.tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tag_id_seq OWNER TO v2land;

--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 246
-- Name: tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: v2land
--

ALTER SEQUENCE public.tag_id_seq OWNED BY public.tag.id;


--
-- TOC entry 3263 (class 2604 OID 37962)
-- Name: auth id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.auth ALTER COLUMN id SET DEFAULT nextval('public.auth_id_seq'::regclass);


--
-- TOC entry 3265 (class 2604 OID 37963)
-- Name: client id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.client ALTER COLUMN id SET DEFAULT nextval('public.client_id_seq'::regclass);


--
-- TOC entry 3269 (class 2604 OID 37965)
-- Name: event id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);


--
-- TOC entry 3270 (class 2604 OID 37966)
-- Name: eventTag id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."eventTag" ALTER COLUMN id SET DEFAULT nextval('public."eventTag_id_seq"'::regclass);


--
-- TOC entry 3271 (class 2604 OID 37967)
-- Name: headerImage id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."headerImage" ALTER COLUMN id SET DEFAULT nextval('public.headerimage_id_seq'::regclass);


--
-- TOC entry 3272 (class 2604 OID 37968)
-- Name: news id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- TOC entry 3273 (class 2604 OID 37969)
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- TOC entry 3274 (class 2604 OID 37970)
-- Name: record id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.record ALTER COLUMN id SET DEFAULT nextval('public.record_id_seq'::regclass);


--
-- TOC entry 3283 (class 2604 OID 37971)
-- Name: subscription id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.subscription ALTER COLUMN id SET DEFAULT nextval('public.subscription_id_seq'::regclass);


--
-- TOC entry 3284 (class 2604 OID 37972)
-- Name: tag id; Type: DEFAULT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.tag ALTER COLUMN id SET DEFAULT nextval('public.tag_id_seq'::regclass);


--
-- TOC entry 3509 (class 0 OID 38360)
-- Dependencies: 248
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."Session" (sid, expires, data, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3473 (class 0 OID 37802)
-- Dependencies: 212
-- Data for Name: auth; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.auth (site, "profileId", profile, token, "tokenSecret", "accessToken", "accessTokenSecret", "refreshToken", redirect, owner, id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3475 (class 0 OID 37810)
-- Dependencies: 214
-- Data for Name: authorizationAccessToken; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."authorizationAccessToken" (id, token, "refreshToken", expire, "authorizationClientId", owner, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3477 (class 0 OID 37818)
-- Dependencies: 216
-- Data for Name: authorizationClient; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."authorizationClient" (name, description, "redirectURI", "allowAuthorizationByCredentials", id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3479 (class 0 OID 37826)
-- Dependencies: 218
-- Data for Name: authorizationCode; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."authorizationCode" (id, code, url, expire, owner, "authorizationClientId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3481 (class 0 OID 37834)
-- Dependencies: 220
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.client (username, email, password, role, id, "createdAt", "updatedAt", "emailVerified", settings) FROM stdin;
\.


--
-- TOC entry 3484 (class 0 OID 37850)
-- Dependencies: 223
-- Data for Name: contact; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.contact (id, "profileId", type, method, status, "createdAt", "updatedAt", owner, "subscriptionId", "authId", "unsubscribeId") FROM stdin;
\.


--
-- TOC entry 3486 (class 0 OID 37859)
-- Dependencies: 225
-- Data for Name: critique; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.critique (id, url, source, title, abstract, "time", status, "createdAt", "updatedAt", "eventId") FROM stdin;
\.


--
-- TOC entry 3487 (class 0 OID 37867)
-- Dependencies: 226
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.event (name, description, status, id, "createdAt", "updatedAt", pinyin, "latestAdmittedNewsId") FROM stdin;
\.


--
-- TOC entry 3508 (class 0 OID 38333)
-- Dependencies: 247
-- Data for Name: eventStackNews; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."eventStackNews" ("eventId", "newsId", "stackId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3488 (class 0 OID 37873)
-- Dependencies: 227
-- Data for Name: eventTag; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."eventTag" ("eventId", "tagId", id, "updatedAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 3491 (class 0 OID 37880)
-- Dependencies: 230
-- Data for Name: headerImage; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."headerImage" ("imageUrl", source, "sourceUrl", "eventId", id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3493 (class 0 OID 37894)
-- Dependencies: 232
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.news (url, source, title, abstract, "time", status, comment, id, "createdAt", "updatedAt", "isInTemporaryStack") FROM stdin;
\.


--
-- TOC entry 3495 (class 0 OID 37902)
-- Dependencies: 234
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.notification ("time", mode, "eventId", status, id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3497 (class 0 OID 37907)
-- Dependencies: 236
-- Data for Name: record; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.record (model, target, operation, action, data, owner, id, "createdAt", "updatedAt", before, subtarget) FROM stdin;
\.


--
-- TOC entry 3500 (class 0 OID 37917)
-- Dependencies: 239
-- Data for Name: report; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.report (id, "time", type, method, status, "createdAt", "updatedAt", owner) FROM stdin;
\.


--
-- TOC entry 3501 (class 0 OID 37925)
-- Dependencies: 240
-- Data for Name: reportNotification; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public."reportNotification" (status, "createdAt", "updatedAt", "notificationId", "reportId") FROM stdin;
\.


--
-- TOC entry 3503 (class 0 OID 37938)
-- Dependencies: 242
-- Data for Name: stack; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.stack (title, description, status, "eventId", "createdAt", "updatedAt", id, "order", "time") FROM stdin;
\.


--
-- TOC entry 3504 (class 0 OID 37946)
-- Dependencies: 243
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.subscription (mode, status, "unsubscribeId", subscriber, "eventId", id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3506 (class 0 OID 37954)
-- Dependencies: 245
-- Data for Name: tag; Type: TABLE DATA; Schema: public; Owner: v2land
--

COPY public.tag (id, name, description, "createdAt", "updatedAt", status) FROM stdin;
\.


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 213
-- Name: auth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.auth_id_seq', 1, true);


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 215
-- Name: authorizationAccessToken_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public."authorizationAccessToken_id_seq"', 53, true);


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 217
-- Name: authorizationClient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public."authorizationClient_id_seq"', 4, true);


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 219
-- Name: authorizationCode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public."authorizationCode_id_seq"', 1, false);


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 221
-- Name: client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.client_id_seq', 1, true);


--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 222
-- Name: contact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.contact_id_seq', 1, true);


--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 224
-- Name: critique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.critique_id_seq', 1, true);


--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 228
-- Name: eventTag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public."eventTag_id_seq"', 1, true);


--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 229
-- Name: event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.event_id_seq', 1, true);


--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 231
-- Name: headerimage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.headerimage_id_seq', 1, true);


--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 233
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.news_id_seq', 1, true);


--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 235
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.notification_id_seq', 1, true);


--
-- TOC entry 3537 (class 0 OID 0)
-- Dependencies: 237
-- Name: record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.record_id_seq', 1, true);


--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 238
-- Name: report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.report_id_seq', 1, true);


--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 241
-- Name: stack_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.stack_id_seq', 1, true);


--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 244
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.subscription_id_seq', 1, true);


--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 246
-- Name: tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: v2land
--

SELECT pg_catalog.setval('public.tag_id_seq', 1, true);


--
-- TOC entry 3288 (class 2606 OID 38085)
-- Name: authorizationAccessToken AuthorizationAccessToken_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."authorizationAccessToken"
    ADD CONSTRAINT "AuthorizationAccessToken_pkey" PRIMARY KEY (id);


--
-- TOC entry 3286 (class 2606 OID 38087)
-- Name: auth auth_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_pkey PRIMARY KEY (id);


--
-- TOC entry 3290 (class 2606 OID 38089)
-- Name: authorizationClient authorizationClient_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."authorizationClient"
    ADD CONSTRAINT "authorizationClient_pkey" PRIMARY KEY (id);


--
-- TOC entry 3292 (class 2606 OID 38091)
-- Name: authorizationCode authorizationCode_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."authorizationCode"
    ADD CONSTRAINT "authorizationCode_pkey" PRIMARY KEY (id);


--
-- TOC entry 3294 (class 2606 OID 38093)
-- Name: client client_email_key; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_email_key UNIQUE (email);


--
-- TOC entry 3296 (class 2606 OID 38097)
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


--
-- TOC entry 3298 (class 2606 OID 38099)
-- Name: client client_username_key; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_username_key UNIQUE (username);


--
-- TOC entry 3300 (class 2606 OID 38101)
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


--
-- TOC entry 3302 (class 2606 OID 38103)
-- Name: critique critique_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.critique
    ADD CONSTRAINT critique_pkey PRIMARY KEY (id);


--
-- TOC entry 3330 (class 2606 OID 38337)
-- Name: eventStackNews eventStackNews_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."eventStackNews"
    ADD CONSTRAINT "eventStackNews_pkey" PRIMARY KEY ("eventId", "newsId");


--
-- TOC entry 3308 (class 2606 OID 38105)
-- Name: eventTag eventTag_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."eventTag"
    ADD CONSTRAINT "eventTag_pkey" PRIMARY KEY (id);


--
-- TOC entry 3304 (class 2606 OID 38107)
-- Name: event event_name_key; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_name_key UNIQUE (name);


--
-- TOC entry 3306 (class 2606 OID 38109)
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- TOC entry 3310 (class 2606 OID 38111)
-- Name: headerImage headerimage_event_key; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."headerImage"
    ADD CONSTRAINT headerimage_event_key UNIQUE ("eventId");


--
-- TOC entry 3312 (class 2606 OID 38113)
-- Name: headerImage headerimage_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."headerImage"
    ADD CONSTRAINT headerimage_pkey PRIMARY KEY (id);


--
-- TOC entry 3314 (class 2606 OID 38117)
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- TOC entry 3316 (class 2606 OID 38119)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 3318 (class 2606 OID 38121)
-- Name: record record_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.record
    ADD CONSTRAINT record_pkey PRIMARY KEY (id);


--
-- TOC entry 3322 (class 2606 OID 38123)
-- Name: reportNotification reportNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."reportNotification"
    ADD CONSTRAINT "reportNotification_pkey" PRIMARY KEY ("notificationId", "reportId");


--
-- TOC entry 3320 (class 2606 OID 38125)
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);


--
-- TOC entry 3324 (class 2606 OID 38129)
-- Name: stack stack_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.stack
    ADD CONSTRAINT stack_pkey PRIMARY KEY (id);


--
-- TOC entry 3326 (class 2606 OID 38131)
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- TOC entry 3328 (class 2606 OID 38133)
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- TOC entry 3333 (class 2606 OID 38134)
-- Name: authorizationCode authorizationClientId; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."authorizationCode"
    ADD CONSTRAINT "authorizationClientId" FOREIGN KEY ("authorizationClientId") REFERENCES public."authorizationClient"(id) NOT VALID;


--
-- TOC entry 3331 (class 2606 OID 38139)
-- Name: authorizationAccessToken authorizationClientId; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."authorizationAccessToken"
    ADD CONSTRAINT "authorizationClientId" FOREIGN KEY ("authorizationClientId") REFERENCES public."authorizationClient"(id) NOT VALID;


--
-- TOC entry 3335 (class 2606 OID 38144)
-- Name: contact contact_authId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT "contact_authId_fkey" FOREIGN KEY ("authId") REFERENCES public.auth(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3336 (class 2606 OID 38149)
-- Name: contact contact_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_owner_fkey FOREIGN KEY (owner) REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3337 (class 2606 OID 38154)
-- Name: contact contact_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT "contact_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscription(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3338 (class 2606 OID 38159)
-- Name: critique critique_event_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.critique
    ADD CONSTRAINT critique_event_fkey FOREIGN KEY ("eventId") REFERENCES public.event(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3344 (class 2606 OID 38342)
-- Name: eventStackNews eventStackNews_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."eventStackNews"
    ADD CONSTRAINT "eventStackNews_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.event(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3345 (class 2606 OID 38347)
-- Name: eventStackNews eventStackNews_newsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."eventStackNews"
    ADD CONSTRAINT "eventStackNews_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES public.news(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3346 (class 2606 OID 38352)
-- Name: eventStackNews eventStackNews_stackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."eventStackNews"
    ADD CONSTRAINT "eventStackNews_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES public.stack(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3339 (class 2606 OID 38164)
-- Name: event event_latestadmittednewsid_fk; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_latestadmittednewsid_fk FOREIGN KEY ("latestAdmittedNewsId") REFERENCES public.news(id) ON DELETE SET NULL;


--
-- TOC entry 3334 (class 2606 OID 38179)
-- Name: authorizationCode owner; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."authorizationCode"
    ADD CONSTRAINT owner FOREIGN KEY (owner) REFERENCES public.client(id) NOT VALID;


--
-- TOC entry 3332 (class 2606 OID 38184)
-- Name: authorizationAccessToken owner; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."authorizationAccessToken"
    ADD CONSTRAINT owner FOREIGN KEY (owner) REFERENCES public.client(id) NOT VALID;


--
-- TOC entry 3341 (class 2606 OID 38189)
-- Name: reportNotification reportNotification_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."reportNotification"
    ADD CONSTRAINT "reportNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3342 (class 2606 OID 38194)
-- Name: reportNotification reportNotification_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public."reportNotification"
    ADD CONSTRAINT "reportNotification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public.report(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3340 (class 2606 OID 38199)
-- Name: report report_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_owner_fkey FOREIGN KEY (owner) REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3343 (class 2606 OID 38204)
-- Name: stack stack_event_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: v2land
--

ALTER TABLE ONLY public.stack
    ADD CONSTRAINT stack_event_id_fk FOREIGN KEY ("eventId") REFERENCES public.event(id) ON DELETE CASCADE;


-- Table: public.commit

-- DROP TABLE public.commit;

CREATE TABLE public.commit
(
    id integer NOT NULL DEFAULT nextval('public.commit_id_seq'::regclass),
    summary text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    data jsonb,
    diff jsonb,
    "time" time with time zone,
    "parentId" integer,
    "authorId" integer,
    "eventId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT commit_pkey PRIMARY KEY (id),
    CONSTRAINT "commit_authorId_fkey" FOREIGN KEY ("authorId")
        REFERENCES public.client (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT "commit_eventId_fkey" FOREIGN KEY ("eventId")
        REFERENCES public.event (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT "commit_parentId_fkey" FOREIGN KEY ("parentId")
        REFERENCES public.commit (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

ALTER TABLE public.commit
    OWNER to v2land;

--
-- PostgreSQL database dump complete
--

