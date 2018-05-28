start:
	npm run webpack
	npm run babel-node -- ./src/start.js

start-nodemon:
	npm run webpack
	npm run nodemon -- --exec babel-node ./src/start.js

start-debug:
	npm run webpack
	DEBUG=app:* npm run nodemon -- --watch . --ext '.js, .pug' --exec babel-node ./src/start.js

db-migrate:
	npm run sequelize -- db:migrate

deploy:
	git push heroku master

build-webpack:
	npm run webpack

test:
	npm test

test-watch:
	npm test -- --watch

test-coverage:
	npm test -- --coverage

lint:
	npm run eslint .

start-heroku:
	make build-webpack
	make start-debug
