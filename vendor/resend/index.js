class Resend {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.emails = {
      send: async (payload) => ({ data: { id: 'email_' + Math.random().toString(36).slice(2) }, error: null, payload }),
    };
  }
}

module.exports = { Resend };
