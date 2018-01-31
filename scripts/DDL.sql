create table if not exists sails_session_store
(
	sid text not null
		constraint sails_session_store_pkey
			primary key,
	data json not null,
	created_at timestamp default CURRENT_TIMESTAMP not null
)
;

create table if not exists upload
(
	id serial not null
		constraint upload_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists auth
(
	site text,
	"profileId" text,
	profile text,
	token text,
	"tokenSecret" text,
	"accessToken" text,
	"accessTokenSecret" text,
	"refreshToken" text,
	redirect text,
	owner integer,
	id serial not null
		constraint auth_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists client
(
	username text
		constraint client_username_key
			unique,
	password text,
	role text,
	id serial not null
		constraint client_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists event
(
	name text
		constraint event_name_key
			unique,
	description text,
	status text,
	"headerImage" integer,
	id serial not null
		constraint event_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists headerimage
(
	"imageUrl" text,
	source text,
	"sourceUrl" text,
	event integer
		constraint headerimage_event_key
			unique,
	id serial not null
		constraint headerimage_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists news
(
	url text,
	source text,
	title text,
	abstract text,
	time date,
	status text,
	event integer,
	id serial not null
		constraint news_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists notification
(
	time date,
	mode text,
	event integer,
	id serial not null
		constraint notification_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists record
(
	model text,
	target integer,
	operation text,
	action text,
	data json,
	client integer,
	id serial not null
		constraint record_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists subscription
(
	mode text,
	method text,
	contact text,
	status text,
	"unsubscribeId" text,
	subscriber integer,
	event integer,
	notification integer,
	id serial not null
		constraint subscription_pkey
			primary key,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
)
;

create table if not exists client_events__event_subscribers
(
	id serial not null
		constraint client_events__event_subscribers_pkey
			primary key,
	client_events integer,
	event_subscribers integer
)
;

create or replace function sails_session_store_set(sid_in text, data_in json) returns void
	language plpgsql
as $$
BEGIN
  -- delete current session data if it exists so the next insert succeeds
  DELETE FROM sails_session_store WHERE sid = sid_in;
  INSERT INTO sails_session_store(sid, data) VALUES(sid_in, data_in);
END;
$$
;

create or replace function sails_session_store_get(sid_in text, OUT data_out json) returns json
	language plpgsql
as $$
BEGIN
  SELECT data FROM sails_session_store WHERE sid = sid_in INTO data_out;
END;
$$
;

create or replace function sails_session_store_destroy(sid_in text) returns void
	language plpgsql
as $$
BEGIN
  DELETE FROM sails_session_store WHERE sid = sid_in;
END;
$$
;

create or replace function sails_session_store_length(OUT length integer) returns integer
	language plpgsql
as $$
BEGIN
  SELECT count(*) FROM sails_session_store INTO length;
END;
$$
;

create or replace function sails_session_store_clear() returns void
	language plpgsql
as $$
BEGIN
  DELETE FROM sails_session_store;
END;
$$
;

create or replace function create_event(_name text, _description text) returns event
	language plpgsql
as $$
DECLARE
    time_now TIMESTAMP;
BEGIN
  time_now := now();
  INSERT INTO event(name, description, "createdAt", "updatedAt")
    VALUES (_name, _description, time_now, time_now);
  SELECT * FROM event WHERE name=_name;
END;
$$
;

