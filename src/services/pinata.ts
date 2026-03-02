import fs from "node:fs";
import axios from "axios";
import FormData from "form-data";

const pinataBase = "https://api.pinata.cloud/pinning";

export async function pinFile(pinataJwt: string, filePath: string): Promise<string> {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(`${pinataBase}/pinFileToIPFS`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${pinataJwt}`
    }
  });

  return response.data.IpfsHash;
}

export async function pinJson(pinataJwt: string, body: unknown): Promise<string> {
  const response = await axios.post(
    `${pinataBase}/pinJSONToIPFS`,
    { pinataContent: body },
    { headers: { Authorization: `Bearer ${pinataJwt}` } }
  );

  return response.data.IpfsHash;
}
