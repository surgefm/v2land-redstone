--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6
-- Dumped by pg_dump version 10.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: enum_auth_site; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_auth_site AS ENUM (
    'twitter',
    'weibo',
    'email'
);


--
-- Name: enum_client_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_client_role AS ENUM (
    'admin',
    'manager',
    'contributor'
);


--
-- Name: enum_contact_method; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: enum_contact_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_contact_status AS ENUM (
    'active',
    'inactive',
    'expired'
);


--
-- Name: enum_contact_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_contact_type AS ENUM (
    'email',
    'twitter',
    'weibo',
    'telegram',
    'mobileApp'
);


--
-- Name: enum_critique_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_critique_status AS ENUM (
    'pending',
    'admitted',
    'rejected',
    'removed'
);


--
-- Name: enum_event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_event_status AS ENUM (
    'pending',
    'admitted',
    'rejected',
    'hidden',
    'removed'
);


--
-- Name: enum_news_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_news_status AS ENUM (
    'pending',
    'admitted',
    'rejected',
    'removed'
);


--
-- Name: enum_notification_mode; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: enum_notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_notification_status AS ENUM (
    'pending',
    'ongoing',
    'complete',
    'discarded'
);


--
-- Name: enum_record_action; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: enum_record_model; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: enum_record_operation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_record_operation AS ENUM (
    'create',
    'update',
    'destroy'
);


--
-- Name: enum_reportNotification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_reportNotification_status" AS ENUM (
    'pending',
    'complete',
    'invalid'
);


--
-- Name: enum_report_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_report_method AS ENUM (
    'email',
    'telegram'
);


--
-- Name: enum_report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_report_status AS ENUM (
    'pending',
    'ongoing',
    'complete',
    'invalid'
);


--
-- Name: enum_report_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_report_type AS ENUM (
    'daily',
    'weekly',
    'monthly'
);


--
-- Name: enum_stack_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_stack_status AS ENUM (
    'pending',
    'admitted',
    'invalid',
    'rejected',
    'hidden',
    'removed'
);


--
-- Name: enum_subscription_mode; Type: TYPE; Schema: public; Owner: -
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


--
-- Name: enum_subscription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_subscription_status AS ENUM (
    'active',
    'unsubscribed'
);


