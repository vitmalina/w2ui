module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    // "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "globals": {
        "$": "readonly",
        "app": "readonly",
        "w2ui": "readonly",
        "w2obj": "readonly",
        "w2utils": "readonly",
        "w2popup": "readonly",
        "w2alert": "readonly",
        "w2confirm": "readonly",
        "w2prompt": "readonly"
    },
    "rules": {
        "indent": ["error", 4, {
            "SwitchCase": 1,
            "ignoredNodes": ["ConditionalExpression"],
            "FunctionDeclaration": {"parameters": "first"}
        }],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "semi": ["error", "never"],
        "no-var": "error",
        // "no-unused-vars": ["warn", { "vars": "local", "args": "none" }],
        // "no-extra-parens": "off",
        // "dot-notation": "warn",
        // "grouped-accessor-pairs": "warn",
        // "no-eval": "error",
        // "no-implied-eval": "error",
        // "no-extend-native": "error",
        // "no-multi-spaces": "error",
        // "func-call-spacing": "warn",
        // "func-name-matching": "warn",
        // "func-names": ["warn", "always"],
        // "no-inner-declarations": "off",
        // "no-unreachable": "off"
    }
}