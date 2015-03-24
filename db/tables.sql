DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id bigserial PRIMARY KEY,
    username varchar(20),
    password varchar(250),
    email varchar(50),
    joined timestamp DEFAULT statement_timestamp(),
    active timestamp DEFAULT statement_timestamp(),
    admin boolean DEFAULT false,
    emoji varchar(50) DEFAULT 'awkward.png',
    UNIQUE (username)
);

DROP TABLE IF EXISTS questions CASCADE;
CREATE TABLE questions (
    question_id bigserial PRIMARY KEY,
    question text,
    choices int,
    acceptvotes boolean DEFAULT true,
    user_id bigint,
    username varchar(20),
    creationtime timestamp DEFAULT statement_timestamp(),
    UNIQUE (question, user_id)
);

DROP TABLE IF EXISTS answers CASCADE;
CREATE TABLE answers (
    answer_id bigserial PRIMARY KEY,
    answer text,
    question_id bigint,
    votecount int DEFAULT 0
);

DROP TABLE IF EXISTS votes CASCADE;
CREATE TABLE votes (
    vote_id bigserial PRIMARY KEY,
    answer_id bigint,
    question_id bigint,
    user_id bigint,
    username varchar(20),
    votetime timestamp DEFAULT statement_timestamp(),
    UNIQUE (user_id, question_id)
);

DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    comment_id bigserial PRIMARY KEY,
    question_id bigint,
    user_id bigint,
    username varchar(20),
    emoji varchar(50),
    comment text,
    commenttime timestamp DEFAULT statement_timestamp()
);