--
-- Name: sails_session_store_clear(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sails_session_store_clear() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM sails_session_store;
END;
$$;


--
-- Name: sails_session_store_destroy(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sails_session_store_destroy(sid_in text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM sails_session_store WHERE sid = sid_in;
END;
$$;


--
-- Name: sails_session_store_get(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sails_session_store_get(sid_in text, OUT data_out json) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
  SELECT data FROM sails_session_store WHERE sid = sid_in INTO data_out;
END;
$$;


--
-- Name: sails_session_store_length(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sails_session_store_length(OUT length integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
  SELECT count(*) FROM sails_session_store INTO length;
END;
$$;


--
-- Name: sails_session_store_set(text, json); Type: FUNCTION; Schema: public; Owner: -
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


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: auth; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: auth_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auth_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auth_id_seq OWNED BY public.auth.id;


--
-- Name: client; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: client_events__event_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_events__event_subscribers (
    id integer NOT NULL,
    client_events integer,
    event_subscribers integer
);


--
-- Name: client_events__event_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_events__event_subscribers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_events__event_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_events__event_subscribers_id_seq OWNED BY public.client_events__event_subscribers.id;


--
-- Name: client_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_id_seq OWNED BY public.client.id;


--
-- Name: contact_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: critique_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.critique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: critique; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event (
    name text,
    description text,
    status public.enum_event_status,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    pinyin text,
    "latestAdmittedNewsId" integer,
    latestadmittednewsid integer
);


--
-- Name: event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_id_seq OWNED BY public.event.id;


--
-- Name: headerImage; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: headerimage_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.headerimage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: headerimage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.headerimage_id_seq OWNED BY public."headerImage".id;


--
-- Name: masked_client; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.masked_client (
    real_id integer NOT NULL,
    masking_id text NOT NULL
);


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    url text,
    source text,
    title text,
    abstract text,
    "time" timestamp with time zone,
    status public.enum_news_status,
    comment text,
    "eventId" integer,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "stackId" integer,
    "isInTemporaryStack" boolean
);


--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.record (
    model public.enum_record_model,
    target integer,
    operation public.enum_record_operation,
    action public.enum_record_action,
    data jsonb,
    owner integer,
    id integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    before jsonb
);


--
-- Name: record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.record_id_seq OWNED BY public.record.id;


--
-- Name: report_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report (
    id integer DEFAULT nextval('public.report_id_seq'::regclass) NOT NULL,
    "time" timestamp with time zone DEFAULT '2018-10-26 18:08:13.457+00'::timestamp with time zone NOT NULL,
    type public.enum_report_type DEFAULT 'daily'::public.enum_report_type,
    method public.enum_report_method DEFAULT 'email'::public.enum_report_method,
    status public.enum_report_status DEFAULT 'pending'::public.enum_report_status,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    owner integer
);


--
-- Name: reportNotification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."reportNotification" (
    status public."enum_reportNotification_status" DEFAULT 'pending'::public."enum_reportNotification_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "notificationId" integer NOT NULL,
    "reportId" integer NOT NULL
);


--
-- Name: sails_session_store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sails_session_store (
    sid text NOT NULL,
    data json NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: stack_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stack_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


--
-- Name: stack; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: subscription; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscription_id_seq OWNED BY public.subscription.id;


--
-- Name: auth id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth ALTER COLUMN id SET DEFAULT nextval('public.auth_id_seq'::regclass);


--
-- Name: client id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client ALTER COLUMN id SET DEFAULT nextval('public.client_id_seq'::regclass);


--
-- Name: client_events__event_subscribers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_events__event_subscribers ALTER COLUMN id SET DEFAULT nextval('public.client_events__event_subscribers_id_seq'::regclass);


--
-- Name: event id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);


--
-- Name: headerImage id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."headerImage" ALTER COLUMN id SET DEFAULT nextval('public.headerimage_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record ALTER COLUMN id SET DEFAULT nextval('public.record_id_seq'::regclass);


--
-- Name: subscription id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription ALTER COLUMN id SET DEFAULT nextval('public.subscription_id_seq'::regclass);


--
-- Name: auth auth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_pkey PRIMARY KEY (id);


--
-- Name: client client_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_email_key UNIQUE (email);


--
-- Name: client_events__event_subscribers client_events__event_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_events__event_subscribers
    ADD CONSTRAINT client_events__event_subscribers_pkey PRIMARY KEY (id);


--
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


--
-- Name: client client_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_username_key UNIQUE (username);


--
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


--
-- Name: critique critique_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.critique
    ADD CONSTRAINT critique_pkey PRIMARY KEY (id);


--
-- Name: event event_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_name_key UNIQUE (name);


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);


--
-- Name: headerImage headerimage_event_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."headerImage"
    ADD CONSTRAINT headerimage_event_key UNIQUE ("eventId");


--
-- Name: headerImage headerimage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."headerImage"
    ADD CONSTRAINT headerimage_pkey PRIMARY KEY (id);


--
-- Name: masked_client masked_client_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.masked_client
    ADD CONSTRAINT masked_client_pkey PRIMARY KEY (real_id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: record record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.record
    ADD CONSTRAINT record_pkey PRIMARY KEY (id);


--
-- Name: reportNotification reportNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."reportNotification"
    ADD CONSTRAINT "reportNotification_pkey" PRIMARY KEY ("notificationId", "reportId");


--
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);


--
-- Name: sails_session_store sails_session_store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sails_session_store
    ADD CONSTRAINT sails_session_store_pkey PRIMARY KEY (sid);


--
-- Name: stack stack_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack
    ADD CONSTRAINT stack_pkey PRIMARY KEY (id);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: contact contact_authId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT "contact_authId_fkey" FOREIGN KEY ("authId") REFERENCES public.auth(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contact contact_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_owner_fkey FOREIGN KEY (owner) REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contact contact_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT "contact_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscription(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: critique critique_event_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.critique
    ADD CONSTRAINT critique_event_fkey FOREIGN KEY ("eventId") REFERENCES public.event(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: event event_latestadmittednewsid_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_latestadmittednewsid_fk FOREIGN KEY ("latestAdmittedNewsId") REFERENCES public.news(id) ON DELETE SET NULL;


--
-- Name: headerImage headerimage_event_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."headerImage"
    ADD CONSTRAINT headerimage_event_id_fk FOREIGN KEY ("eventId") REFERENCES public.event(id);


--
-- Name: news news_event_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_event_id_fk FOREIGN KEY ("eventId") REFERENCES public.event(id) ON DELETE CASCADE;


--
-- Name: reportNotification reportNotification_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."reportNotification"
    ADD CONSTRAINT "reportNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reportNotification reportNotification_reportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."reportNotification"
    ADD CONSTRAINT "reportNotification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES public.report(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report report_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_owner_fkey FOREIGN KEY (owner) REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stack stack_event_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stack
    ADD CONSTRAINT stack_event_id_fk FOREIGN KEY ("eventId") REFERENCES public.event(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

