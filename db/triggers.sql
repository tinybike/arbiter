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

CREATE OR REPLACE FUNCTION increment_comments()
RETURNS TRIGGER AS $function$
BEGIN
    UPDATE questions
        SET comments = comments + 1
        WHERE question_id = new.question_id;
    RETURN new;
END;
$function$ LANGUAGE plpgsql VOLATILE
SECURITY DEFINER;
DROP TRIGGER IF EXISTS comment_trigger ON comments;
CREATE TRIGGER comment_trigger
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE PROCEDURE increment_comments();

CREATE OR REPLACE FUNCTION decrement_comments()
RETURNS TRIGGER AS $function$
BEGIN
    UPDATE questions
        SET comments = comments - 1
        WHERE question_id = old.question_id;
    RETURN old;
END;
$function$ LANGUAGE plpgsql VOLATILE
SECURITY DEFINER;
DROP TRIGGER IF EXISTS remove_comment_trigger ON comments;
CREATE TRIGGER remove_comment_trigger
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE PROCEDURE decrement_comments();
