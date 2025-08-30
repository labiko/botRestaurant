export interface DefaultPaymentConfig {
  provider_name: string;
  api_url: string;
  callback_url: string;
  green_api_instance_id: string;
  green_api_token: string;
  green_api_base_url: string;
}

export const DEFAULT_PAYMENT_CONFIGS: { [key: string]: DefaultPaymentConfig } = {
  lengopay: {
    provider_name: 'lengopay',
    api_url: 'https://sandbox.lengopay.com/api/v1/payments',
    callback_url: 'https://www.labico.net/api/RestaurantLengoPayCallback',
    green_api_instance_id: '7105303512',
    green_api_token: '022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad',
    green_api_base_url: 'https://7105.api.greenapi.com'
  },
  orange_money: {
    provider_name: 'orange_money',
    api_url: 'https://api.orange.com/orange-money-webpay/dev/v1',
    callback_url: 'https://www.labico.net/api/RestaurantOrangeMoneyCallback',
    green_api_instance_id: '7105303512',
    green_api_token: '022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad',
    green_api_base_url: 'https://7105.api.greenapi.com'
  },
  wave: {
    provider_name: 'wave',
    api_url: 'https://api.wave.com/v1/checkout/sessions',
    callback_url: 'https://www.labico.net/api/RestaurantWaveCallback',
    green_api_instance_id: '7105303512',
    green_api_token: '022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad',
    green_api_base_url: 'https://7105.api.greenapi.com'
  },
  mtn_money: {
    provider_name: 'mtn_money',
    api_url: 'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
    callback_url: 'https://www.labico.net/api/RestaurantMtnMoneyCallback',
    green_api_instance_id: '7105303512',
    green_api_token: '022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad',
    green_api_base_url: 'https://7105.api.greenapi.com'
  }
};

export function getDefaultConfigForProvider(providerName: string): DefaultPaymentConfig | null {
  return DEFAULT_PAYMENT_CONFIGS[providerName] || null;
}