export interface SandboxConfig {
  provider: 'orange_money' | 'moov_money' | 'wave' | 'telecel_money';
  enabled: boolean;
  testPhone: string;
  testAmount: number;
}

export const sandboxConfigs: Record<string, SandboxConfig> = {
  orange_money: {
    provider: 'orange_money',
    enabled: false,
    testPhone: '70123456',
    testAmount: 1000,
  },
  moov_money: {
    provider: 'moov_money',
    enabled: false,
    testPhone: '60123456',
    testAmount: 1000,
  },
  wave: {
    provider: 'wave',
    enabled: false,
    testPhone: '77123456',
    testAmount: 1000,
  },
  telecel_money: {
    provider: 'telecel_money',
    enabled: false,
    testPhone: '78123456',
    testAmount: 1000,
  },
};

export function isProviderConfigured(provider: string): boolean {
  switch (provider) {
    case 'orange_money':
      return !!(import.meta.env.VITE_ORANGE_MONEY_API_KEY && import.meta.env.VITE_ORANGE_MONEY_MERCHANT_KEY);
    case 'moov_money':
      return !!import.meta.env.VITE_MOOV_MONEY_API_KEY;
    case 'wave':
      return !!import.meta.env.VITE_WAVE_API_KEY;
    case 'telecel_money':
      return !!(import.meta.env.VITE_TELECEL_MONEY_API_KEY && import.meta.env.VITE_TELECEL_MONEY_MERCHANT_ID);
    default:
      return false;
  }
}

export function getProviderStatus(provider: string): {
  configured: boolean;
  sandboxAvailable: boolean;
  productionReady: boolean;
  instructions: string;
} {
  const configured = isProviderConfigured(provider);

  const providerInfo = {
    orange_money: {
      sandboxAvailable: true,
      instructions: 'Visitez https://developer.orange.com pour obtenir vos clés API sandbox',
    },
    moov_money: {
      sandboxAvailable: true,
      instructions: 'Contactez commercial@moov-africa.bf pour l\'accès API sandbox',
    },
    wave: {
      sandboxAvailable: true,
      instructions: 'Créez un compte sur https://developer.wave.com pour les clés sandbox',
    },
    telecel_money: {
      sandboxAvailable: true,
      instructions: 'Contactez Telecel Burkina au +226 78 00 00 00 pour l\'API sandbox',
    },
  };

  const info = providerInfo[provider as keyof typeof providerInfo] || {
    sandboxAvailable: false,
    instructions: 'Fournisseur non supporté',
  };

  return {
    configured,
    sandboxAvailable: info.sandboxAvailable,
    productionReady: configured,
    instructions: info.instructions,
  };
}

export function getMockPaymentResponse(provider: string, success: boolean = true) {
  if (success) {
    return {
      success: true,
      transactionId: `MOCK_${provider.toUpperCase()}_${Date.now()}`,
      providerReference: `REF_${Math.random().toString(36).substring(7).toUpperCase()}`,
      message: `Paiement ${provider} simulé avec succès (MODE TEST)`,
      checkoutUrl: provider === 'wave' || provider === 'orange_money'
        ? `https://test-${provider}.com/checkout/mock`
        : undefined,
    };
  }

  return {
    success: false,
    error: `Échec simulé du paiement ${provider} (MODE TEST)`,
  };
}

export function formatPhoneNumber(phone: string, provider: string): string {
  phone = phone.replace(/\D/g, '');

  if (phone.startsWith('226')) {
    return phone;
  }

  if (phone.startsWith('00226')) {
    return phone.substring(2);
  }

  if (phone.startsWith('+226')) {
    return phone.substring(1);
  }

  if (phone.length === 8) {
    return `226${phone}`;
  }

  return phone;
}

export function validatePaymentAmount(amount: number, provider: string): {
  valid: boolean;
  error?: string;
} {
  const minAmount = 100;
  const maxAmount = 5000000;

  if (amount < minAmount) {
    return {
      valid: false,
      error: `Le montant minimum est ${minAmount} FCFA`,
    };
  }

  if (amount > maxAmount) {
    return {
      valid: false,
      error: `Le montant maximum est ${maxAmount} FCFA`,
    };
  }

  if (amount % 5 !== 0) {
    return {
      valid: false,
      error: 'Le montant doit être un multiple de 5 FCFA',
    };
  }

  return { valid: true };
}

export const testInstructions = {
  orange_money: {
    title: 'Orange Money - Mode Test',
    steps: [
      '1. Utilisez un numéro de test fourni par Orange Developer',
      '2. Montant test: 100 FCFA à 10,000 FCFA',
      '3. Confirmez avec le code PIN test: 1234',
      '4. Le paiement sera automatiquement validé après 30 secondes',
    ],
    sandboxUrl: 'https://developer.orange.com/apis/orange-money-bf/sandbox',
  },
  moov_money: {
    title: 'Moov Money - Mode Test',
    steps: [
      '1. Utilisez un numéro Moov test (ex: 60000000)',
      '2. Montant test: 100 FCFA minimum',
      '3. Entrez le code OTP test: 123456',
      '4. La transaction sera confirmée instantanément',
    ],
    sandboxUrl: 'https://www.moov-africa.bf/developers',
  },
  wave: {
    title: 'Wave - Mode Test',
    steps: [
      '1. Cliquez sur le lien de paiement généré',
      '2. Utilisez un numéro Wave test fourni',
      '3. Montant test: tout montant entre 100 et 50,000 FCFA',
      '4. Validez avec le code test',
    ],
    sandboxUrl: 'https://developer.wave.com/docs/testing',
  },
  telecel_money: {
    title: 'Telecel Money - Mode Test',
    steps: [
      '1. Utilisez un numéro Telecel test (ex: 78000000)',
      '2. Composez *123# sur le téléphone test',
      '3. Suivez les instructions pour valider',
      '4. Montant test: 100 FCFA minimum',
    ],
    sandboxUrl: 'https://www.telecel.bf',
  },
};
