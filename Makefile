EXE_PATH=./node_modules/.bin/eslint
API_PATH=api/**

eslint:
	$(EXE_PATH) $(API_PATH)

eslint-fix:
	$(EXE_PATH) $(API_PATH) --fix
