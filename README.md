# justin-mobile-js

a typescript client for the API of the [JustIN Mobile](https://saltosystems.com/de-de/technologieplattformen/salto-justin-mobile-app) access app by Salto Systems.
this package is not officially associated with Salto Systems.

currently, this package is kind of useless:

- doesn't include the actual door-opening via bluetooth
- requires three values to be sniffed from the traffic generated by actually using JustIN Mobile

last updated Nov 19 2024

## Examples

```typescript
import readline from "readline";

import JustInClient from ".";

// registering a new installation
function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(prompt, (str) => {
      rl.close();
      resolve(str.trim());
    })
  );
}

async function main() {
  const client = new JustInClient(
    "i33Sq9zszmZWR0G8IlY1w4",
    "ecRVY4re5og1Sard4BVshIpEuMLrhooYPZuvCU8v",
    "da7eb1a6113bc0b855c14e99824e078ef1d3c03a"
  );
  console.info("Signing into JustIN Mobile...");

  const phoneNr = await getUserInput("Your phone number: ");

  const registerRes = await client.registerDevice(
    phoneNr.replace(/[^+\d]/g, "")
  );

  const smsVerificationCode = await getUserInput(
    `6-digit verification code sent to ${phoneNr}: `
  );

  const { apiKey, apiSecret } = await client.verifyDeviceWithCode(
    smsVerificationCode
  );
}
main();
```
