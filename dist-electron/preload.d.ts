export type IElectronAPI = {
    openOAuthUrl: (url: string) => Promise<void>;
    exchangeOAuthCode: (code: string, clientId: string, clientSecret: string) => Promise<any>;
    getOAuthTokens: () => Promise<any>;
    clearOAuthTokens: () => Promise<boolean>;
    onOAuthCodeReceived: (callback: (code: string) => void) => void;
};
