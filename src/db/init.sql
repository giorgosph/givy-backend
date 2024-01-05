CREATE TYPE genders AS ENUM('male', 'female', 'other');
CREATE TYPE plans AS ENUM('basic', 'premium', 'platinum');
CREATE TYPE roles AS ENUM('client', 'admin');
CREATE TYPE activities AS ENUM('register', 'login', 'open_app', 'email_confirmation', 'mobile_confirmation', 'reset_password', 'update_details');
CREATE TYPE confirmations AS ENUM('email', 'mobile', 'forgot_password');
CREATE TYPE draw_location AS ENUM('any', 'london', 'reading', 'surrey', 'southampton'); -- When expanded can be fetched from an external database ??
CREATE TYPE draw_categories AS ENUM('general', 'electronics', 'home', 'clothing', 'personal_care', 'vacation', 'learning', 'gaming', 'stationery', 'hospitality');

CREATE TABLE IF NOT EXISTS "users" (
  "username" TEXT UNIQUE, -- TODO -> filter username to add/remove a unique key infront of the original
  "first_name" TEXT,
  "last_name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "paid_plan" plans DEFAULT 'basic',
  "mobile" TEXT UNIQUE,
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
  "brief" TEXT,
  "plan" plans DEFAULT 'basic',
  "image_path" TEXT,
  "country" TEXT, -- Not null when applicaiton will be used in different countries
  "location" draw_location DEFAULT 'any',
  "category" draw_categories DEFAULT 'general', -- general category may be removed, also in future may add sub categories or many categories for one draw (ex. clothing-outdoor)
  "opening_date" TIMESTAMP NOT NULL,
  "creation_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "closing_date" TIMESTAMP NOT NULL,
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
  "description" TEXT,
  "image_path" TEXT, -- remove if will use draw_item_image for multiple images per item
  "brief" TEXT,
  "price" INTEGER,
  "winner" TEXT,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("draw_id") REFERENCES "draw"("id")
);

CREATE TABLE IF NOT EXISTS "draw_item_image" (
  "item_id" INTEGER,
  "image_path" TEXT,
  PRIMARY KEY ("item_id", "image_path"),
  FOREIGN KEY ("item_id") REFERENCES "draw_item"("id")
);