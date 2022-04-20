# File Upload Code review

## How to install?

1. Clone the repository
``` bash
$ git clone https://github.com/tauh33dkhan/fileupload-codereview
$ cd /fileupload-codereview
```

2. Create a mysql database
   
```js
$ mysql -u root -p
create database fileupload;
```

1. Update environment varables with your mysql credentials.
   
```
DB_NAME=fileupload
DB_USER=root
DB_PASS=secret
DB_HOST=127.0.0.1
JWT_SECRET=55d4e519144f79a73bd3afd74681bf3cd03fa3d385e53648aeae6be25a10719d4ce714d38fd527b54178afde756a4bd60b7e1b60f4b703b00bb856e11be7c87f
```

1. Install dependencies application 

```
$ npm install
```

5. Start application

```
node app.js
```

you can now access the application at http://localhost:3000

1. Use following demo users credentials.

```
superman :  superpower
batman : iamrich
```
