INSERT INTO "users" ("username", "first_name", "last_name", "email", "password", "paid_plan", "mobile", "mobile_ext", "is_confirmed", "gender", "country", "city", "address_line_1", "address_line_2", "postal_code", "role")
VALUES
  ('john', 'John', 'Doe', 'john@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '1234567890', 357, TRUE, 'male', 'USA', 'New York', '123 Main St', NULL, '10001', 'admin'),
  ('jane', 'Jane', 'Smith', 'jane@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '9876543210', 357, TRUE, 'female', 'Canada', 'Toronto', '456 Elm St', 'Apt 102', 'M1M1M1', 'client'),
  ('sam', 'Sam', 'Jackson', 'sam@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '5556667777', 357, FALSE, 'other', 'UK', 'London', '789 Oak St', NULL, 'SW1A 1AA', 'client');


INSERT INTO "draw" ("title", "image_path", "opening_date", "closing_date")
VALUES
  ('Summer Art Contest', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdf_EUfTFmeG2l5SOGWC3MgwO43OCRlxOexuxTJP_yOw&s', '2023-06-01 00:00:00', '2023-07-15 23:59:59'),
  ('Holiday Sketch Challenge', 'https://i.pinimg.com/236x/c0/cb/1e/c0cb1eca075ae50f27bb1079c573a181.jpg', '2023-11-20 00:00:00', '2023-12-31 23:59:59'),
  ('Nature Painting Competition', 'https://burst.shopifycdn.com/photos/seaweed-washed-up-on-beach.jpg?width=1000&format=pjpg&exif=0&iptc=0', '2023-09-10 00:00:00', '2023-10-20 23:59:59');

INSERT INTO "draw_item" ("draw_id", "title", "category", "description", "brief", "price", "winner")
VALUES
  (1, 'Digital Camera', 'electronics', 'High-quality digital camera for capturing moments', 'Capture memories in high resolution', 300, 'john'),
  (1, 'Smart Home Speaker', 'electronics', 'Voice-controlled smart speaker for home entertainment', 'Immersive sound experience at your command', 150, ''),
  (2, 'Winter Jacket', 'clothing', 'Warm and stylish jacket for the winter season', 'Stay cozy and fashionable during winters', 50, ''),
  (2, 'Cookware Set', 'home', 'Complete set of non-stick cookware for your kitchen', 'Make cooking easier with this durable set', 80, ''),
  (3, 'Yoga Retreat', 'vacation', 'Relaxing yoga retreat in a scenic location', 'Rejuvenate your mind and body in nature', 200, 'john'),
  (3, 'Language Course', 'learning', 'Interactive language learning course', 'Learn a new language at your own pace', 30, '');
