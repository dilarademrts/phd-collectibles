--
-- PostgreSQL database dump
--

\restrict QE8vdSWXROy5K13fFbY9o5O2XrLWfG6VV2MbJe2HrVoB7BFHXEwFOSZOv0Auedp

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2025-12-19 23:43:33

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16705)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 16786)
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    cart_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16802)
-- Name: cart_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_item (
    cart_item_id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT cart_item_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.cart_item OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16759)
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16920)
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    invoice_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16896)
-- Name: live_claim; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.live_claim (
    live_claim_id uuid DEFAULT gen_random_uuid() NOT NULL,
    live_sale_id uuid NOT NULL,
    user_id uuid,
    message_text text NOT NULL,
    message_time timestamp without time zone DEFAULT now(),
    is_winner boolean DEFAULT false
);


ALTER TABLE public.live_claim OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16884)
-- Name: live_sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.live_sale (
    live_sale_id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    stream_platform character varying(100),
    stream_id character varying(150),
    start_time timestamp without time zone,
    end_time timestamp without time zone
);


ALTER TABLE public.live_sale OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16840)
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    order_item_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price double precision NOT NULL,
    CONSTRAINT order_item_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16824)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    status character varying(50) NOT NULL,
    total_amount double precision NOT NULL,
    order_date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16862)
-- Name: preorder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preorder (
    preorder_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL
);


ALTER TABLE public.preorder OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16769)
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    product_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    price double precision NOT NULL,
    stock_quantity integer DEFAULT 0,
    category_id uuid,
    image_url text
);


