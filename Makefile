EXE_PATH=./node_modules/.bin/eslint
API_PATH=api/**/*.js
SCRIPT_PATH=scripts/**/*.js
TEST_PATH=tests/**/*.js

eslint:
	$(EXE_PATH) $(API_PATH)
	$(EXE_PATH) $(SCRIPT_PATH)
	$(EXE_PATH) $(TEST_PATH)

eslint-fix:
	$(EXE_PATH) $(API_PATH) --fix
	$(EXE_PATH) $(SCRIPT_PATH) --fix
	$(EXE_PATH) $(TEST_PATH) --fix

test: eslint
	node ./node_modules/mocha/bin/mocha tests/bootstrap.test.js tests/integration/**/*.test.js;
	node ./scripts/completeness.js

test-completeness:
	node ./scripts/completeness.js
