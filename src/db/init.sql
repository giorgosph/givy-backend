CREATE TYPE genders AS ENUM('male', 'female', 'other');
CREATE TYPE plans AS ENUM('basic', 'premium', 'platinum');
CREATE TYPE activities AS ENUM('register', 'login', 'open_app', 'email_confirmation', 'mobile_confirmation', 'reset_password', 'update_details');
CREATE TYPE confirmations AS ENUM('email', 'mobile');

CREATE TABLE IF NOT EXISTS "users" (
  "username" TEXT UNIQUE,
  "first_name" TEXT,
  "last_name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "paid_plan" plans DEFAULT 'basic',
  "mobile" INTEGER UNIQUE,
  "mobile_ext" INTEGER,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "is_confirmed" BOOLEAN DEFAULT FALSE,
  "gender" genders,
  "country" TEXT,
  "city" TEXT,
  "address_line_1" TEXT,
  "address_line_2" TEXT,
  "postal_code" TEXT,
  PRIMARY KEY ("username")
);

CREATE TABLE "user_activity" (
  "username" TEXT NOT NULL,
  "type" activities NOT NULL,
  "last_activity_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("username", "type"),
  FOREIGN KEY ("username") REFERENCES "users"("username")
);

CREATE TABLE "confirmation" (
  "username" TEXT NOT NULL,
  "type" confirmations NOT NULL,
  "sended_date" TIMESTAMP NOT NULL,
  "confirmed_date" TIMESTAMP,
  "notes" TEXT,
  "code" INTEGER,
  PRIMARY KEY ("username", "type"),
  FOREIGN KEY ("username") REFERENCES "users"("username")
);

CREATE TABLE "draw" (
  "id" SERIAL,
  "type" plans DEFAULT 'basic',
  "opening_date" TIMESTAMP NOT NULL,
  "creation_date" TIMESTAMP NOT NULL,
  "closing_date" TIMESTAMP NOT NULL,
  "winner" INTEGER,
  PRIMARY KEY ("id")
);

CREATE TABLE "draw_attenant" (
  "draw_id" INTEGER ,
  "username" TEXT ,
  PRIMARY KEY ("draw_id", "username"),
  FOREIGN KEY ("draw_id") REFERENCES "draw"("id"),
  FOREIGN KEY ("username") REFERENCES "users"("username")
);

CREATE TABLE "draw_item" (
  "id" SERIAL ,
  "draw_id" INTEGER NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "brief" TEXT,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("draw_id") REFERENCES "draw"("id")
);

CREATE TABLE "draw_item_image" (
  "item_id" INTEGER,
  "image_path" TEXT,
  PRIMARY KEY ("item_id", "image_path"),
  FOREIGN KEY ("item_id") REFERENCES "draw_item"("id")
);