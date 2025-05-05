--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tarefa; Type: TABLE; Schema: public; Owner: tarefa_aula
--

CREATE TABLE public.tarefa (
    id integer NOT NULL,
    descricao text,
    data_criacao timestamp without time zone DEFAULT date(now()),
    data_previsao timestamp without time zone,
    data_encerramento timestamp without time zone,
    situacao boolean
);


ALTER TABLE public.tarefa OWNER TO tarefa_aula;

--
-- Name: tarefa_id_seq; Type: SEQUENCE; Schema: public; Owner: tarefa_aula
--

CREATE SEQUENCE public.tarefa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarefa_id_seq OWNER TO tarefa_aula;

--
-- Name: tarefa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tarefa_aula
--

ALTER SEQUENCE public.tarefa_id_seq OWNED BY public.tarefa.id;


--
-- Name: tarefa id; Type: DEFAULT; Schema: public; Owner: tarefa_aula
--

ALTER TABLE ONLY public.tarefa ALTER COLUMN id SET DEFAULT nextval('public.tarefa_id_seq'::regclass);


--
-- Data for Name: tarefa; Type: TABLE DATA; Schema: public; Owner: tarefa_aula
--

COPY public.tarefa (id, descricao, data_criacao, data_previsao, data_encerramento, situacao) FROM stdin;
2	descricao 1	2025-03-20 08:00:00	2025-03-25 17:00:00	2025-03-24 16:00:00	t
3	descricao 2	2025-03-21 09:30:00	2025-03-26 12:00:00	\N	f
4	descricao 3	2025-03-22 10:00:00	2025-03-27 15:00:00	\N	f
5	descricao 4	2025-03-23 11:45:00	2025-03-28 18:00:00	2025-03-28 16:45:00	t
6	descricao 5	2025-03-24 08:20:00	2025-03-29 17:30:00	2025-03-29 17:00:00	t
7	descricao 6	2025-03-25 09:10:00	2025-03-30 14:00:00	\N	f
8	descricao 7	2025-03-26 07:50:00	2025-03-31 16:00:00	\N	f
9	descricao 8	2025-03-27 10:15:00	2025-04-01 18:00:00	2025-04-01 17:30:00	t
10	descricao 9	2025-03-28 08:40:00	2025-04-02 12:00:00	\N	f
11	descricao 10	2025-03-29 09:00:00	2025-04-03 17:00:00	2025-04-03 16:00:00	t
\.


--
-- Name: tarefa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tarefa_aula
--

SELECT pg_catalog.setval('public.tarefa_id_seq', 11, true);


--
-- Name: tarefa tarefa_pkey; Type: CONSTRAINT; Schema: public; Owner: tarefa_aula
--

ALTER TABLE ONLY public.tarefa
    ADD CONSTRAINT tarefa_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

