INSERT INTO "users" ("username", "first_name", "last_name", "email", "password", "paid_plan", "mobile", "mobile_ext", "is_confirmed", "gender", "country", "city", "address_line_1", "address_line_2", "postal_code", "role")
VALUES
  ('0000$john', 'John', 'Doe', 'john@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '1234567890', 357, TRUE, 'male', 'USA', 'New York', '123 Main St', NULL, '10001', 'admin'),
  ('0000$jane', 'Jane', 'Smith', 'jane@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '9876543210', 357, TRUE, 'female', 'Canada', 'Toronto', '456 Elm St', 'Apt 102', 'M1M1M1', 'client'),
  ('0000$sam', 'Sam', 'Jackson', 'sam@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '5556667777', 357, FALSE, 'other', 'UK', 'London', '789 Oak St', NULL, 'SW1A 1AA', 'client'),
  ('0000$gph', 'Sam', 'Jackson', 'gph@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '5556667776', 357, FALSE, 'other', 'UK', 'London', '789 Oak St', NULL, 'SW1A 1AA', 'client'),
  ('0000$gg', 'Sam', 'Jackson', 'gg@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '5556667775', 357, FALSE, 'other', 'UK', 'London', '789 Oak St', NULL, 'SW1A 1AA', 'client'),
  ('0000$mamas', 'Sam', 'Jackson', 'mamas@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '5556667774', 357, FALSE, 'other', 'UK', 'London', '789 Oak St', NULL, 'SW1A 1AA', 'client'),
  ('0000$mamas11', 'Sam', 'Jackson', 'mamas11@example.com', '$2b$10$99Y4iROjhjrWOIE1XdUhDuJ6y232wQjxxDmvjk03egan5vryXfjyK', 'basic', '5556667773', 357, FALSE, 'other', 'UK', 'London', '789 Oak St', NULL, 'SW1A 1AA', 'client');

INSERT INTO "draw" ("title", "image_path", "opening_date", "closing_date", "country", "location", "category")
VALUES
  ('Summer Art Contest', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdf_EUfTFmeG2l5SOGWC3MgwO43OCRlxOexuxTJP_yOw&s', '2023-06-01 00:00:00', '2023-07-15 23:59:59', 'UK', 'london', 'electronics'),
  ('Holiday Sketch Challenge', 'https://i.pinimg.com/236x/c0/cb/1e/c0cb1eca075ae50f27bb1079c573a181.jpg', '2023-11-20 00:00:00', '2023-12-31 23:59:59', 'UK', 'london', 'electronics'),
  ('Nature Painting Competition', 'https://burst.shopifycdn.com/photos/seaweed-washed-up-on-beach.jpg?width=1000&format=pjpg&exif=0&iptc=0', '2023-09-10 00:00:00', '2023-10-20 23:59:59', 'UK', 'london', 'home'),
  ('Cityscape Painting Contest', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdf_EUfTFmeG2l5SOGWC3MgwO43OCRlxOexuxTJP_yOw&s', '2024-01-03', '2024-01-20', 'USA', 'surrey', 'gaming'),
  ('Tech Gadgets Giveaway', 'https://i.pinimg.com/236x/c0/cb/1e/c0cb1eca075ae50f27bb1079c573a181.jpg', '2024-01-05', '2024-01-25', 'UK', 'london', 'electronics'),
  ('Winter Fashion Challenge', 'https://example.com/image3.jpg', '2024-01-08', '2024-01-30', 'Canada', 'reading', 'clothing'),
  ('Home Renovation Sweepstakes', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdf_EUfTFmeG2l5SOGWC3MgwO43OCRlxOexuxTJP_yOw&s', '2024-01-02', '2024-01-22', 'USA', 'reading', 'home'),
  ('Healthy Living Raffle', 'https://i.pinimg.com/236x/c0/cb/1e/c0cb1eca075ae50f27bb1079c573a181.jpg', '2024-01-06', '2024-01-28', 'Australia', 'southampton', 'personal_care'),
  ('Adventure Getaway Draw', 'https://burst.shopifycdn.com/photos/seaweed-washed-up-on-beach.jpg?width=1000&format=pjpg&exif=0&iptc=0', '2024-01-07', '2024-01-27', 'France', 'reading', 'vacation'),
  ('Spring Photography Contest', 'https://example.com/image4.jpg', NOW(), NOW() + INTERVAL '5 minutes', 'USA', 'london', 'electronics'),
  ('Summer Cooking Challenge', 'https://example.com/image5.jpg', NOW(), NOW() + INTERVAL '15 minutes', 'Canada', 'reading', 'home');

INSERT INTO "draw_item" ("draw_id", "title", "description", "brief", "price", "winner")
VALUES
  (1, 'Digital Camera', 'High-quality digital camera for capturing moments', 'Capture memories in high resolution', 300, 'john'),
  (1, 'Smart Home Speaker', 'Voice-controlled smart speaker for home entertainment', 'Immersive sound experience at your command', 150, ''),
  (2, 'Winter Jacket', 'Warm and stylish jacket for the winter season', 'Stay cozy and fashionable during winters', 50, ''),
  (2, 'Cookware Set', 'Complete set of non-stick cookware for your kitchen', 'Make cooking easier with this durable set', 80, ''),
  (3, 'Yoga Retreat', 'Relaxing yoga retreat in a scenic location', 'Rejuvenate your mind and body in nature', 200, 'john'),
  (3, 'Language Course', 'Interactive language learning course', 'Learn a new language at your own pace', 30, ''),
  (4, 'Smart Home Lighting Kit', 'Illuminate your home with smart lighting solutions', 'Enhance ambiance and save energy', 120, ''),
  (4, 'Power Drill Set', 'Complete drill set for all your DIY projects', 'Make drilling tasks effortless', 90, ''),
  (5, 'Wireless Headphones', 'Premium headphones for immersive sound experience', 'Enjoy music without wires', 200, ''),
  (5, 'Portable Charger', 'Stay charged on the go with this power bank', 'Charge devices anywhere', 40, ''),
  (6, 'Skiing Gear Package', 'Top-quality skiing gear for winter sports enthusiasts', 'Stay warm and stylish on the slopes', 300, ''),
  (6, 'Thermal Underwear Set', 'Comfortable and insulated underwear for cold weather', 'Stay cozy during outdoor activities', 60, ''),
  (7, 'Fitness Tracker', 'Track your fitness goals and stay healthy', 'Monitor activities and health metrics', 80, ''),
  (7, 'Healthy Recipe Book', 'Collection of nutritious recipes for a balanced lifestyle', 'Cook healthy meals easily', 25, ''),
  (8, 'Culinary Class Retreat', 'Join a culinary retreat for a gastronomic experience', 'Learn from expert chefs in a scenic location', 250, ''),
  (8, 'Yoga & Meditation Retreat', 'Relax and rejuvenate with yoga and meditation sessions', 'Find inner peace in a serene environment', 150, ''),
  (9, 'Thermal Underwear Set', 'Comfortable and insulated underwear for cold weather', 'Stay cozy during outdoor activities', 60, ''),
  (9, 'Fitness Tracker', 'Track your fitness goals and stay healthy', 'Monitor activities and health metrics', 80, ''),
  (9, 'Healthy Recipe Book', 'Collection of nutritious recipes for a balanced lifestyle', 'Cook healthy meals easily', 25, ''),
  (10, 'Culinary Class Retreat', 'Join a culinary retreat for a gastronomic experience', 'Learn from expert chefs in a scenic location', 250, ''),
  (10, 'Yoga & Meditation Retreat', 'Relax and rejuvenate with yoga and meditation sessions', 'Find inner peace in a serene environment', 150, ''),
  (11, 'Thermal Underwear Set', 'Comfortable and insulated underwear for cold weather', 'Stay cozy during outdoor activities', 60, ''),
  (11, 'Fitness Tracker', 'Track your fitness goals and stay healthy', 'Monitor activities and health metrics', 80, ''),
  (11, 'Healthy Recipe Book', 'Collection of nutritious recipes for a balanced lifestyle', 'Cook healthy meals easily', 25, '');

INSERT INTO "draw_attenant" ("draw_id", "username")
  SELECT 9, "username" FROM "users";
INSERT INTO "draw_attenant" ("draw_id", "username")
  SELECT 10, "username" FROM "users";