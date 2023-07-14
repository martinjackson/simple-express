module.exports = {
    "env": {
        "browser": false,
        "node": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
      "semi": 'off',
      'no-console': 'off',
      'react/jsx-filename-extension': 'off',
      "react/prop-types": "off",
      "no-unused-vars": [
        "warn", { "varsIgnorePattern": "^_|TS|process|module", "argsIgnorePattern": "^_" }
    ]
    }
}
