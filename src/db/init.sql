CREATE TYPE genders AS ENUM('male', 'female', 'other');
CREATE TYPE plans AS ENUM('basic', 'premium', 'platinum');
CREATE TYPE roles AS ENUM('client', 'admin');
CREATE TYPE activities AS ENUM('register', 'login', 'open_app', 'email_confirmation', 'mobile_confirmation', 'reset_password', 'update_details');
CREATE TYPE confirmations AS ENUM('email', 'mobile');
CREATE TYPE item_categories AS ENUM('electronics', 'home', 'clothing', 'personal_care', 'vacation', 'learning');

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
  "role" roles DEFAULT 'client',
  PRIMARY KEY ("username")
);

CREATE TABLE IF NOT EXISTS "user_activity" (
  "username" TEXT NOT NULL,
  "type" activities NOT NULL,
  "last_activity_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("username", "type"),
  FOREIGN KEY ("username") REFERENCES "users"("username")
);

CREATE TABLE IF NOT EXISTS "confirmation" (
  "username" TEXT NOT NULL,
  "type" confirmations NOT NULL,
  "sended_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "code" INTEGER,
  PRIMARY KEY ("username", "type"),
  FOREIGN KEY ("username") REFERENCES "users"("username")
);

CREATE TABLE IF NOT EXISTS "draw" (
  "id" SERIAL,
  "title" TEXT NOT NULL,
  "type" plans DEFAULT 'basic',
  "image_path" TEXT,
  "opening_date" TIMESTAMP NOT NULL,
  "creation_date" TIMESTAMP NOT NULL,
  "closing_date" TIMESTAMP NOT NULL,
  "winner" INTEGER,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "draw_attenant" (
  "draw_id" INTEGER ,
  "username" TEXT ,
  PRIMARY KEY ("draw_id", "username"),
  FOREIGN KEY ("draw_id") REFERENCES "draw"("id"),
  FOREIGN KEY ("username") REFERENCES "users"("username")
);

CREATE TABLE IF NOT EXISTS "draw_item" (
  "id" SERIAL ,
  "draw_id" INTEGER NOT NULL,
  "title" TEXT,
  "category" item_categories,
  "description" TEXT,
  "image_path" TEXT,
  "brief" TEXT,
  "price" INTEGER,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("draw_id") REFERENCES "draw"("id")
);

CREATE TABLE IF NOT EXISTS "draw_item_image" (
  "item_id" INTEGER,
  "image_path" TEXT,
  PRIMARY KEY ("item_id", "image_path"),
  FOREIGN KEY ("item_id") REFERENCES "draw_item"("id")
);