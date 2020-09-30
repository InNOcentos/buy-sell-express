DROP DATABASE IF EXISTS academy_buy_sell;
DROP ROLE IF EXISTS academy_buy_sell;

CREATE ROLE academy_buy_sell
    WITH
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    LOGIN
    PASSWORD 'Shamanking99'
    CONNECTION LIMIT -1;

CREATE DATABASE academy_buy_sell
    WITH
    OWNER = academy_buy_sell
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    TEMPLATE template0
    CONNECTION LIMIT = -1;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS offers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS offers_categories;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS offers_types;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS users_offers_comments;

CREATE TABLE users
(
    id BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    avatar TEXT
);

CREATE TABLE offers
(
	id BIGSERIAL PRIMARY KEY,
	title VARCHAR(100) NOT NULL,
	image TEXT,
	sum DECIMAL(10, 2) NOT NULL,
	description VARCHAR(1000) NOT NULL,
	user_id BIGINT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE categories
(
	id SERIAL PRIMARY KEY,
	title VARCHAR(50) NOT NULL
);

CREATE TABLE offers_categories
(
  offer_id BIGINT,
  category_id INT,
  CONSTRAINT offers_categories_pk PRIMARY KEY(offer_id, category_id),
  FOREIGN KEY(offer_id) REFERENCES offers
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY(category_id) REFERENCES categories
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE types
(
	id SERIAL PRIMARY KEY,
	title VARCHAR(10) NOT NULL
);

CREATE TABLE offers_types
(
	offer_id BIGINT,
    type_id SMALLINT,
    CONSTRAINT offers_types_pk PRIMARY KEY(offer_id, type_id),
    FOREIGN KEY(offer_id) REFERENCES offers
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(type_id) REFERENCES types
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE comments
(
  id BIGSERIAL PRIMARY KEY,
  message VARCHAR(300) NOT NULL
);

CREATE TABLE users_offers_comments
(
    users_id BIGINT,
    offers_id BIGINT,
    comment_id BIGINT,
    CONSTRAINT users_offers_comments_pk PRIMARY KEY(users_id, offers_id, comment_id),
    FOREIGN KEY(users_id) REFERENCES users
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(offers_id) REFERENCES offers
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(comment_id) REFERENCES comments
        ON UPDATE CASCADE
        ON DELETE CASCADE
);









