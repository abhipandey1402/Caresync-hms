import axios from "axios";

const DEFAULT_GRAPH_BASE_URL = "https://graph.facebook.com/v20.0";

class WhatsAppAdapter {
  async sendTemplateMessage() {
    throw new Error("WhatsApp adapter sendTemplateMessage() not implemented");
  }
}

export class MetaWhatsAppAdapter extends WhatsAppAdapter {
  constructor({
    httpClient = axios,
    phoneNumberId = process.env.WABA_PHONE_ID,
    accessToken = process.env.WABA_ACCESS_TOKEN,
    baseUrl = DEFAULT_GRAPH_BASE_URL
  } = {}) {
    super();
    this.httpClient = httpClient;
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  getEndpoint() {
    if (!this.phoneNumberId || !this.accessToken) {
      throw new Error("WhatsApp adapter is not configured");
    }

    return `${this.baseUrl}/${this.phoneNumberId}/messages`;
  }

  async sendTemplateMessage({
    to,
    template,
    language = "en",
    components = []
  }) {
    return this.httpClient.post(
      this.getEndpoint(),
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: language },
          components
        }
      },
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );
  }
}

export const createWhatsAppAdapter = (options = {}) => new MetaWhatsAppAdapter(options);
export const whatsapp = createWhatsAppAdapter();
