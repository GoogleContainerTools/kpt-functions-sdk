module.exports = {
  "root": true,
    "env": {
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": ["./tsconfig.json"],
        "tsconfigRootDir": __dirname,
        "sourceType": "module"
    },
    "plugins": [
        "eslint-plugin-import",
        "eslint-plugin-jsdoc",
        "eslint-plugin-react",
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "prettier",
      "prettier/@typescript-eslint",
    ],
    "rules": {
        "@typescript-eslint/array-type": [
            "error",
            {
                "default": "array-simple"
            }
        ],
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/ban-types": [
            "warn",
            {
                "types": {
                    "Object": {
                        "message": "Use {} instead."
                    },
                    "String": {
                        "message": "Use 'string' instead."
                    },
                    "Number": {
                        "message": "Use 'number' instead."
                    },
                    "Boolean": {
                        "message": "Use 'boolean' instead."
                    }
                }
            }
        ],
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                "accessibility": "no-public"
            }
        ],
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/naming-convention": [
          "error",
          { "selector": "default", "modifiers": ["private","protected"], "format": ["camelCase"] },
          { "selector": "typeLike", "format": ["PascalCase"] },
        ],
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/quotes": "off",
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/type-annotation-spacing": "off",
        "arrow-body-style": "error",
        "arrow-parens": [
            "off",
            "always"
        ],
        "brace-style": [
            "off",
            "off"
        ],
        "comma-dangle": [
            "error",
            {
                "objects": "always-multiline",
                "arrays": "always-multiline",
                "imports": "always-multiline",
                "functions": "never"
            }
        ],
        "curly": [
            "error",
            "all"
        ],
        "default-case": "error",
        "eol-last": "off",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "import/no-default-export": "error",
        "import/no-deprecated": "error",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-indentation": "error",
        "jsdoc/newline-after-description": "error",
        "linebreak-style": "off",
        "max-classes-per-file": "off",
        "max-len": "off",
        "new-parens": "error",
        "newline-per-chained-call": "off",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": "off",
        "no-debugger": "error",
        "no-extra-semi": "off",
        "no-irregular-whitespace": "off",
        "no-multiple-empty-lines": "off",
        "no-new-wrappers": "error",
        "no-return-await": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "off",
        "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-const": "error",
        "quote-props": [
            "error",
            "as-needed"
        ],
        "radix": "error",
        "react/jsx-curly-spacing": "off",
        "react/jsx-equals-spacing": "off",
        "react/jsx-wrap-multilines": "off",
        "space-before-function-paren": "off",
        "space-in-parens": [
            "off",
            "never"
        ],
        "use-isnan": "error",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "ban": [
                        true,
                        {
                            "name": [
                                "it",
                                "skip"
                            ]
                        },
                        {
                            "name": [
                                "it",
                                "only"
                            ]
                        },
                        {
                            "name": [
                                "it",
                                "async",
                                "skip"
                            ]
                        },
                        {
                            "name": [
                                "it",
                                "async",
                                "only"
                            ]
                        },
                        {
                            "name": [
                                "describe",
                                "skip"
                            ]
                        },
                        {
                            "name": [
                                "describe",
                                "only"
                            ]
                        },
                        {
                            "name": "parseInt",
                            "message": "tsstyle#type-coercion"
                        },
                        {
                            "name": "parseFloat",
                            "message": "tsstyle#type-coercion"
                        },
                        {
                            "name": "Array",
                            "message": "tsstyle#array-constructor"
                        },
                        {
                            "name": [
                                "*",
                                "innerText"
                            ],
                            "message": "Use .textContent instead. tsstyle#browser-oddities"
                        }
                    ]
                }
            }
        ]
    }
};
