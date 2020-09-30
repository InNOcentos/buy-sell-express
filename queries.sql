--Получить список всех категорий (идентификатор, наименование категории);
SELECT id AS "Идентификатор",
    title AS "Наименование категории"
FROM categories;
--Получить список категорий для которых создано минимум одно объявление (идентификатор, наименование категории);
SELECT categories.id AS "Идентификатор",
    categories.title AS "Наименование"
FROM categories
    INNER JOIN offers_categories ON offers_categories.category_id = categories.id
GROUP BY categories.id,
    categories.title;
/* Получить список категорий с количеством объявлений (идентификатор, наименование категории, количество объявлений в категории); */
SELECT categories.id AS "Идентификатор",
    categories.title AS "Наименование",
    count(offers_categories.offer_id)
FROM categories
    INNER JOIN offers_categories ON offers_categories.category_id = categories.id
GROUP BY categories.id,
    categories.title
    /* Получить список объявлений (идентификатор объявления, заголовок объявления, стоимость, тип объявления, текст объявления, дата публикации, имя и фамилия автора, контактный email, количество комментариев, наименование категорий). Сначала свежие объявления; */
SELECT offers.id,
    offers.title,
    offers.sum,
    types.title,
    offers.description,
    offers.created_date,
    concat(users.firstname, ' ', users.lastname),
    users.email,
    count(users_offers_comments.offers_id),
    string_agg(categories.title, ', ')
FROM offers
    LEFT JOIN users ON users.id = offers.user_id
    LEFT JOIN offers_categories ON offers_categories.offer_id = offers.id
    LEFT JOIN categories ON categories.id = offers_categories.category_id
    LEFT JOIN users_offers_comments ON users_offers_comments.offers_id = offers.id
    LEFT JOIN offers_types ON offers_types.type_id = offers.id
    LEFT JOIN types ON types.id = offers_types.type_id
GROUP BY offers.id,
    offers.title,
    offers.sum,
    types.title,
    offers.description,
    offers.created_date,
    concat(users.firstname, ' ', users.lastname),
    users.email
ORDER BY offers.created_date DESC;
/* Получить полную информацию определённого объявления (идентификатор объявления, заголовок объявления, стоимость, тип объявления, текст объявления, дата публикации, имя и фамилия автора, контактный email, количество комментариев, наименование категорий); */
SELECT offers.id,
    offers.title,
    offers.sum,
    types.title,
    offers.description,
    offers.created_date,
    concat(users.firstname, ' ', users.lastname),
    users.email,
    count(users_offers_comments.offers_id),
    string_agg(distinct categories.title, ', ')
FROM offers
    LEFT JOIN users ON users.id = offers.user_id
    LEFT JOIN users_offers_comments ON users_offers_comments.offers_id = offers.id
    LEFT JOIN comments ON comments.id = users_offers_comments.offers_id
    LEFT JOIN offers_categories ON offers_categories.offer_id = offers.id
    LEFT JOIN categories ON categories.id = offers_categories.offer_id
    LEFT JOIN offers_types ON offers_types.offer_id = offers.id
    LEFT JOIN types ON types.id = offers_types.offer_id
WHERE offers.id = 1
GROUP BY offers.id,
    offers.title,
    offers.sum,
    types.title,
    offers.description,
    offers.created_date,
    concat(users.firstname, ' ', users.lastname),
    users.email;
/* Получить список из 5 свежих комментариев (идентификатор комментария, идентификатор объявления, имя и фамилия автора, текст комментария); */
SELECT comments.id,
    users_offers_comments.offers_id,
    users.firstname,
    users.lastname,
    comments.message,
    comments.created_date
FROM comments
    INNER JOIN users_offers_comments ON users_offers_comments.comment_id = comments.id
    INNER JOIN users ON users.id = users_offers_comments.users_id
ORDER BY comments.created_date DESC
LIMIT 5;
/* Получить список комментариев для определённого объявления (идентификатор комментария, идентификатор объявления, имя и фамилия автора, текст комментария). Сначала новые комментарии; */
SELECT comments.id,
    users_offers_comments.offers_id,
    users.firstname,
    users.lastname,
    comments.message,
    comments.created_date
FROM comments
    INNER JOIN users_offers_comments ON users_offers_comments.comment_id = comments.id
    INNER JOIN users ON users.id = users_offers_comments.users_id
WHERE users_offers_comments.offers_id = 1
ORDER BY comments.created_date DESC;
/* Выбрать 2 объявления, соответствующих типу «куплю»; */
SELECT *
FROM offers
    LEFT JOIN offers_types ON offers_types.offer_id = offers.id
    LEFT JOIN types ON types.id = offers_types.type_id
WHERE offers_types.type_id = 1
LIMIT 2;
/* Обновить заголовок определённого объявления на «Уникальное предложение!»; */
UPDATE offers
set title = 'Уникальное предложение!'
WHERE offers.id = 1;