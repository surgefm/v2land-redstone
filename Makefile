EXE_PATH=./node_modules/.bin/eslint
API_PATH=api/**/*.ts
SCRIPT_PATH=scripts/**/*.ts
TEST_PATH=tests/**/*.ts

test: eslint test-without-lint
	echo "浪潮爱你❤️"

test-completeness:
	node ./scripts/completeness.js

test-without-lint:
	node ./node_modules/gulp-cli/bin/gulp.js build
	NODE_ENV=test node ./node_modules/mocha/bin/mocha dist/tests/bootstrap.test.js dist/tests/integration/**/*.test.js --exit;

debug:
	node ./node_modules/mocha/bin/mocha --inspect-brk tests/bootstrap.test.js tests/integration/**/*.test.js --exit;

eslint:
	$(EXE_PATH) $(API_PATH)
	# $(EXE_PATH) $(SCRIPT_PATH)
	# $(EXE_PATH) $(TEST_PATH)

eslint-fix:
	$(EXE_PATH) $(API_PATH) --fix
	# $(EXE_PATH) $(SCRIPT_PATH) --fix
	# $(EXE_PATH) $(TEST_PATH) --fix

