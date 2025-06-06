module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['tailwind', 'apply', 'layer', 'variants', 'responsive', 'screen'],
    }],
    'at-rule-no-deprecated': null,
    'selector-class-pattern': null,
    'comment-empty-line-before': null,
    'property-no-vendor-prefix': null,
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
    'value-keyword-case': null,
    'no-duplicate-selectors': null,
    'declaration-block-no-duplicate-properties': [true, {
      ignore: ['consecutive-duplicates-with-different-values'],
    }],
    'declaration-block-single-line-max-declarations': null,
    'keyframes-name-pattern': null,
    'no-descending-specificity': null,
    'media-feature-name-value-no-unknown': null,
    'media-feature-range-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'at-rule-empty-line-before': null,
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
  },
};
