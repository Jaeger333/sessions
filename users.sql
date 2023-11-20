CREATE TABLE user (
    ID INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    mobile TEXT NOT NULL,
    role INTEGER NOT NULL
);

DROP TABLE user;