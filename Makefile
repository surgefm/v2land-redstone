EXE_PATH=./node_modules/.bin/eslint
API_PATH=api/**/*.ts
TEST_PATH=tests/**/*.ts
CONFIG_PATH=config/**/*.ts
NOTIFICATION_BACKEND_PATH=notifications/**/*.ts

COVERAGE_PATH=./node_modules/.bin/nyc

build:
	node node_modules/gulp-cli/bin/gulp.js build

test: eslint test-without-lint
	echo "浪潮爱你❤️"

test-completeness:
	node ./scripts/completeness.js

test-without-lint:
	node ./node_modules/gulp-cli/bin/gulp.js build
	NODE_ENV=test node ./node_modules/mocha/bin/mocha dist/tests/bootstrap.test.js dist/tests/integration/**/*.test.js --exit;

debug:
	node ./node_modules/mocha/bin/mocha --inspect-brk tests/bootstrap.test.js tests/integration/**/*.test.js --exit;

clean-covrage:
	rm -rf ./coverage

coverage: clean-covrage
	node $(COVERAGE_PATH) make test-without-lint

eslint:
	$(EXE_PATH) $(API_PATH)
	$(EXE_PATH) $(TEST_PATH)
	$(EXE_PATH) $(CONFIG_PATH)
	$(EXE_PATH) $(NOTIFICATION_BACKEND_PATH)

eslint-fix:
	$(EXE_PATH) $(API_PATH) --fix
	$(EXE_PATH) $(TEST_PATH) --fix
	$(EXE_PATH) $(CONFIG_PATH) --fix
	$(EXE_PATH) $(NOTIFICATION_BACKEND_PATH) --fix

