-- Eski noto'g'ri yozuvlarni tozalash
DELETE FROM auth.identities WHERE provider_id = 'haziniy998889692313@gmail.com' OR provider_id = '998889692313@haziniy.local';
DELETE FROM auth.users WHERE email = 'haziniy998889692313@gmail.com' OR email = '998889692313@haziniy.local';
