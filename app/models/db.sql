DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users
(
    id character varying(255) NOT NULL,
    email character varying(255),
    password character varying(255),
    full_name character varying(255),
    address character varying(255),
    phone_number character varying(255),
    role character varying(255),
    activation character varying(255),
    banned boolean DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

DROP TABLE IF EXISTS student_id;
CREATE TABLE IF NOT EXISTS student_id
(
    user_id character varying(255) NOT NULL,
    student_id character varying(255) NOT NULL,
    CONSTRAINT student_pkey PRIMARY KEY (user_id, student_id),
	CONSTRAINT student_id_key UNIQUE (student_id),
    CONSTRAINT student_user_key UNIQUE (user_id)
);

DROP TABLE IF EXISTS student_list;
CREATE TABLE IF NOT EXISTS student_list
(
	student_id character varying(255) NOT NULL,
	class_id character varying(255) NOT NULL,
	full_name character varying(255),
	isMap boolean DEFAULT false,
	CONSTRAINT student_list_pkey PRIMARY KEY (student_id, class_id)
);

DROP TABLE IF EXISTS classes;
CREATE TABLE IF NOT EXISTS classes
(
    id character varying(255) NOT NULL,
    name character varying(255),
    owner_id character varying(255),
    description character varying(255),
    invitation character varying(255) NOT NULL,
    inactive boolean DEFAULT false,
    CONSTRAINT classes_pkey PRIMARY KEY (id),
    CONSTRAINT classes_invitation_key UNIQUE (invitation)
);

DROP TABLE IF EXISTS class_user;
CREATE TABLE IF NOT EXISTS class_user
(
    id_class character varying(255) NOT NULL,
    id_user character varying(255) NOT NULL,
    role character varying(255),
    student_id character varying(255),
    CONSTRAINT class_user_pkey PRIMARY KEY (id_class, id_user)
);

DROP TABLE IF EXISTS classes_composition;
CREATE TABLE classes_composition (
    id character varying NOT NULL,
    class_id character varying NOT NULL,
    name character varying,
    grade_scale numeric,
    public_grade boolean DEFAULT false,
    order_id numeric,
    CONSTRAINT classes_composition_pkey PRIMARY KEY (id)
);

DROP TABLE IF EXISTS classes_grades;
CREATE TABLE classes_grades (
    class_id character varying NOT NULL,
    student_id character varying NOT NULL,
    composition_id character varying NOT NULL,
    grade numeric,
    CONSTRAINT classes_grades_pkey PRIMARY KEY (class_id, student_id, composition_id)
);

DROP TABLE IF EXISTS grades_reviews;
CREATE TABLE grades_reviews (
    id character varying NOT NULL,
    student_id character varying NOT NULL,
    composition_id character varying NOT NULL,
    current_grade character varying,
    student_expected_grade character varying,
    student_explain character varying,
    feedback jsonb[],
    review_success boolean DEFAULT false,
    CONSTRAINT grades_reviews_pkey PRIMARY KEY (student_id, id, composition_id)
);

DROP TABLE IF EXISTS student_notifications;
CREATE TABLE student_notifications (
    notification_id character varying(100) NOT NULL,
    student_id character varying(100),
    notification_type character varying(100),
    is_read boolean DEFAULT false,
    content character varying(200),
    link character varying(200),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_notifications_pkey PRIMARY KEY (notification_id)	
);

DROP TABLE IF EXISTS teacher_notifications;
CREATE TABLE teacher_notifications (
    notification_id character varying(100) NOT NULL,
    teacher_id character varying(100),
    notification_type character varying(100),
    is_read boolean DEFAULT false,
    content character varying(200),
    link character varying(200),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT teacher_notifications_pkey PRIMARY KEY (notification_id)
);