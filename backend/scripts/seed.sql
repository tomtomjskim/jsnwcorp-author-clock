-- Seed script for Author Clock quotes
-- This will insert Korean and English quotes into the database

\echo '🌱 Starting database seeding...'

-- Korean quotes (30)
INSERT INTO author_clock.quotes (text, author, source, source_url, language, category, is_public_domain, is_approved) VALUES
('삶이 있는 한 희망은 있다', '키케로', '투스쿨룸 대화', 'https://en.wikipedia.org/wiki/Tusculanae_Disputationes', 'ko', 'philosophy', true, true),
('아는 것이 힘이다', '프랜시스 베이컨', '명상록', 'https://en.wikipedia.org/wiki/Francis_Bacon', 'ko', 'philosophy', true, true),
('행복은 습관이다. 그것을 몸에 지니라', '허버드', NULL, 'https://en.wikipedia.org/wiki/Elbert_Hubbard', 'ko', 'life', true, true),
('고통이 남기고 간 뒤를 보라. 고난이 지나면 반드시 기쁨이 스며든다', '괴테', '파우스트', 'https://en.wikipedia.org/wiki/Goethe%27s_Faust', 'ko', 'classic', true, true),
('평생 살 것처럼 꿈을 꾸어라. 오늘 죽을 것처럼 살아라', '제임스 딘', NULL, 'https://en.wikipedia.org/wiki/James_Dean', 'ko', 'life', true, true),
('절대 어제를 후회하지 마라. 인생은 오늘의 나 안에 있고 내일은 스스로 만드는 것이다', '론 허버드', NULL, 'https://en.wikipedia.org/wiki/L._Ron_Hubbard', 'ko', 'life', true, true),
('계단을 밟아야 계단 위에 올라설 수 있다', '터키 속담', '터키 속담', NULL, 'ko', 'wisdom', true, true),
('오늘 나를 위해 한 걸음을 걷지 않으면, 내일은 그 자리에 멈춰 서있는 자신을 보게 될 것이다', '탈무드', '탈무드', 'https://en.wikipedia.org/wiki/Talmud', 'ko', 'wisdom', true, true),
('행복의 한 쪽 문이 닫히면 다른 쪽 문이 열린다. 그러나 우리는 닫힌 문을 오랫동안 보기 때문에 우리를 위해 열린 문을 보지 못한다', '헬렌 켈러', NULL, 'https://en.wikipedia.org/wiki/Helen_Keller', 'ko', 'life', true, true),
('용기있는 자로 살아라. 운이 따라주지 않는다면 용기있는 가슴으로 불행에 맞서라', '키케로', NULL, 'https://en.wikipedia.org/wiki/Cicero', 'ko', 'philosophy', true, true),
('중요한 것은 얼마나 오래 사느냐가 아니라 얼마나 잘 사느냐이다', '세네카', NULL, 'https://en.wikipedia.org/wiki/Seneca_the_Younger', 'ko', 'philosophy', true, true),
('신은 용기있는 자를 결코 버리지 않는다', '켄러', NULL, NULL, 'ko', 'faith', true, true),
('피할 수 없으면 즐겨라', '로버트 엘리엇', NULL, NULL, 'ko', 'life', true, true),
('단순하게 살아라. 현대인은 쓸데없는 절차와 일 때문에 얼마나 복잡한 삶을 살아가는가?', '이드리스 샤흐', NULL, NULL, 'ko', 'life', true, true),
('먼저 자신을 비웃어라. 다른 사람이 당신을 비웃기 전에', '엘사 맥스웰', NULL, NULL, 'ko', 'humor', true, true),
('행복한 삶을 살기 위해서는 작은 것에 만족할 줄 알아야 한다', '플라톤', NULL, 'https://en.wikipedia.org/wiki/Plato', 'ko', 'philosophy', true, true),
('절대 포기하지 말라. 당신이 되고 싶은 무언가가 있다면, 그에 대해 자부심을 가져라', '무하마드 알리', NULL, 'https://en.wikipedia.org/wiki/Muhammad_Ali', 'ko', 'motivation', true, true),
('계속해서 앞으로 나아가는 것 말고는 성공의 비결이 없다', '빌 게이츠', NULL, 'https://en.wikipedia.org/wiki/Bill_Gates', 'ko', 'success', true, true),
('당신이 할 수 있다고 믿든 할 수 없다고 믿든 믿는 대로 될 것이다', '헨리 포드', NULL, 'https://en.wikipedia.org/wiki/Henry_Ford', 'ko', 'motivation', true, true),
('겨울이 오면 봄도 멀지 않으리', '셸리', '서풍에 부치는 노래', 'https://en.wikipedia.org/wiki/Ode_to_the_West_Wind', 'ko', 'classic', true, true),
('시작이 반이다', '한국 속담', '한국 속담', NULL, 'ko', 'wisdom', true, true),
('말은 행동의 그림자다', '데모크리토스', NULL, 'https://en.wikipedia.org/wiki/Democritus', 'ko', 'philosophy', true, true),
('배움은 결코 정신을 지치게 하지 않는다', '레오나르도 다 빈치', NULL, 'https://en.wikipedia.org/wiki/Leonardo_da_Vinci', 'ko', 'learning', true, true),
('좋은 책을 읽지 않는 사람은 책을 읽지 못하는 사람보다 나을 게 없다', '마크 트웨인', NULL, 'https://en.wikipedia.org/wiki/Mark_Twain', 'ko', 'learning', true, true),
('성공은 매일 반복한 작은 노력들의 합이다', '로버트 콜리어', NULL, NULL, 'ko', 'success', true, true),
('실패는 잊어라. 그러나 그것이 준 교훈은 절대 잊으면 안 된다', '허버트 개서', NULL, NULL, 'ko', 'learning', true, true),
('꿈을 계속 간직하고 있으면 반드시 실현할 때가 온다', '괴테', NULL, 'https://en.wikipedia.org/wiki/Johann_Wolfgang_von_Goethe', 'ko', 'dream', true, true),
('진정한 용기는 두려움을 느끼지 않는 것이 아니라 두려움을 이겨내는 것이다', '넬슨 만델라', NULL, 'https://en.wikipedia.org/wiki/Nelson_Mandela', 'ko', 'courage', true, true),
('당신의 시간은 제한되어 있다. 그러므로 다른 사람의 인생을 사느라 시간을 낭비하지 마라', '스티브 잡스', '스탠포드 졸업 연설', 'https://en.wikipedia.org/wiki/Steve_Jobs', 'ko', 'life', true, true),
('위대한 일을 하려면 사랑하는 일을 해야 한다', '스티브 잡스', NULL, 'https://en.wikipedia.org/wiki/Steve_Jobs', 'ko', 'work', true, true);