ALTER TABLE public.product OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16743)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(50) DEFAULT 'customer'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5148 (class 0 OID 16786)
-- Dependencies: 223
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (cart_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5149 (class 0 OID 16802)
-- Dependencies: 224
-- Data for Name: cart_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_item (cart_item_id, cart_id, product_id, quantity) FROM stdin;
\.


--
-- TOC entry 5146 (class 0 OID 16759)
-- Dependencies: 221
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (category_id, name) FROM stdin;
dd97061d-f658-444c-a9a5-25e357d9a0d3	Comics
7d76c3ef-49bb-4535-85b8-73444c9b75a7	Figures
b4bdef93-c659-476d-8e2b-a1dbf8bc184f	Cards
\.


--
-- TOC entry 5155 (class 0 OID 16920)
-- Dependencies: 230
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (invoice_id, order_id, file_name, file_path, created_at) FROM stdin;
7d41185e-7c47-4449-a56d-2485bb9327fd	2b1d8b46-cf58-447c-a162-ed0ed1dc10c7	invoice-2b1d8b46-cf58-447c-a162-ed0ed1dc10c7.pdf	C:\\Users\\35sed\\phd-collectibles\\backend\\invoices\\invoice-2b1d8b46-cf58-447c-a162-ed0ed1dc10c7.pdf	2025-12-16 03:18:00.934983
02634851-808f-47c9-b713-14620cacfafd	55664fc5-bbeb-41dc-837d-2def0478a03e	invoice-55664fc5-bbeb-41dc-837d-2def0478a03e.pdf	C:\\Users\\35sed\\phd-collectibles\\backend\\invoices\\invoice-55664fc5-bbeb-41dc-837d-2def0478a03e.pdf	2025-12-17 23:39:48.861465
f1703c38-3e4f-40a1-898c-62b467106cf2	55664fc5-bbeb-41dc-837d-2def0478a03e	invoice-55664fc5-bbeb-41dc-837d-2def0478a03e.pdf	C:\\Users\\35sed\\phd-collectibles\\backend\\invoices\\invoice-55664fc5-bbeb-41dc-837d-2def0478a03e.pdf	2025-12-18 01:37:20.649231
7fdc64b5-538a-40e5-82fa-1a9a009aaade	44defb5a-a4c3-4714-bad3-af7e7e68b5e8	invoice-44defb5a-a4c3-4714-bad3-af7e7e68b5e8.pdf	C:\\Users\\35sed\\phd-collectibles\\backend\\invoices\\invoice-44defb5a-a4c3-4714-bad3-af7e7e68b5e8.pdf	2025-12-18 02:20:55.835429
59df8065-83b1-40ca-8be4-465accc678a7	979abda1-a058-41d5-a640-ed845b3c62ad	invoice-979abda1-a058-41d5-a640-ed845b3c62ad.pdf	C:\\Users\\35sed\\phd-collectibles\\backend\\invoices\\invoice-979abda1-a058-41d5-a640-ed845b3c62ad.pdf	2025-12-19 01:13:22.160986
\.


--
-- TOC entry 5154 (class 0 OID 16896)
-- Dependencies: 229
-- Data for Name: live_claim; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.live_claim (live_claim_id, live_sale_id, user_id, message_text, message_time, is_winner) FROM stdin;
6ffdc4fd-0b72-4218-bd2b-7bd0476cd380	b627fbee-8cf0-490e-a655-5888a3ee6313	\N	Ali satın aldım! (Iron Man #1)	2025-12-17 23:21:11.942775	t
b0a0bc3b-f977-4109-9aac-e230a59f5d8a	b627fbee-8cf0-490e-a655-5888a3ee6313	\N	Ali satın aldım! (Amazing Fantasy #15)	2025-12-18 01:44:40.845104	t
133b4a7e-d12a-47de-ba41-7d672b82bef7	2c7e91f7-f2b1-4b84-a3bc-830b812db8dc	\N	Ali satın aldım! (Black Panther #1)	2025-12-19 01:13:05.235794	t
\.


--
-- TOC entry 5153 (class 0 OID 16884)
-- Dependencies: 228
-- Data for Name: live_sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.live_sale (live_sale_id, product_id, stream_platform, stream_id, start_time, end_time) FROM stdin;
b627fbee-8cf0-490e-a655-5888a3ee6313	\N	Instagram	demo1	2025-12-17 23:15:18.090444	\N
51bc9584-330c-4562-80ce-5acaf8e27a18	\N	Instagram	demo-admin	2025-12-18 22:42:53.288338	\N
df760e66-d620-4c5f-87d2-1eebdeb0b1cb	\N	Instagram	demo-admin	2025-12-18 22:53:15.385586	\N
2c7e91f7-f2b1-4b84-a3bc-830b812db8dc	\N	Instagram	demo-admin	2025-12-19 01:13:02.062082	\N
\.


--
-- TOC entry 5151 (class 0 OID 16840)
-- Dependencies: 226
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item (order_item_id, order_id, product_id, quantity, unit_price) FROM stdin;
4776ea2c-ae8a-41da-bc7d-08481de086d6	2b1d8b46-cf58-447c-a162-ed0ed1dc10c7	f90a3033-e33b-421b-95e3-7c802be46b8e	1	50
4509c9d4-c259-45d7-b007-d0d115039486	55664fc5-bbeb-41dc-837d-2def0478a03e	bdbbb11e-5465-41f1-80f7-f8bce245f11c	1	1200
c5466cda-6170-496b-a10f-20ade04221c8	44defb5a-a4c3-4714-bad3-af7e7e68b5e8	f90a3033-e33b-421b-95e3-7c802be46b8e	1	45000
38675e59-8914-412b-8dff-c169f5dee4a0	979abda1-a058-41d5-a640-ed845b3c62ad	456f3e85-9775-4c27-8036-ebaac549509d	1	800
\.


--
-- TOC entry 5150 (class 0 OID 16824)
-- Dependencies: 225
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, user_id, status, total_amount, order_date) FROM stdin;
2b1d8b46-cf58-447c-a162-ed0ed1dc10c7	\N	completed	50	2025-12-16 03:00:05.024195
55664fc5-bbeb-41dc-837d-2def0478a03e	\N	completed	1200	2025-12-17 23:21:11.942775
44defb5a-a4c3-4714-bad3-af7e7e68b5e8	\N	completed	45000	2025-12-18 01:44:40.845104
979abda1-a058-41d5-a640-ed845b3c62ad	\N	completed	800	2025-12-19 01:13:05.235794
\.


--
-- TOC entry 5152 (class 0 OID 16862)
-- Dependencies: 227
-- Data for Name: preorder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preorder (preorder_id, user_id, product_id, quantity, status) FROM stdin;
\.


--
-- TOC entry 5147 (class 0 OID 16769)
-- Dependencies: 222
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (product_id, name, description, price, stock_quantity, category_id, image_url) FROM stdin;
2be18bc1-bc23-498f-91b0-e914c86d9587	X-Men #1 (1963)	First appearance of X-Men and Magneto. Stan Lee & Jack Kirby.	15000	1	dd97061d-f658-444c-a9a5-25e357d9a0d3	https://upload.wikimedia.org/wikipedia/en/2/23/X-Men1.jpg
78df4cb0-9dd9-40cf-b412-a8477739e38a	Detective Comics #27	First appearance of Batman. Holy grail of comics.	250000	1	dd97061d-f658-444c-a9a5-25e357d9a0d3	https://upload.wikimedia.org/wikipedia/en/b/b5/Detective_Comics_27_%28May_1939%29.jpg
bdbbb11e-5465-41f1-80f7-f8bce245f11c	Iron Man #1	First issue of the solo series. Archie Goodwin story.	1200	0	dd97061d-f658-444c-a9a5-25e357d9a0d3	https://d1466nnw0ex81e.cloudfront.net/n_iv/600/984362.jpg
f90a3033-e33b-421b-95e3-7c802be46b8e	Amazing Fantasy #15	First appearance of Spider-Man. Origin story.	45000	0	dd97061d-f658-444c-a9a5-25e357d9a0d3	https://upload.wikimedia.org/wikipedia/en/f/f3/Amazing_Fantasy_15.jpg
456f3e85-9775-4c27-8036-ebaac549509d	Black Panther #1	First solo series. Jack Kirby cover art.	800	0	dd97061d-f658-444c-a9a5-25e357d9a0d3	https://d1466nnw0ex81e.cloudfront.net/n_iv/600/624647.jpg
\.


--
-- TOC entry 5145 (class 0 OID 16743)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, password_hash, role, created_at) FROM stdin;
\.


--
-- TOC entry 4971 (class 2606 OID 16812)
-- Name: cart_item cart_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_pkey PRIMARY KEY (cart_item_id);


--
-- TOC entry 4967 (class 2606 OID 16794)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 4969 (class 2606 OID 16796)
-- Name: cart cart_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_key UNIQUE (user_id);


--
-- TOC entry 4961 (class 2606 OID 16768)
-- Name: category category_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_name_key UNIQUE (name);


--
-- TOC entry 4963 (class 2606 OID 16766)
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4984 (class 2606 OID 16932)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- TOC entry 4982 (class 2606 OID 16909)
-- Name: live_claim live_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.live_claim
    ADD CONSTRAINT live_claim_pkey PRIMARY KEY (live_claim_id);


--
-- TOC entry 4980 (class 2606 OID 16890)
-- Name: live_sale live_sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.live_sale
    ADD CONSTRAINT live_sale_pkey PRIMARY KEY (live_sale_id);


--
-- TOC entry 4976 (class 2606 OID 16851)
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (order_item_id);


--
-- TOC entry 4974 (class 2606 OID 16834)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4978 (class 2606 OID 16873)
-- Name: preorder preorder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preorder
    ADD CONSTRAINT preorder_pkey PRIMARY KEY (preorder_id);


--
-- TOC entry 4965 (class 2606 OID 16780)
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (product_id);


--
-- TOC entry 4957 (class 2606 OID 16758)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4959 (class 2606 OID 16756)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4972 (class 1259 OID 16823)
-- Name: uniq_cart_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_cart_product ON public.cart_item USING btree (cart_id, product_id);


--
-- TOC entry 4987 (class 2606 OID 16813)
-- Name: cart_item cart_item_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(cart_id) ON DELETE CASCADE;


--
-- TOC entry 4988 (class 2606 OID 16818)
-- Name: cart_item cart_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE CASCADE;


--
-- TOC entry 4986 (class 2606 OID 16797)
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 16933)
-- Name: invoices invoices_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 16910)
-- Name: live_claim live_claim_live_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.live_claim
    ADD CONSTRAINT live_claim_live_sale_id_fkey FOREIGN KEY (live_sale_id) REFERENCES public.live_sale(live_sale_id) ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 16915)
-- Name: live_claim live_claim_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.live_claim
    ADD CONSTRAINT live_claim_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 16891)
-- Name: live_sale live_sale_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.live_sale
    ADD CONSTRAINT live_sale_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id) ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 16852)
-- Name: order_item order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 16857)
-- Name: order_item order_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id);


--
-- TOC entry 4989 (class 2606 OID 16835)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 16879)
-- Name: preorder preorder_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preorder
    ADD CONSTRAINT preorder_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id);


--
-- TOC entry 4993 (class 2606 OID 16874)
-- Name: preorder preorder_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preorder
    ADD CONSTRAINT preorder_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4985 (class 2606 OID 16781)
-- Name: product product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE SET NULL;


-- Completed on 2025-12-19 23:43:33

--
-- PostgreSQL database dump complete
--

\unrestrict QE8vdSWXROy5K13fFbY9o5O2XrLWfG6VV2MbJe2HrVoB7BFHXEwFOSZOv0Auedp

