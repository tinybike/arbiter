INSERT INTO users
(username, password, email, admin)
VALUES
('jack', '$2a$12$oBDO3448QQ607oF6sjcT2uFYiQhOrKq/WudSc8HtEllJGwPzLRayC', 'jack@tinybike.net', true);

INSERT INTO questions
(question, choices, acceptvotes, user_id, username)
VALUES
('Is the answer true, false, or maybe?', 3, true, 1, 'jack')
RETURNING question_id;

INSERT INTO answers
(answer, question_id)
VALUES
('True', 1),
('False', 1),
('Maybe', 1);

INSERT INTO questions
(question, choices, acceptvotes, user_id, username)
VALUES
('Is the answer still true, false, or maybe?', 3, true, 1, 'jack')
RETURNING question_id;

INSERT INTO answers
(answer, question_id)
VALUES
('True', 2),
('False', 2),
('Maybe', 2);

INSERT INTO questions
(question, choices, acceptvotes, user_id, username)
VALUES
('Lol?', 2, true, 1, 'jack')
RETURNING question_id;

INSERT INTO answers
(answer, question_id)
VALUES
('True', 3),
('False', 3);

INSERT INTO votes
(answer_id, question_id, user_id, username)
VALUES
(3, 2, 1, 'jack');

INSERT INTO votes
(answer_id, question_id, user_id, username)
VALUES
(7, 1, 1, 'jack');

-- expect error!
INSERT INTO votes
(answer_id, question_id, user_id, username)
VALUES
(7, 1, 1, 'jack');

DELETE FROM votes
WHERE user_id = 1 AND question_id = 1;