\echo '✅ Inserted 30 Korean quotes'

-- English quotes (20)
INSERT INTO author_clock.quotes (text, author, source, source_url, language, category, is_public_domain, is_approved) VALUES
('While there''s life, there''s hope', 'Cicero', 'Tusculanae Disputationes', 'https://en.wikipedia.org/wiki/Tusculanae_Disputationes', 'en', 'philosophy', true, true),
('Knowledge is power', 'Francis Bacon', 'Meditationes Sacrae', 'https://en.wikipedia.org/wiki/Francis_Bacon', 'en', 'philosophy', true, true),
('To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment', 'Ralph Waldo Emerson', NULL, 'https://en.wikipedia.org/wiki/Ralph_Waldo_Emerson', 'en', 'life', true, true),
('The only way to do great work is to love what you do', 'Steve Jobs', NULL, 'https://en.wikipedia.org/wiki/Steve_Jobs', 'en', 'work', true, true),
('Life is what happens when you''re busy making other plans', 'John Lennon', NULL, 'https://en.wikipedia.org/wiki/John_Lennon', 'en', 'life', true, true),
('In the middle of difficulty lies opportunity', 'Albert Einstein', NULL, 'https://en.wikipedia.org/wiki/Albert_Einstein', 'en', 'opportunity', true, true),
('Be the change that you wish to see in the world', 'Mahatma Gandhi', NULL, 'https://en.wikipedia.org/wiki/Mahatma_Gandhi', 'en', 'change', true, true),
('The journey of a thousand miles begins with one step', 'Lao Tzu', 'Tao Te Ching', 'https://en.wikipedia.org/wiki/Tao_Te_Ching', 'en', 'wisdom', true, true),
('It does not matter how slowly you go as long as you do not stop', 'Confucius', NULL, 'https://en.wikipedia.org/wiki/Confucius', 'en', 'perseverance', true, true),
('Everything you''ve ever wanted is on the other side of fear', 'George Addair', NULL, NULL, 'en', 'courage', true, true),
('Success is not final, failure is not fatal: it is the courage to continue that counts', 'Winston Churchill', NULL, 'https://en.wikipedia.org/wiki/Winston_Churchill', 'en', 'success', true, true),
('Believe you can and you''re halfway there', 'Theodore Roosevelt', NULL, 'https://en.wikipedia.org/wiki/Theodore_Roosevelt', 'en', 'motivation', true, true),
('The only impossible journey is the one you never begin', 'Tony Robbins', NULL, NULL, 'en', 'motivation', true, true),
('What lies behind us and what lies before us are tiny matters compared to what lies within us', 'Ralph Waldo Emerson', NULL, 'https://en.wikipedia.org/wiki/Ralph_Waldo_Emerson', 'en', 'philosophy', true, true),
('The best time to plant a tree was 20 years ago. The second best time is now', 'Chinese Proverb', 'Chinese Proverb', NULL, 'en', 'wisdom', true, true),
('An unexamined life is not worth living', 'Socrates', NULL, 'https://en.wikipedia.org/wiki/Socrates', 'en', 'philosophy', true, true),
('Your time is limited, don''t waste it living someone else''s life', 'Steve Jobs', 'Stanford Commencement Speech', 'https://en.wikipedia.org/wiki/Steve_Jobs', 'en', 'life', true, true),
('If you judge a fish by its ability to climb a tree, it will live its whole life believing that it is stupid', 'Albert Einstein', NULL, 'https://en.wikipedia.org/wiki/Albert_Einstein', 'en', 'wisdom', true, true),
('Tell me and I forget. Teach me and I remember. Involve me and I learn', 'Benjamin Franklin', NULL, 'https://en.wikipedia.org/wiki/Benjamin_Franklin', 'en', 'learning', true, true),
('If winter comes, can spring be far behind?', 'Percy Bysshe Shelley', 'Ode to the West Wind', 'https://en.wikipedia.org/wiki/Ode_to_the_West_Wind', 'en', 'classic', true, true);

\echo '✅ Inserted 20 English quotes'

-- Show total count
SELECT COUNT(*) as total_quotes FROM author_clock.quotes;

\echo '✅ Database seeding completed successfully!'
