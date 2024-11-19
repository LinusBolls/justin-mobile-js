import type {
  InstallationKey,
  GetApiStatusResponse,
  GetInstallationKeyResponse,
  GetInstallationsResponse,
  RegisterDeviceResponse,
  VerifyDeviceWithCodeResponse,
} from "./types";

/**
 * we don't know where the app gets the constructor values from yet
 *
 * @param username looks like `k82Rt7xplQXcJ5L8OzM3v2` and varies among app reinstalls on the same device
 * @param password looks like `xjKTZ7fn2qw3Gpml7NYvbXtWuQHpkyfLAOdrEW9y` and varies among app reinstalls on the same device
 * @param deviceId looks like `f92cd3e8824fa7c433a65b11097d04bef8a1b4d6` and is consistent among app reinstalls on the same device
 */
export default class JustINMobile {
  public readonly baseUrl = "https://justin.saltowebservices.com";

  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly deviceId: string
  ) {}

  /**
   * gets called on app startup
   */
  public async getInstallations(): Promise<GetInstallationsResponse> {
    const res = await fetch(this.baseUrl + "/api/v2/installations", {
      headers: this.getHeaders(),
    });
    await this.assertResponse(res);

    const data: GetInstallationsResponse = await res.json();

    return data;
  }
  /**
   * gets called by the app after the user verified their phone number
   */
  public async getInstallationKey(
    keyId: InstallationKey["id"]
  ): Promise<GetInstallationKeyResponse> {
    const res = await fetch(this.baseUrl + keyId, {
      headers: this.getHeaders(),
    });
    await this.assertResponse(res);

    const data: GetInstallationKeyResponse = await res.json();

    return data;
  }

  /**
   * gets called by the app when the user enters their phone number. the phone number will still need to get verified using `JustInClient.verifyDeviceWithCode`
   *
   * @param phoneNumber looks like `+4917642004388`
   */
  public async registerDevice(
    phoneNumber: string
  ): Promise<RegisterDeviceResponse> {
    const res = await fetch(this.baseUrl + "/api/v2/devices", {
      headers: this.getHeaders(),
      method: "POST",
      body: JSON.stringify({
        OperatingSystemVersion: "18.0.1",
        NetworkOperatorName: "--",
        localeCountry: "de",
        localeLanguage: "en",
        OperatingSystemRootingState: 1,
        appVersion: "2.8.7",
        OperatingSystem: 2,
        Model: "iPhone14,6",
        RegistrationRequestChannelType: 0,
        PhoneNumber: phoneNumber,
        // the registration id appears to be arbitrary and varies between installs. we can probably generate this ourselves.
        RegistrationID:
          "66c06b6ccf842879c12c1b6754e6386eb578bbe7a376dabca733f2ccad95ce5f",
      }),
    });
    await this.assertResponse(res);

    const data: RegisterDeviceResponse = await res.json();

    return data;
  }
  /**
   * @param code looks like `362886`
   */
  public async verifyDeviceWithCode(
    code: string
  ): Promise<VerifyDeviceWithCodeResponse> {
    const res = await fetch(
      this.baseUrl + "/api/v2/devices/" + this.deviceId + "/verifyCode",
      {
        headers: this.getHeaders(),
        method: "POST",
        body: JSON.stringify({ code }),
      }
    );
    await this.assertResponse(res);

    const data: VerifyDeviceWithCodeResponse = await res.json();

    return data;
  }

  /**
   * the JustIn api uses HTTP Basic Authorization
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
   */
  private getAuthorizationHeaderValue() {
    return "Basic " + btoa(this.username + ":" + this.password);
  }
  /**
   * adds the required authorization header
   */
  private getHeaders(additionalHeaders: Record<string, string> = {}) {
    additionalHeaders.Authorization = this.getAuthorizationHeaderValue();

    return additionalHeaders;
  }
  /**
   * hasn't been observed to be called by the app, returns the current version of the api
   */
  public async getApiStatus() {
    const res = await fetch(this.baseUrl + "/status");

    await this.assertResponse(res);

    const data: GetApiStatusResponse = await res.json();

    return data;
  }
  private async assertResponse(res: Response) {
    if (!res.ok) {
      try {
        const data = await res.text();

        console.error("response body:", data);
      } catch (err) {}
      throw new Error("response not ok: " + res.status);
    }
  }

  public async connectToFirebase() {
    const res = await fetch(
      "https://firebaseinstallations.googleapis.com/v1/projects/justin-mobile/installations/",
      {
        method: "POST",
        headers: {
          "X-Goog-Api-Key": "AIzaSyBZO7pasi3EgCg6DlQXDa3rHOZB6FZAp_s",
        },
        body: JSON.stringify({
          appId: "1:981868436233:ios:d5d9d1027a928307",
          fid: "f2DY_TPZY0rFqY9oH5Vwut",
          authVersion: "FIS_v2",
          sdkVersion: "i:8.15.0",
        }),
      }
    );
    const data: {
      name: "projects/981868436233/installations/f5qPcyihAeWWQ_dvnq6LFv";
      fid: "f5qPcyihAeWWQ_dvnq6LFv";
      refreshToken: "3_AS3qfwJbcdU5r5nUsEF28Y79RTK8yZO2Frzv1151DMsZ_y_FJKKa-vAkr6ci93DUhCNk0bfaDwsCbipPhhBCcgj_4yf3cjySwO8rI9nNiDOo4zQ";
      authToken: {
        token: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjE6OTgxODY4NDM2MjMzOmlvczpkNWQ5ZDEwMjdhOTI4MzA3IiwiZXhwIjoxNzMxMzM1NTQxLCJmaWQiOiJmNXFQY3lpaEFlV1dRX2R2bnE2TEZ2IiwicHJvamVjdE51bWJlciI6OTgxODY4NDM2MjMzfQ.AB2LPV8wRAIgGUY-e0Q9DKsLGArS_jeRq1egyeU-aaGWkHI0sdKo2rQCIG38NUDZ6IDXtR94AdAbBbMKwlkwOkJh0s6Cq8gL_cOo";
        expiresIn: "604800s";
      };
    } = await res.json();

    return data;
  }
}
