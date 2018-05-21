start:
	npm run babel-node -- ./src/start.js

start-nodemon:
	npm run nodemon -- --exec babel-node ./src/start.js

start-debug:
	DEBUG=app:* npm run nodemon -- --watch . --ext '.js, .pug' --exec babel-node ./src/start.js

start-debug-index:
	DEBUG=app:index* npm run nodemon -- --watch . --ext '.js, .pug' --exec babel-node ./src/start.js

start-debug-users:
	DEBUG=app:users* npm run nodemon -- --watch . --ext '.js, .pug' --exec babel-node ./src/start.js

db-migrate:
	npm run sequelize -- db:migrate

deploy:
	git push heroku master

build-webpack:
	npm run webpack

start-heroku:
	make build-webpack
	make start

test:
	npm test

test-watch:
	npm test -- --watch

test-coverage:
	npm test -- --coverage

lint:
	npm run eslint .

