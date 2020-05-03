# FlightBookingSystem
Book flight with ease

# API Docs
[Docs](https://documenter.getpostman.com/view/3554620/SzmZdg4o?version=latest)

# Installation & Instructions
[GitHub](https://github.com/nferocious76/FlightBookingSystem)

```
1. Load database:

    mysql -u root < database/schema.sql

2. Load seed:

    mysql -u root < database/schema.sql -- tables: role, resource

3. Create permission: r, w, d -- no endpoint

    INSERT INTO `permission` (`role_id`, `resource_id`, `mode`, `is_disabled`) VALUES
    -- sup_admin
    (role_uuid, resource_uuid, 'r', 0), -- resource
    (role_uuid, resource_uuid, 'w', 0),
    (role_uuid, resource_uuid, 'd', 0);

4. Initialize API:

    yarn install && node app.js

```