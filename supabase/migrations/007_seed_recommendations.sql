-- Seed recommendations from Stephen O'Regan
-- Safe to run multiple times (checks for existing entries by name)

insert into recommendations (category, name, description, neighbourhood, recommended_by, recommender_role, display_order)
select category, name, description, neighbourhood, recommended_by, recommender_role, display_order
from (values
  (
    'Experience',
    'Cemitério dos Prazeres',
    'Sounds strange but this is one of the most beautiful places in Lisbon. Walk the wide avenues between the grand mausoleums on a quiet weekday morning and you''ll have it almost to yourself. The views over the Tagus from the top are stunning. Takes about an hour and costs nothing.',
    'Campo de Ourique',
    'Stephen O''Regan',
    'Founder, People Of Lisbon',
    1
  ),
  (
    'Experience',
    'Jardim da Estrela',
    'The best park in Lisbon. Not the biggest, not the fanciest — but it has the right energy. Peacocks wander around like they own the place. Get a coffee from the kiosk, find a bench, and watch the city at its most relaxed. Campo de Ourique locals basically live here at weekends.',
    'Estrela',
    'Stephen O''Regan',
    'Founder, People Of Lisbon',
    2
  ),
  (
    'Culture',
    'Cinemateca Portuguesa',
    'Portugal''s national cinema, and one of the great hidden treasures of Lisbon. They screen classics, rarities, and retrospectives that you''ll find nowhere else. The building itself is beautiful. Check the programme online — tickets are cheap and the crowd is always interesting.',
    'Bairro Alto',
    'Stephen O''Regan',
    'Founder, People Of Lisbon',
    3
  ),
  (
    'Bar',
    'Pavilhão Chinês',
    'There is nowhere else like this in the world. Every inch of wall and ceiling is covered in antique curiosities — model planes, tin soldiers, playing cards, porcelain. It''s a bar that feels like wandering into someone''s extraordinary private collection. Go on a weeknight, take your time, look up.',
    'Príncipe Real',
    'Stephen O''Regan',
    'Founder, People Of Lisbon',
    4
  ),
  (
    'Restaurant',
    'Casa da Índia',
    'Lisbon had a 500-year relationship with India and this is where you taste it. Proper Goan and Indian cooking in a warm, unpretentious room. The food is unlike anything you''ll find elsewhere in the city — spiced, rich, and deeply flavoured. Bring people who like to share dishes.',
    'Baixa',
    'Stephen O''Regan',
    'Founder, People Of Lisbon',
    5
  ),
  (
    'Coffee',
    'Rhodo Bagels',
    'Lisbon took a while to get good bagels. Rhodo got it right. Proper chewy bagels with thoughtful fillings — the smoked salmon one is excellent. It''s a small place, always busy at weekends, and they care about what they''re making. One of those spots that just quietly raises the bar.',
    'Príncipe Real',
    'Stephen O''Regan',
    'Founder, People Of Lisbon',
    6
  )
) as v(category, name, description, neighbourhood, recommended_by, recommender_role, display_order)
where not exists (
  select 1 from recommendations where name = v.name
);
