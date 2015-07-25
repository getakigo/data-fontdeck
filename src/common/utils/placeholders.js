export default {
  getFontDataPlaceholder() {
    return {
      name: null,
      url: null,
      slug: null,
      superfamily: null,
      use: null,
      classification: [],
      foundry: null,
      designer: null,
      opentype: null,
      language: [],
      tags: [],
      variations: []
    };
  },

  getFontVariationDataPlaceholder() {
    return {
      name: null,
      description: null,
      url: null,
      css: {}
    };
  },

  getFontProviderPlaceholder() {
    return {
      id: null,
      slug: null
    };
  }
};
