DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id bigserial PRIMARY KEY,
    username varchar(20),
    password varchar(250),
    email varchar(50),
    joined timestamp DEFAULT statement_timestamp(),
    active timestamp DEFAULT statement_timestamp(),
    admin boolean DEFAULT false,
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

CREATE OR REPLACE FUNCTION increment_votecount()
RETURNS TRIGGER AS $function$
BEGIN
    UPDATE answers
        SET votecount = votecount + 1
        WHERE answer_id = new.answer_id;
    RETURN new;
END;
$function$ LANGUAGE plpgsql VOLATILE
SECURITY DEFINER;
DROP TRIGGER IF EXISTS vote_trigger ON votes;
CREATE TRIGGER vote_trigger
    AFTER INSERT ON votes
    FOR EACH ROW
    EXECUTE PROCEDURE increment_votecount();

CREATE OR REPLACE FUNCTION decrement_votecount()
RETURNS TRIGGER AS $function$
BEGIN
    UPDATE answers
        SET votecount = votecount - 1
        WHERE answer_id = old.answer_id;
    RETURN old;
END;
$function$ LANGUAGE plpgsql VOLATILE
SECURITY DEFINER;
DROP TRIGGER IF EXISTS revote_trigger ON votes;
CREATE TRIGGER revote_trigger
    AFTER DELETE ON votes
    FOR EACH ROW
    EXECUTE PROCEDURE decrement_votecount();
